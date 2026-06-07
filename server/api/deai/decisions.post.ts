import { readFile, writeFile } from 'node:fs/promises'
import { pageJsonPath, readPageDoc, asMode, type Flag } from '../../utils/deai'

// Persist the author's accept/reject/edit decisions for a page back into its cache
// (page-NN.json for de-AI, brogue-page-NN.json for the dialogue pass — selected by
// `mode`). Dev-only; does NOT touch Drive — applying accepted fixes to the
// manuscript is a separate, explicitly-gated step (see apply-fixes).
export default defineEventHandler(async (event) => {
  if (process.env.NODE_ENV === 'production') {
    throw createError({ statusCode: 403, statusMessage: 'editing disabled in production' })
  }
  const body = await readBody<{ page?: number; mode?: string; decisions?: Record<string, { decision: Flag['decision']; editText?: string; editFull?: boolean }> }>(event)
  const page = Number(body?.page)
  if (!Number.isInteger(page) || page < 1) {
    throw createError({ statusCode: 400, statusMessage: 'page required' })
  }
  const mode = asMode(body?.mode)
  const doc = await readPageDoc(page, mode)
  if (!doc) {
    throw createError({ statusCode: 404, statusMessage: `no detection cached for page ${page}` })
  }
  const decisions = body?.decisions ?? {}
  let changed = 0
  for (const f of doc.flags) {
    const d = decisions[f.id]
    if (!d) continue
    if (!['accept', 'reject', 'edit', 'pending'].includes(d.decision as string)) {
      throw createError({ statusCode: 400, statusMessage: `bad decision for ${f.id}` })
    }
    f.decision = d.decision
    if (d.decision === 'edit') {
      f.editText = d.editText ?? ''
      if (d.editFull) f.editFull = true
      else delete f.editFull
    } else {
      delete f.editText
      delete f.editFull
    }
    changed++
  }
  await writeFile(pageJsonPath(page, mode), JSON.stringify(doc, null, 2) + '\n', 'utf8')
  const counts = doc.flags.reduce<Record<string, number>>((a, f) => {
    const k = f.decision ?? 'pending'
    a[k] = (a[k] || 0) + 1
    return a
  }, {})
  return { ok: true, changed, counts }
})
