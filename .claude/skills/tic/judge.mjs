#!/usr/bin/env node
// Fold the voice-aware judgment into the tic caches. The negation fragment is HALF
// the author's signature (VOICE.md: concrete-landing reversal = his; abstract-dissolve
// = the tic), so a model pass classifies each unit and — only for abstract-dissolve
// units — authors in-voice `vary`/`merge` rewrites. This merges that judgment in.
//
//   node judge.mjs judgments.json     # apply a judgments file
//   cat judgments.json | node judge.mjs    # or from stdin
//
// judgments shape — keyed by flag id:
//   { "p180-t1": { "voiceClass": "abstract", "severity": 8,
//                  "vary": "She did not look back. She already knew what she'd see.",
//                  "merge": "She did not look back, knowing what she would see." },
//     "p17-t2":  { "voiceClass": "concrete" } }     // concrete -> keep, no rewrites
//
// SAFETY: only voiceClass / detect(severity) / alts.{vary,merge} are written. The
// author's decision + editText are NEVER touched — re-judging a decided page is safe.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const deai = join(here, '..', '..', '..', '.deai')
const arg = process.argv[2]
const raw = arg ? readFileSync(arg, 'utf8') : readFileSync(0, 'utf8')
const judgments = JSON.parse(raw)

const files = readdirSync(deai).filter(f => /^tic-page-\d+\.json$/.test(f))
let touched = 0, pages = 0, missing = new Set(Object.keys(judgments))
for (const file of files) {
  const path = join(deai, file)
  const doc = JSON.parse(readFileSync(path, 'utf8'))
  let changed = false
  for (const f of doc.flags || []) {
    const j = judgments[f.id]
    if (!j) continue
    missing.delete(f.id)
    if (j.voiceClass) f.voiceClass = j.voiceClass
    if (typeof j.severity === 'number') f.detect = Math.max(0, Math.min(10, j.severity))
    f.alts ||= {}
    if ('vary' in j) f.alts.vary = j.vary ?? null
    if ('merge' in j) f.alts.merge = j.merge ?? null
    touched++; changed = true
  }
  if (changed) { writeFileSync(path, JSON.stringify(doc, null, 2) + '\n'); pages++ }
}
console.log(`judged ${touched} flag(s) across ${pages} page(s)`)
if (missing.size) console.log(`⚠ ${missing.size} judgment id(s) not found in caches: ${[...missing].join(', ')}`)
