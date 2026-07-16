# Craft Knowledge Base — Index (DEPRECATED shadow)

> **The ruler is the author's Obsidian vault, not this folder.** Vault `ryanboog`, folder
> `Writing/Craft Notes` (~152 notes). Access via the `obsidian` CLI (`obsidian search` /
> `obsidian read`) — **DO NOT grep this local tree.** See CLAUDE.md → "Craft knowledge base".
>
> **The prose-VOICE doctrine was deleted (July 2026)** — it reverse-engineered surface rules
> that flattened the prose into primer cadence. Gone: `voice/sound-like-yourself.md`,
> `voice/pro-level.md`, `sentence/sentence-craft.md`, `sentence/power.md`,
> `sentence/power-appendix.md`, `sentence/variety.md`. **There is no VOICE.md** and no voiceprint
> may be reintroduced; the author is the veto.

The only surviving local craft files are the **de-AI flag list** (`voice/ai-fingerprints.md`) and
the **structural lenses** (character/scene/pacing/tension/setting/dialogue/emotion/device/intimacy)
that still back the `/review` engine pending migration to Obsidian.

**How to use**
- For any sentence/voice/prose question, query **Obsidian** via the CLI. Cite the source note.
- Load a structural lens file below *only* when working that lens; treat Obsidian as primary.
- Every load-bearing third-party claim is verified in [`SOURCES.md`](SOURCES.md). Cite the research, not training.
- Raw source transcripts are archived in `../sources-raw/` for provenance.

**Status legend:** ✅ live local file · ⛔ RETIRED (deleted; use Obsidian)

| Lens | File | What it covers | From | Status |
|---|---|---|---|---|
| voice | ~~voice/sound-like-yourself.md~~ | put voice on the page / mechanical-AI cure | CRUCIALNOMOREMECHANICALWRITING | ⛔ → Obsidian |
| voice | ~~voice/pro-level.md~~ | 8 authors' pro tips (burnt tongue, defamiliarization…) | CRUCIALROBOTICTOPROLEVELWRITING | ⛔ → Obsidian |
| voice | [voice/ai-fingerprints.md](voice/ai-fingerprints.md) | AI-prose tells + over-correction guardrails; the de-AI flag list (judgment, not find-and-replace) | AI-MISTAKES-TO-AVOID (reusable slice) | ✅ |
| sentence | ~~sentence/sentence-craft.md~~ | six-step sentence build | bookfoxsentencetips | ⛔ → Obsidian |
| sentence | ~~sentence/power.md~~ | POWER/SOPHOMORIC scored rubric | SENTENCE-POWER + SOPHOMORIC-RUBRIC | ⛔ → Obsidian |
| sentence | ~~sentence/variety.md~~ | SVO-monotony, openers, triad/tic | SENTENCE-VARIETY-LESSON | ⛔ → Obsidian |
| character | [character/vivify-flat-characters.md](character/vivify-flat-characters.md) | 7-step vivification (exaggerate, contrast, appearance-with-depth, moral attempts, wound, force-field, inversion) | FLATCHARACTERS | ✅ |
| character | [character/techniques.md](character/techniques.md) | R1–R15 hist-fic techniques + Bookfox-9 rubric; cross-links (not restates) vivify-flat-characters | CHARACTER-REVIEW + BOOKFOX-CHARACTER-GRADES | ✅ |
| scene | [scene/eight-techniques.md](scene/eight-techniques.md) | Bookfox's 8 scene techniques (tonal shift, trickery, transitions, embodied emotion, one-shot desc, dialogue-through-item, unexpected reaction, 2nd-person) | scenetranscript | ✅ |
| scene | [scene/chapter-hooks.md](scene/chapter-hooks.md) | Open-door vs closed-door endings; 4 softening habits | CHAPTER-HOOKS (principle slice) | ✅ |
| pacing | [pacing/pacing.md](pacing/pacing.md) | 9 pacing levers + scene-vs-summary, length↔consequence match (reverse outline), connective-tissue sag, reprise de-escalation, denouement | PACINGTWEAKS + PACING-RECOMMENDATIONS slice | ✅ |
| tension | [tension/tension.md](tension/tension.md) | 7 tension techniques beyond cliffhangers (curiosity gap, collision, secret, pressure, unresolved emotion, dramatic irony, impossible choice) | TENSIONTECHNIQUES | ✅ |
| setting | [setting/setting.md](setting/setting.md) | Place/setting amateur→pro (7 rungs); characters always above setting | SETTINGWRITING | ✅ |
| setting | [setting/worldbuilding.md](setting/worldbuilding.md) | World *breaking* over world *building*: deliver setting through consequence, not infodump | STOPWORLDBUILDING | ✅ |
| dialogue | [dialogue/worst-lines.md](dialogue/worst-lines.md) | 10 worst-dialogue failure modes + before/after fixes; the subtext master-rule | WORSTLINES | ✅ |
| dialogue | [dialogue/dialect-gradient.md](dialogue/dialect-gradient.md) | Measuring dialect/Americanization slope (reusable rubric) | HIBERNO-ARC | ✅ |
| emotion | [emotion/resonance.md](emotion/resonance.md) | Banked-joy→cry, lacrimal staircase, catharsis architecture, restraint-at-peak, "Gibbs contract" | RESONANCE-REVIEW (reusable slice) | ✅ |
| device | [device/recurring-device.md](device/recurring-device.md) | Chekhov's-armory at scale; motif variation (transform not repeat); motif-or-metronome diagnostic | PAPER-AND-DEATHS (reusable slice) | ✅ |
| intimacy | [intimacy/spicy-scenes.md](intimacy/spicy-scenes.md) | 9 mistakes in intimate scenes + fixes (clinical reference) | SPICYSCENES | ✅ |

## Roadmap
- **Phase 1 — distill the 11 raw transcripts → lens files. ✅ DONE (11/11).**
- **Phase 2a — extract reusable slices from the structured files into the lens rows above. ✅ DONE.** All 18 lens rows are now ✅ (added: voice/ai-fingerprints, sentence/power + power-appendix, sentence/variety, character/techniques, scene/chapter-hooks, emotion/resonance, device/recurring-device, dialogue/dialect-gradient; merged PACING-RECOMMENDATIONS into pacing/pacing). Reconciliations applied: character/techniques cross-links (does not restate) vivify-flat-characters; triad/tic principles consolidated into sentence/variety (no separate file); SCENE-TECHNIQUES had no new reusable slice (its craft already in scene/eight-techniques).
- **Phase 2b — relocate book-specific findings to `../reviews/` (the "bloat" cleanup). ◻ PENDING author OK.** Each structured file's book-specific remainder (per-line scores, per-chapter verdicts, grades, motif inventories) was enumerated by the Phase 2a agents and is listed for migration. Touches stale text pointers in `app/pages/report-card.vue` and project memory, so gated on approval.
- **Phase 3 — verify the canon queue + flagged attributions against originals. ✅ DONE (2026-06-22).** All 11 canon claims web-verified (Sword bands are real; Clark = Tool #4; Strunk numbering clarified; Burroway "popularized" not "coined"; Mantel/Cron/King/Orwell/Christensen ✅; Maass micro-tension = *The Fire in Fiction*). 8 flagged items resolved: dropped Nabokov "blonde prose"; "Robin Wilson" left unresolved (principle = Gardner, do NOT rename to Macauley); Jade West *Artless* → likely *Heartless*. See `SOURCES.md`.
- **Phase 4 — build the parallel multi-lens review engine. ✅ DONE (2026-06-22).** The `review` skill (`.claude/skills/review/`) fans one scanner subagent per lens (`lenses.json` → `craft/<lens>` + VOICE.md veto) over a chapter/page unit, each emitting findings per `schema.json` to `.deai/review/<unit>__<lensId>.json`; `collate.mjs` merges them → `.deai/review.json`. Diagnostic only — never writes Drive; each finding carries a `route` (deai/variety/tic/brogue/manual) so queued findings flow to the existing apply passes under their own gates. Review is terminal-first (a triage table; verdicts saved to `.deai/review-decisions.json`). Dialect lens excluded (that's `/arc`). See `.claude/skills/review/README.md`.

## Open reconciliation notes (from Phase 1 agents)
- `sentence/sentence-craft.md` is the *constructive* sentence file (how to build one); the planned `sentence/variety.md` is *diagnostic* (detect monotony) and `sentence/power.md` is the *scored rubric*. All three draw on overlapping material — in Phase 2, make sentence-craft the canonical home for build-technique and have the others cross-link.
- Two source-video factual errors were corrected in-file and logged in SOURCES.md (Houellebecq Bad-Sex award; "Horus 1980"→Horace). One probable misattribution flagged for author review ("Robin Wilson" → likely Robie Macauley).
