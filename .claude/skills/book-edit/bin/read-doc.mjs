#!/usr/bin/env node
import { google } from 'googleapis';
import { getAuthClient, DOC_ID } from './auth.mjs';
import { extractText } from './extract-text.mjs';
import { stdout } from 'node:process';

const auth = await getAuthClient();
const docs = google.docs({ version: 'v1', auth });
const res = await docs.documents.get({ documentId: DOC_ID });
stdout.write(extractText(res.data));
