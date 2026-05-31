#!/usr/bin/env node
// Set the named paragraph style of headings in the Drive doc.
//
//   echo '[{"find":"Chapter Thirty-Four","style":"HEADING_2"}]' \
//     | node set-heading-styles.mjs
//
// Reads a JSON array of {find, style} from stdin. For each, finds the paragraph
// whose (trimmed) text starts with `find` and is heading-length (< 120 chars),
// and sets its namedStyleType. Used to repair chapter/part headings that were
// manually formatted as normal paragraphs (so Google's TOC and the epub build
// pick them up as real headings). Run styling (font size/weight) is left alone.
//
// Reports per-find match counts and skips finds that match 0 or >1 paragraphs
// (those need a closer look). Applies all changes in one batchUpdate.
import { google } from 'googleapis';
import { getAuthClient, DOC_ID } from './auth.mjs';
import { stdin, stderr, exit } from 'node:process';

const VALID = new Set(['HEADING_1', 'HEADING_2', 'HEADING_3', 'NORMAL_TEXT', 'TITLE', 'SUBTITLE']);

const input = await readStdin();
let edits;
try {
  edits = JSON.parse(input);
  if (!Array.isArray(edits)) throw new Error('expected a JSON array');
} catch (e) {
  stderr.write(`Bad stdin JSON: ${e.message}\n`);
  exit(2);
}
for (const e of edits) {
  if (!e.find || !VALID.has(e.style)) {
    stderr.write(`Each edit needs {find, style} with style ∈ ${[...VALID].join(', ')}\n`);
    exit(2);
  }
}

const auth = await getAuthClient();
const docs = google.docs({ version: 'v1', auth });
const { data: doc } = await docs.documents.get({ documentId: DOC_ID });

// Collect (paragraph text, range, currentStyle) for every paragraph.
const paras = [];
for (const el of doc.body.content || []) {
  if (!el.paragraph) continue;
  const text = (el.paragraph.elements || [])
    .map((pe) => pe.textRun?.content || '')
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
  paras.push({
    text,
    start: el.startIndex,
    end: el.endIndex,
    current: el.paragraph.paragraphStyle?.namedStyleType,
  });
}

const requests = [];
let failed = false;
for (const { find, style } of edits) {
  const hits = paras.filter((p) => p.text.startsWith(find) && p.text.length < 120);
  if (hits.length === 0) {
    stderr.write(`✗ "${find}": no matching paragraph found\n`);
    failed = true;
    continue;
  }
  if (hits.length > 1) {
    stderr.write(`✗ "${find}": matches ${hits.length} paragraphs — too ambiguous:\n`);
    for (const h of hits) stderr.write(`     "${h.text.slice(0, 60)}"\n`);
    failed = true;
    continue;
  }
  const p = hits[0];
  if (p.current === style) {
    stderr.write(`• "${find}": already ${style}, skipping\n`);
    continue;
  }
  stderr.write(`✓ "${p.text.slice(0, 60)}" : ${p.current} → ${style}\n`);
  requests.push({
    updateParagraphStyle: {
      range: { startIndex: p.start, endIndex: p.end },
      paragraphStyle: { namedStyleType: style },
      fields: 'namedStyleType',
    },
  });
}

if (failed) {
  stderr.write('\nAborting — resolve the unmatched/ambiguous finds above. No changes made.\n');
  exit(1);
}
if (requests.length === 0) {
  stderr.write('\nNothing to change.\n');
  exit(0);
}

await docs.documents.batchUpdate({ documentId: DOC_ID, requestBody: { requests } });
stderr.write(`\nApplied ${requests.length} heading-style change(s) to Drive.\n`);

function readStdin() {
  return new Promise((resolve) => {
    let d = '';
    stdin.setEncoding('utf8');
    stdin.on('data', (c) => (d += c));
    stdin.on('end', () => resolve(d));
  });
}
