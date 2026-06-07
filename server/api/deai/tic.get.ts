import { readdir, readFile } from 'node:fs/promises'
import { deaiDir, type PageDoc, type Flag } from '../../utils/deai'

// Aggregate every tic-page-NN.json into ONE pattern-grouped payload for the tic
// review (the negation-correction fragment is a whole-book frequency tic, so the
// author judges the rhythm across the book, not page by page). Storage stays
// page-partitioned — decisions are written back through the normal per-page
// /api/deai/decisions endpoint (mode=tic). This endpoint is read-only.

interface Row extends Flag { page: number }

export default defineEventHandler(async () => {
  const dir = deaiDir()
  let files: string[] = []
  try { files = (await readdir(dir)).filter(f => /^tic-page-\d+\.json$/.test(f)) } catch {}

  const rows: Row[] = []
  for (const f of files) {
    let doc: PageDoc
    try { doc = JSON.parse(await readFile(`${dir}/${f}`, 'utf8')) } catch { continue }
    for (const fl of doc.flags || []) rows.push({ ...fl, page: doc.page })
  }
  // reading order: earliest page to latest (id as the within-page tiebreak)
  rows.sort((a, b) => a.page - b.page || a.id.localeCompare(b.id, undefined, { numeric: true }))

  // Sub-shape groups; dialogue is parked into its own group regardless of shape.
  const groups: Record<string, Row[]> = { single: [], twobeat: [], anaphora: [], dialogue: [] }
  for (const r of rows) {
    if (r.inDialogue) groups.dialogue.push(r)
    else if (r.tell === 'neg-twobeat') groups.twobeat.push(r)
    else if (r.tell === 'neg-anaphora') groups.anaphora.push(r)
    else groups.single.push(r)
  }

  const tally = (rs: Row[]) => ({
    total: rs.length,
    pending: rs.filter(r => !r.decision || r.decision === 'pending').length,
    kept: rs.filter(r => r.decision === 'reject').length,
    changed: rs.filter(r => r.decision === 'accept' || r.decision === 'edit').length,
  })

  return {
    counts: {
      all: tally(rows),
      single: tally(groups.single),
      twobeat: tally(groups.twobeat),
      anaphora: tally(groups.anaphora),
      dialogue: tally(groups.dialogue),
    },
    groups,
  }
})
