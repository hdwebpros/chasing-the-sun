#!/usr/bin/env node
// Trim stray whitespace at PARAGRAPH EDGES across the whole Drive Doc:
//   - leading space(s) at the very start of a paragraph's text
//   - trailing space(s) sitting immediately before the paragraph's newline
//   - stray tabs at either edge, and at the start of a soft line (after a \v line break)
// Mid-paragraph double-spaces are chicago-normalize's job; this only touches
// the two edges. Deletes are index swaps applied in DESCENDING order so earlier
// indices stay valid (same pattern as chicago-normalize.mjs).
//
//   node trim-para-ws.mjs            # DRY-RUN: counts + sample
//   node trim-para-ws.mjs --apply    # write via batchUpdate
//   add --tabs-only to touch only runs that are all tabs (leave spaces alone)
import { google } from 'googleapis';
import { getAuthClient, DOC_ID } from './auth.mjs';

const APPLY = process.argv.includes('--apply');
const TABS_ONLY = process.argv.includes('--tabs-only');
const auth = await getAuthClient();
const docs = google.docs({ version: 'v1', auth });
const res = await docs.documents.get({ documentId: DOC_ID });

const ws = (c) => c === ' ' || c === '\t';
const dels = []; // {start, end, kind, ctx}
for (const el of res.data.body?.content || []) {
  if (!el.paragraph) continue;
  const chars = [];
  for (const e of el.paragraph.elements || []) {
    const content = e.textRun?.content;
    if (!content) continue;
    for (let k = 0; k < content.length; k++) chars.push({ c: content[k], idx: e.startIndex + k });
  }
  if (!chars.length) continue;

  // leading whitespace: at index 0 and right after each soft line break (\v)
  for (let s = 0; s < chars.length; s++) {
    if (s > 0 && chars[s - 1].c !== '\v') continue;
    let a = s;
    while (a < chars.length && ws(chars[a].c)) a++;
    if (a > s) {
      const after = chars.slice(a, a + 24).map((x) => x.c).join('');
      dels.push({ start: chars[s].idx, end: chars[a - 1].idx + 1, kind: 'leading', ctx: after, tabs: chars.slice(s, a).every((x) => x.c === '\t') });
    }
  }

  // trailing spaces: paragraph text ends with '\n'; find spaces right before it
  let last = chars.length - 1;
  if (chars[last].c === '\n') last--;            // step over the paragraph mark
  let b = last;
  while (b >= 0 && ws(chars[b].c)) b--;
  if (b < last && last >= 0) {
    const before = chars.slice(Math.max(0, b - 23), b + 1).map((x) => x.c).join('');
    dels.push({ start: chars[b + 1].idx, end: chars[last].idx + 1, kind: 'trailing', ctx: before, tabs: chars.slice(b + 1, last + 1).every((x) => x.c === '\t') });
  }
}

if (TABS_ONLY) dels.splice(0, dels.length, ...dels.filter((d) => d.tabs));
const lead = dels.filter((d) => d.kind === 'leading');
const trail = dels.filter((d) => d.kind === 'trailing');
console.log(`edge-trims: ${lead.length} leading, ${trail.length} trailing  (total ${dels.length})`);
console.log('\nleading:');
for (const d of lead) console.log(`  [${d.start}-${d.end}] "${d.ctx.replace(/\n/g, '⏎')}…"`);
console.log('\ntrailing (sample 20):');
for (const d of trail.slice(0, 20)) console.log(`  [${d.start}-${d.end}] "…${d.ctx.replace(/\n/g, '⏎')}"`);
if (trail.length > 20) console.log(`  … +${trail.length - 20} more`);

if (!APPLY) { console.log('\nDRY-RUN. Re-run with --apply to write.'); process.exit(0); }

dels.sort((a, b) => b.start - a.start);
const requests = dels.map((d) => ({ deleteContentRange: { range: { startIndex: d.start, endIndex: d.end } } }));
for (let k = 0; k < requests.length; k += 250) {
  await docs.documents.batchUpdate({ documentId: DOC_ID, requestBody: { requests: requests.slice(k, k + 250) } });
}
console.log(`\napplied ${dels.length} edge-trims.`);
