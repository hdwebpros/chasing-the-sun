#!/usr/bin/env node
// Insert one or more new paragraphs into the Drive doc, immediately before
// (or after) an anchor paragraph.
//
// Usage:
//   echo '{"anchor": "...exact paragraph text...", "before": ["new para 1", "new para 2"]}' \
//     | node insert-paragraphs.mjs
//
//   Or `after` instead of `before` to insert after the anchor.
//
// Uses the Docs API `insertText` operation with proper paragraph breaks (\n).
import { google } from 'googleapis';
import { getAuthClient, DOC_ID } from './auth.mjs';
import { stdin, stderr, stdout, exit } from 'node:process';

async function readStdin() {
  let data = '';
  for await (const chunk of stdin) data += chunk;
  return data;
}

const raw = await readStdin();
if (!raw.trim()) {
  stderr.write('No input on stdin. Expected JSON {anchor, before?|after?}.\n');
  exit(2);
}

let req;
try { req = JSON.parse(raw); } catch (err) {
  stderr.write(`Invalid JSON on stdin: ${err.message}\n`);
  exit(2);
}

const { anchor, before, after } = req;
if (typeof anchor !== 'string' || !anchor) {
  stderr.write('Missing required field: anchor (string).\n');
  exit(2);
}
const paragraphs = before || after;
const position = before ? 'before' : 'after';
if (!Array.isArray(paragraphs) || paragraphs.length === 0) {
  stderr.write('Missing required field: before or after (non-empty array of strings).\n');
  exit(2);
}
if (paragraphs.some((p) => typeof p !== 'string')) {
  stderr.write('All paragraphs must be strings.\n');
  exit(2);
}

const auth = await getAuthClient();
const docs = google.docs({ version: 'v1', auth });

// Find the anchor paragraph's index range by walking the doc structure.
const res = await docs.documents.get({ documentId: DOC_ID });
const found = findParagraphRange(res.data, anchor);
if (!found) {
  stderr.write(`Anchor paragraph not found: ${truncate(anchor)}\n`);
  exit(1);
}
if (found.matches > 1) {
  stderr.write(
    `Anchor matches ${found.matches} paragraphs — too ambiguous. Use more text.\n`,
  );
  exit(1);
}

// Insert text BEFORE found.startIndex (or AFTER found.endIndex - 1, which is
// the position just before the closing paragraph mark).
const insertIndex = position === 'before' ? found.startIndex : found.endIndex - 1;

// Build the text. Each paragraph terminated by \n so it becomes its own paragraph.
// When inserting BEFORE the anchor, the result is:
//   ...prev paragraph\n  [our text\n  for each para]  anchor\n...
// When inserting AFTER, the anchor's trailing \n already exists, so we just append
// our paragraphs each ending in \n at the position right after the anchor's text.
let insertText;
if (position === 'before') {
  insertText = paragraphs.map((p) => p + '\n').join('');
} else {
  insertText = '\n' + paragraphs.join('\n');
}

const update = await docs.documents.batchUpdate({
  documentId: DOC_ID,
  requestBody: {
    requests: [{ insertText: { location: { index: insertIndex }, text: insertText } }],
  },
});

stdout.write(JSON.stringify({
  anchor: truncate(anchor),
  position,
  inserted_paragraphs: paragraphs.length,
  insert_index: insertIndex,
}, null, 2) + '\n');

// --- helpers ---

function findParagraphRange(doc, anchorText) {
  let firstMatch = null;
  let matches = 0;
  for (const elem of doc.body?.content || []) {
    if (!elem.paragraph) continue;
    const text = (elem.paragraph.elements || [])
      .map((e) => e.textRun?.content || '')
      .join('')
      .replace(/\n+$/, '');
    if (text.trim() === anchorText.trim()) {
      matches++;
      if (!firstMatch) {
        firstMatch = { startIndex: elem.startIndex, endIndex: elem.endIndex };
      }
    }
  }
  return firstMatch ? { ...firstMatch, matches } : null;
}

function truncate(s, n = 80) {
  return s.length > n ? s.slice(0, n) + '…' : s;
}
