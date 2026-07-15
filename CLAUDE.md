## What this repo is
Two things in one repo:
1. **A Nuxt 4 website** (chasingthesun) that serves the novel *Chasing the Sun* as an immersive reading experience (`/read` is an epub.js reader, `/twitch` is a chapter slideshow experience, plus about/characters/music-video pages).
2. **A manuscript-revision toolchain** — a set of Claude Code skills (`.claude/skills/`), local review UIs (Nuxt pages backed by `server/api/`), and a distilled writing-craft knowledge base (`craft/`) used to revise the novel.

**The manuscript itself is NOT in this repo.** It lives in a Google Doc; Drive is the single source of truth. The repo only holds the generated epub and local caches.

## Commands

```bash
npm run dev             # dev server on :3000
npm run build           # production build (prebuild regenerates app/data/twitch-slideshows.json)
npm run build:epub      # rebuild served epub fresh from the Google Doc (--promote)
bash .claude/skills/deai/sync.sh   # refresh .deai/manuscript.txt from Drive — run BEFORE any scan
```

There are no tests or linters configured.

## The manuscript pipeline (the core invariant)

```
Google Doc (canonical) ──► scripts/build-epub-from-drive.mjs --promote ──► public/chasing-the-sun-draft.epub
```

- **All prose/structural edits go to the Doc first**, then rebuild. Never hand-patch the epub or any `.epub-build-draft/` xhtml — that path is dead. If the Doc has bad data (e.g. malformed headings), fix it in Drive; don't add workarounds to the build.
- **The only Drive writers** are the `book-edit` skill's scripts (`.claude/skills/book-edit/bin/` — `edit-doc.mjs`, `insert-paragraphs.mjs`, `chicago-normalize.mjs`, etc.) via a service account. The Google Drive MCP is read-only, but comments ARE readable via the service account (`_read-comments.mjs`).
- **Manuscript edits require an explicit instruction.** Exploratory phrasing ("does this work?") never triggers a Drive write. "Approved" ≠ write; wait for the explicit command.
- Typography standard: curly quotes and single spaces, always. Never inject straight quotes into the Doc.
- Headings in the Doc must be real Heading 1 (PART) / Heading 2 (chapter/interlude) paragraph styles or the build's TOC won't see them.

## Craft knowledge base (`craft/`)

In Obsidian, we have the distilled writing-craft research (Bookfox, Matesic, primary canon) that all review passes judge against. 
OLD VERSION: `craft/INDEX.md` local and it's related files; load a lens file (`craft/<lens>/*.md`) only when working that lens. The research is the ruler — there is no hand-authored voiceprint (VOICE.md was retired); the author is the veto. 
NEW VERSION: Obsidian. Folder is `Writing > Craft Notes`. Use the CLI for that. My writing-craft research lives in an Obsidian vault, folder
Writing/Craft Notes (~150 notes). Access via Obsidian CLI (IMPORTANT).
Notes are tagged (topic tags like endings, prose, tension-pacing;
mode tags like mode/anti-pattern). Each note has a 'Tips' summary
section first — prefer Tips over full notes for context economy;
pull full notes only when instructed or when Tips are insufficient.
When giving craft feedback, ground findings in these notes and cite
the source note. Separate any opinion not grounded in a note.

The story bible (per-chapter structural summary generated from the Drive text) lives in three derived files at repo root — see "Story bible" below. `sources-raw/` holds raw research transcripts for provenance.

**IMPORTANT** The Craft Notes must be accessed by Obsidian CLI. DO NOT GREP and look local, we have Obsidian CLI. 

## Story bible
Three derived files describe the manuscript (never re-derive from
chapters unless told):
- bible-index.md — lean per-chapter records (synopsis, cast, timeline,
  tension, motif flags, thread slugs). DEFAULT: load this for any
  structural or novel-wide question.
- motif-ledger.md — motif/object tracking organized by motif (the only
  three tracked: paper, name, doors). Load ONLY for seeding, payoff,
  or symbolism questions.
- bible-full.md — verbose original. Never load whole; pull single
  chapter sections only.
If the manuscript changes, flag that the affected bible entries may
be stale.