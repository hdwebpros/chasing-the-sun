#!/usr/bin/env node
// One-time Drive cleanup to make chapter/interlude headings consistent:
//   1. Every "INTERLUDE" paragraph → Heading 2 (so it lands in the TOC).
//   2. Each chapter's title line (the italic paragraph after the "Chapter X"
//      heading) normalized to 16pt.
//   3. Chapters whose title is line-broken INTO the heading (Ch7, Ch35) get the
//      title moved onto its own italic 16pt paragraph, leaving the heading as
//      "Chapter X" only.
//
// All edits go to the canonical Google Doc via the Docs API. Idempotent: safe to
// re-run (skips anything already in the target shape). Page breaks are NOT
// touched — every interlude already has one in the preceding paragraph.
import { google } from 'googleapis';
import { getAuthClient, DOC_ID } from './auth.mjs';

const auth = await getAuthClient();
const docs = google.docs({ version: 'v1', auth });
const VT = ''; // vertical tab = in-paragraph line break

const get = async () => (await docs.documents.get({ documentId: DOC_ID })).data;
const paraText = (p) => (p.elements || []).map((e) => e.textRun?.content || '').join('');
const apply = (requests) => docs.documents.batchUpdate({ documentId: DOC_ID, requestBody: { requests } });

// ---------- PASS 1: interludes → H2, title sizes → 16pt (no index shifts) ----------
{
  const C = (await get()).body.content;
  const reqs = [];
  for (let i = 0; i < C.length; i++) {
    const el = C[i];
    if (!el.paragraph) continue;
    const t = paraText(el.paragraph).trim();
    const style = el.paragraph.paragraphStyle?.namedStyleType;

    // Interludes → Heading 2
    if (t.startsWith('INTERLUDE') && style !== 'HEADING_2') {
      reqs.push({
        updateParagraphStyle: {
          range: { startIndex: el.startIndex, endIndex: el.endIndex },
          paragraphStyle: { namedStyleType: 'HEADING_2' },
          fields: 'namedStyleType',
        },
      });
    }

    // Chapter title line (italic paragraph right after a "Chapter X" heading) → 16pt
    if (style === 'HEADING_2' && /^Chapter\b/.test(t)) {
      const nx = C[i + 1];
      if (nx?.paragraph) {
        for (const e of nx.paragraph.elements || []) {
          const ts = e.textRun?.textStyle;
          if (ts?.italic && ts.fontSize?.magnitude !== 16) {
            reqs.push({
              updateTextStyle: {
                range: { startIndex: e.startIndex, endIndex: e.endIndex },
                textStyle: { fontSize: { magnitude: 16, unit: 'PT' } },
                fields: 'fontSize',
              },
            });
          }
        }
      }
    }
  }
  if (reqs.length) {
    await apply(reqs);
    console.log(`Pass 1: ${reqs.length} change(s) — interludes→H2 + title sizes→16pt.`);
  } else {
    console.log('Pass 1: nothing to change (already consistent).');
  }
}

// ---------- PASS 2: split line-broken titles out of chapter headings ----------
// One chapter per fetch+batch so there is no cross-edit index math.
async function splitMergedTitle(numberPrefix) {
  const C = (await get()).body.content;
  const el = C.find(
    (e) => e.paragraph
      && e.paragraph.paragraphStyle?.namedStyleType === 'HEADING_2'
      && paraText(e.paragraph).startsWith(numberPrefix)
      && paraText(e.paragraph).includes(VT),
  );
  if (!el) return false; // already split, or not found

  const text = paraText(el.paragraph);
  const vAbs = el.startIndex + text.indexOf(VT);    // first line break, absolute index
  const finalNl = el.endIndex - 1;                  // the paragraph's closing \n
  const title = text.slice(text.indexOf(VT) + 1).replace(new RegExp(VT, 'g'), '').replace(/\n/g, '').trim();

  // Remove the line-broken title from the heading: leaves "Chapter X\n".
  await apply([{ deleteContentRange: { range: { startIndex: vAbs, endIndex: finalNl } } }]);

  // Re-fetch and insert the title as its own italic-16pt NORMAL_TEXT paragraph.
  const C2 = (await get()).body.content;
  const h = C2.find(
    (e) => e.paragraph
      && e.paragraph.paragraphStyle?.namedStyleType === 'HEADING_2'
      && paraText(e.paragraph).trim() === numberPrefix,
  );
  const at = h.endIndex;
  await apply([
    { insertText: { location: { index: at }, text: `${title}\n` } },
    {
      updateParagraphStyle: {
        range: { startIndex: at, endIndex: at + title.length + 1 },
        paragraphStyle: { namedStyleType: 'NORMAL_TEXT' },
        fields: 'namedStyleType',
      },
    },
    {
      updateTextStyle: {
        range: { startIndex: at, endIndex: at + title.length },
        textStyle: { italic: true, fontSize: { magnitude: 16, unit: 'PT' } },
        fields: 'italic,fontSize',
      },
    },
  ]);
  console.log(`Pass 2: split "${numberPrefix}" → title line "${title}"`);
  return true;
}

let splits = 0;
for (const ch of ['Chapter Seven', 'Chapter Thirty-Five']) {
  if (await splitMergedTitle(ch)) splits++;
}
if (!splits) console.log('Pass 2: no merged titles to split (already done).');

console.log('\nDone. Drive updated.');
