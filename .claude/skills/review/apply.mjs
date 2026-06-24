#!/usr/bin/env node
// apply.mjs — write QUEUED /review cards to the Google Doc, then ARCHIVE the units.
//
// The review engine is diagnostic; THIS is the one place it writes Drive, for cards the
// author queued at /review. The author's NOTE on a card is authoritative custom content
// and OVERRIDES the engine's chosen option (notes usually read "use: …" / "Use this: …").
//
// Resolution per queued card (decision === 'queued'):
//   1. note "use:/use this:" text   (the author's own replacement — wins over everything)
//   2. chosen option                (multi-option card the author picked)
//   3. the sole option's edited     (single-option card, no pick needed)
//   chosen === ""  ->  FULL CUT (delete the paragraph, mark and all)
// dismiss -> skipped. A note that is an INSTRUCTION/CONDITIONAL (not a clean "use:" block,
// e.g. "Do the last suggestion too", "Replace X after you confirm…") cannot be auto-applied
// — it is HELD and printed for the author, and its unit is NOT archived.
//
// Drive mechanics (replaceAllText can't cross paragraph marks and nests additive edits on a
// re-run, so we route by shape and never double-send):
//   single-paragraph replace -> book-edit/bin/edit-doc.mjs   (one batch)
//   multi-paragraph  replace -> book-edit/bin/range-replace.mjs
//   full cut                 -> book-edit/bin/delete-paragraph.mjs
//
// ARCHIVE: after a successful --apply + re-sync + verify, every unit whose cards are all
// resolved (all queued cards placed, nothing pending/held) is added to
// .deai/review-applied.json and the engine re-collates so /review drops them.
//
//   node .claude/skills/review/apply.mjs            # DRY RUN — show the plan, touch nothing
//   node .claude/skills/review/apply.mjs --apply    # write Drive, verify, archive, re-collate
import { readFileSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..', '..', '..')
const deai = join(root, '.deai')
const APPLY = process.argv.includes('--apply')

const bin = (name) => join(root, '.claude/skills/book-edit/bin', name)
const sh = (cmd, args, input) => spawnSync(cmd, args, { input, encoding: 'utf8', cwd: root })
const readJSON = (p, dflt) => { try { return JSON.parse(readFileSync(p, 'utf8')) } catch { return dflt } }

const norm = (s) => (s || '').replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim()
const OPENERS = /[\s([{—–\-“‘]/
const curlify = (s) => (s ?? '')
  .replace(/"/g, (m, off, str) => (off === 0 || OPENERS.test(str[off - 1])) ? '“' : '”')
  .replace(/'/g, (m, off, str) => (off === 0 || OPENERS.test(str[off - 1])) ? '‘' : '’')
const cleanReplace = (s) => curlify(s).replace(/[ \t]{2,}/g, ' ').replace(/^\n+|\n+$/g, '').trim()
const USE_RE = /^\s*use(\s+this)?\s*:\s*/i

const review = readJSON(join(deai, 'review.json'), null)
const decisions = readJSON(join(deai, 'review-decisions.json'), {})
let manuscript = readFileSync(join(deai, 'manuscript.txt'), 'utf8')
let manN = norm(manuscript)
if (!review || !Array.isArray(review.findings)) { console.error('No .deai/review.json — run collate first.'); process.exit(2) }
if (!review.findings.length) { console.log('review.json has 0 cards — nothing queued (already archived?).'); process.exit(0) }

// unit id from a card: chapters render "Chapter Sixteen" but units are "ch16"; fall back to
// the page-keyed unit only if needed. The applied-list keys on the same <unit> collate uses.
// word ordinals → number, incl. compounds like "Twenty-Four" / "Thirty-One" (chapters run past forty).
const ONES = { One:1,Two:2,Three:3,Four:4,Five:5,Six:6,Seven:7,Eight:8,Nine:9,Ten:10,Eleven:11,Twelve:12,Thirteen:13,Fourteen:14,Fifteen:15,Sixteen:16,Seventeen:17,Eighteen:18,Nineteen:19 }
const TENS = { Twenty:20,Thirty:30,Forty:40 }
const wordToNum = (w) => {
  const [a, b] = w.split('-')
  if (b === undefined) return ONES[a] ?? TENS[a] ?? null   // "Seven" | "Thirty"
  const t = TENS[a], o = ONES[b]                            // "Thirty-One"
  return (t != null && o != null && o < 10) ? t + o : null
}
const unitOf = (c) => {
  const m = /Chapter\s+([\w-]+)/.exec(c.chapter || '')
  const n = m ? wordToNum(m[1]) : null
  return n != null ? 'ch' + String(n).padStart(2, '0') : null
}

const single = [], multi = [], cuts = [], held = [], skipped = []
const placedCardIds = new Set()
const unitsTouched = new Set()

// DRIFTERS: a decision whose card is no longer in review.json. Its content-hashed id flipped when
// the manuscript was edited + re-collated, so it belongs to an already-completed/archived chapter,
// NOT outstanding work. apply only iterates review.findings, so drifters are ignored by construction
// — NEVER hand-rescue a drifter (re-probing review-decisions.json, re-applying its note text): it
// reopens a settled chapter. Surfaced in the report so they read as "deliberately skipped".
const liveIds = new Set(review.findings.map(f => f.id))
const drifters = Object.entries(decisions).filter(([id, d]) => (d?.decision === 'queued' || d?.decision === 'dismiss') && !liveIds.has(id))

for (const c of review.findings) {
  const d = decisions[c.id]
  if (!d || d.decision !== 'queued') continue
  const u = unitOf(c); if (u) unitsTouched.add(u)
  const note = d.note && d.note.trim() ? d.note.trim() : null

  // full cut
  if (d.chosen === '') {
    if (!c.original) { skipped.push(`${c.id}: cut with no original`); continue }
    if (!manN.includes(norm(c.original))) { skipped.push(`${c.id} p${c.page}: cut span already gone — skip`); placedCardIds.add(c.id); continue }
    cuts.push({ id: c.id, page: c.page, original: c.original }); placedCardIds.add(c.id); continue
  }

  // resolve replacement (note "use:" wins)
  let replace
  if (note && USE_RE.test(note)) replace = note.replace(USE_RE, '').trim()
  else if (note) { held.push({ id: c.id, page: c.page, note }); continue } // instruction/conditional — author must handle
  else if (d.chosen != null) replace = d.chosen
  else if (c.options && c.options.length === 1) replace = c.options[0].edited
  else { held.push({ id: c.id, page: c.page, note: 'queued multi-option with no pick' }); continue }

  const find = c.original
  if (!find) { skipped.push(`${c.id}: no original span`); continue }
  const fN = norm(find), rep = cleanReplace(replace), repN = norm(rep)
  // idempotent skip (mirror apply-fixes.mjs): a card is already applied if its span is GONE,
  // OR if the full replacement is already present. The second case is essential for ADDITIVE
  // edits — a note that APPENDS a sentence keeps the original as a substring of the
  // replacement, so the span stays present after applying; re-sending would NEST/duplicate it.
  if (!manN.includes(fN) || (repN !== fN && manN.includes(repN))) {
    skipped.push(`${c.id} p${c.page}: already applied — skip`); placedCardIds.add(c.id); continue
  }
  const occ = manN.split(fN).length - 1
  if (occ > 1) { skipped.push(`${c.id} p${c.page}: span occurs ${occ}x — UNSAFE for replace, skip`); continue }
  if (repN === fN) { skipped.push(`${c.id} p${c.page}: no-op`); placedCardIds.add(c.id); continue }

  const pair = { find, replace: rep, id: c.id, page: c.page }
  ;(find.includes('\n') ? multi : single).push(pair)
  placedCardIds.add(c.id)
}

// ---- report ----------------------------------------------------------------
const plan = (label, arr) => console.log(`  ${label}: ${arr.length}`)
console.log(`${APPLY ? 'APPLYING' : 'DRY RUN'} — queued cards resolved:`)
plan('single-paragraph replaces (edit-doc)', single)
plan('multi-paragraph replaces (range-replace)', multi)
plan('full-paragraph cuts (delete-paragraph)', cuts)
if (drifters.length) console.log(`  drifters IGNORED (decided cards no longer in review.json = completed/archived chapters — NEVER hand-rescue): ${drifters.length}`)
if (held.length) {
  console.log(`  HELD (note is an instruction/conditional — apply by hand, unit NOT archived): ${held.length}`)
  for (const h of held) console.log(`    • ${h.id} p${h.page}: ${JSON.stringify((h.note || '').slice(0, 90))}`)
}
if (skipped.length) { console.log(`  skipped: ${skipped.length}`); for (const s of skipped) console.log(`    - ${s}`) }

if (!APPLY) {
  console.log('\n[DRY RUN] pass --apply to write Drive, verify, and archive resolved units.')
  process.exit(0)
}

// ---- write Drive -----------------------------------------------------------
let failed = false
if (single.length) {
  const res = sh('node', [bin('edit-doc.mjs')], JSON.stringify(single.map(({ find, replace }) => ({ find, replace }))))
  process.stderr.write(res.stderr || ''); if (res.status !== 0) failed = true
  console.log(`edit-doc: wrote ${single.length} single-paragraph edit(s)`) // edit-doc warns on 0-match itself
}
if (multi.length) {
  const res = sh('node', [bin('range-replace.mjs'), '--apply'], JSON.stringify(multi.map(({ find, replace }) => ({ find, replace }))))
  process.stdout.write(res.stdout || ''); process.stderr.write(res.stderr || ''); if (res.status !== 0) failed = true
}
for (const c of cuts) {
  const res = sh('node', [bin('delete-paragraph.mjs'), '--apply'], c.original)
  process.stdout.write(res.stdout || ''); process.stderr.write(res.stderr || ''); if (res.status !== 0) failed = true
}

// ---- re-sync + verify ------------------------------------------------------
console.log('\nRe-syncing from Drive to verify…')
sh('bash', [join(root, '.claude/skills/deai/sync.sh')])
manuscript = readFileSync(join(deai, 'manuscript.txt'), 'utf8'); manN = norm(manuscript)
const bad = []
for (const p of [...single, ...multi]) {
  const r = norm(p.replace), f = norm(p.find)
  const rOcc = manN.split(r).length - 1
  const findGone = !manN.includes(f) || r.includes(f) // additive: find legitimately remains inside replace
  if (!(rOcc >= 1 && findGone)) bad.push(`${p.id} p${p.page}: replace×${rOcc}, findPresent=${manN.includes(f)}`)
  if (rOcc > 1) bad.push(`${p.id} p${p.page}: DUPLICATED (replace ×${rOcc})`)
}
for (const c of cuts) if (manN.includes(norm(c.original))) bad.push(`${c.id}: cut paragraph still present`)
if (bad.length) {
  console.error(`\n⚠ VERIFICATION FAILED for ${bad.length} edit(s) — NOT archiving:`)
  bad.forEach(b => console.error('   ' + b))
  process.exit(1)
}
console.log(`✓ verified ${single.length + multi.length} replace(s) + ${cuts.length} cut(s) applied exactly once.`)

// ---- archive fully-resolved units -----------------------------------------
// A unit is archived only when every one of its queued cards was placed AND it has no
// HELD card and no still-PENDING card (so undecided work is never silently hidden).
const heldUnits = new Set(held.map(h => { const c = review.findings.find(f => f.id === h.id); return c ? unitOf(c) : null }))
const pendingUnits = new Set()
for (const c of review.findings) {
  const st = decisions[c.id]?.decision ?? 'pending'
  if (st === 'pending') { const u = unitOf(c); if (u) pendingUnits.add(u) }
}
const archivable = [...unitsTouched].filter(u => u && !heldUnits.has(u) && !pendingUnits.has(u)).sort()
const blocked = [...unitsTouched].filter(u => u && (heldUnits.has(u) || pendingUnits.has(u))).sort()

const appliedPath = join(deai, 'review-applied.json')
const appliedList = readJSON(appliedPath, [])
for (const u of archivable) if (!appliedList.includes(u)) appliedList.push(u)
appliedList.sort()
writeFileSync(appliedPath, JSON.stringify(appliedList) + '\n')
console.log(`\nArchived to review-applied.json: ${archivable.join(', ') || '(none)'}`)
if (blocked.length) console.log(`NOT archived (still have pending/held cards — triage then re-run): ${blocked.join(', ')}`)

// ---- re-collate so /review drops the archived units ------------------------
const col = sh('node', [join(here, 'collate.mjs')])
process.stdout.write((col.stdout || '').split('\n').slice(0, 4).join('\n') + '\n')
console.log('\nDone.' + (failed ? ' (one or more Drive tools reported a non-zero status — review output above)' : ''))
