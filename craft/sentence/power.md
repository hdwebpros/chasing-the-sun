---
lens: sentence
title: Sentence Power — POWER & SOPHOMORIC, Two Scored Axes
source_primary: SENTENCE-POWER.md (the measurement instrument) + SOPHOMORIC-RUBRIC.md
source_raw: [../SENTENCE-POWER.md, ../SOPHOMORIC-RUBRIC.md, ../SENTENCE-POWER-DATA.md]
authority: derived  # an editorial instrument assembled from the craft canon, not one author's framework
verified: 2026-06-22
related: [sentence/sentence-craft, sentence/variety, voice/sound-like-yourself, voice/ai-fingerprints, voice/pro-level]
house_gate: VOICE.md   # where a "low power = bad" reading conflicts with deliberate plain/quiet prose, VOICE.md wins
---

# Sentence Power — Two Scored Axes

**Why it matters.** [[sentence/sentence-craft]] tells you how to *build* a strong sentence; [[sentence/variety]] tells you how to *detect* monotony. This file is the *scored* instrument that sits between them: it ranks a sentence on two independent axes so a ranking is reproducible and does not collapse to one reader's taste. The output is **evidence to argue with**, not a verdict.

> **The honest limit, stated up front.** There is **no validated academic formula that scores a literary sentence's "power."** Power is not an operationalized construct in the craft or stylometry literature. What the canon *can* measure is a set of **symptoms and virtues** that craft writers agree correlate with strong vs. weak prose: rhythm, verb energy, concreteness, freshness, end-emphasis, architecture, restraint. This instrument is an **editorial hypothesis made explicit and repeatable** (a defined feature set with defined weights), not a truth machine. Present results as "by these defined metrics," never as objective literary fact.

## The two axes (they are not opposites)

- **POWER (0–100):** how much craft virtue the sentence carries.
- **SOPHOMORIC (0–100, higher = worse):** density of amateur tells.

A sentence can be both vivid and clumsy, or clean but inert, so it gets both scores. **Top-shelf** = high POWER *and* near-zero SOPHOMORIC. **Sophomoric** = high SOPHOMORIC regardless of POWER (an overwritten sentence can score "powerful" on length yet still lose on the amateur axis). Always report both.

> **House gate (load-bearing).** A low POWER score is *not* a defect to be fixed. Flat, plain sentences are legitimate connective tissue; not every sentence should be high-power, and a book of all-high-power sentences would be exhausting purple prose. VOICE.md signatures (the negation-correction fragment, deliberate present-tense intrusions, fragments used for rhythm) are **author signature, not error**. Dialogue is never scored on the SOPHOMORIC axis the way narration is (*know / think / feel / seem* are normal in speech). This instrument *measures*; it does not authorize rewrites. VOICE.md wins.

## How the score is assembled

Two layers. The **computable layer** is a deterministic script over every sentence; this is the part that is genuinely "the metrics, not anyone's taste." The **judge layer** is an anchored human/LLM read on fixed 0–4 scales (§ below), where every judge score must cite *which* rubric criterion fired and *which* computable evidence backs it. A judge score with no rubric citation is invalid. The computable layer ranks candidates; the judge layer scores them; a bounded computable nudge keeps the judge honest to the objective evidence.

Two calibration anchors the instrument must reproduce, so it is not fitting to one book:
- **Known-good:** *"His left hand grips the railing with the patience of a man who has learned not to argue with his own body."* Right-branching cumulative, fresh personification, payload ("body") at the end. Must score HIGH (~80+), SOPHOMORIC ~0.
- **Synthetic-bad:** *"She suddenly realized that her heart was pounding in her chest as a shiver ran down her spine."* Intensifier + filter verb + two clichés + be-verb spine + repeated *that*. Must score LOW, SOPHOMORIC ≥ 50.

If a run disagrees with either anchor, fix the instrument before trusting its output.

---

# The POWER axis

Power is carried by **seven anchored judge dimensions** (J1–J7), a small bonus (J8), and a bounded computable nudge. Each dimension is a 0–4 scale (0 absent/failing, 2 competent, 4 exemplary) tied to a named source. Behind the judge sits a deterministic feature layer; full wordlists and feature tables in [[sentence/power-appendix]].

### J1 — Verb energy
**Rule.** The main verb should do real work. 0 = be-verb or light-verb-plus-noun ("made a decision"); 2 = ordinary active verb; 4 = a precise, surprising verb that replaces an adverb (*trudged*, not *walked slowly*).
**Why it works.** Sword calls nominalizations "zombie nouns" because they "cannibalize active verbs." A be-verb spine reports a state; an active verb enacts one. This is the same move as [[sentence/sentence-craft]] step 2 (cherry-pick the verb).
**Example.** Before: *"grief was there, and it changed him."* After: *"It changed shape, settled deeper, became part of the way he held his shoulders and the way he did not laugh."* (Precise verbs replace the be-spine; the sentence enacts grief deepening.)
**Failure mode / when.** Watch the be-verb rate (Sword bands, appendix) and `beIsMainVerb`. House note: a be-verb is not always wrong; existence/identity sentences legitimately use one. Flag only when the be-verb traps an abstraction.

### J2 — Concreteness
**Rule.** Render down Hayakawa's abstraction ladder: sensory, specific, touchable. 0 = abstractions only; 2 = one concrete anchor; 4 = an image you can see, hear, or touch.
**Why it works.** Strunk & White: "Prefer the specific to the general… the concrete to the abstract." Abstractions tell; images show.
**Example.** Before: *"a list of experiences and emotions."* After: a concrete column of names a finger can travel. The abstract pair ("experiences and emotions") names a feeling the surrounding image already renders.
**Failure mode / when.** A weak abstract tail ("…of the situation," "…with dignity," "…a final moment") signals the sentence reached for a label instead of a thing.

### J3 — Freshness
**Rule.** Un-clichéd, true language. 0 = dead metaphor / cliché; 2 = serviceable plain statement; 4 = a fresh observation that nails real experience.
**Why it works.** Orwell rule (i): "Never use a … figure of speech which you are used to seeing in print." A cliché is a place the writer stopped looking; Bookfox: clichés show "you didn't want to work at writing."
**Example.** Cliché: *"Her eyes widened when she described the color of the sky."* Fresh: *"She was eight years old again when she described the color of the sky."* The stock reaction-beat is replaced by a true one.
**Failure mode / when.** Set-phrase clichés ("heart pounded in her chest," "a shiver ran down her spine") are auto-flagged from the cliché list in [[sentence/power-appendix]]; a serviceable plain statement scores 2, not 0.

### J4 — Architecture
**Rule.** The structure should earn itself. 0 = shapeless or padded; 2 = clean simple sentence; 4 = a cumulative, periodic, or balanced form whose shape *adds*.
**Why it works.** Christensen's cumulative sentence is "dynamic… representing the mind thinking," its trailing modifiers "leaping and lingering." Landon: a sentence with more useful detail "will *almost* always be better." The known-good anchor is RIGHT-branching.
**Example.** *"He still checked the work, walking job sites with his stick, running his thumb along every joint and corner."* The free modifiers (*walking…, running…*) enact methodical inspection; the base clause carries the meaning and the tail textures it.
**Failure mode / when.** "More is more" is only true when the added material is useful. A high `clauseDepth` with no payoff is padding, not architecture, and is penalized.

### J5 — End-emphasis
**Rule.** The payload lands at the end (second strongest position: the front). 0 = strongest word buried mid-sentence, weak tail; 4 = the last word is the "Look at me" word.
**Why it works.** Clark, the single highest-leverage computable principle: "Place strong words at the beginning and at the end." Tufte corroborates: "the major emphasis tends to fall on … whatever … is at the end of the sentence … the real news." Weight the end roughly twice the front.
**Example.** Before: *"When they reached the house William went to the back steps and sat down."* (ends on the weak particle *down*). After: *"When they reached the house, William sat on the back steps."* (ends on the concrete *steps*).
**Failure mode / when.** `endWordClass = WEAK` (preposition, vague adverb, abstraction, filler tail) is a power penalty; a STRONG concrete-noun or vivid-verb end-word is a power bonus.

### J6 — Rhythm / sound
**Rule.** It should sound right read aloud, *against its neighbors*. 0 = dull/choppy/droning; 4 = lively, well-paced, flowing.
**Why it works.** A sentence has no rhythm alone. Provost's five-word passage proves that uniform length "become[s] monotonous"; Le Guin: "There is no optimum sentence length. The optimum is variety." This is the scored counterpart of [[sentence/variety]] and the rhythm step of [[sentence/sentence-craft]].
**Example.** A run within ±2 words of each other for four or more sentences (`monotonyRun`) reads as a stuck record; one long sentence breaking the rat-a-tat restores the music.
**Failure mode / when.** Scored over a rolling window (the surrounding paragraph / ±8 sentences) via length standard-deviation. House note: low variety is sometimes deliberate (a dying-fall close, a flat-time voyage). Flag for a *look*, not an automatic fix.

### J7 — Truth / precision
**Rule.** It says *exactly* what it means, logically. 0 = vague / illogical / says less with more; 4 = the writer plainly knows what they actually said.
**Why it works.** Fish defines a sentence as "a structure of logical relationships"; the test is whether the relationships hold. Matesic's filter-word objection is partly a precision one: filters say "she saw the X" when the writer means "the X."
**Failure mode / when.** Overlaps J2/J3 but catches logical wobble specifically ("as bold of an invitation to faith"), not just abstraction.

### J8 — Form mirrors content (bonus only, 0 or +2)
**Rule.** The syntax enacts the meaning: a long sentence for a long action, a clipped one for a shock, a looping one for a looping mind.
**Why it works.** Tufte/Fish "syntactic symbolism." Not always applicable, so it is a small bonus, never a penalty.
**Example.** *"His mind was doing something it had never done before, cycling, looping, pulling him backward through rooms he had sealed shut."* The cascading modifiers enact the looping.

### Combining
The seven anchored dims carry the score; J8 adds up to +6; a bounded computable nudge (±12) keeps the ranking honest to the objective layer (e.g. +4 for a STRONG end-word, +3 for RIGHT/BALANCED branch with a free modifier, −4 for a be-spine trapping an abstraction, −3 for a WEAK end-word). The exact formula and weights live in [[sentence/power-appendix]]. The judge dimensions dominate, because that is where craft lives, but every judge score is anchored to computable evidence so a sentence cannot rank high on vibes alone.

---

# The SOPHOMORIC axis

Penalty-based; higher = worse. Mostly computed by the scanner, with a judge pass on borderline (CTX) hits. Penalties stack and clamp to 100. The full wordlists, regexes, and exact point values are in [[sentence/power-appendix]]; the families below explain *why* each tell predicts amateur prose.

> **Mandatory exclusions.** Dialogue is excluded from filter/know/think/seem/intensifier penalties. VOICE.md signatures are **tagged, not subtracted** in a measurement pass (recorded raw, flagged as suspected signature for later) so the instrument never silently launders an authorial shape into a defect.

### Family A — Telling an abstraction with a be-verb or filter verb
**Rule.** A be-verb (or perception/cognition verb) naming an abstraction, where a concrete image could sit, is the single most common real tell.
**Why it works.** Burroway's "filtering": *saw / heard / felt / noticed / realized / seemed* "create a barrier between the reader and the narrative" by asking the reader to look *at* the observer rather than *through* them. Pair that with an abstract noun and the sentence tells twice over.
**Example.** *"He felt guilt and embarrassment."* The filter (*felt*) plus two named abstractions is classic telling-not-showing; the fix renders the state instead of labeling it.
**Failure mode / when.** `felt` for genuine physical sensation is a false positive; perception at a real plot beat ("she saw the body") is load-bearing. This family produces the most false positives, so it needs the judge pass.

### Family B — Cliché / dead idiom in narration
**Rule.** Set-phrase clichés and dead idioms get the heaviest single penalty.
**Why it works.** Orwell rule (i). A cliché "could apply to anyone" (NY Book Editors); it is the first phrase that came to mind, not the true one.
**Example.** *"He knew what was in the cards for him"* → *"By now he knew how it would go."* (kills the dead idiom *in the cards*).
**Failure mode / when.** Single-body-part verbs ("eyes widened," "breath caught") are CTX, not HIGH; flag for review, never auto-rewrite.

### Family C — Weak constructions (expletives, passive, nominalization traps, revving verbs)
**Rule.** Penalize *There was / It was X that* clefts, "the fact that," "by"-agent passives, light-verb nominalizations ("made a decision"), and "began/started to" revving verbs.
**Why it works.** Strunk Rule 11 (*Use the Active Voice*, original 1918 numbering): substitute a transitive active verb for "such perfunctory expression as *there is*." Rule 13 (*Omit Needless Words*; Rule 17 in Strunk & White combined editions): "the fact that" "should be revised out of every sentence in which it occurs." Matesic/Darrow: cut "revving-up verbs"; the action is "began" the moment you write it.
**Example.** *"Underneath the ordinary sounds there was a hollowness."* (expletive + abstract payload) → delete; the next concrete line carries it. *"…he started to crack a few jokes."* → *"…he cracked a joke. Then another."*
**Failure mode / when.** Keep an expletive when existence itself is the point ("There were three of them left"); keep weather/time *It was* ("It was raining"). These are CTX.

### Family D — Purple-prose markers (adverbs, intensifiers, adjective stacks)
**Rule.** Penalize the adverb-beside-a-speech-verb pattern (HIGH), then intensifiers (*very, really, suddenly, just, literally*) and `-ly` adverb density and three-plus stacked adjectives (by density, CTX).
**Why it works.** King: "the road to hell is paved with adverbs"; the one almost-always-bad case is the adverb glued to a speech tag ("said menacingly"). Strunk & White on *rather, very, little, pretty*: "the leeches that infest the pond of prose." Reedsy on purple prose: "excessive adjectives… draw attention to [themselves], and away from the story."
**Example.** *"They were very different, these children."* (intensifier + be-spine before a show) → delete; the next sentences show the difference.
**Failure mode / when.** `-ly` and *just / so / little / pretty* over-fire; score them by density, not single hits. Only adverb-beside-speech-verb is safe to flag aggressively.

### Family E — Sword "diet" band penalties
**Rule.** Small penalties when per-100-word rates cross Sword's "Heart Attack" bands: be-verb rate ≥ 6, nominalization rate ≥ 7, waste-word (*it/this/that/there*) rate ≥ 6, ad-word rate ≥ 12, preposition runs > 3, *that* repeated.
**Why it works.** Sword's *The Writer's Diet* calibrates these bands per-100-words so a long and a short sentence are comparable. They are aggregate-flab signals, not per-sentence verdicts, so each carries a *small* penalty.
**Failure mode / when.** Bands are calibrated on Sword's corpus; the appendix flags that her full prep/adjective wordlists are unpublished, so these use suffix heuristics. Treat band-crossings as a nudge, not proof.

---

## Reading the output (guardrails)

1. **Most "sophomoric" auto-flags misfire on deliberate style.** In practice the large majority of scanner hits resolve to false-positive, load-bearing, or voice-signature once judged; only a small remainder are genuine amateur tells. Never act on a raw flag.
2. **A low POWER score on quiet connective prose is fine.** Rank by POWER to *find* the strong sentences and to *spot* a flat run that wasn't meant to be flat; do not "raise the power" of every workmanlike sentence.
3. **The dominant real fix is subtraction.** Across the families, the most in-voice repair is usually a deletion: a be-spine naming an abstraction the concrete neighbor already renders.
4. **Fix house rules (from the instrument).** Suggestions only until an explicit Drive-write go-ahead. No em dashes in any replacement. Never introduce a triad; recount beats after every fix. Check the surrounding paragraph's rhythm before proposing a fragment fix (a fragment fix beside an existing fragment-stack makes a de-facto triad). Subtraction first. See [[sentence/sentence-craft]] and the house feedback notes.

## Cross-links
- The constructive counterpart (build one strong sentence) → [[sentence/sentence-craft]].
- The monotony *diagnosis* (SVO runs, openers, pet phrases) that J6 scores → [[sentence/variety]].
- Why mechanical prose has no pulse; rhythm-as-voice → [[voice/sound-like-yourself]].
- The AI "predicted default verb/word" tell these penalties push against → [[voice/ai-fingerprints]].
- Pro-level diction (filter words, purple prose, burnt tongue) → [[voice/pro-level]].
- The heavy data behind every metric here → [[sentence/power-appendix]].

## Provenance

This instrument is a **derived** editorial tool: a feature set and weights assembled from the named canon, not any single author's framework. Each metric is attributed below with an honest verification status. ✅ = the *idea* is confidently that author's; ⚠️ = the specific banding/threshold is the instrument's invention, not the cited authority's published number; 🔲 = primary wording not yet re-verified against the original (in the SOURCES.md "Canon to verify" queue).

| Metric / dimension | Attributed to | Status | Note |
|---|---|---|---|
| J1 verb energy; be-verb & "zombie noun" bands | Helen Sword, *The Writer's Diet* / "Zombie Nouns" (NYT 2012) | ✅ idea · ✅ bands | **Verified (Phase 3):** "zombie nouns" is Sword's coinage and the be-verb bands are **her real published numbers**, not ours — WritersDiet be-verb scale: **<3 Lean / 3 Fit & trim / 4 Needs toning / 5 Flabby / 6+ Heart attack** (counts is/are/was/were/be/been). Caveat: be-verbs and nominalizations are **separate** WritersDiet categories — the "Zombie Nouns" essay flags *nominalizations* (≥5% of words = flabby), not be-verbs. Her full prep/adjective wordlists are unpublished, so the scanner uses suffix heuristics. |
| J5 end-emphasis | Roy Peter Clark, *Writing Tools* (Tool #4) | ✅ idea · ✅ wording | **Verified (Phase 3):** Tool **#4, "Period As a Stop Sign"** — "Place strong words at the beginning of sentences and paragraphs, and at the end. The period acts as a stop sign." Clark himself traces it to Strunk's Rule 18 ("Place the emphatic words of a sentence at the end"). Cite by name + number. |
| J4 architecture / cumulative sentence | Francis Christensen, "A Generative Rhetoric of the Sentence" (CCC 1963) | ✅ idea · 🔲 wording | Cumulative/right-branching sentence is genuinely Christensen. Landon's "propositions"/"more is more" corroborates; exact wordings secondary. |
| J3 freshness / cliché | George Orwell, "Politics and the English Language" (1946) | ✅ | Anti-cliché rule (i) is verbatim Orwell; the specific cliché *list* is compiled from editor sites (Tracey Lee, Lakin, NY Book Editors), not Orwell. |
| Expletive subjects / "the fact that" | Strunk & White, *Elements of Style* | ✅ idea · ✅ rule-nums (orig. Strunk) | **Verified (Phase 3):** rule numbers are **original Strunk (1918)** — **Rule 11 "Use the Active Voice"** is the home of the "there is" → transitive-active fix ("Many a tame sentence… by substituting a transitive in the active voice for some such perfunctory expression as *there is*"); **Rule 13 "Omit Needless Words"** is the home of "*the fact that*… should be revised out of every sentence." NOTE: **Strunk & White combined editions renumber** Omit Needless Words to **Rule 17**. The bare "delete every 'there is'" is S&W *spirit*, not a verbatim numbered ban — don't overstate. ("leeches" quote still secondary-source only.) |
| Filter words | Janet Burroway, *Writing Fiction* (shared lineage: John Gardner) | ✅ idea · ⚠️ not sole coiner | **Phase 3:** "filtering" is solidly *popularized* by Burroway in *Writing Fiction*, but she is **not provably the sole coiner** — the same concept is in **John Gardner's _The Art of Fiction_** ("needless filtering of the image through some observing consciousness"). Record as "popularized by Burroway; concept shared with Gardner," not "coined by Burroway." Primary not read directly. |
| Adverbs (esp. beside speech verbs) | Stephen King, *On Writing* | ✅ | "Road to hell is paved with adverbs" and the speech-tag case are well-known King, verbatim via The Marginalian. |
| Intensifiers ("leeches") | Strunk & White / King / Matesic | ✅ idea · 🔲 wording | The objection is canonical; see S&W note above re print verification. |
| J6 rhythm / length variety | Gary Provost (five-word passage) + Le Guin (via Woolf) | ✅ Provost · ⚠️ thresholds | Provost passage is verbatim, widely attributed. Le Guin's "all rhythm" is her quoting Woolf — attribute to Woolf. The SD 5/8/9 "burstiness" cutoffs are stylometry heuristics, calibrate per manuscript, **not** Provost's numbers. |
| Concreteness / abstraction ladder | S.I. Hayakawa, *Language in Thought and Action* + Strunk & White | ✅ idea · ⚠️ | Ladder concept is Hayakawa's; rung labels here are paraphrase, not verbatim. |
| Revving verbs ("began/started to") | Miranda Darrow / Matesic | ⚠️ | Real editor advice (Darrow page); not a canonical named-author rule. |
| ARI / Flesch difficulty signals | Hemingway Editor / Flesch–Kincaid | ⚠️ | Recorded as signals only; the instrument explicitly does **not** treat "long = bad." Hemingway color cutoffs are unofficial/reverse-engineered; the "25 words = red" rule is **not** a real constant. |
| "Power" as a construct | (none) | ❌ not validated | **Most important flag:** there is no validated formula for literary sentence power. This is an editorial hypothesis; present as "by these defined metrics." |

> **Book-specific remainder (for `../reviews/`, NOT here):** all per-line POWER/SOPHOMORIC scores, the per-act aggregate tables (Acts 1–5: be-verb rates, monosyllable ratios, cliché counts, window-SD), the ranked "most powerful" / "weakest" / "most sophomoric" sentence lists, the false-positive/load-bearing/voice-signature/real verdict tallies, and every per-line suggested fix in `../SENTENCE-POWER-DATA.md`. The *instrument* (axes, dimensions, features, wordlists) is reusable and lives here + in the appendix; the *measured results* are findings about this manuscript and belong in the reviews tree.
