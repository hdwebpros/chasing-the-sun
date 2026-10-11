# Word-pass judge — rubric for the in-voice alternatives

You are judging every sentence in ONE chapter of *Chasing the Sun* that contains a form of a
word the author leans on across the whole book (the deterministic detector found them; counts
and cluster heat are in the input). Each sentence is usually fine on its own. The damage is
aggregate: the same verb hundreds of times reads as a metronome. Your job is the craft call:
for each flagged sentence, **keep** or **swap candidate**, and for the candidates, write
alternatives in this author's voice.

## The ruler

The author's Obsidian craft notes (vault `ryanboog`, `Writing/Craft Notes`). The load-bearing
Tips are inlined here; the surrounding chapter prose is the register to match; the author is
the veto at review.

- *Take your verbs to the next level* (Anne Faye Jones): hunt the overused past-tense defaults
  and upgrade them; **merge split actions into a single verb** ("He stood up and walked" →
  "He strode"); replace verb+adverb with one precise verb; vary where the verb lands.
- *9 Weak Words to Delete* (Bookfox): **delete the redundant half of "stood up" / "sat down"**;
  hunt your pet crutch word with search and see how many you can cut; plain word over fancy cousin.
- *8 Tricks… Robotic to Pro-Level* (Bookfox): **never reach for the thesaurus just to avoid
  repeating a word**; repetition that intensifies emotion is insistence, not redundancy; skip
  or subordinate stage business.

## keep vs swap candidate

Set `voiceClass`:

- **`concrete` (KEEP)** — the plain word is the right word: a man standing at a grave, standing
  his ground, standing up to someone, standing where he was told to stand, a deliberate held
  posture the scene turns on, a repetition that is clearly insistence. Also: dialogue (character
  voice) unless it's obviously a narrator-ish tag. Leave the alternatives null.
- **`abstract` (SWAP CANDIDATE)** — stage business: "stood up and", "stood there", "stood in
  the doorway", "stood at the window and watched", posture-as-filler before the real action, a
  "stood" within a few lines of another "stood" doing the same job. The verb is doing little;
  the sentence would be as good or better without it or with the action carried by a verb that
  does more work.

**Lean toward swapping in the high-heat clusters** (`cluster` ≥ 6 means six-plus uses within
±4 pages) and toward keeping in the quiet stretches. Across a chapter, expect roughly a third
to a half of flags to be candidates; in a grief or confrontation beat where the standing is the
point, expect none.

## Writing the alternatives (candidates only)

Up to three, each a **complete replacement for the one flagged sentence** (`span`), verbatim-safe:

- `vary` — the same beat carried by a different physical action or a verb that does more work
  (not a synonym for "stand": no "loomed", "rose", "planted himself" unless the scene earns it).
- `merge` — the posture beat removed or folded into the sentence's own action ("He stood and
  crossed to the stove" → "He crossed to the stove"). Must stay inside this one sentence.
- `recast` — the sentence restructured so the posture isn't the verb (the standing becomes a
  prepositional phrase, a participial, or implied by what follows).

Rules:
- **Self-contained.** Use only what is in the flagged sentence. Do not pull a detail or clause
  from `lead` or `after` — apply swaps only this span, so borrowed content would land twice.
- **Register.** Match the surrounding prose: plain, concrete, period-true (1850s–1920s Dublin,
  Boston, Montana, Oregon). No purple, no explainer tails, no metaphor the author didn't invite.
- **Typography.** Curly quotes and apostrophes only (“ ” ‘ ’), single spaces. Never a straight
  quote. Keep dialogue content word-for-word if the sentence contains any.
- Fewer, better options beat three forced ones. One strong `merge` is enough. Null the rest.
- Don't change tense, POV, or who does what.

## Output

Write ONE JSON file at the path you were given, keyed by flag id:

```json
{
  "p12-stand1": { "voiceClass": "concrete", "why": "He is standing at the grave; the word is the beat." },
  "p12-stand2": { "voiceClass": "abstract", "severity": 7,
                  "why": "Stage business before the real action; third stood on the page.",
                  "vary": "…", "merge": "…", "recast": null }
}
```

Every flag id in the input must appear. `severity` 1–10 (how much this instance contributes to
the metronome). `why` is one short line, addressed to the author.
