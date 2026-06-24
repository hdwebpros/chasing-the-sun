---
name: review
description: >
  Run the multi-lens craft review engine over a chapter or page range of the novel.
  Use whenever the user asks to "review" a chapter/passage for craft weaknesses, run
  the lenses, do a craft pass, or find what's weak through the writing-craft KB. Fans
  one scanner subagent per craft lens (craft/<lens>), judged purely against the distilled
  research, and collates findings into a triage table. SCANNING IS DIAGNOSTIC — it never writes
  Drive; the only writer is `apply.mjs --apply`, which places the cards the author QUEUED (honoring
  their notes) and archives the chapter. Do not rewrite anything the author hasn't queued.
---

# review — the craft review engine

The payoff of the `craft/` KB: point the verified brain at the manuscript, one lens at
a time, and surface what's weak — judged by the RESEARCH, not by generic model taste.
This is the read-only diagnostic UPSTREAM of the fix passes. It is to `/arc` what `/arc`
is to a chapter: a findings dashboard you triage.

## Authority order (non-negotiable)
1. The lens file in `craft/<lens>` — the distilled research (Bookfox, Matesic, canon).
   The sole craft authority. Outranks model training.
2. Model training — last, and only to apply the research.
There is NO author "voiceprint" file in the loop (a prior one was retired for canonizing
AI patterns as the author's voice) — the research is the authority, full stop. The veto
is the AUTHOR, applied by hand at triage: scanners flag honestly by the
research, the author keeps or kills. `.deai/RYAN-HOUSE-STYLE.md` still governs fix
*mechanics* (no em dash, never introduce a triad) — that is not a
voiceprint, just house rules for how a fix is written.

## What it is NOT
- Not a rewriter during the scan. Scanning produces findings only; the author triages. Drive
  writes happen exclusively in `apply.mjs --apply`, and only for QUEUED cards.
- Not an auto-applier. Nothing reaches Drive until the author has queued cards and run
  `apply.mjs --apply`; the author's note is the authoritative text for a queued card.
- Not the dialect pass. Dialect/Americanization is `/arc`; it's deliberately excluded
  from `lenses.json` so the two don't duplicate.

## The loop
```
Google Doc ──deai/sync.sh──► .deai/manuscript.txt ──pages.sh──► unit (a chapter ≈ N pages)
                                                                   │
                 craft/<lens> (the only ruler — the research)      │
                                                                   ▼
                         ONE scanner SUBAGENT per lens  (prose dies here; lens-scan.md)
                                                                   │  schema.json
                                                                   ▼
                                            .deai/review/<unit>__<lensId>.json   (one per lens)
                                                                   │  node collate.mjs
                                                                   ▼
                                                        .deai/review.json
                                                                   │
                       author triages each card at /review;
                       queue / dismiss per finding
                       ──► .deai/review-decisions.json
                                                                   │
                    apply.mjs --apply places each QUEUED card on Drive (the author's
                    note overrides the option), verifies, and archives the chapter.
```

## Run a unit
1. **Sync once** (or after Drive edits): `.claude/skills/deai/sync.sh`. `.deai/manuscript.txt`
   goes stale — line numbers drift if you skip this. (Memory: sync before any scan.)
2. **Pick the unit** — a chapter, or a page range. Resolve to pages with
   `.claude/skills/deai/pages.sh .deai/manuscript.txt` (total) and `… N` (page N text).
   Keep units chapter-sized so each scanner reads a coherent scene.
3. **Fan out** — for each lens in `lenses.json` (or a `--lenses a,b,c` subset), spawn a
   scanner subagent using `lens-scan.md`'s prompt. Run them in parallel. Each writes
   `.deai/review/<unit>__<lensId>.json`. Default: all 18 lenses. Line-scope lenses
   (ai-fingerprints, sentence-*, worst-lines, pro-level, spicy) anchor to verbatim spans
   + pages; structural lenses (pacing, tension, character, scene, setting, device,
   resonance, voice) anchor to chapters/scenes.
4. **Collate** — `node .claude/skills/review/collate.mjs`. Merges every per-lens file
   into `.deai/review.json` and prints a severity/route summary.
5. **Review at `/review`** (the surface) — open `http://localhost:3000/review`. It reads
   `.deai/review.json` and shows each line-edit card as a **tracked-changes redline**
   (before→after) and each structural card with its **surrounding manuscript context**
   derived at read time, groups by lens with a **"craft (hide de-AI)"** toggle (so
   elevation leads), and shows the WHY. The author triages each: **queue** (act via its
   route) or **dismiss** (deliberate) → `.deai/review-decisions.json` (overlaid the way
   `/arc` does it). No Drive write here.
   - CLI fallback: `node .claude/skills/review/render.mjs` prints each card as a redline
     (before→after) + the one-line why to the terminal. The full table is ~90KB, so use
     `--out FILE` to write it (a raw terminal dump truncates), `--exclude ai-fingerprints,voice`
     to drop the de-AI lenses, `--lens X` or `--min mid` to narrow.
6. **Apply queued cards to Drive** — `node .claude/skills/review/apply.mjs` (DRY RUN; add
   `--apply` to write). This is the one place the engine writes Drive, and only for cards the
   author **queued**. It resolves each queued card and routes it to the right Drive tool, then
   verifies and **archives**. See "Apply pass" below.

(The `/review` page renders `.deai/review.json` the way `/arc` renders its data — it is the
primary surface; `render.mjs` is the CLI fallback.)

## Apply pass — `apply.mjs` (notes are authoritative; archives after placement)
Scanning is diagnostic; **writing happens only here, gated behind `--apply`, only for queued
cards.** Resolution per queued card, in order:
1. **The author's NOTE wins.** A note that reads `use: …` / `use this: …` is the author's own
   custom replacement text and OVERRIDES the engine's chosen option — apply that text verbatim
   (curlified to the Chicago standard). The note box is where the author writes the real fix.
2. else the **chosen** option (a multi-option card the author picked), 3. else the **sole**
   option's edit (single-option card). `chosen === ""` means a **full-paragraph CUT**.
A `dismiss` card is skipped. A note that is an INSTRUCTION or CONDITIONAL (not a clean `use:`
block — e.g. "do the last suggestion too", "replace X after you confirm…") is **HELD**: printed
for the author and left for hand-application; its unit is NOT archived.

Drive mechanics (why three tools): `replaceAllText` can't match across a paragraph mark and
nests additive edits on a re-run, so apply routes by shape — single-paragraph → `book-edit/bin/
edit-doc.mjs`; multi-paragraph → `book-edit/bin/range-replace.mjs` (flat-text delete+insert,
one batch per pair); full cut → `book-edit/bin/delete-paragraph.mjs` (removes the paragraph mark
too, which a blank-string replace can't). Idempotent: a card whose span is gone OR whose full
replacement is already present is skipped (so additive note-edits never double-apply).

After `--apply` it re-syncs, **verifies every replace landed exactly once** (aborts archiving on
any miss or duplication), then **archives** each fully-resolved unit (all queued cards placed,
nothing pending/held) into `.deai/review-applied.json` and re-collates so `/review` drops it.
A unit with any pending or held card is left active and reported, never silently hidden.

**Per-card `applied` state (terminal done).** Archiving is whole-chapter and only fires when a
unit has nothing pending — so a card written to Drive while its chapter still has untriaged
siblings would otherwise sit on `/review` forever as `queued`. To close that loop, `--apply`
stamps every placed card `decision:'applied'` in `review-decisions.json` (preserving its
note/chosen/anchor). The page shows `applied` cards as ✓ done and hides them by default
(a *show applied (N)* toggle reveals them; *reopen* returns one to `queued`). `applied` is never
re-applied (the loop only acts on `queued`) and never treated as a drifter. To backfill cards
applied before this existed, `apply.mjs --mark-applied` stamps every card already on Drive with
no Drive write, no re-sync, no archive.

**Keeping the queue in step with Drive — automatic (no phantom dupes).** The Doc moves ahead of
`review.json` as edits land (apply.mjs, a sibling pass, or the author by hand). A card whose fix
already matches the live manuscript — often because a *neighboring* edit in the same merged
passage landed it — used to linger on `/review` as a phantom dupe. Three things now keep the
queue honest, all sharing one classifier (`reconcile-core.mjs`) so what you SEE and what gets
WRITTEN can never disagree:
- **Serve-time (the `/review` API):** every page load reclassifies each still-open card against
  the cached manuscript and hides it if its fix is already on Drive (`done` → shown `applied`,
  badged `auto`) or its anchor was replaced by a different edit (`orphan` → `dismiss`). In-memory
  only, never persisted. Stale cache is safe: it can only *under*-hide, never wrongly hide a card
  whose anchor is genuinely present. Structural/action cards (no redline) are never auto-resolved.
- **`apply.mjs` post-sync sweep:** after verifying its writes, it also stamps `applied` any card
  whose fix is now on Drive (including ones it didn't write this run), persisting that truth.
- **`reconcile.mjs` (backstop, persists):** `sync.sh` → `node reconcile.mjs` (dry run) →
  `--apply` writes `done → applied` / `orphan → dismiss` into `review-decisions.json`. Run it
  before a big triage session or to permanently clear dead orphans; the two automatic paths mean
  you rarely need to. It also REPORTS (never changes) `applied` cards not found on Drive — possible
  false stamps. Note: reopening an auto-resolved `done` card won't stick while its fix is still
  verbatim on Drive — by design (it really is done); change the Drive text and it returns.

## Orchestration via the Workflow tool (optional, recommended for whole-book)
The fan-out is a textbook parallel pipeline. For a multi-chapter sweep, a Workflow
script can `pipeline()` units through [scan-all-lenses → collate], one batch per
chapter, instead of hand-spawning. The per-lens scanner prompt is `lens-scan.md`;
the schema is `schema.json`. Keep concurrency at the default cap.

## Files
| file | role |
|------|------|
| `lenses.json` | the lens registry (id → craft file, scope, route) — the run manifest |
| `lens-scan.md` | the scanner subagent contract (one lens × one unit → JSON) |
| `schema.json` | the per-lens findings JSON contract |
| `collate.mjs` | merge `.deai/review/*.json` → `.deai/review.json` (+ counts); also annotates any option whose `edited` crowds one word at the sentence start with `openerRun` (`hard`=3+ in a row, else a 3-of-4 cluster) so the page flags it |
| `apply.mjs` | write QUEUED cards to Drive (note overrides option; cut/single/multi routed to the book-edit tools), verify, sweep+stamp fix-already-on-Drive cards `applied`, then archive resolved units to `review-applied.json`. DRY RUN unless `--apply` |
| `reconcile-core.mjs` | the shared classifier (`classify`/`norm`/`candidates`): is a card's fix already on Drive (`done`), its anchor superseded (`orphan`), or still actionable (`live`)? Imported by apply.mjs, reconcile.mjs, and the `/review` API so they never drift |
| `reconcile.mjs` | persist queue↔Drive reconciliation: `done → applied`, `orphan → dismiss` (backstop; the API + apply.mjs do this automatically). DRY RUN unless `--apply` |
| `render.mjs` | CLI fallback triage view: prints each finding with affected sentence + surrounding sentences (context derived from the manuscript) and the fix. `--lens X`, `--min mid`, `--exclude a,b`, `--out FILE` |
| `app/pages/review.vue` | the `/review` page — the primary surface (grouped by lens, craft-only toggle, redline + context, queue/dismiss) |
| `server/api/review/index.get.ts` · `decisions.post.ts` | serves review.json (+ derives context, overlays decisions, **auto-hides cards whose fix is already on Drive via reconcile-core**) · persists triage |
| `README.md` | the file map + pipeline (this skill's quick reference) |
| `.deai/review/` | gitignored cache: per-lens scanner outputs + collated `review.json` + `review-decisions.json` |
| reuses `deai/sync.sh`, `deai/pages.sh` | sync, paginate |

## Non-negotiables baked in
- Every finding cites a principle from its lens file (`craft/<lens>`) and its `source` —
  cite the research, not training. No principle in the file → no finding.
- The research is the only ruler; the author is the veto, at triage. No voiceprint file.
- Scanning never writes Drive; `apply.mjs --apply` is the sole writer, only for queued cards,
  and the author's NOTE on a card overrides the engine's option (notes are authoritative).
- IGNORE DRIFTERS. Act only on cards present in the current `review.json`. A decision in
  `review-decisions.json` whose card id is gone is a *drifter* — its content-hash flipped when the
  manuscript was edited + re-collated, so it belongs to an already-completed/archived chapter, not
  outstanding work. `apply.mjs` skips them by construction (it iterates `review.findings` only).
  Never hand-rescue a drifter — do not probe `review-decisions.json` for orphaned queued/noted
  decisions and re-apply them; that reopens a settled chapter (archived = done).
- Archive after placement: apply.mjs verifies each edit landed once, then adds the finished
  unit to `review-applied.json` so /review drops it. Never re-collate a unit live against an
  already-edited manuscript (it orphans decisions) — archive it instead.
- One lens per scanner; the 82k manuscript never enters the main thread.
- Best-writing-first: the move is whatever the research says is strongest here — add,
  sharpen, restructure, or cut — never a reflex toward shorter. Never introduce a
  triad/staccato/em dash (house style).
