import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

// Serve the collated craft-review dataset (.deai/review.json, produced by the review
// engine's collate.mjs from the per-lens scanner files). Overlays saved triage
// decisions from .deai/review-decisions.json (keyed by finding id). Returns
// { ready:false } until a scan + collate have run. Diagnostic only — never writes Drive.
// `findings` are merged CARDS (collate.mjs deduped by target). For structural (action)
// cards, which carry no redline, we locate their anchor in the manuscript and attach the
// surrounding sentences as `context` so the page can show where the note lands.
type Card = {
  id: string; kind: 'edit' | 'action'; page?: number | null; chapter?: string | null
  lensIds: string[]; severity: string; route: string; reasons: unknown[]
  original?: string; options?: { edited: string }[] | null
  action?: string; actions?: string[] | null; illustration?: string | null
  anchor?: string | null; context?: string | null
  decision?: string; reviewNote?: string; chosen?: string | null
}

export default defineEventHandler(async () => {
  const dir = join(process.cwd(), '.deai')
  let data: any
  try {
    data = JSON.parse(await readFile(join(dir, 'review.json'), 'utf8'))
  } catch {
    return { ready: false }
  }

  let decisions: Record<string, { decision?: string; note?: string; chosen?: string | null; anchor?: string | null }> = {}
  try {
    decisions = JSON.parse(await readFile(join(dir, 'review-decisions.json'), 'utf8'))
  } catch { /* none yet */ }

  // Structural (action) cards have no original/edited redline, so the page would show a
  // bare instruction with no manuscript context. Locate each such card's `anchor` in the
  // manuscript and attach the surrounding sentences as `context` so the author sees WHERE
  // the note lands without leaving the page.
  let manuscript = ''
  try { manuscript = await readFile(join(dir, 'manuscript.txt'), 'utf8') } catch { /* no cache */ }
  const contextFor = (anchor?: string | null): string | null => {
    if (!anchor || !manuscript) return null
    const flat = manuscript.replace(/\s+/g, ' ')
    const needle = anchor.replace(/\s+/g, ' ').trim()
    let i = flat.indexOf(needle)
    if (i === -1) i = flat.indexOf(needle.slice(0, 30)) // tolerate minor drift
    if (i === -1) return null
    // expand to one sentence before and after the anchor span
    const start = flat.lastIndexOf('. ', i - 2)
    const endDot = flat.indexOf('. ', i + needle.length)
    const from = start === -1 ? Math.max(0, i - 200) : start + 2
    const to = endDot === -1 ? Math.min(flat.length, i + needle.length + 200) : endDot + 1
    return flat.slice(from, to).trim()
  }

  // Card ids are a hash of the merged span text, so a re-scan that shifts a span
  // RENAMES the card and would orphan a decision keyed to the old id. To survive that,
  // each saved decision also carries an `anchor` (the card's manuscript `original` at
  // save time). Overlay by id first, then re-attach any still-unused decision whose
  // anchor (or chosen option) matches this card's text. A decision binds to at most one
  // card; a card takes at most one decision (id match wins over anchor match).
  const norm = (s?: string | null) => (s || '').replace(/\s+/g, ' ').trim()
  const anchorMatch = (a: string, b: string) =>
    !!a && !!b && (a === b || (a.length >= 40 && b.includes(a)) || (b.length >= 40 && a.includes(b)))
  const used = new Set<string>()

  for (const f of (data.findings || []) as Card[]) {
    let d = decisions[f.id]
    if (d) used.add(f.id)
    if (!d) {
      const target = norm(f.original)
      for (const [k, v] of Object.entries(decisions)) {
        if (used.has(k)) continue
        if (anchorMatch(norm(v.anchor), target)) { d = v; used.add(k); break }
        // fallback: a saved option choice that still matches one of this card's options
        if (v.chosen != null && (f.options || []).some(o => o.edited === v.chosen)) { d = v; used.add(k); break }
      }
    }
    f.decision = d?.decision ?? 'pending'
    if (d?.note != null) f.reviewNote = d.note
    // only honor a saved option choice if it still matches one of this card's options
    if (d?.chosen != null && (f.options || []).some(o => o.edited === d.chosen)) f.chosen = d.chosen
    // structural cards: surface the manuscript passage their anchor points at
    if (f.kind === 'action' && !f.original) f.context = contextFor(f.anchor)
  }

  return { ready: true, ...data }
})
