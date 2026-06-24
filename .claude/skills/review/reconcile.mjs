// reconcile.mjs — sync the /review queue to the live Drive manuscript.
//
// The Doc moves ahead of review.json as edits land (by apply.mjs, by hand, or by a
// sibling pass). That strands cards: their fix is already on Drive, or their anchor
// was replaced by a *different* edit so they can never apply. This reclassifies every
// PENDING/QUEUED card against the freshly-synced manuscript and resolves the moot ones,
// leaving genuinely-actionable cards alone. Mirrors apply.mjs's idempotency test, with
// one guard: an unapplied CUT's kept text is a substring of its original, so a card is
// only "done" when text NOT already in the original is present on Drive.
//
//   1. sync first:  bash .claude/skills/deai/sync.sh
//   2. dry run:     node .claude/skills/review/reconcile.mjs
//   3. apply:       node .claude/skills/review/reconcile.mjs --apply
//
// done   -> 'applied'  (fix verbatim on Drive)
// orphan -> 'dismiss'  (anchor gone, superseded by another edit — can never apply)
// live   ->  untouched (anchor present, fix not yet there)
// Reversible: reopen any card in /review. Never touches author 'dismiss' decisions, and
// only REPORTS 'applied' cards that aren't actually on Drive (possible false stamps).
import { readFileSync, writeFileSync } from 'node:fs'

const APPLY = process.argv.includes('--apply')
const review = JSON.parse(readFileSync('.deai/review.json', 'utf8'))
const dpath = '.deai/review-decisions.json'
const dec = JSON.parse(readFileSync(dpath, 'utf8'))
const norm = s => (s || '').replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim()
const M = norm(readFileSync('.deai/manuscript.txt', 'utf8'))
const USE = /^use(\s*this)?\s*:/i

// a queued/pending card's possible replacement texts: note 'use:' wins, then chosen, then every option
function candidates(c, d) {
  const out = []
  const note = d.note && d.note.trim() ? d.note.trim() : ''
  if (USE.test(note)) out.push(note.replace(USE, '').trim())
  if (d.chosen != null && d.chosen !== '') out.push(d.chosen)
  for (const o of (c.options || [])) if (o.edited) out.push(o.edited)
  return out.map(norm).filter(Boolean)
}

const buckets = { done: [], orphan: [], live: [], falseApplied: [] }
for (const c of review.findings) {
  const d = dec[c.id] || { decision: 'pending' }
  const state = d.decision || 'pending'
  const fN = norm(c.original)
  const present = c.original ? M.includes(fN) : false
  const cands = candidates(c, d).filter(x => x !== fN)
  const meaningfulPresent = cands.some(x => !fN.includes(x) && M.includes(x)) // new text on Drive (not an unapplied cut)
  const anyPresent = cands.some(x => M.includes(x))
  if (state === 'applied') { if (c.original && !present && !meaningfulPresent) buckets.falseApplied.push(c); continue }
  if (!['pending', 'queued'].includes(state)) continue // leave author 'dismiss' alone
  if (present) (meaningfulPresent ? buckets.done : buckets.live).push(c)
  else (anyPresent ? buckets.done : buckets.orphan).push(c)
}

const line = c => `   p${c.page} ${c.severity} [${c.id}] ${c.lensIds.join(',')}`
console.log(`=== reconcile (${APPLY ? 'APPLY' : 'DRY RUN'}) vs current Drive ===`)
console.log(`\nDONE   (fix live on Drive -> applied): ${buckets.done.length}`)
buckets.done.forEach(c => console.log(line(c)))
console.log(`\nORPHAN (anchor gone, superseded -> dismiss): ${buckets.orphan.length}`)
buckets.orphan.forEach(c => console.log(line(c)))
console.log(`\nLIVE   (still actionable, untouched): ${buckets.live.length}`)
console.log(`\n⚠ FALSE-APPLIED (stamped applied but not on Drive — report only): ${buckets.falseApplied.length}`)
buckets.falseApplied.forEach(c => console.log(line(c)))

if (APPLY) {
  for (const c of buckets.done) dec[c.id] = { ...(dec[c.id] || {}), decision: 'applied' }
  for (const c of buckets.orphan) dec[c.id] = { ...(dec[c.id] || {}), decision: 'dismiss' }
  writeFileSync(dpath, JSON.stringify(dec, null, 2))
  console.log(`\nwrote ${dpath}: ${buckets.done.length} -> applied, ${buckets.orphan.length} -> dismiss`)
} else {
  console.log('\n[DRY RUN] pass --apply to write decisions.')
}
