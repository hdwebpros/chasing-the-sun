---
name: comment-fix
description: >
  Work through the author's UNRESOLVED Drive comments on the manuscript, proposing a craft fix
  for each one through the sentence-craft gate. Use whenever the author says to "go through the
  comments", "fix the comments", "do a comment pass", or points at commented lines and asks for
  better writing. SUGGEST ONLY by default — fan out one fresh subagent per comment to avoid
  quality decay, collate, and present fixes for approval. The ONLY writer is book-edit's
  edit-doc.mjs, run after the author approves specific fixes. Never write to Drive unprompted.
---

# comment-fix

The author reads the manuscript and drops Google Doc comments on lines that need work
("Needs improvement", "vanilla verbs", "So basic", "Adverb oppo", etc.). This skill turns
each comment into a splendid, in-voice fix — proposed, never auto-applied.

- **Doc ID:** `1CVVIvLWLivG-4pCiJ4gI6Cf27d9vEHiQ0kmYOiu8JXo`
- **Drive is the single source of truth.** Read live every time; comment quotes go stale.
- **THE TEST is the power ladder** (see *The recipe* below), not a rulebook. `craft/sentence/sentence-craft.md`
  is deep reference only — do **not** make the fan-out agents read it in full; that heavy gate is the
  context-bomb path that produced vanilla/weird. The agents run lean on the ladder + the book's own lines.
- **But the ladder is downstream of feeling.** See *Craft from the feeling first* — the lines that land
  are chosen by reading the beat's emotion and the scene's spine FIRST, then picking the figure/verb that
  transmits exactly that. A ladder with no emotional target lands flat or knotted every time. This is why
  peaks can't be fanned out to cold agents — craft them live (next section).

## The loop — TWO passes (this is the whole point)

```
unresolved.mjs [rows] ──► read live doc ──► [check WINS] ──► PASS 1 fan out (breadth) ──► PASS 2 you finish (calibrated) ──► author judges ──► STAGE 3 de-drone GATE (meter) ──► edit-doc.mjs
```

Two graders, cleanly split: **the meter owns drone, the author's ear owns soul.** Passes 1–2 make
each sentence splendid; Stage 3 makes the *set* not drone. They are different jobs — the splendor
agents are one-per-comment and blind to their neighbors, so they physically cannot de-drone. That is
why the drone always crept back *after* the good sentences landed.

**Why two passes.** A cold fan-out agent reading a static brief regresses to *competent-and-safe* —
that is the vanilla. The A-grade work in this project has always come from **you (the calibrated main
context) crafting against the author's accumulated taste**, not from a doc. So agents are for *breadth*;
**you are the finisher.** Do not present raw agent output. Never let "1 of 6 isn't garbage" reach the
author — that solution is already rejected.

⚠️ **And don't over-correct into instruction.** The fix is NOT a bigger brief. Calibration rides in via
[[WINS]] examples + your Pass-2 hand, never more rules. Keep [[AGENT-BRIEF]] lean — it collapses from
too much instruction just as it does from too little.

1. **Pull the open comments** — all, a range, or a list of rows:
   ```bash
   node .claude/skills/comment-fix/bin/unresolved.mjs            # all open: id, note, stale quote
   node .claude/skills/comment-fix/bin/unresolved.mjs 5-12       # just rows 5–12
   node .claude/skills/comment-fix/bin/unresolved.mjs 5,8,9 --json   # those rows, raw (has .row + .id)
   ```
   Row numbers are stable (position in the full open list), so "comment 7" stays comment 7 in any subset.
2. **Read the live doc** so you fix the *current* text, not the stale comment quote:
   ```bash
   node .claude/skills/book-edit/bin/read-doc.mjs | sed -n 'START,ENDp'
   ```
3. **Check [[WINS]] first, then split peaks from valleys.** If a comment's beat is already won, **resurface
   the winner** — skip the agent entirely. Then sort the rest: **peaks** (notes like "make it punch",
   "extremely powerful", "F tier", "weak-ass") are **LIVE-ONLY — you craft them yourself**, leading with
   the emotional read (see *Craft from the feeling first*). Never hand a peak to a cold agent. **Valleys**
   (plain notes on transitions / stage business) go to the fan-out.
4. **PASS 1 — fan out the VALLEYS for breadth. STRICTLY one agent per comment** (only group when comments
   sit on the *same sentence*; a shared paragraph is NOT a reason to group). Each agent gets [[AGENT-BRIEF]]
   filled with that comment's scene/target/note. Agents produce varied raw material; they need not nail it.
5. **PASS 2 — you finish, in this context.** Craft each **peak** from its emotional read + the scene spine,
   from scratch (agent ore, if any, is brainstorm only — do not sand vanilla into soul). For each valley,
   lift the agent's best raw option up the ladder. Run the clearance test, kill anything FLAT or KNOTTED,
   and run the collator checks (opener variety, figure proximity, duplicate beats, continuity). This pass
   is where the author's taste lives — craft the **final six (plain → bold) you would stake your name on.**
6. **Present for the author to judge.** SUGGEST ONLY — your finished six per comment, plain → bold, no
   jargon (see **Output format**). Wait for the author to point at one per line.
7. **Bank the win.** When the author approves a line, append it to [[WINS]] (original → approved, one-line
   why) so it's never re-derived. Then **apply to Drive** — only on explicit go:
   ```bash
   echo '[{"find":"<exact current text>","replace":"<approved fix>"}]' \
     | node .claude/skills/book-edit/bin/edit-doc.mjs
   ```
   Curly quotes matter; the `find` must match the live Doc exactly and uniquely. Then rebuild
   per the book-edit skill if the author wants the epub refreshed. (Resolving the comment itself
   is the author's call / manual for now.)

## Stage 3 — the de-drone gate (the thing that kept failing)

The end goal is both halves at once: *each comment becomes a splendid sentence, AND the set doesn't
drone* (varied openers, length, flow). Passes 1–2 do the first half. This stage does the second —
and it is **mechanical, not by-ear**, because by-ear is exactly what fails (a cold read finds
side-by-side collisions and "fixes" them by alternating `The/He/The/He`, leaving an 80% subject-led
wall with no repeats in it). The drone is the *density* of subject-led entrances, not the collisions.

Run it **after the author picks one option per comment**, on the chosen lines assembled into their
passage (picks in document order, with their unchanged neighbors for context):

1. **Meter the picks.** Assemble the passage and run the deterministic opener meter — zero LLM, can't
   be gamed:
   ```bash
   node .claude/skills/comment-fix/bin/dedrone-check.mjs <<'EOF'
   <the rebuilt passage>
   EOF
   ```
   It reuses the **same** `shared/openers-core.mjs` classifier and the same `/openers` budgets the
   author tuned (S band 0.40–0.55, `pctS_max` 0.55; a 4-in-a-row same-code **wall**; a same-fronted-
   word **echo** within 6). It prints a per-line S/P/C/J/A/G/I map and **✓ PASS / ✗ FAIL**.
2. **If ✓ PASS** — present (or apply) as is. Done.
3. **If ✗ FAIL** — re-enter the flagged lines. **Peaks are yours** (re-enter them live, from the
   feeling — they're marked `[PEAK]` and the agent won't touch them). For the rest, fan out a single
   whole-passage de-drone agent with [[DEDRONE-BRIEF]], handing it the passage + the meter readout. It
   is forbidden to *sand* (swap the opener word) — it must **re-enter** from the beat's most alive
   thing, and it runs the meter on its own output until ✓ PASS before returning.
4. **Re-gate.** Re-run `dedrone-check.mjs` on the result yourself — the agent proposes, the meter
   disposes. Anything still ✗ comes back. Only changed lines need the author's re-nod before Drive.

**The classifier is conservative** (it tags some genuinely-varied openers as S — an irregular
participle "Bent…", a number-word time phrase "Eight years on,"). That's the safe direction: it pushes
toward *more* variety, never less. Don't "fix" it — it is the canonical `/openers` ruler, and the
budgets were tuned against its exact S-rate. Override a false-S flag by eye only when the line clearly
already enters from something other than its bare subject.

## Batch mode — many comments at once

To run **all** the comments or a block of rows:

1. `unresolved.mjs <rows> --json` → the selected comments (each has `.row` and `.id`).
2. Read the live doc once; for each comment, locate its anchor in the *current* text (the quote is
   stale) and grab the surrounding paragraph. Drop any comment whose line is **already revised** in the
   doc — don't burn craft on a fixed line. Check [[WINS]]; resurface any already-won beat.
3. **Pass 1:** launch **one Agent per comment** in a single message (concurrent; group only same-sentence
   comments). Peaks get their own agent.
4. **Pass 2:** as blocks return, *you* finish each one (lift to the WINS bar, clearance test, collator
   checks). Present your finished six **in row order** so the author judges a clean, already-strong list.

Keep a batch judgeable in one sitting (~8–12 lines); take the next range on "next". Track PICKED vs
still-open across batches; never re-touch a picked line; bank every approval into [[WINS]].

## Craft from the feeling first (the thing under the ladder)

This is the missing piece behind every failed batch. The lines the author approves are not crafted by
climbing a ladder toward "bold." They are crafted like this:

1. **Read the beat's emotion + the scene's spine BEFORE writing a word.** What does the POV character feel
   here? What through-line are these lines serving? (e.g. *William controls his eyes as survival — off the
   dead, off the empty bed; the window beat is the hinge because it's the one time his eyes get taken
   against his will.*) The litotes won at the famine peak because **understatement is what numbness sounds
   like** — the figure was chosen to transmit the feeling, not for being "safe."
2. **Then pick the verb/figure that transmits THAT exact feeling.** The ladder is how you grade the
   candidates, not how you find them. A fan-out agent on a static brief has no emotional target, so "bold"
   has nowhere to aim and regresses to competent-and-safe (FLAT) or clever (KNOTTED). **Emotion-blind ore
   cannot be polished into soul afterward** — that is why Pass-2 sanding of vanilla agent output also fails.
3. **Serve the spine across beats, not the sentence in isolation.** Cold agents sever the through-line and
   each line goes generic. When you finish a peak, carry the motif (the eyes, the not-looking) into it so
   the beats compound.

**Consequence for the loop: peaks are LIVE-ONLY.** Any comment flagged a peak (F-tier, "make it punch",
"weak-ass", "extremely powerful") you craft yourself, in this context, leading with the emotional read —
never handed to a cold agent. Fan-out is for **valleys** (stage business, transitions, plain notes) where
plain is correct and breadth is genuinely useful. Less machinery, not more.

## The recipe — the power ladder (the whole test)

Every option must climb this ladder. It replaces the rulebook:

| line | grade | why |
|---|---|---|
| *He ran.* | F | flat — weak verb, predicted slot |
| *Fastly, he ran.* | D | adverb propping a weak verb |
| *He bolted.* | C | one live verb |
| *His feet felt like they were moving earth, his legs a blur of motion.* | B | visceral image |
| *He tore into the atmosphere, outrunning his own breath.* | A | bold image, simple build, felt instantly |

**A-grade = a BOLD, visceral verb or image in a SIMPLE, clean construction you FEEL on the first
read.** Larger-than-life is *good* — as long as it lands instantly.

**Two ways to fail — every reject is one of these:**
- **FLAT** — vanilla/weak verb in its predicted slot (*went still, put, brought, was*). Under-reached.
- **KNOTTED** — clever but obscure / convoluted / unfamiliar; the reader has to stop and decode
  (*went to the lime*, *all eyes and bone*, *in the seams the press of feet*). Over-reached.
  Cleverness the reader must untangle is **not** power.

**The clearance test:** read the option once, fast. Feel it on the first pass → keep. Have to re-read
to parse it → KNOTTED, cut.

**Figures — reach past the tired three, but stay legible.** Metaphor, repetition, and antithesis are
the author's currently over-used figures; lean on the others. But a figure only works when the
swapped-in word is **instantly clear** (Dumas's *steel* = sword, free). Metonymy and synecdoche **die
when the referent needs decoding** — use them only if a reader gets it with zero thought. **Litotes and
hyperbole are the safest** here: they don't *hide* the thing, they dial it up or down (*a body on the
road was nothing worth slowing for*). Not every line needs a figure; on a true valley, plain is right.

## Why fan out — and the failure on each side

This skill exists because of one diagnosis: **quality decays as fixes accumulate in a single
context ("context bomb").** Past ~3–4 crafted sentences in one context, verbs go flat, figures
collapse to "none/repetition", surrounding words go sophomoric. So **never craft a whole chapter's
comments in one context.** One fresh agent per comment keeps every fix at full reasoning.

But isolation has its *own* failure mode, learned the hard way: a lone agent told only "make it
splendid / unpredictable verb" over-reaches into **clever-weird** ("his fist shut on nothing",
"folded into a shawl", "marked the damp corner") and then self-certifies "a person would say this"
when they wouldn't. So the brief must put the **naturalness veto first**, and you must re-check it
on the way back. Freshness from the fan-out; naturalness from the brief + your collation.

## Non-negotiable craft rules (the lessons, do not relearn them)

These are distilled from repeated author corrections. They override any generic "make it pretty" urge.
Rules 1–3 are the heart of *The recipe* above — here as the standing governors.

1. **The clearance test is the veto.** Before anything else, read the line once, fast: *do I feel it on
   the first pass, or do I have to re-read to parse it?* Surprising-but-instant passes (Morrison's
   *sunflowers that weeped over the fence*). Surprising-but-KNOTTED fails, no matter how clever — that is
   the obscure/convoluted half of the ladder. "Say it aloud" is step one, not a final checkbox.
2. **The verb is the whole game; spend the most reasoning here.** The author's standing verdict:
   "the biggest issues overall are your verb selections." Two ways to fail:
   - **FLAT/vanilla** = ordinary word in its *predicted* slot (*went still, slept, put, brought, climbed*).
     The most common miss. An ordinary word is only a cherry-pick in an **unusual but instantly-clear
     slot** (*weeped, slithered, scuttled, the light failed, the fury drained out of him*).
   - **Thesaurus** = $10 word (*bequeath, remunerate*). Also wrong. The bar is *ordinary word, unusual
     slot, still instantly makes sense.*
   A default verb (*open, push, take, move, hang, go, get, bring, hold, be/was*) is an automatic fail.
3. **Figures must read as plain clear English (see The recipe).** Lean on the under-used figures, but
   only when the swapped-in word is instantly legible. **Metaphor, repetition, and antithesis are the
   tired three — do not lean on them** (metaphor/simile reached for to "lift" a line is the top AI
   sniff). Metonymy/synecdoche only when the referent decodes for free; **litotes and hyperbole are
   safest.** "Not every sentence needs a figure" — on a true valley, "none earned" is the right answer.
4. **No triads, no same-word opener stacks.** A rule-of-three (three parallel clauses/items, three
   "No…" openers) is junior writing and a banned cadence. Recount beats after every edit; land on two
   or four, or cut to the one that earns it. Two recasts sharing a fronted word is a pile-up too.
5. **Spend the budget at the peaks.** A cherry-picked verb, a power word, a figure are *expensive* —
   spend them at the emotional/structural high points and keep the valleys (stage business, transitions)
   deliberately plain. Over-elevating a valley is its own AI tell. "5th grade" = *no craft* (primer
   cadence), NOT simple words — plain is often right.
6. **Stick to the doc.** When the original line is already strong, the right fix can be a *small* one or
   none at all. Don't manufacture motion, don't invent unobserved action ("a dog started up"), don't
   depart far when the original is better. Subtraction is table stakes; the bar is *splendid*.
7. **No em dashes in fixes.** Use other punctuation.
8. **Avoid the AI sniffs.** Don't invent facts (light-research an uncertain detail, never guess a
   number/date — e.g. St. Stephen's Green is ~22 acres, don't make one up); no "the way…" similes;
   trust the reader, show don't tell (naming the motif or feeling outright is telling — let the beat
   carry it). These are the misses that slipped past the live run.
9. **SUGGEST ONLY.** Approval of phrasing is not permission to write Drive. Write only the fixes the
   author explicitly approves, via edit-doc.mjs.

## Output format — the author is a JUDGE, not a curator

The author reacts to finished sentences by ear. They do NOT want verb lists, figure names, or a gate
table — that machinery is the model's internal discipline, never author-facing. So present each
comment as **six finished sentences, ranged plain → bold**, and let the author point at one (or say
"all flat, go wilder" → fetch six bolder ones).

```
**#N · [comment-id]** — "<author note verbatim>"
Current: <live doc line(s)>
1. <finished sentence>      (1–2 safe/plain)
2. <finished sentence>
3. <finished sentence>      (3–4 reach)
4. <finished sentence>
5. <finished sentence>      (5–6 bold, still natural)
6. <finished sentence>
```

- **No table, no jargon, no reasoning by default.** The 0–6 gate runs *inside* each agent to generate
  good options; show it only if the author asks "why does that one work?" — then surface it for that
  one line.
- The six must be genuinely different (verb, structure, length, boldness), not one word swapped six
  times. Every one passes the naturalness veto; bold ≠ weird.
- Keep a running tally of what's PICKED vs still-open across turns; never re-touch a picked line.

## The collator pass (your job — the agents are blind to each other)

Two moments of collation:

**A. Before presenting** — sanity-check the six options per line: are they real, instantly felt (clearance
test), genuinely different from each other in verb, figure, AND opening shape? Kill any KNOTTED option
the agent slipped in, and if the six are all subject-first, send it back for shape variety before the
author sees it.

**B. After the author picks** — check the *chosen* lines across the batch:

- **Opener variety across the picks → use the meter, not your ear (Stage 3).** Do NOT eyeball this —
  by-ear finds only side-by-side collisions and "fixes" them into an alternating wall. Run
  `dedrone-check.mjs` on the assembled picks and resolve to ✓ PASS per **Stage 3 — the de-drone gate**
  above. (The meter encodes the /openers Rule F lesson: subject-led is the ~60% monoculture; vary the
  WORD too, not just the type.)
- **Cadence / figure proximity.** If one shape (a mirrored "X, yet not-X"; a fronted clause; a fragment)
  or one figure repeats within a few sentences, flag it and offer an alternate — the author picks by ear
  and may not clock the repetition across lines.
- **Duplicate beats.** Watch for the same action rendered twice (e.g. a baby "handed over" in two
  adjacent paragraphs). Recast one as interior/manner so the other stays the literal beat.
- **Continuity.** Don't break established props/blocking (e.g. a coat that must travel to the next
  scene, eyes that "settle on her face" later — don't pre-empt it).
- **Paragraph flow.** When a pick cuts a redundant line, re-read the rebuilt paragraph end to end; a
  surviving fragment can end up orphaned and need reordering.

## Files

- `bin/unresolved.mjs` — list open comments (id, note, stale quote). `--json` for the raw array.
- `AGENT-BRIEF.md` — the per-comment splendor subagent prompt (Passes 1–2). One agent per comment.
- `bin/dedrone-check.mjs` — **the de-drone meter (Stage 3).** Feeds picked lines through the shared
  `/openers` classifier + budgets; prints the opener map and ✓ PASS / ✗ FAIL. Zero LLM, can't be gamed.
- `DEDRONE-BRIEF.md` — the whole-passage de-drone (re-entry) subagent prompt, run only when the meter FAILs.
- Ruler: the author's Obsidian craft notes (vault `ryanboog` → `Writing/Craft Notes`; query via the `obsidian` CLI — the old local `craft/sentence/sentence-craft.md` was retired July 2026) + `.claude/skills/openers/taxonomy.json` (drone budgets).
  Writer: `.claude/skills/book-edit/bin/edit-doc.mjs`.
