import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

// Serve the collated HIBERNO-ARC dataset (.deai/hiberno-arc.json, produced by
// scripts/hiberno-collate.mjs from the LLM score files). Merges any saved
// per-line review decisions from .deai/hiberno-decisions.json. Returns
// { ready:false } until the scan + collate have run.
export default defineEventHandler(async () => {
  const dir = join(process.cwd(), '.deai')
  let data: any
  try {
    data = JSON.parse(await readFile(join(dir, 'hiberno-arc.json'), 'utf8'))
  } catch {
    return { ready: false }
  }
  let decisions: Record<string, { decision?: string; note?: string }> = {}
  try {
    decisions = JSON.parse(await readFile(join(dir, 'hiberno-decisions.json'), 'utf8'))
  } catch { /* none yet */ }
  for (const l of data.lines || []) {
    const d = decisions[l.id]
    l.decision = d?.decision ?? 'pending'
    if (d?.note != null) l.reviewNote = d.note
    for (const fx of l.fixes || []) {
      const fd = decisions[fx.id]
      fx.decision = fd?.decision ?? 'pending'
      if (fd?.editText != null) fx.editText = fd.editText
    }
  }
  return { ready: true, ...data }
})
