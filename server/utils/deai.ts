import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

// Shared de-AI helpers for the review endpoints. Mirrors .claude/skills/deai/pages.sh
// so the UI and the detect subagent agree on page boundaries (paragraph-snapped,
// ~400 words). .deai/ is the local cache; Drive remains source of truth.

export const PAGE_SIZE = 400
export const deaiDir = () => join(process.cwd(), '.deai')
export const manuscriptPath = () => join(deaiDir(), 'manuscript.txt')

// Review mode. 'deai' = AI-tell removal (page-NN.json). 'brogue' = Hiberno-English
// dialogue pass (brogue-page-NN.json). 'tic' = stylistic-tic thinning
// (tic-page-NN.json). Each is a SEPARATE cache so a decision in one pass can never
// overwrite a decided page in another.
export type Mode = 'deai' | 'brogue' | 'tic'
const MODE_PFX: Record<Mode, string> = { deai: '', brogue: 'brogue-', tic: 'tic-' }
export const asMode = (m: unknown): Mode => (m === 'brogue' || m === 'tic' ? m : 'deai')
export const pageJsonPath = (n: number, mode: Mode = 'deai') =>
  join(deaiDir(), `${MODE_PFX[mode]}page-${String(n).padStart(2, '0')}.json`)

export interface Flag {
  id: string
  tell: string
  span: string
  context?: string
  voice: number
  detect: number
  why?: string
  fix: string
  decision?: 'pending' | 'accept' | 'reject' | 'edit'
  editText?: string
  // tic free-edit only: when true, editText replaces the WHOLE unit (span + the trailing
  // landing `after`), so apply-fixes finds `span + ' ' + after` instead of span alone.
  // Lets a custom edit reshape the locked landing; cut/vary/merge leave it false.
  editFull?: boolean
  // tic pass extras (ignored by deai/brogue): grammar-safe rewrite candidates, the
  // dialogue tag (defaults to keep), ±4-page cluster density, the concrete LANDING
  // sentence (display context), and the voice-aware class set by judge.mjs.
  alts?: { cut?: string | null; merge?: string | null; vary?: string | null }
  inDialogue?: boolean
  cluster?: number
  after?: string
  voiceClass?: 'concrete' | 'abstract' | null
}
export interface PageDoc {
  page: number
  chapter?: string
  words?: number
  pageDetect?: { detect: number; burstiness?: number; aiPhraseHits?: number }
  flags: Flag[]
}

// Split manuscript into paragraph-snapped pages; return {total, text} for page n.
export async function getPage(n: number): Promise<{ total: number; text: string }> {
  const raw = await readFile(manuscriptPath(), 'utf8')
  const lines = raw.split('\n')
  const pages: string[] = []
  let buf: string[] = []
  let words = 0
  for (const line of lines) {
    if (line.trim() === '' && buf.length === 0) continue
    buf.push(line)
    words += line.split(/\s+/).filter(Boolean).length
    if (words >= PAGE_SIZE) {
      pages.push(buf.join('\n'))
      buf = []
      words = 0
    }
  }
  if (buf.join('').trim()) pages.push(buf.join('\n'))
  return { total: pages.length, text: pages[n - 1] ?? '' }
}

export async function readPageDoc(n: number, mode: Mode = 'deai'): Promise<PageDoc | null> {
  try {
    return JSON.parse(await readFile(pageJsonPath(n, mode), 'utf8'))
  } catch {
    return null
  }
}
