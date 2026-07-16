#!/usr/bin/env node
/**
 * Word / bigram / craft-pattern frequency analysis.
 * Reads .deai/manuscript.txt only. Prints ranked tables — never dumps prose.
 *
 * Usage: node scripts/freq-analysis.mjs
 *        node scripts/freq-analysis.mjs --json > scratchpad/freq-report.json
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const MS_PATH = resolve(ROOT, '.deai/manuscript.txt')
const OUT_MD = resolve(ROOT, 'scratchpad/freq-report.md')
const OUT_JSON = resolve(ROOT, 'scratchpad/freq-report.json')

// ─── structural / exclude lists ───────────────────────────────────────────────

// High-frequency closed-class + light verbs that every English narrative needs.
const STRUCTURAL = new Set(`
  the a an and or but if as of to in on at by for with from into onto over under
  out up down off about through between among against during without within
  is are was were be been being am has have had do does did will would can could
  shall should may might must
  i me my mine myself we us our ours ourselves you your yours yourself yourselves
  he him his himself she her hers herself it its itself they them their theirs themselves
  this that these those there here then than so not no nor yet
  what which who whom whose when where why how
  all any each every either neither both some few many much more most other another
  such same own only just even still also too very rather quite
  one two three four five six seven eight nine ten
  first second third last next
  said asked
  mr mrs miss ms dr st
  chapter part one two three four five prologue epilogue interlude
  based novel true story
`.trim().split(/\s+/).map(s => s.toLowerCase()))

// Character / family / place / period proper nouns for THIS book (case-insensitive).
// Keep lean: anything that is structural content, not a stylistic tic.
const NAMES_PERIOD = new Set(`
  william mary lottie letitia boog hollis doyle rose george margaret teresa alex
  charlotte magdalen magdelan valentin travers moran masters
  dublin boston austin kansas oregon grants pass paul minnesota kansas city
  irish ireland america american english england london liverpool
  liffey charles river mississippi missouri
  street road avenue river church school mill railroad depot station
  catholic priest nun sister father mother daughter son wife husband
  dollar dollars cents acre acres deed deeds land lot lots
  eighteen nineteen twenty thirty forty fifty sixty seventy eighty ninety
  hundred thousand
  eighteen-seventies eighteen-eighties eighteen-nineties
  1870s 1880s 1890s 1900s 1910s 1920s
`.trim().split(/\s+/).map(s => s.toLowerCase().replace(/-/g, '')))

// Dialogue tags: verbs that attribute speech (beyond said/asked which we allow).
const TAG_VERBS = [
  'replied', 'answered', 'whispered', 'murmured', 'muttered', 'mumbled',
  'shouted', 'yelled', 'called', 'cried', 'exclaimed', 'snapped', 'hissed',
  'growled', 'barked', 'roared', 'bellowed', 'screamed', 'screeched',
  'added', 'continued', 'interjected', 'interrupted', 'insisted', 'protested',
  'admitted', 'confessed', 'declared', 'announced', 'observed', 'noted',
  'remarked', 'commented', 'suggested', 'offered', 'agreed', 'disagreed',
  'countered', 'retorted', 'shot', 'fired', 'began', 'started', 'finished',
  'concluded', 'repeated', 'echoed', 'breathed', 'sighed', 'laughed', 'chuckled',
  'giggled', 'sobbed', 'wept', 'pleaded', 'begged', 'demanded', 'ordered',
  'commanded', 'warned', 'threatened', 'promised', 'assured', 'explained',
  'told', 'inquired', 'queried', 'wondered', 'mused', 'reflected', 'reasoned',
  'lied', 'teased', 'joked', 'quipped', 'sneered', 'scoffed', 'scoffed',
  'corrected', 'reminded', 'urged', 'pressed', 'prompted', 'volunteered',
  'blurted', 'gasped', 'choked', 'croaked', 'rasped', 'drawled', 'intoned',
  'recited', 'quoted', 'read', 'wrote', 'scrawled',
]

// Body-language beats (lemmas / common past forms).
const BODY_BEATS = [
  'nodded', 'nod', 'nodding',
  'sighed', 'sigh', 'sighing',
  'turned', 'turn', 'turning',
  'shrugged', 'shrug', 'shrugging',
  'smiled', 'smile', 'smiling',
  'grinned', 'grin', 'grinning',
  'frowned', 'frown', 'frowning',
  'laughed', 'laugh', 'laughing',
  'chuckled', 'chuckle',
  'shook', 'shake', 'shaking', // head shakes often
  'paused', 'pause', 'pausing',
  'hesitated', 'hesitate',
  'looked', 'look', 'looking',
  'stared', 'stare', 'staring',
  'glanced', 'glance', 'glancing',
  'gazed', 'gaze', 'gazing',
  'watched', 'watch', 'watching',
  'leaned', 'lean', 'leaning',
  'crossed', 'cross', 'crossing', // arms
  'folded', 'fold', 'folding',
  'clenched', 'clench',
  'gripped', 'grip', 'gripping',
  'rubbed', 'rub', 'rubbing',
  'wiped', 'wipe', 'wiping',
  'touched', 'touch', 'touching',
  'reached', 'reach', 'reaching',
  'pointed', 'point', 'pointing',
  'waved', 'wave', 'waving',
  'gestured', 'gesture',
  'blinked', 'blink',
  'winced', 'wince',
  'flinched', 'flinch',
  'tensed', 'tense',
  'relaxed', 'relax',
  'straightened', 'straighten',
  'settled', 'settle',
  'shifted', 'shift', 'shifting',
  'sat', 'sit', 'sitting',
  'stood', 'stand', 'standing',
  'walked', 'walk', 'walking',
  'stepped', 'step', 'stepping',
  'moved', 'move', 'moving',
  'hands', 'hand',
  'fingers', 'finger',
  'arms', 'arm',
  'shoulders', 'shoulder',
  'jaw', 'chin', 'brow', 'forehead',
  'eyes', 'eye',
  'lips', 'mouth',
  'breath', 'breathed', 'breathing', 'exhaled', 'inhaled',
]

// Filter / distancing words (perception & cognition veils).
const FILTERS = [
  'felt', 'feel', 'feeling', 'feels',
  'saw', 'see', 'seeing', 'sees', 'seen',
  'noticed', 'notice', 'noticing',
  'seemed', 'seem', 'seems', 'seeming',
  'realized', 'realize', 'realizing', 'realised', 'realise',
  'heard', 'hear', 'hearing', 'hears',
  'watched', 'watch', 'watching',
  'knew', 'know', 'knowing', 'knows',
  'thought', 'think', 'thinking', 'thinks',
  'wondered', 'wonder', 'wondering',
  'decided', 'decide', 'deciding',
  'remembered', 'remember', 'remembering',
  'appeared', 'appear', 'appears', 'appearing',
  'looked', // often filter: "looked like" / "looked as if"
  'could', // weak but high volume — report separately if needed
  'seemed',
]

// ─── helpers ──────────────────────────────────────────────────────────────────

function tokenize(text) {
  // words: letters + internal apostrophes (straight or curly)
  return (text.match(/[A-Za-z]+(?:['’][A-Za-z]+)?/g) || []).map(w =>
    w.toLowerCase().replace(/’/g, "'"),
  )
}

function splitSentences(text) {
  // Split on . ! ? while keeping rough sentence starts; strip pure headings later.
  // Also split on newlines that start a new paragraph (many MS lines are one sentence).
  const raw = text
    .replace(/\r\n/g, '\n')
    .split(/\n+/)
    .flatMap(para => {
      const p = para.trim()
      if (!p) return []
      // don't further-split very short heading-like lines
      if (/^(PROLOGUE|EPILOGUE|INTERLUDE|PART\b|Chapter\b|ACT\b)/i.test(p) && p.length < 60) {
        return []
      }
      // sentence split
      const parts = p.split(/(?<=[.!?…])\s+(?=["“‘'(A-Z])/)
      return parts.map(s => s.trim()).filter(Boolean)
    })
  return raw
}

function isDialogueStart(s) {
  return /^["“]/.test(s.trim())
}

function stripQuotes(s) {
  return s.replace(/^[\s"“”'‘’]+/, '').replace(/["“”'‘’]+$/, '')
}

function ratePer10k(count, words) {
  if (!words) return 0
  return (count / words) * 10000
}

function rankMap(map, limit = 50) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
}

function mdTable(headers, rows) {
  const head = `| ${headers.join(' | ')} |`
  const sep = `| ${headers.map(() => '---').join(' | ')} |`
  const body = rows.map(r => `| ${r.join(' | ')} |`).join('\n')
  return `${head}\n${sep}\n${body}`
}

function pctDelta(a, b) {
  if (a === 0 && b === 0) return '—'
  if (a === 0) return '+∞'
  const d = ((b - a) / a) * 100
  const sign = d > 0 ? '+' : ''
  return `${sign}${d.toFixed(0)}%`
}

// ─── core analysis on a text slice ────────────────────────────────────────────

function analyzeSlice(text, label) {
  const words = tokenize(text)
  const n = words.length
  const unigrams = new Map()
  const bigrams = new Map()
  for (let i = 0; i < words.length; i++) {
    unigrams.set(words[i], (unigrams.get(words[i]) || 0) + 1)
    if (i + 1 < words.length) {
      const bg = `${words[i]} ${words[i + 1]}`
      bigrams.set(bg, (bigrams.get(bg) || 0) + 1)
    }
  }

  // Flagged content words: ≥ 3 per 10k, not structural, not names/period
  const threshold = (3 / 10000) * n
  const flagged = []
  for (const [w, c] of unigrams) {
    if (c < threshold && c < 3) continue // absolute floor of 3 OR rate threshold
    const rate = ratePer10k(c, n)
    if (rate < 3) continue
    if (STRUCTURAL.has(w)) continue
    if (NAMES_PERIOD.has(w.replace(/'/g, ''))) continue
    // skip pure function leftovers
    if (w.length <= 2) continue
    flagged.push({ word: w, count: c, rate: +rate.toFixed(2) })
  }
  flagged.sort((a, b) => b.rate - a.rate || b.count - a.count)

  // Sentence openers
  const sents = splitSentences(text)
  const openers = new Map() // pattern key → count
  const openerRaw = new Map() // first two tokens lower → count
  let sentCount = 0
  let narrativeSent = 0
  for (const s of sents) {
    if (!s || s.length < 2) continue
    sentCount++
    if (isDialogueStart(s)) {
      openers.set('DIALOGUE', (openers.get('DIALOGUE') || 0) + 1)
      continue
    }
    narrativeSent++
    const toks = tokenize(stripQuotes(s))
    if (!toks.length) continue
    const w0 = toks[0]
    const w1 = toks[1] || ''
    const rawKey = w1 ? `${w0} ${w1}` : w0
    openerRaw.set(rawKey, (openerRaw.get(rawKey) || 0) + 1)

    // Pattern classes
    let pat
    if (/^(he|she|they|i|we|it)$/.test(w0) && w1) {
      pat = `${w0.toUpperCase()} + verb/next` // He + X
      // finer: He + past-verb-ish
      if (/(ed|ing)$/.test(w1) || /^(was|were|had|did|would|could|might|must|is|are|am|has|have|went|came|took|made|said|looked|turned|felt|saw|knew|got|put|sat|stood|walked|watched|heard|thought|smiled|nodded|sighed|asked|told|kept|left|came|went)$/.test(w1)) {
        pat = `${capitalize(w0)} + verb`
      } else {
        pat = `${capitalize(w0)} + ${w1}`
      }
    } else if (w0 === 'the' && w1) {
      pat = `The + noun`
    } else if (w0 === 'a' || w0 === 'an') {
      pat = `A/An + noun`
    } else if (w0 === 'his' || w0 === 'her' || w0 === 'their' || w0 === 'its') {
      pat = `${capitalize(w0)} + noun`
    } else if (w0 === 'and' || w0 === 'but' || w0 === 'yet' || w0 === 'so' || w0 === 'or') {
      pat = `CONJ (${w0})`
    } else if (w0 === 'in' || w0 === 'on' || w0 === 'at' || w0 === 'by' || w0 === 'with' || w0 === 'from' || w0 === 'into' || w0 === 'for' || w0 === 'to' || w0 === 'of' || w0 === 'over' || w0 === 'under' || w0 === 'across' || w0 === 'through' || w0 === 'along' || w0 === 'after' || w0 === 'before' || w0 === 'behind' || w0 === 'beside' || w0 === 'between' || w0 === 'among' || w0 === 'against' || w0 === 'around' || w0 === 'near' || w0 === 'toward' || w0 === 'towards' || w0 === 'upon' || w0 === 'without' || w0 === 'within' || w0 === 'outside' || w0 === 'inside' || w0 === 'during') {
      pat = `PREP (${w0})`
    } else if (w0 === 'when' || w0 === 'while' || w0 === 'as' || w0 === 'because' || w0 === 'if' || w0 === 'although' || w0 === 'though' || w0 === 'since' || w0 === 'until' || w0 === 'unless' || w0 === 'where' || w0 === 'wherever' || w0 === 'whenever' || w0 === 'once' || w0 === 'whether') {
      pat = `SUBORD (${w0})`
    } else if (w0 === 'there' || w0 === 'here') {
      pat = `EXIST (${w0})`
    } else if (w0 === 'not' || w0 === 'no' || w0 === 'never' || w0 === 'just' || w0 === 'only') {
      pat = `NEG/FRG (${w0})`
    } else if (w0.endsWith('ly') || /^(then|now|soon|later|finally|again|still|already|sometimes|often|always|never|suddenly|eventually|meanwhile|instead|slowly|quietly|quickly|carefully|gently)$/.test(w0)) {
      pat = `ADV (${w0})`
    } else {
      // Proper-name opener: original first word is Capitalized and not a closed-class word
      const firstOrig = (s.trim().match(/[A-Za-z]+/) || [''])[0]
      if (
        /^[A-Z][a-z]/.test(firstOrig) &&
        !STRUCTURAL.has(w0) &&
        !/^(the|a|an|and|but|yet|so|or|in|on|at|by|with|from|to|for|of|as|if|when|while|then|now|not|no|there|here|this|that|his|her|their|its)$/.test(w0)
      ) {
        pat = `NAME (${firstOrig})`
      } else {
        pat = `OTHER (${w0})`
      }
    }
    // Aggregate name openers into one bucket for pattern table, keep top individuals in raw
    if (pat.startsWith('NAME (')) {
      openers.set('NAME + …', (openers.get('NAME + …') || 0) + 1)
      openers.set(pat, (openers.get(pat) || 0) + 1)
    } else if (pat.startsWith('ADV (')) {
      openers.set('ADV + …', (openers.get('ADV + …') || 0) + 1)
      openers.set(pat, (openers.get(pat) || 0) + 1)
    } else if (pat.startsWith('PREP (')) {
      openers.set('PREP + …', (openers.get('PREP + …') || 0) + 1)
      openers.set(pat, (openers.get(pat) || 0) + 1)
    } else if (pat.startsWith('SUBORD (')) {
      openers.set('SUBORD + …', (openers.get('SUBORD + …') || 0) + 1)
    } else if (pat.startsWith('CONJ (')) {
      openers.set('CONJ + …', (openers.get('CONJ + …') || 0) + 1)
      openers.set(pat, (openers.get(pat) || 0) + 1)
    } else if (pat.startsWith('NEG/FRG')) {
      openers.set('NEG/FRG', (openers.get('NEG/FRG') || 0) + 1)
    } else if (pat.startsWith('EXIST')) {
      openers.set('EXIST (There/Here)', (openers.get('EXIST (There/Here)') || 0) + 1)
    } else if (pat.startsWith('OTHER')) {
      openers.set('OTHER', (openers.get('OTHER') || 0) + 1)
    } else {
      openers.set(pat, (openers.get(pat) || 0) + 1)
    }
  }

  // Dialogue tags beyond said/asked: look for , TAG_VERB  or  TAG_VERB  after quote close
  // Patterns: "…" she whispered / he replied / William said softly already excluded
  const tagCounts = new Map()
  let saidCount = 0
  let askedCount = 0
  // Scan whole text for attribution patterns near quotes
  const tagRe = /["”']\s*,?\s*(?:[A-Z][a-z]+|[Hh]e|[Ss]he|[Tt]hey|[Ii])\s+(\w+)/g
  // Also:  he said  /  she whispered  anywhere after dialogue (looser)
  const looseTag = /\b(?:he|she|they|william|mary|lottie|letitia|hollis|doyle|rose|george|margaret|teresa|alex|i)\s+(\w+)\b/gi
  // Better: find quote-close then speaker + verb within ~6 words
  const afterQuote = /["”]([^"“”\n]{0,40})/g
  let m
  const tagSet = new Set(TAG_VERBS)
  while ((m = afterQuote.exec(text)) !== null) {
    const tail = m[1]
    const tw = tokenize(tail)
    // find first verb-ish in first 5 tokens
    for (let i = 0; i < Math.min(tw.length, 6); i++) {
      const v = tw[i]
      if (v === 'said') { saidCount++; break }
      if (v === 'asked') { askedCount++; break }
      if (tagSet.has(v)) {
        tagCounts.set(v, (tagCounts.get(v) || 0) + 1)
        break
      }
    }
  }
  // Also catch inverted: He whispered, "…"
  const beforeQuote = /\b((?:he|she|they|william|mary|lottie|letitia|hollis|doyle|rose|george|margaret|teresa|alex|[A-Z][a-z]+)\s+(\w+))\s*,?\s*["“]/gi
  while ((m = beforeQuote.exec(text)) !== null) {
    const v = m[2].toLowerCase()
    if (v === 'said') { saidCount++; continue }
    if (v === 'asked') { askedCount++; continue }
    if (tagSet.has(v)) tagCounts.set(v, (tagCounts.get(v) || 0) + 1)
  }

  // Body-language beats — whole-word counts
  const bodyCounts = new Map()
  for (const b of BODY_BEATS) {
    const c = unigrams.get(b) || 0
    if (c) bodyCounts.set(b, c)
  }

  // Filter words
  const filterCounts = new Map()
  for (const f of FILTERS) {
    const c = unigrams.get(f) || 0
    if (c) filterCounts.set(f, c)
  }

  // Bigrams of interest: content bigrams ≥ threshold, not pure structural
  const flaggedBigrams = []
  const bgThreshold = Math.max(3, (2 / 10000) * n) // slightly looser for bigrams: 2/10k or 3 abs
  for (const [bg, c] of bigrams) {
    if (c < bgThreshold) continue
    const rate = ratePer10k(c, n)
    if (rate < 2) continue
    const [a, b] = bg.split(' ')
    // skip if both structural
    if (STRUCTURAL.has(a) && STRUCTURAL.has(b)) continue
    // skip name+structural pure pairs lightly — still allow "william said" etc for visibility but filter pure glue
    if (NAMES_PERIOD.has(a) && STRUCTURAL.has(b)) continue
    if (STRUCTURAL.has(a) && NAMES_PERIOD.has(b)) continue
    if (NAMES_PERIOD.has(a) && NAMES_PERIOD.has(b)) continue
    flaggedBigrams.push({ bigram: bg, count: c, rate: +rate.toFixed(2) })
  }
  flaggedBigrams.sort((a, b) => b.rate - a.rate || b.count - a.count)

  return {
    label,
    words: n,
    sentences: sentCount,
    narrativeSentences: narrativeSent,
    unigrams,
    bigrams,
    flagged: flagged.slice(0, 80),
    flaggedBigrams: flaggedBigrams.slice(0, 60),
    openers,
    openerRaw,
    tagCounts,
    saidCount,
    askedCount,
    bodyCounts,
    filterCounts,
  }
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// ─── main ─────────────────────────────────────────────────────────────────────

const raw = readFileSync(MS_PATH, 'utf8')
// Drop title block noise lightly: keep everything; rates include front matter which is tiny
const full = analyzeSlice(raw, 'FULL')

// First / last third by word index
const allWords = tokenize(raw)
const third = Math.floor(allWords.length / 3)
// Re-slice text by character proportion for sentence integrity
const chars = raw.length
const t1 = raw.slice(0, Math.floor(chars / 3))
const t3 = raw.slice(Math.floor((2 * chars) / 3))
const first = analyzeSlice(t1, 'FIRST_THIRD')
const last = analyzeSlice(t3, 'LAST_THIRD')

// ─── build markdown report ────────────────────────────────────────────────────

const lines = []
const push = (...xs) => lines.push(...xs)

push(`# Frequency analysis — Chasing the Sun`)
push(``)
push(`Source: \`.deai/manuscript.txt\``)
push(`Total words: **${full.words.toLocaleString()}** · Sentences: **${full.sentences.toLocaleString()}** (narrative ${full.narrativeSentences.toLocaleString()})`)
push(`First third: **${first.words.toLocaleString()}** words · Last third: **${last.words.toLocaleString()}** words`)
push(`Threshold: content words at **≥ 3 per 10k** (excl. structural closed-class + character/period names)`)
push(``)

// 1. Flagged words
push(`## 1. Flagged content words (≥ 3 / 10k, non-structural)`)
push(``)
push(mdTable(
  ['rank', 'word', 'count', '/10k', 'first/10k', 'last/10k', 'Δ last vs first'],
  full.flagged.slice(0, 50).map((row, i) => {
    const f = first.unigrams.get(row.word) || 0
    const l = last.unigrams.get(row.word) || 0
    const fr = ratePer10k(f, first.words)
    const lr = ratePer10k(l, last.words)
    return [
      i + 1,
      `\`${row.word}\``,
      row.count,
      row.rate.toFixed(1),
      fr.toFixed(1),
      lr.toFixed(1),
      pctDelta(fr, lr),
    ]
  }),
))
push(``)

// 2. Flagged bigrams
push(`## 2. Flagged content bigrams (≥ 2 / 10k, not pure glue/names)`)
push(``)
push(mdTable(
  ['rank', 'bigram', 'count', '/10k', 'first/10k', 'last/10k', 'Δ'],
  full.flaggedBigrams.slice(0, 40).map((row, i) => {
    const f = first.bigrams.get(row.bigram) || 0
    const l = last.bigrams.get(row.bigram) || 0
    const fr = ratePer10k(f, first.words)
    const lr = ratePer10k(l, last.words)
    return [
      i + 1,
      `\`${row.bigram}\``,
      row.count,
      row.rate.toFixed(1),
      fr.toFixed(1),
      lr.toFixed(1),
      pctDelta(fr, lr),
    ]
  }),
))
push(``)

// 3. Sentence openers — pattern classes
push(`## 3. Sentence-opening patterns (narrative + dialogue)`)
push(``)
// Aggregate clean pattern list (skip ultra-fine NAME (X) / ADV (x) individuals for main table)
const mainOpenerKeys = [
  'He + verb', 'She + verb', 'They + verb', 'I + verb', 'We + verb', 'It + verb',
  'The + noun', 'A/An + noun', 'His + noun', 'Her + noun', 'Their + noun',
  'NAME + …', 'PREP + …', 'ADV + …', 'CONJ + …', 'SUBORD + …',
  'NEG/FRG', 'EXIST (There/Here)', 'DIALOGUE', 'OTHER',
]
const openerRows = []
for (const k of mainOpenerKeys) {
  const c = full.openers.get(k) || 0
  if (!c) continue
  const fc = first.openers.get(k) || 0
  const lc = last.openers.get(k) || 0
  // rates per 100 narrative+dialogue sentences
  const fr = first.sentences ? (fc / first.sentences) * 100 : 0
  const lr = last.sentences ? (lc / last.sentences) * 100 : 0
  const cr = full.sentences ? (c / full.sentences) * 100 : 0
  openerRows.push({ k, c, cr, fr, lr })
}
openerRows.sort((a, b) => b.c - a.c)
push(mdTable(
  ['rank', 'pattern', 'count', '% sents', 'first %', 'last %', 'Δ'],
  openerRows.map((r, i) => [
    i + 1,
    r.k,
    r.c,
    r.cr.toFixed(1) + '%',
    r.fr.toFixed(1) + '%',
    r.lr.toFixed(1) + '%',
    pctDelta(r.fr, r.lr),
  ]),
))
push(``)
push(`### Top raw openers (first two tokens)`)
push(``)
push(mdTable(
  ['rank', 'opener', 'count', '% sents', 'first', 'last', 'Δ rate'],
  rankMap(full.openerRaw, 35).map(([k, c], i) => {
    const fc = first.openerRaw.get(k) || 0
    const lc = last.openerRaw.get(k) || 0
    const fr = first.sentences ? (fc / first.sentences) * 100 : 0
    const lr = last.sentences ? (lc / last.sentences) * 100 : 0
    const cr = full.sentences ? (c / full.sentences) * 100 : 0
    return [i + 1, `\`${k}\``, c, cr.toFixed(1) + '%', fc, lc, pctDelta(fr, lr)]
  }),
))
push(``)

// 4. Dialogue tags
push(`## 4. Dialogue tags beyond said / asked`)
push(``)
push(`Baseline: **said** ${full.saidCount} · **asked** ${full.askedCount} (quote-adjacent attribution only)`)
push(``)
const tagRows = rankMap(full.tagCounts, 40)
if (!tagRows.length) {
  push(`_No fancy tags detected in quote-adjacent position._`)
} else {
  push(mdTable(
    ['rank', 'tag', 'count', '/10k', 'first', 'last', 'Δ rate'],
    tagRows.map(([k, c], i) => {
      const fc = first.tagCounts.get(k) || 0
      const lc = last.tagCounts.get(k) || 0
      const fr = ratePer10k(fc, first.words)
      const lr = ratePer10k(lc, last.words)
      return [i + 1, `\`${k}\``, c, ratePer10k(c, full.words).toFixed(2), fc, lc, pctDelta(fr, lr)]
    }),
  ))
}
push(``)
push(mdTable(
  ['tag family', 'full', 'first', 'last', 'first/10k', 'last/10k', 'Δ'],
  [
    ['said', full.saidCount, first.saidCount, last.saidCount,
      ratePer10k(first.saidCount, first.words).toFixed(1),
      ratePer10k(last.saidCount, last.words).toFixed(1),
      pctDelta(ratePer10k(first.saidCount, first.words), ratePer10k(last.saidCount, last.words))],
    ['asked', full.askedCount, first.askedCount, last.askedCount,
      ratePer10k(first.askedCount, first.words).toFixed(1),
      ratePer10k(last.askedCount, last.words).toFixed(1),
      pctDelta(ratePer10k(first.askedCount, first.words), ratePer10k(last.askedCount, last.words))],
    ['other tags (sum)', [...full.tagCounts.values()].reduce((a, b) => a + b, 0),
      [...first.tagCounts.values()].reduce((a, b) => a + b, 0),
      [...last.tagCounts.values()].reduce((a, b) => a + b, 0),
      ratePer10k([...first.tagCounts.values()].reduce((a, b) => a + b, 0), first.words).toFixed(1),
      ratePer10k([...last.tagCounts.values()].reduce((a, b) => a + b, 0), last.words).toFixed(1),
      pctDelta(
        ratePer10k([...first.tagCounts.values()].reduce((a, b) => a + b, 0), first.words),
        ratePer10k([...last.tagCounts.values()].reduce((a, b) => a + b, 0), last.words),
      )],
  ],
))
push(``)

// 5. Body language
push(`## 5. Body-language beats`)
push(``)
// group lemmas
function groupBody(map) {
  const groups = {
    'nod*': ['nodded', 'nod', 'nodding'],
    'sigh*': ['sighed', 'sigh', 'sighing'],
    'turn*': ['turned', 'turn', 'turning'],
    'shrug*': ['shrugged', 'shrug', 'shrugging'],
    'smile*': ['smiled', 'smile', 'smiling'],
    'grin*': ['grinned', 'grin', 'grinning'],
    'frown*': ['frowned', 'frown', 'frowning'],
    'laugh*': ['laughed', 'laugh', 'laughing', 'chuckled', 'chuckle'],
    'shake/shook': ['shook', 'shake', 'shaking'],
    'pause/hesitate': ['paused', 'pause', 'pausing', 'hesitated', 'hesitate'],
    'look*': ['looked', 'look', 'looking'],
    'stare*': ['stared', 'stare', 'staring'],
    'glance*': ['glanced', 'glance', 'glancing'],
    'gaze*': ['gazed', 'gaze', 'gazing'],
    'watch*': ['watched', 'watch', 'watching'],
    'lean*': ['leaned', 'lean', 'leaning'],
    'hand(s)': ['hands', 'hand'],
    'finger(s)': ['fingers', 'finger'],
    'arm(s)': ['arms', 'arm'],
    'shoulder(s)': ['shoulders', 'shoulder'],
    'eye(s)': ['eyes', 'eye'],
    'jaw/chin/brow': ['jaw', 'chin', 'brow', 'forehead'],
    'lips/mouth': ['lips', 'mouth'],
    'breath*': ['breath', 'breathed', 'breathing', 'exhaled', 'inhaled'],
    'sit/stand': ['sat', 'sit', 'sitting', 'stood', 'stand', 'standing'],
    'walk/step/move': ['walked', 'walk', 'walking', 'stepped', 'step', 'stepping', 'moved', 'move', 'moving'],
    'reach/touch/grip': ['reached', 'reach', 'reaching', 'touched', 'touch', 'touching', 'gripped', 'grip', 'gripping', 'clenched', 'clench'],
    'flinch/wince': ['flinched', 'flinch', 'winced', 'wince'],
    'shift/settle': ['shifted', 'shift', 'shifting', 'settled', 'settle'],
  }
  const out = []
  for (const [g, keys] of Object.entries(groups)) {
    let c = 0
    for (const k of keys) c += map.get(k) || 0
    if (c) out.push([g, c])
  }
  return out.sort((a, b) => b[1] - a[1])
}
const bodyFull = groupBody(full.bodyCounts)
const bodyFirst = new Map(groupBody(first.bodyCounts))
const bodyLast = new Map(groupBody(last.bodyCounts))
push(mdTable(
  ['rank', 'beat family', 'count', '/10k', 'first/10k', 'last/10k', 'Δ'],
  bodyFull.map(([g, c], i) => {
    const fr = ratePer10k(bodyFirst.get(g) || 0, first.words)
    const lr = ratePer10k(bodyLast.get(g) || 0, last.words)
    return [i + 1, g, c, ratePer10k(c, full.words).toFixed(1), fr.toFixed(1), lr.toFixed(1), pctDelta(fr, lr)]
  }),
))
push(``)
push(`### Top individual body tokens`)
push(``)
push(mdTable(
  ['rank', 'token', 'count', '/10k', 'first/10k', 'last/10k', 'Δ'],
  rankMap(full.bodyCounts, 30).map(([k, c], i) => {
    const fr = ratePer10k(first.bodyCounts.get(k) || 0, first.words)
    const lr = ratePer10k(last.bodyCounts.get(k) || 0, last.words)
    return [i + 1, `\`${k}\``, c, ratePer10k(c, full.words).toFixed(1), fr.toFixed(1), lr.toFixed(1), pctDelta(fr, lr)]
  }),
))
push(``)

// 6. Filter words
push(`## 6. Filter words`)
push(``)
function groupFilters(map) {
  const groups = {
    'felt/feel*': ['felt', 'feel', 'feeling', 'feels'],
    'saw/see*': ['saw', 'see', 'seeing', 'sees', 'seen'],
    'noticed/notice*': ['noticed', 'notice', 'noticing'],
    'seemed/seem*': ['seemed', 'seem', 'seems', 'seeming'],
    'realized/realise*': ['realized', 'realize', 'realizing', 'realised', 'realise'],
    'heard/hear*': ['heard', 'hear', 'hearing', 'hears'],
    'watched/watch*': ['watched', 'watch', 'watching'],
    'knew/know*': ['knew', 'know', 'knowing', 'knows'],
    'thought/think*': ['thought', 'think', 'thinking', 'thinks'],
    'wondered/wonder*': ['wondered', 'wonder', 'wondering'],
    'decided/decide*': ['decided', 'decide', 'deciding'],
    'remembered/remember*': ['remembered', 'remember', 'remembering'],
    'appeared/appear*': ['appeared', 'appear', 'appears', 'appearing'],
    'looked (ambiguous)': ['looked'],
  }
  const out = []
  for (const [g, keys] of Object.entries(groups)) {
    let c = 0
    for (const k of keys) c += map.get(k) || 0
    out.push([g, c, keys])
  }
  return out.sort((a, b) => b[1] - a[1])
}
const filtFull = groupFilters(full.filterCounts)
const filtFirst = groupFilters(first.filterCounts)
const filtLast = groupFilters(last.filterCounts)
const fFirstMap = new Map(filtFirst.map(([g, c]) => [g, c]))
const fLastMap = new Map(filtLast.map(([g, c]) => [g, c]))
push(mdTable(
  ['rank', 'filter family', 'count', '/10k', 'first/10k', 'last/10k', 'Δ'],
  filtFull.map(([g, c], i) => {
    const fr = ratePer10k(fFirstMap.get(g) || 0, first.words)
    const lr = ratePer10k(fLastMap.get(g) || 0, last.words)
    return [i + 1, g, c, ratePer10k(c, full.words).toFixed(1), fr.toFixed(1), lr.toFixed(1), pctDelta(fr, lr)]
  }),
))
push(``)
push(`### Individual filter tokens`)
push(``)
push(mdTable(
  ['rank', 'token', 'count', '/10k', 'first/10k', 'last/10k', 'Δ'],
  rankMap(full.filterCounts, 25).map(([k, c], i) => {
    const fr = ratePer10k(first.filterCounts.get(k) || 0, first.words)
    const lr = ratePer10k(last.filterCounts.get(k) || 0, last.words)
    return [i + 1, `\`${k}\``, c, ratePer10k(c, full.words).toFixed(1), fr.toFixed(1), lr.toFixed(1), pctDelta(fr, lr)]
  }),
))
push(``)

// 7. Summary comparison panel
push(`## 7. First-third vs last-third snapshot`)
push(``)
const heVerbF = first.openers.get('He + verb') || 0
const heVerbL = last.openers.get('He + verb') || 0
const sheVerbF = first.openers.get('She + verb') || 0
const sheVerbL = last.openers.get('She + verb') || 0
const theNounF = first.openers.get('The + noun') || 0
const theNounL = last.openers.get('The + noun') || 0
const subjectLed = (slice) =>
  (slice.openers.get('He + verb') || 0) +
  (slice.openers.get('She + verb') || 0) +
  (slice.openers.get('They + verb') || 0) +
  (slice.openers.get('I + verb') || 0) +
  (slice.openers.get('We + verb') || 0) +
  (slice.openers.get('It + verb') || 0) +
  (slice.openers.get('NAME + …') || 0)
const sumTags = m => [...m.values()].reduce((a, b) => a + b, 0)
const sumBody = m => groupBody(m).reduce((a, [, c]) => a + c, 0)
// core filters only (the classic five)
const coreFilters = (slice) => {
  const keys = ['felt', 'feel', 'feeling', 'saw', 'see', 'seen', 'noticed', 'notice', 'seemed', 'seem', 'realized', 'realize', 'realised', 'realise']
  return keys.reduce((a, k) => a + (slice.filterCounts.get(k) || 0), 0)
}
const sF = subjectLed(first) / first.sentences
const sL = subjectLed(last) / last.sentences
push(mdTable(
  ['metric', 'first/10k or %', 'last/10k or %', 'Δ'],
  [
    ['Subject-led openers (pronoun/name + verb)',
      (sF * 100).toFixed(1) + '%',
      (sL * 100).toFixed(1) + '%',
      pctDelta(sF, sL)],
    ['He + verb openers',
      ((heVerbF / first.sentences) * 100).toFixed(1) + '%',
      ((heVerbL / last.sentences) * 100).toFixed(1) + '%',
      pctDelta(heVerbF / first.sentences, heVerbL / last.sentences)],
    ['She + verb openers',
      ((sheVerbF / first.sentences) * 100).toFixed(1) + '%',
      ((sheVerbL / last.sentences) * 100).toFixed(1) + '%',
      pctDelta(sheVerbF / first.sentences, sheVerbL / last.sentences)],
    ['The + noun openers',
      ((theNounF / first.sentences) * 100).toFixed(1) + '%',
      ((theNounL / last.sentences) * 100).toFixed(1) + '%',
      pctDelta(theNounF / first.sentences, theNounL / last.sentences)],
    ['NAME openers',
      (((first.openers.get('NAME + …') || 0) / first.sentences) * 100).toFixed(1) + '%',
      (((last.openers.get('NAME + …') || 0) / last.sentences) * 100).toFixed(1) + '%',
      pctDelta((first.openers.get('NAME + …') || 0) / first.sentences, (last.openers.get('NAME + …') || 0) / last.sentences)],
    ['DIALOGUE openers',
      (((first.openers.get('DIALOGUE') || 0) / first.sentences) * 100).toFixed(1) + '%',
      (((last.openers.get('DIALOGUE') || 0) / last.sentences) * 100).toFixed(1) + '%',
      pctDelta((first.openers.get('DIALOGUE') || 0) / first.sentences, (last.openers.get('DIALOGUE') || 0) / last.sentences)],
    ['said tags',
      ratePer10k(first.saidCount, first.words).toFixed(1),
      ratePer10k(last.saidCount, last.words).toFixed(1),
      pctDelta(ratePer10k(first.saidCount, first.words), ratePer10k(last.saidCount, last.words))],
    ['fancy tags (sum)',
      ratePer10k(sumTags(first.tagCounts), first.words).toFixed(1),
      ratePer10k(sumTags(last.tagCounts), last.words).toFixed(1),
      pctDelta(ratePer10k(sumTags(first.tagCounts), first.words), ratePer10k(sumTags(last.tagCounts), last.words))],
    ['body beats (sum families)',
      ratePer10k(sumBody(first.bodyCounts), first.words).toFixed(1),
      ratePer10k(sumBody(last.bodyCounts), last.words).toFixed(1),
      pctDelta(ratePer10k(sumBody(first.bodyCounts), first.words), ratePer10k(sumBody(last.bodyCounts), last.words))],
    ['core filters (felt/saw/noticed/seemed/realized)',
      ratePer10k(coreFilters(first), first.words).toFixed(1),
      ratePer10k(coreFilters(last), last.words).toFixed(1),
      pctDelta(ratePer10k(coreFilters(first), first.words), ratePer10k(coreFilters(last), last.words))],
    ['looked at (bigram)',
      ratePer10k(first.bigrams.get('looked at') || 0, first.words).toFixed(1),
      ratePer10k(last.bigrams.get('looked at') || 0, last.words).toFixed(1),
      pctDelta(ratePer10k(first.bigrams.get('looked at') || 0, first.words), ratePer10k(last.bigrams.get('looked at') || 0, last.words))],
  ],
))
push(``)
push(`---`)
push(`_Generated by \`scripts/freq-analysis.mjs\`. Tables only; no manuscript prose._`)

const md = lines.join('\n')
writeFileSync(OUT_MD, md)
writeFileSync(OUT_JSON, JSON.stringify({
  meta: { words: full.words, sentences: full.sentences, firstWords: first.words, lastWords: last.words },
  flagged: full.flagged.slice(0, 50),
  flaggedBigrams: full.flaggedBigrams.slice(0, 40),
  openers: openerRows,
  openerRaw: rankMap(full.openerRaw, 35).map(([k, c]) => ({ k, c })),
  tags: { said: full.saidCount, asked: full.askedCount, other: Object.fromEntries(full.tagCounts) },
  body: bodyFull,
  filters: filtFull.map(([g, c]) => ({ g, c })),
}, null, 2))

console.log(md)
console.error(`\nWrote ${OUT_MD}`)
console.error(`Wrote ${OUT_JSON}`)
