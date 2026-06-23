# review engine

Point the verified `craft/` knowledge base at the manuscript, one lens at a time, and
surface what's weak — judged by the **research**, not by generic model taste. The
read-only diagnostic upstream of the fix passes; the author is the veto, at triage.

This is to `/arc` what a craft review is to a dialect scan: a findings dashboard you
triage. It writes a cache and routes findings; it **never writes Drive**.

## Pipeline

```
Google Doc ──deai/sync.sh──► .deai/manuscript.txt ──pages.sh──► unit (a chapter ≈ N pages)
                                                                   │
                 craft/<lens> (the only ruler — the research)      │
                                                                   ▼
                          ONE scanner SUBAGENT per lens (lens-scan.md; prose dies here)
                                                                   │ schema.json
                                                                   ▼
                                      .deai/review/<unit>__<lensId>.json   (one per lens)
                                                                   │ node collate.mjs
                                                                   ▼
                                                        .deai/review.json
                                                                   │
                   author triages each card at /review; queue / dismiss
                                          ──► .deai/review-decisions.json
                                                                   │
                       a QUEUED finding flows to its route pass (deai/variety/…)
                       where the actual edit + Drive write happen under THAT gate
```

## Files

| file | role |
|------|------|
| `lenses.json` | lens registry: id → `craft/<lens>` file, scope (line/structural), route |
| `lens-scan.md` | scanner subagent contract — one lens × one unit → findings JSON |
| `schema.json` | the per-lens findings JSON contract |
| `collate.mjs` | merge `.deai/review/*.json` → `.deai/review.json` (+ severity/route counts) |
| `render.mjs` | CLI fallback: each card as a tracked-changes redline + the one-line why (`--lens`, `--min`, `--exclude`, `--out`) |
| `app/pages/review.vue` · `server/api/review/*` | the `/review` page (primary surface) + its API |
| `SKILL.md` | the orchestration + authority order (invoke via the `review` skill) |
| reuses `../deai/sync.sh` · `../deai/pages.sh` | sync · paginate |

## Review surface

The primary surface is the `/review` page (`http://localhost:3000/review`): it reads
`.deai/review.json`, groups cards by lens, and takes the author's **queue / dismiss**
verdict on each, recorded to `.deai/review-decisions.json` keyed by finding id. No Drive
write here — a queued card flows to its route pass.

`render.mjs` is the CLI fallback for the same data when the page isn't running.

## Run a chapter

```bash
.claude/skills/deai/sync.sh                       # once, or after Drive edits
# invoke the `review` skill → it fans one scanner subagent per lens over the unit,
#   each writing .deai/review/<unit>__<lensId>.json
node .claude/skills/review/collate.mjs            # → .deai/review.json
# open http://localhost:3000/review → triage → open each queued finding's route
```

## Non-negotiables

- Authority order: `craft/<lens>` (the research, the only ruler) → model training. The author is the veto, at triage — no voiceprint file.
- Every finding cites a principle from its lens file + its `source`. Cite the research, not training.
- Diagnostic only — the engine never writes Drive. Edits happen in the routed pass under its gate.
- One lens per scanner; the 82k manuscript never enters the main thread.
- Dialect/Americanization is `/arc`, deliberately excluded here to avoid duplication.
