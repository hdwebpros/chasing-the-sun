---
name: book-edit
description: Edit the Chasing the Sun manuscript. Google Drive is the source of truth. Use for any prose or structural change to the book — read current Drive state, apply edits to Drive, then regenerate the served epub directly from Drive with build-epub-from-drive.mjs. Never edit `.epub-build-draft/` xhtml files directly.
---

# book-edit

The Chasing the Sun manuscript lives in Google Docs:

- **Doc ID:** `1CVVIvLWLivG-4pCiJ4gI6Cf27d9vEHiQ0kmYOiu8JXo`
- **URL:** https://docs.google.com/document/d/1CVVIvLWLivG-4pCiJ4gI6Cf27d9vEHiQ0kmYOiu8JXo/edit

**Drive is the single source of truth.** The served epub at
`public/chasing-the-sun-draft.epub` is regenerated *fresh from Drive* on every
build — it is never hand-patched. If the book is wrong, fix the Doc and rebuild.
See [[fix-drive-source-not-build-workarounds]].

## The model

```
edit the Google Doc  ──►  node scripts/build-epub-from-drive.mjs --promote  ──►  served epub
```

The build exports the Doc as a native EPUB, splits it into one `section-NN.xhtml`
per chapter/part/interlude (driven by Google's nav, which only lists real
Heading-1/2 paragraphs), regenerates `nav.xhtml` + `package.opf`, injects the
cover, and optimizes images. No diff, no snapshot, nothing to drift.

## The rules

1. **All edits go to the Doc first**, then regenerate. Never edit
   `.epub-build-draft/GoogleDoc/section-*.xhtml` — that path is dead.
2. **Headings must be real Heading 1/2 paragraph styles** in the Doc, or Google's
   TOC (and the build) won't see them. PART → Heading 1; Chapter/Interlude →
   Heading 2. If a chapter goes missing from the TOC, its heading is a manually
   formatted normal paragraph — fix the *style* in Drive.
3. **Manuscript edits require an explicit instruction** — see
   [[manuscript-edits-require-explicit-command]].

## Commands

Run from the project root (`/home/ryan/projects/chasing-the-sun`).

### Read current Drive doc state
```bash
node .claude/skills/book-edit/bin/read-doc.mjs
```

### Apply prose find/replace edits to Drive
```bash
echo '[{"find": "old text", "replace": "new text"}]' \
  | node .claude/skills/book-edit/bin/edit-doc.mjs
```
JSON array of `{find, replace}` on stdin → one `replaceAllText` each. Curly
quotes matter; a find that appears more than once replaces every occurrence.

### Fix heading paragraph styles in Drive
```bash
echo '[{"find":"Chapter Forty","style":"HEADING_2"}]' \
  | node .claude/skills/book-edit/bin/set-heading-styles.mjs
```
Sets the named style of the paragraph that starts with `find`. Use when a
chapter/part/interlude isn't showing up in the TOC. `bin/fix-chapter-consistency.mjs`
is a one-off that normalized interludes→H2, chapter title sizes→16pt, and split
merged titles — kept as a record / re-runnable template.

### Insert new paragraphs into the Doc
```bash
echo '{"anchor":"...exact paragraph text...","before":["new para"]}' \
  | node .claude/skills/book-edit/bin/insert-paragraphs.mjs
```
Inserts paragraphs immediately `before` (or `after`) an anchor paragraph.

### Regenerate the served epub from Drive  ← the build
```bash
node scripts/build-epub-from-drive.mjs            # → scratch: public/chasing-the-sun-from-drive.epub
node scripts/build-epub-from-drive.mjs --promote  # → served: public/chasing-the-sun-draft.epub
npm run build:epub                                # same as --promote
```
Preview the scratch build in the dev app at `/read?epub=from-drive` before
promoting. The export step is `bin/export-epub.mjs` (read-only Drive export).

### Refresh the prompter's per-section image manifest
```bash
node scripts/extract-epub-images.mjs
```
**Run this after every `--promote`.** The prompter (and `app/data/twitch.ts`)
key off `section-NN.xhtml` filenames; regenerating the epub can renumber
sections, so `app/data/epub-images.json` must be rebuilt to match. If section
numbering shifts, verify `twitch.ts` `epubHref` values still line up.

## Auth setup (one-time)

Google Cloud **service account** (no interactive consent):
- Key file: `~/.config/book-edit/service-account.json` (mode `600`)
- Service account: `chasing-the-sun@chasing-the-sun-497514.iam.gserviceaccount.com`
- The Doc must be shared with that email (Editor). `export-epub.mjs` requests the
  `drive.readonly` scope; the edit helpers use `documents`.
- Override the key path with `BOOK_EDIT_KEY`. See `bin/auth.mjs`.
