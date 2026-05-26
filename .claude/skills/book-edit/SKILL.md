---
name: book-edit
description: Edit the Chasing the Sun manuscript. Google Drive is the source of truth. Use for any prose change to the book — read current Drive state, apply find/replace edits to Drive, or sync the served epub to match Drive. Never edit `.epub-build-draft/` xhtml files directly; Drive edits flow to the epub via `sync-epub.mjs`.
---

# book-edit

The Chasing the Sun manuscript lives in Google Docs:

- **Doc ID:** `1CVVIvLWLivG-4pCiJ4gI6Cf27d9vEHiQ0kmYOiu8JXo`
- **URL:** https://docs.google.com/document/d/1CVVIvLWLivG-4pCiJ4gI6Cf27d9vEHiQ0kmYOiu8JXo/edit

**Drive is the single source of truth.** The served epub at `public/chasing-the-sun-draft.epub` (and its unzipped form at `.epub-build-draft/`) is downstream of Drive.

## The rules

1. **All prose edits go to Drive first**, via `bin/edit-doc.mjs`. Then run `bin/sync-epub.mjs` to bring the epub in line.
2. **Do not edit `.epub-build-draft/GoogleDoc/section-*.xhtml` directly** for prose changes. That folder is downstream; it gets regenerated from Drive diffs.
3. Structural edits (new sections, image swaps, formatting overhauls) are out of scope for this skill — handle those manually.

## Commands

All scripts assume `cwd` is the project root (`/home/ryan/projects/chasing-the-sun`). Run via `node`.

### Read current Drive doc state
```bash
node .claude/skills/book-edit/bin/read-doc.mjs
```
Prints the doc as plain text (one paragraph per line). Useful for spot-checking before editing.

### Apply find/replace edits to Drive
```bash
echo '[{"find": "fantasy money", "replace": "Irish money somewhere else"}]' \
  | node .claude/skills/book-edit/bin/edit-doc.mjs
```
Takes a JSON array of `{find, replace}` pairs on stdin. Each pair becomes a `replaceAllText` request in a single `batchUpdate` call. Prints per-edit match counts.

**Caution:** find strings must match exactly (curly quotes matter). If a find appears more than once in the doc, all occurrences get replaced.

### Sync the served epub to match Drive
```bash
node .claude/skills/book-edit/bin/sync-epub.mjs
```
Workflow:
1. Fetch current Drive doc text via Docs API.
2. Diff against `.cache/snapshot.txt` (the last-synced state).
3. For each changed paragraph, find the matching `.epub-build-draft/GoogleDoc/section-*.xhtml` file and apply the replacement.
4. Re-zip `.epub-build-draft/` into `public/chasing-the-sun-draft.epub` (mimetype stored, rest deflated).
5. Update `.cache/snapshot.txt` to current state.

If `.cache/snapshot.txt` does not exist, the first run initializes it without making any epub changes — use this for the first-time bootstrap.

## When invoked

If the user asks for a prose tweak to the book:
1. Confirm the exact find/replace pair (quote-aware, full sentence usually safest).
2. Call `edit-doc.mjs` to apply to Drive.
3. Call `sync-epub.mjs` to propagate to the epub.
4. Confirm with the user that Drive now reads correctly.

If the user has been editing in Drive directly and wants the epub updated:
1. Call `sync-epub.mjs`. Done.

## Auth setup (one-time)

Uses a Google Cloud **service account** (no interactive consent needed):

- Key file: `~/.config/book-edit/service-account.json` (mode `600`)
- Service account email: `chasing-the-sun@chasing-the-sun-497514.iam.gserviceaccount.com`
- The Drive doc MUST be shared with that service account email (Editor access).
- Override key path with `BOOK_EDIT_KEY` env var if needed.

See `bin/auth.mjs` for details.
