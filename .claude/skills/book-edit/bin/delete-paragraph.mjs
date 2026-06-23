#!/usr/bin/env node
// Delete a WHOLE paragraph (its text AND its trailing paragraph mark) from the Drive
// doc, by exact paragraph-text match. replaceAllText can blank a paragraph's text but
// leaves an empty paragraph behind; for a clean full-paragraph cut we need to delete the
// paragraph mark too, which only deleteContentRange can do. DRY-RUN by default — pass
// --apply to write Drive.
//
//   node delete-paragraph.mjs < target.txt            # dry run, target text on stdin
//   node delete-paragraph.mjs --apply < target.txt    # delete it on Drive
import { google } from 'googleapis';
import { getAuthClient, DOC_ID } from './auth.mjs';
import { stdin } from 'node:process';

async function readStdin() { let d = ''; for await (const c of stdin) d += c; return d; }
const APPLY = process.argv.includes('--apply');
const target = (await readStdin()).trim();
if (!target) { console.error('No target paragraph text on stdin.'); process.exit(2); }

const auth = await getAuthClient();
const docs = google.docs({ version: 'v1', auth });
const { data: doc } = await docs.documents.get({ documentId: DOC_ID });

const paraText = (p) => (p.elements || []).map(e => e.textRun?.content || '').join('');
const matches = [];
for (const el of doc.body.content || []) {
  if (!el.paragraph) continue;
  const text = paraText(el.paragraph);
  if (text.replace(/\n$/, '').trim() === target) {
    matches.push({ start: el.startIndex, end: el.endIndex, text });
  }
}

if (matches.length === 0) { console.error('No paragraph matched the target text verbatim.'); process.exit(1); }
if (matches.length > 1) { console.error(`Ambiguous: ${matches.length} paragraphs match. Refusing to delete.`); process.exit(1); }

const m = matches[0];
console.log(`Matched 1 paragraph: range [${m.start}, ${m.end}) (length ${m.end - m.start}, includes trailing mark)`);
console.log('Text:', JSON.stringify(m.text));
if (!APPLY) { console.log('[DRY RUN — pass --apply to delete on Drive]'); process.exit(0); }

await docs.documents.batchUpdate({
  documentId: DOC_ID,
  requestBody: { requests: [{ deleteContentRange: { range: { startIndex: m.start, endIndex: m.end } } }] },
});
console.log('Drive updated — paragraph deleted.');
