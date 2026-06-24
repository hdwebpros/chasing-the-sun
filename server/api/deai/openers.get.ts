import { readdir, readFile, stat } from 'node:fs/promises'
import { deaiDir, type PageDoc, type Flag } from '../../utils/deai'

// Aggregate every openers-page-NN.json into ONE payload for the /openers review.
// Opener monotony is a structural, whole-book pattern, so the author works it grouped
// by CHAPTER and by RUN (a stretch of same-class openers), not page by page. Storage
// stays page-partitioned — decisions write back through /api/deai/decisions
// (mode=openers). This endpoint is read-only.

interface Row extends Flag { page: number; chapter: string }
interface Run { runId: string; page: number; chapter: string; code: string; runLen: number; runCodes: string; context: string; rows: Row[] }

export default defineEventHandler(async () => {
  const dir = deaiDir()
  let files: string[] = []
  try { files = (await readdir(dir)).filter(f => /^openers-page-\d+\.json$/.test(f)) } catch {}

  const rows: Row[] = []
  for (const f of files) {
    let doc: PageDoc & { chapter?: string }
    try { doc = JSON.parse(await readFile(`${dir}/${f}`, 'utf8')) } catch { continue }
    // per-FLAG chapter is authoritative (a page can straddle two chapters at a heading
    // boundary); fall back to the page's chapter for older caches without it.
    for (const fl of doc.flags || []) rows.push({ ...fl, page: doc.page, chapter: (fl as any).chapter ?? doc.chapter ?? '' })
  }
  rows.sort((a, b) => a.page - b.page || a.id.localeCompare(b.id, undefined, { numeric: true }))

  // group into runs (reading order preserved)
  const runMap = new Map<string, Run>()
  for (const r of rows) {
    const key = r.runId ?? `${r.page}-solo-${r.id}`
    let run = runMap.get(key)
    if (!run) {
      run = { runId: key, page: r.page, chapter: r.chapter, code: r.code ?? 'S', runLen: r.runLen ?? 0, runCodes: r.runCodes ?? '', context: r.context ?? '', rows: [] }
      runMap.set(key, run)
    }
    run.rows.push(r)
  }
  const runs = [...runMap.values()]

  // chapter buckets (for the chapter rail) + load the measurement summary if present
  const byChapter: Record<string, Run[]> = {}
  for (const run of runs) (byChapter[run.chapter] ||= []).push(run)

  // the distribution bar is a snapshot from the last classify.mjs run — surface its file
  // mtime so the page can label it "measured <when>" (it does NOT reflect pending UI decisions).
  let summary: unknown = null
  let summaryMtime: string | null = null
  try { summary = JSON.parse(await readFile(`${dir}/openers-summary.json`, 'utf8')) } catch {}
  try { summaryMtime = (await stat(`${dir}/openers-summary.json`)).mtime.toISOString() } catch {}

  const tally = (rs: Row[]) => ({
    total: rs.length,
    pending: rs.filter(r => !r.decision || r.decision === 'pending').length,
    kept: rs.filter(r => r.decision === 'reject').length,
    changed: rs.filter(r => r.decision === 'accept' || r.decision === 'edit').length,
  })

  return {
    counts: tally(rows),
    chapters: Object.entries(byChapter).map(([chapter, rs]) => ({
      chapter,
      runs: rs.length,
      flags: rs.reduce((a, r) => a + r.rows.length, 0),
      ...tally(rs.flatMap(r => r.rows)),
    })),
    runs,
    summary,
    summaryMtime,
  }
})
