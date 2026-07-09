#!/usr/bin/env node
// dedrone-check — the TRUST ORGAN for the comment-fix de-drone gate.
//
// Points the EXISTING /openers law (shared/openers-core.mjs + taxonomy budgets) at an
// arbitrary block of prose — the picked replacement lines assembled into their passage,
// which are SUGGEST-ONLY and not in the Doc yet, so classify.mjs (which reads the cached
// manuscript) can't see them. This reads stdin or a file and measures the SAME way.
//
// The whole point: a fresh agent cannot judge "does this drone?" by ear — it finds
// collisions (two "The"s touching) and dedupes by alternating subjects, leaving an 80%
// subject-led wall with no repeats. This meter measures DENSITY and RUNS, which can't be
// gamed that way. The agent proposes; this disposes. Run it ON the agent's output and
// bounce anything that still trips a flag.
//
//   node dedrone-check.mjs < passage.txt         # read a block from stdin, split into sentences
//   node dedrone-check.mjs passage.txt           # ...or from a file
//   node dedrone-check.mjs --lines < picks.txt   # input is already ONE SENTENCE PER LINE
//   node dedrone-check.mjs --json < passage.txt  # machine-readable verdict
//
// Thresholds are NOT invented here — they are the author's /openers budgets:
//   pctS_max 0.5 / target S 0.40–0.55  ·  typeRun_min 4 (4+ same code in a row = a wall)
//   variety_word_run_min 3 → here: same FRONTED WORD within 6 sentences = an echo
// (see .claude/skills/openers/taxonomy.json — the single source for these numbers).

import { readFileSync } from 'node:fs';
import { classifyOpener, words, clean } from '../../../../shared/openers-core.mjs';

// ---- thresholds (mirror taxonomy.json budgets; keep in sync) ----
const PCT_S_MAX = 0.55;     // target S band ceiling (0.40–0.55); >0.55 = drone
const TYPE_RUN_MIN = 4;     // 4+ sentences in a row sharing ONE narrative code = a wall
const ECHO_WINDOW = 6;      // same fronted WORD within 6 sentences = an echo (vary the word, not just the type)

const NARRATIVE = new Set(['S', 'P', 'C', 'J', 'A', 'G', 'I']); // D (dialogue) + F (fragment) are parked

const argv = process.argv.slice(2);
const asJson = argv.includes('--json');
const lineMode = argv.includes('--lines');
const fileArg = argv.find((a) => !a.startsWith('-'));

const raw = fileArg ? readFileSync(fileArg, 'utf8') : readFileSync(0, 'utf8');

// ---- split into sentences (heuristic, matches classify.mjs spirit) ----
function splitSentences(text) {
  if (lineMode) {
    return text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  }
  // protect abbreviations + single-letter initials so their period doesn't end a sentence
  const ABBR = /\b(St|Mr|Mrs|Ms|Dr|Jr|Sr|Rev|Fr|Capt|Col|Gen|Sgt|Lt|Gov|Sen|vs|etc|No|Co|Ltd|[A-Z])\.(?=\s)/g;
  const PROT = '@DOT@'; // placeholder standing in for a protected period
  const out = [];
  for (const para of text.split(/\r?\n+/)) {
    let t = para.trim();
    if (!t) continue;
    t = t.replace(ABBR, (_m, a) => `${a}${PROT}`); // mask the period
    // break after . ! ? (and an optional closing quote) followed by whitespace + a capital/quote
    const parts = t.split(/(?<=[.!?][”’"']?)\s+(?=[“"'A-Z])/);
    for (const p of parts) {
      const s = p.split(PROT).join('.').trim(); // restore
      if (s) out.push(s);
    }
  }
  return out;
}

const sentences = splitSentences(raw);
if (!sentences.length) {
  process.stderr.write('No sentences read.\n');
  process.exit(1);
}

// ---- classify ----
const rows = sentences.map((s, i) => {
  const { code, opener } = classifyOpener(s);
  const firstWord = clean(words(s)[0]);
  return { i, code, opener, firstWord, sentence: s };
});

const total = rows.length;
const sCount = rows.filter((r) => r.code === 'S').length;
const pctS = sCount / total;

const tally = {};
for (const r of rows) tally[r.code] = (tally[r.code] || 0) + 1;

// ---- runs: 4+ in a row sharing one NARRATIVE code ----
const runs = [];
let start = 0;
for (let k = 1; k <= rows.length; k++) {
  if (k === rows.length || rows[k].code !== rows[start].code) {
    const len = k - start;
    const code = rows[start].code;
    if (len >= TYPE_RUN_MIN && NARRATIVE.has(code)) {
      runs.push({ code, from: start + 1, to: k, len });
    }
    start = k;
  }
}

// ---- echoes: same fronted WORD within ECHO_WINDOW, non-dialogue ----
const echoes = [];
for (let a = 0; a < rows.length; a++) {
  if (rows[a].code === 'D' || !rows[a].firstWord) continue;
  for (let b = a + 1; b < rows.length && b - a <= ECHO_WINDOW; b++) {
    if (rows[b].code === 'D') continue;
    if (rows[b].firstWord === rows[a].firstWord) {
      echoes.push({ word: rows[a].firstWord, lines: [a + 1, b + 1] });
      break; // report the nearest pair per anchor
    }
  }
}

// ---- verdict ----
const reasons = [];
if (pctS > PCT_S_MAX) reasons.push(`DRONE: ${(pctS * 100).toFixed(0)}% subject-led (S) — ceiling is ${(PCT_S_MAX * 100).toFixed(0)}%. Subject openers (The/He/They/<Name>) are a faux pas by default; re-enter the majority.`);
for (const r of runs) reasons.push(`WALL: lines ${r.from}–${r.to} are ${r.len} "${r.code}" openers in a row — break the run.`);
for (const e of echoes) reasons.push(`ECHO: lines ${e.lines[0]} & ${e.lines[1]} both open on "${e.word}" within ${ECHO_WINDOW} — vary the WORD.`);
const pass = reasons.length === 0;

if (asJson) {
  console.log(JSON.stringify({ pass, total, sCount, pctS, tally, runs, echoes, reasons, rows }, null, 2));
  process.exit(pass ? 0 : 1);
}

// ---- human-readable ----
console.log(`\n  ${total} sentences · S=${sCount} (${(pctS * 100).toFixed(0)}%) · ${Object.entries(tally).sort().map(([c, n]) => `${c}:${n}`).join('  ')}\n`);
for (const r of rows) {
  const mark = r.code === 'S' ? '›' : ' ';
  const snip = r.sentence.length > 78 ? r.sentence.slice(0, 75) + '…' : r.sentence;
  console.log(` ${String(r.i + 1).padStart(2)}. ${mark}[${r.code}] ${snip}`);
}
console.log('');
if (pass) {
  console.log('  ✓ PASS — no drone, no walls, no echoes. Clear to present.\n');
} else {
  console.log('  ✗ FAIL — re-enter the flagged lines, then re-run this:\n');
  for (const why of reasons) console.log(`    • ${why}`);
  console.log('');
}
process.exit(pass ? 0 : 1);
