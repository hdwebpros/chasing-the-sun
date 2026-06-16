#!/usr/bin/env node
// Rank the next sentence-variety candidate paragraphs for the `variety` skill.
// Detects the THREE target tics and scores their severity, errand-prose first.
//   1. same-opener tic  (He/She run)        — highest weight
//   2. staccato          (stacked short fragments driving one thought)
//   3. triads            ("A, B, and C" + three matched one-word fragments)
// JUDGMENT (peak vs errand, keep vs fix) happens downstream against VOICE.md.
//
// Usage: node .claude/skills/variety/bin/next.mjs [N]
//   N = how many candidates to print (default 6)
// Skips anything recorded in .deai/variety-done.json (array of 40-char prefixes
// or {head} objects) so we never resurface a paragraph already worked.
import { readFileSync, existsSync } from 'node:fs'

const SRC = '.deai/manuscript.txt'
const DONE = '.deai/variety-done.json'
const N = parseInt(process.argv[2] || '6', 10)

if (!existsSync(SRC)) {
  console.error(`No ${SRC}. Run: bash .claude/skills/deai/sync.sh`)
  process.exit(1)
}
const lines = readFileSync(SRC, 'utf8').split('\n')

let done = []
if (existsSync(DONE)) {
  try {
    done = JSON.parse(readFileSync(DONE, 'utf8')).map(d => (typeof d === 'string' ? d : d.head))
  } catch { /* ignore malformed ledger */ }
}
const headRe = /^(PROLOGUE|EPILOGUE|INTERLUDE|PART [A-Z]+|Chapter [A-Za-z-]+)\s*$/
const wc = s => (s.match(/\S+/g) || []).length
const splitSentences = p => (p.match(/[^.!?]+[.!?]+(?=\s|$)|[^.!?]+$/g) || []).map(s => s.trim()).filter(Boolean)
const firstWord = s => s.replace(/^["“”'‘’\-\s]+/, '').split(/\s+/)[0]?.toLowerCase().replace(/[.,!?;:"“”'‘’]+$/, '') || ''
const triRe = /\b([\w'’-]+(?:\s+[\w'’-]+){0,3}),\s+([\w'’-]+(?:\s+[\w'’-]+){0,3}),\s+and\s+([\w'’-]+(?:\s+[\w'’-]+){0,3})\b/

const cands = []
lines.forEach((l, i) => {
  const t = l.trim()
  if (!t || headRe.test(t) || /^(CHASING THE SUN|A Novel|Based on|by Ryan)/.test(t)) return
  const ln = i + 1
  const head = t.slice(0, 40)
  if (done.includes(head)) return
  const ss = splitSentences(t)
  if (ss.length < 4) return

  // 1. same-opener tic: max consecutive same first word + dominant pronoun count
  const ops = ss.map(firstWord)
  let run = 1, maxRun = 1
  for (let k = 1; k < ops.length; k++) {
    if (ops[k] && ops[k] === ops[k - 1]) { run++; maxRun = Math.max(maxRun, run) } else run = 1
  }
  const counts = {}
  ops.forEach(o => { if (o) counts[o] = (counts[o] || 0) + 1 })
  const pron = ['he', 'she', 'they', 'it'].reduce((a, p) => Math.max(a, counts[p] || 0), 0)

  // 2. staccato: stacked short sentences (>=3 in a row each <=5 words)
  let frun = 0, maxFrun = 0
  for (const s of ss) { if (wc(s) <= 5) { frun++; maxFrun = Math.max(maxFrun, frun) } else frun = 0 }

  // 3. triads: comma triad OR three matched one-word fragments in a row
  let triad = triRe.test(t) ? 1 : 0
  for (let k = 0; k + 2 < ss.length; k++) {
    if (wc(ss[k]) <= 2 && wc(ss[k + 1]) <= 2 && wc(ss[k + 2]) <= 2) triad++
  }

  // weight: opener tic dominates, then staccato, then triad
  const openerScore = (maxRun >= 3 ? maxRun * 2 : 0) + (pron >= 3 ? pron : 0)
  const staccatoScore = maxFrun >= 3 ? maxFrun * 2 : 0
  const triadScore = triad * 3
  const score = openerScore + staccatoScore + triadScore
  if (score < 4) return

  cands.push({ ln, score, maxRun, pron, maxFrun, triad, sents: ss.length, text: t })
})

cands.sort((a, b) => b.score - a.score)
const top = cands.slice(0, N)
if (!top.length) { console.log('No candidates above threshold. (Re-sync? Or ledger is full.)'); process.exit(0) }
for (const c of top) {
  const tags = []
  if (c.maxRun >= 3 || c.pron >= 3) tags.push(`opener(run ${c.maxRun}, pron×${c.pron})`)
  if (c.maxFrun >= 3) tags.push(`staccato(${c.maxFrun} short in a row)`)
  if (c.triad) tags.push(`triad×${c.triad}`)
  console.log(`\n━━━ line ${c.ln}  ·  score ${c.score}  ·  ${tags.join(' + ')}`)
  console.log(c.text)
}
console.log(`\n(${cands.length} candidates total; showing ${top.length}. Mark done: append the 40-char head to ${DONE}.)`)
