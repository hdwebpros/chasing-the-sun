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
const APPLY = args.includes('--apply')
const COMMIT = args.includes('--commit')
const ALL = args.includes('--all')
const rangeArg = args.find(a => /^\d+-\d+$/.test(a))   // e.g. 71-100
const pageArg = args.find(a => /^\d+$/.test(a))

function pagesToProcess() {
  if (ALL) return readdirSync(deai).filter(f => /^page-\d+\.json$/.test(f)).map(f => join(deai, f))
  if (rangeArg) {
    const [lo, hi] = rangeArg.split('-').map(Number)
    const out = []
    for (let n = lo; n <= hi; n++) out.push(join(deai, `page-${String(n).padStart(2, '0')}.json`))
    return out
  }
  if (pageArg) return [join(deai, `page-${String(pageArg).padStart(2, '0')}.json`)]
  console.error('Specify a page number, a range (NN-MM), or --all.'); process.exit(2)
}

// Chicago typography: straight quotes -> curly, runs of spaces -> one. Applied to
// the REPLACEMENT text so fixes never inject a straight quote / double space into
// the Doc. (find/span is left verbatim so it still matches the Doc; if the Doc
// itself holds straight quotes, run book-edit/bin/chicago-normalize.mjs first.)
const OPENERS = /[\s([{—–\-“‘]/
const curlify = (s) => (s ?? '')
  .replace(/"/g, (m, off, str) => (off === 0 || OPENERS.test(str[off - 1])) ? '“' : '”')
  .replace(/'/g, (m, off, str) => (off === 0 || OPENERS.test(str[off - 1])) ? '‘' : '’')
// Strip stray leading/trailing newlines from the replacement (a review-UI artifact):
// an embedded \n in replaceAllText injects a paragraph break, which mid-paragraph
// fixes never want. Leading/trailing SPACES are preserved (often intentional, e.g.
// a span that begins with " " to keep word spacing).
const normalize = (s) => curlify(s).replace(/[ \t]{2,}/g, ' ').replace(/^\n+|\n+$/g, '')

const pairs = []
for (const file of pagesToProcess()) {
  let doc
  try { doc = JSON.parse(readFileSync(file, 'utf8')) } catch { console.error(`skip ${file}: unreadable`); continue }
  for (const f of doc.flags || []) {
    const d = f.decision
    if (d !== 'accept' && d !== 'edit') continue
    const replace = normalize(d === 'edit' ? (f.editText ?? '') : f.fix)
    if (replace === f.span) continue
    pairs.push({ find: f.span, replace, page: doc.page, tell: f.tell, decision: d })
  }
}

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
  const msg = `deai: apply ${pairs.length} approved fix(es)${pageArg ? ` (page ${pageArg})` : ''}\n\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
  spawnSync('git', ['commit', '-m', msg], { cwd: root, stdio: 'inherit' })
}
