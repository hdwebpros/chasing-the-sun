#!/usr/bin/env node
// Weak-word pass (flat verbs/adjectives → precise/elevated). Unlike detect.mjs there is no
// deterministic enumerator: one Sonnet judge per chapter picks up to N sentences. This script
// is the plumbing around that.
//
//   node weak.mjs split <outDir>      # one {chapter,text} JSON per chapter for the judges
//   node weak.mjs merge <judgDir>     # judgments/*.json -> .deai/word-page-NN.json (tell word-weak)
//
// judgment file shape: [{ span, word, kind, alts: [..1-3 full-sentence rewrites..], why }]
// Rows land in /tic?mode=word under the "weak" tab (alts A/B/C = vary/merge/recast) and are
// applied by deai/apply-fixes.mjs --word like any other word pass.
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const deai = join(here, '..', '..', '..', '.deai')
const [cmd, dir] = process.argv.slice(2)
if (!cmd || !dir) { console.error('usage: weak.mjs split <outDir> | merge <judgDir>'); process.exit(2) }

const TELL = process.env.TELL || 'weak' // TELL=proof weak.mjs merge … loads a second tab without touching weak rows
const PAGE_SIZE = 400
const raw = readFileSync(join(deai, 'manuscript.txt'), 'utf8')
const lines = raw.split('\n')
const norm = s => (s || '').replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim()
const headRe = /^(PROLOGUE|EPILOGUE|AFTERWORD|INTERLUDE|PART [A-Z]+|Chapter [A-Za-z-]+)\s*$/
const slug = c => c.toLowerCase().replace(/\s+/g, '-')

// paragraph line -> page + chapter (same walk as detect.mjs)
const pageOf = [], chapOf = []
{ let p = 1, n = 0, chap = 'front matter', inter = 0
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim()
    if (headRe.test(t)) chap = t === 'INTERLUDE' ? `INTERLUDE ${++inter}` : t
    pageOf[i] = p; chapOf[i] = chap
    n += t === '' ? 0 : t.split(/\s+/).filter(Boolean).length
    if (n >= PAGE_SIZE) { p++; n = 0 }
  } }

if (cmd === 'split') {
  mkdirSync(dir, { recursive: true })
  const text = {}
  lines.forEach((l, i) => { if (l.trim() && !headRe.test(l.trim())) (text[chapOf[i]] ||= []).push(l) })
  let n = 0
  for (const [chapter, paras] of Object.entries(text)) {
    if (chapter === 'front matter') continue
    writeFileSync(join(dir, `${slug(chapter)}.json`), JSON.stringify({ chapter, text: paras.join('\n\n') }, null, 2) + '\n'); n++
  }
  console.log(`wrote ${n} chapter files to ${dir}`)
  process.exit(0)
}

// ---- merge ----
const TERM = /[.!?…]["”’')]*/g
const sentsOf = para => {
  const starts = [0]; let m; TERM.lastIndex = 0
  while ((m = TERM.exec(para))) { let e = m.index + m[0].length; while (e < para.length && para[e] === ' ') e++; if (e < para.length) starts.push(e) }
  return starts.map((s, i) => para.slice(s, i + 1 < starts.length ? starts[i + 1] : para.length).replace(/\s+$/, ''))
}
// index every sentence in the book once: normalized text -> [{line, i, sents}]
const index = new Map()
lines.forEach((para, li) => {
  if (!para.trim() || headRe.test(para.trim())) return
  const ss = sentsOf(para)
  ss.forEach((s, i) => { const k = norm(s); if (!index.has(k)) index.set(k, []); index.get(k).push({ li, i, ss }) })
})

const flags = [], problems = []
for (const f of readdirSync(dir).filter(f => f.endsWith('.json')).sort()) {
  let items
  try { items = JSON.parse(readFileSync(join(dir, f), 'utf8')) } catch (e) { problems.push(`${f}: bad JSON`); continue }
  if (!Array.isArray(items)) items = items.flags || items.items || []
  items.forEach((it, n) => {
    const tag = `${f}#${n + 1}`
    let hits = index.get(norm(it.span))
    if (!hits) { // judge dropped a closing quote/paren: accept a sentence that starts with the span
      const k = [...index.keys()].find(k => k.startsWith(norm(it.span)) && /^["')]+$/.test(k.slice(norm(it.span).length)))
      if (k) hits = index.get(k)
    }
    if (!hits) { problems.push(`${tag}: span not found verbatim: ${String(it.span).slice(0, 60)}…`); return }
    const real = hits[0].ss[hits[0].i]
    const suffix = real.slice(real.length - (norm(real).length - norm(it.span).length)) // '' when exact
    if (suffix) it.alts = (it.alts || []).map(a => a.endsWith(suffix) ? a : a + suffix)
    const alts = (it.alts || []).filter(a => typeof a === 'string' && a.trim() && norm(a) !== norm(it.span))
    for (const a of alts) if (/["']/.test(a)) problems.push(`${tag}: straight quote in alt`)
    if (!alts.length) { problems.push(`${tag}: no usable alts`); return }
    const h = hits[0]
    flags.push({
      page: pageOf[h.li], chapter: chapOf[h.li], span: h.ss[h.i], form: it.word || '', kind: it.kind || '',
      lead: h.i > 0 ? h.ss[h.i - 1] : '', after: h.i + 1 < h.ss.length ? h.ss[h.i + 1] : '',
      inDialogue: /[“”]/.test(h.ss[h.i]), unique: hits.length === 1, alts: alts.slice(0, 3), why: it.why || '',
    })
  })
}
if (problems.length) { console.log('PROBLEMS:\n  ' + problems.join('\n  ')) }

const byPage = {}
for (const f of flags) (byPage[f.page] ||= []).push(f)
let wrote = 0
for (const [pageStr, pf] of Object.entries(byPage)) {
  const page = Number(pageStr), pad = String(page).padStart(2, '0')
  const pagePath = join(deai, `word-page-${pad}.json`)
  const doc = { page, chapter: pf[0].chapter, words: undefined, pageDetect: null, flags: pf.map((f, i) => ({
    id: `p${page}-${TELL}${i + 1}`, tell: `word-${TELL}`, form: f.form, chapter: f.chapter,
    span: f.span, lead: f.lead, unique: f.unique, after: f.after,
    context: f.lead ? `${f.lead}  ❯  ${f.span}` : f.span,
    inDialogue: f.inDialogue, cluster: 1, voiceClass: 'abstract', voice: 0, detect: 5,
    why: `${f.kind ? f.kind + ' ' : ''}“${f.form}” — ${f.why}`,
    alts: { cut: null, vary: f.alts[0] ?? null, merge: f.alts[1] ?? null, recast: f.alts[2] ?? null },
    fix: f.span, decision: 'pending',
  })) }
  if (existsSync(pagePath)) {
    const prev = JSON.parse(readFileSync(pagePath, 'utf8'))
    if ((prev.flags || []).some(x => x.tell === `word-${TELL}` && x.decision && x.decision !== 'pending')) { console.log(`skip page ${page}: has decisions`); continue }
    doc.flags = [...(prev.flags || []).filter(x => x.tell !== `word-${TELL}`), ...doc.flags]
  }
  writeFileSync(pagePath, JSON.stringify(doc, null, 2) + '\n'); wrote++
}
const perChap = {}
for (const f of flags) perChap[f.chapter] = (perChap[f.chapter] || 0) + 1
console.log(`${flags.length} flags (${flags.filter(f => f.inDialogue).length} dialogue, ${flags.filter(f => !f.unique).length} non-unique) across ${Object.keys(perChap).length} chapters -> ${wrote} page files`)
