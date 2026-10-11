---
name: wordpass
description: Thin a WORD the author leans on across the whole manuscript (stand/stood, hold, sit, carry, fold…) with the author in the loop. Use when the author asks to vary a crutch verb or adjective, "how else can I say stood", run a word pass, or review a word's fingerprint. Deterministic detector enumerates every sentence; one Sonnet judge per chapter marks keep vs swap candidate and writes in-voice alternatives; the author picks at /tic?mode=word. Flag and suggest — nothing reaches Drive until the gated apply step.
---

# wordpass — leaned-on-word thinning

Sibling of `/tic`. A crutch word is not a per-line defect; the damage is aggregate (233
"stand"s in 81k words reads as a metronome). So: enumerate everything deterministically,
have the model judge each instance against the surrounding prose, let the author pick.

**All subagents run on Sonnet 5.5** (`model: "sonnet"`) — hard rule.

## Finding the words (fingerprint report)

A spaCy + wordfreq count over `.deai/manuscript.txt` (lemmatized VERB/ADJ/ADV, ranked by
rate vs general English) is how "stand" was found. Recipe lives in the session scratchpad
history; rebuild on demand with `uv venv --python 3.12`, `uv pip install spacy wordfreq` +
`en_core_web_sm`. Caveat: wordfreq rates are surface-form, so common verbs look inflated —
trust raw counts for sit/stand/hold.

## Pipeline

```
sync.sh ──► detect.mjs --word stand --forms stand,stands,stood,standing ──► .deai/word-page-NN.json
                 (one flag per SENTENCE containing a form; lead/after/unique/cluster recorded)
         ──► verify-spans.mjs --word --all        (spans verbatim?)
         ──► per-chapter input dumps ──► one Sonnet judge per chapter (judge.md rubric)
         ──► merge + validate (no straight quotes, no stand-form left in an alt, all ids)
         ──► tic/judge.mjs --word merged.json     (folds voiceClass/why/alts into caches)
         ──► review at /tic?mode=word  (tabs = words · dialogue parked; A/B/C alts listed in full)
         ──► apply-fixes.mjs --word --all          DRY RUN
         ──► apply-fixes.mjs --word --all --apply  writes Drive (--commit rebuilds epub + commits)
```

- `voiceClass`: `concrete` = keep (the plain word is right); `abstract` = swap candidate.
- `alts`: `vary` (different action/verb doing more work), `merge` (posture beat removed or
  folded, within the one sentence), `recast` (restructured so the posture isn't the verb).
  Shown as A/B/C in the UI. Author's free `edit` replaces the sentence only.
- Non-unique sentences get `lead` prepended at apply time so replaceAllText can't hit the
  wrong copy (same mechanism as /openers).
- Re-running detect on a page that already holds decisions writes `word-rescan-NN.json`
  instead of clobbering. Several words can share the cache (grouped by `tell: word-<lemma>`).

## Files

- `detect.mjs` — enumerator (this folder). `judge.md` — the rubric each chapter judge reads.
- `../tic/judge.mjs --word` — fold judgments. `../deai/{apply-fixes,verify-spans}.mjs --word`.
- UI: `app/pages/tic.vue` (`?mode=word`) · API: `server/api/deai/tic.get.ts?mode=word` ·
  decisions: `server/api/deai/decisions.post.ts` (mode=word).
