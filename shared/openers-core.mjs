// Shared sentence-OPENER classifier — the ONE deterministic implementation, imported by
// both `.claude/skills/openers/classify.mjs` (the batch measurement) and `app/pages/openers.vue`
// (the live "after optimization" mix in the chapter view). Keeping it in one place means the
// projected mix the author sees can never drift from what a re-classify would produce.
// Pure JS — no node builtins — so it bundles into the client untouched.

const CONJ = new Set(['and', 'but', 'yet', 'so', 'or', 'nor'])
const SUBORD = new Set(['when', 'while', 'as', 'because', 'if', 'although', 'though', 'since',
  'after', 'before', 'until', 'unless', 'whenever', 'wherever', 'where', 'once', 'whereas',
  'whether', 'lest', 'provided'])
const PREP = new Set(['in', 'on', 'at', 'by', 'with', 'from', 'into', 'onto', 'over', 'under',
  'above', 'below', 'beneath', 'beyond', 'behind', 'beside', 'between', 'among', 'amid', 'amidst',
  'across', 'through', 'throughout', 'toward', 'towards', 'against', 'around', 'near', 'past',
  'during', 'within', 'without', 'outside', 'inside', 'upon', 'along', 'off', 'of', 'to', 'for'])
// temporal / sequence adverbs that frequently open a sentence (non -ly)
const ADV = new Set(['then', 'now', 'soon', 'later', 'suddenly', 'finally', 'again', 'once',
  'afterward', 'afterwards', 'meanwhile', 'eventually', 'already', 'still', 'today', 'tonight',
  'tomorrow', 'yesterday', 'someday', 'always', 'never', 'sometimes', 'often', 'instead',
  'outside', 'inside', 'overhead', 'nearby', 'everywhere', 'somewhere', 'together', 'slowly',
  'quietly', 'quickly', 'carefully', 'gently'])
const NEG = new Set(['not', 'just', 'only', 'merely', 'simply', 'no', 'never'])

export const words = s => (s.match(/\S+/g) || [])
export const clean = w => (w || '').toLowerCase().replace(/^[“”"‘’'(\[\-—–]+/, '').replace(/[.,!?;:“”"‘’')\]]+$/g, '')

// crude finite-verb probe: helps tell a fragment (F) from a real subject-led clause (S)
const VERBISH = /\b(is|are|was|were|be|been|being|am|has|have|had|do|does|did|will|would|can|could|shall|should|may|might|must|went|came|sat|stood|walked|looked|knew|said|felt|took|kept|made|saw|told|held|ran|put|gave|got|set|left|turned|watched|pulled|moved|read|spoke|rose|filled|stirred|bought|pressed|scrubbed|wore|noticed|reached|closed|opened|worked|carried|climbed|swept|burned|drifted|crossed|gripped|appeared|trailed|stayed|hit|struck|tugged|pointed|smiled|softened|paused|exhaled|eased|performed|genuflected|prayed|continued|asked|nodded|shook|spilled|chased|pretended|pelted|trotted|survived|negotiate|shuddered|listened|hearing|thinking|rolling|loading|whitewash)\b/i

// classify ONE sentence into exactly one opener class. Returns { code, opener }.
export function classifyOpener(sent) {
  const ws = words(sent)
  const first = clean(ws[0])
  const open = ws.slice(0, 3).join(' ').replace(/[.,]$/, '')
  // D — dialogue / quoted line (quote at the very start)
  if (/^[“"]/.test(sent.trim())) return { code: 'D', opener: open }
  // F — the negation-correction signature beat, or a very short verbless fragment
  if (NEG.has(first) && ws.length <= 9) return { code: 'F', opener: open }
  if (ws.length <= 4 && !VERBISH.test(sent)) return { code: 'F', opener: open }
  // J — coordinating conjunction lead
  if (CONJ.has(first)) return { code: 'J', opener: open }
  // I — existential / inversion (There/Here + verb)
  if ((first === 'there' || first === 'here') && VERBISH.test(ws.slice(1, 4).join(' '))) return { code: 'I', opener: open }
  // C — subordinate clause (subordinator + a comma before the main clause within reach)
  if (SUBORD.has(first) && /,/.test(ws.slice(0, 12).join(' '))) return { code: 'C', opener: open }
  // P — prepositional phrase opener
  if (PREP.has(first)) return { code: 'P', opener: open }
  // G — participial / gerund phrase (ing/ed/en first word + a comma before the clause)
  if (/(?:ing|ed|en)$/.test(first) && /,/.test(ws.slice(0, 8).join(' '))) return { code: 'G', opener: open }
  // A — adverbial (-ly word or a known temporal/sequence adverb), comma optional
  if (first.endsWith('ly') || ADV.has(first)) return { code: 'A', opener: open }
  // S — bare subject-led (the default / the monoculture)
  return { code: 'S', opener: open }
}
