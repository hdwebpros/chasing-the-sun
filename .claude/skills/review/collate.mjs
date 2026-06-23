#!/usr/bin/env node
// collate.mjs — merge every per-lens scanner output (.deai/review/<unit>__<lensId>.json)
// into .deai/review.json as deduped CARDS.
//
// DRY rule (the important one): findings whose edits touch OVERLAPPING text in the
// manuscript collapse into ONE card — even when the lenses anchored different span
// boundaries. (The old version keyed on the exact `original` string, so the same
// sentence flagged with a one-word span vs. a whole-paragraph span became two cards
// that then contradicted each other — one cutting a line the other rewrote.)
//
// How it works: every `original` is a verbatim substring of the unit text, so we locate
// its char span, union overlapping spans, and take the covering manuscript slice as the
// card's canonical `original`. Each distinct proposed edit is recomputed against that
// canonical span and stored as an OPTION (with the lens(es) + reason behind it). One
// option → a single redline. Two or more conflicting options → the page makes the author
// PICK one before queueing. Diagnostic only: writes a cache file, never Drive.
//
//   node .claude/skills/review/collate.mjs

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

const root = process.cwd()
const reviewDir = join(root, '.deai', 'review')
const outPath = join(root, '.deai', 'review.json')

await mkdir(reviewDir, { recursive: true })

let files = []
try { files = (await readdir(reviewDir)).filter(f => f.endsWith('.json')) } catch { /* empty */ }

const raw = []
const units = new Set()
const unitText = new Map() // unit -> staged text (authority for span math)
const skipped = []

for (const f of files.sort()) {
  let doc
  try { doc = JSON.parse(await readFile(join(reviewDir, f), 'utf8')) } catch (e) { skipped.push(`${f}: unreadable (${e.message})`); continue }
  if (!doc || !Array.isArray(doc.findings)) { skipped.push(`${f}: no findings[]`); continue }
  if (doc.unit) units.add(doc.unit)
  for (const x of doc.findings) {
    // Stamp each finding with its source file's unit. Without this, a multi-unit run
    // defaults every finding to the FIRST unit (alphabetically ch09), so ch10 findings
    // are located against ch09 text, fail, and fall back to group-by-exact-string —
    // which stops overlapping same-sentence edits from merging (garbled stacked fixes)
    // and destabilizes card ids. Per-finding unit keeps each card scoped to its own text.
    x.unit ??= doc.unit
    x.lens ??= doc.lens; x.lensId ??= doc.lensId; x.lensFile ??= doc.lensFile
    raw.push(x)
  }
}
// Span authority for the merge engine: the staged per-unit slice if one exists, else
// the full synced manuscript (.deai/manuscript.txt). Nothing in the run writes the
// <unit>-unit.txt file, so without this fallback every `original` failed to locate, the
// overlap-merge never ran, and two lenses hitting the same sentence produced two
// separate, contradictory cards. The manuscript is always present after sync.sh.
let manuscript = ''
try { manuscript = await readFile(join(root, '.deai', 'manuscript.txt'), 'utf8') } catch { /* no synced cache */ }
for (const u of units) {
  try { unitText.set(u, await readFile(join(reviewDir, `${u}-unit.txt`), 'utf8')) }
  catch { if (manuscript) unitText.set(u, manuscript) }
}

const sevRank = { high: 0, mid: 1, low: 2 }
const hash = (s) => { let h = 5381; for (let i = 0; i < s.length; i++) h = (((h << 5) + h) ^ s.charCodeAt(i)) >>> 0; return h.toString(36) }
const isEditF = (f) => f.original != null && f.edited != null
const reasonOf = (f) => ({
  lensId: f.lensId, lens: f.lens, principle: f.principle, why: f.why,
  source: f.source, severity: f.severity, confidence: f.confidence ?? null, route: f.route,
  intent: f.intent === 'enhance' ? 'enhance' : 'fix',
})
const cardIntent = (rs) => rs.some(r => r.intent === 'enhance') ? 'enhance' : 'fix'
const mostSevere = (rs) => rs.map(r => r.severity).sort((a, b) => (sevRank[a] ?? 9) - (sevRank[b] ?? 9))[0]
const majorityRoute = (rs) => {
  const t = {}; for (const r of rs) t[r.route] = (t[r.route] || 0) + 1
  return Object.entries(t).sort((a, b) => b[1] - a[1] || (a[0] === 'manual' ? 1 : -1))[0][0]
}
const firstDefined = (fs, k) => fs.find(f => f[k] != null)?.[k] ?? null

// Locate a quote's span in the unit text. Handles an ellipsis ("A … B") by
// spanning from the first fragment's start to the last fragment's end, so an
// illustration that elides the middle still resolves to the real region it touches.
const locateSpan = (text, quote) => {
  if (!text || !quote) return null
  const q = quote.trim()
  let i = text.indexOf(q)
  if (i !== -1) return [i, i + q.length]
  const parts = q.split(/\s*(?:…|\.\.\.)\s*/).map(s => s.trim()).filter(Boolean)
  if (parts.length >= 2) {
    const a = text.indexOf(parts[0])
    const b = a === -1 ? -1 : text.indexOf(parts[parts.length - 1], a + parts[0].length)
    if (a !== -1 && b !== -1) return [a, b + parts[parts.length - 1].length]
  }
  return null
}
// The text region a structural action actually touches: its anchor PLUS every
// span its illustration quotes (the fix often lives away from the problem anchor).
const actionSpans = (fs, text) => {
  const spans = []
  const add = (q) => { const s = locateSpan(text, q); if (s) spans.push(s) }
  for (const f of fs) {
    if (f.anchor) add(f.anchor)
    const re = /[“"]([^”"]+)[”"]/g
    let m; while ((m = re.exec(f.illustration || ''))) add(m[1])
  }
  return spans
}

// ---- locate each edit finding's char span in its unit text --------------------
// Contract guard: a `line`-scope finding MUST carry original+edited (a redline).
// One that ships only an `action` is malformed — a scanner wrote an instruction
// ("cut 'very'") where it owed a before/after, so the card renders with no context.
// Surface these loudly so the scanner output gets fixed, not silently demoted.
const malformed = raw.filter(f => f.scope === 'line' && !isEditF(f))
const editFs = raw.filter(isEditF)
const actionFs = raw.filter(f => !isEditF(f))
const located = [] // { f, unit, start, end }
const unlocated = []
for (const f of editFs) {
  const text = unitText.get(f.unit ?? [...units][0])
  const start = text ? text.indexOf(f.original) : -1
  if (start === -1) { unlocated.push(f); continue }
  if (text.indexOf(f.original, start + 1) !== -1) skipped.push(`${f.lensId}/${f.id}: original occurs >1x in unit — span may be wrong`)
  located.push({ f, unit: f.unit ?? [...units][0], start, end: start + f.original.length })
}

// ---- union overlapping spans (within a unit) into components ------------------
located.sort((a, b) => a.unit < b.unit ? -1 : a.unit > b.unit ? 1 : a.start - b.start)
const components = []
for (const item of located) {
  const open = components[components.length - 1]
  // overlap OR touch (adjacent spans on the same sentence cluster) merge
  if (open && open.unit === item.unit && item.start <= open.end) {
    open.items.push(item); open.end = Math.max(open.end, item.end)
  } else {
    components.push({ unit: item.unit, start: item.start, end: item.end, items: [item] })
  }
}

const cards = []

for (const comp of components) {
  const text = unitText.get(comp.unit)
  const canonical = text.slice(comp.start, comp.end)
  // recompute each finding's edit against the canonical covering span
  const optionMap = new Map() // fullEdited -> { edited, reasons[], lensIds:Set }
  const allReasons = []
  for (const { f, start, end } of comp.items) {
    const fullEdited = canonical.slice(0, start - comp.start) + f.edited + canonical.slice(end - comp.start)
    const r = reasonOf(f)
    allReasons.push(r)
    if (!optionMap.has(fullEdited)) optionMap.set(fullEdited, { edited: fullEdited, reasons: [], lensIds: new Set() })
    const o = optionMap.get(fullEdited)
    o.reasons.push(r); o.lensIds.add(f.lensId)
  }
  const options = [...optionMap.values()]
    .map(o => ({ edited: o.edited, lensIds: [...o.lensIds], reasons: o.reasons }))
    .sort((a, b) => b.reasons.length - a.reasons.length)
  const fs = comp.items.map(i => i.f)
  const card = {
    id: 'card-' + hash(comp.unit + ':' + canonical),
    kind: 'edit',
    page: firstDefined(fs, 'page'),
    chapter: firstDefined(fs, 'chapter'),
    lensIds: [...new Set(allReasons.map(r => r.lensId))],
    severity: mostSevere(allReasons),
    route: majorityRoute(allReasons),
    intent: cardIntent(allReasons),  // 'enhance' if any lens proposed an enhancement
    original: canonical,
    options,                       // 1 = single redline; >1 = author must pick
    reasons: allReasons,           // every lens's reason, stacked
  }
  comp.card = card                 // so an overlapping structural action can fold into it
  cards.push(card)
}

// findings whose original wasn't found verbatim — keep them, grouped by exact original
const byExact = new Map()
for (const f of unlocated) {
  const k = (f.original || '').replace(/\s+/g, ' ').trim()
  if (!byExact.has(k)) byExact.set(k, [])
  byExact.get(k).push(f)
}
for (const [, fs] of byExact) {
  const reasons = fs.map(reasonOf)
  const edits = [...new Set(fs.map(f => f.edited))]
  cards.push({
    id: 'card-' + hash('X:' + (fs[0].original || '')),
    kind: 'edit', page: firstDefined(fs, 'page'), chapter: firstDefined(fs, 'chapter'),
    lensIds: [...new Set(reasons.map(r => r.lensId))],
    severity: mostSevere(reasons), route: majorityRoute(reasons), intent: cardIntent(reasons),
    original: fs[0].original,
    options: edits.map(e => ({ edited: e, lensIds: fs.filter(f => f.edited === e).map(f => f.lensId), reasons: fs.filter(f => f.edited === e).map(reasonOf) })),
    reasons, unlocated: true,
  })
}

// ---- structural actions (no single-sentence diff) ----------------------------
// Drop no-op "findings" — a scanner saying "leave as-is" / "keep" is not a finding.
const noop = /^\s*(leave|keep|retain|no change|as[- ]is|don.?t change|consistent)\b/i
const noopActions = []
const actionGroups = new Map()
for (const f of actionFs) {
  if (noop.test(f.action || '')) { noopActions.push(`${f.lensId}/${f.id}: "${(f.action||'').slice(0,40)}"`); continue }
  const k = (f.anchor || f.action || f.id || '').replace(/\s+/g, ' ').trim()
  if (!actionGroups.has(k)) actionGroups.set(k, [])
  actionGroups.get(k).push(f)
}
const suppressedActions = []
for (const [, fs] of actionGroups) {
  // A structural action is redundant when a concrete line-edit already covers the
  // text it would change — show the redline, not the homework. Test the action's
  // fix region (anchor + illustration quotes) against the located edit components;
  // on overlap, fold the action's rationale into that edit card and drop the action.
  const unit = fs[0].unit ?? [...units][0]
  const text = unitText.get(unit)
  const spans = actionSpans(fs, text)
  const hit = spans.length && components.find(c =>
    c.card && c.unit === unit && spans.some(([s, e]) => s < c.end && e > c.start))
  if (hit) {
    for (const r of fs.map(reasonOf)) hit.card.reasons.push(r)
    hit.card.lensIds = [...new Set(hit.card.reasons.map(r => r.lensId))]
    hit.card.severity = mostSevere(hit.card.reasons)
    hit.card.route = majorityRoute(hit.card.reasons)
    suppressedActions.push(`${fs[0].lensId}/${fs[0].id}: action folded into overlapping line-edit card (no homework)`)
    continue
  }
  const reasons = fs.map(reasonOf)
  const acts = [...new Set(fs.map(f => f.action).filter(Boolean))]
  cards.push({
    id: 'card-' + hash('A:' + (fs[0].anchor || fs[0].action || fs[0].id)),
    kind: 'action', page: firstDefined(fs, 'page'), chapter: firstDefined(fs, 'chapter'),
    lensIds: [...new Set(reasons.map(r => r.lensId))],
    severity: mostSevere(reasons), route: majorityRoute(reasons), intent: cardIntent(reasons),
    action: fs[0].action, actions: acts.length > 1 ? acts : null,
    illustration: firstDefined(fs, 'illustration'), // concrete "what this looks like", if the scanner gave one
    anchor: firstDefined(fs, 'anchor'), // manuscript locator so the page can show WHERE this lands (structural findings have no redline)
    reasons,
  })
}

// ---- HARD GUARD: a suggested fix may never INTRODUCE a same-opener triad ----------
// House rule (RYAN-HOUSE-STYLE): no 3 consecutive sentences may start with the same
// word. The scanner contract forbids it, but enforce it in code so a stray suggestion
// can never reach the author. We drop any option whose `edited` creates a 3+ run of
// same-first-word sentences that wasn't already in the card's `original`. If that
// empties an edit card, the card is dropped (it was a bad suggestion, not a finding).
const firstWord = (s) => (s.match(/^\s*["“'‘(]*([A-Za-z]+)/) || [, ''])[1].toLowerCase()
// max consecutive-same-opener run PER WORD, so a pre-existing run of one word
// ("The…The…The") can't mask a newly-introduced run of another ("He…He…He").
const runsByWord = (text) => {
  const sents = (text || '').split(/(?<=[.!?])["”']?\s+/).map(firstWord).filter(Boolean)
  const max = new Map(); let run = 0, prev = null
  for (const w of sents) {
    run = (w === prev) ? run + 1 : 1; prev = w
    if (run > (max.get(w) || 0)) max.set(w, run)
  }
  return max
}
const introducesTriad = (original, edited) => {
  const before = runsByWord(original), after = runsByWord(edited)
  for (const [w, r] of after) if (r >= 3 && (before.get(w) || 0) < 3) return true
  return false
}
const droppedTriadOptions = []
const droppedTriadCards = []
for (let i = cards.length - 1; i >= 0; i--) {
  const c = cards[i]
  if (!c.options) continue
  const kept = c.options.filter((o) => {
    if (introducesTriad(c.original, o.edited)) {
      droppedTriadOptions.push(`${(o.lensIds || []).join('+') || '?'}: same-opener triad in suggested fix`)
      return false
    }
    return true
  })
  if (kept.length === c.options.length) continue
  if (kept.length === 0) {
    droppedTriadCards.push(`${c.id} (${c.lensIds.join('+')}) p${c.page ?? '?'} — only fix introduced a triad`)
    cards.splice(i, 1)
    continue
  }
  c.options = kept
  c.reasons = kept.flatMap((o) => o.reasons || [])
  c.lensIds = [...new Set(c.reasons.map((r) => r.lensId))]
}

cards.sort((a, b) =>
  (sevRank[a.severity] ?? 9) - (sevRank[b.severity] ?? 9) ||
  (a.page ?? 1e9) - (b.page ?? 1e9))

const tally = (arr, key) => arr.reduce((m, x) => { const k = x[key] ?? 'unknown'; m[k] = (m[k] || 0) + 1; return m }, {})
const lensIdCounts = {}
for (const c of cards) for (const id of c.lensIds) lensIdCounts[id] = (lensIdCounts[id] || 0) + 1
const multiOption = cards.filter(c => (c.options?.length ?? 0) > 1).length

const out = {
  generatedAt: process.env.SOURCE_DATE_EPOCH ? new Date(+process.env.SOURCE_DATE_EPOCH * 1000).toISOString() : new Date().toISOString(),
  units: [...units].sort(),
  totalFindings: raw.length,
  totalCards: cards.length,
  severityCounts: tally(cards, 'severity'),
  routeCounts: tally(cards, 'route'),
  kindCounts: tally(cards, 'kind'),
  lensIdCounts,
  findings: cards, // the API/page/CLI all read `findings` — these are merged cards
}

await writeFile(outPath, JSON.stringify(out, null, 2) + '\n', 'utf8')

const sev = out.severityCounts
console.log(
  `collated ${raw.length} findings → ${cards.length} cards (${raw.length - cards.length} merged, ${multiOption} with competing options) from ${files.length} lens files` +
  ` across ${out.units.length} unit(s) → .deai/review.json\n` +
  `  severity: ${sev.high || 0} high · ${sev.mid || 0} mid · ${sev.low || 0} low\n` +
  `  kinds: ${Object.entries(out.kindCounts).map(([k, v]) => `${k} ${v}`).join(' · ')}\n` +
  `  routes: ${Object.entries(out.routeCounts).map(([k, v]) => `${k} ${v}`).join(' · ') || 'none'}`,
)
if (malformed.length) console.warn(`  ⚠ ${malformed.length} MALFORMED line-scope finding(s) (action but no redline — fix the scanner output):\n    ` + malformed.map(f => `${f.lensId}/${f.id}: "${(f.action || '').slice(0, 50)}"`).join('\n    '))
if (noopActions.length) console.warn(`  ${noopActions.length} no-op "leave as-is" finding(s) dropped:\n    ` + noopActions.join('\n    '))
if (suppressedActions.length) console.warn(`  ${suppressedActions.length} structural action(s) folded into concrete edits:\n    ` + suppressedActions.join('\n    '))
if (droppedTriadOptions.length) console.warn(`  ⚠ ${droppedTriadOptions.length} suggested fix(es) DROPPED — introduced a same-opener triad (house rule):\n    ` + droppedTriadOptions.join('\n    '))
if (droppedTriadCards.length) console.warn(`  ⚠ ${droppedTriadCards.length} card(s) dropped entirely (only fix was a triad):\n    ` + droppedTriadCards.join('\n    '))
if (unlocated.length) console.warn(`  ${unlocated.length} finding(s) not found verbatim in unit text (kept, grouped by exact original)`)
if (skipped.length) console.warn('  notes:\n    ' + skipped.join('\n    '))
