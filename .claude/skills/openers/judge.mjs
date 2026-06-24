#!/usr/bin/env node
// In-voice judge bridge for the openers pass. The MODEL does the craft call (keep vs
// recast, and the in-voice rewrite) per judge.md; this script just (a) EMITS the work
// packet for a chapter so a subagent has the run context, and (b) APPLIES the returned
// judgments into the openers-page caches — filling voiceClass + alts.recast, never
// touching the author's own decisions.
//
//   node judge.mjs --emit "Chapter Eleven"   # -> work packet JSON on stdout (for a subagent + judge.md)
//   node judge.mjs --emit p52                  # ...or by page
//   node judge.mjs --apply judgments.json      # merge {id:{voiceClass,recast}} into caches
//   node judge.mjs --check "Chapter Eleven"    # RHYTHM LINT: residual same-opener walls after recasts
//
// SAFETY: --apply never overwrites a flag the author has already decided
// (accept/reject/edit). It only writes voiceClass + alts.recast on still-pending flags.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { classifyOpener } from '../../../shared/openers-core.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const deai = join(here, '..', '..', '..', '.deai')
const args = process.argv.slice(2)
const pageFiles = () => readdirSync(deai).filter(f => /^openers-page-\d+\.json$/.test(f)).map(f => join(deai, f))

function emit(sel) {
  const byPage = /^p?\d+$/.test(sel) ? Number(sel.replace(/^p/, '')) : null
  const runs = {}
  for (const file of pageFiles()) {
    const doc = JSON.parse(readFileSync(file, 'utf8'))
    if (byPage !== null && doc.page !== byPage) continue
    for (const f of doc.flags || []) {
      const fChap = f.chapter ?? doc.chapter                         // per-flag chapter is authoritative
      if (byPage === null && fChap !== sel) continue                 // chapter boundary may split a page
      if (f.decision && f.decision !== 'pending') continue           // author already ruled
      if (f.code === 'D' || f.code === 'F') continue                 // parked
      const r = (runs[f.runId] ||= { runId: f.runId, page: doc.page, chapter: fChap, runCodes: f.runCodes, context: f.context, rows: [] })
      r.rows.push({ id: f.id, code: f.code, opener: f.opener, span: f.span })
    }
  }
  const packet = Object.values(runs)
  if (!packet.length) { console.error(`no pending, recastable flags for "${sel}"`); process.exit(1) }
  console.log(JSON.stringify({ chapter: sel, instructions: 'Judge each row per judge.md. Return {id:{voiceClass, recast?}}.', runs: packet }, null, 2))
}

function apply(path) {
  const judgments = JSON.parse(readFileSync(path, 'utf8'))
  let touched = 0, filledRecast = 0
  for (const file of pageFiles()) {
    const doc = JSON.parse(readFileSync(file, 'utf8'))
    let dirty = false
    for (const f of doc.flags || []) {
      const j = judgments[f.id]
      if (!j) continue
      if (f.decision && f.decision !== 'pending') continue           // never clobber a decision
      if (j.voiceClass === 'signature' || j.voiceClass === 'monotone') { f.voiceClass = j.voiceClass; dirty = true; touched++ }
      if (j.voiceClass === 'monotone' && typeof j.recast === 'string' && j.recast.trim()) {
        f.alts = { ...(f.alts || {}), recast: j.recast.trim() }; dirty = true; filledRecast++
      }
    }
    if (dirty) writeFileSync(file, JSON.stringify(doc, null, 2) + '\n')
  }
  console.log(`judge applied: ${touched} flags classified · ${filledRecast} in-voice recasts filled`)
}

// --- rhythm lint -----------------------------------------------------------
// The prose rule (variety.md line ~103) is a FEEL, not a formula — and a feel is
// easy to read and still violate (cluster the breaks at the front, leave a wall of
// S running on after them). This makes the floor measurable: after the recasts are
// applied, reconstruct the projected opener stream for the chapter and flag any run
// that is still droning. NOT a ratio (the author keeps full freedom over the mix) —
// just a backstop that no same-opener wall is left running on.
//   S_WALL: 4–5 consecutive bare-subject openers is fine (a calm passage); 6+ is the wall.
//   V_WALL: any single VARIED style 4-in-a-row is its own monoculture (don't trade an
//           S-wall for a P-wall — Rule F). D/F are exempt (dialogue beats / fragment
//           soundscapes are owned by other passes and are signature here).
const S_WALL = 6
const V_WALL = 4
// Same fronted WORD twice close together (e.g. "In his coat… In the pews…") is a /variety
// pile-up — varying the TYPE but repeating the WORD just trades one monoculture for another.
// Flag two varied openers (not S/D/F) sharing a first word within this window when at least
// one is a recast (an original-prose echo isn't the pass's doing — don't block on it).
const WORD_WIN = 6
const firstWord = s => (s.trim().split(/\s+/)[0] || '').replace(/[^A-Za-z]/g, '').toLowerCase()
// A recast must be self-contained — built only from words in its OWN flagged sentence. If it
// shares >=2 content words with an adjacent sentence that aren't in its original, it folded a
// neighbor in; apply swaps only the one span, so that neighbor stays and the content doubles.
const BORROW_WIN = 2
const BORROW_MIN = 2
const STOP = new Set(('the a an and or but of to in on at for with from by into across over under '
  + 'her his she he it they them their its as was were is are be been had has have that this not no '
  + 'so then there here up down out off about all one some who which when while did do done').split(' '))
const contentWords = s => new Set(s.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(w => w && !STOP.has(w)))

function streaks(codes) {
  const out = []
  for (let i = 0; i < codes.length;) {
    let j = i
    while (j < codes.length && codes[j] === codes[i]) j++
    out.push({ code: codes[i], start: i, len: j - i })
    i = j
  }
  return out
}

function check(sel) {
  const ch = JSON.parse(readFileSync(join(deai, 'openers-chapters.json'), 'utf8'))
  const sents = ch.chapters?.[sel]
  if (!sents) { console.error(`no chapter "${sel}" in openers-chapters.json (run classify.mjs first)`); process.exit(2) }
  // Join recasts to the stream by sentence TEXT, never by flagId: page-cache ids are
  // numbered per PAGE (mixing chapters where a page straddles a heading), while the
  // chapter stream renumbers per CHAPTER — so the ids collide across a boundary. The
  // verbatim sentence (page-cache `span` == stream `t`) is the only safe key.
  // Project what will actually land: a decided edit's editText wins over the raw recast
  // suggestion, so the gate checks the author's final decisions, not the machine draft.
  const recast = {}
  for (const file of pageFiles()) {
    const doc = JSON.parse(readFileSync(file, 'utf8'))
    for (const f of doc.flags || []) {
      if (!f.span) continue
      if ((f.decision === 'edit' || f.decision === 'accept') && (f.editText || f.fix)) recast[f.span] = f.decision === 'edit' ? f.editText : f.fix
      else if (f.decision === 'reject') continue // keep original
      else if (f.voiceClass === 'monotone' && f.alts?.recast) recast[f.span] = f.alts.recast
    }
  }
  const codeOf = s => recast[s.t] ? classifyOpener(recast[s.t]).code : s.code
  const textOf = s => recast[s.t] || s.t
  const before = sents.map(s => s.code)
  const after = sents.map(codeOf)
  const longestS = arr => Math.max(0, ...streaks(arr).filter(r => r.code === 'S').map(r => r.len))
  const walls = streaks(after).filter(r =>
    (r.code === 'S' && r.len >= S_WALL) || (!'SDF'.includes(r.code) && r.len >= V_WALL))
  // Same fronted word within WORD_WIN, varied openers only, at least one a recast.
  const proj = sents.map(s => ({ code: codeOf(s), word: firstWord(textOf(s)), text: textOf(s), isR: !!recast[s.t], orig: s.t }))
  // Borrowed-from-neighbor: a recast carrying >=2 content words absent from its own original
  // but present in an adjacent sentence (the fold-and-duplicate bug).
  const borrows = []
  for (let i = 0; i < proj.length; i++) {
    if (!proj[i].isR) continue
    const own = contentWords(proj[i].orig)
    const extra = [...contentWords(proj[i].text)].filter(w => !own.has(w))
    if (extra.length < BORROW_MIN) continue
    for (let j = Math.max(0, i - BORROW_WIN); j <= Math.min(proj.length - 1, i + BORROW_WIN); j++) {
      if (j === i) continue
      const nb = contentWords(sents[j].t)
      const shared = extra.filter(w => nb.has(w))
      if (shared.length >= BORROW_MIN) { borrows.push({ i, j, shared }); break }
    }
  }
  const echoes = []
  for (let i = 0; i < proj.length; i++) {
    const b = proj[i]
    if ('SDF'.includes(b.code) || !b.word) continue
    for (let j = Math.max(0, i - WORD_WIN); j < i; j++) {
      const a = proj[j]
      if ('SDF'.includes(a.code) || !a.word) continue
      if (a.word === b.word && (a.isR || b.isR)) { echoes.push({ a: j, b: i, word: b.word, gap: i - j }); break }
    }
  }
  console.log(`rhythm check · ${sel} · ${sents.length} sentences`)
  console.log(`  longest S run: ${longestS(before)} (before) -> ${longestS(after)} (after)   [wall flag at ${S_WALL}+]`)
  console.log(`  stream: ${after.join(' ')}`)
  let fail = false
  if (walls.length) {
    fail = true
    console.log(`  ⚠️ ${walls.length} residual wall(s) — breaks are clustered, not distributed (see variety.md rule F):`)
    for (const w of walls) {
      console.log(`     ${w.len}× ${w.code} at sentences ${w.start + 1}-${w.start + w.len}:`)
      console.log(`        from: ${sents[w.start].t.slice(0, 60)}`)
      console.log(`        to:   ${sents[w.start + w.len - 1].t.slice(0, 60)}`)
    }
  }
  if (echoes.length) {
    fail = true
    console.log(`  ⚠️ ${echoes.length} same-word opener echo(es) — varied the TYPE but repeated the WORD (a /variety pile-up):`)
    for (const e of echoes) {
      console.log(`     "${e.word}" reused ${e.gap} apart at sentences ${e.a + 1} & ${e.b + 1}:`)
      console.log(`        ${e.a + 1}: ${proj[e.a].text.slice(0, 56)}`)
      console.log(`        ${e.b + 1}: ${proj[e.b].text.slice(0, 56)}`)
    }
  }
  if (borrows.length) {
    fail = true
    console.log(`  ⚠️ ${borrows.length} borrowed-from-neighbor recast(es) — folded an adjacent sentence in; it will DOUBLE on apply:`)
    for (const b of borrows) {
      console.log(`     sentence ${b.i + 1} borrows [${b.shared.join(', ')}] from sentence ${b.j + 1}:`)
      console.log(`        recast ${b.i + 1}:   ${proj[b.i].text.slice(0, 56)}`)
      console.log(`        neighbor ${b.j + 1}: ${sents[b.j].t.slice(0, 56)}`)
    }
  }
  if (!fail) { console.log(`  ✓ no opener wall, no same-word echo, no borrowed neighbor — variety is distributed, self-contained, and the entrances vary`); return }
  process.exitCode = 3
}

const ai = args.indexOf('--apply')
const ei = args.indexOf('--emit')
const ci = args.indexOf('--check')
if (ai !== -1 && args[ai + 1]) apply(args[ai + 1])
else if (ei !== -1 && args[ei + 1]) emit(args[ei + 1])
else if (ci !== -1 && args[ci + 1]) check(args[ci + 1])
else { console.error('usage: judge.mjs --emit "<chapter>"|pNN  |  --apply <judgments.json>  |  --check "<chapter>"'); process.exit(2) }
