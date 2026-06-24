// reconcile.mjs — sync the /review queue to the live Drive manuscript.
//
// The Doc moves ahead of review.json as edits land (by apply.mjs, by hand, or by a
// sibling pass). That strands cards: their fix is already on Drive, or their anchor
// was replaced by a *different* edit so they can never apply. This reclassifies every
// PENDING/QUEUED card against the freshly-synced manuscript and resolves the moot ones,
// leaving genuinely-actionable cards alone.
//
// This is now MOSTLY a backstop: the /review page auto-hides resolved cards at serve time
// and apply.mjs stamps fix-already-on-Drive cards itself, both via reconcile-core.mjs — so
// dupes shouldn't pile up in the first place. Run this to PERSIST the cleanup into
// review-decisions.json (e.g. before a big triage session, or to dismiss dead orphans).
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
import { classify, norm } from './reconcile-core.mjs'

const APPLY = process.argv.includes('--apply')
const review = JSON.parse(readFileSync('.deai/review.json', 'utf8'))
const dpath = '.deai/review-decisions.json'
const dec = JSON.parse(readFileSync(dpath, 'utf8'))
const M = norm(readFileSync('.deai/manuscript.txt', 'utf8'))

const buckets = { done: [], orphan: [], live: [], falseApplied: [] }
for (const c of review.findings) {
  const cls = classify(c, dec[c.id], M)
  if (cls in buckets) buckets[cls].push(c)
}

const line = (c) => `   p${c.page} ${c.severity} [${c.id}] ${c.lensIds.join(',')}`
console.log(`=== reconcile (${APPLY ? 'APPLY' : 'DRY RUN'}) vs current Drive ===`)
console.log(`\nDONE   (fix live on Drive -> applied): ${buckets.done.length}`)
buckets.done.forEach((c) => console.log(line(c)))
console.log(`\nORPHAN (anchor gone, superseded -> dismiss): ${buckets.orphan.length}`)
buckets.orphan.forEach((c) => console.log(line(c)))
console.log(`\nLIVE   (still actionable, untouched): ${buckets.live.length}`)
console.log(`\n⚠ FALSE-APPLIED (stamped applied but not on Drive — report only): ${buckets.falseApplied.length}`)
buckets.falseApplied.forEach((c) => console.log(line(c)))

if (APPLY) {
  for (const c of buckets.done) dec[c.id] = { ...(dec[c.id] || {}), decision: 'applied' }
  for (const c of buckets.orphan) dec[c.id] = { ...(dec[c.id] || {}), decision: 'dismiss' }
  writeFileSync(dpath, JSON.stringify(dec, null, 2))
  console.log(`\nwrote ${dpath}: ${buckets.done.length} -> applied, ${buckets.orphan.length} -> dismiss`)
} else {
  console.log('\n[DRY RUN] pass --apply to write decisions.')
}
