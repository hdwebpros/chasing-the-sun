# CHARACTER LANGUAGE PASS — Working Document

**Generated:** 2026-06-12, from a fresh Drive export (the cached `.deai/manuscript.txt` predates your June "language hiberno" edits — this analysis is against the *current* Doc).
**Scope:** Every quoted line of dialogue, Prologue → Epilogue. Narration untouched (it stays modern American by design).
**Nothing has been written to Drive.** Apply fixes via the book-edit pipeline (`edit-doc.mjs` find/replace) or by hand. Re-verify each "Current" quote against the Doc when applying — curly quotes matter.

> **UPDATE 2026-06-13 — a few of these were hand-applied to Drive on a plane pass** (verified against the current Doc):
> - ✅ **#11 doable** → *"it can be done"* — applied exactly as suggested (Ch 7 dockworker).
> - ✅ **#14 hun** → you chose *"acushla"* (not the suggested "love"). Anachronism gone either way; "acushla" is heavier but recognizable — fine if intended, just heavier than the rest of the Boston-arc density.
> - ⚠️ **#9 dead man walkin'** → currently reads *"He's a dead man',"* — the 1990s "walking" idiom is gone, but the result is a typo'd fragment, not the suggested *"He's done for."* **Re-fix:** make it "He's done for," (or "He's a dead man,").
> - ⚠️ **Cross-Book Thread 2 (the 100% callback) is now BROKEN.** The **Epilogue** line was rewritten — but not to "I'm never wrong." It became *"I've have a few failed gambles, Hollis. Boston was a bad one. This gamble seems to have paid off."* Meanwhile **Ch 31 still says "I am correct 100% of the time"** (unchanged). So: one anachronism remains (Ch 31), and the matched echo is gone, replaced by a new **gambling** callback (which also ties to the new Summit-gamble scene — see CHARACTER-REVIEW). **Decide:** either restore a matched pair, or commit to the gambling throughline and rewrite Ch 31's line to rhyme with it. Also typo: *"I've have"* → "I've had".
> - 🔎 **Lottie intro** — *"Lottie! C'mere to me, dear"* → *"Lottie! Come here at once."* You stripped the Hiberno "c'mere to me" from this line. If the speaker is Irish that's a loss; if not, it's a correct de-brogue. Verify who's speaking.
> - Still unplanted: **"Prime."** (0 instances — Cross-Book Thread 1 untouched).

## Contents

- [The target — what "100" means](#the-target--what-100-means)
- [FIX FIRST — the 16 high-priority findings](#fix-first--the-16-high-priority-findings)
- [Cross-book threads (decide once, apply everywhere)](#cross-book-threads-decide-these-once-apply-everywhere)
- Part-by-part findings:
  - [Prologue](#prologue--grants-pass-1925-william--hollis)
  - [Part One — Dublin](#part-one--dublin-18411873-ch-18)
  - [Part Two — Crossing & Boston](#part-two--crossing--boston-18731878-ch-917)
  - [Part Three — St. Paul](#part-three--st-paul-18781887-ch-1823)
  - [Part Four — The Other Half](#part-four--the-other-half-18891900-ch-2431)
  - [Part Five — Oregon + Epilogue](#part-five--oregon-19001927-ch-3238--epilogue)
- [Acceptance checklist — how you'll know it's at 100](#acceptance-checklist--how-youll-know-its-at-100)

---

## The target — what "100" means

| Arc | Chapters | Register target |
|---|---|---|
| **Dublin** (Part One) | 1–8 | PURE late-1800s Dublin Hiberno-English. Densest Irish in the book. Common slang & phrases, just how they talked — but readable, one tell per line. |
| **Crossing & Boston** (Part Two) | 9–17 | Still mostly Hiberno, loosening slightly American: `me`→sometimes `my`, `meself`→sometimes `myself`, straighter word order. Fellow Irish immigrants stay full Dublin. |
| **St. Paul** (Parts Three & Four) | 18–31 | Public/business talk = Minnesotan/period-American with trace tells. Irish surfaces in **passionate/emotional moments and private family moments only**. |
| **Oregon** (Part Five + Prologue/Epilogue frame) | 32–38 | Only the most popular Irish slang & grace notes survive: "grand," "aye," occasional "ye," true-function "sure," "mind yourself." One deeper slip allowed at peak emotion. |
| **Lottie** | wherever she speaks | Kansas/Midland Plains American, period. **Never one Irish tell.** |
| **Narrator** | everywhere | Modern common English — out of scope, never gets dialect. |
| **American-born characters** | everywhere | Period American, no Irish (children may carry a *framed* learned phrase only). |

**The unifying law the book already half-follows (keep enforcing it):** `me/meself` = heart, family, private; `my/myself` = business, public, aspiration. The *ratio* shifts American part by part, but the split itself is the system. Part Two already does this beautifully ("I had **my** own shop" vs. "I'm thankful for **me** family") — the findings below mostly fix lines that break the law in one direction or the other.

### Scoring snapshot (current state)

| Part | Lines examined | On-target | Findings (H/M/L) | Read |
|---|---|---|---|---|
| Prologue | 9 | 7 | 0 / 2 / 0 | Nearly there — first impression of William needs one breath of Ireland |
| Part One — Dublin | ~200 | ~155 | 13 / 12 / 25 | Strong spine, punctured by modern Americanisms + banned lexicon |
| Part Two — Boston | ~150 | ~125 | 1 / 9 / 13 | The loosening is already patterned right; grief scenes go flat |
| Part Three — St. Paul | ~145 | ~134 | 0 / 7 / 3 | Best register-split execution in the book |
| Part Four — The Other Half | ~195 | ~163 | 2 / 11 / 18 | Lottie mostly great; modern idiom cluster in Ch 31 |
| Part Five — Oregon | ~91 | ~81 | 0 / 2 / 8 | Best-calibrated part; Epilogue anachronisms only |
| **Total** | **~790** | **~665 (84%)** | **16 H / 43 M / 67 L** | |

Fix the 16 H's and the book jumps immediately; the M's are where the dialect arc actually *earns* its 100; the L's are polish.

---

## FIX FIRST — the 16 high-priority findings

1. **Ch 3 · William:** "trash" → "rubbish" (Dublin never says trash) — see P1 list
2. **Ch 3 · Pa:** "a power of family" — banned lexicon *(your recent hand-edit — confirm intent)*
3. **Ch 3 · Pa:** "a clatter of childer" — both banned *(confirm intent)*
4. **Ch 3 · William (child):** "the other childer" → "the other lads"
5. **Ch 3 · Pa:** "…on the pig's back, **okay** William?" → "so ye will."
6. **Ch 4 · Mary:** "focus on the good things… times were tough" — modern self-help in the key courtship scene
7. **Ch 6 · William:** "two childer" → "two of the children"
8. **Ch 6 · William:** "childer… foot traffic" → "children… passin' trade"
9. **Ch 7 · William:** "He's a **dead man walkin'**" — 1990s death-row idiom, the most visible anachronism in the book — ⚠️ *partly applied: now "dead man'," a typo'd fragment; re-fix to "He's done for,"*
10. **Ch 7 · William:** "Nah, I have four childer..." → "Ah no, I've four children..."
11. ✅ **Ch 7 · Dockworker:** "it's **doable**" → "it can be done" — *applied 2026-06-13*
12. **Ch 7 · Dockworker:** "let's just say… all them childer" → cut hedge, "children"
13. **Ch 7 · Mary:** "We have a **community**… It **scares** me" — modern civic/therapy speech at Part One's emotional peak
14. ✅ **Ch 17 · William:** "Look over there, **hun**" → applied as **"acushla"** (your word, not the suggested "love") — *2026-06-13; anachronism resolved*
15. **Ch 31 · Lottie:** "that wouldn't work **business-wise**" → "that would ruin the business" (the "-wise" suffix is mid-20th-century)
16. **Ch 31 · Lottie:** "**Ye'd** better." — the only Irish tell in her Kansas mouth (see Cross-Book Threads below before fixing)

---

## CROSS-BOOK THREADS (decide these once, apply everywhere)

### 1. William's signature approval word — "Prime." — does not exist in the book yet
**"Deadly" is OUT, permanently** — the slang sense ("excellent") isn't attested until the 1900s, decades too late for William's Dublin. Your standing replacement is **"Prime."** — and it also appears 0 times in the manuscript. His "Hrmm" grunt appears 4× (first sign, second sign, citizenship paper, basement beam — keep all; "Prime." is its spoken twin). Your prior spec: **exactly 3 instances** — an establishing use, the defiant "Let them come" moment, and a quiet final callback. Mapped to the text:

- [ ] **Establishing use (Ch 3):** the first BOOG sign — *"Hrmm". He grunted a grunt of approval.* → follow the grunt with `"Prime."` (the canonical origin beat; or pick another early approval moment)
- [ ] **The defiant moment (Ch 7):** "Grand. Let them come. I'll make them a proper pair of boots and they'll never go back." → **"Prime. Let them come. I'll make them a proper pair of boots and they'll never go back."**
- [ ] **Quiet final callback:** strongest candidate is Rose's Liffey painting (Ch 29) — "The light was right. On the water. You got the light exactly right." → append `"Prime."` (a clean approval beat, no violence anywhere near; his word for his St. Paul-born daughter painting Dublin itself)
- **Keep it to three, and keep it out of the Oregon frame** — every approval beat there is death-adjacent (a will, the fall, the hollow Grants Pass sign), and the absence only *means* something if the word exists earlier.

### 2. The "100%" callback pair (Ch 31 ↔ Epilogue)
Both flagged independently as anachronisms — but they're clearly an intentional echo (his certainty speech to Lottie, repeated to Hollis 25 years later). **Fix both in matched phrasing to preserve the callback:**
- [ ] Ch 31: "It's not often in my life that I have a true certainty. But when I do, Lottie, **I am correct 100% of the time.** And the math on my own blood is absolute." → "…But when I do, Lottie, **I am never wrong.** And the math on my own blood is absolute." — ⚠️ *2026-06-13: UNCHANGED. Still "100% of the time" — anachronism remains.*
- [~] Epilogue: "I'm not often certain, but when I am, **it's true 100% of the time.**" → "I'm not often certain, Hollis. But when I am, **I'm never wrong.**" *(also kills the modern "I don't always… but when I do" meme shape)* — ⚠️ *2026-06-13: rewritten, but to a **gambling** line ("a few failed gambles, Hollis. Boston was a bad one. This gamble seems to have paid off"), not "never wrong." Anachronism gone, but the **matched pair is broken**: Ch 31 above is now orphaned. Pick one — restore the pair, or carry the gambling motif into Ch 31 too.*

### 3. Lottie's "Ye'd better." (Ch 31) echoes William's "Ye'd better." (Ch 27)
The phrases are verbatim-identical, so this may be deliberate — her sending him off with *his own words*. As written, nothing frames it, so it reads as a register error (Irish in her Kansas mouth). Two options:
- [ ] **(a) Keep the echo, frame it** — add a small beat so the reader knows she's borrowing his phrase (e.g. *she said it the way he would have said it*), or
- [ ] **(b) Plain Kansas:** "You'd better."

### 4. The Ch 35 Dublin memory voices are in modern American
The remembered taunts — *"You're just a no-named bastard from the slums"* / *"Your father didn't want you. Your mother didn't either."* — are Dublin-1850s voices replaying in his head and should sound like Part One:
- [ ] → `"Ye're just a no-named bastard from the slums"` / `"Yer father didn't want ye. Yer mother didn't either."`
- Note: they don't appear verbatim in Part One (Ch 3 has "the other childer call me a bastard… nothing good will come from a bastard"). Optional deeper stitch: make the Ch 35 memory quote the Ch 3 playground line exactly.

### 5. "Ma," never "Mom"
The family pattern is **Pa / Ma** (Letitia: "before Ma died"). Mary Margaret's deathbed line breaks it:
- [ ] Ch 28: "Talk to me about her, Pa. Tell me about **Mom**." → "…Tell me about **Ma**."
- [ ] Ch 28: "If you can put up with **my dad**" → "If you can put up with **Pa**"

### 6. The banned-lexicon cluster in Pa's Ch 3 speech
Your June hand-edits reintroduced "a power of family," "a clatter of childer," plus five further dialogue uses of "childer." These are on your own banned list (reader can't parse them). Flagged as H above — **but since you typed them in recently, confirm whether you've changed your mind** before bulk-fixing. If the ban stands: power of→heap of, clatter of childer→houseful of children, childer→children/lads.

---

# PART-BY-PART FINDINGS

Check off as you apply. `H` = breaks the spell, fix first · `M` = the arc earns its score here · `L` = polish.

---

## PROLOGUE — Grants Pass, 1925 (William & Hollis)

**State:** Nearly perfect. Hollis is clean 1920s American professional throughout. William is measured American — but his **first spoken line of the book** is dead flat one sentence before the narration claims "The consonants still belong to Ireland."

- [ ] **William · too-flat · M** — Current: "I appreciate that." → **"Aye. I appreciate that."** (the reader *hears* the claim before it's named)
- [ ] **William · register-mismatch · M** — His most unguarded beat, speaking of his mother for the first time in decades: "She chose **my** Catholic name herself." → "She chose **me** Catholic name herself." Keep every other "my" in the scene intact so this single slip reads as the memory pulling it out of him.

**Tuning fork (keep verbatim):** *"It was no place at all to raise a child," he says, "but she did it all the same."* — Hiberno carried entirely by cadence, zero eye-dialect. Tune all of Part Five/frame William against this line.

---

## PART ONE — Dublin, 1841–1873 (Ch 1–8)

**State:** The spine is already here — dropped g's, me/meself, ye, "after + -in'" hot-news perfects, "so they would" tags, well-functioning "Sure"s. Chapters 3–7 have long stretches at exactly target density. Two systemic leaks: (1) **modern Americanisms puncturing otherwise-good lines** — each one breaks the spell; (2) the **banned lexicon** reintroductions (see Cross-Book Thread 6). Mary's biggest emotional speeches are the only fully flat-modern moments.

### Chapter 2
- [ ] **William (child) · too-flat · M** — "Ma, what is she doing?" → **"Ma, what's she doin'?"** (his only famine line is schoolbook English)

### Chapter 3
- [ ] **William · too-flat · M** — "Mother doesn't know how to stitch leather. I did this meself." → **"Me ma doesn't know how to stitch leather. I did this meself."** ("Mother" is drawing-room formal next to "meself")
- [ ] **William · anachronism · H** — "Found scraps in the trash and laying around… I put my mind to it" → **"Found scraps in the rubbish and lyin' about. I watched you and others work on shoes and boots. I put me mind to it, and I've slowly learned how to stitch."**
- [ ] **Doyle · inconsistency · L** — "…better stitchin' in Northampton! … The stitch**ing** looks like bird shit!" → **"The stitchin' looks like bird shit!"** (he drops his g's; same breath)
- [ ] **Doyle · too-flat · L** — "Cheap to make, make it fast, the customer comes back quickly… Our name is on it, you know?" → **"Cheap to make, made fast, and the customer's back inside a month to buy again. … Our name's on it, so it is."**
- [ ] **Doyle · anachronism · L** — "I can see ye ain't goin' away." → **"I can see ye're not goin' away."** (Dublin negates with "not"; "ain't" is Boston — save it for Kennedy)
- [ ] **William · too-flat · L** — "He was after tellin' me he gets to go across the ocean" → **"…he's to go across the ocean some day, like."**
- [ ] **Pa · banned-lexicon · H** — "we've a power of family over in Scotland" → **"we've a heap of family over in Scotland."** *(confirm — recent hand-edit)*
- [ ] **Pa · banned-lexicon · H** — "He's his own wife and a clatter of childer." → **"He's his own wife and a houseful of children."** *(confirm — recent hand-edit)*
- [ ] **Pa · parody-stack · L** — "He died, God rest him, and meself only a wee lad." → **"He died, God rest him, and meself only a lad."** (three tells; "wee" is the Northern one anyway)
- [ ] **Pa · sure-overuse · M** — three "Sure"s in one conversation. Cut the decorative first: "**Sure they** do be changin' the spellin' of it." → **"They do be changin' the spellin' of it."** Keep the other two.
- [ ] **Pa · anachronism · M** — "It means nuttin'. … Quit goin' on about yer last name." → **"It means nothin'. … Give over goin' on about yer last name."** ("Quit" is American; "nuttin'" off-system — his register is "nothin'")
- [ ] **William (child) · banned-lexicon · H** — "Pa, the other childer call me a bastard." → **"Pa, the other lads call me a bastard."**
- [ ] **Pa · anachronism · H** — "you'll be on the pig's back, okay William?" → **"you'll be on the pig's back, so ye will."** (the "okay" deflates a lovely line)
- [ ] **William · missed-signature · M** — the first BOOG sign: *"Hrmm". He grunted a grunt of approval.* → consider establishing his approval word here: follow the grunt with **"Prime."** — see Cross-Book Thread 1 (the Ch 5 second-sign "Hrmm" then contrasts).

### Chapter 4
- [ ] **Mary · anachronism · M** — "Hey, what's the craic?" → **"What's the craic?"** (don't bolt a modern American greeting onto the most Irish greeting in the book)
- [ ] **William · anachronism · L** — "Uh… hello." → **"Em… hello."** (the Irish hesitation noise)
- [ ] **William · too-flat · L** — "I bet our parents know each other." → **"I'd say our parents know each other."**
- [ ] **Mary · too-flat · H** — "Me grandpa Moran once told me to focus on the good things and rely on the church. God has always provided for me, even when times were tough." → **"Me grandpa Moran once told me to mind the good things and hold to the church. God has always provided for me, even in the hard times."** (modern self-help phrasing in the key courtship scene)
- [ ] **Mary · too-heavy · M** — "Young you are for a bootmaker on his own" → **"You're young for a bootmaker on his own"** (adjective-fronting = the inversion pattern you've rejected)
- [ ] **Mary · sure-overuse · L** — two Mary "Sure"s in one short scene; keep "Sure, that's life. That's the way of it." and change the second → **"Ah, that makes no sense at all."**

### Chapter 5
- [ ] **Mary + William · sure-overuse · M** — three "Sure"s in one doorstep exchange. Keep William's "Sure, it'll clean up." and her "sure we can't go walkin' in uninvited." Fix the middle speech → **"I don't know. The tenements cost us next to nothin'. It's what we know. We know how it all works there. It's just so busy up here."** (also kills the flat "We understand how things work there")
- [ ] **William · anachronism · L** — "Hey!" (attention-getter) → **"Here!"**
- [ ] **William · too-flat · L** — "Some fella named Joseph." → **"Some fella called Joseph."**
- [ ] **William · too-flat · M** — "I'll grab my shop supplies and make me sign and lay out my things down here… just throw my stuff upstairs" → **"I'll fetch me shop supplies and make me sign and lay out me things down here. I'm a simple man, just throw the rest upstairs and I can sort it later."** ("grab"/"stuff" modern; my/me wobbles ×3)
- [ ] **Mary · too-flat · L** — "They smell of something terrible..." → **"They smell something fierce..."** (the lexicon intensifier sharpens the joke)

### Chapter 6
- [ ] **Mary · inconsistency · L** — "He's talking to you," two lines after "Sure he's been doin' that the whole afternoon." → **"He's talkin' to you,"**
- [ ] **William · anachronism · L** — "Apologies. My son is unwell." → **"Beg your pardon. My son is unwell."**
- [ ] **William · too-flat · L** — "And the signin', Mary." → **"And the sign, Mary."** ("signage" wearing an apostrophe)
- [ ] **William · anachronism · M** — "And the storefront was the problem." → **"And the shopfront was the problem."** (Mary herself says "shopfront" later in the scene)
- [ ] **William · banned-lexicon · H** — "steppin' over two childer" → **"steppin' over two of the children."**
- [ ] **William · too-flat · L** — "That's exactly my point." → **"That's it exactly."**
- [ ] **William · too-flat · L** — "I'm just sayin'." → **"I'm only sayin'."**
- [ ] **Mary · anachronism · M** — "Don't put that on both of us." → **"Don't be layin' that on the both of us."** (modern therapy idiom)
- [ ] **William · anachronism · M** — "Number 13 is the corner unit" → **"Number 13 is the corner shop"** ("unit" = modern real-estate; narration also says "corner unit" at top of Ch 7 — one sweep if you change the dialogue)
- [ ] **William · banned-lexicon · H** — "The childer would have space… the foot traffic will more than cover it… Sure, I can feel it." → **"The children would have space to crawl around without endin' up under me workbench. And the rent, aye, it's more, but the passin' trade will more than cover it. Number 13 is where the money is. I can feel it."** (childer banned; "foot traffic" modern retail jargon; decorative "Sure")

### Chapter 7
- [ ] **Mary · anachronism · M** — "In the actual newspaper?" → **"In the newspaper itself?"** ("the actual X" incredulity is 21st-century)
- [ ] **William + pub · sure-overuse · L** — "Sure"s cluster 2/page in the ad scene, 3 in the pub. Thin one each: "In bold, **sure,** if they'll let me." → **"In bold, if they'll let me."** and "**Sure the** work around the docks is dryin' up" → **"The work around the docks is dryin' up like a tinker's well."** Keep the rest — they're earning.
- [ ] **Mary · too-flat · L** — "Ye're out of words, and I'm out of energy," → **"Ye're out of words, and I'm destroyed,"** (the exact Dublin word, keeps her parallelism)
- [ ] **Mary · too-flat · L** — "Boog family, you'll have to put up with foul-smelling garments" → **"Boog family, yez'll have to put up with foul-smellin' garments for a while."** (plural address = "yez")
- [ ] **Dockworker · anachronism · M** — "You heard about O'Malley, right?" → **"You heard about O'Malley, did ye?"** (Hiberno tags with the verb)
- [ ] **Dockworker · anachronism · L** — "walks with a gimp" → **"walks with a limp"** (also fix the stray space before the comma)
- [~] **William · anachronism · H** — "He's a dead man walkin'," → **"He's done for,"** (1990s death-row idiom — the most visible anachronism in the part) — ⚠️ *2026-06-13: changed to "He's a dead man'," — anachronism gone but result is a typo'd fragment; finish the fix.*
- [ ] **William · banned-lexicon · H** — "Nah, I have four childer..." → **"Ah no, I've four children..."**
- [x] **Dockworker · anachronism · H** — "if ye save yer pennies, it's doable." → **"…it can be done."** — ✅ *applied 2026-06-13*
- [ ] **Dockworker · banned-lexicon · H** — "well, let's just say ye'd best start savin'. With yer wife and all them childer..." → **"well, ye'd best start savin'. With yer wife and all them children..."**
- [ ] **William · too-flat · M** — "I could keep my craft… Start fresh." → **"I could keep me craft. If not, there's work for farm hands, painters, laborers. I could learn a new trade. Start again."** (his biggest dream-speech goes register-neutral)
- [ ] **Mary · anachronism · M** — "that ye can pull this off?" → **"…that ye can manage it?"**
- [ ] **Mary · too-flat · H** — "I can't live with change like this. We have a community. I have a family. You keep asking me to change. It scares me, William." → **"I can't live with change like this. We've our own here. I've family here. You keep askin' me to change. It frightens me, William."** (the emotional peak of Part One)

### Chapter 8
- [ ] **William · anachronism · L** — "That's God's honest punishment." → **"That's God's own punishment."**
- [ ] **Mary · too-flat · M** — "I think I was ready since Michael's Lane." → **"I'd say I was ready since Michael's Lane."** (closing line of the part; the hedge-perfect lands it)

### Whole part
- [ ] **inconsistency · L** — dropped-g wobbles with no scene logic: "We're stay**ing** in this barn." → **"stayin'"**; "There's light where we're go**ing**, Mary." → **"goin'"**. Normalize to the speaker's established form within each scene.

**Tuning forks (keep verbatim):**
- Doyle: *"A man's toes'd be out the front of this inside a month, so they would."*
- William selling: *"Sure, those boots'll see ye through three winters, sir, and by then ye'll be back. Not because they're worn out, but because ye'll be wantin' a second pair for the summer."*
- Mary to baby Letitia: *"Yer pa has us dragged up and down this quay like a man lookin' for his hat… And do you know what? I think he's finally found it."*
- Mary over sick Junior: *"Since late mornin'. He'll not take a drop of water. I've tried, so I have."*
- Dockworker: *"…and didn't O'Malley lift it!"* · William: *"I know. Sure, didn't ye marry me anyway?"*

---

## PART TWO — Crossing & Boston, 1873–1878 (Ch 9–17)

**State:** Very close. The American loosening is already present **and patterned** — William reaches for "my/myself" in aspiration/business and keeps "me" where the heart is. No softening spots needed; the drift is right. The gaps: flat "you" lines at the *highest-grief* moments (Austin's deathbed, the graveside, Mary's collapse) — exactly where the family's Irish should surface; a handful of anachronisms; one phonetic over-reach.

### Chapter 9–10
- [ ] **William · parody-stack · L** — "What would ye be wantin' with me money?" → **"What would ye be wanting with me money?"** (three tells; keep two)
- [ ] **William · inconsistency · L** — "I had my own shop on the Liffey… I'll chance me arm on that." → **"I had me own shop on the Liffey."** (day one off the boat, talking to a fellow Irishman — too early for the my-drift)
- [ ] **Cork man · anachronism · L** — "Nothing to me, I come in peace." → **"Nothing to me, I mean ye no harm. God and Mary be with you."**
- [ ] **Cork man · too-flat · L** — "I'm going back to our homeland. You should consider the same." → **"I'm goin' back home to Ireland. Ye should consider the same."**
- [ ] **Cork man · anachronism · M** — "they may cut a deal for your little ones." → **"they may knock a bit off for your little ones."**

### Chapter 12–13
- [ ] **William · too-flat · L** — "A nail was poking out. I caught it reaching for the brush." → **"A nail was pokin' out. I caught it reachin' for the brush."** (private moment with Mary, early Boston)
- [ ] **Mary · too-flat · L** — "You bring your arms down on 'my fair lady'…" / "Precisely. Then you have teams…" → **"Ye bring your arms down on 'my fair lady' and capture whoever's underneath."** / **"That's it. Then ye have teams for your next game."** (teaching a Dublin childhood game should sound like Dublin; "Precisely" is starched)
- [ ] **Mary · too-flat · M** — "The atmosphere, the rain, the Liberties, the Liffey. It was a way of life. This is a big change." → **"The air of it, the rain, the Liberties, the Liffey. It was a way of life. It's a fierce big change."** (her most homesick speech goes beige at the peak)
- [ ] **William · too-flat · M** — graveside, barely audible: "I brought you all this way," → **"I brought ye all this way,"**

### Chapter 14–15
- [ ] **William · anachronism · L** — "I was on a jobsite today" → **"I was on a job today"**
- [ ] **Doctor · anachronism · L** — "Has anyone else been in close contact?" → **"Has anyone else been near her?"** (modern epidemiology register)
- [ ] **William · anachronism · M** — "Right now, I need you to fight, okay?" → **"Right now, I need ye to fight, d'ye hear me?"** (the "okay?" tag at his most desperate private moment)
- [ ] **William · too-flat · M** — "It's not supposed to be like this! You can't leave us! We need you! I need you…" → **"It's not supposed to be like this! Ye can't leave us! We need ye! I need ye…"** (peak grief; the repeated pronoun is one tell carried through the cry, not a stack)
- [ ] **William · too-flat · M** — "You are the best mother any child could ask for." → **"Ye're the best mother any child could ask for."**
- [ ] **William · inconsistency · M** — "Don't ye ever give up. We need you. Ye'll be fine. Just give it some time." → **"Don't ye ever give up. We need ye. Ye'll be fine. Give it time."** (ye→you→ye in one breath; modern-consoling cadence)

### Chapter 16–17
- [ ] **William · too-heavy · M** — "I've four children buried in this city, t'ree in this building," → **"…three in this building,"** (th-stopping appears nowhere else in his voice; "I've four children" already carries the line)
- [ ] **Landlord · wrong-character · L** — "I'm sorry for your trouble, Mr. Boog. But the cost of the building is what it is." → **"I'm sorry for your loss, Mr. Boog. But the building costs what it costs."** ("sorry for your trouble" is the distinctly Irish condolence formula — keep only if he's meant to be Irish; "is what it is" pings modern)
- [ ] **Murphy · inconsistency · L** — "Yankees aren't makin this easy" → **"makin'"** (missing apostrophe)
- [ ] **Murphy & William · parody-stack · L** — pub lines occasionally hit 3 tells: "Half the lads goin' west are farmers, the rest chasin' gold like the eejits their mothers raised." → **"Half the lads going west are farmers, the rest chasin' gold like the eejits their mothers raised."** / "door hangin' off it, stuck open, no shiftin' it for love nor money." → **"door hangin' off it, stuck open, no shifting it for love nor money."** (restore one "-ing" per line; keeps the music under the cap)
- [ ] **Mary · too-flat · L** — "I'll go anywhere you want to go. But I need you to know something." → **"I'll go anywhere ye want to go. But I need you to know something."** (the marriage-defining surrender line; she uses "ye" with William everywhere else in the chapter)
- [x] **William · anachronism · H** — "Look over there, hun. We are going that direction." → applied as **"acushla"** (your choice over the suggested "love") — ✅ *2026-06-13*

### Interludes (1925 frame)
- [ ] **William · inconsistency · L** — "Aye, yes, two children on that train," → **"Aye, two children on that train,"** ("yes" is just "Aye" translated — dilutes the signature)
- [ ] **William · anachronism · M** — "an unplanned expense started a trajectory I never saw coming." → **"an unplanned expense set me on a road I never saw coming."** ("trajectory" as life-metaphor is late-20th-century)

**Tuning forks (keep verbatim):**
- William, first sight of New York: *"We'll not be stayin' here," … "This is the door. Not the house."*
- The bandage escalation — Mary: *"You should wrap it."* → William: *"Sure it'll heal on its own."* → Mary: *"I said ye should wrap it."* (her Irish surfacing precisely when crossed — perfect scene-logic dialect)
- Mary: *"What are ye now, a Protestant? We celebrate the feast days of the saints, William. Not holidays the governments went inventin'."* and *"Supper's nearly done, so."*
- William: *"Girls, look away. Austin, c'mere to me."* / *"…pull out the innards, would ye."*
- Murphy: *"Me brother-in-law's gone out to St. Paul… sky out past where God stopped paintin' it…"* · Flynn: *"Ye're a madman entirely, Boog."*
- Mary: *"Then go find where the sun truly sets, William. … Find what ye've been lookin' for. We'll be by yer side."* · 1925 William: *"the list of me children's names is longer"* (the deliberate deep slip, exactly on the emotional beat)

---

## PART THREE — St. Paul, 1878–1887 (Ch 18–23)

**State:** Best register-split execution in the book — American in business rooms, Irish in the kitchen and at Mary's bedside. Mary's deathbed lines are the finest dialect writing in the part. Gaps live at the edges: two pile-ups, a few peak-grief William lines going flat, and American minor characters speaking 20th-century idiom.

- [ ] **Ch 18 · Compass vendor · anachronism · M** — "This is fine quality, US made." / "…if I like it, I will cut you a great deal. Does that work?" → **"This is fine quality, American made."** / **"However, come back with the sign, if I like it, I will give you a fine price. Have we a bargain?"**
- [ ] **Ch 19 · Mary · too-heavy · M** — "Sure there's somethin' between eight and twelve that accounts for the trim without losin' ye the referral." → **"Sure there's something between eight and twelve that accounts for the trim without losing ye the referral."** (4 tells → 2; the "Sure" is legit)
- [ ] **Ch 19 · Midwife · anachronism · M** — "The baby didn't make it, Mr. Boog." → **"The baby did not live, Mr. Boog."**
- [ ] **Ch 19 · William · register-mismatch · M** — at Mary's bedside: "Most were my sons." → **"Most were me sons."** (his rawest blurt — peak private grief is where the Dublin slips out)
- [ ] **Ch 20 · William · register-mismatch · M** — school-board pitch: "…because I put it there meself." → **"…because I put it there myself."** (his most formal public moment; "meself" should have sanded down in business talk by now)
- [ ] **Ch 20 · William · register-mismatch · L** — "Children, would you like a horse of your own?" → **"Children, would ye like a horse of your own?"** (playful private moment; surrounding family lines all carry tells)
- [ ] **Ch 20 · Mary · inconsistency · L** — "I went there once. On my own." (same monologue closes "I did a thing just for meself") → **"On me own."**
- [ ] **Ch 21 · Doctor · anachronism · M** — "what you're experiencing is a condition called ascites." / "The presentation can appear similar." → **"what you are suffering is a condition called ascites."** / **"The signs can appear much the same."**
- [ ] **Ch 22 · William · register-mismatch · M** — "I didn't drag you across the ocean…" → **"I didn't drag ye across the ocean and through Boston and onto a train and out to this godforsaken prairie so that..."** (the most emotional private moment of the part; one tell carries it)
- [ ] **Interlude · William · anachronism · L** — "had cost me a wife and many kids." → **"had cost me a wife and children."** (the rest of the speech says "children")

**Tuning forks (keep verbatim):**
- Mary: *"C'mere to me. Sit."* — the tuning fork for her private register
- Mary: *"What are we to do with that at all, William? Have her shell peas until she's married?"*
- William's all-American ad dictation: *"Calcimining & Tinting. Then add my pricing details…"* — the split working exactly as specced
- Mary to the doctor: *"Ye're very good, Doctor. William will see you out."* — dignity in extremis, one trace tell to a stranger
- Mary's deathbed wit: *"And for God's sake, hire someone to do your laundry. Ye're hopeless with the wash."*
- William: *"I'll see to it, so."* — the sentence-final "so" as the whole brogue

---

## PART FOUR — The Other Half, 1889–1900 (Ch 24–31)

**State:** Largely on its mark — William's public register properly clean with grace notes at the right density, and his Ch 31 kitchen breakdown correctly lets fuller slips out. Three issues: peak-emotion family beats going flat; his signature approval word still unplanted despite the best approval beat in the book (Rose's painting — see Cross-Book Thread 1); and Lottie carrying one Irish tell plus a cluster of modern/therapy idiom in the Ch 31 confrontation.

### Chapter 24
- [ ] **William · register-mismatch · M** — courtship bench: "And I love my kids. They are my everything." → **"And I love me kids. They are my everything."** (his most unguarded declaration; the my→me on "kids" and keeping "my everything" preserves the drift law)
- [ ] **Lottie · lottie-kansas · L** — "Your coverage looks solid there. That's usually where the gaps show." → **"…That's usually where the gaps show, I reckon."**
- [ ] **Lottie · lottie-kansas · L** — "It was disgusting." → **"It was plain disgusting."**
- [ ] **Lottie · lottie-kansas · L** — "A mile up the road." → **"A good mile up the road."**
- [ ] **Lottie · anachronism · L** — "You went through a lot of trouble," → **"You went to a lot of trouble,"**
- [ ] **William · inconsistency · L** — "Girls, you're itchin' fer a clippin'." → **"Girls, ye're itchin' for a clippin'."** ("fer" is hayseed-American eye-dialect, not Dublin — he never says it elsewhere)
- [ ] **William · anachronism · L** — "Okay, okay, okay, I agree…" → **"All right, all right, all right, I agree, I think we should all get together, but this house can't hold everyone."**

### Chapter 25
- [ ] **Lottie · anachronism · L** — "She just held ten children hostage with a prayer and a stare." → **"She just held ten children captive with a prayer and a stare."**
- [ ] **Mary Margaret · anachronism · L** — "It takes a lot to love a guy like him." → **"It takes a lot to love a man like him."**
- [ ] **Lottie · anachronism · L** — "I'm so, so sorry to hear that." → **"I am so sorry to hear that."**
- [ ] **Lottie · anachronism · M** — "You always get to see the best version of me." → **"You always get to see the best of me."** (contemporary self-help idiom)
- [ ] **William · register-mismatch · L** — "Charlotte, will you take my hand in marriage?" → **"Charlotte, will ye take my hand in marriage?"** *(counter-argument: his deliberate formality — "Charlotte" — justifies "you." Your call.)*

### Chapters 26–28
- [ ] **Ch 26 · Letitia · anachronism · L** — "You are a menace." → **"You are a terror."** (period word for a mischievous girl)
- [ ] **Ch 27 · William · register-mismatch · M** — the wounded paternal protest at Letitia's vows: "That's not your name. Your name is Letitia Agnes Boog." → **"That's not yer name. Yer name is Letitia Agnes Boog."**
- [ ] **Ch 28 · Mary Margaret · inconsistency · L** — "If you can put up with my dad" → **"If you can put up with Pa"** (she says "Pa" two lines later)
- [ ] **Ch 28 · Mary Margaret · inconsistency · M** — "Talk to me about her, Pa. Tell me about Mom." → **"…Tell me about Ma."** (deathbed line; family pattern is Ma — see Cross-Book Thread 5)
- [ ] **Ch 28 · William · register-mismatch · M** — the most intimate family-emotion scene in the part (his daughter dying, talking about Mary) carries no Irish through the whole exchange. One tell is enough: "Four walls and your mother, and you had everything you needed." → **"Four walls and yer mother, and you had everything you needed."** (keep the plainness everywhere else)

### Chapter 29
- [ ] **William · missed-signature · M** — Rose's Liffey painting: "The light was right. On the water. You got the light exactly right." → append **"Prime."** — the strongest genuine approval beat in the book and the best candidate for the quiet final callback (see Cross-Book Thread 1).

### Chapter 30
- [ ] **Lottie · anachronism · L** — "William, are you doing that thing again?" → **"William, are you at it again? What big important news do you have for me?"**
- [ ] **Lottie · inconsistency · L** — *(continuity, not dialect)* "Paul says he can call the railroad office…" → **"Frank says…"** (the neighbor is Frank McCarthy throughout the scene; "Paul" appears nowhere else)

### Chapter 31 — the confrontation (the densest fix cluster in the book)
- [ ] **Lottie · anachronism · L** — "Hon, I understand times are tough." → **"Hon, I know times have been hard."** ("Hon" itself is fine for Kansas)
- [ ] **Lottie · anachronism · L** — "…it is not your fault. William, it is not… your… fault." → **"You need help and you need to know that it is not your fault."** (the staged ellipsis repetition is a modern-film cadence; lands harder once, plainly)
- [ ] **Lottie · anachronism · M** — "No. You do not get to sit at this table and tell me your mind is destroying you and then hand me a real estate prospectus." → **"No. You will not sit at this table and tell me your mind is destroying you and then hand me a real estate prospectus."** ("you do not get to" = late-20th-century moral rebuke. "You are having two conversations." borders therapy-speak but is load-bearing — keep if you want.)
- [ ] **Lottie · anachronism · M** — "I understood what I was signing up for." → **"I understood what I was taking on."**
- [ ] **William · anachronism · M** — "I am correct 100% of the time." → **"I am never wrong."** (matched with the Epilogue — see Cross-Book Thread 2) — ⚠️ *2026-06-13: still UNCHANGED while the Epilogue half was rewritten; this line is now the orphaned anachronism. Fix.*
- [ ] **Lottie · anachronism · H** — "We can't get a divorce, that wouldn't work business-wise." → **"We can't get a divorce, that would ruin the business."** (the "-wise" suffix is mid-20th-century — the most jarring anachronism in the part, in a pivotal scene)
- [ ] **William · anachronism · M** — "When the census person comes" → **"When the census man comes"**
- [ ] **William · anachronism · M** — "for you and our bundles of joy." → **"for you and our wee ones."** ("bundle of joy" is a 1920s+ cliché — and "wee" gives this family-intimate farewell its one Irish tell)
- [ ] **Lottie · anachronism · L** — "I'm serious, prayer can work wonders." → **"I mean it, prayer can work wonders."**
- [ ] **William · register-mismatch · L** — the fence confession to Letitia: "George and William in Dublin, Joseph, Austin, Teresa, in Boston, John, all of them." → **"…John, all of them, God rest them."** (peak emotion, lightest possible touch, and it's for the dead)
- [ ] **Lottie · wrong-character · H** — "Ye'd better." → see **Cross-Book Thread 3** (frame the echo, or **"You'd better."**)

**Tuning forks (keep verbatim):**
- William public: *"Ye'll have to forgive Mrs. Daly," he said. "She's been trying to marry me off since the funeral."*
- The blend in one breath: *"What do you think?" He pointed to the house behind him. "Grand, ain't she?"*
- Courtship: *"Miss Lottie, I'm an honest man. If ye can't take that, ye may as well find another aul' Irishman with a mustache."*
- Family wit: *"Watch yerselves, kids, I heard them bees can do the backstroke!"*
- True-function "sure": *"Don't put it back up," he said. "Ah sure, let the house sort itself out. Mary never had a chart. She just showed up every morning and fought through it."*
- The slip arriving on cue: *"…anythin' that I love that is near me, dies Lottie."* / *"It's God's way of punishin' me…"*
- Lottie's Plains spine — keep every word: *"Three times. The last letter came back with a promise and a prayer. The bank does not accept prayers, William."* / *"Take care of yourself," she said. "You're no spring chicken."*

---

## PART FIVE — Oregon, 1900–1927 (Ch 32–38 + Epilogue)

**State:** The best-calibrated part. William's public register is clean period American; every Irish tell lands at an emotional or unguarded beat. The single "sure" is in true function. Lottie is line-by-line clean of Irish here. Keep his signature approval word out of this part entirely — every approval beat is death-adjacent or deliberately hollow (the withheld ritual at the Grants Pass sign is the point). The real gap is a small cluster of modern lines in the Epilogue that puncture the 1925 frame.

- [ ] **Ch 35 · Dublin memory voices · too-flat · L** — see **Cross-Book Thread 4**: "You're just a no-named bastard from the slums" / "Your father didn't want you. Your mother didn't either." → **"Ye're just a no-named bastard from the slums"** / **"Yer father didn't want ye. Yer mother didn't either."**
- [ ] **Ch 36 · William · register-mismatch · L** *(optional — adopt this OR the Ch 37 one, not both; the part should gain at most one new slip)* — "Mary in the chair." His voice broke. → **"Mary in the chair, God rest her."**
- [ ] **Ch 37 · William · register-mismatch · L** *(the alternative)* — "Lottie, you don't understand, they will certainly die if I come back. I can't be convinced otherwise." → **"Lottie, ye don't understand. They'll die if I come back. I can't be convinced otherwise."** (also seeds the "If ye knew" slip later in the chapter)
- [ ] **Ch 37 · William · anachronism · M** — "The house. The kids. The whole life. Fake perfection." → **"…The whole life. Painted-on perfection."** ("fake perfection" reads modern; a painter's idiom keeps the man)
- [ ] **Ch 37 · Lottie · lottie-kansas · L** — "William, come home. Come back to Minnesota." → **"William, come on home. Come back to Minnesota."**
- [ ] **Ch 37 · Lottie · lottie-kansas · L** — "We have a great life in Minnesota. You need to accept that." → **"We have a great life in Minnesota. You'd best accept that."**
- [~] **Epilogue · William · anachronism · M** — "I'm not often certain, but when I am, it's true 100% of the time." → **"I'm not often certain, Hollis. But when I am, I'm never wrong."** (matched with Ch 31 — see Cross-Book Thread 2) — ⚠️ *2026-06-13: rewritten to a gambling line instead; breaks the Ch 31 pair. Typo "I've have" → "I've had". See Thread 2.*
- [ ] **Epilogue · William · anachronism · L** — "married his high school sweetheart Angela." → **"married his sweetheart Angela."** ("high school sweetheart" is a mid-century compound)
- [ ] **Epilogue · Hollis · anachronism · L** — "Your kids are of child rearing age" → **"Your children are of child-rearing age, does that make you a grandfather now?"** ("kids" jars against his "final disposition of assets" formality)
- [ ] **Epilogue · Hollis · anachronism · L** — "This is the best part of this process." → **"This is the best part of the business. The will is just about complete."**

**Tuning forks (keep verbatim):**
- The bench confession: *"I fell off a ladder. Four years ago. My hip… My hip is finished. I can't climb, I shouldn't be workin' above me head."* — the private slip done exactly right
- The deepest slip at the deepest moment: *"If ye knew what I carry, Lottie. If ye knew the rooms I go to when I close me eyes."* — the tuning fork for "one deeper slip, deliberate and powerful"
- *"Sure, I know," William said.* — the part's only "sure," in true function
- The Famine-triggered public eruption (keep — the text marks his own surprise): *"You don't say that, young fella! … Be grateful ye have a mother who takes care of ye!"*
- The closing grace notes: *"Grand," he says, soft, almost to himself.* / *"God bless ye, Mr. Hollis."* / *"Found ya."* — the American vowel on his last word is the thesis of the arc
- Lottie Kansas-plain: *"When his work is finished, sweetheart. He has business to tend to."* / *"I know I'm right."* / *"I know that too."*

---

## ACCEPTANCE CHECKLIST — how you'll know it's at 100

Run down this list when the boxes above are done:

1. **Dublin (P1):** zero modern Americanisms in any mouth; zero banned-lexicon items (or you've consciously unbanned them); every Dublin character carries at least cadence; "Sure" ≤ 1/page, true functions only; no line stacks 3+ tells.
2. **Boston (P2):** the me/my drift visible and patterned (my = aspiration/business, me = heart); every peak-grief line carries at least one tell; immigrant-among-immigrant scenes (pub) at full Dublin density.
3. **Minnesota (P3–P4):** business/public William ≈ clean American + trace; every *private family emotional peak* (deathbed, vows protest, courtship declaration) carries exactly one tell; no Irish in American-born mouths unframed.
4. **Oregon (P5 + frame):** William = grace notes only ("aye," "grand," "ye," true "sure"), one sanctioned deeper slip per part max at peak emotion; everything else period-American.
5. **Lottie:** zero Irish tells anywhere (or the one echo deliberately framed); a light, consistent Kansas seasoning (reckon / plain / a good mile / come on home / you'd best) — never more than one per line.
6. **William's "Prime.":** exists — exactly 3 instances (establishing beat, the Ch 7 "Let them come" moment, one quiet final callback), never within sight of death/violence, absent from the Oregon frame so its absence there *means* something. **"Deadly" appears nowhere, ever** (1900s slang — anachronistic for William).
7. **Callbacks intact:** the "never wrong" pair (Ch 31 ↔ Epilogue) matched; "Ye'd better." resolved one way or the other; Ch 35 memory voices sound like Part One.
8. **Family idiom consistent:** Pa/Ma everywhere; "Aye" never doubled with "yes."
9. **No anachronisms:** nothing post-1925 in any mouth (sweep done: hun, okay?, doable, dead-man-walkin', business-wise, 100%, trajectory, signing up for, best version of me, high school sweetheart, this process, fake perfection, held hostage, close contact, didn't make it, the presentation, cut a deal, foot traffic, corner unit, jobsite, gimp, right?-tag).
10. **The narrator stays modern** — no dialect spelling outside quotes (verified clean: zero narrator-bleed found).

### Housekeeping
- After applying fixes to Drive: `node scripts/build-epub-from-drive.mjs --promote` then `node scripts/extract-epub-images.mjs`.
- The `.deai/manuscript.txt` cache predates your June Drive edits — run `.claude/skills/deai/sync.sh` before any new /deai or /brogue page work.
