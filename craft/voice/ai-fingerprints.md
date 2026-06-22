---
lens: voice
title: AI Fingerprints — The Tells, and the Over-Corrections That Make New Ones
source_primary: AI-MISTAKES-TO-AVOID (reverse-engineered from 51 by-hand author edits + the tic/triad/variety/resonance passes)
source_raw: ../AI-MISTAKES-TO-AVOID.md
authority: primary  # the record of mistakes caught by hand on this manuscript
verified: 2026-06-22
related: [voice/sound-like-yourself, sentence/variety, sentence/power, dialogue/worst-lines, emotion/resonance, device/recurring-device, scene/chapter-hooks]
house_gate: VOICE.md   # where any "tell" collides with a deliberate authorial shape, VOICE.md wins
---

# AI Fingerprints

**Why it matters.** AI prose fails in a recognizable set of ways, and it fails *again* while fixing those ways. The through-line of every catch below is one direction of force: the model **adds** (a flourish, an invented specific, a third list item, a named feeling, an explainer tail) and reaches for the **famous / modern / generic**; good prose **subtracts** and reaches for the **true and specific**. The most expensive mistakes here are not the original tells (Part A) but the over-corrections (Part B) — the "fix" that strips a signature or installs a worse tic. This lens is for human judgment, not find-and-replace. Run it as a flag-and-propose instrument, never a blanket pass.

> Governing test: when a fix is "add," distrust it. The author removes; the model adds. If your proposed edit is longer than the original, you are probably writing a new fingerprint.

---

## Part A — The tells (what AI writes badly)

### A1. Historical anachronism — the highest-value catch

**Rule.** Before naming any street, bridge, building, institution, product, technology, or turn of phrase in a period scene, ask *"was it called/said that in this exact year?"* and *"do we actually know this, or did the model invent it?"* When unsure, generalize rather than invent.
**Why it works.** AI defaults to the *famous modern* name, fact, or idiom, not the one true to the year on the page. This is the one error class that is invisible unless you know the history, so it is precisely where the author most needs the catch and least expects to have to make it.
**Example.** A real-place rename: a bridge that carried one name for the decade the scene is set in, renamed years after the scene's events; the model used the name a modern reader knows. Modern idiom in old mouths: a death-row phrase coined in the 1990s placed in a 19th-century character's speech; therapy-era civic language ("community," "it scares me") at an emotional peak set generations before that vocabulary existed.
**Failure mode.** Over-specific invented texture: a fabricated plausible-sounding detail ("a box from a coffin maker on [named street]") that the author cuts to a general truth ("nearby") because the specific was never verified. Flag every named real-world entity you cannot date; when in doubt, reach for "nearby," "a shop on the quay," period-true phrasing.

### A2. Purple flourishes — the "writerly" poeticism

**Rule.** Distrust any image that announces itself as Literature. If a plain verb carries the same meaning, the plain verb wins. Subtract the flourish; do not add another.
**Why it works.** AI reaches for a showy image or a "literary" verb where a plain, true word is stronger. Restraint reads as confidence; the flourish reads as a writer performing. Two sub-tells in this family carry their own canon: **adverbs**, especially beside speech tags (King, *On Writing*: *"the road to hell is paved with adverbs"* — they breed like dandelions; prefer a stronger verb), and **zombie nouns**, abstract nominalizations (Sword: they *"cannibalize active verbs, suck the lifeblood from adjectives and substitute abstract entities for human beings"*).
**Example.** "his fists clenched even in sleep, as though he arrived in the world braced for argument" → cut the editorializing simile, keep "his fists clenched even in sleep." "His face opened." → "His face relaxed." "The harbor opened like a mouth to the Atlantic." → "The harbor opened to the Atlantic." A character rendered as "still, his hands quiet" → the single plain word "present."
**Failure mode.** The fix that swaps one flourish for a fancier one. The move is subtraction, not substitution upward.

### A3. The abstract-explainer tail — the single most pervasive fingerprint

**Rule.** When a beat names the emotion or the meaning the body or object just rendered, cut the naming. Trust the object, the cut, the reaction.
**Why it works.** A concrete image lands, then one more sentence steps in to tell the reader what it meant. The gloss mutes the scream: the image had already done the work, and the explanation tells the reader they were too slow to feel it. This appeared in every pass; the fix is almost always **delete the tail.**
**Example.** "Not because he had conquered them. Because he was too tired to fight." → cut the "why." "They were evidence. Proof that she had been here. That she had been real." → stop at the objects. An aphorism appended to a scene ("Some things do not need words") → cut entirely. The negation-to-abstract engine — "It was not grief. It was not fear. It was the animal awareness of…" → drop the negations, keep the body.
**Failure mode.** The fingerprint scales up: a theme stated aloud in an early page editorializes the whole book before it starts; a literal voice-from-heaven reply tells the reader what to feel at the one moment they should be left alone to feel it. But heed **B1** — the negation fragment is signature when it lands *concrete*; only the climb-to-a-concept version is the tic.

### A4. Told-not-shown emotion — understatement beats explanation

**Rule.** When a beat names an emotion, or pairs a "calm voice / shaking body," find the sharper, quieter version. Show the held control, not the breakdown.
**Why it works.** AI states the feeling directly. Restraint makes the reader supply the feeling, which is stronger than being handed it. These are the highest-craft fixes in the set.
**Example.** "Her voice was level. Her arms were shaking." → "Her voice was level. Her hands were not." (cited as the best edit in the manuscript: the understatement does what the explicit shaking could not). "'Eleven months,' William said." → "'Eleven months,' William struggled to get the words out." Note the direction: the second is *not* an added flourish but a re-route through the body that names the effort, not the feeling.
**Failure mode.** Reading this rule as "always cut to less" and deleting the concrete body too — see **B5**: re-body, do not strip to an abstract label.

### A5. The staccato-subject metronome & same-opener runs

**Rule.** When two or more consecutive sentences open with the same subject, or a one-word fragment hangs off a prior sentence as filler, combine the *mechanical* runs. But read Part B before you cut.
**Why it works.** AI writes short declaratives with the same subject repeatedly; in aggregate, scenes blur into one camera move and the prose scans as a drumbeat. Combining restores forward motion.
**Example.** "He watched the foot traffic. He counted under his breath." → "He watched the foot traffic while he counted under his breath." "She walked home. She came in through the shop door." → "She walked home and came in through the shop door." Related aggregate tells flagged by *count*, not by instance: filler-verb openers ("[He/She] looked at…"), where "looked at" is a camera direction, not an action — half can become what the look *lands on* or a real gesture; and unrelieved SVO (Bookfox: *"If you just write SVO sentences… you will put all of your readers to sleep"*).
**Failure mode.** The tic is *unrelieved* SVO, not SVO itself; SVO has music (see **B5**). And do not fix opener runs with dependent-clause openers (see **B4**).

### A6. Redundant lists & unearned triads

**Rule.** When you see a comma-list of three, ask whether each item earns its place or whether it is the model reflexively reaching for three. Cut to the one that carries the most weight.
**Why it works.** AI loves the rule-of-three and the texture-list; often one or two beats are dead weight or echo something already established. The author's own severity ranking: **staccato triads are the worst; triads with the same opening word are the worst** ("Dry. Clean. No mold." and "He… He… He…").
**Example.** "He looked at his bench, his tools, the boots lined up along the wall." → "He looked at his shop with the boots lined up along the wall." An echo-list of "the carts and pedestrians and dogs that did not look up when a small coffin passed" → cut, because the indifference of the city was already shown.
**Failure mode.** Fixing a triad by reshuffling it into another triad (**B2**) or *introducing* one while fixing an opener run (**B3**). The fix is to cut beats, not to re-punctuate them.

### A7. Continuity / internal-consistency drift

**Rule.** Treat recurring concrete facts — eye/hair color, counts, names, the exact wording of repeated rituals or motifs — as a continuity ledger. Change or add one and grep every other mention to make them agree.
**Why it works.** AI does not hold the whole book in its head, so facts drift between chapters. A single new concrete fact is a promise the rest of the book must keep.
**Example.** Eye color stated as one color in one chapter and another later; a shop with signs facing two streets referred to as "the sign" / "take it down" where it should be plural across three paragraphs; a ritual gesture described two different ways where one canonical phrasing is used elsewhere; "No stone" sharpened to the precise "No headstone."
**Failure mode.** Changing a fact in the passage in front of you without sweeping the rest — which trades one drift for a new contradiction.

### A8. Repeated motif-buttons & re-explained symbols

**Rule.** When a device recurs, vary the staging or thin to the one canonical instance. Never re-explain a symbol the reader has already been taught.
**Why it works.** AI repeats a device on the same template and re-states symbolism the reader mastered chapters ago. A motif-button should fire on its single most powerful instance and be varied everywhere else; by the third identical repetition the reader feels the machinery, not the meaning.
**Example.** A recurring object-ritual staged on the *same* template (night, table, family asleep, unfold, write, fold, pocket) many times over; the appearances that *break* the pattern are the strongest, the identical repeats are the fingerprint. A recited list that re-teaches its own key ("left means X, right means Y") on every reprint, when the reader learned the key on first appearance.
**Failure mode.** "Fixing" repetition by deleting the device's strongest single instance along with the dead repeats. Thin the echoes; protect the one that earns it.

### A9. Soft "closed-door" chapter endings

**Rule.** End on the open door — the unanswered, the unresolved, the specific object left hanging. If the last sentence explains the feeling, delete it.
**Why it works.** The failure at a chapter seam is the closed door: the character goes to sleep, goes inside, smiles, gets back to work, and the last line tells the reader it is okay to put the book down. Calm is contagious — when the POV character relaxes on the final line, the reader's grip relaxes too. Prose can be beautiful and still close the door.
**Example.** Soft landings: "closed his eyes," "went inside," "smiled," "walked home." The deflating tail: a perfect held moment followed by a line that shrugs it off ("to try and take his mind elsewhere") — this is **A3** at the chapter seam, so delete the tail. The frame handoff that tells instead of teases: "things moved quickly" promises pace without naming the bait; a strong handoff lures with a specific unanswered thing.
**Failure mode.** Manufacturing a false cliffhanger to "open the door." The open door is a real unresolved specific, not a withheld fact or a melodramatic stinger (see [[scene/chapter-hooks]]).

### A10. Punctuation, typography & mechanical cleanup

Lower-stakes but still author-corrected, so catch them in passing: comma splices and wrong stops ("Later. Mary had fallen" → "Later, Mary had fallen"); stray spaces before punctuation left by emphasis runs ("It was me ." → "It was me."); dialect spelling kept consistent within a single voice ("during" → "durin'" where that character's voice elides it). Run a Chicago/typography pass as you go — curly quotes, single spaces, no space before punctuation.

---

## Part B — The over-correction guardrails (what AI does badly *while fixing*)

> These matter as much as Part A. Most of the wasted effort comes from the model "fixing" something that was fine, or fixing a real tic by installing a worse one. **This whole list is for human judgment, not find-and-replace.** VOICE.md may legitimately use fragments, triads, anaphora, negation, present-tense intrusion — none of these is a defect by shape alone.

### B1. The shape is usually the signature, not the tic

**Rule.** The fragment, the triad, the anaphora, the negation are mostly the author's *signature*. The tic is the *abstract version* of the shape — the run that climbs to a concept or explains the meaning instead of landing on a chosen physical thing. Judge against VOICE.md first. **When in doubt, keep.**
**Why it works.** Nearly every legitimate fix here is subtraction: cut the abstract beat or explainer tail, keep or re-body the concrete one. Distinguishing signature from tic is what stops a "cleanup" from sanding off the voice.
**Example.** The negation opener is signature when concrete ("He did not scream. He ground his teeth.") and a tic only when it is a flat behavioral report ("She did not smile. She did not blush…"). Proof from the author's own hand: "despair" → "their eyes were sunken."
**Failure mode.** Blanket-thinning a shape because it recurs. Recurrence is not the same as a tic; an unrelieved *abstract* run is the tic.

### B2. Never fix a triad by re-punctuating it into another triad

**Rule.** First ask whether the three beats are even needed — is one an echo, a duplicate place? Cut the redundant ones; land on the one that earns it. **Cut beats; do not reshuffle them.**
**Why it works.** "nor since X, nor since Y" is junior writing, and so is reshuffling three beats into a comma list. The problem was never the punctuation; it was the unearned third beat.
**Failure mode.** Turning "He… He… He…" into "X, Y, and Z" and calling it fixed. You have only changed the triad's clothes.

### B3. Never *introduce* a rule-of-three while fixing something else

**Rule.** Collapsing a He/She opener pile-up into a comma list silently creates a triad. Use **two or four** beats, not three. **Recount after every fix.**
**Why it works.** The model's reflex toward three is exactly what produces the tic in the first place; the fixing pass is the most common place to install a brand-new one.

### B4. Don't fix opener runs with dependent-clause openers

**Rule.** Thin the "He looked / He stood" density by **folding the look into the object seen** or **varying the subject**, not by bolting on a subordinate clause.
**Why it works.** Bookfox's general advice for repetitive sentences is to open with prepositions, adverbs, and dependent clauses — but VOICE.md bans dependent-clause openers as off-voice here. The house gate overrides the general technique.
**Failure mode.** Applying a sound generic rule that this manuscript's voiceprint specifically rejects. Always check VOICE.md before importing a craft default.

### B5. "Reword substantially" ≠ delete the feeling

**Rule.** Re-body a stale phrase with a *fresher physical one*; never replace the gesture with an abstract label. Re-route through the body.
**Why it works.** Matesic's fix swaps a tired gesture for a sharper concrete one ("the air hissed behind her teeth"), not for a feeling-word. And repeated SVO has *music* (Bookfox's word) — the problem is unrelieved monotony, not the SVO sentence.
**Failure mode.** Hearing "show, don't tell" or "reword" and stripping the concrete down to an abstraction — the opposite of the intended move.

### B6. Fix mechanics — subtraction-first, scalpel-not-blanket

No em dashes in fixes. Check paragraph rhythm before a fragment fix — a fragment may be carrying the beat. Subtraction first: when the fix is "add" (a flourish, an invented specific, a third list item, a named feeling), distrust it. The adverb-comma construction is a sparing scalpel, not a default move.

### B7. Flag and propose — never rewrite the source unprompted

Scan for these patterns proactively, but flag and suggest; do not rewrite anything the author has not accepted. "Approved" in chat is not a write to the source of truth — only write on an explicit command, never on exploratory phrasing like "does this work?"

### B8. Cite real craft sources — don't invent, and flag what you can't verify

Ground craft guidance in what Bookfox, Matesic, King, Sword actually say (fetch and quote), not training-memory; label your own synthesis as synthesis. Flag unverifiable claims rather than acting on them. Worked example: the oft-repeated "three 'He did X' in a row reads amateur" is attributed to a Bookfox video whose transcript could not be pulled and appears in none of his readable posts — **treat it as unconfirmed**; do not revise against a quote you cannot source.

### B9. Sync the source before any scan; treat line numbers as stale

The live document is the source of truth. Sync before scanning — a local manuscript cache goes stale and gives wrong line numbers. Coordinates in the source file are provenance, not live addresses; re-sync, then re-locate by text.

---

## The meta-lesson

Every catch reduces to **subtraction and precision**. The model adds (flourishes, invented specifics, third list items, named feelings, explainer tails); the author removes. The model reaches for the famous / modern / generic; the author reaches for the true and specific. The model forgets what it wrote three chapters ago; the author holds the whole book. The model fixes by reshaping; the author fixes by cutting, and protects the signature. Read VOICE.md first, scan for Part A proactively, obey Part B's guardrails, and flag rather than rewrite.

## Cross-links
- The positive of this whole lens — what voiced prose looks like instead → [[voice/sound-like-yourself]].
- Same-opener runs, SVO monotony, pet phrases, stock gestures (diagnostic) → [[sentence/variety]]; the scored axis → [[sentence/power]].
- Told-not-shown emotion and the explainer tail in dialogue → [[dialogue/worst-lines]]; the emotion layer those tails mute → [[emotion/resonance]].
- Repeated motif-buttons and re-explained symbols → [[device/recurring-device]].
- Soft closed-door endings → [[scene/chapter-hooks]].

## Provenance
- **Primary.** `../AI-MISTAKES-TO-AVOID.md` — reverse-engineered from 51 by-hand author edits (the live Doc diffed against the last-built epub, June 2026) plus the tic/triad/variety/resonance passes. The before/after pairs are the author's own corrections; they are the record of mistakes caught by hand on this manuscript. Treated as primary.
- **Stephen King**, *On Writing* — "the road to hell is paved with adverbs." Widely attributed and consistent with the book; queued for re-confirmation against the original in `SOURCES.md` (canon-to-verify). ⚠️ not yet re-checked here.
- **Helen Sword** — "zombie nouns" / nominalizations cannibalizing active verbs. Sword's coinage (*The Writer's Diet*; NYT 2012). Consistent with her published work; queued in `SOURCES.md`. ⚠️ not yet re-checked here.
- **Bookfox (John Matthew Fox)** — "If you just write SVO sentences… you will put all of your readers to sleep" and "SVO has music." From the Bookfox corpus; primary as a video source. ⚠️ paraphrased, not re-quoted.
- **Alyssa Matesic** — "reword substantially" / re-body with a fresher physical phrase ("the air hissed behind her teeth"). Attributed to Matesic; flagged ⚠️ for re-confirmation in `SOURCES.md` (Matesic pet-phrase claims marked "re-confirm").
- **The "three He/She openers in a row = amateur" claim** — attributed to a Bookfox video whose transcript could not be pulled; appears in none of his readable posts. ❓ **unverifiable; explicitly treated as unconfirmed** (per B8 and the SOURCES.md note). Do not cite as fact.
- All book-specific coordinates, characters, and per-instance verdicts from the source were intentionally abstracted out of this lens (see report). Where a rule could collide with a deliberate authorial shape, **VOICE.md wins** (`house_gate`).
