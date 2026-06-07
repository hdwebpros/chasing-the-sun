#!/usr/bin/env node
// Deterministic detector for the negation-correction fragment tic. Unlike de-AI
// (model-judged), this tell is a concrete syntactic shape, so detection is a grep:
// complete coverage, zero hallucination, free. The MODEL's only job is later —
// proposing in-voice `vary`/`merge` rewrites for the instances the author marks to
// change (see suggest.mjs). This script just enumerates + writes the page caches.
//
//   node detect.mjs           # scan .deai/manuscript.txt -> .deai/tic-page-NN.json
//   node detect.mjs --dry     # print summary, write nothing
//
// SPAN = the whole unit ("Prev sentence. Not X. Just Y."), never the bare fragment,
// so every replacement (keep/cut/merge/vary/edit) is a clean full-sentence swap with
// no double-space seam. The free `cut` candidate is just the prior sentence alone.
//
// SAFETY (mirrors deai): never overwrite a tic-page-NN.json that already holds
// decisions — a direct write destroys the author's keep/cut/edit calls and .deai is
// gitignored (unrecoverable). If a page cache exists, this writes tic-rescan-NN.json
// instead; run merge-rescan.mjs --tic NN to fold fresh flags in without clobbering.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..', '..', '..')
const deai = join(root, '.deai')
const DRY = process.argv.includes('--dry')

const PAGE_SIZE = 400
const raw = readFileSync(join(deai, 'manuscript.txt'), 'utf8')
const lines = raw.split('\n')

// paragraph line -> page number (mirror of pages.sh / server/utils/deai.ts)
const pageOf = []
{ let p = 1, n = 0
  for (let i = 0; i < lines.length; i++) {
    pageOf[i] = p
    n += lines[i].trim() === '' ? 0 : lines[i].split(/\s+/).filter(Boolean).length
    if (n >= PAGE_SIZE) { p++; n = 0 }
  } }

const CLOSE = `["”’')]*`                         // optional closing quote/paren after a terminator
const TERM = `[.!?…]${CLOSE}`
// A sentence-initial short "Not …" fragment (the tic). \bNot\b excludes Nothing/Note/Notice.
const FRAG = new RegExp(`Not\\b[^.!?…]*${TERM}`, 'y')
// Second-beat followers that belong to the same unit.
const CORRECTION = /^(Just|Only|Merely|Simply|Because|Still)\b/   // -> two-beat
const REPEAT = /^Not\b/                                            // -> anaphora

const flags = []   // {page, tell, inDialogue, span, prev, frag, cut, cluster}

for (let li = 0; li < lines.length; li++) {
  const para = lines[li]
  if (!para.trim()) continue

  // Walk sentence boundaries within the paragraph, tracking exact offsets so spans
  // are verbatim (curly quotes + whitespace intact) for find/replace + UI highlight.
  const boundRe = new RegExp(TERM, 'g')
  const starts = [0]
  let m
  while ((m = boundRe.exec(para))) {
    let e = m.index + m[0].length
    while (e < para.length && para[e] === ' ') e++   // sentence starts after the space(s)
    if (e < para.length) starts.push(e)
  }

  for (let si = 0; si < starts.length; si++) {
    const s0 = starts[si]
    FRAG.lastIndex = s0
    const fm = FRAG.exec(para)
    if (!fm || fm.index !== s0) continue
    const words = fm[0].trim().split(/\s+/).filter(Boolean).length
    if (words > 9) continue                          // long "Not …" lines are real clauses, not the tic

    // extend right across same-unit followers (Just/Because… = two-beat; Not… = anaphora)
    let end = s0 + fm[0].length
    let tell = 'neg-single'
    let sj = si + 1
    while (sj < starts.length) {
      const nextText = para.slice(starts[sj])
      const nf = nextText.match(new RegExp(`^[^.!?…]*${TERM}`))
      if (!nf) break
      const nextSent = nf[0]
      if (REPEAT.test(nextSent) && nextSent.trim().split(/\s+/).length <= 9) {
        tell = 'neg-anaphora'; end = starts[sj] + nextSent.length; sj++; continue
      }
      if (CORRECTION.test(nextSent)) {
        if (tell !== 'neg-anaphora') tell = 'neg-twobeat'
        end = starts[sj] + nextSent.length; sj++; continue
      }
      break
    }

    // prev sentence (same paragraph) becomes part of the unit + the free cut candidate
    const prevStart = si > 0 ? starts[si - 1] : s0
    const prevRaw = para.slice(prevStart, s0).replace(/\s+$/, '')
    const span = para.slice(prevStart, end)
    const inDialogue = /[“”]/.test(span)             // quote anywhere in the unit -> character voice

    // the sentence AFTER the negations — the concrete LANDING ("…the scrappy, stubborn
    // kind…") that distinguishes the author's signature reversal from the tic. Display +
    // voice-judgment context ONLY; NOT part of the replaceable span, so a cut/vary can
    // never silently delete a signature payoff.
    let after = ''
    if (sj < starts.length) {
      const am = para.slice(starts[sj]).match(new RegExp(`^[^.!?…]*${TERM}`))
      if (am) after = am[0]
    }

    flags.push({
      page: pageOf[li],
      tell,
      inDialogue,
      span,
      prev: prevRaw,
      frag: para.slice(s0, end),
      after,
      cut: prevRaw,                                  // grammar-safe deletion: prior sentence alone
    })

    si = sj - 1   // don't re-emit followers as their own flags (kills the "Not roses./Not lilies." double-count)
  }
}

// cluster heat: how many instances fall within ±4 pages of each (drives UI ranking)
for (const f of flags) f.cluster = flags.filter(g => Math.abs(g.page - f.page) <= 4).length

// ---- write per-page caches (schema-compatible with deai/brogue) ----------------
const byPage = {}
for (const f of flags) (byPage[f.page] ||= []).push(f)

let wrote = 0, rescans = 0
for (const [pageStr, pflags] of Object.entries(byPage)) {
  const page = Number(pageStr)
  const pad = String(page).padStart(2, '0')
  const pagePath = join(deai, `tic-page-${pad}.json`)
  const rescanPath = join(deai, `tic-rescan-${pad}.json`)

  const doc = {
    page,
    words: undefined,
    pageDetect: null,
    flags: pflags.map((f, i) => ({
      id: `p${page}-t${i + 1}`,
      tell: f.tell,
      span: f.span,
      context: f.prev ? `${f.prev}  ❯  ${f.frag}` : f.frag,
      after: f.after || '',                           // concrete landing (display + judgment context)
      inDialogue: f.inDialogue,
      cluster: f.cluster,
      voiceClass: null,                               // 'concrete' | 'abstract', filled by judge.mjs (model, per VOICE.md)
      voice: 0,
      detect: Math.min(10, f.cluster),              // cluster density -> UI heat only
      why: f.inDialogue
        ? 'Negation-correction shape inside dialogue — character voice; defaults to keep.'
        : `Negation-correction fragment (${f.tell.replace('neg-', '')}); ${f.cluster} within ±4pp.`,
      alts: { cut: f.cut, merge: null, vary: null },  // merge/vary filled by judge.mjs for abstract-dissolve units only
      fix: f.cut,                                      // placeholder; tic decisions apply via editText
      decision: 'pending',
    })),
  }

  if (DRY) continue
  // never clobber a cache that already has decisions
  if (existsSync(pagePath)) {
    const prev = JSON.parse(readFileSync(pagePath, 'utf8'))
    const hasDecisions = (prev.flags || []).some(f => f.decision && f.decision !== 'pending')
    if (hasDecisions) {
      writeFileSync(rescanPath, JSON.stringify(doc, null, 2) + '\n')
      rescans++; continue
    }
  }
  writeFileSync(pagePath, JSON.stringify(doc, null, 2) + '\n')
  wrote++
}

const t = { single: 0, twobeat: 0, anaphora: 0, dialogue: 0 }
for (const f of flags) { t[f.tell.replace('neg-', '') === 'twobeat' ? 'twobeat' : f.tell.replace('neg-', '')]++; if (f.inDialogue) t.dialogue++ }
console.log(`negation tic: ${flags.length} units  (single ${t.single} · two-beat ${t.twobeat} · anaphora ${t.anaphora} · of which dialogue ${t.dialogue})`)
if (!DRY) console.log(`wrote ${wrote} tic-page-NN.json` + (rescans ? `  ·  ${rescans} page(s) had decisions -> wrote tic-rescan-NN.json instead (run merge-rescan.mjs --tic NN)` : ''))
