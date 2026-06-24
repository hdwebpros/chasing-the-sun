---
name: openers
description: Measure and improve sentence-OPENER variety across the Chasing the Sun manuscript — break the bare subject-led ("[Name]/[The] [verb]") monoculture that flattens AI-tinged prose. Use when the author asks to fix sentence openers, vary how sentences start, measure opener monotony, run the "openers" pass, or work the /openers page. A deterministic classifier tags every sentence's opener CLASS and flags same-class monotony runs (measurement, zero LLM); an in-voice judge proposes recasts that lean on bare subject-led less and bring the varied opener styles (prepositional, subordinate clause, conjunction, adverbial, participial, inversion) forward — no opener style is off-voice; the gate is the best writing for the sentence. Flag and suggest — never write Drive until the author queues a fix and runs the gated apply step.
---

# openers — sentence-opener variety pass

Sibling to `/tic`, `/variety`, `/deai`. Where `/variety` kills literal same-WORD pile-ups
one paragraph at a time, **openers** measures and breaks **same-TYPE** monotony across the
whole book — chiefly the bare subject-led run (`S`), the structural signature of flat,
AI-tinged prose. It is **measurement-first**: it tells you WHERE the prose goes flat before
anything is rewritten, and nothing touches Drive without an explicit gated step.

## The ruler

`craft/sentence/variety.md` is canonical (there is **no VOICE.md** — deleted; the craft KB +
the manuscript's own prose is the ruler, the **author is the veto at triage**). Load-bearing
facts from that lens, baked into this pass:

- **Author Rule F (June 2026):** lean on bare subject-led **far less** — it's the overused
  default. Bring the varied styles **forward**: prepositional (`P`), subordinate clause (`C`),
  conjunction (`J`), adverbial (`A`), participial (`G`), inversion (`I`). **No opener style is
  off-voice** (an earlier draft banned clause/participial openers — an AI-inherited constraint
  from the retired VOICE.md, removed by author direction).
- **The flag: four in a row on the SAME style** — any style, S or varied — raise it and vary
  at least one. Don't swap an S-wall for a P-wall.
- **But keep genuine signature runs.** A grief-ritual run of six "He [verb]" sentences is the
  **music** — "sparingly" governs the flat/errand prose, not earned peaks. When the run is a
  deliberate build, keep it.
- **Pick the best writing** for each sentence (the only gate). **Never create a triad** while
  fixing. Watch dangling modifiers on participial openers. A fix isn't done when the
  repetition is gone — it's done when an opener **actually varies**.

## Target distribution (author, June 2026)

The whole-book opener mix to steer toward — **bands, not quotas** (over-fitting a target is its
own monoculture). The book sits at ~60.6% `S` / ~6.8% varied today; these lean it down. Lives in
`taxonomy.json` `targets`; the `/openers` chapter view shows each chapter's mix against it.

| class | target share | note |
|---|--:|---|
| `S` subject-led | **40–55%** | down from 60.6% — keeps clarity and momentum |
| `F` fragments | 10–20% | 21% is fine; cap to keep punch (`/tic` owns) |
| `D` dialogue | 10–20% | scene-dependent; strong as-is |
| **varied (P+G+A+C+J+I)** | **15–30%** | **boost significantly** — prepositional & subordinate shine for setting/immersion, participial for action |
| `P` prepositional | 6–10% | |
| `C` subordinate | 5–8% | |
| `G` participial | 4–7% | |
| `A` adverbial | 3–5% | |
| `J` conjunction-led | 3–5% | |
| `I` inversion | 1–2% | |

## Pipeline

```
sync.sh ─► classify.mjs ─► openers-page-NN.json   (+ openers-summary.json)
(Drive)    deterministic    PageDoc/Flag caches      machine report
              │                   │
              │                   ├─► tally.mjs ............ the MEASUREMENT report (terminal / --md)
              │                   ├─► /api/deai/openers .... aggregate, grouped by chapter+run
              │                   │      └─► /openers ...... the review page (keep / recast / edit)
              │                   │             └─► /api/deai/decisions (mode=openers) autosave
              │                   └─► judge.mjs --emit ───► subagent + judge.md ───► judge.mjs --apply
              │                          (fills voiceClass + alts.recast — IN-VOICE, cache only)
              └─────────────────────────────────────────────► apply-fixes.mjs --openers [--apply --commit]
                                                                 (the ONLY Drive writer — gated)
```

## Workflow

1. **Sync** (always — stale cache = wrong line numbers): `bash .claude/skills/deai/sync.sh`
2. **Classify** (measurement, safe): `node .claude/skills/openers/classify.mjs`
3. **Read the report FIRST** (the "measure first" deliverable):
   `node .claude/skills/openers/tally.mjs` — whole-book distribution, chapters over budget,
   worst runs. `--md` emits the block for `OPENERS-PASS.md`.
4. **Judge a chapter in-voice** (fills the `recast` suggestions; cache only, no Drive):
   - `node .claude/skills/openers/judge.mjs --emit "Chapter Eleven" > packet.json`
   - spawn a subagent: read `judge.md` + `craft/sentence/variety.md`, judge `packet.json`,
     write `{id:{voiceClass,recast?}}` → `judgments.json`
   - `node .claude/skills/openers/judge.mjs --apply judgments.json`
   - **rhythm gate (don't skip):** `node .claude/skills/openers/judge.mjs --check "<chapter>"`
     — fails (exit 3) if any wall is left running on (6+ `S` in a row, or 4+ of one varied
     style). Enforces variety.md Rule F's *distribute, don't cluster* line, which prose alone
     doesn't. Must be green before you present a chapter.
5. **Author triages** at `http://localhost:3000/openers` — **two views, tabbed:**
   - **surgical** — run-by-run, one sentence at a time (precise, but slow over 3k+ sentences).
   - **chapter (bunch)** — the whole prologue / interlude / chapter rendered as continuous
     prose, every opener colour-coded inline, flagged sentences carrying their recast, with
     the chapter's live mix shown against the target bands and **accept-all-recasts / keep-all**
     bulk controls. Built for blowing through a chapter at a time.
   Per row either way: **keep** (most — deliberate subject-led punch), **recast** (in-voice
   suggestion), **edit** (your own). Both views share the same decisions (autosave).
6. **Apply** the queued recasts to Drive (gated, dry-run by default):
   - `node .claude/skills/deai/apply-fixes.mjs --openers <NN|range|--all>` (preview)
   - add `--apply` to write Drive, `--commit` to rebuild the epub + git commit

## The flag / cache shape

`openers-page-NN.json` is a normal `PageDoc` (`server/utils/deai.ts`), so the decisions
endpoint and apply-fixes just work. Openers-specific fields per flag:
`code` (opener class), `opener` (literal words), `span` (verbatim sentence — UI highlight +
Drive find), `lead` (preceding sentence — prepended at apply time when `unique:false` so
`replaceAllText` can't rewrite the wrong copy), `runId/runLen/runCodes/runPos` (the run),
`alsoVariety` (same-word sub-run — `/variety` overlaps; annotate, never double-flag),
`voiceClass` (`signature`=keep | `monotone`=recast, set by judge), `alts.recast` (the
in-voice suggestion). Decisions apply via `editText` like `/tic` (keep = reject; recast/edit
= edit). `fix` is an unused placeholder.

## Hard rules (non-negotiable)

- **Flag and suggest; never rewrite what the author hasn't queued.** Drive writes only through
  `apply-fixes.mjs --openers --apply`, which is dry-run by default.
- **Recast toward on-voice openers only** (prepositional / SVO-fold / sparing adverb-comma).
  Never manufacture a dependent-clause or participial opener.
- **Never create a triad.** Recount after every recast. Two beats or four, never three.
- **Most rows KEEP.** Subject-led prose is an instrument here; flag *unrelieved* runs in flat
  passages, not SVO on sight. When in doubt, keep.
- **Safety:** never overwrite a decided `openers-page-NN.json` — re-scan writes
  `openers-rescan-NN.json`; fold in with `node .claude/skills/deai/merge-rescan.mjs --openers NN`.
- **Sequencing:** per Matesic this is a LATE pass — run after structure/character are sound.

## Files

- `taxonomy.json` — the closed opener-class set + `onVoice` axis + budgets + author `targets`.
- `classify.mjs` — deterministic classifier + run detector → caches + `openers-summary.json`
  (carries `targets`) + `openers-chapters.json` (full per-chapter sentence stream w/ codes +
  flagId, powering the chapter/bunch view).
- `server/api/deai/openers-chapter.get.ts` — serves one chapter's prose stream for the bunch view.
- `tally.mjs` — the measurement report (terminal / `--md`).
- `judge.md` — the in-voice recast rubric (cites `craft/sentence/variety.md`).
- `judge.mjs` — `--emit <chapter|pNN>` work packet · `--apply <judgments.json>` merge.
- shared: `server/api/deai/openers.get.ts`, `app/pages/openers.vue`,
  `.claude/skills/deai/apply-fixes.mjs --openers`, `merge-rescan.mjs --openers`.
