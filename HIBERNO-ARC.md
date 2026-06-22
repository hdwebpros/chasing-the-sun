# HIBERNO-ARC — the Americanization-gradient instrument

*A measurement pass for the Chasing the Sun manuscript. Sibling to `brogue`/`deai`.
Methodology lives here; the measured data lives in `HIBERNO-ARC-DATA.md` and
`.deai/hiberno-page-NN.json`. June 2026.*

## The goal (author's brief, restated)

The reader should **feel** William Boog (and the Irish around him) turn American
across the book — not as a switch but as a slope. The dialect doesn't vanish; it
**erodes**, and it **slips back** whenever he's among his own or his guard is down.
This instrument measures whether the manuscript currently traces that slope, and
flags every line that fights it.

> Dublin (Act 1): pure, thick Hiberno, **0% American**.
> Boston (Act 2): starts like Act 1; **after the move and the children's deaths it
>   ramps to ~33% American**.
> Minnesota (Act 3): **~66% American**; Irish slips out with other Irish / when emotional.
> Act 4: **~80% American**; same slips.
> Oregon (Act 5) + the 1925 Hollis frame: **only the tics and catchphrases remain**
>   (a stray *grand*, *ye*, his *Prime.*), plus the same emotional / with-Irish slips.

## The unit of measure: the dialogue line

We score **only quoted dialogue spoken by an Irish-born immigrant**. Narration is
off-limits (it is intentionally modern American — same rule as `brogue`). Lottie
(Kansas), the American-born children, and any non-Irish speaker are **never scored**
— they are *context* (see Slip Rule). Speaker attribution is the LLM detect pass's
job; the deterministic scanner is a marker-density proxy (it cannot attribute, so it
reports density over all dialogue and the LLM pass narrows to Irish speakers).

### Register — the primary classification (Irish / Neutral / American)

**"No Irish marker" does NOT mean "American."** Most short lines are register-neutral —
they would be said identically in Dublin or Boston. So classify every utterance by
**register** first:

- **`irish`** — carries at least one Hiberno tell or idiom, lexical OR syntactic
  (`meself`, `ye`, `at all`, `lungs on him`, habitual `do be`). It is already doing its
  job. **Never a miss**, even if it holds only one tell.
- **`neutral`** — no dialect signal either direction; identical in any dialect
  ("A boy," "Ma, what is she doing?", "I have to go"). The majority of short/functional
  lines. **Excluded from every average; never a miss** (`scoreable: false`).
- **`american`** — EITHER distinctly American idiom/vocab/anachronism, OR a line
  long/expressive enough that it plainly **forfeits a natural Irish opportunity** a
  Dublin speaker would have taken (a flat origin-memory monologue, a heartfelt plea in
  textbook English).

Also `scoreable: false` for bare names ("William"), one/two-word functional replies,
numbers, dates, quoted documents, and non-lexical cries ("Hrmm," "Ah!").

### A line is a MISS only on a genuine forfeited opportunity

A deviation (`UNDER-IRISH` in an early act, `MISSED-SLIP` in a late-act slip context)
requires BOTH: register `american` AND a real, natural way a Dublin speaker would have
inflected it. A marker-less line with no natural opportunity is `neutral`, not a miss.
**Never flag an `irish` line** — "no place at all," "strong lungs on him" are already
there. This is the rule that kills the false positives.

### Americanization intensity — `Am` (0–100), for the curve only

`Am` is a secondary number used only for the gradient curve, derived from register:

- `irish` → **0–25** (ceiling rule: a line at its natural Dublin max scores low even
  with one tell; "I did this meself." ≈ 10; strong tell caps at 25, two+ at 15).
- `american` as a *forfeited opportunity* → **55–80**.
- `american` as *distinctly American idiom/anachronism* (correct, intended in late
  acts) → **85–100**.
- `neutral` → no `Am`, excluded from the curve.

The marker taxonomy below is the evidence the LLM cites for register; it does not
mechanically set the score. Syntax/idiom markers carry more weight than a
lone spelling tell, because word-order is the last thing to erode and the hardest to
fake (per `brogue/rules.md`: "phonetic + idiom + word-order were ~80% of accepts").

| Marker kind | weight | examples (closed lexicon — see `brogue/lexicon.txt`) |
|---|---|---|
| **syntax / idiom** | 3 | habitual *do be*; *after*-perfect (*only after seein'*); fronting (*destroyed I am*); *and him + -ing*; *would ye ever*; *I seen / I done*; *so it is* tag; *c'mere to me*; *God rest him* |
| **vocab** | 2 | grand, eejit, knackered, banjaxed, givin' out, gas, sound, fierce [X], whisht, the craic, fair play, gombeen, colleen, spuds, manky, feck, scarlet, savage, **Prime.** (signature) |
| **phonetic / pronoun** | 1 | ye, yer, yez, youse, *-in'* (dropped g), *me* for *my*, 'tis, aul', wee, c'mere, divil, nuttin' |
| **filler / oath / greeting** | 1 | sure [opener, used right], sentence-final *like* / *at all at all*, Holy God, Mother of God, what's the craic, how's she cuttin', mind yourself |

(Judge **register** first using the markers above, then place `Am` within that
register's band. Neutral lines get no `Am` and drop out — that is the whole point.)

### Act-level Americanization

`Act Am = the OVERALL median Am of that act's Irish-immigrant lines` — the true
central tendency, the honest answer to "how American does this act read?" The
emotional (`E`) dips are also reported as a separate downward series so the staircase
(baseline register) and the slip dips are both visible. (An earlier draft excluded
"slips" from the baseline; that collapsed early acts to a 3-line sample because in
Dublin *everyone* is Irish — see the corrected Slip Rule below.)

## Target bands

| Act | setting | target `Am` (baseline) | tolerance | notes |
|---|---|---|---|---|
| **1** | Dublin | **0** | 0–12 | thick. Any baseline line ≥ 25 is a deviation. |
| **2a** | Boston, pre-deaths (≈ to Joseph, ~line 824) | **5** | 0–18 | still Dublin-thick; fresh off the boat. |
| **2b** | Boston, post-deaths (~824 →) | **ramps 15 → 33** | up to 40 | grief + the will to assimilate begin the erosion. |
| **3** | Minnesota | **66** | 55–75 | dialect now situational, not default. |
| **4** | (Act 4) | **80** | 70–88 | mostly American; heavy idiom only at home/off-guard. |
| **5** | Oregon + 1925 Hollis frame | **~92** | 85–100 | only tics/catchphrases survive; *Prime.* + a stray *grand*/*ye*. |

The curve should read as a **staircase that rises**, with **downward spikes** at every
slip. A monotonic flat line (no slips) fails the brief as badly as a curve that never
climbs.

## The Slip Rule (the soul of the pass)

Regardless of an act's baseline, a line earns a **license to dip** (a lower `Am` is
*on-target*, not a deviation) when its context is either:

- **(W) With his own** — addressed to / spoken among other Irish-born characters
  (a countryman, an old friend, family who still carry it), **or**
- **(E) Emotional / off-guard** — grief, rage, love, prayer, drink, or memory of
  Ireland; the guard drops and Dublin comes back up.

In a slip context the dialect *should* surge toward Irish; a **flat American line in a
slip context is itself a flag** (`MISSED-SLIP`). The 1925 Hollis frame is the proving
ground: baseline near-American, but the deepest, oldest memories should still slip.

## Deviation verdicts (what the pass flags)

| verdict | meaning | fix direction |
|---|---|---|
| `OVER-IRISH` | baseline line more Hiberno than the act allows, **no** slip license | Americanize — thin to the act's surviving tells |
| `UNDER-IRISH` | Act 1 / 2a baseline line too flat for thick-Dublin | re-Irish — add a tell or Hiberno turn |
| `MISSED-SLIP` | slip-context (W/E) line left flat American | re-Irish — let it slip, this beat earns it |
| `OVER-SLIP` | a slip dips far below what even emotion warrants for this late act (reads as a relapse to Act-1 thickness) | trim the slip to one or two old tells |
| `ON-TARGET` | within band, or a correctly-pitched slip | none |
| `CATCHPHRASE` | a surviving signature tic (*Prime.*, *grand*, *ye*) | tracked; almost always keep |

`Prime.` is governed by its own hard rule — max three in the book, never near
violence/death, absent from the Oregon frame. See
`brogue/rules.md` and `[[feedback_brogue_deadly_conflation]]`.

## Output / UX

- **Data:** `.deai/hiberno-page-NN.json` per page (line records + verdicts), plus a
  rolled `.deai/hiberno-scan.json` (deterministic first cut). Same accept/reject/edit
  decision shape as `deai`/`brogue`, so accepted fixes flow through `apply-fixes.mjs`
  to Drive. Re-scans go through `hiberno-rescan-NN.json` + `merge-rescan.mjs`, never a
  direct overwrite (same hard rule — `[[feedback_deai_rescan_never_overwrite_decided_page]]`).
- **UI:** a dedicated `/arc` view. Headline is the **gradient chart** — measured
  baseline staircase + slip dips vs the target band — so the transition is *seen*.
  Below it, the deviation table (filter by act / verdict / speaker) with inline
  accept/reject/edit. The point of the chart is to make the *feel* legible at a glance.

## House rules (carried over)

Flag and suggest — **never** write to Drive without an explicit command
(`[[feedback_book_edits_require_explicit_command]]`). No em dashes in fixes; no new
triads; subtraction-first; Chicago curly quotes always
(`[[feedback_fix_suggestion_house_rules]]`, `[[reference_chicago_curly_standard]]`).
Closed, readable lexicon only — recognizable tier, one tell per line, never
stage-Irish (`[[feedback_brogue_readable_closed_lexicon]]`). Sync Drive before any
scan (`[[feedback_sync_drive_before_any_scan]]`).
