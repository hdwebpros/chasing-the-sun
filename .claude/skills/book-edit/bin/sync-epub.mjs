#!/usr/bin/env node
// Sync the served epub to match the current Drive doc state.
//
// 1. Fetch Drive doc text via Docs API.
// 2. Diff against .cache/snapshot.txt (line = paragraph).
// 3. For each changed-paragraph pair, find/replace in the matching
//    .epub-build-draft/GoogleDoc/section-*.xhtml file.
// 4. Re-zip .epub-build-draft/ into public/chasing-the-sun-draft.epub.
// 5. Save new snapshot.
//
// On first run (no snapshot), initializes the snapshot and exits.
// On any unhandled diff (multi-line restructure, insertion, deletion),
// prints the hunk and leaves it for manual handling — the snapshot is
// NOT updated in that case, so a re-run will surface it again.
import { google } from 'googleapis';
import { getAuthClient, DOC_ID } from './auth.mjs';
import { extractText } from './extract-text.mjs';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import url from 'node:url';
import { stderr, stdout, exit } from 'node:process';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const SKILL_DIR = path.resolve(__dirname, '..');
const PROJECT_ROOT = path.resolve(SKILL_DIR, '..', '..', '..');
const SNAPSHOT_PATH = path.join(SKILL_DIR, '.cache', 'snapshot.txt');
const BUILD_DIR = path.join(PROJECT_ROOT, '.epub-build-draft');
const CONTENT_DIR = path.join(BUILD_DIR, 'GoogleDoc');
const EPUB_OUT = path.join(PROJECT_ROOT, 'public', 'chasing-the-sun-draft.epub');

// ---------- 1. fetch Drive ----------
const auth = await getAuthClient();
const docs = google.docs({ version: 'v1', auth });
const res = await docs.documents.get({ documentId: DOC_ID });
const currentText = extractText(res.data);

// ---------- 2. bootstrap if no snapshot ----------
if (!fs.existsSync(SNAPSHOT_PATH)) {
  fs.mkdirSync(path.dirname(SNAPSHOT_PATH), { recursive: true });
  fs.writeFileSync(SNAPSHOT_PATH, currentText);
  stderr.write(
    `Snapshot initialized at ${path.relative(PROJECT_ROOT, SNAPSHOT_PATH)}.\n` +
    `No epub changes applied (first run). Future runs will diff against this state.\n`,
  );
  exit(0);
}

const lastText = fs.readFileSync(SNAPSHOT_PATH, 'utf8');
if (lastText === currentText) {
  stderr.write('No changes since last sync.\n');
  exit(0);
}

// ---------- 3. diff via system `diff` ----------
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'book-edit-'));
const aPath = path.join(tmpDir, 'a.txt');
const bPath = path.join(tmpDir, 'b.txt');
fs.writeFileSync(aPath, lastText);
fs.writeFileSync(bPath, currentText);

let diffOut = '';
try {
  // diff exits 1 when files differ; that's expected, capture stdout.
  diffOut = execSync(`diff "${aPath}" "${bPath}"`, { encoding: 'utf8' });
} catch (err) {
  if (err.status === 1) diffOut = err.stdout;
  else throw err;
}

const hunks = parseDiff(diffOut);
if (hunks.length === 0) {
  stderr.write('No diff hunks parsed. Nothing to do.\n');
  exit(0);
}

// ---------- 4. apply each hunk to xhtml ----------
const applied = [];
const skipped = [];

for (const hunk of hunks) {
  const { op, oldLines, newLines } = hunk;

  if (op === 'c' && oldLines.length === newLines.length) {
    // Pairwise substitution.
    let ok = true;
    const local = [];
    for (let i = 0; i < oldLines.length; i++) {
      const result = applyReplacement(oldLines[i], newLines[i]);
      if (!result.ok) { ok = false; skipped.push({ hunk, reason: result.reason }); break; }
      local.push(result);
    }
    if (ok) applied.push(...local);
  } else {
    skipped.push({
      hunk,
      reason: `Unhandled op=${op} (${oldLines.length} old / ${newLines.length} new). Resolve manually in .epub-build-draft/, then re-run.`,
    });
  }
}

// ---------- 5. report ----------
for (const a of applied) {
  stderr.write(
    `  ${path.basename(a.file)}: "${truncate(a.old)}" → "${truncate(a.new)}"\n`,
  );
}
if (skipped.length) {
  stderr.write(`\nSkipped ${skipped.length} hunk(s) requiring manual handling:\n`);
  for (const s of skipped) {
    stderr.write(`  - ${s.reason}\n`);
    for (const l of s.hunk.oldLines) stderr.write(`      < ${truncate(l, 80)}\n`);
    for (const l of s.hunk.newLines) stderr.write(`      > ${truncate(l, 80)}\n`);
  }
  stderr.write(`\nSnapshot NOT updated. Resolve and re-run to clear these.\n`);
  // Still re-zip what we did apply, so partial progress is visible.
  if (applied.length) repackEpub();
  exit(1);
}

// ---------- 6. re-zip + snapshot ----------
if (applied.length === 0) {
  stderr.write('Diff present but no changes applied. Snapshot left untouched.\n');
  exit(1);
}

repackEpub();
fs.writeFileSync(SNAPSHOT_PATH, currentText);
stderr.write(`\nApplied ${applied.length} edit(s). Epub repacked. Snapshot updated.\n`);

// ---------------------------------------------------------------------------

function applyReplacement(oldText, newText) {
  // Find which xhtml file contains the old text. Use grep -l for speed.
  let candidates;
  try {
    const cmd = `grep -lF ${shellQuote(oldText)} ${shellQuote(CONTENT_DIR)}/section-*.xhtml`;
    candidates = execSync(cmd, { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  } catch (err) {
    // grep exits 1 on no match.
    if (err.status === 1) candidates = [];
    else return { ok: false, reason: `grep failed: ${err.message}` };
  }

  if (candidates.length === 0) {
    return { ok: false, reason: `no xhtml contains: "${truncate(oldText)}"` };
  }
  if (candidates.length > 1) {
    return {
      ok: false,
      reason: `text appears in ${candidates.length} files (${candidates.map((c) => path.basename(c)).join(', ')}): "${truncate(oldText)}"`,
    };
  }

  const file = candidates[0];
  const content = fs.readFileSync(file, 'utf8');
  if (!content.includes(oldText)) {
    return { ok: false, reason: `grep matched but readFile did not — encoding mismatch?` };
  }
  const occurrences = content.split(oldText).length - 1;
  if (occurrences > 1) {
    return {
      ok: false,
      reason: `text appears ${occurrences}× in ${path.basename(file)} — too ambiguous to replace safely`,
    };
  }
  fs.writeFileSync(file, content.replace(oldText, newText));
  return { ok: true, file, old: oldText, new: newText };
}

function parseDiff(out) {
  const lines = out.split('\n');
  const hunks = [];
  let i = 0;
  while (i < lines.length) {
    const m = lines[i].match(/^(\d+)(?:,(\d+))?([acd])(\d+)(?:,(\d+))?$/);
    if (!m) { i++; continue; }
    const op = m[3];
    i++;
    const oldLines = [];
    while (i < lines.length && lines[i].startsWith('< ')) {
      oldLines.push(lines[i].slice(2));
      i++;
    }
    if (lines[i] === '---') i++;
    const newLines = [];
    while (i < lines.length && lines[i].startsWith('> ')) {
      newLines.push(lines[i].slice(2));
      i++;
    }
    hunks.push({ op, oldLines, newLines });
  }
  return hunks;
}

function repackEpub() {
  execSync(`rm -f ${shellQuote(EPUB_OUT)}`);
  execSync(`zip -X0 ${shellQuote(EPUB_OUT)} mimetype`, { cwd: BUILD_DIR });
  execSync(
    `zip -Xur9 ${shellQuote(EPUB_OUT)} META-INF GoogleDoc -x mimetype`,
    { cwd: BUILD_DIR, stdio: ['ignore', 'ignore', 'inherit'] },
  );
}

function shellQuote(s) {
  return `'${s.replace(/'/g, `'\\''`)}'`;
}

function truncate(s, n = 60) {
  return s.length > n ? s.slice(0, n) + '…' : s;
}
