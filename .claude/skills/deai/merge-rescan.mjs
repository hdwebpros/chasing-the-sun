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
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const deai = join(here, '..', '..', '..', '.deai')
const N = process.argv[2]
if (!N) { console.error('usage: merge-rescan.mjs <pageNumber>'); process.exit(1) }
const pad = String(N).padStart(2, '0')
const pagePath = join(deai, `page-${pad}.json`)
const rescanPath = join(deai, `rescan-${pad}.json`)

if (!existsSync(pagePath)) { console.error(`page ${N}: no page-${pad}.json`); process.exit(1) }
if (!existsSync(rescanPath)) { console.error(`page ${N}: no rescan-${pad}.json (subagent didn't write) — left as-is`); process.exit(0) }

const page = JSON.parse(readFileSync(pagePath, 'utf8'))
const rescan = JSON.parse(readFileSync(rescanPath, 'utf8'))
const existing = page.flags || []

const norm = s => (s || '').replace(/\s+/g, ' ').trim().toLowerCase()
const overlaps = (a, b) => !!a && !!b && (a === b || a.includes(b) || b.includes(a))

const decided = existing.filter(f => f.decision && f.decision !== 'pending')
const undecidedDropped = existing.length - decided.length
const decidedSpans = decided.map(f => norm(f.span))

const fresh = (rescan.flags || []).filter(f => !decidedSpans.some(d => overlaps(d, norm(f.span))))
let k = 1
for (const f of fresh) { f.id = `p${N}-r${k++}`; f.decision = 'pending' }

page.flags = [...decided, ...fresh]
// refresh detect snapshot from the rescan if present
if (rescan.pageDetect) page.pageDetect = rescan.pageDetect
writeFileSync(pagePath, JSON.stringify(page, null, 2) + '\n')
console.log(`page ${String(N).padStart(2)}: kept ${decided.length} decided · dropped ${undecidedDropped} undecided · +${fresh.length} fresh pending`)
