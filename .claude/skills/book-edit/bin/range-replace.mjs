#!/usr/bin/env node
// Replace MULTI-PARAGRAPH spans in the Drive doc. replaceAllText cannot match across a
// paragraph mark (the \n is structural, not literal text), so a find that spans paragraphs
// silently matches nothing. This locates the verbatim span (newlines included) in the doc's
// flat text via a per-char index map, then deletes that range and inserts the replacement
// (its own \n become real paragraph breaks). One batchUpdate PER pair, re-fetching each time
// so indices never go stale. DRY-RUN by default; --apply to write.
//
//   node range-replace.mjs < pairs.json            # dry run (locate + report match counts)
//   node range-replace.mjs --apply < pairs.json    # apply each, one at a time
import { google } from 'googleapis'
import { getAuthClient, DOC_ID } from './auth.mjs'
import { stdin } from 'node:process'

async function readStdin() { let d=''; for await (const c of stdin) d+=c; return d }
const APPLY = process.argv.includes('--apply')
const pairs = JSON.parse((await readStdin()).trim())
if (!Array.isArray(pairs) || !pairs.length) { console.error('Expected non-empty JSON array of {find,replace}.'); process.exit(2) }

const auth = await getAuthClient()
const docs = google.docs({ version: 'v1', auth })

// Build the doc's flat text + a parallel array mapping each flat char -> its doc index.
function flatten(doc) {
  let text = ''
  const idx = []
  for (const el of doc.body.content || []) {
    if (!el.paragraph) continue
    for (const pe of el.paragraph.elements || []) {
      const run = pe.textRun
      if (!run || run.content == null) continue
      const start = pe.startIndex
      const content = run.content
      for (let i = 0; i < content.length; i++) { text += content[i]; idx.push(start + i) }
    }
  }
  return { text, idx }
}

// Locate a verbatim span, tolerant of paragraph-mark newline-count differences. The doc's flat
// text joins consecutive paragraphs with a SINGLE \n, but a find lifted from the synced
// manuscript separates paragraphs with \n\n (blank line). Exact match is preferred; the fallback
// collapses runs of \n to one in BOTH the doc text and the find (keeping a char→doc-index map) so
// the span still resolves to exact doc indices, and still requires a unique match.
function locate(text, idx, find) {
  let at = text.indexOf(find)
  if (at !== -1) {
    if (text.indexOf(find, at + 1) !== -1) return { ambiguous: true }
    return { startIndex: idx[at], endIndex: idx[at + find.length - 1] + 1 }
  }
  const cchars = [], cidx = []
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '\n' && cchars[cchars.length - 1] === '\n') continue // collapse \n run
    cchars.push(text[i]); cidx.push(idx[i])
  }
  const ctext = cchars.join(''), cfind = find.replace(/\n+/g, '\n')
  const cat = ctext.indexOf(cfind)
  if (cat === -1) return { miss: true }
  if (ctext.indexOf(cfind, cat + 1) !== -1) return { ambiguous: true }
  return { startIndex: cidx[cat], endIndex: cidx[cat + cfind.length - 1] + 1 }
}

let ok = 0, fail = 0
for (const { find, replace } of pairs) {
  const { data: doc } = await docs.documents.get({ documentId: DOC_ID })
  const { text, idx } = flatten(doc)
  const loc = locate(text, idx, find)
  if (loc.miss) { console.error(`MISS: span not found verbatim: ${JSON.stringify(find.slice(0,60))}…`); fail++; continue }
  if (loc.ambiguous) { console.error(`AMBIGUOUS (>1x), skip: ${JSON.stringify(find.slice(0,60))}…`); fail++; continue }
  const { startIndex, endIndex } = loc
  console.log(`${APPLY ? 'APPLY' : 'DRY'}: [${startIndex},${endIndex}) ${JSON.stringify(find.slice(0,50))}… -> ${JSON.stringify(replace.slice(0,50))}…`)
  if (!APPLY) { ok++; continue }
  await docs.documents.batchUpdate({
    documentId: DOC_ID,
    requestBody: { requests: [
      { deleteContentRange: { range: { startIndex, endIndex } } },
      { insertText: { location: { index: startIndex }, text: replace } },
    ] },
  })
  ok++
}
console.log(`${APPLY ? 'applied' : 'located'} ${ok}, failed ${fail}`)
if (fail) process.exit(1)
