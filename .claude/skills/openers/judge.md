# Opener-variety judge — rubric for the in-voice recast pass

You are judging flagged sentences from ONE chapter of *Chasing the Sun* whose openers
sit inside a same-class monotony run (almost always bare subject-led, code `S`). The
deterministic classifier found WHERE the prose may go structurally flat. Your job is the
craft call the machine can't make: for each flagged sentence, decide **keep** or
**recast**, and for the recasts, write the new opener **in this author's voice**.

## The ruler

Read **`craft/sentence/variety.md`** first — it is the canonical, source-grounded lens
for this exact problem (SVO-monotony, opener pile-ups, the signature-vs-tic test). There
is **no VOICE.md** (it was deleted; the craft KB plus the surrounding manuscript prose is
the ruler, and the author is the final veto at triage). The load-bearing rules below come
straight from that lens — follow them over any generic "vary your sentences" advice.

## What the run actually is (keep vs recast)

> **Bookfox's real claim is UNRELIEVED SVO — with no number.** A run of same-shape
> openers is only a problem when it is doing **no job**: errand prose, stage business, a
> survey of a low-stakes scene. A grief-ritual run of six "He [verb]" sentences after a
> death is the **music**, not the mistake. (craft/sentence/variety.md §1, §2)

Set `voiceClass`:

- **`signature` (KEEP)** — the run is deliberate: an action beat, a revelation,
  accumulating dread, a withholding build that lands on a turn, a grief cadence. Most
  flagged rows in a tense or high-emotion run are signature. Leave `recast` null.
- **`monotone` (RECAST)** — flat errand/accumulation prose where the same `[Subject]
  [verb]` shape just repeats because the entrance was never varied. These are the targets.

**Lean on bare subject-led far less** (Operating Rule F). The author wants subject-led used
*sparingly* and the varied styles *more prominent*. So in a flat errand run, be willing to
recast **several** beats — enough that no four-in-a-row same-style monoculture remains and
the run reads as a real mix of entrances. In a genuine signature run, recast **none**. Don't
swap an S-wall for a P-wall: **vary the TYPE across the run.**

## Writing a recast (`recast` field) — for `monotone` rows only

**Every opener style is fair game** — pick whichever is the best writing for the sentence
(craft/sentence/variety.md, Rule F; there is no off-voice opener style):

- **Prepositional / time-place** (`P`): *"She counted the coins in her palm."* → *"In her
  palm she counted the coins."* Great for scene-setting.
- **Subordinate clause** (`C`): *"When the bell rang, the room stilled."*
- **Participial** (`G`): *"Clutching the letter, she stepped out."* — **watch dangling
  modifiers**: the participle must attach to the main-clause subject (*"Moving his arm
  slowly, his hand…"* is wrong — his hand isn't moving his arm).
- **Adverbial** (`A`): *"Slowly, the fog lifted."*
- **Conjunction** (`J`): *"But the door held."* — plain and strong.
- **Inversion / existential** (`I`): *"There was a bottle behind the flour."*
- **Fold two flat SVO beats into one** where that's the best move — a shorter run whose
  surviving opener carries more.

Aim for a spread of styles across the chapter; don't let your own recasts become a new
monoculture.

### Hard constraints (the load-bearing house rules)

1. **No new triad.** Never collapse the run into an "A, B, and C" list or three matched
   beats. Use two beats or four, never the smooth matched three. **Recount after every
   recast.** (craft/sentence/variety.md rules B, C, D)
2. **A recast isn't done when the repetition is gone — it's done when an opener actually
   VARIES.** Cutting one "She" is mere subtraction; make sure at least one sentence now
   *opens* differently. (rule E)
3. **No em dashes.** Chicago curly quotes, single spaces.
4. **Vary the TYPE across a run** — don't make two recasts in the same run both `P`. Don't
   trade an S-monoculture for a P-monoculture.
5. **Preserve meaning and facts.** No new imagery, no invented detail — just re-hinge the
   opener onto what's already there. If a fix leaves *less* concrete than the original, it
   is wrong.
6. **Stay plain.** It must sound like the surrounding paragraph, only un-stuck. No purple
   participials, no archaic inversions.
7. **Never recast a `D` (dialogue) or `F` (fragment) row.** Parked. Keep.

## Output

Return ONLY a JSON object keyed by flag id:

```json
{
  "p52-o3": { "voiceClass": "monotone", "recast": "In her palm she counted the coins before she paid." },
  "p52-o4": { "voiceClass": "signature" }
}
```

`recast` present only when `voiceClass` is `monotone`. Omit any id you're leaving pending.
Feed this file to `node .claude/skills/openers/judge.mjs --apply <file>`.
