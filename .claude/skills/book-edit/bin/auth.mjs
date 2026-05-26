import { google } from 'googleapis';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const KEY_PATH =
  process.env.BOOK_EDIT_KEY ||
  path.join(os.homedir(), '.config', 'book-edit', 'service-account.json');
const SCOPES = ['https://www.googleapis.com/auth/documents'];

export async function getAuthClient() {
  if (!fs.existsSync(KEY_PATH)) {
    throw new Error(
      `Missing service account key at ${KEY_PATH}. ` +
      `Set BOOK_EDIT_KEY to override the path, or place the JSON key there.`,
    );
  }
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_PATH,
    scopes: SCOPES,
  });
  return auth.getClient();
}

export const DOC_ID =
  process.env.BOOK_DOC_ID || '1CVVIvLWLivG-4pCiJ4gI6Cf27d9vEHiQ0kmYOiu8JXo';

export const SERVICE_ACCOUNT_EMAIL = (() => {
  try {
    return JSON.parse(fs.readFileSync(KEY_PATH, 'utf8')).client_email;
  } catch {
    return null;
  }
})();
