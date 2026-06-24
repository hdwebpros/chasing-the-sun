import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

// Persist per-finding craft-review triage decisions to .deai/review-decisions.json,
// keyed by finding id. States: 'pending' | 'queued' (act on it via the finding's route
// pass) | 'dismiss' (deliberate / not a problem) | 'applied' (terminal — the edit has been
// written to Drive; stamped by apply.mjs, shown as done on /review, hidden by default).
// This pass does NOT write Drive — a queued finding flows to its route pass (deai/
// variety/manual) where the actual edit happens under THAT pass's gate.
export default defineEventHandler(async (event) => {
  const body = await readBody<{ decisions: Record<string, { decision?: string; note?: string }> }>(event)
  const dir = join(process.cwd(), '.deai')
  const path = join(dir, 'review-decisions.json')
  let current: Record<string, any> = {}
  try { current = JSON.parse(await readFile(path, 'utf8')) } catch { /* none yet */ }
  // Stamp each saved decision with its card's manuscript `original` (the anchor) so a
  // later re-scan that renames the card id can still re-attach this decision by text.
  let byId = new Map<string, string>()
  try {
    const review = JSON.parse(await readFile(join(dir, 'review.json'), 'utf8'))
    byId = new Map((review.findings || []).map((c: any) => [c.id, c.original]))
  } catch { /* review.json missing; skip anchor stamping */ }
  let changed = 0
  for (const [id, d] of Object.entries(body.decisions || {})) {
    const anchor = byId.get(id) ?? current[id]?.anchor ?? null
    current[id] = { ...current[id], ...d, anchor }
    changed++
  }
  await writeFile(path, JSON.stringify(current, null, 2))
  return { changed }
})
