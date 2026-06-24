// reconcile-core.mjs — ONE classifier for "is this card's fix already on Drive?"
//
// The Doc moves ahead of review.json as edits land (apply.mjs, a sibling pass, or the author
// by hand). That strands cards: the fix is already live, or the anchor was replaced by a
// DIFFERENT edit so it can never apply. Three consumers must agree on which is which, or the
// queue you SEE disagrees with the decisions that get WRITTEN:
//   • server/api/review/index.get.ts  — read-only, hides resolved cards at serve time
//   • reconcile.mjs                    — persists the resolution into review-decisions.json
//   • apply.mjs                        — stamps fix-already-on-Drive cards 'applied' post-sync
// So the classification lives here, once. Mirrors apply.mjs's idempotency test exactly.
//
// norm(): curly quotes -> straight, all whitespace (incl. paragraph breaks) -> single space.
// Pass a manuscript normalized with THIS norm() as M.

export const norm = (s) => (s || '')
  .replace(/[“”]/g, '"').replace(/[‘’]/g, "'")
  .replace(/\s+/g, ' ').trim()

const USE = /^use(\s*this)?\s*:/i

// A card's possible replacement texts, best-first: note 'use:' override, then chosen option,
// then every offered option. Excludes the card's own original (handled by the caller).
export function candidates(card, dec) {
  const out = []
  const note = dec && dec.note && dec.note.trim() ? dec.note.trim() : ''
  if (USE.test(note)) out.push(note.replace(USE, '').trim())
  if (dec && dec.chosen != null && dec.chosen !== '') out.push(dec.chosen)
  for (const o of (card.options || [])) if (o.edited) out.push(o.edited)
  return out.map(norm).filter(Boolean)
}

// Classify ONE card against the normalized manuscript M. Returns:
//   'done'         fix verbatim on Drive            -> should be 'applied' (hide as done)
//   'orphan'       anchor gone, superseded          -> should be 'dismiss' (can never apply)
//   'live'         anchor present, fix not there    -> still actionable, leave alone
//   'applied'      already stamped applied & on Drive
//   'falseApplied' stamped applied but NOT on Drive  -> report only, never auto-changed
//   'other'        author 'dismiss' / non-redline card -> leave alone
//
// Guard: a structural/action card (no `original` redline) is never auto-resolvable — there is
// no span to test for presence or supersession, so it always stays 'live'/'other'.
export function classify(card, dec, M) {
  const state = (dec && dec.decision) || 'pending'
  if (!card.original) return state === 'applied' ? 'applied' : (['pending', 'queued'].includes(state) ? 'live' : 'other')
  const fN = norm(card.original)
  const present = M.includes(fN)
  const cands = candidates(card, dec).filter((x) => x !== fN)
  const meaningfulPresent = cands.some((x) => !fN.includes(x) && M.includes(x)) // new text on Drive (not an unapplied cut)
  const anyPresent = cands.some((x) => M.includes(x))
  if (state === 'applied') return (!present && !meaningfulPresent) ? 'falseApplied' : 'applied'
  if (!['pending', 'queued'].includes(state)) return 'other' // author 'dismiss' — leave alone
  if (present) return meaningfulPresent ? 'done' : 'live'
  return anyPresent ? 'done' : 'orphan'
}
