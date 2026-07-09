import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

// The serve-time reconcile classifier is shared with reconcile.mjs and apply.mjs (.claude/
// skills/review/reconcile-core.mjs) so the queue you SEE and the decisions that get WRITTEN
// can never drift. nitro bundles server code and rewrites static relative imports, so we load
// it dynamically by absolute file:// URL at request time — rollup leaves that expression alone.
let _core: { classify: Function; norm: (s?: string | null) => string } | null = null
async function reconcileCore() {
  if (!_core) {
    const p = pathToFileURL(join(process.cwd(), '.claude/skills/review/reconcile-core.mjs')).href
    _core = await import(/* @vite-ignore */ p)
  }
  return _core!
}

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
  autoResolved?: 'done' | 'orphan' // hidden by serve-time reconcile, not a hand decision
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
  // Normalized manuscript for serve-time reconcile (curly->straight, whitespace collapsed).
  // The queue drifts ahead of Drive as edits land; reclassifying each card here means a card
  // whose fix is ALREADY on Drive (done) or whose anchor was superseded (orphan) is hidden on
  // every load — no manual reconcile needed. Empty when no cache: then we skip (never hide).
  // Staleness is safe: a stale cache only UNDER-hides (a not-yet-cached fix reads as still-live),
  // never wrongly hides a card whose anchor is genuinely present.
  const { classify, norm: mNorm } = await reconcileCore()
  const M = manuscript ? mNorm(manuscript) : ''
  const flat = manuscript.replace(/\s+/g, ' ')
  const contextFor = (anchor?: string | null): string | null => {
    if (!anchor || !manuscript) return null
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
  // Containment alone is not identity: a sentence-level anchor saved by an OLD (often archived)
  // card is a substring of any NEW paragraph-sized card covering the same text, which would
  // dress the new card in a drifter's decision (house rule: never rescue drifters). A genuine
  // rename-survival match is near-equal in size, so also require comparable lengths.
  const anchorMatch = (a: string, b: string) =>
    !!a && !!b && (a === b ||
      (((a.length >= 40 && b.includes(a)) || (b.length >= 40 && a.includes(b))) &&
        Math.min(a.length, b.length) / Math.max(a.length, b.length) >= 0.8))
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
    // edit cards: the same, around the redline's span, so a fix is judged IN its passage
    else if (f.kind === 'edit' && f.original) f.context = contextFor(f.original)
    // Serve-time reconcile: if this still-open card's fix is already on Drive (done) or its
    // anchor was replaced by a different edit (orphan), resolve it for display so it drops out
    // of the queue. In-memory only — never written; reconcile.mjs/apply.mjs persist the truth.
    if (M && (f.decision === 'pending' || f.decision === 'queued')) {
      const cls = classify(f, { decision: f.decision, note: d?.note ?? null, chosen: d?.chosen ?? null }, M)
      if (cls === 'done') { f.decision = 'applied'; f.autoResolved = 'done' }
      else if (cls === 'orphan') { f.decision = 'dismiss'; f.autoResolved = 'orphan' }
    }
  }

  return { ready: true, ...data }
})
