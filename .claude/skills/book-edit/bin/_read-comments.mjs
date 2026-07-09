#!/usr/bin/env node
import { google } from 'googleapis';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const KEY_PATH =
  process.env.BOOK_EDIT_KEY ||
  path.join(os.homedir(), '.config', 'book-edit', 'service-account.json');
const DOC_ID = process.env.BOOK_DOC_ID || '1CVVIvLWLivG-4pCiJ4gI6Cf27d9vEHiQ0kmYOiu8JXo';

const auth = new google.auth.GoogleAuth({
  keyFile: KEY_PATH,
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});
const client = await auth.getClient();
const drive = google.drive({ version: 'v3', auth: client });

let comments = [];
let pageToken = null;
do {
  const res = await drive.comments.list({
    fileId: DOC_ID,
    fields: 'nextPageToken,comments(id,content,quotedFileContent,resolved,createdTime,modifiedTime,author/displayName,replies(content,author/displayName))',
    pageSize: 100,
    pageToken,
  });
  comments = comments.concat(res.data.comments || []);
  pageToken = res.data.nextPageToken;
} while (pageToken);

console.log(JSON.stringify(comments, null, 2));
