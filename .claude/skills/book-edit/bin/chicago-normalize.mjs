#!/usr/bin/env node
// Normalize the whole Drive Doc to Chicago typography WITHOUT disturbing prose
// or inline formatting (bold/italic survive — edits are single-character swaps):
//   - straight apostrophe  '  → curly ’ / ‘  (contextual)
//   - straight quote       "  → curly “ / ”  (contextual)
//   - runs of spaces          → a single space
//
//   node chicago-normalize.mjs            # DRY-RUN: counts + a sample of changes
//   node chicago-normalize.mjs --apply    # apply via batchUpdate
//   node chicago-normalize.mjs --sample 40
//
// Implementation: read the doc, walk every textRun keeping each character's
// ABSOLUTE document index, compute the normalized paragraph text, and emit one
// surgical edit per differing character/space-run. Edits are applied in
// DESCENDING index order in a single batchUpdate so earlier indices stay valid.
import { google } from 'googleapis';
import { getAuthClient, DOC_ID } from './auth.mjs';

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const sampleN = (() => { const i = args.indexOf('--sample'); return i >= 0 ? +args[i + 1] : 25; })();

const OPENERS = /[\s([{—–\-“‘]/; // char BEFORE a quote that makes it an opener
const ELISION = /^(tis|twas|em|cause|round|bout|til|fore|n')/i; // 'tis, 'em, 'cause…
function curlChar(quote, prev, after) {
  const opener = prev === undefined || OPENERS.test(prev);
  if (quote === '"') return opener ? '“' : '”';
  // single quote: an "opener" that is really an elision ('tis) or decade ('73) is an apostrophe
  if (opener && (/^\d/.test(after) || ELISION.test(after))) return '’';
  return opener ? '‘' : '’';
}

const auth = await getAuthClient();
const docs = google.docs({ version: 'v1', auth });
const res = await docs.documents.get({ documentId: DOC_ID });

// Flatten paragraphs into {chars:[{c, idx}]} so quote context is per-paragraph.
const edits = []; // {start, end, text}  delete [start,end) then insert text
let apos = 0, quot = 0, space = 0;
for (const el of res.data.body?.content || []) {
  if (!el.paragraph) continue;
  const chars = [];
  for (const e of el.paragraph.elements || []) {
    const content = e.textRun?.content;
    if (!content) continue;
    for (let k = 0; k < content.length; k++) chars.push({ c: content[k], idx: e.startIndex + k });
  }
  // quotes: per-character swap (length-preserving)
  for (let k = 0; k < chars.length; k++) {
    const c = chars[k].c;
    if (c !== '"' && c !== "'") continue;
    const prev = k > 0 ? chars[k - 1].c : undefined;
    const after = chars.slice(k + 1, k + 7).map((x) => x.c).join('');
    const curl = curlChar(c, prev, after);
    edits.push({ start: chars[k].idx, end: chars[k].idx + 1, text: curl });
    if (c === '"') quot++; else apos++;
  }
  // space runs: collapse to one (only within paragraph text, not the trailing \n)
  let k = 0;
  while (k < chars.length) {
    if (chars[k].c === ' ' && k + 1 < chars.length && chars[k + 1].c === ' ') {
      let j = k;
      while (j < chars.length && chars[j].c === ' ') j++;
      edits.push({ start: chars[k].idx, end: chars[j - 1].idx + 1, text: ' ' });
      space++;
      k = j;
    } else k++;
  }
}

console.log(`changes: ${apos} apostrophes, ${quot} double-quotes, ${space} space-runs  (total ${edits.length})`);

if (!APPLY) {
  // show a sample with context from the flat plain text
  const plain = (res.data.body?.content || [])
    .flatMap((el) => (el.paragraph?.elements || []).map((e) => e.textRun?.content || '')).join('');
  // plain is index-aligned to doc indices offset by content start; rebuild index->char map
  const map = new Map();
  for (const el of res.data.body?.content || [])
    for (const e of el.paragraph?.elements || [])
      if (e.textRun?.content) for (let k = 0; k < e.textRun.content.length; k++) map.set(e.startIndex + k, e.textRun.content[k]);
  console.log(`\nsample (${Math.min(sampleN, edits.length)} of ${edits.length}):`);
  for (const ed of edits.slice(0, sampleN)) {
    let ctx = '';
    for (let i = ed.start - 18; i < ed.end + 18; i++) ctx += map.get(i) ?? '';
    const was = [...Array(ed.end - ed.start)].map((_, i) => map.get(ed.start + i)).join('');
    console.log(`  …${ctx.replace(/\n/g, '⏎')}…   [${JSON.stringify(was)} → ${JSON.stringify(ed.text)}]`);
  }
  console.log('\nDRY-RUN. Re-run with --apply to write.');
  process.exit(0);
}

// Apply in descending start index so earlier edits don't shift later ones.
edits.sort((a, b) => b.start - a.start);
const requests = [];
for (const ed of edits) {
  requests.push({ deleteContentRange: { range: { startIndex: ed.start, endIndex: ed.end } } });
  if (ed.text) requests.push({ insertText: { location: { index: ed.start }, text: ed.text } });
}
await docs.documents.batchUpdate({ documentId: DOC_ID, requestBody: { requests } });
console.log(`applied ${edits.length} normalizations.`);
