# Sentence-Opener Variety — Pass & Plan — *Chasing the Sun*

**Date:** June 24, 2026
**Instrument:** `/openers` — a measurement-first pass that classifies every sentence's
opener and flags same-class monotony runs, then proposes in-voice recasts. Built as a
sibling to `/tic`, `/variety`, `/deai`. Skill: `.claude/skills/openers/`.
**Ruler:** `craft/sentence/variety.md` (canonical; there is no VOICE.md — the craft KB +
the manuscript's own prose is the ruler, the author is the veto at triage).
**Manuscript analyzed:** full ~82.5k-word draft (`.deai/manuscript.txt`, synced from Drive
2026-06-24), 10,195 sentences. Line/page numbers below refer to that file.

---

## The thesis, confirmed by measurement

The book opens **60.6%** of its sentences on a bare subject (`[Name]/[The]/[He]/[She] +
verb`), against a combined **6.8%** for all six *varied* opener types (prepositional,
participial, adverbial, subordinate, conjunction, inversion). That ratio — a subject-led
monoculture with almost no structural variation in the entrance — is the single biggest
structural signature of AI-tinged, flat-paced prose. **20 of 41 chapters** breach the 62%
subject-led budget; the Boston-arrival chapters (Eleven especially, at **80.1%**) are the
epicentre, with runs up to **34 same-shape openers in a row**.

This is not "subject-led prose is bad." Short subject-led sentences are one of this
author's real instruments — they punch, and a grief-ritual run of them is *music*. The
target is **unrelieved** runs in flat *errand* passages (walking a street, settling a room,
a market trip), where the same entrance simply repeats because it was never varied.

**Verdict key:** ✅ built / done · ⚠️ partial · ◻ planned · ❌ open gap

---

## Part 1 — The measurement (read this first)

<!-- regenerate with: node .claude/skills/openers/tally.mjs --md -->

**Whole-book opener distribution** (10,195 sentences):

| class | | count | share | author preference (Rule F) |
|---|---|--:|--:|---|
| `S` | subject-led | 6183 | **60.6%** | **reduce** — overused default, lean on it less |
| `P` | prepositional | 286 | 2.8% | ✅ raise |
| `A` | adverbial | 122 | 1.2% | ✅ raise |
| `J` | conjunction-led | 136 | 1.3% | ✅ raise |
| `C` | subordinate | 78 | 0.8% | ✅ raise (no longer off-voice) |
| `G` | participial | 37 | 0.4% | ✅ raise (no longer off-voice; watch dangles) |
| `I` | inversion | 35 | 0.3% | ✅ raise (sparingly) |
| `D` | dialogue | 1137 | 11.2% | parked |
| `F` | fragment | 2181 | 21.4% | parked (`/tic` owns) |

**Bare subject-led: 60.6%** · varied openers: **6.8%** · 572 monotony runs · 3,267 flagged
sentences across 190 pages.

**Chapters over the 62% subject-led budget (20 of 41):** One ⚠️ 68.8 · Two ⚠️ 78.9 ·
Eight ⚠️ 64.6 · Nine ⚠️ 72.0 · **Eleven ⚠️ 80.1** · Twelve ⚠️ 67.6 · Thirteen ⚠️ 63.4 ·
Fifteen ⚠️ 64.3 · Eighteen ⚠️ 64.8 · Nineteen ⚠️ 70.8 · Twenty-One ⚠️ 64.5 ·
Twenty-Two ⚠️ 65.2 · Twenty-Three ⚠️ 76.8 · Twenty-Six ⚠️ 70.1 · Twenty-Eight ⚠️ 65.2 ·
Twenty-Nine ⚠️ 64.0 · Thirty-Three ⚠️ 73.2 · Thirty-Four ⚠️ 74.2 · Thirty-Six ⚠️ 67.6 ·
Thirty-Seven ⚠️ 64.4. (Full per-chapter table: `node .claude/skills/openers/tally.mjs`.)

**Worst runs:** p50 (34×S, Ch11), p48 (28×S, Ch11), p56 (27×S, Ch12), p51/p52 (23×S, Ch11),
p6 (22×S, Ch2), p168 (19×S, Ch33), p33 (18×S, Ch7), p7/p49 (17×S).

> **Provenance caveat.** Bookfox's verifiable claim is *unrelieved* SVO with **no number**;
> the "3 in a row = amateur" rule is UNSOURCED (`craft/SOURCES.md`). The run threshold (4) is
> a project heuristic to *surface candidates for human judgment*, not a craft law. The
> distribution numbers are exact; the run flags are a to-look list, not a to-cut list.

---

## Part 2 — What the instrument does (built)

A measurement-first pipeline that reuses the existing sync → cache → review → gated-apply
machinery. Nothing writes Drive without an explicit gated step.

| Phase | Component | Status |
|---|---|---|
| 0 Taxonomy | `taxonomy.json` — closed opener-class set + `onVoice` axis + budgets | ✅ |
| 1 Classify | `classify.mjs` — deterministic per-sentence opener class, zero LLM | ✅ |
| 2 Measure | `tally.mjs` — distribution, chapters over budget, worst runs (terminal / `--md`) | ✅ |
| 3 Judge | `judge.md` rubric + `judge.mjs` (emit packet / apply judgments) — in-voice recasts | ✅ |
| 4 Review UI | `/openers` page + `/api/deai/openers` — grouped by chapter & run, opener-code strip | ✅ |
| 5 Apply | `apply-fixes.mjs --openers` — gated Drive writer (dry-run default), `merge-rescan --openers` | ✅ |

**Design choices that matter:**
- **One flag per repeated opener** inside a run (run position 0 is context, not a flag), so
  each recast is independently appliable. Grouped by run in the UI so the surface stays small.
- **Recast applies via `editText`** (like `/tic`); keep = reject, recast/edit = edit. The
  in-voice suggestion lives in `alts.recast`.
- **Span uniqueness:** when a flagged sentence isn't unique in the book, the preceding
  sentence (`lead`) is prepended to the find/replace so `replaceAllText` can't rewrite the
  wrong copy. Verified on both unique and non-unique paths.
- **Reconciles with `/variety`:** a run that is *also* a same-WORD pile-up is annotated
  `alsoVariety`, never emitted as a second card.

---

## Part 3 — The plan (how to work it)

Per Matesic, opener variety is a **late** pass — run it after structure/character are sound.
Chosen workflow: **whole book, measure first**, then chapter-by-chapter recasting.

1. ✅ **Measure the whole book** — done (Part 1). Re-run anytime: `sync.sh` →
   `classify.mjs` → `tally.mjs`.
2. ◻ **Recast the worst chapters first**, in leverage order: **Eleven → Two → Twelve →
   Twenty-Three → Thirty-Four → Nineteen → Nine → Twenty-Six → Thirty-Three** (highest %S
   and longest runs). For each: `judge.mjs --emit` → subagent judges per `judge.md` →
   `judge.mjs --apply` → author triages at `/openers` → `apply-fixes.mjs --openers --apply`.
3. ◻ **Re-measure** after each batch to watch %S fall and confirm no opener over-correction
   (a P- or A-monoculture replacing the S one is its own tell).
4. ◻ **Tune budgets** in `taxonomy.json` once a few chapters are done and the felt-right
   thresholds are clear.

**Pilot done (Ch Eleven):** judged in-voice (175 rows → **9 monotone recasts, 166 keep** —
deliberately conservative; the church-threshold, lapsed-faith, gin-bottle and harbor-grief
runs are signature). Recasts front a place/time phrase or fold two SVO beats into one; no
clause/participial openers, no triads. **Queued in the cache, not applied to Drive** —
awaiting author triage. (One sample, p54-o6, edges toward a double-and triad and should be
vetoed/edited at triage — exactly the human-veto the pass is built around.)

---

## Part 4 — House rule (RESOLVED by author, June 2026)

The earlier draft of this doc raised an "open question": the brainstorm wanted participial /
subordinate-clause openers, but `craft/sentence/variety.md` marked both **off-voice**. **The
author has now settled it:** that ban was an AI-inherited constraint from the retired
`VOICE.md`, never the author's preference. It is removed. The standing rule (now Operating
Rule F in `craft/sentence/variety.md`):

- **No opener style is off-voice.** Prepositional (`P`), subordinate clause (`C`),
  conjunction (`J`), adverbial (`A`), participial (`G`), inversion (`I`) — all sanctioned;
  the gate is the best writing for the sentence.
- **Bare subject-led (`S`) is the overused default — use it noticeably more sparingly;** bring
  the varied styles forward.
- **Flag: four sentences in a row on the same style** (any style). The classifier now applies
  this uniformly; `pctS_max` lowered to 0.50 to lean the book down off 60.6% S.
- Genuine signature runs (grief cadence, deliberate build) still **keep** — sparingly governs
  flat/errand prose, not earned peaks.

Still open: ◻ the **Mantel/Follett/Fitzgerald model passages** the brainstorm asked for must
be **fetched and quoted** (never from training) before they inform guidance — a research TODO.

---

## Priority shortlist (if time is short)

1. ◻ **Recast Chapter Eleven** end-to-end (pilot already judged — just triage + apply).
2. ◻ **Chapters Two, Twelve, Twenty-Three** next (worst %S after Eleven).
3. ◻ **Re-measure** to confirm %S drops without an opener over-correction.
4. ✅ **House rule decided** (Part 4): no opener style off-voice; subject-led used sparingly.
5. ◻ **Source the author-models** (Part 4.2) if they're to inform guidance.
