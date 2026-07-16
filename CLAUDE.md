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

## Craft knowledge base — Obsidian is the ruler

The distilled writing-craft research (Bookfox, Matesic, primary canon; ~152 notes) lives in
the author's **Obsidian vault** and is the single ruler that all craft feedback and review
passes judge against.

- **Vault:** `ryanboog`. **Folder:** `Writing/Craft Notes`.
- **Access ONLY via the `obsidian` CLI** (`~/.local/bin/obsidian`). DO NOT grep a local tree.
  - Search: `obsidian search query="opener variety" path="Writing/Craft Notes"` (or `search:context` for line context).
  - Read: `obsidian read path="Writing/Craft Notes/<Note>.md"` (resolves by name too: `obsidian read file="<Note>"`).
  - List: `obsidian files | grep -i "Craft Notes"`.
- Each note leads with a **'Tips'** summary — prefer Tips over the full note for context economy;
  pull the full note only when instructed or when Tips are insufficient.
- When giving craft feedback, ground findings in these notes and **cite the source note**.
  Separate any opinion not grounded in a note.

**There is NO hand-authored voiceprint (VOICE.md was retired) and none may be reintroduced.**
Do not codify the author's prose voice into local rules — reverse-engineering surface features
of his sentences (short vs long, "subtraction-first," "concrete not metaphor," banned opener
styles) flattens the prose into primer cadence and is exactly what he does not want. Judge each
sentence on craft against the Obsidian notes and the surrounding manuscript prose; **the author
is the veto.**

### Local `craft/` folder — deprecated shadow, mostly retired
The prose-VOICE doctrine (`craft/sentence/*`, `craft/voice/pro-level.md`,
`craft/voice/sound-like-yourself.md`) was **deleted July 2026** because it enshrined the
flattening surface rules above. The only surviving local craft file is
`craft/voice/ai-fingerprints.md` — kept as the **de-AI flag list** (obvious AI junk: anachronism,
purple flourishes, explainer tails, unearned triads, closed-door endings, continuity drift). The
remaining structural lenses (`craft/{character,scene,pacing,tension,setting,dialogue,emotion,device,intimacy}/`)
still back the `/review` engine (`lenses.json`) pending migration to Obsidian; treat Obsidian as
the primary source and flag any collision.

The story bible (per-chapter structural summary generated from the Drive text) lives in three derived files at repo root — see "Story bible" below. `sources-raw/` holds raw research transcripts for provenance.

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