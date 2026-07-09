#!/usr/bin/env node
// One-off: insert the new "Chapter Thirty-Four — Two is a verdict" into the Drive
// doc, immediately after Ch 33's last paragraph, then fix paragraph/run styles so
// the heading is a real HEADING_2 and the title/dateline/separators are centered.
// Idempotent guards: aborts if the renumber hasn't run (no "Chapter Thirty-Five")
// or if this chapter already exists ("Chapter Thirty-Four" present).
import { google } from 'googleapis';
import { getAuthClient, DOC_ID } from './auth.mjs';

const NUM = 'Chapter Thirty-Four';
const TITLE = 'Two is a verdict';
const DATE = 'Grants Pass. Summer, 1904. Four years in the valley.';
const NEXT = 'Chapter Thirty-Five';
const ANCHOR_TAIL = 'He did not write it back to her.';
const SEP = '* * *';

const body = [
  'The job was nothing. A storefront on G Street, one rusted awning bracket that wanted a coat of iron paint before the summer sun finished the rust for good. An hour’s work for a man with two good legs. William had bid it himself and told no one he meant to climb it himself.',
  'Samuel Frederickson set the ladder and kept both hands on the rails. He was thirty-four and broad through the shoulders, with dark curly hair that never quite surrendered to a cap. Under his white overalls he wore a bow tie, every working day, and he was the only painter in the valley who did. William had hired him for the steadiness and kept him for it, and taught him the one thing he set above the trade. Handsome is as handsome does.',
  '“I’ll cut that in, Mr. Boog. Ten minutes.”',
  '“You’ll hold the ladder. That’s your job today.”',
  'Samuel did not let go of the rails. “That reach will find your hip.”',
  '“My hip is my own affair.” William leaned his stick against the brick and set a toothpick in his teeth. “Load the brush and hand it up.”',
  'Samuel loaded it. He held it out and did not smile.',
  SEP,
  'Three rungs up, the brush just to the iron, the left hip let go.',
  'No warning came with it. Dry rungs this time, no dew to blame and no ladder kicking out from under him. He came off all at once and dropped the short way into the alley dirt, landing on the right side, the good side. It took the blow and went wrong in its turn. The brush stayed shut in his fist.',
  'Small. That was the worst of it. He had fallen the height of a kitchen chair, in front of the shop, in front of the crew, and it cost one second and no drama at all. Nobody cried out. One of the young painters started for him and Samuel caught the boy by the arm and held him back, because he knew that being hauled up off the ground would hurt the old man worse than the ground had.',
  'Flat in the dirt, William looked at the sky and did not curse it. Both hips his now. The left that was already done, and the right that had just caught a fall it would remember. A man can argue with one bad hip. Two is a verdict, and there is no doctor in the room to refuse.',
  'He got himself sitting on the bottom rung. “Well,” he said. “That’s that.”',
  SEP,
  'That evening he had Samuel come to the shop. On the counter lay the book of accounts and, beside it, the smaller book where his paint formula lived in his own hand, the white lead and boiled oil he had measured and remeasured for forty years until it held where other men’s peeled.',
  '“Sit down. You’re buying a business.”',
  '“I haven’t the money for a business, Mr. Boog.”',
  '“You’ll pay me out of the work, a little at a time, no interest. It’s a gift dressed up as a sale so your pride can take it.” He turned the formula book to face the younger man. “The accounts, the crew, the paint that holds when the cheap stuff peels, the sign over the door.”',
  'Samuel looked at it and kept his hands at his sides. “That’s your name on the sign.”',
  '“It is.”',
  'He worked the toothpick and looked at the young man a while, the bow tie, the steady hands. Then he told him the whole of it, which he had never told a living soul, because a painter in a bow tie would keep it and never use it against him.',
  'Born in Dublin to a father who never claimed him, he had come up with a name so rare he was the only one wearing it in all of Ireland. The priests said what the schoolyard said. Worthless. Cursed. A name like that would die with him and no one would mark the day.',
  '“So I told them they were wrong,” he said. “I’ve been arguing it fifty years.”',
  'There was a paper he kept. Every child born to him, he wrote the name out in full. The ones the ground took, he marked with an X. The paper was meant to fill with names. He had crossed an ocean to fill it with names, hung the name over storefronts and pressed it into deeds from Boston to the Rogue, out-building the verdict one wall at a time. If the world would decide what his name was worth, he would decide harder.',
  '“And the X’s keep gaining on the names.” He said it to his hands. “Seven of my children in the ground, Samuel. Every son I ever had among them but the baby out in St. Paul. You keep a count like that long enough and you start to wonder if the priests had it right. Not about the name. About me. That whatever I hold close, I lose.”',
  'He turned his hands over on the counter.',
  '“There’s a boy in St. Paul. Alex. I held him the once, laid him in a crib, and got on a train. He knows his father as a name his sisters say and money that comes on a Tuesday.” The toothpick went down on the wood. “People think I came out here for the land. I came out here because the ones of mine who’ve done well are the ones who got clear of me. My oldest girl put an ocean and a convent wall between us, and she is flourishing. So I keep the boy a thousand miles back, and I keep him alive by staying out of his sight. That’s the plan, start to finish. It’s the last move I have left.”',
  'Samuel was slow to answer. “That’s a hard way to love a person.”',
  '“It’s the only way left that works.”',
  'He laid his hand flat on the formula book and pushed it the last inch across the counter.',
  '“Paint was the last thing that kept my head above the water, and I can’t climb to it anymore. So take it. Do it right, and keep your word even when it costs you.” His eyes stayed on the book. “I’m setting the brush down. First thing I ever set down on purpose.”',
  'Samuel picked the book up careful, like it might come apart at the spine. “I’ll keep your name on the sign.”',
  '“Leave it or paint over it. It’s yours now.” William reached for his stick. “The name’s found other walls.”',
  'Samuel went out with the book under his arm. William stayed on after the light failed. His brushes hung clean on their nails, where his own hand had hung them, and he did not get up to touch one. Forty years his arms had reached for something over his head. Nothing up there asked to be reached for now.',
  'He sat until the shop went full dark, then walked home on the stick.',
];

const paras = [NUM, TITLE, DATE, ...body];

const auth = await getAuthClient();
const docs = google.docs({ version: 'v1', auth });

const trimmed = (el) =>
  (el.paragraph?.elements || []).map((e) => e.textRun?.content || '').join('').replace(/\n+$/, '').trim();
const firstRunStyle = (el) => {
  for (const e of el.paragraph?.elements || []) {
    if (e.textRun && (e.textRun.content || '').trim()) return e.textRun.textStyle || {};
  }
  return {};
};

let doc = (await docs.documents.get({ documentId: DOC_ID })).data;
let els = doc.body.content.filter((el) => el.paragraph);

if (!els.some((el) => trimmed(el) === NEXT)) {
  console.error(`ABORT: "${NEXT}" not found — run the renumber step first.`);
  process.exit(1);
}
if (els.some((el) => trimmed(el) === NUM)) {
  console.error(`ABORT: "${NUM}" already exists — chapter appears already inserted.`);
  process.exit(1);
}
const anchor = els.find((el) => trimmed(el).endsWith(ANCHOR_TAIL));
if (!anchor) {
  console.error('ABORT: Ch 33 anchor paragraph not found.');
  process.exit(1);
}

// Phase 1: insert the paragraphs AFTER the anchor (inherits body formatting).
const insertIndex = anchor.endIndex - 1;
const text = '\n' + paras.join('\n');
await docs.documents.batchUpdate({
  documentId: DOC_ID,
  requestBody: { requests: [{ insertText: { location: { index: insertIndex }, text } }] },
});
console.error(`Inserted ${paras.length} paragraphs after Ch 33.`);

// Phase 2: re-read, then fix styles by locating the new paragraphs.
doc = (await docs.documents.get({ documentId: DOC_ID })).data;
els = doc.body.content.filter((el) => el.paragraph);
const findExact = (t) => els.find((el) => trimmed(el) === t);

const numEl = findExact(NUM);
const titleEl = findExact(TITLE);
const dateEl = findExact(DATE);
const nextEl = findExact(NEXT);
if (!numEl || !titleEl || !dateEl || !nextEl) {
  console.error('ABORT: could not relocate inserted paragraphs for styling.');
  process.exit(1);
}
const seps = els.filter(
  (el) => trimmed(el) === SEP && el.startIndex > numEl.startIndex && el.startIndex < nextEl.startIndex,
);

// Copy the real chapter heading's look from the neighboring chapter heading.
const nps = nextEl.paragraph.paragraphStyle || {};
const nrs = firstRunStyle(nextEl);
const headTextStyle = { bold: true, fontSize: { magnitude: 14, unit: 'PT' } };
if (nrs.weightedFontFamily) headTextStyle.weightedFontFamily = nrs.weightedFontFamily;
if (typeof nrs.bold === 'boolean') headTextStyle.bold = nrs.bold;
if (nrs.fontSize) headTextStyle.fontSize = nrs.fontSize;
const headFields = ['bold', 'fontSize', nrs.weightedFontFamily ? 'weightedFontFamily' : null]
  .filter(Boolean)
  .join(',');

const requests = [];
requests.push({
  updateParagraphStyle: {
    range: { startIndex: numEl.startIndex, endIndex: numEl.endIndex },
    paragraphStyle: {
      namedStyleType: nps.namedStyleType || 'HEADING_2',
      alignment: nps.alignment || 'CENTER',
      indentFirstLine: { magnitude: 0, unit: 'PT' },
      indentStart: { magnitude: 0, unit: 'PT' },
    },
    fields: 'namedStyleType,alignment,indentFirstLine,indentStart',
  },
});
requests.push({
  updateTextStyle: {
    range: { startIndex: numEl.startIndex, endIndex: numEl.endIndex - 1 },
    textStyle: headTextStyle,
    fields: headFields,
  },
});
for (const el of [titleEl, dateEl, ...seps]) {
  requests.push({
    updateParagraphStyle: {
      range: { startIndex: el.startIndex, endIndex: el.endIndex },
      paragraphStyle: {
        alignment: 'CENTER',
        indentFirstLine: { magnitude: 0, unit: 'PT' },
        indentStart: { magnitude: 0, unit: 'PT' },
      },
      fields: 'alignment,indentFirstLine,indentStart',
    },
  });
}

await docs.documents.batchUpdate({ documentId: DOC_ID, requestBody: { requests } });
console.error(`Styled: heading (${nps.namedStyleType || 'HEADING_2'}) + title + dateline + ${seps.length} separators.`);
console.error('DONE');
