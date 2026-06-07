---
name: brogue
description: >
  Improve the spoken dialogue of Irish (Dublin) immigrant characters into authentic
  Hiberno-English — moderate-to-heavy but never stage-Irish parody. Use whenever the
  user asks to brogue-ify dialogue, add Irish dialect/voice to characters, or run the
  "brogue" pass. Narrator stays modern American. Flag and suggest in the /deai review
  UI (brogue mode) — never rewrite dialogue the user hasn't accepted.
---

# brogue

A sibling pass to `deai`, sharing its plumbing (paragraph-snapped pages, verbatim
spans, the `/deai` review UI, `apply-fixes.mjs`) but a SEPARATE cache
(`.deai/brogue-page-NN.json`) so a brogue decision can never overwrite a decided
de-AI page. Scope is narrow on purpose:

- **Touch only dialogue inside quotes spoken by Irish/Dublin immigrant characters.**
- **Never touch narration** — the narrator's voice is intentionally modern American.
- **Authenticity over density.** Moderate-to-heavy brogue, but parody is itself a
  flagged signal (the `detect`/Parody score) — restraint reads as real.

The author's curated phrase list is `lexicon.txt` (copied from his own
`Phrasestoconsider.txt`); prefer its top tiers, use the "sparingly or not at all"
items rarely.

## Orchestration (the full loop)
The main thread stays small — page prose lives only inside the detect subagent.
See `detect.md` for the subagent contract.

1. `.claude/skills/deai/sync.sh` once (or after Drive edits) → `.deai/manuscript.txt`
   (shared with deai; same 189 pages, same paginator).
2. **Detect page N:** spawn a subagent with `detect.md`'s prompt. It reads `rules.md`
   (the author's durable corrections — e.g. don't over-inject "sure"; use the lexicon,
   don't leave lines flat) and `lexicon.txt`, fetches the page itself
   (`../deai/pages.sh`), and writes a cache file. The main thread shows only the terse
   table. No `stats.mjs` — there is no statistical axis; `pageDetect` is null.
   - **First detection** (no `brogue-page-NN.json` yet) → write `brogue-page-NN.json`.
   - **RE-detection** (file already exists, may hold the author's accept/reject/edit
     decisions) → write `brogue-rescan-NN.json` instead, then
     `node ../deai/merge-rescan.mjs --brogue N`. This preserves every decided flag and
     only adds freshly-found lines as pending. **NEVER overwrite `brogue-page-NN.json`
     directly on a re-run — a direct Write destroys the author's decisions** (same hard
     rule as de-AI; `.deai` is gitignored so the loss is unrecoverable). See
     [[feedback_deai_rescan_never_overwrite_decided_page]].
2a. **Verify spans (after a batch):** `node ../deai/verify-spans.mjs --brogue N`
    (if supported) or eyeball the UI — every flag `span` must be a VERBATIM substring
    of the page or it won't highlight / will zero-match on apply.
3. **Review:** `http://localhost:3000/deai?mode=brogue&p=N` — the review UI in brogue
   mode (scores relabeled **L**ift / **P**arody). accept/reject/edit, autosaves to
   `.deai/brogue-page-NN.json`; does NOT touch Drive.
4. **Apply (explicit):** `node ../deai/apply-fixes.mjs --brogue N` (dry-run) →
   `--apply` writes accepted dialogue to Drive → `--commit` rebuilds the epub +
   commits. `--brogue --all` does every decided brogue page. Replacement text is
   auto-normalized to Chicago curly quotes. Manuscript writes require an explicit
   command — never auto-apply on save.

## Scores (two independent 0–10, never merged)
- **Lift** (`voice`) — how much more authentic/alive the line reads after the change.
- **Parody risk** (`detect`) — higher = scrutinize; may read as overcooked stage-Irish.
  The ideal flag is high lift + low parody.

## Tells (category labels)
`idiom` · `word-order` · `vocab` · `phonetic` · `greeting` · `oath` · `filler`
