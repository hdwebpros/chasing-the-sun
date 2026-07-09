#!/usr/bin/env node
// Normalize every scene-separator (* * *) paragraph in the Doc to one format:
// centered, 12pt Garamond, 18pt space above/below, single spacing, no indent,
// and no adjacent empty paragraphs. Dry-run by default; --apply writes.
import { google } from 'googleapis';
import { getAuthClient, DOC_ID } from './auth.mjs';

const APPLY = process.argv.includes('--apply');
const auth = await getAuthClient();
const docs = google.docs({ version: 'v1', auth });
const res = await docs.documents.get({ documentId: DOC_ID });

const paras = [];
for (const elem of res.data.body.content) {
  if (!elem.paragraph) continue;
  const text = (elem.paragraph.elements || []).map(e => e.textRun?.content || '').join('').replace(/\n+$/, '');
  paras.push({ text, startIndex: elem.startIndex, endIndex: elem.endIndex });
}

const isSep = (p) => /^\s*\*\s*\*\s*\*\s*$/.test(p.text) && p.text.trim() !== '';
const isEmpty = (p) => !p.text.trim();

const requests = []; // {at, req}
const deleted = new Set();
let seps = 0, empties = 0;

for (let i = 0; i < paras.length; i++) {
  if (!isSep(paras[i])) continue;
  seps++;
  const p = paras[i];

  // exact text "* * *" (fix any stray whitespace variants)
  if (p.text !== '* * *') {
    requests.push({ at: p.startIndex, req: { replaceAllText: null } }); // placeholder, handled below
    console.log('nonstandard text at', p.startIndex, JSON.stringify(p.text));
  }

  requests.push({ at: p.startIndex, req: { updateParagraphStyle: {
    range: { startIndex: p.startIndex, endIndex: p.endIndex },
    paragraphStyle: {
      namedStyleType: 'NORMAL_TEXT',
      alignment: 'CENTER',
      lineSpacing: 100,
      spaceAbove: { magnitude: 18, unit: 'PT' },
      spaceBelow: { magnitude: 18, unit: 'PT' },
      indentFirstLine: { magnitude: 0, unit: 'PT' },
      indentStart: { magnitude: 0, unit: 'PT' },
      indentEnd: { magnitude: 0, unit: 'PT' },
    },
    fields: 'namedStyleType,alignment,lineSpacing,spaceAbove,spaceBelow,indentFirstLine,indentStart,indentEnd',
  }}});
  requests.push({ at: p.startIndex, req: { updateTextStyle: {
    range: { startIndex: p.startIndex, endIndex: p.endIndex - 1 },
    textStyle: {
      fontSize: { magnitude: 12, unit: 'PT' },
      weightedFontFamily: { fontFamily: 'Garamond' },
      bold: false, italic: false,
    },
    fields: 'fontSize,weightedFontFamily,bold,italic',
  }}});

  // delete runs of empty paragraphs immediately before and after
  for (let j = i - 1; j >= 0 && isEmpty(paras[j]); j--) {
    if (deleted.has(paras[j].startIndex)) break;
    deleted.add(paras[j].startIndex);
    empties++;
    requests.push({ at: paras[j].startIndex, req: { deleteContentRange: {
      range: { startIndex: paras[j].startIndex, endIndex: paras[j].endIndex } } } });
  }
  for (let j = i + 1; j < paras.length && isEmpty(paras[j]); j++) {
    if (deleted.has(paras[j].startIndex)) break;
    deleted.add(paras[j].startIndex);
    empties++;
    requests.push({ at: paras[j].startIndex, req: { deleteContentRange: {
      range: { startIndex: paras[j].startIndex, endIndex: paras[j].endIndex } } } });
  }
}

const bad = requests.filter(r => r.req.replaceAllText === null);
if (bad.length) { console.error('unexpected nonstandard separator text — handle manually'); process.exit(1); }

requests.sort((a, b) => b.at - a.at);
console.log(`${seps} separators → uniform style; ${empties} adjacent empty paragraphs to delete; ${requests.length} requests`);

if (!APPLY) { console.log('dry-run only; re-run with --apply'); process.exit(0); }

// batchUpdate caps at 500 requests per call; chunk while preserving descending order
for (let i = 0; i < requests.length; i += 400) {
  const chunk = requests.slice(i, i + 400).map(r => r.req);
  await docs.documents.batchUpdate({ documentId: DOC_ID, requestBody: { requests: chunk } });
  console.log(`applied ${Math.min(i + 400, requests.length)}/${requests.length}`);
}
console.log('done');
