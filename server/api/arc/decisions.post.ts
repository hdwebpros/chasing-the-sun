import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

// Persist per-line HIBERNO-ARC review decisions to .deai/hiberno-decisions.json.
// Diagnostic states: 'pending' | 'queued' (send this deviation to the brogue pass
// for an in-voice fix) | 'dismiss' (accept the line as-is). This pass does NOT
// write Drive — actual line rewrites flow through the brogue apply pipeline.
export default defineEventHandler(async (event) => {
  const body = await readBody<{ decisions: Record<string, { decision?: string; note?: string }> }>(event)
  const path = join(process.cwd(), '.deai', 'hiberno-decisions.json')
  let current: Record<string, any> = {}
  try { current = JSON.parse(await readFile(path, 'utf8')) } catch { /* none yet */ }
  let changed = 0
  for (const [id, d] of Object.entries(body.decisions || {})) {
    current[id] = { ...current[id], ...d }
    changed++
  }
  await writeFile(path, JSON.stringify(current, null, 2))
  return { changed }
})
