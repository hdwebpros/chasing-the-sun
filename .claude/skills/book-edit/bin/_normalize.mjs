#!/usr/bin/env node
// Normalize chapter/interlude/part front matter across the whole Doc:
//   1. pageBreakBefore=true on every heading; remove the old manual page breaks
//      (empty page-break paragraphs + inline pageBreak elements that sit right
//      before a heading) so there are no double breaks.
//   2. Uniform heading style: HEADING_1 = Garamond 18 bold center,
//      HEADING_2 = Garamond 14 bold center; consistent drop + spaceBelow.
//   3. Uniform subtitle: Garamond 16 italic center (15 for parts/prologue/epilogue).
//   4. Standalone date/place lines: Garamond 12 italic center (12 regular for tier-1).
//   5. Delete stray blank paragraphs inside the heading→body window so every
//      opener is the "same lines apart".
//
// DRY-RUN by default. Pass --apply to write to Drive.
import { google } from 'googleapis';
import { getAuthClient, DOC_ID } from './auth.mjs';

const APPLY = process.argv.includes('--apply');
const auth = await getAuthClient();
const docs = google.docs({ version: 'v1', auth });
const doc = (await docs.documents.get({ documentId: DOC_ID })).data;
const C = doc.body.content;

const PT = (m) => ({ magnitude: m, unit: 'PT' });
const GARAMOND = { fontFamily: 'Garamond' };

// spacing
const HEAD_ABOVE = 36, HEAD_BELOW = 6;
const TIGHT = 4;       // gap between stacked front-matter lines
const BODY_GAP = 16;   // gap below the last front-matter line, before body

const paraText = (p) => (p.elements || []).map((e) => e.textRun?.content || '').join('');
const isEmptyPara = (p) => paraText(p).replace(/[\n\x0b]/g, '').trim() === '';
const hasInlinePB = (p) => (p.elements || []).some((e) => e.pageBreak);
const namedOf = (el) => el.paragraph?.paragraphStyle?.namedStyleType;
const isHeading = (el) => el.paragraph && (namedOf(el) === 'HEADING_1' || namedOf(el) === 'HEADING_2');

// text-run range of a paragraph (excludes trailing newline)
function textRange(el) {
  const runs = (el.paragraph.elements || []).filter((e) => e.textRun);
  if (!runs.length) return null;
  const start = runs[0].startIndex;
  let end = runs[runs.length - 1].endIndex;
  // drop trailing newline char from the style range
  const last = runs[runs.length - 1].textRun.content;
  if (last.endsWith('\n')) end -= 1;
  return end > start ? { startIndex: start, endIndex: end } : null;
}

function isDateLine(text) {
  const t = text.trim();
  if (!t || t.length > 60) return false;
  if (/[“”"]/.test(t)) return false;                 // dialogue, not a stamp
  if (t.split(/\s+/).length > 10) return false;
  const hasYear = /\b1[89]\d\d\b/.test(t);
  const hasPlace = /\b(Dublin|Boston|Grants Pass|Southern Oregon|Oregon|Minnesota|St\.?\s*Paul|Massachusetts|America|Castle Garden|New York)\b/i.test(t);
  const hasWhen = /\b(January|February|March|April|May|June|July|August|September|October|November|December|Spring|Summer|Autumn|Fall|Winter)\b/.test(t);
  return hasYear || ((hasPlace || hasWhen) && t.length < 45);
}

const styleReqs = [];
const deletions = []; // {startIndex,endIndex,why}

// headings already page-broken by a preceding NEXT_PAGE section break:
// the section break does the page break, so don't add pageBreakBefore (would double).
const sectionBrokenHeadings = new Set();
for (let i = 0; i < C.length; i++) {
  if (C[i].sectionBreak?.sectionStyle?.sectionType !== 'NEXT_PAGE') continue;
  for (let k = i + 1; k < C.length && C[k].paragraph; k++) {
    if (isEmptyPara(C[k].paragraph)) continue;
    if (isHeading(C[k])) sectionBrokenHeadings.add(k);
    break;
  }
}

function setPara(el, fields, paragraphStyle) {
  styleReqs.push({ updateParagraphStyle: {
    range: { startIndex: el.startIndex, endIndex: el.endIndex },
    paragraphStyle, fields,
  }});
}
function setText(el, fields, textStyle) {
  const r = textRange(el);
  if (!r) return;
  styleReqs.push({ updateTextStyle: { range: r, textStyle, fields } });
}

// ---- find headings + classify front matter ----
const headingIdxs = [];
for (let i = 0; i < C.length; i++) if (isHeading(C[i])) headingIdxs.push(i);

const plan = [];
for (const hi of headingIdxs) {
  const el = C[hi];
  const t = paraText(el.paragraph).trim();
  const h1 = namedOf(el) === 'HEADING_1';
  let kind;
  if (h1) kind = /^PROLOGUE/i.test(t) ? 'prologue' : /^EPILOGUE/i.test(t) ? 'epilogue' : 'part';
  else kind = /^INTERLUDE/i.test(t) ? 'interlude' : 'chapter';

  // collect window paragraphs after heading
  const win = []; // {idx, el, role}
  let j = hi + 1;
  let bodyFound = false;
  let count = 0;
  const stopAtHeading = kind === 'part';
  while (j < C.length && count < 12) {
    const e = C[j];
    if (!e.paragraph) break;
    if (isHeading(e)) break;
    const p = e.paragraph;
    if (isEmptyPara(p)) { win.push({ idx: j, el: e, role: 'blank' }); j++; count++; continue; }
    // non-empty
    if (kind === 'interlude') {
      // first non-empty = date/place line, then body
      const already = win.some((w) => w.role === 'date');
      if (!already) { win.push({ idx: j, el: e, role: 'date' }); j++; count++; continue; }
      win.push({ idx: j, el: e, role: 'body' }); bodyFound = true; break;
    }
    // part / prologue / epilogue / chapter
    const haveSub = win.some((w) => w.role === 'subtitle');
    if (!haveSub) { win.push({ idx: j, el: e, role: 'subtitle' }); j++; count++; continue; }
    // after subtitle: date line(s) then body (parts stop at next heading)
    if (stopAtHeading) {
      if (win.filter((w) => w.role === 'date').length < 1) { win.push({ idx: j, el: e, role: 'date' }); j++; count++; continue; }
      win.push({ idx: j, el: e, role: 'date' }); j++; count++; continue;
    }
    if (isDateLine(paraText(p))) { win.push({ idx: j, el: e, role: 'date' }); j++; count++; continue; }
    win.push({ idx: j, el: e, role: 'body' }); bodyFound = true; break;
  }
  plan.push({ hi, kind, t, win, bodyFound, h1 });
}

// ---- build style + deletion requests ----
for (const { hi, kind, win, h1 } of plan) {
  const el = C[hi];
  // heading style
  setPara(el, 'namedStyleType,alignment,spaceAbove,spaceBelow,pageBreakBefore', {
    namedStyleType: h1 ? 'HEADING_1' : 'HEADING_2',
    alignment: 'CENTER',
    spaceAbove: PT(HEAD_ABOVE), spaceBelow: PT(HEAD_BELOW),
    pageBreakBefore: !sectionBrokenHeadings.has(hi),
  });
  setText(el, 'weightedFontFamily,fontSize,bold,italic', {
    weightedFontFamily: GARAMOND, fontSize: PT(h1 ? 18 : 14), bold: true, italic: false,
  });

  // which front-matter element is the last before body (gets BODY_GAP)?
  const nonBlank = win.filter((w) => w.role !== 'blank' && w.role !== 'body');
  const lastFM = nonBlank[nonBlank.length - 1];

  for (const w of win) {
    if (w.role === 'blank') { deletions.push({ startIndex: w.el.startIndex, endIndex: w.el.endIndex, why: 'blank in front matter' }); continue; }
    if (w.role === 'body') {
      // ensure body has no stray page break above; leave spacing/alignment otherwise
      setPara(w.el, 'pageBreakBefore', { pageBreakBefore: false });
      continue;
    }
    const isLast = lastFM && w.idx === lastFM.idx;
    const below = isLast && kind !== 'part' ? BODY_GAP : (kind === 'part' ? HEAD_BELOW : TIGHT);
    if (w.role === 'subtitle') {
      setPara(w.el, 'alignment,spaceAbove,spaceBelow,pageBreakBefore', {
        alignment: 'CENTER', spaceAbove: PT(0), spaceBelow: PT(below), pageBreakBefore: false,
      });
      setText(w.el, 'weightedFontFamily,fontSize,bold,italic', {
        weightedFontFamily: GARAMOND, fontSize: PT(h1 ? 15 : 16), bold: false, italic: true,
      });
    } else if (w.role === 'date') {
      const tier1 = kind === 'part' || kind === 'prologue' || kind === 'epilogue';
      setPara(w.el, 'alignment,spaceAbove,spaceBelow,pageBreakBefore', {
        alignment: 'CENTER', spaceAbove: PT(0), spaceBelow: PT(below), pageBreakBefore: false,
      });
      setText(w.el, 'weightedFontFamily,fontSize,bold,italic', {
        weightedFontFamily: GARAMOND, fontSize: PT(12), bold: false, italic: !tier1,
      });
    }
  }
}

// ---- remove old manual page breaks that sit right before a heading ----
function nextNonEmptyIsHeading(from) {
  for (let k = from; k < C.length; k++) {
    const e = C[k];
    if (!e.paragraph) return false;
    if (isEmptyPara(e.paragraph)) continue;
    return isHeading(e);
  }
  return false;
}
for (let i = 0; i < C.length; i++) {
  const e = C[i];
  if (!e.paragraph) continue;
  const p = e.paragraph;
  if (isEmptyPara(p)) {
    if (nextNonEmptyIsHeading(i) && !plan.some((pl) => pl.win.some((w) => w.idx === i))) {
      // empty paragraph (maybe holding a pageBreak) right before a heading → delete it
      deletions.push({ startIndex: e.startIndex, endIndex: e.endIndex, why: hasInlinePB(p) ? 'empty page-break para before heading' : 'trailing blank before heading' });
    }
  } else if (hasInlinePB(p) && nextNonEmptyIsHeading(i + 1)) {
    // content paragraph ending in an inline pageBreak → delete just the pageBreak element
    for (const sub of p.elements) {
      if (sub.pageBreak) deletions.push({ startIndex: sub.startIndex, endIndex: sub.endIndex, why: 'inline pageBreak before heading' });
    }
  }
}

// ---- dry-run report ----
const ROMAN = (k) => k.toUpperCase();
console.log(`Headings: ${plan.length}   style ops: ${styleReqs.length}   deletions: ${deletions.length}\n`);
for (const { kind, t, win, bodyFound } of plan) {
  const sub = win.find((w) => w.role === 'subtitle');
  const dates = win.filter((w) => w.role === 'date');
  const blanks = win.filter((w) => w.role === 'blank').length;
  const body = win.find((w) => w.role === 'body');
  console.log(`• [${kind}] ${t}`);
  if (sub) console.log(`    subtitle: "${paraText(sub.el.paragraph).trim().slice(0,60)}"`);
  for (const d of dates) console.log(`    date:     "${paraText(d.el.paragraph).trim().slice(0,60)}"`);
  if (blanks) console.log(`    blanks deleted: ${blanks}`);
  if (body) console.log(`    body→:    "${paraText(body.el.paragraph).trim().slice(0,55)}"`);
  else if (kind !== 'part') console.log(`    ⚠ no body found in window`);
}
console.log('\nPage-break cleanup:');
const pbDel = deletions.filter((d) => d.why.includes('page'));
for (const d of pbDel) console.log(`    ${d.why} @${d.startIndex}`);

if (!APPLY) { console.log('\n(DRY RUN — pass --apply to write)'); process.exit(0); }

// ---- apply: styles first (index-stable), then deletions descending ----
async function batch(requests, label) {
  for (let k = 0; k < requests.length; k += 250) {
    await docs.documents.batchUpdate({ documentId: DOC_ID, requestBody: { requests: requests.slice(k, k + 250) } });
  }
  console.log(`applied ${requests.length} ${label}`);
}
await batch(styleReqs, 'style ops');
const delReqs = deletions
  .sort((a, b) => b.startIndex - a.startIndex)
  .map((d) => ({ deleteContentRange: { range: { startIndex: d.startIndex, endIndex: d.endIndex } } }));
await batch(delReqs, 'deletions');
console.log('\nDone. Drive updated.');
