#!/usr/bin/env node
// Apply APPROVED de-AI fixes from .deai/page-*.json to the Google Doc (source of
// truth), then optionally rebuild the epub and commit. Manuscript edits require an
// explicit command — so this is DRY-RUN BY DEFAULT. Nothing touches Drive without
// --apply. See [[manuscript-edits-require-explicit-command]].
//
//   node apply-fixes.mjs 7              # dry-run: show find/replace pairs for page 7
//   node apply-fixes.mjs --all          # dry-run: every page with decisions
//   node apply-fixes.mjs 7 --apply      # write page 7's accepted fixes to Drive
//   node apply-fixes.mjs 7 --apply --commit   # ...then rebuild epub + git commit
//
// accept -> replace span with `fix`;  edit -> replace span with `editText`.
// reject / pending -> skipped.
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { spawnSync } from 'node:child_process'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..', '..', '..')
const deai = join(root, '.deai')
const args = process.argv.slice(2)

// Pre-flight discriminator: only apply a fix whose `span` is still present in the
// freshly-synced manuscript (= still in Drive). A decided fix whose span is GONE was
// already applied in an earlier push — re-sending it zero-matches in Drive and reads as
// a false failure. Skipping it makes apply-fixes idempotent across re-runs. (Run sync.sh
// first so manuscript.txt reflects current Drive.) Compares normalized (curly/whitespace)
// but still sends the verbatim span to Drive.
const normPresence = s => (s || '').replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim()
let manuscriptNorm = null
try { manuscriptNorm = normPresence(readFileSync(join(deai, 'manuscript.txt'), 'utf8')) } catch {}
const APPLY = args.includes('--apply')
const COMMIT = args.includes('--commit')
const ALL = args.includes('--all')
// --brogue applies the Hiberno-English dialogue pass from brogue-page-NN.json; --tic
// applies the stylistic-tic thinning from tic-page-NN.json. Same find/replace +
// idempotency machinery, separate cache. (Default: the de-AI page-NN.json.)
const BROGUE = args.includes('--brogue')
const TIC = args.includes('--tic')
// --openers applies the sentence-opener variety pass from openers-page-NN.json. Like
// tic, decisions apply via editText (a recast opener), idempotency is span-gone only,
// and when a span is not unique in the book the preceding sentence (lead) is prepended
// so replaceAllText can't rewrite the wrong copy.
const OPENERS_PASS = args.includes('--openers')
const PFX = OPENERS_PASS ? 'openers-page-' : TIC ? 'tic-page-' : BROGUE ? 'brogue-page-' : 'page-'
const PFX_RE = OPENERS_PASS ? /^openers-page-\d+\.json$/ : TIC ? /^tic-page-\d+\.json$/ : BROGUE ? /^brogue-page-\d+\.json$/ : /^page-\d+\.json$/
const rangeArg = args.find(a => /^\d+-\d+$/.test(a))   // e.g. 71-100
const pageArg = args.find(a => /^\d+$/.test(a))

function pagesToProcess() {
  if (ALL) return readdirSync(deai).filter(f => PFX_RE.test(f)).map(f => join(deai, f))
  if (rangeArg) {
    const [lo, hi] = rangeArg.split('-').map(Number)
    const out = []
    for (let n = lo; n <= hi; n++) out.push(join(deai, `${PFX}${String(n).padStart(2, '0')}.json`))
    return out
  }
  if (pageArg) return [join(deai, `${PFX}${String(pageArg).padStart(2, '0')}.json`)]
  console.error('Specify a page number, a range (NN-MM), or --all.'); process.exit(2)
}

// Chicago typography: straight quotes -> curly, runs of spaces -> one. Applied to
// the REPLACEMENT text so fixes never inject a straight quote / double space into
// the Doc. (find/span is left verbatim so it still matches the Doc; if the Doc
// itself holds straight quotes, run book-edit/bin/chicago-normalize.mjs first.)
const QUOTE_OPENERS = /[\s([{—–\-“‘]/
const curlify = (s) => (s ?? '')
  .replace(/"/g, (m, off, str) => (off === 0 || QUOTE_OPENERS.test(str[off - 1])) ? '“' : '”')
  .replace(/'/g, (m, off, str) => (off === 0 || QUOTE_OPENERS.test(str[off - 1])) ? '‘' : '’')
// Strip stray leading/trailing newlines from the replacement (a review-UI artifact):
// an embedded \n in replaceAllText injects a paragraph break, which mid-paragraph
// fixes never want. Leading/trailing SPACES are preserved (often intentional, e.g.
// a span that begins with " " to keep word spacing).
// Also repair a missing space after sentence-ending punctuation (a hand-edit artifact:
// "wide.Deep" -> "wide. Deep"). Conservative: only when a LOWERCASE letter precedes the
// period and an UPPERCASE letter or opening curly quote follows — so abbreviations
// (U.S., a.m., e.g.) and decimals are never touched.
const spaceAfterPeriod = (s) => s.replace(/([a-z])([.!?])(?=[A-Z“‘])/g, '$1$2 ')
const normalize = (s) => spaceAfterPeriod(curlify(s)).replace(/[ \t]{2,}/g, ' ').replace(/^\n+|\n+$/g, '')

const pairs = []
let alreadyApplied = 0
for (const file of pagesToProcess()) {
  let doc
  try { doc = JSON.parse(readFileSync(file, 'utf8')) } catch { console.error(`skip ${file}: unreadable`); continue }
  for (const f of doc.flags || []) {
    const d = f.decision
    if (d !== 'accept' && d !== 'edit') continue
    let replace = normalize(d === 'edit' ? (f.editText ?? '') : f.fix)
    // tic free-edit (editFull) reshapes the whole unit, landing included, so the find
    // target is span + the trailing landing — not span alone. Everything else (de-AI,
    // brogue, tic cut/vary/merge) targets span. (after is set only on tic flags.)
    let find = (TIC && f.editFull && f.after) ? `${f.span} ${f.after}` : f.span
    // openers: when the span is not unique in the book, prepend the preceding sentence
    // (lead) to both find and replace so the rewrite lands on the right copy only.
    if (OPENERS_PASS && f.unique === false && f.lead) {
      find = `${f.lead} ${f.span}`
      replace = `${normalize(f.lead)} ${replace}`
    }
    if (replace === find) continue
    // Skip fixes already in Drive (idempotent re-runs). Two signals:
    //  (a) the full REPLACEMENT is already present — covers ADDITIVE fixes, whose
    //      replacement starts with the span, so the span stays present even after
    //      applying; re-sending would DOUBLE the addition. Check this first.
    //  (b) the span is GONE — a plain substitution already happened.
    // TIC fixes (cut/merge/vary) replace the whole unit with a REWRITE that is often a
    // substring of the original (a cut = the prior sentence alone), so signal (a) would
    // false-positive and skip a legitimate change. For tic, idempotency is span-gone only.
    const spanGone = manuscriptNorm !== null && !manuscriptNorm.includes(normPresence(find))
    const dupAdditive = !TIC && !OPENERS_PASS && manuscriptNorm !== null && manuscriptNorm.includes(normPresence(replace))
    if (spanGone || dupAdditive) {
      alreadyApplied++; continue
    }
    pairs.push({ find, replace, page: doc.page, tell: f.tell, decision: d })
  }
}
if (alreadyApplied) console.log(`(${alreadyApplied} decided fix(es) skipped — span already gone from Drive, applied in a prior push)\n`)

if (!pairs.length) { console.log('No approved fixes to apply.'); process.exit(0) }

console.log(`${pairs.length} approved fix(es)${APPLY ? '' : '  [DRY RUN — pass --apply to write Drive]'}:`)
for (const p of pairs) console.log(`  p${p.page} ${p.tell} (${p.decision})\n    - ${JSON.stringify(p.find)}\n    + ${JSON.stringify(p.replace)}`)

if (!APPLY) process.exit(0)

// Pipe to the existing Drive editor (single batchUpdate of replaceAllText).
const editDoc = join(root, '.claude/skills/book-edit/bin/edit-doc.mjs')
const res = spawnSync('node', [editDoc], {
  input: JSON.stringify(pairs.map(({ find, replace }) => ({ find, replace }))),
  encoding: 'utf8', cwd: root,
})
process.stdout.write(res.stdout || '')
process.stderr.write(res.stderr || '')
if (res.status !== 0) { console.error('Drive edit reported a problem (see above).'); process.exit(res.status || 1) }
console.log('Drive updated.')

if (COMMIT) {
  console.log('Rebuilding epub from Drive…')
  const build = spawnSync('node', ['scripts/build-epub-from-drive.mjs', '--promote'], { cwd: root, stdio: 'inherit' })
  if (build.status !== 0) { console.error('epub rebuild failed; not committing.'); process.exit(1) }
  spawnSync('git', ['add', 'public/chasing-the-sun-draft.epub'], { cwd: root, stdio: 'inherit' })
  const tag = OPENERS_PASS ? 'openers' : TIC ? 'tic' : BROGUE ? 'brogue' : 'deai'
  const msg = `${tag}: apply ${pairs.length} approved fix(es)${pageArg ? ` (page ${pageArg})` : ''}\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
  spawnSync('git', ['commit', '-m', msg], { cwd: root, stdio: 'inherit' })
}
