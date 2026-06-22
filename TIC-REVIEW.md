# TIC-REVIEW.md — AI-introduced stylistic tics & how to fix them

*Generated June 14, 2026. A whole-book pass for the specific tics you named: triads &
rhyming/escalating triads, staccato runs, fragment overuse, 3-in-a-row same-opener
anaphora, and across-the-book repeated sentence openers.*

**Source: the live Google Drive doc** (synced via `.claude/skills/deai/sync.sh` on
June 14 → `.deai/manuscript.txt`, **81,203 words**, 2,660 paragraphs / 9,523 sentences).
Every count and line number below was verified against that canonical text. Line numbers
are manuscript.txt line numbers; re-sync before acting if you've edited the Doc since.

> **The one rule that governs every fix below.** The shape (fragment, triad, anaphora)
> is *not* the tic — most of these shapes are your signature. The tic is the **abstract
> version of the shape**: the run that climbs to a *concept* or *explains the meaning*
> instead of landing on a chosen physical thing. So nearly every fix is **subtraction**:
> cut the abstract beat / explainer tail, keep (or re-body) the concrete one. Your own
> de-AI edits are the proof — *"despair"* → *"their eyes were sunken."* When in doubt, **keep.**

---

## 0. The fastest wins (do these first)

**Hard bugs — fix regardless of style judgment:**

| Line | Bug |
|---|---|
| **39 / 46** | *"Raw, furious, and unmistakably alive"* appears **twice within Chapter One** (still 2× in the live doc). The triad itself is keep-worthy (VOICE.md cites it), but using it twice in seven lines reads as a copy. Vary or cut one. |
| **2430** | Lone present-tense *"Rain **patters** the roof"* sits inside an otherwise past-tense paragraph (not a screenplay slug). Either *"patted"* or commit the whole beat to screenplay-present. Your call — present-tense intrusion is your tic, but this one looks accidental. |

*(The June-7 duplication bug "drop her gaze or drop her gaze" and the explainer
"the distance… is where grief lived" are **already gone** in the live doc — fixed since.)*

**Recurring-idea repetition (not a sentence shape — a beat said too many times):**

- **"Lottie organizes everything"** is stated ~4×: L2456, L2492–2493, L2525, plus the
  socials beat just after. Keep one canonical line (L2525 *"It was a reflex, the
  making-neat"* is the best) and thin the rest.
- **"Mary breathes at the window, the knot loosens by fractions"** recurs across L1244–1245
  (and an earlier instance). The abstraction creeps into L1245 (*"wide, deep, indifferent,
  and beautiful"*) precisely because the concrete was already spent at L1244.
- **The "door he never opened" metaphor** is hammered across L2613–2614, with *"He had not
  opened it"* near-verbatim twice and *"sixty years"* repeated. Collapse to one pass.

---

## 1. Across-the-book repeated openers (the strongest machine signal)

These are **aggregate** tics — each instance is fine; the *count* is what an editor flags.
They don't all need changing, but the high-count filler-verb openers below are worth a
deliberate thinning pass. Full data via `node scripts/tic-scan.mjs`.

### Filler-verb sentence openers (thin these)

| Opener | Count | Note |
|---|---|---|
| **"[He/She/William/Mary] looked at…"** | **108** | (he 39 · she 30 · William 27 · Mary 12). The biggest single filler. "Looked at" is a camera direction, not an action — half can become what the look *lands on* or a real gesture. |
| **"[He/She/William] did not…"** | **160** | (he 68 · she 68 · William 24). Your negation is *signature* when it lands concrete ("He did not scream. He ground his teeth."). It's a **tic when it's a flat behavioral report** ("She did not smile. She did not blush…"). 160 is too many; thin the flat ones. |
| **"Her voice was…" / "His eyes were…"** | 14 / 10 | Body-part-state openers — the static "X was [adjective]" frame. Re-body to what the voice/eyes *do*. |
| **"He/She picked up…"** | ~22 | Stage business; fine in moderation, but a frequent default opener. |

### Same two/three-word openers worth a glance

`"She had"` ~101 · `"He had"` ~99 · `"He/She was"` ~170 combined · `"It was"` ~54 ·
`"This was"` ~36 · `"He/She stood"` ~76 · `"Then he"` ~23. These are normal narrative
connective tissue — **not** a to-do list, just the texture to be aware of when a page
feels flat: it's usually a cluster of `X was`/`X had` openers in one place.

---

## 2. Same-opener anaphora — 3+ sentences in a row (182 runs found)

Grouped by opener word, the runs split cleanly into **deliberate** vs **accidental**:

- **Deliberate rhetorical builds (KEEP):** the runs opening on *Not / No / For / This was /
  The same / You can* are your stacked-parallel signature and almost all land on a
  concrete payoff. Examples to **keep**: the *"For the boy… For the child… For the young
  man…"* build, *"This was the name… This was the heading…"*, and L469 *"The same bumps…
  The same silence…"* (but trim its abstract beat — see below).
- **Accidental metronome (THIN):** the runs opening on *He / She / The / It* (≈142 of the
  182) are where the same subject just stacks up. These are the ones to break.

**Worst accidental runs, longest first:**

| Line | Length | The run (opening) | Verdict |
|---|---|---|---|
| **2492** | **7× "She…"** | "She cleaned the room. She organized the desk. She answered the letters…" | **Thin** — flat list; vary openers, cut redundant verbs. |
| **2456** | 6× "She…" | "She arranged for a neighbor… She paid the taxes early. She left detailed instructions…" | Thin — vary 2–3 openers. |
| **1522** | 6× "She…" | "She had believed with a deep down faith. She prayed every night…" | Borderline; the faith inventory half-earns it. Thin lightly. |
| **920** | 5× "She…" (≈8 with prior para) | "She boiled water… She soaked cloths… She scraped lime… She held the cup…" | **Thin** — the sickroom labor runs ~8 "She [verb]" deep and stops landing. Vary openers; this should be devastating. |
| **990** | 3× "She cried…" | "She cried in the mornings. She cried at meals. She cried at night…" | **Cut to the one that lands:** "She cried at night, her face pressed into the mattress so no one would hear, but Letitia always heard." |
| **2493** | "She organized. She managed." | (directly under the 7× run at 2492) | **Cut** — duplicates the line above it. |
| **2032** | 5× "He…" | "He stood up. He did not hug her. He was not a man who did that easily…" | Borderline-keep (the withholding lands); thin only if it drags read-aloud. |
| **1543** | 4× "He…" | "He sat there. He did not get up. He did not pour whiskey or sing or weep. He just sat…" | **Keep** — concrete, lands on the empty chair. Signature. |

*The pattern to internalize:* your **abstract** anaphora hides inside your **concrete**
anaphora by copying the shape but swapping a concept for the chosen physical thing. When
a run flattens, it's almost always because one beat went abstract (e.g. L469's *"the same
indifference from the city"* sitting between two concrete beats — cut the label, keep the
carts and dogs).

---

## 3. Triads — the rule of three

76 `A, B, and C` constructions + ~460 three-short-sentences-in-a-row. **Most are fine:**
verb-sequence triads ("He finished his section, moved the ladder, and finished the next")
are natural compression — *keep them.* The tic is the **abstract/adjectival/noun-list
triad**, especially one that climbs to a concept or caps a beat with a summary.

| Line | The triad | Verdict / fix |
|---|---|---|
| **1245** | "the sky go on **wide, deep, indifferent, and beautiful**" | **Thin** — 4-adjective climb to "beautiful." → "the sky go on past the last rooftop with nothing to stop it." |
| **1571** | "a fortress of **deeds, paint, and brick**" (then re-explained as "the wall") | **Thin** — keep the ledger-stack, drop "fortress": "I built walls out of everything I had. Deeds. Paint. Brick." |
| **2437** | "support beams cracking. Load-bearing walls coming down. Groans and moans." | **Thin to one image** — "It sounded like something structural giving way. A load-bearing wall coming down." |
| **638** | "Looking for the angle. The opening. The place where a man could plant his feet." (+ a "the-way" simile) | **Thin** — cut the simile, collapse to one concrete beat. |
| **965** | "The boy who… The boy who… The only one who could carry on his name." | **Thin** — drop the thematic closer; keep two concrete beats. |
| **454** | "A schedule. A routine… Church. A community." | **Re-body** — abstract noun-fragments. → "Five children's worth of noise, porridge flung at the walls, nappies drying over the workbench." |
| **2416** | "The damp plaster. The moisture in the air. The narrow stairwell…" (lead-in "played a trick on his mind") | **Thin** — cut the gloss lead-in, keep two concrete beats. |
| **774 / 1040** | harbor-scenery fragment triads ("The forest of masts. The steamships…" / "The foghorns. The clank of chain…") | **Compress** — decorative inventory; two beats, not three. |

> **Note:** L1805 *"The boy from the tenements. The man who buried his children. The
> painter who hung his name above a hundred doors."* is **signature — keep it** (VOICE.md
> quotes it). Just delete its editorial tail *"All of it, compressed into a single gesture
> on a hillside in Minnesota."*

---

## 4. The deepest tic: the abstract-dissolving explainer / editorial tail

This came up in **every Part** and is the single most pervasive AI fingerprint in the
book. The shape: a beat lands a concrete image, then **one more sentence steps in to tell
the reader what it meant.** VOICE.md is explicit — *you do not editorialize the takeaway;
scenes end on physical buttons.* The fix is almost always **delete the tail.**

| Line | The explainer (cut or re-body) | Fix |
|---|---|---|
| **2608** | "Not because he had conquered them. **Because he was too tired to fight.**" | The textbook specimen. Cut the "why": "He stopped fighting the memories. They came. He let them." |
| **2280** | "he understood with a clarity that he had the equation backward his whole life… calling it ambition when it was something else entirely." | The banned "in that moment he realized." Keep the reversal felt, drop the lecture. |
| **1955** | "happiness is not a destination. It is a clearing in the woods… the woods have a memory, and they always grow back." | Aphorism (and the chapter title already says it). Let "And yet." stand as the button. |
| **1256** | "**Some things do not need words.**" | Cut entirely — her touching his face already said it. |
| **1498** | "They were evidence. Proof that she had been here. **That she had been real.**" | Stop at the objects: "He did not touch them. The apron still held the shape of her." |
| **2441** | "a man who had been drowning since 1850 and had never once come up for air." | Cut the drowning gloss: "So the iron dissolved. He shook, and there was nobody to hold it in for." |
| **2585** | "The emptiness was safer than the presence." | Cut both glosses; end on "So the seat stayed empty." |
| **1953 / 2055** | "It was not grief. It was not fear. It was the animal awareness of…" / "It was not relief. It was the blankness of a man who…" | The negation-to-abstract engine. Drop the negations, keep the body (shoulders that won't come down; a mind gone still). |
| **1835** | "Not to the chart. To her." | Let the torn chart carry it: "A torn chart in two clean halves was not friction. Someone had used both hands." |
| **2017 / 2000 / 563** | résumé-fragment glosses that re-explain a feeling already landed ("This man who… Who… Whose…"; "Physical. Certain."; "as proof. A name from nothing, twice.") | **Cut** — the physical button right before each already did the work. |

---

## 5. Staccato over-runs (uniform clipped metronome)

200 paragraphs scanned as staccato; **most are false positives** — the folded-paper
**name ledger** (*"George X. Joseph X. Austin X. Mary. Letitia…"*) is your central Chekhov
object and reads correctly. Genuine over-runs, where uniform short SVO sentences flatten
a beat that should escalate:

| Line | The run | Fix |
|---|---|---|
| **2184** | "His breath caught. The room contracted. The walls came closer. The ceiling dropped." | Break the uniformity: "The room contracted — walls in, ceiling down. His heartbeat was in his throat." |
| **2432** | "In desperation he banged the table. He immediately felt a release… morphing into futility." | Route through body/sound, drop "in desperation"/"futility": "He banged the table. The sound cracked through the empty house. He did it again, harder. Then again, and the table gave back the same dead thud." |
| **2189** | "He stood there. A minute. Two… His hand was wet. He had been sweating." | Keep the clipped panic; cut the signpost tail ("He had been sweating" explains the wet hand). |
| **2547** | "She found pieces. **Fragments.** The mustache. The hands. His jaw." | Cut "Fragments." (it labels the device) and re-body the "engine had deteriorated" gloss. |

> The Ch 35–38 emotional climax is **mostly earned lingering — leave it alone.** VOICE.md
> sanctions slowing at a genuine peak. Flag only the mechanical metronome above, not the
> slow grief beats.

---

## How to run the fixes

Two routes:

1. **By hand** from this file — most fixes are one-line deletions of an explainer tail or
   an abstract beat; safest for the emotional peaks.
2. **Through the existing `/tic` pipeline** (`.claude/skills/tic/`) for the systematic
   anaphora/repeated-opener thinning — it enumerates every instance deterministically,
   classifies concrete-vs-abstract against VOICE.md, suggests in-voice rewrites, and gates
   every change behind your review before anything touches Drive. The filler-verb opener
   thinning (§1) is a good candidate for that loop.

**Priority order:** §0 bugs → §4 explainer tails (highest density, easiest subtraction) →
§2 accidental "He/She" anaphora → §1 "looked at" thinning → §3 abstract triads → §5 staccato.

*Re-sync + re-scan anytime: `bash .claude/skills/deai/sync.sh && node scripts/tic-scan.mjs > /tmp/tic.json`*
(always sync first — the Drive doc is canonical and the local cache goes stale).
