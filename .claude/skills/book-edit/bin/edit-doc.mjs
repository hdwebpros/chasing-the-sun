#!/usr/bin/env node
// Apply find/replace edits to the Drive doc.
//
// Usage:
//   echo '[{"find": "old", "replace": "new"}, ...]' | node edit-doc.mjs
//
// Each pair becomes a `replaceAllText` request in a single batchUpdate.
// Prints a summary of how many occurrences were replaced for each pair.
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
  stderr.write('No input on stdin. Expected JSON array of {find, replace}.\n');
  exit(2);
}

let pairs;
try {
  pairs = JSON.parse(raw);
} catch (err) {
  stderr.write(`Invalid JSON on stdin: ${err.message}\n`);
  exit(2);
}
if (!Array.isArray(pairs) || pairs.length === 0) {
  stderr.write('Input must be a non-empty array of {find, replace}.\n');
  exit(2);
}

const requests = pairs.map(({ find, replace }) => {
  if (typeof find !== 'string' || typeof replace !== 'string') {
    throw new Error('Each pair needs string `find` and string `replace`.');
  }
  return {
    replaceAllText: {
      containsText: { text: find, matchCase: true },
      replaceText: replace,
    },
  };
});

const auth = await getAuthClient();
const docs = google.docs({ version: 'v1', auth });
const res = await docs.documents.batchUpdate({
  documentId: DOC_ID,
  requestBody: { requests },
});

const replies = res.data.replies || [];
const summary = pairs.map((p, i) => {
  const count = replies[i]?.replaceAllText?.occurrencesChanged || 0;
  return { ...p, occurrences: count };
});
stdout.write(JSON.stringify(summary, null, 2) + '\n');

const missed = summary.filter((s) => s.occurrences === 0);
if (missed.length) {
  stderr.write(
    `\nWarning: ${missed.length} edit(s) matched zero occurrences. ` +
    `Check exact text (curly quotes, whitespace).\n`,
  );
  exit(1);
}
