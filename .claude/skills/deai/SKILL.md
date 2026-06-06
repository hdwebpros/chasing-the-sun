---
name: deai
description: >
  Find AI fingerprints in a passage of the novel and suggest fixes in the author's
  own voice. Use whenever the user asks to scan a page/chapter for AI-sounding prose,
  "AI fingerprints", de-AI a passage, or check writing against their voice. Flag and
  suggest — do not rewrite anything the user hasn't accepted.
---

# deai

Scan one passage. Flag suspected AI tells, score each, suggest a fix in the author's
voice. Terse output — the author skims a table, not prose.

## Before scanning
If `VOICE.md` exists in the repo, read it first. Judge "off-voice" against the
author's actual style, not generic good writing. No VOICE.md yet? Say so and offer to
build one from 2–3 chapters the author confirms are fully theirs.

## What to flag
- **triad** — rule-of-three ("the cold, the dark, and the silence")
- **reframe** — a negative softened/explained by a positive ("it was hard, but worth it")
- **not-just-but** — "not only X but Y" escalation scaffold
- **part-ending** — sentence ending on a tidy participle ("…, his heart pounding")
- **emotion-tell** — naming the feeling instead of showing it ("a wave of grief")
- **signpost** — restating the beat the scene already showed
- **period-flat** — modern-neutral diction where the 19thC setting wants texture (high value)
- **same-opener** — 3+ sentences in a row starting with the same word

These are *natural in moderation*. Flag overuse and clear cases, not every instance.

## Score (0–10)
How strongly the span reads as machine-authored for THIS author. 0–3 fine, 4–6 worth
a look, 7–10 strong tell. A triad in his natural reflective cadence scores low; the
same in a clipped action scene scores high.

## Output — one table, nothing else
| # | span (short) | tell | score | suggested fix (in voice) |
Keep each row tight. After the table, one line: which tell is most overused on this
page. No preamble, no "I scanned…", no recap. If asked why on a row, one sentence.

## Applying fixes
Only when the author says which rows to apply. Then make the smallest edit that
removes the tell, in their voice, and show a diff. Never touch un-accepted spans.

## Orchestration (the full loop)
The main thread stays small — page prose lives only inside the detect subagent.
See `README.md` for the file map and `detect.md` for the subagent contract.

1. `./sync.sh` once (or after Drive edits) → `.deai/manuscript.txt` (190 pages).
2. **Detect page N:** spawn a subagent with `detect.md`'s prompt. It reads `VOICE.md`,
   `taxonomy.json`, `rules.md`, fetches the page itself (`pages.sh` + `stats.mjs`), and
   writes `.deai/page-NN.json`. The main thread shows only the terse table.
2a. **Verify spans (always, after a batch):** `node verify-spans.mjs N` (or a range / `--all`).
   Every flag `span` must be a VERBATIM substring of the page or the review UI silently
   won't highlight it (and apply-fixes would zero-match). Exits non-zero on any pending
   flag that won't highlight — NOT-FOUND = a paraphrase/hallucination (drop or rewrite the
   flag), NEAR-MISS = quotes/whitespace (repair the span). Already-applied decided spans
   are reported as expected-gone, not errors.
3. **Review:** `http://localhost:3000/deai?p=N` — accept/reject/edit, save (persists to
   `.deai/page-NN.json`; does NOT touch Drive).
4. **Learn:** after decisions save, fold durable patterns into `rules.md` (keep it small,
   self-pruning) so later pages flag more accurately.
5. **Apply (explicit):** `node apply-fixes.mjs N` (dry-run) → `--apply` writes accepted
   fixes to Drive → `--commit` rebuilds the epub and commits. `--all` does every decided
   page. Replacement text is auto-normalized to Chicago curly quotes + single spaces, so
   a fix never injects a straight quote. Manuscript writes require an explicit command —
   never auto-apply on save. (Surgical = one `replaceAllText` per pair via
   `book-edit/bin/edit-doc.mjs`; it warns on any zero-match so misses are caught.)
6. **Chicago pass (whole Doc, explicit):** `node ../book-edit/bin/chicago-normalize.mjs`
   (dry-run, shows a sample) → `--apply`. Converts every straight `'`/`"` to contextual
   curly and collapses double-spaces across the entire manuscript, character-surgically
   so inline italics/bold survive. Guards `'tis`/`'73` elisions. Run it when the Doc
   itself holds straight quotes (apply-fixes only normalizes the spans it touches).
7. **Second altitude:** `node tally.mjs` — whole-book counts vs `taxonomy.json` book
   budgets, so the author fixes what's actually excessive, not every local instance.

Two scores always ride together, never merged: **Voice** (off-this-author, Claude's
judgment) and **Detect** (statistical, from `stats.mjs` — a model-free proxy, not GPTZero).
