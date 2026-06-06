#!/usr/bin/env node
// Whole-book triage: score every page with the deterministic Detect battery and
// rank worst-first, so detect-subagent effort goes where AI-likelihood is highest.
// Cheap (no model, no subagent). Prints a table; --top N limits rows.
//   node sweep.mjs            # all pages, sorted by detect desc
//   node sweep.mjs --top 20
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { analyze } from './stats.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const ms = join(here, '..', '..', '..', '.deai', 'manuscript.txt')
const SIZE = 400
const topArg = process.argv.indexOf('--top')
const top = topArg !== -1 ? Number(process.argv[topArg + 1]) : Infinity

// Same paragraph-snapped pagination as pages.sh / server/utils/deai.ts
const lines = readFileSync(ms, 'utf8').split('\n')
const pages = []
let buf = [], words = 0
for (const line of lines) {
  if (line.trim() === '' && buf.length === 0) continue
  buf.push(line); words += line.split(/\s+/).filter(Boolean).length
  if (words >= SIZE) { pages.push(buf.join('\n')); buf = []; words = 0 }
}
if (buf.join('').trim()) pages.push(buf.join('\n'))

const scored = pages.map((text, i) => {
  const a = analyze(text)
  const topSig = Object.entries(a.contributions).filter(([, v]) => v > 0)
    .sort((x, y) => y[1] - x[1]).slice(0, 2).map(([k]) => k).join(',')
  return { page: i + 1, detect: a.detect, burst: a.burstiness, ai: a.aiPhraseHits.reduce((s, h) => s + h.c, 0), why: topSig || '—' }
})
scored.sort((a, b) => b.detect - a.detect)

console.log('page   detect  burst  ai-hits  drivers')
console.log('────   ──────  ─────  ───────  ───────')
for (const s of scored.slice(0, top)) {
  console.log(`${String(s.page).padStart(4)}   ${String(s.detect).padStart(6)}  ${String(s.burst).padStart(5)}  ${String(s.ai).padStart(7)}  ${s.why}`)
}
const nonzero = scored.filter(s => s.detect > 0).length
console.log(`\n${nonzero}/${pages.length} pages score >0 on the deterministic axis. (Detect is a proxy — the subagent + your Voice judgment are the real call.)`)
