import { readdir, readFile } from 'node:fs/promises'
import { deaiDir, type PageDoc, type Flag } from '../../utils/deai'

// Aggregate every tic-page-NN.json into ONE pattern-grouped payload for the tic
// review (the negation-correction fragment is a whole-book frequency tic, so the
// author judges the rhythm across the book, not page by page). Storage stays
// page-partitioned — decisions are written back through the normal per-page
// /api/deai/decisions endpoint (mode=tic). This endpoint is read-only.

interface Row extends Flag { page: number }

// ?mode=word serves the word-pass caches (word-page-NN.json) instead, grouped by the
// word (tell `word-<lemma>`) with dialogue parked, so one UI reviews either pass.
export default defineEventHandler(async (event) => {
  const mode = getQuery(event).mode === 'word' ? 'word' : 'tic'
  const dir = deaiDir()
  const re = mode === 'word' ? /^word-page-\d+\.json$/ : /^tic-page-\d+\.json$/
  let files: string[] = []
  try { files = (await readdir(dir)).filter(f => re.test(f)) } catch {}

  const rows: Row[] = []
  for (const f of files) {
    let doc: PageDoc
    try { doc = JSON.parse(await readFile(`${dir}/${f}`, 'utf8')) } catch { continue }
    for (const fl of doc.flags || []) rows.push({ ...fl, page: doc.page })
  }
  // reading order: earliest page to latest (id as the within-page tiebreak)
  rows.sort((a, b) => a.page - b.page || a.id.localeCompare(b.id, undefined, { numeric: true }))

  // Sub-shape groups; dialogue is parked into its own group regardless of shape.
  const groups: Record<string, Row[]> = mode === 'word' ? { dialogue: [] } : { single: [], twobeat: [], anaphora: [], dialogue: [] }
  for (const r of rows) {
    if (r.inDialogue) groups.dialogue.push(r)
    else if (mode === 'word') (groups[r.tell.replace('word-', '')] ||= []).push(r)
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

  const counts: Record<string, ReturnType<typeof tally>> = { all: tally(rows) }
  for (const k of Object.keys(groups)) counts[k] = tally(groups[k])
  return { mode, counts, groups }
})
