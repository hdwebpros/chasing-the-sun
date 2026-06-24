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
//
// SAFETY: --apply never overwrites a flag the author has already decided
// (accept/reject/edit). It only writes voiceClass + alts.recast on still-pending flags.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

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
    if (byPage === null && doc.chapter !== sel) continue
    for (const f of doc.flags || []) {
      if (f.decision && f.decision !== 'pending') continue           // author already ruled
      if (f.code === 'D' || f.code === 'F') continue                 // parked
      const r = (runs[f.runId] ||= { runId: f.runId, page: doc.page, chapter: doc.chapter, runCodes: f.runCodes, context: f.context, rows: [] })
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

const ai = args.indexOf('--apply')
const ei = args.indexOf('--emit')
if (ai !== -1 && args[ai + 1]) apply(args[ai + 1])
else if (ei !== -1 && args[ei + 1]) emit(args[ei + 1])
else { console.error('usage: judge.mjs --emit "<chapter>"|pNN   |   judge.mjs --apply <judgments.json>'); process.exit(2) }
