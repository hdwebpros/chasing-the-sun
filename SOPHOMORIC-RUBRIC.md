# Sophomoric-Sentence Detection Rubric

> **Companion appendix to `SENTENCE-POWER.md`** — this file holds the wordlists/regex behind the
> SOPHOMORIC index (§5 of the instrument). The scanner imports these lists. Convergence note: every
> category here is independently corroborated by **Alyssa Matesic** ("Words to Cut," "Weak Writing to
> Banish") — filter words, passive/"by", weak `-ly` adverbs + intensifiers (*suddenly, really, very*),
> dialogue-tag density, and pet phrases — so these are not one editor's idiosyncrasy.

A computable rubric for flagging amateur / clichéd / purple prose. Each category gives the
citable craft principle (with **verbatim, attributed** quotes) plus a ready-to-use, deduplicated
wordlist/regex set. Items are tagged **[HIGH]** (rarely false-positive, safe to flag aggressively)
or **[CTX]** (context-dependent — flag for human review, never auto-rewrite).

> Compiled June 2026. Quotes are verbatim from the cited sources unless flagged. Items marked **†**
> are my own synthesis from the same cliché-family (common-knowledge, *not* attributable to a cited
> URL) — included for scanner coverage, not as sourced claims. See the **Verification flags** at the
> end of each section.

---

## 1. Fiction clichés & "telling" emotion phrases

### Sources

1. **C.S. Lakin**, "How Fiction Writers Can Show Emotions in Their Characters in Effective Ways," *Live Write Thrive* — https://www.livewritethrive.com/2015/06/24/how-fiction-writers-can-show-emotions-in-their-characters-in-effective-ways/
   > "First, these things are so overused, they've become cliché." *(on physical-reaction shorthand: twisting stomachs, trembling hands, burning cheeks, erratic heartbeats, hitched breaths)*

2. **Tracey Lee**, "50 cliché phrases to avoid when writing fiction," *Tracey Lee Writes* — https://traceyleewrites.com/2025/08/21/50-cliche-phrases-to-avoid-when-writing-fiction/ — *the single best enumerated list; most non-† items below are verbatim from here.*
   > "These phrases get old fast, they come across as tired, and loose impact in your prose." *(quoted as-rendered; "loose" is the author's apparent typo for "lose")*

3. **NY Book Editors**, "5 Writing Cliches to Avoid" — https://nybookeditors.com/2018/06/5-writing-cliches-to-avoid/
   > "Clichéd emotional responses are particularly yawn-worthy because they literally could apply to anyone."
   > "Clichés in writing are frowned upon because they're easy; they're the sign of a writer who chooses to go with the first idea that comes to mind rather than digging deeper to find the exact phrase to suit the character and scene."

4. **Scribophile**, "Clichés to Avoid in Writing (Plus Cliché Examples)" — https://www.scribophile.com/academy/cliches-and-their-place-in-prose
   > "A cliché is any word or expression that has been used so often that it has lost its original punch or even its meaning."

5. **John Matthew Fox (Bookfox)**, "The 5 Lessons You Must Know about Cliches in Writing" — https://thejohnfox.com/2016/06/avoid-cliches-in-writing/
   > "Clichés are phrases or sayings that have been overused and said too much and completely lack originality."
   > "Cliches show the reader that you didn't want to work at writing." *(his "Laziness" lesson)*
   > "By using a cliche, you are recycling old words." *(his "Lack of originality" lesson)*
   Fox names language clichés ("once upon a time," "a dark and stormy night," "Mark my words," "Follow your heart," "when it rains, it pours," "everything happens for a reason") but does **not** enumerate emotion/physical clichés.

**Verification flags:** NY Book Editors (#3) and Anne R. Allen's "How to Avoid Clichéd Emotional Responses" share the same three example phrases and framing — treat as partially syndicated, not two independent confirmations. I found **no** citable ProWritingAid/Reedsy/Autocrit/Jericho Writers page that *enumerates* these specific physical-emotion phrases — do not attribute the list to those brands. "pinched the bridge of his nose," "bile rose in his throat," "breath hitched," "heart hammered" are widely mocked as clichés but were **not** found in a formal editor's list — tagged [CTX]/†.

### Wordlist

```
# Breath
[HIGH] let out a breath she didn't know she was holding
[HIGH] let out a breath he didn't know he was holding
[HIGH] released a breath she didn't realize she was holding †
[HIGH] breath she didn't know she'd been holding †
[HIGH] her breath caught in her throat
[CTX]  breath caught
[CTX]  breath hitched †
[CTX]  let out a breath †
[CTX]  let out a shaky breath †
[CTX]  sucked in a breath †
[CTX]  breath he'd been holding †

# Heart
[HIGH] her heart skipped a beat
[HIGH] heart pounded in her chest
[HIGH] heart pounded in his chest
[HIGH] her heart was in her mouth
[HIGH] heart in her throat †
[HIGH] his heart sank
[HIGH] her heart swelled with pride
[HIGH] her heart fluttered
[CTX]  heart hammered †
[CTX]  heart raced †
[CTX]  heart pounded
[CTX]  heart skipped †
[CTX]  heart swelled †

# Blood / cold / chills / shivers
[HIGH] his blood ran cold
[HIGH] her blood ran cold
[HIGH] a shiver ran down her spine
[HIGH] a shiver ran down his spine
[HIGH] a chill ran down her spine
[HIGH] sent shivers down her spine
[HIGH] his stomach turned to ice
[HIGH] cold shivers up your back
[CTX]  sent shivers †
[CTX]  a chill ran through †

# Stomach / gut
[HIGH] butterflies in her stomach †
[HIGH] butterflies danced in her stomach
[HIGH] her stomach dropped
[HIGH] a lump formed in her throat
[CTX]  bile rose in his throat †
[CTX]  bile rose in her throat †
[CTX]  stomach twisted †
[CTX]  stomach churned †
[CTX]  knot formed in her stomach †

# Knees / legs / body
[HIGH] her knees went weak
[HIGH] made her weak in the knees
[HIGH] her legs were like lead
[HIGH] her arms felt like jelly
[CTX]  knees buckled †
[CTX]  legs turned to jelly †

# Face / eyes
[HIGH] he couldn't believe his eyes
[HIGH] their eyes met across the room
[HIGH] he couldn't take his eyes off her
[HIGH] his jaw dropped
[CTX]  eyes widened †
[CTX]  her eyes widened †
[CTX]  eyes narrowed †
[CTX]  pinched the bridge of his nose †
[CTX]  pinched the bridge of her nose †
[CTX]  the grin that stretches from ear to ear
[CTX]  cheeks burned †
[CTX]  cheeks flushed †
[CTX]  a single tear trickling down her cheek
[CTX]  tears welled up in her eyes
[CTX]  a lump in her throat †

# Fear / shock / freezing
[HIGH] she froze in her tracks
[HIGH] he was frozen with fear
[HIGH] she felt like a deer in headlights
[HIGH] her hair stood on end
[HIGH] he was scared out of his wits
[HIGH] she jumped out of her skin
[CTX]  froze in place †
[CTX]  blood drained from her face †
[CTX]  her hand flew to her mouth †

# Time / world / weight
[HIGH] time seemed to stand still
[HIGH] time stood still †
[HIGH] the weight of the world was on her shoulders
[HIGH] the bottom dropped out of her stomach †

# Love / attraction
[HIGH] sparks flew between them
[HIGH] she felt an electric charge when they touched
[HIGH] she melted under his gaze
[HIGH] they were drawn to each other like magnets
[CTX]  drawn to each other †

# Anger / overwhelm / mood
[HIGH] she burned with rage
[HIGH] he was a bundle of nerves
[HIGH] he was on cloud nine

# Exhaustion / pain
[HIGH] she was dead on her feet
[HIGH] he was tired to the bone
[HIGH] he felt like he'd been hit by a truck
[HIGH] her eyelids felt like bricks
[CTX]  her head was pounding
[CTX]  pain shot through his body
[CTX]  bone-tired †
```

---

## 2. Filter words (telling-not-showing markers)

### Sources

1. **Janet Burroway**, *Writing Fiction: A Guide to Narrative Craft* — the canonical origin of the term. Quoted via Storm Writing School, "Filtering" — https://stormwritingschool.com/filtering/
   > "when you step back and ask the readers to observe the observer—to look at rather than through the character—you start to tell-not-show, and rip us briefly out of the scene." *(secondhand — see flags)*

2. **Susan Dennard**, "Filter Words and Distancing POV" — https://susandennard.com/2010/12/06/ltwf-filter-words-and-distancing-pov/
   > "Filters are words or phrases you tack onto the start of sentence that show the world as it is filtered through the main character's eyes."

3. **Write It Sideways**, "Are These Filter Words Weakening Your Fiction?" — https://writeitsideways.com/are-these-filter-words-weakening-your-fiction/
   > "'Filtering' is when you place a character between the detail you want to present and the reader."

4. **Scribophile**, "An Introduction to Filtering" — https://www.scribophile.com/academy/an-introduction-to-filtering
   > "In writing, filters are unnecessary words that separate the reader from the story's action. They come between the reader's experience and the character's point of view."

5. **Anne R. Allen**, "Filter Words and Phrases It's Best to Avoid in Writing Fiction" — https://annerallen.com/2017/06/filter-words-and-phrases-to-avoid-in-writing/ *(most exhaustive list)*
   > "Filter words form a barrier that distances readers from a story."

**Verification flags:** Burroway's primary text was **not** read directly; her quote is reproduced consistently across editor sites (high confidence, secondhand). The Publishing Crawl mirror of Dennard's post refused connection (2026-06-16); use the susandennard.com URL. ProWritingAid's filter-words article 404'd — no quote attributed to it.

### Wordlist

Most fire as `(I|he|she|they|<name>) + VERB` and as `could + VERB`. Use **word boundaries** and match
inflections (`-s/-ed/-ing`). Restrict to **narration** where possible — exclude dialogue, since
*know/think/feel/remember* are normal in speech.

```
# Top-priority HIGH targets (densest, most reliably weak)
[HIGH] saw
[HIGH] heard
[HIGH] felt        # word-boundary care; also legit emotion/texture
[HIGH] noticed
[HIGH] realized / realize
[HIGH] watched / watch
[HIGH] wondered / wonder
[HIGH] seemed / seem
[HIGH] knew
[HIGH] decided / decide
[HIGH] observed    # CTX in dialogue-tag sense
[HIGH] perceive
[HIGH] sensed
[HIGH] recognized
[HIGH] assumed
[HIGH] recalled
[HIGH] experienced

# Multi-word phrase matches (match literally)
[HIGH] found himself / found herself / found myself / found themselves
[HIGH] could see / could hear / could feel / could smell / could taste
[HIGH] feel like / felt like / seemed like / sounded like / looked like
[HIGH] catch sight of / caught sight of

# Context-dependent (flag, expect false positives — review only)
[CTX]  look / looked      # physical appearance: "she looked tired"; "look out!"
[CTX]  see / hear         # bare forms over-fire; prefer "could see/hear"
[CTX]  sound / sounded    # "the sound" (noun) is legit; POS care
[CTX]  smell / taste      # noun forms legit
[CTX]  feeling            # often a noun ("a feeling of dread")
[CTX]  sense              # noun ("a sense of"); collides with sensible/nonsense
[CTX]  know / think       # extremely common in dialogue
[CTX]  thought            # "a thought" noun
[CTX]  remember           # common in dialogue
[CTX]  believed / considered / guessed / understood
[CTX]  appeared / appear  # "appeared in the doorway" (entered) vs "appeared tired" (filter)
[CTX]  listen / listened  # "listen to" can be legit action
[CTX]  spot / spotted     # "spot" = noun/blemish
[CTX]  could              # only a filter paired with a sensory verb
```

**Word-boundary traps:** `feel/felt`, `see` (matches seem/seen/sheen unbounded), `sense` (sensible/nonsense), `spot`, `note/noted` (notebook), `can/could`.

---

## 3. Purple prose markers

### Sources

1. **Stephen King**, *On Writing: A Memoir of the Craft* (2000) — the adverb canon. Quoted via The Marginalian, "Stephen King on Writing, Fear, and the Atrocity of Adverbs" — https://www.themarginalian.org/2013/03/13/stephen-king-on-adverbs/
   > "The adverb is not your friend."
   > "I believe the road to hell is paved with adverbs, and I will shout it from the rooftops."
   > "They're like dandelions. If you have one on your lawn, it looks pretty and unique. If you fail to root it out, however, you find five the next day . . . fifty the day after that . . ."
   > "Adverbs, like the passive voice, seem to have been created with the timid writer in mind."
   On dialogue tags: "'Put it down!' she shouted menacingly" is weaker than "'Put it down!' she shouted." On "He closed the door firmly": the adverb is redundant if the prose already conveys *how*.

2. **Strunk & White**, *The Elements of Style* — on weak qualifiers/intensifiers (E.B. White's "An Approach to Style"):
   > "Rather, very, little, pretty—these are the leeches that infest the pond of prose, sucking the blood of words."
   *(VERIFICATION FLAG: confirmed via multiple secondary sources, not the primary text — the public-domain PDF at faculty.washington.edu is binary/uncompressed and could not be parsed. Widely and consistently reproduced; verify against a print copy before formal citation.)*

3. **Reedsy**, "What Is Purple Prose?" — https://reedsy.com/blog/purple-prose/
   > "Purple prose is a style of writing characterized by overly flowery language that tends to draw attention to itself, and away from the story being told."
   > *(characteristics:)* "excessive adjectives, exaggerated comparisons, multisyllabic words, long sentences, and elaborate descriptions of a character's inner thoughts and feelings."

4. **September C. Fawkes**, "Purple Prose: What it is, How it Works, How to Get Rid of it" — https://www.septembercfawkes.com/2018/03/purple-prose-what-it-is-how-it-works.html — her stacked-modifier example (≥10 modifiers in one sentence):
   > "I curiously asked, reaching one dainty, delicate, elegantly thin hand out to pat my closest and dearest friend on top of her soft, silky, round head."

### Detection patterns

```
# -ly adverb overuse (King). Density metric, not a wordlist: flag any sentence with
#   2+ -ly adverbs, or any paragraph above ~1 -ly adverb per sentence.
[CTX]  \b\w{3,}ly\b              # excludes only/family/reply etc. via a stoplist below
       -ly stoplist (NOT adverbs): only, family, reply, apply, supply, comply, rely,
       belly, jelly, fully(?ctx), early, ugly, holy, italy, lily, ally, bully, rally,
       jolly, folly, melancholy, anomaly, assembly, monopoly, gly-* names

# Adverb-in-dialogue-tag (King) — HIGH when an -ly adverb sits next to a speech verb
[HIGH] (said|asked|shouted|whispered|replied|muttered|growled|hissed|sighed|cried)\s+\w+ly\b
[HIGH] \w+ly\b\s+(said|asked|shouted|whispered|replied|muttered|growled|hissed)

# Thesaurus intensifiers / filler qualifiers (Strunk & White + King)
[HIGH] suddenly
[HIGH] very
[HIGH] really
[HIGH] just            # CTX-leaning: legit as "fair/only"; flag by density
[HIGH] quite
[HIGH] rather
[HIGH] somewhat
[HIGH] literally
[HIGH] totally
[HIGH] actually
[HIGH] basically
[HIGH] simply
[HIGH] truly
[HIGH] absolutely
[HIGH] completely
[HIGH] utterly
[HIGH] extremely
[HIGH] incredibly
[CTX]  pretty         # "pretty good" filler vs "pretty face"
[CTX]  little         # qualifier "a little tired" vs size
[CTX]  so             # intensifier "so beautiful" vs conjunction

# Adjective stacking: 3+ comma-separated adjectives on one noun (Reedsy / Fawkes)
[HIGH] (\w+,\s+){2,}\w+\s+(hand|eyes|hair|face|voice|smile|head|sky|...) # 3+ adj before noun
[CTX]  any noun phrase with 3+ stacked adjectives
```

**Notes:** `-ly` and `just/so/little/pretty` are best scored by **density** (per-sentence / per-paragraph
counts) rather than single-hit flags, to avoid drowning in false positives. Adverb-beside-speech-verb
is the one HIGH, almost-always-bad adverb pattern.

---

## 4. Weak constructions

### Sources

1. **Strunk & White**, *The Elements of Style*, Rule 11 (active voice) & Rule 13 (omit needless words). Public full text: https://faculty.washington.edu/heagerty/Courses/b572/public/StrunkWhite.pdf
   > "Many a tame sentence of description or exposition can be made lively and emphatic by substituting a transitive in the active voice for some such perfunctory expression as *there is*, or *could be heard*."
   > "There were a great number of dead leaves lying on the ground. / Dead leaves covered the ground."
   > "Vigorous writing is concise. A sentence should contain no unnecessary words, a paragraph no unnecessary sentences..."
   Rule 13 flags "the fact that" — "should be revised out of every sentence in which it occurs."

2. **Purdue OWL**, "Conciseness: Avoid Common Pitfalls" — https://owl.purdue.edu/owl/general_writing/academic_writing/conciseness/avoid_common_pitfalls.html
   > "Expletives are phrases of the form *it* + *be*-verb or *there* + *be*-verb. Such expressions can be rhetorically effective for emphasis in some situations, but overuse or unnecessary use of expletive constructions creates wordy prose."

3. **Helen Sword**, "Zombie Nouns," *The New York Times* (Draft/Opinionator), July 23, 2012 — https://archive.nytimes.com/opinionator.blogs.nytimes.com/2012/07/23/zombie-nouns/
   > "Nouns formed from other parts of speech are called nominalizations... I call them 'zombie nouns' because they cannibalize active verbs, suck the lifeblood from adjectives and substitute abstract entities for human beings."
   Companion TED-Ed lesson: https://ed.ted.com/lessons/beware-of-nominalizations-aka-zombie-nouns-helen-sword
   > "Zombie nouns transform simple and straightforward prose into verbose and often confusing writing."

4. **Mignon Fogarty (Grammar Girl)**, "Active Voice Versus Passive Voice" — https://www.quickanddirtytips.com/articles/active-voice-versus-passive-voice/
   > "One clue that your sentence is passive is that the subject isn't taking a direct action."
   *(The "insert *by zombies*" passive test is Dr. Rebecca Johnson's, not Fogarty's — attribute accordingly.)*

5. **Miranda Darrow**, "Concise Language: Cut the Clutter and Filler Words..." — https://www.mirandadarrow.com/concise-language-cut-the-clutter-and-filler-words-for-more-active-prose/
   > "Delete 'revving-up verbs' such as 'started to' and 'began to' which show up when a character is beginning an action. Most times, these two words are unneeded."

**Verification flags:** The Sword NYT page would not load via fetch; quote returned via search + cross-confirmed against her TED-Ed lesson — verify against the archived URL before print. Several "began to" blog hits did not contain the claim on fetch; only the Darrow page is cited.

### Detection patterns

```
# A. Expletive / dummy subjects
[HIGH] \bThere (was|were|is|are|will be|has been|have been)\b
[HIGH] \bIt (was|is)\b[^.?!]*\bthat\b      # cleft "It was X that…" (strongest catch)
[CTX]  \bThere (was|were|is|are)\b          # keep when existence is the point
[CTX]  \bIt (was|is)\b                      # keep weather/time: "It was raining"
[HIGH] \bthe fact that\b                    # Strunk Rule 13

# B. Passive voice (be + past participle, optional "by" agent)
[HIGH] \b(was|were|is|are|been)\s+\w+(ed|en)\s+by\b      # "by"-agent passive (strongest)
[CTX]  \b(was|were|is|are|be|been|being)\s+(\w+ed|written|made|done|seen|taken|given|
       held|known|shown|told|found|kept|sent|built|broken|chosen|driven|spoken)\b
[CTX]  \b(was|were)\s+\w+ed\b               # many -ed are adjectives ("was tired")

# C. Nominalizations (zombie nouns) — HIGH only with a light verb trapping a real verb
[HIGH] \b(make|made|making|give|gave|take|took|have|had|provide|conduct|perform|reach)\s+
       (a|an|the)?\s*\w+(tion|sion|ment|ance|ence|al)\b
       e.g. made a decision→decided, gave consideration to→considered,
            took action→acted, reached a conclusion→concluded,
            conducted an investigation→investigated, had a discussion→discussed,
            gave an explanation→explained, made a recommendation→recommended
[CTX]  \b\w{3,}(tion|sion|ment|ance|ence|ity|ness|ism|ization)\b   # bare abstractions

# D. "began to" / "started to" hedge (revving-up) verbs
[HIGH] \b(began|begun|begins|begin|started|starts|start)\s+to\s+\w+
[HIGH] \b(began|started)\s+\w+ing\b         # "began walking", "started crying"
[CTX]  keep only when the action is genuinely interrupted ("began to speak, but…")

# E. "in order to" (wordy for "to")
[HIGH] \bin order to\b      → to
[HIGH] \bin order for\b     → for / so
[CTX]  \bin order not to\b   → so as not to / to avoid
```

---

## 5. Quick reference — what to ship as auto-flag vs review

| Category | Auto-flag (HIGH) | Review-only (CTX) |
|---|---|---|
| Clichés | full set-phrase matches ("let out a breath she didn't know…", "blood ran cold") | single-body-part verbs ("eyes widened", "breath caught") |
| Filter words | saw, heard, felt, noticed, realized, watched, wondered, seemed, knew, decided, "found himself", "could see/hear/feel" | look(ed), know/think, sound/smell, appeared, could |
| Purple prose | adverb-beside-speech-verb; very/really/suddenly/literally | -ly density, just/so/little/pretty, adjective stacks |
| Weak constructions | "by"-agent passive, "It was X that", "in order to", "began/started to", "the fact that" | bare "There was", bare "It is", -ed passives, bare abstractions |

**Global guidance:** ship the HIGH sets as flags; gate CTX sets behind **density thresholds** and
**dialogue exclusion** (skip quoted speech). For this manuscript specifically, cross-check every flag
against `VOICE.md` before rewriting — the negation-fragment and other signatures are deliberate per the
author's memory notes; a generic "sophomoric" hit may be in-voice.
