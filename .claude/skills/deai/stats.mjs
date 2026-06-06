#!/usr/bin/env node
// Deterministic, model-free detectability signal for ONE page.
// NOT a language model — no true perplexity. It's a stylometric proxy: the
// statistical fingerprints raw/lightly-edited AI prose leaves behind. Output is
// JSON: per-metric values + a composite detect score 0-10 (higher = more AI-like).
//
//   node stats.mjs page.txt            -> JSON
//   ./pages.sh ms.txt 7 | node stats.mjs   -> JSON (reads stdin)
//
// Independent of VOICE.md on purpose: this is the generic detector axis. The
// author's idiosyncrasies are handled by the separate voice score, not here.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))

let _lexicon = null
function lexicon() {
  if (_lexicon) return _lexicon
  try {
    _lexicon = readFileSync(join(here, 'ai-phrases.txt'), 'utf8').split('\n')
      .map(l => l.replace(/#.*$/, '').trim().toLowerCase()).filter(Boolean)
  } catch { _lexicon = [] }
  return _lexicon
}

// Deterministic detect analysis for one page of text. Pure — no I/O except the
// cached lexicon. Returns the full metric object incl. composite `detect` 0-10.
export function analyze(src) {
  const text = src.replace(/\r/g, '')
  const words = (text.toLowerCase().match(/[a-z][a-z'']*/g) || [])
const W = words.length
const sentences = text.split(/[.!?]+(?:\s|$)/).map(s => s.trim()).filter(s => /\w/.test(s))

// --- sentence-length burstiness ---
const lens = sentences.map(s => (s.match(/[a-z][a-z'']*/gi) || []).length).filter(n => n > 0)
const mean = lens.reduce((a, b) => a + b, 0) / (lens.length || 1)
const variance = lens.reduce((a, b) => a + (b - mean) ** 2, 0) / (lens.length || 1)
const sd = Math.sqrt(variance)
const burstiness = mean > 0 ? sd / mean : 0          // >=0.45 healthy/human

// --- sentence-opener variety ---
let maxRun = 0, run = 0, prev = null
const openers = {}
for (const s of sentences) {
  const first = (s.match(/[a-z][a-z'']*/i) || [''])[0].toLowerCase()
  openers[first] = (openers[first] || 0) + 1
  run = first && first === prev ? run + 1 : 1
  if (run > maxRun) maxRun = run
  prev = first
}
const openerUniqueRatio = sentences.length ? Object.keys(openers).length / sentences.length : 1

// --- lexical diversity ---
const freq = {}
for (const w of words) freq[w] = (freq[w] || 0) + 1
const types = Object.keys(freq).length
const ttr = W ? types / W : 1                         // type-token ratio
const hapax = Object.values(freq).filter(c => c === 1).length
const hapaxRatio = types ? hapax / types : 1

// --- punctuation profile (per 1000 words) ---
const per1k = n => W ? +(n / W * 1000).toFixed(1) : 0
const emDash = (text.match(/—|--/g) || []).length
const semicolon = (text.match(/;/g) || []).length
const colon = (text.match(/(?<!\d):(?!\d)/g) || []).length
const paren = (text.match(/\([^)]*\)/g) || []).length

// --- n-gram repetition (trigrams repeated) ---
const trigrams = {}
for (let i = 0; i + 2 < words.length; i++) {
  const g = words[i] + ' ' + words[i + 1] + ' ' + words[i + 2]
  trigrams[g] = (trigrams[g] || 0) + 1
}
const repeatedTrigrams = Object.entries(trigrams).filter(([, c]) => c > 1)
  .sort((a, b) => b[1] - a[1]).slice(0, 5).map(([g, c]) => ({ g, c }))

// --- AI-phrase lexicon hits ---
const low = ' ' + text.toLowerCase().replace(/[^a-z' ]+/g, ' ').replace(/\s+/g, ' ') + ' '
const aiHits = []
for (const p of lexicon()) {
  const needle = ' ' + p + ' '
  let i = 0, c = 0
  while ((i = low.indexOf(needle, i)) !== -1) { c++; i += needle.length - 1 }
  if (c) aiHits.push({ p, c })
}
const aiHitCount = aiHits.reduce((a, h) => a + h.c, 0)

// --- composite detect score 0-10 (documented, tunable weights) ---
const clamp = (x, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x))
const sig = {
  burst: clamp((0.45 - burstiness) / 0.45) * 3.0,     // low variation = AI-like (max 3.0)
  opener: clamp((maxRun - 2) / 4) * 1.5,              // repeated openers (max 1.5)
  ttr: clamp((0.42 - ttr) / 0.15) * 1.5,              // low diversity (max 1.5)
  emdash: clamp((per1k(emDash) - 8) / 12) * 1.0,      // dense em-dashes (max 1.0)
  lexicon: clamp(aiHitCount / 4) * 2.5,               // AI-phrase hits (max 2.5)
  ngram: clamp((repeatedTrigrams.length - 1) / 4) * 0.5, // repeated trigrams (max 0.5)
}
const detect = +Object.values(sig).reduce((a, b) => a + b, 0).toFixed(1)

  return {
    words: W,
    sentences: sentences.length,
    meanSentenceLen: +mean.toFixed(1),
    burstiness: +burstiness.toFixed(2),
    openerMaxRun: maxRun,
    openerUniqueRatio: +openerUniqueRatio.toFixed(2),
    ttr: +ttr.toFixed(2),
    hapaxRatio: +hapaxRatio.toFixed(2),
    punctPer1k: { emDash: per1k(emDash), semicolon: per1k(semicolon), colon: per1k(colon), paren: per1k(paren) },
    repeatedTrigrams,
    aiPhraseHits: aiHits,
    detect,                  // 0-10, higher = more statistically AI-like
    contributions: Object.fromEntries(Object.entries(sig).map(([k, v]) => [k, +v.toFixed(2)])),
  }
}

// CLI: node stats.mjs page.txt  |  ./pages.sh ms.txt 7 | node stats.mjs
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const src = process.argv[2] && process.argv[2] !== '-'
    ? readFileSync(process.argv[2], 'utf8')
    : readFileSync(0, 'utf8')
  process.stdout.write(JSON.stringify(analyze(src), null, 2) + '\n')
}
