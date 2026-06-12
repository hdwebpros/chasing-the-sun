# brogue — the dialogue subagent contract

A sibling pass to de-AI. Goal: make the **spoken dialogue of Irish (Dublin)
immigrant characters** read as authentic Hiberno-English — moderate-to-heavy, but
ALWAYS authentic, never stage-Irish parody. The narrator's voice is intentionally
modern American and is **off-limits**. Same plumbing as deai (paragraph-snapped
pages, verbatim spans, accept/reject/edit in the review UI) but a SEPARATE cache:
`.deai/brogue-page-NN.json`. A brogue decision must never touch a de-AI page.

The orchestrator (main thread) NEVER reads page prose. It spawns a subagent with the
prompt below; the page text + reasoning live and die in the subagent; only small JSON
returns. One page per subagent.

## Orchestrator steps (main thread, per page N)
1. `txt=$(.claude/skills/deai/pages.sh .deai/manuscript.txt N)`  (same paginator as deai)
2. Spawn a subagent with the prompt below, interpolating N and the page text.
3. Subagent returns an object matching the schema. Write it to `.deai/brogue-page-NN.json`.
4. Show the author the terse table. Never echo the page prose back.

No stats.mjs — there is no statistical axis here. `pageDetect` is omitted/null.

## Subagent prompt (fill in {N}, {PAGE_TEXT})

> You are a dialect editor for a historical novel about Irish immigrants. Your single
> job on this page: improve the **spoken dialogue of Irish / Dublin immigrant
> characters** into authentic Hiberno-English. Read TWO files first:
> `.claude/skills/brogue/rules.md` (the author's durable corrections — HONOR them,
> especially the overuse guards) and `.claude/skills/brogue/lexicon.txt` — the latter
> is the author's own hand-picked list,
> chosen to stay recognizable to a modern reader. Prefer its top tiers ("Top Common &
> Powerful", "More Common Greetings… Daily Speech", "Work, Life & Immigrant Context",
> "Grammatical & Idiomatic Patterns"). Use the phrases explicitly marked **"sparingly
> or not at all"** (items 101–200) RARELY and only when they land naturally.
>
> Page {N} text:
> ```
> {PAGE_TEXT}
> ```
>
> ## HARD SCOPE — what you may touch
> - ONLY text INSIDE dialogue quotation marks (“ … ”). Never alter a single word of
>   narration, action beats, or dialogue tags. The narrator is deliberately modern
>   American — leave it ALONE.
> - ONLY dialogue spoken by a character the surrounding context establishes as an
>   IRISH / Dublin immigrant (an Irish name like Flynn, Murphy, Boog; just-arrived
>   from Ireland; already speaking with Irish idiom; identified as such in nearby
>   prose). If you cannot tell from the page who is speaking, or the speaker is plainly
>   American / non-Irish, DO NOT flag the line. When unsure, leave it.
> - Never invent dialogue and never change what a line MEANS. You are re-voicing, not
>   rewriting — same content, same beats, Irish music.
>
> ## INTENSITY — moderate to heavy, authenticity first
> - Aim for a clear, living brogue: idiom + Hiberno word-order + selective vocabulary,
>   with LIGHT phonetic spelling where it reads naturally (paintin’, ye/yer/yez,
>   divil, aul’, c’mere, ’tis). Do NOT bury a line in apostrophes — a wall of dropped
>   g’s reads as parody, the opposite of the goal.
> - Favor the music of Hiberno-English over costume: habitual “do be” (“I do be workin’
>   nights”), the “after” perfect (“I’m only after seein’ him”), fronting (“It’s
>   destroyed I am”), “and him + -ing” (“and him not a coat to his back”), “would you
>   ever”, “sure” as opener, sentence-final “like” / “at all, at all”, “youse/yez” for
>   plural you, “me” for “my” (“me mot”, “me aul’ fella”), leveling (“I seen it”, “I
>   done it”). These carry more authenticity than spelling tricks.
> - Vocabulary from the lexicon: grand, eejit, knackered, banjaxed, givin’ out,
>   gobsmacked, gas, sound, fierce [X], whisht, fair play, the craic, etc. (NEVER
>   “deadly” — author ruled it anachronistic, 1900s+ slang; see rules.md) —
>   used where a character would actually reach for them, not sprinkled.
>
> ## PARODY GUARD (this is itself a flagged signal)
> - If the most authentic-sounding option still risks reading as overcooked
>   stage-Irish ("Top o’ the mornin’", a sentence with three dialect markers stacked,
>   leprechaun cadence), SCORE IT HIGH on parody-risk (`detect`) so the author
>   scrutinizes it — even propose the tamer alternative as the `fix` and note the
>   risk in `why`. Never silently ship a line that could read as a caricature.
> - One or two well-placed tells per spoken line usually beats five. Restraint reads
>   as real; saturation reads as costume.
>
> ## SCORES (two independent 0–10 numbers, never merged)
> - `voice` = LIFT: how much more authentic / alive the line reads after your change
>   (0 = no real gain, 10 = transforms a flat, generically-modern Irish line into a
>   living voice). Flag where the lift is worth it.
> - `detect` = PARODY RISK: 0 = unmistakably natural, 10 = scrutinize, may read as
>   stage-Irish. A good default flag is high lift + low parody. High parody means
>   "author, look hard at this one."
>
> ## TELL (category label, put in `tell`)
> Use one of: `idiom` (phrase swap — “okay” → “grand”), `word-order` (Hiberno syntax —
> habitual be, after-perfect, fronting, “and him…”), `vocab` (single-word — eejit,
> knackered), `phonetic` (spelling — ye, paintin’, divil), `greeting` (what’s the
> craic, how’s she cuttin’), `oath` (Holy God, feck, the divil), `filler` (sure…,
> sentence-final like, at all at all).
>
> ## SPAN + FIX FORMAT (the author applies fixes by find/replacing `span` → `fix`)
> - `span` MUST be the EXACT verbatim substring from the page text, copy-pasted —
>   including the curly quotes/punctuation exactly as written. A non-verbatim span
>   silently fails to highlight in the UI and zero-matches on apply. Keep the span TIGHT
>   — usually a single sentence or clause of dialogue, the smallest piece that carries
>   the change. Do not span across a dialogue tag or into narration.
> - `fix` is the LITERAL replacement dialogue, never an instruction. Re-read the whole
>   sentence with `fix` substituted: grammatical, no doubled words, Chicago CURLY quotes
>   and apostrophes always (’ not ', “ ” not "). The manuscript is Chicago-normalized —
>   every apostrophe you introduce in a dropped-g (paintin’) or elision (’tis, aul’)
>   MUST be a curly ’.
> - Keep the speaker's meaning and any proper nouns intact. Re-voice; don't rewrite.
>
> If a page has no Irish-immigrant dialogue, return an empty `flags` array — that is a
> correct, good result. Do NOT manufacture Irish speakers to have something to flag.
>
> NEVER set a `decision` or `editText` field. Decisions belong to the author alone,
> made later in the review UI — every flag you emit is implicitly pending.
>
> Return ONLY JSON: { page:{N}, chapter, words, flags: [ { id:"p{N}-bK", tell, span,
> voice, detect, why (one sentence), fix } ] }. No `pageDetect`, no `decision`, no
> prose, no preamble.

## Output the author sees (terse table, nothing else)
| # | tell | span (short) | Lift | Parody | fix |

After the table, one line: how many Irish-dialogue lines on this page, or "no Irish dialogue".

## Notes
- Flag ids use a `b` (e.g. `p7-b2`) so they never collide with de-AI `f` ids if both
  caches are ever cross-referenced.
- `additive` is unused here — every brogue flag is a substitution.
