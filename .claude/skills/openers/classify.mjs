#!/usr/bin/env node
// Deterministic sentence-OPENER classifier for the `openers` pass. Tags every
// sentence in .deai/manuscript.txt with exactly one opener CLASS (see taxonomy.json),
// detects monotony RUNS (4+ same-class in a row — chiefly the bare subject-led "S"
// AI-monoculture), and writes per-page caches .deai/openers-page-NN.json (PageDoc /
// Flag shape, so the existing decisions endpoint + apply-fixes machinery just work).
//
//   node classify.mjs              # scan -> openers-page-NN.json (+ run tally.mjs)
//   node classify.mjs --dry        # print class distribution, write nothing
//
// This is MEASUREMENT — zero LLM, zero hallucination. It never judges keep-vs-recast
// (that is the in-voice judge.mjs layer, ruled by VOICE.md). It only flags WHERE the
// prose goes structurally flat. A flag = one sentence sitting inside a monotony run;
// most will be KEPT at triage. SPAN is the verbatim sentence (for highlight + Drive
// find/replace); LEAD is the preceding sentence, prepended at apply time when the
// span is not unique in the book so replaceAllText can't hit the wrong copy.
//
// SAFETY (mirrors tic/deai): never clobber an openers-page-NN.json that already holds
// decisions — write openers-rescan-NN.json instead (merge-rescan.mjs --openers NN).
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { classifyOpener, words, clean } from '../../../shared/openers-core.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..', '..', '..')
const deai = join(root, '.deai')
const DRY = process.argv.includes('--dry')

const tax = JSON.parse(readFileSync(join(here, 'taxonomy.json'), 'utf8'))
const RUN_MIN = tax.budgets.typeRun_min
const WORD_RUN_MIN = tax.reconcile.variety_word_run_min

const PAGE_SIZE = 400
const raw = readFileSync(join(deai, 'manuscript.txt'), 'utf8')
const lines = raw.split('\n')

// normalized whole-manuscript text, for span-uniqueness checks (curly/space-insensitive)
const norm = s => (s || '').replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim()
const manuNorm = norm(raw)
const occurrences = s => { const n = norm(s); if (!n) return 0; let i = 0, c = 0; while ((i = manuNorm.indexOf(n, i)) !== -1) { c++; i += n.length } return c }

// paragraph line -> page number + current chapter (mirror of server/utils/deai.ts)
const headRe = /^(PROLOGUE|EPILOGUE|INTERLUDE|PART [A-Z]+|Chapter [A-Za-z-]+)\s*$/
const pageOf = [], chapOf = []
{ let p = 1, n = 0, chap = 'front matter'
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim()
    if (headRe.test(t)) chap = t
    pageOf[i] = p; chapOf[i] = chap
    n += t === '' ? 0 : t.split(/\s+/).filter(Boolean).length
    if (n >= PAGE_SIZE) { p++; n = 0 }
  } }

// --- opener classification (shared core — also used by the /openers page) ---------
// classify() and its word helpers now live in shared/openers-core.mjs so the live
// "after optimization" mix in the UI uses the exact same logic (no drift). splitSentences
// stays local — it's sentence segmentation, not opener classification.
const splitSentences = p => (p.match(/[^.!?…]+[.!?…]+(?=[\s”’")\]]*\s|[\s”’")\]]*$)|[^.!?…]+$/g) || []).map(s => s.trim()).filter(Boolean)
const classify = classifyOpener

// --- walk the book: a flat sentence stream carrying page/chapter/line ------------
const stream = []   // {sent, code, opener, word1, page, chapter, li, paraInitial}
for (let li = 0; li < lines.length; li++) {
  const t = lines[li]
  if (!t.trim() || headRe.test(t.trim()) || /^(CHASING THE SUN|A Novel|Based on|by Ryan|\* \* \*|[A-Z][a-z]+, [A-Z][a-z]+\. \d{4}\.)/.test(t.trim())) continue
  const ss = splitSentences(t)
  ss.forEach((sent, si) => {
    const { code, opener } = classify(sent)
    stream.push({ sent, code, opener, word1: clean(words(sent)[0]), page: pageOf[li], chapter: chapOf[li], li, prev: si > 0 ? ss[si - 1] : '' })
  })
}

// --- detect monotony runs over the stream ---------------------------------------
// A run = consecutive sentences sharing one class. AUTHOR rule (taxonomy Operating Rule
// F): 4+ in a row on the SAME style is a flag, applied UNIFORMLY to every narrative style
// (an S-wall and a P-wall are both monocultures). Dialogue (D) and fragment (F) runs are
// parked (owned by brogue / tic).
const runs = []
let i = 0
while (i < stream.length) {
  let j = i + 1
  while (j < stream.length && stream[j].code === stream[i].code && stream[j].chapter === stream[i].chapter) j++
  const len = j - i
  const code = stream[i].code
  const isTarget = code !== 'D' && code !== 'F' && len >= RUN_MIN
  if (isTarget) runs.push({ start: i, end: j, len, code })
  i = j
}

// --- build flags (one per sentence inside a target run) --------------------------
const flagsByPage = {}
let runCounter = 0
for (const run of runs) {
  runCounter++
  const members = stream.slice(run.start, run.end)
  const runId = `r${runCounter}`
  const runCodes = members.map(m => m.code).join(' ')
  const runText = members.map(m => m.sent).join(' ')
  // same-WORD sub-run inside this type-run? (then /variety also owns it — annotate)
  const w1 = members.map(m => m.word1)
  let alsoVariety = false
  for (let k = WORD_RUN_MIN - 1; k < w1.length; k++) {
    if (w1[k] && w1.slice(k - WORD_RUN_MIN + 1, k + 1).every(x => x === w1[k])) { alsoVariety = true; break }
  }
  members.forEach((m, idx) => {
    if (idx === 0) return   // the run's FIRST opener is fine; only its repetition is monotonous
    const page = m.page
    const uniq = occurrences(m.sent) === 1
    ;(flagsByPage[page] ||= []).push({
      sent: m.sent, code: m.code, opener: m.opener, lead: m.prev, unique: uniq,
      runId: `p${page}-${runId}`, runLen: run.len, runCodes, runText, runPos: idx, alsoVariety, chapter: m.chapter,
      streamIdx: run.start + idx,   // back-ref so the chapter/bunch view can resolve this sentence's flag id
    })
  })
}

// --- distribution per chapter (the report's headline numbers) --------------------
const dist = {}
for (const s of stream) {
  const d = (dist[s.chapter] ||= { total: 0, codes: {} })
  d.total++; d.codes[s.code] = (d.codes[s.code] || 0) + 1
}

if (DRY) {
  const tot = stream.length
  const codes = {}
  for (const s of stream) codes[s.code] = (codes[s.code] || 0) + 1
  console.log(`sentences classified: ${tot}`)
  for (const [c, n] of Object.entries(codes).sort((a, b) => b[1] - a[1]))
    console.log(`  ${c}  ${tax.classes[c].label.padEnd(15)} ${n}  ${(100 * n / tot).toFixed(1)}%`)
  console.log(`monotony runs (>=${RUN_MIN}): ${runs.length}  ·  flagged sentences: ${Object.values(flagsByPage).flat().length}`)
  process.exit(0)
}

// --- write per-page caches (PageDoc/Flag shape) ----------------------------------
let wrote = 0, rescans = 0
const allPages = new Set([...Object.keys(flagsByPage).map(Number)])
for (const page of [...allPages].sort((a, b) => a - b)) {
  const pad = String(page).padStart(2, '0')
  const pagePath = join(deai, `openers-page-${pad}.json`)
  const rescanPath = join(deai, `openers-rescan-${pad}.json`)
  const pflags = flagsByPage[page]
  const chapter = pflags[0]?.chapter

  const doc = {
    page, chapter,
    pageDetect: null,
    flags: pflags.map((f, k) => {
     const id = `p${page}-o${k + 1}`
     stream[f.streamIdx].flagId = id     // thread the flag id back onto the chapter stream
     return {
      id,
      tell: `type-run:${f.code}`,
      chapter: f.chapter,   // per-SENTENCE chapter (precise at chapter boundaries; a page can straddle two)
      code: f.code,
      opener: f.opener,
      span: f.sent,
      lead: f.lead || '',
      unique: f.unique,
      context: f.runText,
      runId: f.runId,
      runLen: f.runLen,
      runCodes: f.runCodes,
      runPos: f.runPos,
      alsoVariety: f.alsoVariety,
      voice: 0,            // keep-strength of THIS opener (judge.mjs, per VOICE.md): high = signature, keep
      detect: Math.min(10, f.runLen),   // monotony heat = run length
      voiceClass: null,    // 'signature' (keep) | 'monotone' (recast candidate) — judge.mjs
      why: `${f.runLen} ${tax.classes[f.code].label} openers in a row (${f.runCodes}).` + (f.alsoVariety ? ' Also a same-word run — /variety overlaps.' : ''),
      alts: { recast: null },   // in-voice recast suggestion (judge.mjs) — varied opener for THIS sentence
      fix: '',             // placeholder; openers decisions apply via editText (like tic)
      decision: 'pending',
     }
    }),
  }

  if (existsSync(pagePath)) {
    const prev = JSON.parse(readFileSync(pagePath, 'utf8'))
    if ((prev.flags || []).some(f => f.decision && f.decision !== 'pending')) {
      writeFileSync(rescanPath, JSON.stringify(doc, null, 2) + '\n'); rescans++; continue
    }
  }
  writeFileSync(pagePath, JSON.stringify(doc, null, 2) + '\n'); wrote++
}

// clean stale caches for pages that no longer have flags (only when not a decided page)
for (const f of readdirSync(deai).filter(f => /^openers-page-\d+\.json$/.test(f))) {
  const page = Number(f.match(/(\d+)/)[1])
  if (allPages.has(page)) continue
  const prev = JSON.parse(readFileSync(join(deai, f), 'utf8'))
  if (!(prev.flags || []).some(x => x.decision && x.decision !== 'pending'))
    writeFileSync(join(deai, f), JSON.stringify({ page, chapter: prev.chapter, pageDetect: null, flags: [] }, null, 2) + '\n')
}

// --- machine summary for tally.mjs / OPENERS-PASS.md (single source of truth) ----
const totals = {}
for (const s of stream) totals[s.code] = (totals[s.code] || 0) + 1
const chapterRows = Object.entries(dist).map(([chapter, d]) => {
  const pctS = d.total ? d.codes.S / d.total || 0 : 0
  const varied = Object.entries(d.codes).filter(([c]) => tax.classes[c].varied).reduce((a, [, n]) => a + n, 0)
  return { chapter, total: d.total, codes: d.codes, pctS, pctVaried: d.total ? varied / d.total : 0, overBudget: pctS > tax.budgets.pctS_max }
})
const worstRuns = runs.map(r => {
  const m = stream.slice(r.start, r.end)
  return { page: m[0].page, chapter: m[0].chapter, len: r.len, code: r.code, openers: m.map(x => x.opener).join(' / '), text: m.map(x => x.sent).join(' ') }
}).sort((a, b) => b.len - a.len).slice(0, 40)
writeFileSync(join(deai, 'openers-summary.json'), JSON.stringify({
  sentences: stream.length, totals, budgets: tax.budgets, targets: tax.targets,
  chapters: chapterRows, runsTotal: runs.length, flagged: Object.values(flagsByPage).flat().length, worstRuns,
}, null, 2) + '\n')

// --- per-chapter prose stream (powers the /openers CHAPTER / "bunch" view) --------
// The whole book as ordered sentences, each carrying its opener code, its paragraph id
// (line index, so the view can reconstruct paragraphs), its page, and the flagId of the
// flag it belongs to (null if it sits in no monotony run). The view renders a chapter as
// continuous prose with every opener colour-coded and the flagged ones carrying their
// recast — so the author can read + bulk-decide a whole prologue/interlude/chapter at once.
const chapterText = {}
for (const m of stream)
  (chapterText[m.chapter] ||= []).push({ t: m.sent, code: m.code, flagId: m.flagId || null, para: m.li, page: m.page })
writeFileSync(join(deai, 'openers-chapters.json'),
  JSON.stringify({ chapters: chapterText, order: Object.keys(chapterText) }, null, 2) + '\n')

const flagTotal = Object.values(flagsByPage).flat().length
console.log(`openers: ${stream.length} sentences · ${runs.length} monotony runs · ${flagTotal} flagged across ${allPages.size} pages`)
console.log(`wrote ${wrote} openers-page-NN.json` + (rescans ? `  ·  ${rescans} had decisions -> openers-rescan-NN.json (run merge-rescan.mjs --openers NN)` : ''))
console.log('next: node .claude/skills/openers/tally.mjs   (chapter distribution + worst runs)')
