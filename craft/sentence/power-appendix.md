---
lens: sentence
title: Sentence Power — Data Appendix (wordlists, features, weights)
source_raw: [../SENTENCE-POWER.md, ../SOPHOMORIC-RUBRIC.md]
authority: derived
verified: 2026-06-22
---

> Data appendix to [[sentence/power]]. The teaching file explains *why* each feature predicts power or sophomoric-ness; this file holds the long wordlists, the computable feature tables, and the exact weights so the teaching file stays legible. Items marked **†** are common-knowledge cliché-family synthesis (for scanner coverage), **not** attributable to a cited source. **[HIGH]** = rarely false-positive, safe to flag aggressively. **[CTX]** = context-dependent, flag for review, never auto-rewrite. Dialogue is excluded from filter/intensifier/be-spine penalties; VOICE.md signatures are tagged, not subtracted.

---

## A. Computable feature layer (deterministic, per sentence)

"Rate" = count ÷ words × 100 (per-100-words, so long and short sentences compare; Sword's bands are calibrated this way).

### A1. Verb & noun energy (Helen Sword, *The Writer's Diet* / "Zombie Nouns," NYT 2012)

| Feature | Definition | Source threshold |
|---|---|---|
| `beVerbRate` | `is, am, are, was, were, be, being, been` ÷ words ×100 | Sword: <3 Lean · 5 Flabby · 6+ "Heart Attack" |
| `beIsMainVerb` | true if the main predicate is a be-verb | Sword's worst case: zombie-noun/pronoun subject + uninspiring verb |
| `nominalizationRate` | nouns ending `-tion,-sion,-ment,-ity,-ness,-ance,-ence,-ism,-ization` ÷ words ×100 | Sword: 5%+ = flabby; 6 Flabby / 7+ Heart Attack |
| `prepRate` | prepositions (incl. infinitive *to*) ÷ words ×100 | Sword: <14 Lean · 18 Flabby · 20+ Heart Attack |
| `prepRun` | longest run of consecutive prepositional phrases | Sword: avoid ">3 in a row" |
| `adwordRate` | words ending `able,ac,al,ant,ary,ent,ful,ible,ic,ive,less,ous` ÷ words ×100 | Sword: <6 Lean · 10 Flabby · 12+ Heart Attack |
| `wasteWordRate` | `it, this, that, there` ÷ words ×100 | Sword: <3 Lean · 5 Flabby · 6+ Heart Attack |
| `thatRepeat` | true if "that" appears >1× | Sword: avoid *that* more than once per sentence |

> Sword verbatim: "I call them 'zombie nouns' because they cannibalize active verbs, suck the lifeblood from adjectives and substitute abstract entities for human beings." Cure: "vigorous, verb-driven sentences that are concrete, clearly structured and blissfully zombie-free."
> Flag: Sword's full prep/adjective wordlists are unpublished; only the suffix heuristics and the be-verb/waste-word closed lists are public. `-ly` adverbs are **not** in her ad-word list — counted separately under King.

### A2. Diction & concreteness (Orwell 1946; Strunk & White; Hayakawa)

| Feature | Definition | Source |
|---|---|---|
| `monoRatio` | % of content words that are monosyllabic | Anglo-Saxon plainness proxy. Orwell rule (ii): "Never use a long word where a short one will do." |
| `latinateRatio` | % content words with Latinate abstraction suffixes | Orwell: bad writers think "Latin or Greek words are grander than Saxon ones." |
| `abstractNounDensity` | nominalizations + named abstractions ÷ content words | Hayakawa ladder (go down to the concrete); S&W: "Prefer… the concrete to the abstract." |
| `clicheHits` | matches against the cliché set (§C) | Orwell rule (i) |

### A3. Emphasis & position (Roy Peter Clark, *Writing Tools*; Tufte, *Artful Sentences*)

| Feature | Definition |
|---|---|
| `endWordClass` | class of final content word: STRONG (concrete noun / vivid verb) · NEUTRAL · WEAK (preposition, vague adverb, abstraction, filler tail) |
| `svPosition` | token index where main subject+verb first land (Clark: subject & verb near the start) |
| `frontLoadLen` | tokens of subordinate/adverbial material before the main clause (periodicity proxy) |

> Clark: "Place strong words at the beginning and at the end" — "any word next to the period says, 'Look at me.'" Tufte: "the major emphasis tends to fall on … whatever … is at the end … the real news of the sentence." Weight end ≈ 2× front.

### A4. Architecture (Christensen 1963; Landon 2013; Tufte 2006)

| Feature | Definition | Source |
|---|---|---|
| `branch` | LEFT (front-loaded) · RIGHT (cumulative trailing modifiers) · MID · BALANCED | Christensen cumulative; known-good anchor is RIGHT |
| `freeModifiers` | count of trailing participial / absolute / appositive phrases after the base clause | Christensen "levels"; Tufte |
| `hasAbsolute` | noun + participle, no finite verb ("his eyes welling") | Christensen/Tufte high-prestige modifier |
| `hasAppositive` | noun phrase renaming an adjacent noun | Tufte |
| `parallelism` | repeated grammatical frame across coordinated members / anaphora | Tufte; balanced sentence |
| `clauseDepth` | comma count + subordinator count (no-parser complexity / MDD proxy) | computational-metrics pass |
| `propositionCount` | finite clauses + proposition-bearing modifiers | Landon |

> Christensen: cumulative is "dynamic… representing the mind thinking," modifiers "leaping and lingering as the popular ballad does." Landon: "A long sentence is not necessarily a better sentence, but a sentence containing more useful information… will *almost* always be better."

### A5. Restraint markers (King; Matesic; Burroway; S&W; Darrow)

| Feature | Definition | Source |
|---|---|---|
| `lyAdverbs` | `-ly` adverbs minus stoplist (§D) | King |
| `adverbBesideSpeechVerb` | `-ly` adverb adjacent to a speech tag | King — the one almost-always-bad pattern |
| `intensifiers` | see §D list | S&W "leeches"; King; Matesic |
| `filterVerbs` | perception/cognition verbs near a POV subject | Burroway "filtering"; Matesic |
| `passiveHits` | be-verb + past participle (+ optional "by" agent) | Orwell rule (iv); Matesic |
| `revvingVerbs` | `began/started to …`, `began/started …ing` | Darrow/Matesic |
| `expletiveOpen` | `There was/were/is/are`, `It was/is … that` cleft | Strunk Rule 11; Purdue OWL |

### A6. Rhythm & length — in context (±8-sentence rolling window)

| Feature | Definition | Source |
|---|---|---|
| `wordCount` | length in words | Provost "five-word" floor |
| `windowLenSD` | std-dev of sentence length over the window ("burstiness") | Provost; stylometry. Heuristic: fiction SD ≈ 9+ healthy; <5 reads flat/AI-like (calibrate per book) |
| `monotonyRun` | longest run of neighbor sentences within ±2 words of each other | Provost |
| `windowMATTR` | moving-average type-token ratio over the window | lexical-diversity literature |

> Note on ARI/Flesch: recorded as difficulty signals only (`ariGrade`, `wordCount`). **Do not** treat "long = bad." Hemingway's only hard rule is a ~14-word floor; the "25 words = red" rule is **not** a real constant. ARI = 4.71·(chars/words) + 0.5·(words/sent) − 21.43.

---

## B. POWER score — judge scales & weights

### B1. The anchored 0–4 judge dimensions

| Dim | Question | 0 | 2 | 4 | Source |
|---|---|---|---|---|---|
| **J1 Verb energy** | Does the main verb do real work? | be-verb / "made a decision" | ordinary active verb | precise verb that replaces an adverb | Sword, Clark, King |
| **J2 Concreteness** | Down Hayakawa's ladder — sensory, specific? | abstractions only | one concrete anchor | an image you can see/hear/touch | Hayakawa, S&W |
| **J3 Freshness** | Un-clichéd and true? | dead metaphor / cliché | serviceable plain | fresh observation that nails experience | Orwell, Fish, Bookfox |
| **J4 Architecture** | Does the structure earn itself? | shapeless or padded | clean simple | cumulative/periodic/balanced form that adds | Christensen, Landon, Tufte |
| **J5 End-emphasis** | Does the payload land at the end (or front)? | strongest word buried; weak tail | acceptable | last word is the "Look at me" word | Clark, Tufte |
| **J6 Rhythm/sound** | Sound right aloud, against neighbors? | dull/choppy/droning | fine | lively, well-paced, flowing | Le Guin, Klinkenborg, Provost |
| **J7 Truth/precision** | Says exactly what it means, logically? | vague / illogical | clear | the writer knows what they said | Fish, Klinkenborg, Matesic |
| **J8 Form mirrors content** | Does syntax enact meaning? | neutral | — | "syntactic symbolism" | Tufte, Fish |

J8 is a bonus (0 or +2), not always applicable.

### B2. Combining formula

```
core        = (J1 + J2 + J3 + J4 + J5 + J6 + J7) / 28   # 0..1
power_judge = core * 82 + (J8 / 4) * 6                  # 0..88

# Computable nudge (±12):
power_comp =
    + 4  if endWordClass == STRONG                         (Clark end-emphasis)
    + 3  if branch in {RIGHT, BALANCED} and freeModifiers >= 1   (cumulative texture)
    + 2  if hasAbsolute or hasAppositive
    + 2  if monoRatio >= 0.45                              (Anglo-Saxon punch; cap once)
    + 1  if parallelism
    − 4  if beIsMainVerb and abstractNounDensity high
    − 3  if endWordClass == WEAK
    − 2  if clauseDepth very high without payoff (J4 < 2)

POWER = clamp(power_judge + power_comp, 0, 100)
```

---

## C. SOPHOMORIC score — penalties & cliché wordlist

### C1. Penalty weights

```
SOPHOMORIC (0–100) = clamp(Σ penalties, 0, 100)

# HIGH-confidence (auto, narration only):
+18  each set-phrase cliché hit            (§C2 [HIGH])
+10  filter verb in narration              (§E [HIGH])
+10  adverb beside a speech verb           (§D [HIGH])
+8   "by"-agent passive
+8   "It was X that" cleft / "the fact that"
+6   intensifier (very/really/suddenly/just/literally…)   (§D)
+6   "began/started to" revving verb
+6   nominalization light-verb trap ("made a decision")
+5   beVerbRate >= 6 (Heart Attack band)   (Sword)
+5   nominalizationRate >= 7               (Sword)
+5   wasteWordRate >= 6                     (Sword)
+4   adwordRate >= 12 or >=3 stacked adjectives on one noun
+4   prepRun > 3
+4   thatRepeat

# CTX (judge-confirmed only — never auto):
+3   bare "There was/were", bare filter (look/know/feel), simile pile-up,
     monotonyRun >= 4 (flat rhythm), windowLenSD < 5
```

### C2. Cliché & "telling" emotion phrases

Sources: Tracey Lee, "50 cliché phrases to avoid" (most non-† items verbatim from here); C.S. Lakin, *Live Write Thrive*; NY Book Editors; Scribophile; Bookfox. Orwell rule (i) is the canonical principle. No formal editor's list was found that enumerates the † physical-emotion phrases — those are common-knowledge synthesis for scanner coverage, tagged [CTX]/†.

```
# Breath
[HIGH] let out a breath she didn't know she was holding
[HIGH] let out a breath he didn't know he was holding
[HIGH] released a breath she didn't realize she was holding †
[HIGH] breath she didn't know she'd been holding †
[HIGH] her breath caught in her throat
[CTX]  breath caught | breath hitched † | let out a breath † | let out a shaky breath †
[CTX]  sucked in a breath † | breath he'd been holding †

# Heart
[HIGH] her heart skipped a beat
[HIGH] heart pounded in her chest | heart pounded in his chest
[HIGH] her heart was in her mouth | heart in her throat †
[HIGH] his heart sank | her heart swelled with pride | her heart fluttered
[CTX]  heart hammered † | heart raced † | heart pounded | heart skipped † | heart swelled †

# Blood / cold / chills / shivers
[HIGH] his blood ran cold | her blood ran cold
[HIGH] a shiver ran down her spine | a shiver ran down his spine
[HIGH] a chill ran down her spine | sent shivers down her spine
[HIGH] his stomach turned to ice | cold shivers up your back
[CTX]  sent shivers † | a chill ran through †

# Stomach / gut
[HIGH] butterflies in her stomach † | butterflies danced in her stomach
[HIGH] her stomach dropped | a lump formed in her throat
[CTX]  bile rose in his throat † | bile rose in her throat †
[CTX]  stomach twisted † | stomach churned † | knot formed in her stomach †

# Knees / legs / body
[HIGH] her knees went weak | made her weak in the knees
[HIGH] her legs were like lead | her arms felt like jelly
[CTX]  knees buckled † | legs turned to jelly †

# Face / eyes
[HIGH] he couldn't believe his eyes | their eyes met across the room
[HIGH] he couldn't take his eyes off her | his jaw dropped
[CTX]  eyes widened † | her eyes widened † | eyes narrowed †
[CTX]  pinched the bridge of his nose † | pinched the bridge of her nose †
[CTX]  the grin that stretches from ear to ear | cheeks burned † | cheeks flushed †
[CTX]  a single tear trickling down her cheek | tears welled up in her eyes | a lump in her throat †

# Fear / shock / freezing
[HIGH] she froze in her tracks | he was frozen with fear
[HIGH] she felt like a deer in headlights | her hair stood on end
[HIGH] he was scared out of his wits | she jumped out of her skin
[CTX]  froze in place † | blood drained from her face † | her hand flew to her mouth †

# Time / world / weight
[HIGH] time seemed to stand still | time stood still †
[HIGH] the weight of the world was on her shoulders | the bottom dropped out of her stomach †

# Love / attraction
[HIGH] sparks flew between them | she felt an electric charge when they touched
[HIGH] she melted under his gaze | they were drawn to each other like magnets
[CTX]  drawn to each other †

# Anger / overwhelm / mood
[HIGH] she burned with rage | he was a bundle of nerves | he was on cloud nine

# Exhaustion / pain
[HIGH] she was dead on her feet | he was tired to the bone
[HIGH] he felt like he'd been hit by a truck | her eyelids felt like bricks
[CTX]  her head was pounding | pain shot through his body | bone-tired †
```

---

## D. Purple-prose markers (King; Strunk & White; Reedsy; Fawkes)

```
# -ly adverb overuse (King): density metric — flag 2+ -ly adverbs in a sentence,
#   or any paragraph above ~1 -ly adverb per sentence.
[CTX]  \b\w{3,}ly\b   (apply the stoplist below)
# -ly STOPLIST (not adverbs):
   only, family, reply, apply, supply, comply, rely, belly, jelly, fully(ctx),
   early, ugly, holy, italy, lily, ally, bully, rally, jolly, folly, melancholy,
   anomaly, assembly, monopoly, gly-* names

# Adverb-in-dialogue-tag (King) — the one HIGH, almost-always-bad adverb pattern
[HIGH] (said|asked|shouted|whispered|replied|muttered|growled|hissed|sighed|cried)\s+\w+ly\b
[HIGH] \w+ly\b\s+(said|asked|shouted|whispered|replied|muttered|growled|hissed)

# Intensifiers / filler qualifiers (S&W "leeches" + King)
[HIGH] suddenly, very, really, just(ctx), quite, rather, somewhat, literally,
       totally, actually, basically, simply, truly, absolutely, completely,
       utterly, extremely, incredibly
[CTX]  pretty ("pretty good" vs "pretty face"), little ("a little tired" vs size),
       so ("so beautiful" vs conjunction)

# Adjective stacking: 3+ comma-separated adjectives on one noun (Reedsy/Fawkes)
[HIGH] (\w+,\s+){2,}\w+\s+(hand|eyes|hair|face|voice|smile|head|sky|...)
[CTX]  any noun phrase with 3+ stacked adjectives
```

> King verbatim: "I believe the road to hell is paved with adverbs." "'Put it down!' she shouted menacingly" is weaker than "'Put it down!' she shouted." S&W (E.B. White): "Rather, very, little, pretty—these are the leeches that infest the pond of prose" (confirmed via secondary sources only; verify against print). Score `-ly` and *just/so/little/pretty* by **density**, not single hits.

---

## E. Filter words (Burroway "filtering"; Dennard; Anne R. Allen; Scribophile)

Fire as `(I|he|she|they|<name>) + VERB` and as `could + VERB`. Word boundaries; match `-s/-ed/-ing`. **Restrict to narration** — *know/think/feel/remember* are normal in dialogue.

```
# HIGH targets (densest, most reliably weak)
[HIGH] saw, heard, felt(boundary care), noticed, realized/realize, watched/watch,
       wondered/wonder, seemed/seem, knew, decided/decide, observed(ctx in tag sense),
       perceive, sensed, recognized, assumed, recalled, experienced

# Multi-word phrases (match literally)
[HIGH] found himself / found herself / found myself / found themselves
[HIGH] could see / could hear / could feel / could smell / could taste
[HIGH] feel like / felt like / seemed like / sounded like / looked like
[HIGH] catch sight of / caught sight of

# CTX (flag, expect false positives — review only)
[CTX]  look/looked, see/hear(bare over-fire), sound/sounded, smell/taste,
       feeling(noun), sense(noun), know/think, thought(noun), remember,
       believed/considered/guessed/understood, appeared/appear, listen/listened,
       spot/spotted, could(only a filter paired with a sensory verb)
```

> Burroway (via Storm Writing School): filtering makes the reader "observe the observer—to look at rather than through the character," which "rip[s] us briefly out of the scene." Word-boundary traps: `feel/felt`, `see` (vs seem/seen/sheen), `sense` (vs sensible/nonsense), `spot`, `note/noted` (notebook), `can/could`.

---

## F. Weak constructions (Strunk & White; Purdue OWL; Sword; Darrow)

```
# A. Expletive / dummy subjects
[HIGH] \bThere (was|were|is|are|will be|has been|have been)\b
[HIGH] \bIt (was|is)\b[^.?!]*\bthat\b      # cleft "It was X that…"
[HIGH] \bthe fact that\b                    # Strunk Rule 13
[CTX]  bare There was/were (keep when existence is the point)
[CTX]  bare It was/is (keep weather/time: "It was raining")

# B. Passive voice (be + past participle, optional "by" agent)
[HIGH] \b(was|were|is|are|been)\s+\w+(ed|en)\s+by\b      # "by"-agent passive
[CTX]  be/been/being + participle (many -ed are adjectives: "was tired")

# C. Nominalizations — HIGH only with a light verb trapping a real verb
[HIGH] (make|made|give|gave|take|took|have|had|provide|conduct|perform|reach)
       (a|an|the)? \w+(tion|sion|ment|ance|ence|al)
   e.g. made a decision→decided · took action→acted · reached a conclusion→concluded
        had a discussion→discussed · gave an explanation→explained
[CTX]  bare \w{3,}(tion|sion|ment|ance|ence|ity|ness|ism|ization)

# D. Revving-up verbs
[HIGH] (began|begun|begins|begin|started|starts|start)\s+to\s+\w+
[HIGH] (began|started)\s+\w+ing      # "began walking", "started crying"
[CTX]  keep only when the action is genuinely interrupted ("began to speak, but…")

# E. Wordy "in order to"
[HIGH] in order to → to · in order for → for/so
[CTX]  in order not to → so as not to / to avoid
```

> Strunk Rule 11: "Many a tame sentence… can be made lively and emphatic by substituting a transitive in the active voice for some such perfunctory expression as *there is*." ("There were a great number of dead leaves lying on the ground" → "Dead leaves covered the ground.") Rule 13: "the fact that" "should be revised out of every sentence in which it occurs." The "insert *by zombies*" passive test is Dr. Rebecca Johnson's, not Grammar Girl's.

---

## G. Auto-flag vs review (ship guidance)

| Category | Auto-flag (HIGH) | Review-only (CTX) |
|---|---|---|
| Clichés | full set-phrases ("blood ran cold") | single body-part verbs ("eyes widened") |
| Filter words | saw, heard, felt, noticed, realized, watched, wondered, seemed, knew, decided, "found himself", "could see/hear/feel" | look(ed), know/think, sound/smell, appeared, could |
| Purple prose | adverb-beside-speech-verb; very/really/suddenly/literally | -ly density, just/so/little/pretty, adjective stacks |
| Weak constructions | "by"-agent passive, "It was X that", "in order to", "began/started to", "the fact that" | bare "There was", bare "It is", -ed passives, bare abstractions |

**Global rule:** ship HIGH sets as flags; gate CTX behind density thresholds + dialogue exclusion. Cross-check every flag against VOICE.md before any rewrite — signatures (the negation-fragment, present-tense intrusions) are deliberate and a generic "sophomoric" hit may be in-voice. See [[sentence/power]] for the teaching and the house gate.
