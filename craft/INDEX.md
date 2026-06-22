# Craft Knowledge Base — Index

The reusable writing-craft brain for *Chasing the Sun*, distilled from ~hundreds of hours of
research (Bookfox/John Matthew Fox videos, Alyssa Matesic, and the primary craft canon: Sword,
King, Clark, Christensen, Tufte, Orwell, Strunk & White, Burroway, Le Guin, et al.).

**How to use this KB**
- This index is the only file loaded by default. Load a lens file *only* when working that lens.
- Each lens file = the technique + why it works + 1–3 canonical before/after examples + cited source.
- **Authority order:** `VOICE.md` / `RYAN-HOUSE-STYLE.md` (the manuscript voiceprint) **first**, then this
  research, then general model knowledge. Where this KB conflicts with VOICE.md, VOICE.md wins.
- Every load-bearing third-party claim is verified in [`SOURCES.md`](SOURCES.md). Cite the research, not training.
- Book-specific findings (line numbers, per-instance verdicts) live in `../reviews/`, NOT here.
- Raw source transcripts are archived in `../sources-raw/` for provenance.

**Status legend:** ✅ done · ◻ planned (not yet distilled)

| Lens | File | What it covers | From | Status |
|---|---|---|---|---|
| voice | [voice/sound-like-yourself.md](voice/sound-like-yourself.md) | 9 steps to put voice on the page; cure for mechanical/AI prose | CRUCIALNOMOREMECHANICALWRITING | ✅ |
| voice | [voice/pro-level.md](voice/pro-level.md) | 8 named authors' pro tips (burnt tongue, defamiliarization, filter words, purple prose…) | CRUCIALROBOTICTOPROLEVELWRITING | ✅ |
| voice | [voice/ai-fingerprints.md](voice/ai-fingerprints.md) | AI-prose tells (Part A) + over-correction guardrails (Part B); judgment instrument, not find-and-replace | AI-MISTAKES-TO-AVOID (reusable slice) | ✅ |
| sentence | [sentence/sentence-craft.md](sentence/sentence-craft.md) | Six-step sentence build: variety, cherry-picked verb, power word, internal arc, figure of speech, cut the fat | bookfoxsentencetips | ✅ |
| sentence | [sentence/power.md](sentence/power.md) | POWER + SOPHOMORIC scored rubric; computable features + judge scales (heavy data in power-appendix) | SENTENCE-POWER + SOPHOMORIC-RUBRIC | ✅ |
| sentence | [sentence/variety.md](sentence/variety.md) | SVO-monotony diagnosis, openers, pet phrases, stock gestures, triad overuse + tic-vs-signature method | SENTENCE-VARIETY-LESSON (+TRIAD/TIC reusable slice) | ✅ |
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
- **Phase 4** — build the parallel multi-lens review engine that scans the Drive Doc through these lenses (deferred; integrates with /deai, /brogue, /tic, /variety, /arc).

## Open reconciliation notes (from Phase 1 agents)
- `sentence/sentence-craft.md` is the *constructive* sentence file (how to build one); the planned `sentence/variety.md` is *diagnostic* (detect monotony) and `sentence/power.md` is the *scored rubric*. All three draw on overlapping material — in Phase 2, make sentence-craft the canonical home for build-technique and have the others cross-link.
- Two source-video factual errors were corrected in-file and logged in SOURCES.md (Houellebecq Bad-Sex award; "Horus 1980"→Horace). One probable misattribution flagged for author review ("Robin Wilson" → likely Robie Macauley).
