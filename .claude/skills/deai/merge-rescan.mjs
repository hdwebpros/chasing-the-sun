#!/usr/bin/env node
// Merge a fresh re-scan into an existing page doc WITHOUT losing the author's
// accept/reject/edit decisions.
//   existing  .deai/page-NN.json  — authoritative for metadata + any DECIDED flags
//   fresh     .deai/rescan-NN.json — flags from the improved skill (all pending)
// Result written back to page-NN.json:
//   - DECIDED flags (accept/reject/edit) preserved verbatim, decision + editText intact
//   - undecided existing flags dropped (superseded by the fresh scan)
//   - fresh flags added as pending, EXCEPT any whose span overlaps a preserved decided
//     flag (the author already ruled on that text)
//
//   node merge-rescan.mjs 21
//   node merge-rescan.mjs --brogue 21   # merge the brogue dialogue pass instead
//     (brogue-rescan-NN.json → brogue-page-NN.json). Re-detection of a decided
//     brogue page MUST go through this, never a direct overwrite — same hard rule
//     as de-AI: a direct Write destroys the author's accept/reject/edit decisions.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const deai = join(here, '..', '..', '..', '.deai')
const args = process.argv.slice(2)
const BROGUE = args.includes('--brogue')
const TIC = args.includes('--tic')
const PFX = TIC ? 'tic-page-' : BROGUE ? 'brogue-page-' : 'page-'
const RPFX = TIC ? 'tic-rescan-' : BROGUE ? 'brogue-rescan-' : 'rescan-'
const RTAG = TIC ? 't' : BROGUE ? 'b' : 'r'   // fresh-flag id suffix: p21-t3 / p21-b3 / p21-r3
const N = args.find(a => /^\d+$/.test(a))
if (!N) { console.error('usage: merge-rescan.mjs [--brogue] <pageNumber>'); process.exit(1) }
const pad = String(N).padStart(2, '0')
const pagePath = join(deai, `${PFX}${pad}.json`)
const rescanPath = join(deai, `${RPFX}${pad}.json`)

if (!existsSync(pagePath)) { console.error(`page ${N}: no ${PFX}${pad}.json`); process.exit(1) }
if (!existsSync(rescanPath)) { console.error(`page ${N}: no ${RPFX}${pad}.json (subagent didn't write) — left as-is`); process.exit(0) }

const page = JSON.parse(readFileSync(pagePath, 'utf8'))
const rescan = JSON.parse(readFileSync(rescanPath, 'utf8'))
const existing = page.flags || []

const norm = s => (s || '').replace(/\s+/g, ' ').trim().toLowerCase()
const overlaps = (a, b) => !!a && !!b && (a === b || a.includes(b) || b.includes(a))

const decided = existing.filter(f => f.decision && f.decision !== 'pending')
const undecidedDropped = existing.length - decided.length
const decidedSpans = decided.map(f => norm(f.span))

const fresh = (rescan.flags || []).filter(f => !decidedSpans.some(d => overlaps(d, norm(f.span))))
// Assign fresh ids that can't collide with a preserved decided flag's id. Brogue
// original + rescan flags both use the 'b' tag, so naive p{N}-b1 numbering would
// clash with a kept p{N}-b1; skip any id already taken.
const taken = new Set(decided.map(f => f.id))
let k = 1
for (const f of fresh) {
  let id
  do { id = `p${N}-${RTAG}${k++}` } while (taken.has(id))
  taken.add(id)
  f.id = id
  f.decision = 'pending'
}

page.flags = [...decided, ...fresh]
// refresh detect snapshot from the rescan if present
if (rescan.pageDetect) page.pageDetect = rescan.pageDetect
writeFileSync(pagePath, JSON.stringify(page, null, 2) + '\n')
console.log(`page ${String(N).padStart(2)}: kept ${decided.length} decided · dropped ${undecidedDropped} undecided · +${fresh.length} fresh pending`)
