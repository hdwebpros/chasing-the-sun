---
name: tic
description: Thin a recurring stylistic tic across the whole manuscript with the author in the loop. Use when a phrase or sentence-shape repeats often enough to read as a metronome (the negation-correction fragment "Not defeated. Just thinking.", "the smallest nod", "flinch", etc.). Enumerate every instance deterministically, judge each against VOICE.md (signature vs tic), suggest in-voice rewrites for the tic ones only — flag and suggest, never rewrite anything the author hasn't accepted.
---

# tic — whole-book frequency-tic thinning

A sibling pass to `/deai` and `/brogue`, for a different problem. A tic is not a
per-line defect — each instance is usually fine. The damage is **aggregate**: the
same shape 90+ times reads as a metronome an editor flags on sight. So this pass is
**grouped by pattern across the book**, not page by page, and the author judges the
*rhythm*. Most instances stay.

## The core distinction (why this isn't just find/replace)

Many "tics" are also the author's **signature**. The negation-correction fragment is
the proof: VOICE.md cites `"Not today."` (own line) and the concrete reversal
`"Not roses. Not lilies. The scrappy, stubborn kind that grows between the cobblestones."`
as confirmed-his. The keep-vs-thin axis is **not** the syntactic shape — it's:

- **concrete-landing** → negates expected nouns and lands on a *chosen concrete detail*
  (`Not decoration. / Protection.` · `Not cracked. / Broke.`) → **his voice, keep.**
- **abstract-dissolving** → explains motivation/state in the abstract, especially the
  `Not because X. Because Y.` explainer → **the tic, thin.**

Detection is deterministic (a grep — complete, no hallucination). The *judgment* is the
model's only job, and it is made against VOICE.md, exactly like the de-AI subagent.

## Pipeline

```
manuscript.txt ──detect.mjs──► tic-page-NN.json   (every unit; SPAN = prev sentence +
   (deai/sync.sh)                fragment[s]; the LANDING sentence stored as context;
                                 free grammar-safe `cut` candidate = prior sentence)
                       │
        VOICE.md ──judge.mjs──► fills voiceClass (concrete|abstract) + severity, and
   (hand-authored judgments)    in-voice alts.{vary,merge} for ABSTRACT units only
                       │
   /tic review  ◄──/api/deai/tic──  grouped by sub-shape (single·two-beat·anaphora·
   keep / cut / vary / merge / edit   dialogue), abstract-first; "keep all your-voice"
   ──/api/deai/decisions (mode=tic)──► decisions persist to tic-page-NN.json
                       │
        apply-fixes.mjs --tic --apply ──► Drive (gated; DRY-RUN by default)
                       └─ --commit also rebuilds the epub + commits
```

## Files

- `detect.mjs` — deterministic enumerator. SPAN is the whole unit so every replacement
  is a clean full-sentence swap (no double-space seam). The trailing LANDING sentence is
  stored for display/judgment but is NOT replaceable, so a cut never deletes a signature
  payoff. Re-run safety mirrors deai: if a `tic-page-NN.json` already holds decisions it
  writes `tic-rescan-NN.json` instead — never clobbers decided pages.
- `judge.mjs` — folds a judgments JSON (`{ "p180-t1": { voiceClass, severity, vary, merge } }`)
  into the caches. Writes ONLY voiceClass / severity / alts — never the author's
  decision/editText. Build judgments by reading the units against VOICE.md; classify
  every narration unit, author vary/merge for the abstract ones only. **In doubt, keep**
  (VOICE.md: never over-flag the concrete reversals; emotional peaks lean keep).

Shared with deai (each takes `--tic`): `apply-fixes.mjs`, `merge-rescan.mjs`,
`verify-spans.mjs`. Review UI: `app/pages/tic.vue` + `server/api/deai/tic.get.ts`;
decisions reuse `server/api/deai/decisions.post.ts` (mode=tic).

## Run it

```bash
.claude/skills/deai/sync.sh                      # refresh manuscript.txt from Drive
node .claude/skills/tic/detect.mjs               # enumerate -> tic-page-NN.json
node .claude/skills/deai/verify-spans.mjs --tic --all   # spans verbatim?
# author judgments.json against VOICE.md, then:
node .claude/skills/tic/judge.mjs judgments.json # classify + suggest
# review at /tic (npm run dev), make keep/cut/vary/merge/edit calls, then:
node .claude/skills/deai/apply-fixes.mjs --tic --all          # DRY RUN
node .claude/skills/deai/apply-fixes.mjs --tic --all --apply  # write Drive
```

## Decision verbs (UI → cache)

- **keep** → `reject` (leave as written; the default lean for concrete/your-voice units)
- **cut** → `edit`, editText = prior sentence alone (drops the fragment); landing stays
- **vary** / **merge** → `edit`, editText = the in-voice rewrite (abstract units only); landing stays
- **edit** → `edit`, editText = the author's own. Seeded with the WHOLE unit (span + the
  trailing landing) and sets `editFull` — so apply-fixes finds `span + ' ' + after`, letting
  a free edit reshape or remove the otherwise-locked landing. cut/vary/merge leave editFull off.

Nothing reaches Drive until `apply-fixes.mjs --tic --apply`. This pass flags and
suggests; it never rewrites the manuscript on its own.
