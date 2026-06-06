import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

// Shared de-AI helpers for the review endpoints. Mirrors .claude/skills/deai/pages.sh
// so the UI and the detect subagent agree on page boundaries (paragraph-snapped,
// ~400 words). .deai/ is the local cache; Drive remains source of truth.

export const PAGE_SIZE = 400
export const deaiDir = () => join(process.cwd(), '.deai')
export const manuscriptPath = () => join(deaiDir(), 'manuscript.txt')
export const pageJsonPath = (n: number) =>
  join(deaiDir(), `page-${String(n).padStart(2, '0')}.json`)

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

export async function readPageDoc(n: number): Promise<PageDoc | null> {
  try {
    return JSON.parse(await readFile(pageJsonPath(n), 'utf8'))
  } catch {
    return null
  }
}
