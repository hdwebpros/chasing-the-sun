#!/usr/bin/env node
// List UNRESOLVED Drive comments on the manuscript, compact and numbered.
// Reuses book-edit's _read-comments.mjs (same service account, drive.readonly).
//
//   node .claude/skills/comment-fix/bin/unresolved.mjs              # all open comments
//   node .claude/skills/comment-fix/bin/unresolved.mjs 5-12         # rows 5 through 12
//   node .claude/skills/comment-fix/bin/unresolved.mjs 5,8,9        # rows 5, 8, 9
//   node .claude/skills/comment-fix/bin/unresolved.mjs 5-8,11,14-16 # mix ranges + singles
//   node .claude/skills/comment-fix/bin/unresolved.mjs --json       # raw JSON (selection applies)
//
// Row numbers are 1-based and stable: they are the position in the FULL open list,
// so "comment 7" stays comment 7 even when you select a subset. Use them to fan out
// a batch — one agent per selected comment (see SKILL.md "Batch mode").
//
// The quoted text is what the comment was anchored to WHEN IT WAS MADE — it can be
// stale if the line was since edited. Always confirm against live read-doc.mjs output.

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const readComments = path.join(here, '..', '..', 'book-edit', 'bin', '_read-comments.mjs');

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const spec = args.find((a) => !a.startsWith('-')); // first non-flag arg = row selection

const res = spawnSync('node', [readComments], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
if (res.status !== 0) {
  process.stderr.write(res.stderr || 'failed to read comments\n');
  process.exit(res.status || 1);
}

const all = JSON.parse(res.stdout);
const open = all.filter((c) => c.resolved !== true);

// Parse "5-12", "5,8,9", "5-8,11" into 0-based indices into `open` (preserving original row numbers).
function selectionIndices(s, n) {
  if (!s || s === 'all') return open.map((_, i) => i);
  const picked = new Set();
  for (const part of s.split(',')) {
    const m = part.trim().match(/^(\d+)(?:-(\d+))?$/);
    if (!m) {
      process.stderr.write(`bad selection: "${part}" (use e.g. 5-12, 5,8,9, all)\n`);
      process.exit(1);
    }
    const a = parseInt(m[1], 10);
    const b = m[2] ? parseInt(m[2], 10) : a;
    for (let i = Math.min(a, b); i <= Math.max(a, b); i++) {
      if (i >= 1 && i <= n) picked.add(i - 1);
    }
  }
  return [...picked].sort((x, y) => x - y);
}

const idxs = selectionIndices(spec, open.length);

const stripHtml = (s) => (s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

if (asJson) {
  // Attach the stable 1-based row number so the orchestrator can label the batch.
  console.log(JSON.stringify(idxs.map((i) => ({ row: i + 1, ...open[i] })), null, 2));
} else if (!open.length) {
  console.log('No unresolved comments. 🎉');
} else if (!idxs.length) {
  console.log(`No rows match that selection (there are ${open.length} open comments).`);
} else {
  console.log(`${idxs.length} of ${open.length} unresolved comment(s):\n`);
  for (const i of idxs) {
    const c = open[i];
    console.log(`${String(i + 1).padStart(2)}. [${c.id}]`);
    console.log(`    note:  ${c.content || '(empty)'}`);
    console.log(`    quote: ${stripHtml(c.quotedFileContent?.value).slice(0, 240)}`);
    console.log('');
  }
}
