# AI Mistakes to Avoid — The Negative Guide

> **For any agent (including future me) doing prose work on *Chasing the Sun*.**
> This is the one file of *don't*. It is the consolidated record of the mistakes an
> AI keeps making on this manuscript — the ones Ryan has had to catch and fix by hand,
> over and over, across weeks of AI-assisted revision. Read it before you touch prose.
> The metric of success is that Ryan never has to make one of these corrections again
> because we caught it first.
>
> Two kinds of mistake live here:
> - **Part A — Fingerprints.** What AI writes badly. The tells it leaves in new prose
>   and the patterns it misses in existing prose.
> - **Part B — Over-corrections.** What AI does badly *while fixing*. This is where most
>   of the frustration comes from: the model "fixes" a real tic by introducing a worse
>   one, or strips the author's signature thinking it's a flaw. The guardrails in Part B
>   matter as much as the catches in Part A.
>
> **Provenance.** Part A's before/after pairs were reverse-engineered from **51 real edits
> Ryan made on Drive by hand** (diffing the live Doc against the last-built epub, June 2026)
> plus the cross-book tic/triad/variety/resonance passes. "EPUB" = AI-influenced text that
> shipped. "DRIVE" = what Ryan changed it to. Paragraph/line indices are provenance, not
> live coordinates — they drift; re-sync before acting (see the last rule in Part B).

---

# Part A — Fingerprints (what AI writes badly)

## A1. Historical anachronism — the highest-value catch

AI defaults to the *famous modern* name/fact/idiom, not the one true to the year on the
page. This is the one class of error invisible unless you know the history, so the author
most needs us to get it right.

- **Carlisle Bridge, not O'Connell Bridge.** All 5 occurrences were wrong.
  > EPUB: "...at the foot of the **O'Connell Bridge**."
  > DRIVE: "...at the foot of the **Carlisle Bridge**."

  The Dublin scenes run **1863–1873**. The bridge was *Carlisle Bridge* until it was
  renamed O'Connell Bridge in **1882**. AI used the name a modern reader knows.

- **Invented over-specific detail.** AI fabricates a plausible-sounding specific to add
  texture. Cut it to a general truth unless it's verified.
  > EPUB: "a small white box from a coffin maker **on Francis Street**."
  > DRIVE: "a small white box from a coffin maker **nearby**."

- **Modern idiom in period dialogue.** AI reaches for contemporary speech even in 1860s mouths.
  > "He's a **dead man walkin'**" — a 1990s death-row idiom, the most visible anachronism in the book.
  > "We have a **community**… It **scares** me" — modern civic/therapy speech at Part One's emotional peak.

**Rule:** Before naming any street, bridge, building, institution, product, technology, or
turn of phrase in a period scene, ask *"was it called/said that in this exact year?"* and
*"do we actually know this, or did the model invent it?"* When unsure, **generalize**
("nearby," "a shop on the quay") rather than inventing a specific, and reach for
period-true phrasing in dialogue. Flag every named real-world entity you can't date.

## A2. Purple flourishes — the "writerly" AI poeticism

AI reaches for a showy image or a "literary" verb where a plain, true word is stronger.
Ryan strips these every time. This book's power is in restraint.

- > EPUB: "...his fists clenched even in sleep, **as though he arrived in the world braced for argument**."
  > DRIVE: "...his fists clenched even in sleep." *(cut the editorializing simile)*
- > EPUB: "William set down the knife. **His face opened.**"
  > DRIVE: "William set down the knife. **His face relaxed.**"
- > EPUB: "The harbor **opened like a mouth** to the Atlantic."
  > DRIVE: "The harbor **opened** to the Atlantic."
- > EPUB: "William Boog was **still, his hands quiet.**"
  > DRIVE: "William Boog was **present.**"

Two specific sub-tells in this family:
- **Adverbs**, especially next to speech tags. King: *"The adverb is not your friend… the road
  to hell is paved with adverbs."* They breed like dandelions. Prefer a stronger verb.
- **Zombie nouns** — abstract nominalizations. Sword: *"they cannibalize active verbs, suck the
  lifeblood from adjectives and substitute abstract entities for human beings."*

**Rule:** Distrust any image that announces itself as Literature — bodies "braced for
argument," faces that "open," harbors "like a mouth." If a plain verb carries the same
meaning, the plain verb wins. Subtract the flourish; don't add another.

## A3. The abstract-explainer tail — the single most pervasive fingerprint

A beat lands a concrete image, then **one more sentence steps in to tell the reader what it
meant.** VOICE.md is explicit: *you do not editorialize the takeaway; scenes end on physical
buttons.* This showed up in every pass. The fix is almost always **delete the tail.**

- > "Not because he had conquered them. **Because he was too tired to fight.**" → cut the "why."
- > "They were evidence. Proof that she had been here. **That she had been real.**" → stop at the objects.
- > "Hearing and understanding were different things, and **the distance between them is where grief lived.**"
  > → the image right before it (his hands hanging between his knees, having heard every word) already *is* the gap.
- > "...**because peace and death can wear the same expression.**" → tells the reader why he's terrified after showing it.
- > "**Some things do not need words.**" / "happiness is… **the woods have a memory, and they always grow back.**" → cut the aphorism entirely.

Same fingerprint at larger scales:
- **Theme stated aloud.** Hollis's "Your name turns into something that outlasts you" (p. 2)
  editorializes the whole book before it starts.
- **The voice-from-heaven.** A literal quoted reply — *"My child, I'm here as I've always
  been. It's you who turned away…"* — tells the reader what to feel at the one moment they
  should be left alone to feel it. The epilogue's own restraint proves the quiet version lands harder.
- **The negation-to-abstract engine.** "It was not grief. It was not fear. It was the
  animal awareness of…" Drop the negations, keep the body. (But see **B1** — the negation
  fragment is signature when it lands *concrete*.)

**Rule:** When a beat names the emotion or the meaning the body/object just rendered, cut
the naming. Trust the object, the cut, the reaction. The gloss mutes the scream.

## A4. Told-not-shown emotion — understatement beats explanation

AI states the feeling directly. The author cuts to something concrete and lets restraint
do the work. The highest-craft fixes in the set.

- > EPUB: "Her voice was level. **Her arms were shaking.**"
  > DRIVE: "Her voice was level. **Her hands were not.**"  ← the best edit in the book
- > EPUB: "'Eleven months,' William **said**."
  > DRIVE: "'Eleven months,' William **struggled to get the words out.**"

**Rule:** When a beat names an emotion or pairs "calm voice / shaking body," find the
sharper, quieter version. Show the held control, not the breakdown.

## A5. The staccato-subject metronome & same-opener runs

AI writes short declaratives with the same subject over and over. It scans as a drumbeat.
In aggregate, late-book scenes blur into one camera move.

- > EPUB: "He watched the foot traffic. He counted under his breath."
  > DRIVE: "He watched the foot traffic **while he** counted under his breath."
- > EPUB: "She walked home. She came in through the shop door."
  > DRIVE: "She walked home **and** came in through the shop door."
- > EPUB: "William added coins. Counted."
  > DRIVE: "William added coins **and** counted."

Related aggregate tells (each instance fine; the *count* is the flag):
- **Filler-verb openers.** "[He/She/William/Mary] looked at…" ×108 — the biggest single
  filler. "Looked at" is a camera direction, not an action; half can become what the look
  *lands on* or a real gesture. Also "Her voice was…" / "His eyes were…" static frames.
- **SVO monotony.** Bookfox: *"If you just write SVO sentences… you will put all of your
  readers to sleep."* The tic is *unrelieved* SVO — not SVO itself (see **B5**).

**Rule:** When 2+ consecutive sentences open with the same subject, or a one-word fragment
hangs off a prior sentence, combine the *mechanical* runs. But heed Part B before you do.

## A6. Redundant lists & unearned triads

AI loves the rule-of-three and the texture-list. Often one or two beats are dead weight, or
the list echoes something already established.

- > EPUB: "He looked at his **bench, his tools, the boots** lined up along the wall."
  > DRIVE: "He looked at his **shop** with the boots lined up along the wall."
- Cut an echo-list of "the carts and pedestrians and dogs that did not look up when a small
  coffin passed" — the indifference of the city was already shown.

Severity, in the author's own ranking: **staccato triads are the worst; triads with the
same opening word are the worst** (`Dry. Clean. No mold.` and `He… He… He…`).

**Rule:** When you see a comma-list of three, ask whether each item earns its place or
whether it's AI reflexively reaching for three. Cut to the one that carries the most weight.
See **B2/B3** for how *not* to fix these.

## A7. Continuity / internal-consistency drift

AI doesn't hold the whole book in its head, so facts drift between chapters.

- **Eye color:** George's eyes "steady **dark brown**" → "steady **blue**" (must match later refs).
- **Two signs, not one:** the corner shop has signs facing both streets — "the sign" → "the
  signs," "take **it** down" → "take **them** down" across three paragraphs.
- **Consistent ritual phrasing:** "crossed herself" → "**performed the sign of the cross**" to
  match the exact phrase used elsewhere for the same gesture.
- **Vocabulary precision:** "No stone" → "No **headstone**."

**Rule:** Treat recurring concrete facts — eye/hair color, counts, names, the exact wording
of repeated rituals/motifs — as a continuity ledger. Change or add one, and you've made a
promise the rest of the book must keep: grep every other mention and make them agree.

## A8. Repeated motif-buttons & re-explaining established symbols

AI repeats a device on the same template and re-states symbolism the reader already mastered.

- The paper/will device is staged on the *same* template (night, table, family asleep,
  unfold, write, fold, pocket) ~11 times. The seven appearances that **break pattern** are the
  best paper moments in the book; the identical repeats are the fingerprint.
- The verbatim recital re-explains "left/right" and "X = dead" each reprint — symbolism the
  reader had at line 322.
- A motif-button (a recurring line/gesture) should **fire on its single most powerful instance
  and be varied everywhere else.** By the third identical fold the reader feels the machinery,
  not the grief.

**Rule:** When a device recurs, vary the staging or thin to the one canonical instance. Never
re-explain a symbol the reader has already been taught.

## A9. Soft "closed-door" chapter endings

The failure mode at chapter ends is the **closed door**: the character goes to sleep / goes
inside / smiles / gets back to work, and the last sentence tells the reader it's okay to put
the book down. The prose can be beautiful and still close the door.

- **The soft landing:** "closed his eyes," "went inside," "smiled," "walked home." Calm is
  contagious — when the POV character relaxes on the final line, the reader's grip relaxes too.
- **The deflating tail:** a perfect held moment, then a final sentence that explains or shrugs
  it off — "clung onto dearly," "to try and take his mind elsewhere," "Some losses are too tough
  even for ink." (This is **A3** at the chapter seam — delete the tail; the gesture carries it.)
- **The frame handoff that tells instead of teases:** "things moved quickly" promises pace
  without naming the bait; strong handoffs lure with a specific unanswered thing.

**Rule:** End on the open door — the unanswered, the unresolved, the specific object left
hanging. If the last sentence explains the feeling, delete it.

## A10. Punctuation, typography & mechanical cleanup

Lower-stakes, but the author still has to fix them:
- Comma splices / wrong stops: "Later. Mary had fallen" → "Later**,** Mary had fallen."
- Stray spaces before punctuation from emphasis runs: "It was me **.**" → "It was me."
- Dialect spelling consistency within a voice: "during the fits" → "**durin'** the fits."

**Rule:** Run a Chicago/typography pass as you go — curly quotes, single spaces, no space
before punctuation (chicago-normalize). Keep dialect spelling consistent within a character.

---

# Part B — Over-corrections (what AI does badly *while fixing*)

These are the corrections-of-the-corrections. Most of the wasted effort on this book came
from the model "fixing" something that was either fine or making it worse. Internalize these.

## B1. The shape is usually the signature, not the tic

The fragment, the triad, the anaphora, the negation, the present-tense intrusion — these are
mostly the author's **signature**. The tic is the *abstract version* of the shape: the run
that climbs to a concept or explains the meaning instead of landing on a chosen physical
thing. So nearly every legitimate fix is **subtraction** — cut the abstract beat / explainer
tail, keep (or re-body) the concrete one. **When in doubt, keep.** Judge against VOICE.md
first. Proof from the author's own edits: *"despair"* → *"their eyes were sunken."*

Example of the distinction: the negation opener is signature when concrete ("He did not
scream. He ground his teeth.") and a tic only when it's a flat behavioral report ("She did
not smile. She did not blush…"). Thin the flat ones; never blanket-fix.

## B2. Never fix a triad by re-punctuating it into another triad

"nor since X, nor since Y" is junior writing, and so is reshuffling three beats into a comma
list. First ask whether the beats are even needed (Is one an echo? A duplicate place?). Cut
the redundant ones. Land on the one that earns it. **Cut beats; don't reshuffle them.**

## B3. Never *introduce* a rule-of-three while fixing something else

Collapsing a He/She opener pile-up into a comma list silently creates a triad. Use **two or
four** beats, not three. **Recount after every fix.**

## B4. Don't fix opener runs with dependent-clause openers

Bookfox's real advice for repetitive sentences is to open with prepositions, adverbs, and
**dependent clauses** — but VOICE.md bans dependent-clause openers as off-voice here. Thin
the "He looked / He stood" density by **folding the look into the object seen** or **varying
the subject**, not by bolting on a subordinate clause.

## B5. "Reword substantially" ≠ delete the feeling

Matesic's fix re-bodies a stale phrase with a *fresher physical one* ("the air hissed behind
her teeth"). It is **never** "replace the gesture with an abstract label." Re-route through the
body; never strip to an abstraction. And repeated SVO has *music* (Bookfox's word) — the
problem is unrelieved monotony, not the SVO sentence.

## B6. Fix mechanics — subtraction-first, scalpel-not-blanket

- **No em dashes** in fixes.
- **Check paragraph rhythm before a fragment fix** — a fragment may be carrying the beat.
- **Subtraction first** — the model's instinct is to *add* (a flourish, an invented specific,
  a third list item, a named feeling). The author *removes*. When the fix is "add," distrust it.
- **Adverb-comma is a sparing scalpel**, not a default move.

## B7. Flag and propose — never rewrite the Doc unprompted

Scan for these patterns proactively, but **flag and suggest**; do not rewrite anything the
author hasn't accepted. **"Approved" in chat ≠ a Drive write** — only write the Doc on an
explicit command to do so (and never on exploratory phrasing like "does this work?").

## B8. Cite real craft sources — don't invent, and flag what you can't verify

Ground writing-craft guidance in what Bookfox / Matesic / King / Sword **actually say** (fetch
and quote), not training-memory. Label your own synthesis as synthesis. Flag unverifiable
claims rather than acting on them — e.g. the oft-repeated "three 'He did X' in a row reads
amateur" is attributed to a Bookfox video whose transcript couldn't be pulled and appears in
none of his readable posts. **Treat it as unconfirmed.** Don't revise the book against a quote
you can't source.

## B9. Sync Drive before any scan; treat line numbers as stale

Google Drive is the source of truth. Run the deai `sync.sh` before scanning — the
`.deai/manuscript.txt` cache goes stale and gives wrong line numbers. Every coordinate in this
file is provenance, not a live address. Re-sync, then re-locate by text.

---

# The meta-lesson

Across every edit, the through-line is **subtraction and precision**:
- The model *adds* (flourishes, invented specifics, third list-items, named feelings,
  explainer tails). The author *removes*.
- The model reaches for the *famous / modern / generic* (O'Connell Bridge, "said," "her arms
  were shaking"). The author reaches for the *true and specific* (Carlisle Bridge, "struggled
  to get the words out," "her hands were not").
- The model forgets what it wrote three chapters ago. The author holds the whole book.
- The model "fixes" by reshaping. The author fixes by cutting, and protects the signature.

**Your job before any prose work:** read VOICE.md, then scan for Part A proactively while
obeying Part B's guardrails. Flag and propose; never rewrite the Doc without explicit approval.

---

### How to extend this file
After each build, re-run the diff that found the original 51 edits:
1. Read the live Doc to text: `node .claude/skills/book-edit/bin/read-doc.mjs > /tmp/drive-now.txt`
2. Unzip `public/chasing-the-sun-draft.epub`, strip section xhtml to one paragraph per line.
3. Align index-for-index, normalize trailing whitespace, diff — real edits separate from export artifacts.

Every new author-by-hand correction is a pattern we should have caught. Fold it in. The list
should get *shorter* over time — that's the metric.
