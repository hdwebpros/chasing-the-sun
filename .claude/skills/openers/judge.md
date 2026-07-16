# Opener-variety judge — rubric for the in-voice recast pass

You are judging flagged sentences from ONE chapter of *Chasing the Sun* whose openers
sit inside a same-class monotony run (almost always bare subject-led, code `S`). The
deterministic classifier found WHERE the prose may go structurally flat. Your job is the
craft call the machine can't make: for each flagged sentence, decide **keep** or
**recast**, and for the recasts, write the new opener **in this author's voice**.

## The ruler

The canonical craft lives in the author's **Obsidian vault** (vault `ryanboog`, folder
`Writing/Craft Notes`, ~152 notes) — query it with the `obsidian` CLI for sentence-variety /
opener craft (`obsidian search query="sentence variety" path="Writing/Craft Notes"`, then
`obsidian read`), never grep a local tree. The old local `craft/sentence/variety.md` was
RETIRED (July 2026) — it reverse-engineered surface rules that flattened the prose. There is
**no VOICE.md**; the surrounding manuscript prose is the ruler and the author is the final veto
at triage. The load-bearing rules below are inlined here — follow them, and lean on Obsidian
and the neighboring prose over any generic "vary your sentences" advice.

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

**Distribute the breaks for rhythm — placement matters as much as count.** *Where* the varied
entrances fall is part of the craft. Spread them so they break up the long stretches of
subject-led prose; don't cluster two or three varied openers together and then leave a wall of
seven or eight S's untouched after them. The aim is an even, readable cadence — an S run
relieved before the ear starts to drone — not a front-loaded burst of variety followed by a
monoculture. **This is a feel, not a formula:** there is no target alternation or ratio (don't
mechanically force S, V, S, V), and four-or-five S in a calm passage is fine. Just keep the
bare-subject runs from piling up, and trust your ear for where a change of entrance does the
most good.

**This rule is machine-enforced — it is easy to read and still violate (cluster the breaks
at the front, leave a wall running on after).** After `--apply`, run
`node .claude/skills/openers/judge.mjs --check "<chapter>"`. It reconstructs the projected
opener stream and FAILS (exit 3) on (a) any residual wall — 6+ bare-subject (`S`) openers in
a row, or 4+ of any one varied style — and (b) any **same-word opener echo**: two varied
openers sharing a fronted word within six sentences where one side is a recast (the
*"In…/In…"* pile-up). A green check is part of "done" — a wall means your breaks are
clustered (spread them); an echo means you varied the type but repeated the word (change the
word or the type). Re-run before presenting.

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

**A recast must be SELF-CONTAINED — re-hinge the opener using only the words already inside
that one flagged sentence.** Do NOT pull a clause or detail from the sentence before or after
to build the new opener (no "folding two beats into one"). Apply only swaps the single flagged
span; the sentence you borrowed from stays put, so the content lands twice. (E.g. recasting
*"She walked to the end of a wharf."* into *"Walking to the end of a wharf, she set her feet
carefully on planks slick with brine."* duplicates the next sentence, *"The planks were slick
with brine and she set her feet carefully."*) If a sentence is too short to vary on its own
words, leave it `signature` and break a different, self-sufficient beat in the same run instead.

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
5. **Vary the WORD, not just the type.** Two prepositional openers are different *types* from
   S but if they share the same fronted word they read as a pile-up — *"In his one good coat…
   In the pews…"* is sophomoric. Never reuse the same opener word (esp. `In`/`On`/`From`/
   `When`/`There`) within a few sentences of another recast or a nearby original opener. Switch
   the word (`In`→`Inside`/`Across`), or better, switch the type (`P`→`C`/`G`). This is the
   `/variety` overlap, and it is **machine-checked**: `judge.mjs --check` fails (exit 3) on any
   same-word varied opener within six sentences where one side is a recast. Recount words, not
   just types, across the whole chapter — not only inside the one run.
6. **Self-contained — never borrow from a neighbor.** Build the new opener only from words
   already in the flagged sentence. Pulling a clause/detail from the sentence before or after
   duplicates it on apply (apply swaps one span; the source sentence stays). Too short to vary
   alone? Keep it `signature` and break a different beat. **Machine-checked**: `judge.mjs
   --check` fails (exit 3) when a recast shares two or more content words with an adjacent
   sentence that aren't in its own original. (rule E corollary)
7. **Preserve meaning and facts.** No new imagery, no invented detail — just re-hinge the
   opener onto what's already there. If a fix leaves *less* concrete than the original, it
   is wrong.
8. **Stay plain.** It must sound like the surrounding paragraph, only un-stuck. No purple
   participials, no archaic inversions.
9. **Never recast a `D` (dialogue) or `F` (fragment) row.** Parked. Keep.

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
