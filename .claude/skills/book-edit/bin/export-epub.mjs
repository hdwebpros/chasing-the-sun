#!/usr/bin/env node
// Export the Chasing the Sun Google Doc as a native EPUB.
//
// Usage: node export-epub.mjs <output-path>
//
// Uses the same service-account key as the rest of the book-edit skill, but
// requests the drive.readonly scope so it can call files.export. The Doc must
// be shared with the service account (it already is, for editing).
//
// This is read-only against Drive — it cannot modify the manuscript.
import { google } from 'googleapis';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { argv, stderr, exit } from 'node:process';

const KEY_PATH =
  process.env.BOOK_EDIT_KEY ||
  path.join(os.homedir(), '.config', 'book-edit', 'service-account.json');
const DOC_ID =
  process.env.BOOK_DOC_ID || '1CVVIvLWLivG-4pCiJ4gI6Cf27d9vEHiQ0kmYOiu8JXo';

const outPath = argv[2];
if (!outPath) {
  stderr.write('Usage: node export-epub.mjs <output-path>\n');
  exit(2);
}
if (!fs.existsSync(KEY_PATH)) {
  stderr.write(`Missing service account key at ${KEY_PATH}.\n`);
  exit(1);
}

const auth = new google.auth.GoogleAuth({
  keyFile: KEY_PATH,
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});
const client = await auth.getClient();
const drive = google.drive({ version: 'v3', auth: client });

stderr.write('Exporting Doc as EPUB from Drive…\n');
const res = await drive.files.export(
  { fileId: DOC_ID, mimeType: 'application/epub+zip' },
  { responseType: 'arraybuffer' },
);
const buf = Buffer.from(res.data);
fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
fs.writeFileSync(outPath, buf);
stderr.write(`Wrote ${outPath} (${(buf.length / 1024 / 1024).toFixed(2)} MB)\n`);
