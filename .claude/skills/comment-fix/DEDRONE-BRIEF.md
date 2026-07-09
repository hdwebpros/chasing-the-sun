# DEDRONE-BRIEF — the whole-passage de-drone agent

Template for **Stage 3** of [[SKILL]] (after the splendid picks are chosen and assembled into
their passage). This is NOT the per-comment splendor agent ([[AGENT-BRIEF]]) — it is a single
agent that sees the WHOLE passage at once and breaks the opener drone, because a per-comment
agent is structurally blind to its neighbors and cannot.

The trust here is **the meter, not the agent**: the agent runs `dedrone-check.mjs` on its own
output and is forbidden to return until it passes. The orchestrator re-runs the meter as the
authoritative gate. Fill every `<…>`, delete the (parens) guidance, paste as the agent prompt.

---

You are de-droning ONE passage of the historical novel "Chasing the Sun" (Dublin/Irish-immigrant
saga; plain, concrete, period-accurate voice). The splendid sentences are already chosen — your job
is NOT to re-craft them for power. Your ONE job: **break the sentence-opener drone across the
passage** so the reader doesn't hear the same entrance over and over. SUGGEST ONLY — return the
reworked passage, write nothing to any file or to Drive.

## THE ONE RULE
Subject-word openers — **The / He / She / They / It / William / <any proper name>** followed
straight by a verb — are unavoidable but a **faux pas by default**. The book already sits ~60%
on them; that monoculture is the drone. Lead a sentence with its grammatical subject only when
the **verb right after it is a genuine peak** that earns the entrance ("The walls *wept* with
damp"). Otherwise, find another way in.

## DON'T DIAGNOSE — THE METER ALREADY DID
You are handed a meter readout (below) that flags exactly which lines drone: the % subject-led,
any 4-in-a-row "wall," and any same-first-word "echo." **Work only the flagged lines.** Do not
go hunting for problems by ear — by ear you will only find side-by-side collisions and "fix" them
by alternating The/He/The/He, which is still a wall. The meter measures DENSITY, not collisions.
Trust it.

## RE-ENTER — DO NOT SAND
The wrong move is to keep the sentence and swap its first word. That is *sanding*: you inherit the
subject-first skeleton and only the opener token changes, so the verb still lands flat on beat 2.

The right move is **re-entry**: ask "what is the most *alive* thing in this beat — the image, the
sound, the motion, the concession?" and lead with THAT. The non-subject opener and the live verb
fall out together, because the alive thing is almost never the grammatical subject.

    SAND (wrong):  "The railings of St. Stephen's Green ran along his right."
                →  "Iron railings ran along his right."        (still subject-led, just reworded)

    RE-ENTER (right): lead from where he is in the world —
                →  "Along his right ran the iron railings of St. Stephen's Green."   (P-opener, verb lifts)

Re-entry changes the *grammar of entry*, not just the word.

## GUARD AGAINST THE OPPOSITE MONOCULTURE
Do NOT front everything. Driving subject-led to zero just builds a new wall (four "In…" or four
participial openers in a row is exactly as much a drone as four "He…"). Aim to break the
**majority**, not all — keep the subject openers whose verb is a true peak, and reach for a
**different** varied entrance each time (a fronted time/place phrase, a subordinate clause, a
conjunction lead, an adverb, a participial, a short fragment). Vary the WORD too: two recasts
that both open "In…" is its own pile-up.

(Heuristic note: the meter is conservative — it tags some genuinely-varied openers as S, e.g. an
irregular participle "Bent over the wood," or a number-word time phrase "Eight years on,". If a
flagged line already enters from something other than its bare subject, it's fine; spend your
effort on the lines that truly start subject-then-verb.)

## THE METER IS IN YOUR LOOP (this is the gate)
After you rework, **run the meter on your full passage** and read the verdict:

```bash
node .claude/skills/comment-fix/bin/dedrone-check.mjs <<'EOF'
<your full reworked passage here>
EOF
```

If it prints **✗ FAIL**, re-enter the still-flagged lines and run it again. **Do not return until
it prints ✓ PASS** (or until every remaining S line is one whose verb you'd defend as a peak — if
so, say which and why). The orchestrator will re-run this exact check; droning output comes back.

## HARD RULES (inherited — do not relearn them)
- **Don't break the splendor.** These lines were already approved/chosen for their verb and image.
  Re-entry must PRESERVE the meaning, the figure, the concrete detail. You are changing the way in,
  not the substance. If a line can't be re-entered without going flat or knotted, leave it and note it.
- No em dashes. No triads / rule-of-three (recount beats after every edit; land on two or four).
- Don't invent unobserved action or facts; don't break established blocking/props.
- Don't touch any line marked **[PEAK]** — those are the orchestrator's to re-enter by hand.
- The clearance test still rules: read each reworked line once, fast. Re-read to parse it → it's
  knotted, you over-reached; pull back.
- SUGGEST ONLY. Write nothing to any file or to Drive.

## INPUT
THE PASSAGE (picked lines assembled in document order; lines marked [PEAK] are off-limits):
<paste the rebuilt passage, one sentence per line or as prose>

THE METER READOUT (from dedrone-check.mjs — these are your targets):
<paste the ✗ FAIL output: the %S, the walls, the echoes>

## OUTPUT
Return the **full passage** with only the flagged lines re-entered, in document order, plus the
final meter verdict you got. Nothing else.

```
REWORKED PASSAGE:
<line 1>
<line 2>
...

METER: ✓ PASS  (paste the one-line summary: "N sentences · S=x (y%) · …")
```
