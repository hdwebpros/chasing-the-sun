#!/usr/bin/env node
// Whole-manuscript altitude. Reads every .deai/page-*.json and tallies flags by
// tell against the taxonomy's BOOK budgets, so the author fixes what's actually
// excessive across the book — not every local instance. Pair with per-page detect.
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const deai = join(here, '..', '..', '..', '.deai')
const taxonomy = JSON.parse(readFileSync(join(here, 'taxonomy.json'), 'utf8'))
const budget = Object.fromEntries(taxonomy.tells.map(t => [t.id, t.book]))
const label = Object.fromEntries(taxonomy.tells.map(t => [t.id, t.label]))

const files = readdirSync(deai).filter(f => /^page-\d+\.json$/.test(f))
const byTell = {}
let pages = 0, flags = 0, detectSum = 0, detectPages = 0
for (const f of files) {
  const doc = JSON.parse(readFileSync(join(deai, f), 'utf8'))
  pages++
  if (doc.pageDetect?.detect != null) { detectSum += doc.pageDetect.detect; detectPages++ }
  for (const fl of doc.flags || []) {
    flags++
    byTell[fl.tell] = byTell[fl.tell] || { n: 0, accept: 0, reject: 0, edit: 0 }
    byTell[fl.tell].n++
    if (fl.decision && fl.decision !== 'pending') byTell[fl.tell][fl.decision]++
  }
}

console.log(`detected ${pages} pages · ${flags} flags · mean page-detect ${detectPages ? (detectSum / detectPages).toFixed(1) : '—'}/10\n`)
console.log('tell             flagged  book-budget  status     a/r/e')
console.log('───────────────  ───────  ───────────  ─────────  ─────')
const rows = Object.entries(byTell).sort((a, b) => (b[1].n / budget[b[0]]) - (a[1].n / budget[a[0]]))
for (const [id, c] of rows) {
  const b = budget[id] ?? '?'
  const over = typeof b === 'number' && c.n > b
  const status = over ? `OVER +${c.n - b}` : 'ok'
  console.log(
    `${(label[id] || id).padEnd(15)}  ${String(c.n).padStart(7)}  ${String(b).padStart(11)}  ${status.padEnd(9)}  ${c.accept}/${c.reject}/${c.edit}`,
  )
}
if (!rows.length) console.log('(no flags yet — run detection on more pages)')
