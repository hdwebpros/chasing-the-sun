#!/usr/bin/env node
// render.mjs — the CLI fallback triage view (the /review page is the primary surface).
// For each finding in .deai/review.json, print the concrete FIX (strikethrough cut →
// result) and the one-line why. The full table is ~90KB, so use --out to write a file
// (a raw terminal dump truncates).
//
//   node .claude/skills/review/render.mjs                                  # all findings
//   node .claude/skills/review/render.mjs --lens vivify                    # one lens
//   node .claude/skills/review/render.mjs --min mid                        # high+mid
//   node .claude/skills/review/render.mjs --exclude ai-fingerprints,voice  # craft only
//   node .claude/skills/review/render.mjs --out .deai/review-ch09.txt      # to a file

import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const root = process.cwd()
const arg = (k) => { const i = process.argv.indexOf(k); return i !== -1 ? process.argv[i + 1] : null }
const lensFilter = arg('--lens')
const excludeFilter = (arg('--exclude') || '').split(',').map(s => s.trim()).filter(Boolean)
const minSev = arg('--min') // high | mid | low
const outPath = arg('--out') // write the report to a file instead of stdout
const sevRank = { high: 0, mid: 1, low: 2 }

const review = JSON.parse(await readFile(join(root, '.deai', 'review.json'), 'utf8'))

// word-level diff → inline redline: deletions [-…-], insertions {+…+}
const tokenize = (s) => (s || '').split(/(\s+)/).filter(x => x !== '')
function redline(a, b) {
  const A = tokenize(a), B = tokenize(b), n = A.length, m = B.length
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--)
    dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
  const segs = []
  const push = (t, v) => { const last = segs[segs.length - 1]; if (last && last.t === t) last.v += v; else segs.push({ t, v }) }
  let i = 0, j = 0
  while (i < n && j < m) {
    if (A[i] === B[j]) { push('eq', A[i]); i++; j++ }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { push('del', A[i]); i++ }
    else { push('ins', B[j]); j++ }
  }
  while (i < n) push('del', A[i++])
  while (j < m) push('ins', B[j++])
  const del = segs.some(s => s.t === 'del'), ins = segs.some(s => s.t === 'ins')
  const text = segs.map(s => s.t === 'del' ? `[-${s.v}-]` : s.t === 'ins' ? `{+${s.v}+}` : s.v).join('')
  return { text, op: del && ins ? 'replace' : del ? 'cut' : ins ? 'add' : 'edit' }
}
const opLabel = { cut: '✂ cut', replace: '↻ replace', add: '＋ add', edit: '✎ edit', revise: '✎ revise' }

let cards = review.findings.slice()
const touches = (c, id) => (c.lensIds || []).includes(id)
if (lensFilter) cards = cards.filter(c => touches(c, lensFilter))
if (excludeFilter.length) cards = cards.filter(c => (c.lensIds || []).some(id => !excludeFilter.includes(id)))
if (minSev) cards = cards.filter(c => (sevRank[c.severity] ?? 9) <= (sevRank[minSev] ?? 9))
cards.sort((a, b) => (sevRank[a.severity] ?? 9) - (sevRank[b.severity] ?? 9) || (a.page ?? 1e9) - (b.page ?? 1e9))

const wrap = (s, w = 96, pad = '    ') =>
  (s || '').replace(new RegExp(`(.{1,${w}})(\\s|$)`, 'g'), pad + '$1\n').trimEnd()

// buffer the report so it can go to a file (--out) — the full table is large and a raw
// terminal dump truncates. Default: stdout, but the web /review page is the richer surface.
const buf = []
const out = (s = '') => buf.push(s)

out(`\n${cards.length} card(s) — ${review.units?.join(', ') || ''}  [${review.totalFindings} findings merged]\n${'='.repeat(72)}`)
for (const c of cards) {
  const opts = c.options || []
  const multi = c.kind === 'edit' && opts.length > 1
  const head = c.kind !== 'edit' ? '✎ revise' : multi ? `${opts.length} options` : opLabel[redline(c.original, opts[0]?.edited || '').op]
  out(`\n[${(c.severity || '?').toUpperCase()}] ${head}${c.page ? '  p' + c.page : ''}  → ${c.route}`)
  out(`  lenses: ${(c.lensIds || []).join(', ')}`)
  if (c.kind === 'edit' && !multi) {
    out('\n  REDLINE  ([-cut-] {+add+}):'); out(wrap(redline(c.original, opts[0]?.edited || '').text))
    for (const r of c.reasons || []) out(`    · ${r.lensId}: ${r.why}`)
  } else if (multi) {
    out('\n  PICK ONE:')
    opts.forEach((o, i) => {
      out(`   (${i + 1}) [${o.lensIds.join(', ')}]`)
      out(wrap(redline(c.original, o.edited).text, 92, '       '))
      for (const r of o.reasons || []) out(`         · ${r.lensId}: ${r.why}`)
    })
  } else {
    out('\n  ACTION:'); out(wrap(c.action || ''))
    if (c.illustration) out(wrap('e.g. ' + c.illustration))
    for (const r of c.reasons || []) out(`    · ${r.lensId}: ${r.why}`)
  }
  out('\n' + '-'.repeat(72))
}

const text = buf.join('\n')
if (outPath) {
  await writeFile(outPath, text + '\n', 'utf8')
  console.log(`wrote ${cards.length} cards → ${outPath}`)
} else {
  console.log(text)
}
