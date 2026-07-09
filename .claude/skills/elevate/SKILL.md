---
name: elevate
description: >
  Lift a flat manuscript line to the book's OWN strongest register. Use when the author wants a
  sentence to "hit the marks" — poetic, double-duty verbs, real punch — without going weird. This is
  the LEAN engine: it imitates the author's best existing prose (prologue + Ch1) instead of obeying a
  rulebook, and swings for it. Point it at a line, a passage, or the unresolved comments. Returns five
  finished options per line for the author to JUDGE. SUGGEST ONLY — book-edit's edit-doc.mjs writes,
  on the author's pick. Sibling to /comment-fix, but free-form and example-driven, not gate-driven.
---

# elevate

The author is a great **judge** of a sentence and doesn't want craft jargon. Every other skill that
fed an agent the big `craft/sentence/sentence-craft.md` ruler produced prose that was either **vanilla**
(hugging the safest words to obey the rules) or **weird** (lunging past natural speech when told to
reach). This skill throws the rulebook out and does the one thing that actually raises the floor and
caps the weirdness at once: **it imitates the book's own best lines.**

The model writes to the level of the prose in front of it. So we put the author's *strongest* sentences
in front of it, tell it to match their altitude, and let it swing.

## The marks (what a good option hits)

- **A verb or word pulling double duty** — image + meaning in one stroke (*lives, wept, reclaimed,
  negotiates, finds, gold, drags*). **This is the lift** — not a comparison.
- **A concrete, true, slightly-unexpected physical detail** instead of an abstraction.
- **Range** — reach past metaphor/antithesis/repetition into the rest of the toolkit, but reach **only
  as far as a real person would actually speak.**

## AUTO-FAIL — the AI tells (why an option gets thrown out)

These are the load-bearing bans. Left free, the model reaches for these to "sound literary"; they are
the #1 reason a lift reads as machine-made. An option that does any of these is dead on arrival:

- **Lifting with a comparison.** No *like ___*, no *the way ___*, no *as if ___*. Reaching for a
  simile/metaphor to elevate a line is the top AI tell. If your best idea is a comparison, **kill it and
  lift with a literal physical detail + a double-duty verb instead** — that is almost always stronger.
- **Figurative density.** Across all five options, comparisons should be near zero. One rare, earned
  figure at most across a passage, and never the device the line leans on.
- **Abstract reach dressed as poetry** (*"something the famine had left behind on purpose"*). If a
  stranger couldn't photograph it, it's an abstraction, not a detail.
- **Dead / worn metaphor** (*to the bones of itself, a sea of faces, weather the storm*).
- **No triad / rule-of-three, no em dash, no "Its X, not Y but X" cadence.**

## The one guardrail (replaces every rule)

Every option must sound like it belongs **beside the lines below** — the book's own best pages.
- Flatter than these → you under-reached (**vanilla**). Swing harder.
- Stranger than these, something no one in this book would say → you over-reached (**weird**). Pull back.

These lines ARE the target altitude. Match them. (Sources: the author's prologue + Chapter 1 — his
real sentences, the imitation target. This is NOT a reintroduced rule-based voiceprint; it is prose to
imitate. Refresh the set from the manuscript's strongest pages as the book grows.)

> **Double-duty verbs / words**
> - Paint still lives under the fingernails.
> - William stows his hat and coat and negotiates the chair, joint by joint.
> - The walls wept with damp.
> - Dublin reclaimed the room.
> - Below, a soft, steady drip finds the stone.
> - …a sky where the afternoon light has already begun to gold and lean west.
> - Behind his eyes he climbs down eighty years to the damp world he once knew.
>
> **Concrete, true, unexpected detail**
> - Among his diplomas, a child's drawing hangs crooked, pinned low where small hands could reach.
> - …the table's edge worn pale where years of hands had gripped it.
> - His left hand grips the railing with the patience of a man who has learned not to argue with his own body.
> - Coal smoke hung in a gray haze, its reek catching at the back of the throat.
> - It still carries the ghost of a Dublin accent that sixty years in America has not fully erased.
>
> **Punch / the short landing**
> - Then a cry, raw and furious.
> - the wet walls held the light.
> - Ordinary boys lived.

## The loop

```
point at a line (or pull comments) ──► fan out (1 agent / line, lean card) ──► 5 options each ──► author picks ──► edit-doc.mjs
```

1. **Scope.** A line the author quotes, a passage, or the open comments:
   ```bash
   node .claude/skills/comment-fix/bin/unresolved.mjs        # if working from comments
   node .claude/skills/book-edit/bin/read-doc.mjs | sed -n 'START,ENDp'   # live text — never trust stale quotes
   ```
2. **Fan out — one fresh agent per line** (so nothing context-bombs). Paste each the card below with
   that line's surrounding paragraph. More than ~3 lines crafted in one context goes flat; fan out.
3. **Present five options per line**, all swinging, for the author to judge. No table, no jargon.
4. **Collate** (your job): kill any option that drifted weird before the author sees it; after the author
   picks, scan the chosen lines for the same shape repeating within a few sentences and offer a swap.
5. **Apply on the pick — explicit go only:**
   ```bash
   echo '[{"find":"<exact live text>","replace":"<the picked line>"}]' \
     | node .claude/skills/book-edit/bin/edit-doc.mjs
   ```

## The agent card (paste to each fan-out agent; fill the two <…> slots)

```
You are lifting ONE line of the historical novel "Chasing the Sun" to the book's own best register.
Suggest only — return options, write nothing.

THE MARKS: the lift is a verb/word doing double duty (image + meaning at once) plus a concrete, true,
slightly-unexpected physical detail. NOT a comparison.

AUTO-FAIL (throw the option out): lifting with a comparison — no "like ___", no "the way ___", no "as
if ___". Reaching for a simile/metaphor to sound literary is the #1 AI tell; if your best idea is a
comparison, kill it and lift with a literal physical detail + a strong verb instead. Also out: abstract
reach dressed as poetry ("something the famine left on purpose"); dead metaphor ("to the bones of
itself"); figurative density (comparisons across the five should be near zero); triads; em dashes.

GUARDRAIL: every option must sound like it belongs beside these lines from the book — match their
altitude. Flatter = vanilla (swing harder). Stranger, something no one would say = weird (pull back).
  - Paint still lives under the fingernails.
  - William stows his hat and coat and negotiates the chair, joint by joint.
  - The walls wept with damp.
  - Dublin reclaimed the room.
  - Among his diplomas, a child's drawing hangs crooked, pinned low where small hands could reach.
  - the table's edge worn pale where years of hands had gripped it.
  - Coal smoke hung in a gray haze, its reek catching at the back of the throat.
  - Then a cry, raw and furious.
  - the wet walls held the light.

DO: swing. Be poetic. Trust the author to judge.
DON'T: explain your picks, name a figure of speech, include a deliberately safe/vanilla option, use an
em dash, or write anything you couldn't hear a real person say.

SCENE (for context, do not rewrite the neighbors):
<surrounding paragraph from the live doc>

LIFT THIS LINE: <the exact current line(s)>

Output ONLY five finished options as a numbered list (1. 2. 3. 4. 5.), each a complete sentence or
two, each genuinely different from the others, all aiming at the marks. No wrapper tags, no labels,
no commentary — just the five numbered lines under a heading that repeats the line being lifted.
```

## Notes

- `craft/sentence/sentence-craft.md` is NOT loaded here — that's deliberate. It stays the deep
  reference / critic doc; this engine runs on examples, not rules.
- If the author says the five are still flat → "go further, bolder." If weird → "too strange, stay
  closer to the book." The exemplar set is the dial.
- Reuses book-edit's service account (read-doc, edit-doc) and comment-fix's `unresolved.mjs`.
