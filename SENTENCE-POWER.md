# Sentence Power — A Measurement Instrument

*A reproducible rubric for scoring the power vs. sophomoric-ness of individual prose sentences in*
***Chasing the Sun***. *Built June 2026 from primary craft sources, not from the assistant's taste.*

---

## 0. What this is, and the honest caveat

The goal is to rank the manuscript's sentences by **power** and by **amateurishness** *according to defined,
citable metrics* — so the ranking is reproducible and does not reduce to one reader's opinion.

**The honest limit, stated up front.** There is **no validated academic formula that scores a literary
sentence's "power."** Power is not an operationalized construct in the craft or stylometry literature
(flagged by the computational-metrics research pass). What the literature *can* measure is a set of
**symptoms and virtues** that the craft canon agrees correlate with strong vs. weak prose: rhythm,
verb energy, concreteness, freshness, end-emphasis, architecture, restraint. This instrument is therefore
an **editorial hypothesis made explicit and repeatable** — a defined feature set with defined weights —
not an objective truth machine. Treat the scores as *evidence to argue with*, not verdicts.

Two consequences for how to read the output:

1. **The COMPUTABLE layer is primary for ranking candidates.** A deterministic script
   (`scripts/sentence-power-scan.mjs`) computes the objective features below over every sentence. This is
   the part that is genuinely "the metrics, not my training."
2. **The JUDGE layer is anchored, not free.** Where a human/LLM reading is required, the judge must score
   on the **fixed 0–4 scales defined in §3**, cite *which rubric criterion* fired, and cite the
   *computable evidence* the script produced. A judge score with no rubric citation is invalid.

**Calibration anchors** (known cases this instrument must agree with — see §6):
- **Known-good:** *"His left hand grips the railing with the patience of a man who has learned not to argue
  with his own body."* (Prologue.) Right-branching cumulative sentence; fresh personification; payload
  ("his own body") at the end. Must score HIGH.
- **Known-bad (synthetic):** *"She suddenly realized that her heart was pounding in her chest as a shiver
  ran down her spine."* Filter verb + intensifier + two stock clichés + be-verb spine. Must score LOW /
  high-sophomoric.

---

## 1. The two axes

Every sentence gets **two independent scores**. They are not opposites — a sentence can be both vivid and
clumsy, or clean but inert.

- **POWER (0–100):** how much craft virtue the sentence carries (§3 + §4).
- **SOPHOMORIC INDEX (0–100, higher = worse):** density of amateur tells (§5). Wordlists live in the
  companion file **`SOPHOMORIC-RUBRIC.md`**.

A sentence is **"top-shelf"** when POWER is high *and* SOPHOMORIC is near zero. It is **"sophomoric"** when
SOPHOMORIC is high — regardless of POWER (an overwritten sentence can be "powerful" by length and lose on
the amateur axis). Report both.

> **Voice / dialogue gate (applies to both axes).** Per the project's standing rules, signature shapes
> (the negation-correction fragment, deliberate present-tense intrusions, sentence fragments used for
> rhythm) are *author signature*, not error. The scanner flags dialogue separately and **never** scores
> spoken lines on the sophomoric axis the same way as narration (filter/know/think/seem are normal in
> speech). This instrument *measures*; it does not authorize rewrites. VOICE.md is deliberately **out of
> scope for this pass** (the author's instruction): we are measuring how the sentences stack up against the
> external craft canon first, voice-defense second.

---

## 2. The COMPUTABLE feature layer (objective, scriptable)

Every feature below is computed deterministically per sentence by the scanner. Each cites its source.
"Rate" means *count ÷ words × 100* (per-100-words, so a long and a short sentence are comparable — this is
how Helen Sword's bands are calibrated).

### 2A. Verb & noun energy (Helen Sword, *The Writer's Diet* / "Zombie Nouns," NYT 2012)

| Feature | Definition | Source threshold |
|---|---|---|
| `beVerbRate` | count of `is, am, are, was, were, be, being, been` ÷ words ×100 | Sword bands: <3 Lean · 5 Flabby · 6+ "Heart Attack" |
| `beIsMainVerb` | true if the sentence's main predicate is a be-verb | Sword's worst case: "a zombie noun or a pronoun as its subject, coupled with an uninspiring verb" |
| `nominalizationRate` | nouns ending `-tion,-sion,-ment,-ity,-ness,-ance,-ence,-ism,-ization` ÷ words ×100 | Sword: "5 percent or more … nominalizations" = flabby; bands 6 Flabby / 7+ Heart Attack |
| `prepRate` | prepositions (incl. infinitive *to*) ÷ words ×100 | Sword bands: <14 Lean · 18 Flabby · 20+ Heart Attack |
| `prepRun` | longest run of consecutive prepositional phrases | Sword: avoid ">3 in a row" |
| `adwordRate` | words ending `able,ac,al,ant,ary,ent,ful,ible,ic,ive,less,ous` ÷ words ×100 | Sword bands: <6 Lean · 10 Flabby · 12+ Heart Attack |
| `wasteWordRate` | `it, this, that, there` ÷ words ×100 | Sword bands: <3 Lean · 5 Flabby · 6+ Heart Attack |
| `thatRepeat` | true if "that" appears >1× | Sword: "Avoid using *that* more than once in a single sentence" |

> Sword, verbatim: *"I call them 'zombie nouns' because they cannibalize active verbs, suck the lifeblood
> from adjectives and substitute abstract entities for human beings."* The cure: *"vigorous, verb-driven
> sentences that are concrete, clearly structured and blissfully zombie-free."*
> **Flag:** Sword's full preposition/adjective wordlists are not published; only the suffix heuristics and
> the be-verb/waste-word closed lists are public. `-ly` adverbs are **not** in her ad-word suffix list —
> we count those separately (King, below).

### 2B. Diction & concreteness (Orwell 1946; Strunk & White; Hayakawa)

| Feature | Definition | Source |
|---|---|---|
| `monoRatio` | % of content words that are monosyllabic | Anglo-Saxon plainness proxy. Orwell rule (ii): *"Never use a long word where a short one will do."* |
| `latinateRatio` | % content words with Latinate abstraction suffixes | Orwell: *"Bad writers… are nearly always haunted by the notion that Latin or Greek words are grander than Saxon ones."* |
| `abstractNounDensity` | nominalizations + named abstractions ÷ content words | Hayakawa's ladder (move *down* to the concrete); S&W: *"Prefer the specific to the general… the concrete to the abstract."* |
| `clicheHits` | matches against the cliché set in `SOPHOMORIC-RUBRIC.md §1` | Orwell rule (i): *"Never use a … figure of speech which you are used to seeing in print."* |

### 2C. Emphasis & position (Roy Peter Clark, *Writing Tools*; Tufte, *Artful Sentences*)

Clark's rule — the single highest-leverage computable principle: **"Place strong words at the beginning and
at the end."** Emphasis is strongest at the **end** ("any word next to the period says, 'Look at me'"),
second at the **beginning**; weak material hides in the middle.

| Feature | Definition |
|---|---|
| `endWordClass` | class of the final content word: STRONG (concrete noun / vivid verb) · NEUTRAL · WEAK (preposition, vague adverb, abstraction, filler tail like "…of the situation") |
| `svPosition` | token index where the main subject+verb first land (Clark Tool 1: subject & verb near the start) |
| `frontLoadLen` | tokens of subordinate/adverbial material *before* the main clause (periodicity proxy) |

Tufte corroborates the end: *"the major emphasis tends to fall on … whatever word or structure is at the
end of the sentence … the real news of the sentence."* Weight the **end ≈ 2× the front** (Clark).

### 2D. Architecture (Christensen 1963; Landon 2013; Tufte 2006)

| Feature | Definition | Source |
|---|---|---|
| `branch` | LEFT (front-loaded) · RIGHT (cumulative trailing modifiers) · MID · BALANCED | Christensen's cumulative sentence; the known-good anchor is RIGHT |
| `freeModifiers` | count of trailing participial / absolute / appositive phrases after the base clause | Christensen "levels"; Tufte "preservation of the kernel" |
| `hasAbsolute` | noun + participle with no finite verb ("his sticks hanging…", "the body leaning out") | Christensen/Tufte high-prestige modifier |
| `hasAppositive` | noun phrase renaming an adjacent noun | Tufte |
| `parallelism` | repeated grammatical frame across coordinated members / anaphora ("X was gone… X was gone") | Tufte; Fish's additive style; balanced sentence |
| `clauseDepth` | comma count + subordinator count (no-parser complexity / MDD proxy) | computational-metrics pass |
| `propositionCount` | finite clauses + proposition-bearing modifiers | Landon: *"a sentence may contain more propositions than are visible in the grammar."* |

> Christensen: the cumulative sentence is *"dynamic… representing the mind thinking,"* its modifiers
> *"leaping and lingering as the popular ballad does."* Landon: *"A long sentence is not necessarily a
> better sentence, but a sentence containing more useful information, more specific detail, and more
> explanation will *almost* always be better than a shorter sentence that lacks information, detail, and
> explanation."*

### 2E. Restraint markers (Stephen King; Matesic; Burroway)

| Feature | Definition | Source |
|---|---|---|
| `lyAdverbs` | count of `-ly` adverbs (minus stoplist: *only, family, reply, early…*) | King: *"the road to hell is paved with adverbs."* Matesic: cut weak `-ly`. |
| `adverbBesideSpeechVerb` | `-ly` adverb adjacent to a speech tag ("said menacingly") | King — the one almost-always-bad adverb pattern |
| `intensifiers` | `very, really, just, suddenly, quite, rather, somewhat, literally, totally, simply, utterly, completely, extremely, incredibly` | S&W: *"the leeches that infest the pond of prose"*; King; Matesic |
| `filterVerbs` | perception/cognition verbs near a POV subject (saw, heard, felt, noticed, realized, watched, wondered, seemed, knew, decided) | Burroway "filtering"; Matesic: filters *"create a barrier between the reader and the narrative."* |
| `passiveHits` | be-verb + past participle (+ optional "by" agent) | Orwell rule (iv); Matesic |
| `revvingVerbs` | `began/started to …`, `began/started …ing` | Matesic/Darrow: cut "revving-up verbs" |
| `expletiveOpen` | `There was/were/is/are`, `It was/is … that` cleft | Strunk Rule 11; Purdue OWL |

### 2F. Rhythm & length — measured in CONTEXT (a sentence has no rhythm alone)

These score a sentence *against its neighbors* (rolling window of the surrounding paragraph / ±8
sentences). Gary Provost, verbatim: *"This sentence has five words… But several together become monotonous…
I vary the sentence length, and I create music."* Le Guin: *"There is no optimum sentence length. The
optimum is variety."*

| Feature | Definition | Source |
|---|---|---|
| `wordCount` | length in words | Provost's "five-word" floor; runaway-sentence ceiling |
| `windowLenSD` | std-dev of sentence length over the rolling window (a.k.a. "burstiness") | Provost; stylometry. Heuristic: fiction SD ≈ 9+ healthy; <5 reads flat/AI-like (calibrate on this book) |
| `monotonyRun` | longest run of neighbor sentences within ±2 words of each other | Provost: *"several together become monotonous"* |
| `windowMATTR` | moving-average type-token ratio over the window (length-robust lexical diversity) | lexical-diversity literature (prefer MATTR over raw TTR) |

> Note on ARI/Flesch: the Hemingway app grades each sentence with **ARI = 4.71·(chars/words) +
> 0.5·(words/sentence) − 21.43** (char-based, no syllables). We record `ariGrade` and `wordCount` as
> difficulty signals, but **do not** treat "long = bad": Hemingway's only hard rule is a ~14-word floor
> below which nothing is flagged; everything else feeds the grade. Length is judged by *variety* (2F), not
> absolute value. The "25 words = red" rule of thumb is **not** a real Hemingway constant (flagged).

---

## 3. The JUDGE layer — anchored 0–4 scales

Where reading is required, the judge scores each dimension **0–4** with these fixed anchors, and must cite
the rubric criterion + the computable evidence. (0 = absent/failing, 2 = competent, 4 = exemplary.)

| Dim | Question | 0 | 2 | 4 | Source |
|---|---|---|---|---|---|
| **J1 Verb energy** | Does the main verb do real work? | be-verb / "made a decision" | ordinary active verb | precise, surprising verb that replaces an adverb ("trudged" not "walked slowly") | Sword, Clark, King |
| **J2 Concreteness** | Is it down Hayakawa's ladder — sensory, specific? | abstractions only | one concrete anchor | renders an image you can see/hear/touch | Hayakawa, S&W |
| **J3 Freshness** | Is the language/image un-clichéd and true? | dead metaphor / cliché | serviceable plain statement | fresh observation that "nails real experience" | Orwell, Fish, Bookfox |
| **J4 Architecture** | Does the structure earn itself? | shapeless or padded | clean simple sentence | cumulative/periodic/balanced form whose shape *adds* (Landon "more is more" is true here) | Christensen, Landon, Tufte |
| **J5 End-emphasis** | Does the payload land at the end (or front)? | strongest word buried mid-sentence; weak tail | acceptable | the last word is the "Look at me" word | Clark, Tufte |
| **J6 Rhythm/sound** | Does it sound right read aloud, against its neighbors? | dull/choppy/droning | fine | "lively, well-paced, flowing, strong" | Le Guin, Klinkenborg, Provost |
| **J7 Truth/precision** | Does it say *exactly* what it means, logically? | vague / illogical / says less with more | clear | Klinkenborg's test: the writer knows what they actually said | Fish, Klinkenborg, Matesic |
| **J8 Form mirrors content** | Does the syntax enact the meaning? | neutral | — | "syntactic symbolism": a long sentence for a long action, a clipped one for a shock | Tufte, Fish |

J8 is a **bonus** dimension (0 or +2), not always applicable.

---

## 4. The POWER score (combined)

The seven anchored judge dimensions carry the score; J8 is a small bonus; a bounded computable nudge keeps
the ranking honest to the objective layer.

```
core        = (J1 + J2 + J3 + J4 + J5 + J6 + J7) / 28   # 0..1, the seven anchored dims
power_judge = core * 82 + (J8 / 4) * 6                  # 0..88  (J8 syntactic-symbolism bonus up to +6)

# Computable nudge (keeps ranking honest to the objective layer; ±12):
power_comp =
    + 4  if endWordClass == STRONG          (Clark end-emphasis)
    + 3  if branch in {RIGHT, BALANCED} and freeModifiers >= 1   (cumulative texture)
    + 2  if hasAbsolute or hasAppositive
    + 2  if 0.45 <= monoRatio              (Anglo-Saxon punch; cap once)
    + 1  if parallelism
    − 4  if beIsMainVerb and abstractNounDensity high
    − 3  if endWordClass == WEAK
    − 2  if clauseDepth very high without payoff (J4<2)

POWER = clamp( power_judge + power_comp , 0, 100 )
```

The judge dimensions dominate (that is where craft lives), but every judge score is **anchored to the
computable evidence**, and the computable nudge prevents a sentence from ranking high on vibes alone. This
is the operational meaning of *"most powerful according to these metrics."*

---

## 5. The SOPHOMORIC index (combined)

Penalty-based; higher = more amateur. Computed mostly by the scanner, with a judge confirmation pass on
borderline (CTX) hits. Full wordlists/regex in **`SOPHOMORIC-RUBRIC.md`**.

```
SOPHOMORIC (0–100) = clamp( Σ penalties , 0, 100 )

# HIGH-confidence (auto, narration only):
+18  each set-phrase cliché hit            (SOPHOMORIC-RUBRIC §1 [HIGH])
+10  filter verb in narration              (§2 [HIGH])
+10  adverb beside a speech verb           (§3 [HIGH])
+8   "by"-agent passive                    (§4)
+8   "It was X that" cleft / "the fact that"
+6   intensifier (very/really/suddenly/just/literally…)   (§3)
+6   "began/started to" revving verb       (§4)
+6   nominalization light-verb trap ("made a decision")   (§4)
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

**Dialogue exclusion is mandatory** for filter/know/think/seem/intensifier penalties. **VOICE.md
signatures** would normally be netted out before any rewrite — but this pass is *measurement only*, so we
record the raw SOPHOMORIC score and tag (not subtract) suspected signatures for later.

---

## 6. Calibration — the instrument must agree with these

Before trusting a full run, the scanner + judge must reproduce these:

1. **Anchor sentence** *(known-good)* — *"His left hand grips the railing with the patience of a man who
   has learned not to argue with his own body."*
   Expected computable: `branch=RIGHT`, `freeModifiers≥1` (the "with the patience of a man who…" tail),
   `endWordClass=STRONG` ("body"), `clicheHits=0`, `filterVerbs=0`, low `beVerbRate` (one "has learned"),
   fresh personification. Expected: **POWER high (~80+), SOPHOMORIC ~0.** *(The author rates this a "good
   sentence, a minor 10% factor"; the metrics agree — used as a sanity check, not as a thumb on the scale.)*
2. **Synthetic bad** — *"She suddenly realized that her heart was pounding in her chest as a shiver ran down
   her spine."* Expected computable: `intensifiers=1` (suddenly), `filterVerbs=1` (realized),
   `clicheHits=2` (heart pounding in her chest; shiver ran down her spine), `beIsMainVerb`, `thatRepeat`
   risk. Expected: **POWER low, SOPHOMORIC ≥ 50.**

If a run disagrees with either anchor, fix the instrument before drawing conclusions.

---

## 7. References (with verification flags)

All quotes above are verbatim from these unless flagged. Items flagged were not confirmable from a primary
source online and **must not be presented as exact quotations** without checking print.

**Verbs / nouns / diet**
- Helen Sword, "Zombie Nouns," *The New York Times* (Opinionator), July 23, 2012. — verbatim confirmed.
- Helen Sword, *The Writer's Diet* (Univ. of Chicago Press, 2016) + writersdiet.com user guide — five
  categories, suffix lists, per-100-word bands, weighting (Lean 1 / Fit 2 / Toning 4 / Flabby 16 / Heart
  Attack 32; overall 5–7 Lean … 64+ Heart Attack). *Flag: full prep/adjective wordlists not published.*

**Architecture**
- Francis Christensen, "A Generative Rhetoric of the Sentence," *CCC* 14:3 (1963), 155–161.
- Brooks Landon, *Building Great Sentences* (Plume, 2013) / Great Courses 2008. *Flag: "propositions" and
  "suspensiveness" exact wordings are secondary — concepts confirmed.*
- Stanley Fish, *How to Write a Sentence* (HarperCollins, 2011). *Flag: "a sentence is an organization of
  items in the world" NOT verified — the verified definition is "a structure of logical relationships."*
- Virginia Tufte, *Artful Sentences: Syntax as Style* (Graphics Press, 2006). Quotes via Moe, "Virginia
  Tufte's Sentences," *Style* 52:4 (2018) — reliable.

**Rhythm / diction / concreteness**
- Verlyn Klinkenborg, *Several Short Sentences About Writing* (Knopf, 2012). *Flag: "the ear is smarter
  than the eye" NOT verified — do not cite.*
- Ursula K. Le Guin, *Steering the Craft* (HMH, 2015). *Flag: "Style… is all rhythm" is Le Guin quoting
  Woolf — attribute to Woolf.*
- Roy Peter Clark, *Writing Tools* (Little, Brown, 2006/2016). *Flag: tool numbers differ by edition —
  cite by name.*
- George Orwell, "Politics and the English Language" (1946) — Orwell Foundation primary text, verbatim.
- Strunk & White, *The Elements of Style*. *Flag: "leeches that infest the pond of prose" confirmed only
  via secondary sources — verify against print.*
- Janet Burroway, *Writing Fiction* — "filtering." *Flag: exact wording edition-dependent.*
- S.I. Hayakawa, *Language in Thought and Action* — Abstraction Ladder. *Flag: Bessie-ladder rung labels
  are paraphrase, NOT a verbatim quote.*

**Restraint / amateur tells**
- Stephen King, *On Writing* (2000) — adverbs, verbatim via The Marginalian.
- Alyssa Matesic, alyssamatesic.com — "Words to Cut," "Weak Writing to Banish," "Show Don't Tell," "7
  Amateur Mistakes." *Flag: some quotes via WebFetch summarizer; YouTube titles unverified.*
- John Matthew Fox (Bookfox), thejohnfox.com — clichés as "laziness… recycling old words."

**Computational layer**
- Hemingway Editor ARI formula (reverse-engineered, freeCodeCamp). *Flag: yellow/red color cutoffs not
  officially published; sources disagree (~+4/+6 grades vs 12th/14th grade).*
- Flesch Reading Ease = 206.835 − 1.015·(words/sent) − 84.6·(syll/word); Flesch–Kincaid GL = 0.39·(words/
  sent) + 11.8·(syll/word) − 15.59. *Flag: syllable counting is heuristic (~85–95% accurate).*
- Gary Provost, *100 Ways to Improve Your Writing* — "five words" passage, verbatim.
- Burstiness (SD of sentence length) — ProWritingAid / stylometry. *Flag: SD 5/8/9 thresholds are
  heuristics, calibrate on this manuscript.*
- Lexical diversity (MATTR/MTLD over raw TTR) — standard.

## 8. Rules for suggested fixes (house style — read before proposing any rewrite)

Measurement is the default; when the author asks for fixes, every suggested replacement must obey:

1. **Suggestions only.** Never write to the Drive doc without an explicit per-session go-ahead ("apply",
   "write to the Doc"). "Approved" locks the *text*; it is not by itself a Drive-write command — confirm.
2. **No em dashes** in any replacement text. Use a period, a comma, or restructure. (House rule.)
3. **Never introduce a triad / rule-of-three.** Recount beats after every fix. See
   [[feedback_no_triad_when_fixing_openers]] and [[feedback_triad_fix_cut_dont_repunctuate]].
4. **Check the surrounding paragraph's rhythm BEFORE proposing a fragment-style fix.** If the paragraph
   already carries a fragment-stack, a fragment fix stacks a second short-beat run (a de-facto triad) —
   prefer a single *flowing* sentence there for variety instead (Le Guin/Provost: vary against neighbors).
5. **Subtraction first.** Prefer cut/combine, plain Anglo-Saxon, and a concrete end-word (Clark). Adverb +
   comma is a sparing scalpel, not a default. Match the author's lean voice.

---

> **Meta-flag (most important):** "sentence power" is not a validated construct. This instrument measures
> *symptoms* (monotony, weak verbs, abstraction, clichés, buried payloads) and *virtues* (cumulative
> texture, end-emphasis, concreteness, rhythm) that the canon associates with strong prose. Present results
> as "by these defined metrics," never as objective literary truth.
