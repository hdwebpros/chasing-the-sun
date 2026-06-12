# rules.md — brogue learned decisions (self-pruning, keep SMALL)

The brogue detect subagent reads this after `detect.md` and `lexicon.txt`. It records
the author's durable corrections so the dialogue pass sharpens page by page. One line
per rule. Merge or delete when a newer decision supersedes an older one. This must
never balloon context.

## READABILITY IS THE CEILING (authentic *but* readable — the real bar)

The pass overshot into stage-Irish-for-scholars (`sorra a bit`, `gossoon`, `forenent`,
`childer`, `a clatter of`, `the divil a bit`, `divil` everywhere). That FAILS. A modern
reader must follow every line on first pass with NO glossary. Authenticity counts only
so long as it stays instantly readable. When torn between flavor and clarity, pick clarity.

- **CLOSED LEXICON — recognizable tier only.** Distinctive vocabulary/idiom may come
  ONLY from `lexicon.txt`, and ONLY from its everyday tiers (the sections ABOVE the line
  "others to use either sparingly or not at all", i.e. roughly items 1–100). Do NOT
  invent Hiberno from your own knowledge, and do NOT mine the 101–200 "sparingly or not
  at all" block — that block is where the obscure words came from. If a term isn't in the
  recognizable tier of the list, don't use it.

- **BANNED (a reader can't parse these):** gossoon, sorra a bit, fornent/forenent,
  childer, a clatter of, a power of, asthore, wirra, gra, disremember, shebeen, poteen,
  bowsey, sleveen, "the divil a bit", "the divil the thing". Plus anything else that
  would make a typical modern reader pause or look it up. Use the plain word instead.

- **`divil`: rare.** It was massively overused. At most once in a long stretch, and only
  where it's obviously readable ("the divil's own job"). Default to plain phrasing.

- **LIGHT TOUCH — one tell per line, not every clause.** Re-voice with ONE (occasionally
  two) recognizable dialect tells per line; NEVER stack three. Do NOT fragment a turn
  into many flags or re-voice every clause — pick the few lines that most carry the
  voice and leave the rest plain. A dialogue-dense page should get a HANDFUL of flags,
  not fifteen-plus. Over-fragmentation was the page-12 failure.

- **The safest tells need no exotic words** — lean on these, they read instantly:
  light word-order (would ye, c'mere to me, "only after" sparingly), `ye/yer`, dropped-g
  (`-in'`), `me` for `my`, and recognizable vocab only (grand, eejit,
  sure [sanctioned], aul', wee, fierce [X], givin' out, knackered, sound, whisht).

- **Still don't leave the obvious flat line bare** — but fix it READABLY: a flat
  "Thank you" → "God bless ye" / "Ye're very good"; "okay" → "grand" / "right so";
  "come here" → "c'mere to me"; "goodbye" → "mind yourself". One clean readable swap,
  not a pile-up.

- **Period guard:** 1840s–1900s Dublin. Avoid modern slang (thanks a million, muppet);
  prefer timeless readable items (God bless ye, grand, eejit, mind yourself).

## Character voice (speaker-specific)

- **William Boog — signature approval word is "Prime.", NEVER "Deadly" (FINAL, 2026-06-12).**
  The author researched "deadly" (= excellent): the slang sense isn't attested until the
  1900s — anachronistic for a man formed in 1840s–70s Dublin. The earlier rule sanctioning
  it as his catchphrase is REVOKED; never suggest "deadly" in this sense for any character
  (the `lexicon.txt` "Deadly." entry is void). His standalone approval beat is **"Prime."**
  — the spoken twin of his "Hrmm" grunt.
  - SPEC: at most THREE instances in the entire book (an establishing use, the defiant
    "Grand. Let them come." moment in Ch 7, and one quiet final callback). It is NOT a
    per-page move — a detect subagent should essentially never insert it; a forced one is
    worse than none.
  - GUARD (carried over): never place it near killing, violence, a wound, a death, a
    fight, an injury — and keep it out of the Oregon/1925 frame, where its absence is
    the point.

- **William's AMERICANIZATION (later chapters, ~p120 onward) — CODE-SWITCHING.** By the
  back third William has lived in America for decades and has largely Americanized. His
  Hiberno is now SITUATIONAL — judge each scene by who he's with and where:
  - **In public / with Lottie / business or formal settings:** he speaks mostly STANDARD
    AMERICAN. Only the most common, instantly-readable tells slip through, and rarely —
    an occasional "grand" and a stray "ye". Keep flags here SPARSE and
    very light; heavily broguing him in these scenes CONTRADICTS the arc. Often the right
    answer is 0–1 flags.
  - **At home / relaxed / with family or old Irish friends / when emotional or off-guard:**
    more Hiberno slips back out — still recognizable tier, still readable, light touch, but
    a bit more of it is natural here.
  - The common readable phrases (grand, sure[sanctioned], aul', wee, ye/yer,
    dropped-g) persist across BOTH registers as what survives his Americanization; the
    heavier word-order/idiom should mostly appear only in the relaxed/home register.
  - This applies to WILLIAM specifically. **Lottie is from KANSAS — American, NOT Irish.
    NEVER tweak her dialogue, ever.** His American-born children/grandchildren are also
    out of scope. William is usually the only Irish voice left in the back third.

## Word-by-word discipline (overuse guards)

- **"Sure" — STOP over-injecting it.** It is authentic Hiberno-English, but the
  detector was reaching for it as a generic line-opener roughly every fourth sentence.
  That is far too often and reads as a tic. Use it SPARINGLY — at most occasionally
  across a whole scene, rarely more than once on a page — and ONLY in one of its three
  genuine functions:
  1. **State the obvious / draw the listener into a shared truth** (≈ "well/but"):
     "Sure, we all knew he was going to America anyway."
  2. **Soften an argument or give comfort** (a verbal cushion), often "Ah sure, look…":
     "Ah sure, look, it might be for the best."
  3. **Emphasize indignation or contrast**, placed at the END of the sentence:
     "I only gave you the money yesterday, sure!"
  If a candidate "sure" isn't doing one of those three jobs, DON'T add it — reach for a
  different tell (word-order, vocab, a dropped g) or leave the line plain. Never stack
  "sure" on more than one line in the same exchange.
  - REFINED by p1–40 decisions: the author KEEPS "sure" in a rhetorical question
    ("Sure, didn't ye marry me anyway?") and in a genuine flowing cushion ("Sure there's
    tons of men named O'Malley"). He REJECTS "sure" bolted onto the front of a flat
    declarative or a maxim — rejected: "Sure, I don't know why she picked William.",
    "Sure a man can do whatever he sets his mind upon.", "and sure he was destined to it",
    "Sure it's to learn I want." RULE: only prepend "Sure" when what follows is a question
    or genuinely needs softening AND reads naturally; never as decoration on a plain
    statement of fact.

## Learned from the author's p1–40 decisions (94 accept / 9 reject / 9 edit)

- **What LANDS — lean on these (the bulk of accepts):** `ye`/`yer`, dropped-g (`-in'`),
  `me` for `my`, light natural-order tweaks, habitual "do be" ("they do be changin'"),
  `wee`, `aul'`, `so?` as a tag, "God rest him". Phonetic + idiom + word-order were ~80%
  of accepts. These readable tells are the spine of the voice — prefer them.
- **SUPPRESS "yer man" / "yer one" / "yer men"** — rejected twice ("Yer man's out of
  town", "tons of yer men named O'Malley" → he cut "yer"). Don't use it; say the plain noun.
- **AVOID cleft / heavy fronting inversions.** Rejected/edited away: "it's to learn I
  want", "Is it here our first place together is?" (→ he reverted to "Our first place
  together is here?"). Keep NATURAL word order and carry the voice with a light tell, not
  a syntactic somersault.
- **Never swap a meaning-bearing word.** He reverted "You're impossible." → my "Ye're a
  fierce man" back to "Ye're impossible." Keep the author's actual word; add flavour
  AROUND it (here just "Ye're"), don't trade the meaning for a dialect noun.
- **Keep fixes TIGHT.** He trims padding I add ("…the whole time" cut; "a power of
  relations" → "a lot of family"). Shortest change that carries the voice.
- (These reconfirm the BANNED list — his edits personally struck `gossoon`→"lad",
  `the divil a bit`→"not sure", `a power of`→"a lot of".)

## Wit & humour (use the lexicon's clever side — author-requested)

Irish speech, ESPECIALLY in the pub / banter / teasing, carried wit and clever turns
that still read well today. Where the scene is light or sparring (NOT grief, death,
tension — match the mood), reach past the plain tells into the recognizable WITTY lexicon
and let a line be funny: `gas` (funny), `savage` (excellent), `eejit`, `acting
the maggot` (messing about), `away with the fairies` (daydreaming), `not the full
shilling` (foolish), `God love ye` (affectionate/sarcastic), `fair play to ye`, `the
craic`, `chancin' me arm` (taking a risk), `givin' out` (scolding), `cute hoor` (sly
one — sparingly). A clever readable simile in the author's own spirit ("like a man
lookin' for his hat") is gold — keep/echo those. STILL readable, STILL light touch:
wit comes from the apt word or image, not from piling on dialect. Don't force a joke
where the scene is solemn.
