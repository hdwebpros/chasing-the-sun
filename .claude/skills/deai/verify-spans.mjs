#!/usr/bin/env node
// Guard: every flag `span` MUST be a verbatim substring of its page, or the review
// UI silently fails to highlight it (and an apply-fixes find/replace would zero-match).
// Subagents occasionally paraphrase a span or — worse — hallucinate a repetition that
// isn't in the prose. Run this after every detection batch to catch those at the source
// instead of finding them later in the UI.
//
//   node verify-spans.mjs 101-140     # check a range
//   node verify-spans.mjs 135         # check one page
//   node verify-spans.mjs --all       # every page-NN.json with flags
//
// Classifies each non-matching span:
//   NEAR-MISS  — matches after curly→straight + whitespace-collapse (quotes/spacing only).
//                Usually safe; the UI matches verbatim so it still won't highlight — repair the span.
//   NOT-FOUND  — not in the page even normalized: a paraphrase or hallucination. Drop or rewrite the flag.
// DECIDED accept/edit flags whose fix was already applied to Drive are EXPECTED to be gone
// after a re-sync — they're reported separately, not as errors.
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { execFileSync } from 'node:child_process'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..', '..', '..')
const deai = join(root, '.deai')
const manuscript = join(deai, 'manuscript.txt')
const pages = join(here, 'pages.sh')
const args = process.argv.slice(2)
const ALL = args.includes('--all')
const rangeArg = args.find(a => /^\d+-\d+$/.test(a))
const pageArg = args.find(a => /^\d+$/.test(a))

function pageNums() {
  if (ALL) return readdirSync(deai).filter(f => /^page-\d+\.json$/.test(f)).map(f => +f.match(/\d+/)[0]).sort((a, b) => a - b)
  if (rangeArg) { const [lo, hi] = rangeArg.split('-').map(Number); return Array.from({ length: hi - lo + 1 }, (_, i) => lo + i) }
  if (pageArg) return [+pageArg]
  console.error('Specify a page number, a range (NN-MM), or --all.'); process.exit(2)
}

const norm = s => (s || '').replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim()
const pageText = n => execFileSync('bash', [pages, manuscript, String(n)], { encoding: 'utf8' })

let ok = 0
const nearMiss = [], notFound = [], appliedGone = []
for (const n of pageNums()) {
  let doc, txt
  try { doc = JSON.parse(readFileSync(join(deai, `page-${String(n).padStart(2, '0')}.json`), 'utf8')) } catch { continue }
  txt = pageText(n); const nt = norm(txt)
  for (const f of doc.flags || []) {
    if (txt.includes(f.span)) { ok++; continue }
    const decided = f.decision && f.decision !== 'pending'
    const applied = decided && (f.decision === 'accept' || f.decision === 'edit')
    const e = { page: n, id: f.id, tell: f.tell, decision: f.decision || 'pending', span: f.span }
    if (applied) appliedGone.push(e)            // expected: fix already in Drive, span replaced
    else if (nt.includes(norm(f.span))) nearMiss.push(e)
    else notFound.push(e)
  }
}

const show = e => `  p${e.page} ${e.id} [${e.tell}/${e.decision}] ${JSON.stringify(e.span.slice(0, 70))}`
console.log(`verbatim OK: ${ok}`)
if (appliedGone.length) console.log(`\nalready-applied (expected gone after re-sync): ${appliedGone.length}`)
if (nearMiss.length) { console.log(`\n⚠ NEAR-MISS — quotes/whitespace only, repair span to verbatim: ${nearMiss.length}`); nearMiss.forEach(e => console.log(show(e))) }
if (notFound.length) { console.log(`\n✖ NOT-FOUND — paraphrase or hallucination, drop or rewrite the flag: ${notFound.length}`); notFound.forEach(e => console.log(show(e))) }

// Non-zero exit if any UNDECIDED flag won't highlight — that's the actionable failure.
const broken = [...nearMiss, ...notFound].filter(e => e.decision === 'pending')
if (broken.length) { console.log(`\n${broken.length} PENDING flag(s) will not highlight in the UI — fix before review.`); process.exit(1) }
console.log('\nAll pending flags highlight correctly.')
