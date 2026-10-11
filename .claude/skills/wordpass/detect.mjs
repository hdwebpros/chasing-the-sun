#!/usr/bin/env node
// Deterministic enumerator for a leaned-on WORD (verb/adjective) across the book.
// Every sentence containing one of the word's forms becomes a flag; the model's only
// job later is judging keep-vs-vary and writing in-voice alternatives (judge.mjs --word).
//
//   node detect.mjs --word stand --forms stand,stands,stood,standing
//   node detect.mjs --word stand --forms ... --dry
//
// Writes .deai/word-page-NN.json (schema-compatible with tic; reviewed at /tic?mode=word,
// applied by deai/apply-fixes.mjs --word). SPAN = the whole sentence so a replacement is
// a clean full-sentence swap. `lead` = prior sentence + `unique:false` when the sentence
// text recurs in the book, so apply prepends the lead and can't rewrite the wrong copy.
// Never clobbers a page cache that already holds decisions — writes word-rescan-NN.json.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..', '..', '..')
const deai = join(root, '.deai')
const args = process.argv.slice(2)
const DRY = args.includes('--dry')
const arg = k => { const i = args.indexOf(k); return i === -1 ? null : args[i + 1] }
const WORD = arg('--word')
const FORMS = (arg('--forms') || WORD || '').split(',').map(s => s.trim()).filter(Boolean)
if (!WORD || !FORMS.length) { console.error('usage: detect.mjs --word stand --forms stand,stands,stood,standing'); process.exit(2) }

const PAGE_SIZE = 400
const raw = readFileSync(join(deai, 'manuscript.txt'), 'utf8')
const lines = raw.split('\n')
const norm = s => (s || '').replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim()
const manuNorm = norm(raw)
const occurrences = s => { const n = norm(s); let i = 0, c = 0; while (n && (i = manuNorm.indexOf(n, i)) !== -1) { c++; i += n.length } return c }

// paragraph line -> page + chapter (mirror of server/utils/deai.ts / openers/classify.mjs)
const headRe = /^(PROLOGUE|EPILOGUE|AFTERWORD|INTERLUDE|PART [A-Z]+|Chapter [A-Za-z-]+)\s*$/
const pageOf = [], chapOf = []
{ let p = 1, n = 0, chap = 'front matter', inter = 0
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim()
    if (headRe.test(t)) chap = t === 'INTERLUDE' ? `INTERLUDE ${++inter}` : t
    pageOf[i] = p; chapOf[i] = chap
    n += t === '' ? 0 : t.split(/\s+/).filter(Boolean).length
    if (n >= PAGE_SIZE) { p++; n = 0 }
  } }

const TERM = /[.!?…]["”’')]*/g
const HIT = new RegExp(`\\b(${FORMS.join('|')})\\b`, 'i')
const flags = []
for (let li = 0; li < lines.length; li++) {
  const para = lines[li]
  if (!para.trim() || headRe.test(para.trim())) continue
  // sentence boundaries with exact offsets so spans are verbatim
  const starts = [0]; let m
  TERM.lastIndex = 0
  while ((m = TERM.exec(para))) {
    let e = m.index + m[0].length
    while (e < para.length && para[e] === ' ') e++
    if (e < para.length) starts.push(e)
  }
  const sents = starts.map((s, i) => para.slice(s, i + 1 < starts.length ? starts[i + 1] : para.length).replace(/\s+$/, ''))
  sents.forEach((sent, i) => {
    const hm = sent.match(HIT)
    if (!hm) return
    flags.push({
      page: pageOf[li], chapter: chapOf[li], span: sent, form: hm[1].toLowerCase(),
      lead: i > 0 ? sents[i - 1] : '', after: i + 1 < sents.length ? sents[i + 1] : '',
      inDialogue: /[“”]/.test(sent), unique: occurrences(sent) === 1,
    })
  })
}
for (const f of flags) f.cluster = flags.filter(g => Math.abs(g.page - f.page) <= 4).length

const byPage = {}
for (const f of flags) (byPage[f.page] ||= []).push(f)
let wrote = 0, rescans = 0
for (const [pageStr, pflags] of Object.entries(byPage)) {
  const page = Number(pageStr), pad = String(page).padStart(2, '0')
  const pagePath = join(deai, `word-page-${pad}.json`)
  const doc = {
    page, chapter: pflags[0].chapter, words: undefined, pageDetect: null,
    flags: pflags.map((f, i) => ({
      id: `p${page}-${WORD}${i + 1}`, tell: `word-${WORD}`, form: f.form, chapter: f.chapter,
      span: f.span, lead: f.lead, unique: f.unique, after: f.after,
      context: f.lead ? `${f.lead}  ❯  ${f.span}` : f.span,
      inDialogue: f.inDialogue, cluster: f.cluster, voiceClass: null, voice: 0,
      detect: Math.min(10, f.cluster),
      why: f.inDialogue ? `"${f.form}" inside dialogue — character voice; defaults to keep.` : `"${f.form}"; ${f.cluster} ${WORD}-forms within ±4pp.`,
      alts: { cut: null, vary: null, merge: null, recast: null },
      fix: f.span, decision: 'pending',
    })),
  }
  if (DRY) continue
  if (existsSync(pagePath)) {
    const prev = JSON.parse(readFileSync(pagePath, 'utf8'))
    const mine = (prev.flags || []).filter(x => x.tell === `word-${WORD}`)
    if (mine.some(x => x.decision && x.decision !== 'pending')) {
      writeFileSync(join(deai, `word-rescan-${pad}.json`), JSON.stringify(doc, null, 2) + '\n'); rescans++; continue
    }
    // other words already cached on this page: keep theirs, replace ours
    doc.flags = [...(prev.flags || []).filter(x => x.tell !== `word-${WORD}`), ...doc.flags]
  }
  writeFileSync(pagePath, JSON.stringify(doc, null, 2) + '\n'); wrote++
}
const dlg = flags.filter(f => f.inDialogue).length
const perChap = {}
for (const f of flags) perChap[f.chapter] = (perChap[f.chapter] || 0) + 1
console.log(`${WORD}: ${flags.length} sentences (${dlg} in dialogue, ${flags.filter(f => !f.unique).length} non-unique) across ${Object.keys(perChap).length} chapters`)
if (!DRY) console.log(`wrote ${wrote} word-page-NN.json${rescans ? `  ·  ${rescans} page(s) had decisions -> word-rescan-NN.json` : ''}`)
