# PLOT-SPINE-PLAN — Injecting the Ledger/Curse/Name Spine

*July 2026. Handoff plan for a fresh agent. Synthesized from two blind clarity tests (a cumulative waterfall read and five independent per-act Fable subagents) measured against the author's intended pitch. The agent executing this plan proposes; the author decides; the only Drive writer is book-edit's `edit-doc.mjs`, run on explicit approval.*

---

## The intended spine (ground truth — do not reinterpret)

The author's original pitch:

> In the grip of the Irish famine, a bastard son with a rare surname begins a ledger; every child born, he writes their name, every child lost he makes an X. What starts as a simple record becomes a lifelong war against fate itself. As death keeps striking, William Boog becomes convinced that he carries a curse that will erase his bloodline forever. Obsessed with making his unique name mean something, he will cross an ocean and continents, reinvent himself again and again, and risk everything to ensure that his name does not die with him.

The sharpened working pitch (July 2026) — this is the version the pass aims at:

> In Ireland, a surname is a lineage. William Boog's is a dead end. Born a bastard in Dublin in 1841 and handed off by the parents who made him, he carries a name so rare he is the only Boog in the country, and the verdict comes early, from the priests, from the schoolyard, from the parents who would not keep him: the name is worthless. Cursed. It will die with him, and no one will notice.
>
> William declares war on that verdict.
>
> He starts a ledger. Every child born to him, he writes the name in full. Every child death takes back, he marks with an X. Then he goes to work on fate itself: out of the tenements, across the Atlantic, chasing the setting sun into the young cities of America, reinventing himself as bootmaker, painter, businessman, landowner, hanging BOOG in paint over storefronts and writing it onto deeds. If the world decides what a name is worth, he will out-build the world.
>
> But the X's gain on the names. And William, who has beaten poverty and every prediction ever made about him, meets the one enemy he cannot out-work, and arrives at a conclusion more terrible than the schoolyard's: the curse was never the name. It's him.
>
> So he makes the war's final move. To save the name's last chance, he must do the one thing he swore he never would: walk away from his young son and the family he spent his life building.

The same, compressed to a logline:

> A Dublin bastard, told his one-of-a-kind name is cursed, wages a lifetime war against fate to make it mean something; when the deaths mount anyway, he becomes convinced *he* is the curse, and makes the war's final move: to save the name, he walks away from the young son who is its one chance to outlive him.

**The framing that must never be lost:** without the war, the book reads as "a ton of grief and he couldn't handle it and left" — the author has named that reading as the failure mode. The exile is not collapse or flight; it is the coldest move in a lifelong campaign, the ledger's own logic executed. (Never quantify the war's length in pitch material — the author has vetoed "fifty-year" as making the book seem long.) Every beat in this plan serves that reading.

**Five** load-bearing elements, in causal order:

1. **The verdict** — the world (parents who gave him away, schoolyard, church) sentences the name to worthlessness and curse. This is the inciting wound; without it there is no war, just weather. Act 1 already carries this material; the pass makes it read as a *declaration of war*, not backstory.
2. **The ledger** (physical object, names written in full vs. fate's X's) — not a record of grief but a scorecard he chooses to keep; the war made visible.
3. **The name** — so rare he is the only Boog in Ireland (and in America). If his line dies the name doesn't fade, it goes *extinct*. The stake-raiser. And the name travels patrilineally: daughters carry his blood but marry out of the surname, so the ledger arithmetic that decides the war is the *sons*. An X beside a son is a different kind of wound, and the pass should let that asymmetry show (without ever diminishing the daughters on the page).
4. **The curse conviction** — *earned causally*, not asserted. The reader should be able to feel the arithmetic (the X's gaining on the names) before William names the conclusion. He never concedes the war; he re-identifies the enemy as himself.
5. **The exile gambit** — the war's final move: to keep the name alive, the man must leave it. The epilogue's "Did your gamble on the curse pay off?" is the question the whole book sets up.

The plot goal in every act is one war fought in a different theater, and the war's last move is the exile.

## The diagnosis (what both tests independently found)

Scores: Act 1: 7–8 · Act 2: 6–7 · Act 3: 8 · Act 4: 6–8 (6 from the independent read — weakest) · Act 5: 7.

Every act lost points for the **same structural reason**: the goal is always stated explicitly *somewhere*, but each act either **opens on a different apparent want** or **lets the goal dissolve mid-act**:

- **Act 1**: two braided threads (name-hunger vs. westward escape) never fuse into one stated ambition until Ch 7–8.
- **Act 2**: the goal's object keeps migrating (bootmaker → docks → painting → Minnesota land); in Ch 13–15 grief displaces pursuit — the drive goes silent exactly when the pitch says the war should intensify.
- **Act 3**: goal achieved by midpoint, then the act pivots to Mary's illness and the through-line dissolves; "I am the curse" is only named in the 1925 interlude — retrofitted, not felt during the ascent.
- **Act 4**: first half (Ch 24–26) reads as *Lottie's* goal, not William's; his protect-the-living drive only consolidates in Ch 28–31.
- **Act 5**: first two chapters never say why he left his family; the goal is passive (achieved by *not* going home) until Lottie forces it into the open.

The spine assets already exist on the page — the paper with his children's names (Act 1), the folded-paper ledger keeping stakes visible (Act 4), the curse confession (Act 3 interlude, Act 5 porch), "Did your gamble on the curse pay off?" (epilogue). The problem is **rhythm, not absence**: the ledger surfaces sporadically, and the curse logic arrives after the behavior it explains.

## The prescription (one sentence)

Give each act ONE early goal-beat restating the current form of the war, and make the ledger the visible metronome of that war — opened at each act's start, written in at each birth, X'd at each death — so grief chapters read as *battles lost* rather than *goal suspended*, and the final exile reads as the war's last move.

Two clarity requirements the sharpened pitch adds:

- **The arithmetic must be legible.** By the time William concludes "the curse is me," the reader should already half-believe it because they've watched the X's gain on the names across the ledger beats. Each X beat is a step in that induction, not a standalone grief note.
- **The exile is the destination.** Every ledger and curse beat from Act 2 onward should be placeable on a line that ends at the self-exile. When choosing between two candidate anchors for a beat, prefer the one that better sets up protection-as-abandonment.

This is a **targeted injection pass, not a rewrite**. Scores of 6–8 mean the architecture works. Budget roughly 2–4 beats per act, ~12–18 touches total. Do not flatten the deliberate ambiguity the tests praised (Mary's "I'm not going because ye're chasing the sun" reversal stays untouched — that smokiness is intentional).

---

## Phase 0 — Setup (before proposing anything)

1. Run `sync.sh` first — the `.deai/manuscript.txt` cache goes stale and gives wrong line numbers.
2. **Inventory the existing spine assets.** Grep the manuscript for every occurrence of: the ledger / the folded paper / the list of names / an X or cross beside a name / "curse" / the name-meaning-something motif ("Boog" + mean/nothing/something). Build a per-chapter map of where the spine already surfaces.
3. **Reconcile the ledger's continuity** before adding anything: is the Act 1 "paper with his children's names" the same physical object as the Act 4 "folded-paper ledger"? Where does it physically begin, travel, live? If the pitch's famine-era origin isn't on the page, flag that as a candidate beat (see Act 1) — do not silently invent a second paper.

## Phase 1 — Per-act injection map

For each spot: quote the verbatim anchor line from the current Drive text, propose the beat as **final text plus a one-line why** (fix-first, terse — no suggestion essays). The beats below are *targets*, not drafted prose; the agent drafts in-voice at the anchor.

### Act 1 (Ch 1–8) — fuse the two threads early
- **Beat 1a — the verdict, then the declaration.** The bastard-with-a-worthless-name material already dominates Ch 1–3; sharpen one moment where the world's verdict (cursed, will amount to nothing, dies with him) lands as a *sentence passed on him*, and one moment where William's response reads as a declaration of war rather than generic ambition. These may already exist — placement and pointing, not invention. One approved area of real freedom: the dialogue with his adopted father in these chapters can be *enhanced*, not just pointed — the author has flagged that exchange as open ground for carrying part of the verdict, or William's answer to it.
- **Beat 1d — the vow (new, from the pitch's final line).** The pitch now ends on "the one thing he swore he never would," so the vow must exist on the page: an early moment where the handed-off boy swears he will never do to a child of his own what was done to him. This is the abandonment mirror — the exile in Act 4–5 is that vow knowingly broken, which is what makes it cost. The adopted-father dialogue (Beat 1a) is a natural home for it. Plant once, plainly, in his concrete register; do not have the later exile scenes reference it aloud — the reader carries the echo.
- **Beat 1b — the ledger's origin scene.** Somewhere early, put the paper's beginning on the page as a physical act: William writes a name (or is handed the record of his own bastard birth) and understands what a written name is worth. The ledger must read as a scorecard he chooses to keep, not a mourning habit he falls into.
- **Beat 1c — fuse name and sun.** One line near the "I'm goin' to follow that some day" emblem that welds the westward want to the name-want, so the reader carries ONE ambition instead of two braided ones. The sun is where the name goes to live. *(Author status: curious, not sold — draft one candidate at the anchor and present it before treating this beat as approved.)*
- **Do not touch** Mary's reversal or the pub six-to-seven-pounds-a-head scene — both tests scored those as the act's strongest goal machinery.

### Act 2 (Ch 9–17) — the migrating trades become reinvention; grief becomes the war
- **Beat 2a — act-opening goal beat.** First chapter of the act: a short beat (one line or a few — the author has approved more room here) making the American plan explicitly about the name surviving, not just providing ("plant the name" energy, drafted in his plain concrete register).
- **Beat 2b — reframe each trade pivot** (bootmaker → docks → painting → the Minnesota land plan; note he never buys land in Boston — the land is the westward move, not a Boston purchase) with one clause apiece tying the reinvention to the same war, so the object migrates but the goal visibly doesn't. This is the pitch's "reinvent himself again and again" made legible.
- **Beat 2c — the X's in Ch 13–15, with two deaths compressed.** The deaths are where the drive currently goes silent. Author direction: ease the grief load by reducing two of the Boston boy deaths (John and Joseph) to near-footnotes — a line, an X, the ledger absorbing what the prose no longer dramatizes — so the remaining death(s) carry the scene weight. This compression is also the designated playground for dramatic sentence styles and concepts; the author will supply examples at the flesh-out stage, so propose anchors and compressions first, style experiments second. The arithmetic still starts here: even a footnote death moves the count, and this is where the reader should first sense the X's gaining on the names. This change likely buys the most clarity per word in the whole pass.

### Act 3 (Ch 18–23) — seed the curse before the interlude confirms it
- **Beat 3a — the ascent is son-prep, and he is losing that war.** (Replaces an earlier "he checks the ledger at the peak" idea the author rejected.) Reframe the St. Paul climb as William building the thing a *son* will take over — the name needs an heir and an estate worth inheriting, and the empire is being built for a successor. Add small reminder beats, spaced through the act, that the sons-side arithmetic is failing even as the wealth climbs, so success and losing run inside the same scenes. This keeps the through-line alive past the midpoint where the tests saw it dissolve.
- **Beat 3b — pre-echo the curse logic.** A fragment of the "I am the curse" reasoning surfacing in scene during Mary's illness — private, unstated to others — so the 1925 interlude *confirms* what the reader half-saw instead of introducing it. Ground it in the arithmetic, not in mysticism: William counting, comparing, doing the induction the reader has been doing since Act 2. Do not move or weaken the interlude itself.

### Act 4 (Ch 24–31) — give William a stake in the courtship (weakest act, priority)
- **Beat 4a — the courtship through the ledger lens.** One or two beats in Ch 24–26 where the Lottie merger is legible as *his* goal: new names to write instead of X's, and specifically the chance of a *son* — the last-ditch move in the war, since only a boy carries the name forward. This converts "Lottie's act" into his without changing a single event.
- **Beat 4b — plant the reversal (the pitch's centerpiece).** The protection-as-abandonment turn in Ch 28–31 is the book's most distinctive move and the sharpened pitch's final line ("He leaves them."). Plant its seed one act-quarter earlier — a beat where protecting-by-presence first visibly fails him, so the exile decision reads as the last move in a losing strategy, not a swerve. Candidate seed from the author: William notices that *Letitia left him and survived* — the first data point that distance from William is what saves. Letitia is one of William's daughters, born in Dublin; locate her on the page before drafting. If the observation can sit in scene, it converts the exile from theory into induction. Of everything in this plan, this beat and 2c are the two that most directly convert the manuscript into the book the pitch promises.
- The existing "The deeds were the wall" and folded-ledger material already works — anchor near it, don't duplicate it.

### Act 5 (Ch 32–37 + epilogue) — the reason travels with him
- **Beat 5a — act-opening goal beat.** In the first Oregon chapter, the ledger arrives with him — one physical beat establishing that the leaving *was* the plan, before the reader is told why. Kills the "three candidate goals" problem the blind reader hit.
- **Beat 5b — make staying away visible.** The Act 5 goal is a negative — *don't go home* — and a reader can't watch a man not do something, so the choice needs one physical expression that shows it being re-made and costing him: he keeps the ledger current from Oregon, or writes letters he doesn't send, or turns down a concrete reason to go back. One concrete action, recurring two or three times across the act, is enough. Optional: if Beat 5a plus Device A (below) already make the plan legible, drop this beat.
- The porch confrontation and the epilogue's "Did your gamble on the curse pay off?" already land — earlier chapters should make the reader *ask* that question, not answer it sooner.

## Candidate structural devices (author-proposed — bigger than a beat, decide before drafting Phase 1)

### Device A — the war tally at chapter openings
The author's idea: a simple tally for "the war against fate" shown at the start of chapters. Strongest form: a diegetic ledger excerpt in William's hand — names written in full, an X struck beside the lost — rather than bare numbers; the book's own furniture becomes the ledger, which is exactly what the epilogue's question implies. If adopted:

- Show it **only when the count has changed** since it last appeared (or at act boundaries), so it never goes stale across 37 chapters.
- Place each changed tally **after** the chapter containing the death, never before — the device must never spoil a loss.
- Let the sons' side of the page visibly thin while the daughters remain present (element 3's asymmetry, shown not told).
- Synergy with Beat 2c: a footnote death still lands as a changed tally — the device does the mourning bookkeeping so the prose doesn't have to. If Device A is adopted, 2c's compression gets cheaper and several ledger beats elsewhere may become droppable (per the no-duplication guardrail).

### Device B — Mary Margaret's adoption pact
The author's idea: William tries to convince Mary Margaret to stay single and adopt, passing Boog down; as soon as she agrees, she gets leukemia. This is the strongest single plot addition on the table — it shows William finding a loophole in the war (the name without the blood) and fate closing it, which earns "the curse is me" harder than any interior beat could: the one time someone else agrees to carry the name, she is struck. Before drafting:

1. **Ground truth.** Leukemia is fact, not invention — it is written on Mary Margaret's death certificate. The pact (stay single, adopt, pass Boog down) is the invented element; confirm her dates against the family-tree ground truth so the pact fits the real timeline.
2. **Melodrama guard.** Keep the causality in William's head only — he believes the pact did it; the book stays agnostic. Letting some time pass between agreement and diagnosis preserves the smokiness the tests praised.
3. **The phrase to weave in: "a cancer of the blood."** That is what a doctor of the era would say in scene, and it aims straight at the plot: the whole book asks whether the curse lives in the name or in William's blood, and here a doctor tells him the disease is *in the blood* — the blood she carries because she is his. Use the phrase in scene; the clinical word "leukemia" can live where the paper record does, on the certificate.

## Phase 2 — Delivery format

Present the full set as a triage table: act · anchor (verbatim quote + ch/line) · proposed final text · one-line why · which spine element it serves (ledger / curse / name). The author queues; nothing writes to Drive until the author explicitly commands it, and then only via book-edit's `edit-doc.mjs`, followed by the epub rebuild.

## Guardrails (non-negotiable)

- **Suggest only.** "Approved" in conversation ≠ Drive-write. Explicit command required.
- **House style:** no em dashes in fixes; never introduce a triad; check paragraph rhythm before any fragment; concrete physical detail, not metaphor or poetic simile; cherry-pick the verb or don't propose the line; Chicago curly quotes, no two sentences starting with the same word, vary sentence length and when injecting more than 3 sentences use an opener that is not a subject, use verbs that steal emotion or POV from the scenes around it.
- **Canon stays canon:** the Kennedy docks easter egg (Ch 12), Mary's bell mini-spine, the Boog children dates (the six-vs-seven dead-children count is correct — the 1879 stillborn is buried but never on the paper; note this is itself a ledger fact the pass can use, not fix). Never break established blocking.
- **Period-safe** language only, per the existing arc dialect rubric (LANGUAGE-PASS.md).
- **Don't overcorrect.** The tests praised the deliberate smokiness of William's motives (chasing the sun as a cover for grief). The goal of this pass is that a blind reader can state the act's goal in one sentence by each act's second chapter — not that the book announces its theme.
- If an inventory pass shows a proposed beat already exists on the page, drop the beat — the fix is placement/rhythm, never duplication.
