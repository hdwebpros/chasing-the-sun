# de-AI editing system

Remove AI fingerprints from the manuscript **in the author's own voice** — flag and
suggest, minimal edits, never rewrite. Drive stays the source of truth. Two scores on
every flag, never merged:

- **Voice 0–10** — how off-THE-AUTHOR's-voice a span reads (Claude's judgment vs `VOICE.md`).
- **Detect 0–10** — statistical AI-likelihood (`stats.mjs`, model-free proxy — *not* GPTZero).

## Pipeline

```
Google Doc ──sync.sh──► .deai/manuscript.txt ──pages.sh──► page N (~400w, para-snapped)
                                                              │
                          VOICE.md + taxonomy.json + rules.md │ stats.mjs (detect axis)
                                                              ▼
                                            detect SUBAGENT (prose dies here)
                                                              │  schema.json
                                                              ▼
                                                   .deai/page-NN.json
                                                              │
                   /deai review page  ◄──/api/deai/page/N──   │
                   accept / reject / edit                     │
                   ──/api/deai/decisions──► writes decisions back into page-NN.json
                                                              │
                              apply-fixes.mjs (DRY-RUN default; --apply writes Drive)
                                                              ▼
                                       Doc updated ──► build epub ──► commit
```

## Files

| file | role |
|------|------|
| `sync.sh` | export Drive Doc → `.deai/manuscript.txt` (re-run after Drive edits) |
| `pages.sh` | paragraph-snapped paginator (`pages.sh ms.txt [N]`) |
| `stats.mjs` | deterministic detect battery → 0–10 + breakdown (the Detect axis) |
| `ai-phrases.txt` | growable AI-phrase lexicon feeding stats.mjs |
| `VOICE.md` | the author's voiceprint — the only ruler for off-voice |
| `taxonomy.json` | 10 tells, per-page + book budgets (thresholds, not elimination) |
| `schema.json` | the page+flags JSON contract |
| `detect.md` | the subagent contract (one page in → small JSON out) |
| `rules.md` | self-pruning learned decisions (keep small) |
| `verify-spans.mjs` | guard: every flag `span` is verbatim in its page (else the UI can't highlight it). Run after each detect batch |
| `apply-fixes.mjs` | apply approved fixes to Drive (dry-run default, gated) |
| `tally.mjs` | whole-manuscript tally vs book budgets (second altitude) |
| `.deai/` | gitignored cache: `manuscript.txt`, `page-NN.json` |

## Nuxt

- `app/pages/deai.vue` — review UI (spans colour-coded by severity, both scores, inline accept/reject/edit).
- `server/api/deai/page/[n].get.ts` — serve one page (prose + cached flags).
- `server/api/deai/decisions.post.ts` — persist decisions (dev-only; does NOT touch Drive).
- `server/utils/deai.ts` — shared paginator (mirrors `pages.sh`).

## Run one page (the loop)

```bash
# from project root:
.claude/skills/deai/sync.sh                 # once, or after Drive edits
# detection: invoke the `deai` skill → it spawns the detect subagent for page N
#   (writes .deai/page-NN.json)
# review:  open http://localhost:3000/deai?p=N  → accept/reject/edit → save
node .claude/skills/deai/apply-fixes.mjs N             # dry-run: preview the fixes
node .claude/skills/deai/apply-fixes.mjs N --apply     # write accepted fixes to Drive
node .claude/skills/deai/tally.mjs                     # whole-book budget check
```

## Non-negotiables baked in

- Minimal edits only; unflagged spans are never touched (`apply-fixes` only acts on
  `accept`/`edit` flags, find/replacing the exact verbatim span).
- Manuscript writes are **explicit** — `apply-fixes.mjs` is dry-run until `--apply`.
- Detection runs in a **subagent**; the main thread only ever sees small JSON.
- One page at a time; the 82k never loads into the working context.
