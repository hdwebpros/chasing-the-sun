import { readFile } from 'node:fs/promises'
import { deaiDir, type PageDoc, type Flag } from '../../utils/deai'

// Serve ONE chapter's full prose stream for the /openers CHAPTER ("bunch") view.
//
// openers-chapters.json (written by classify.mjs) holds the whole book as ordered
// sentences, each with its opener code, paragraph id (para) and page. The page docs
// (openers-page-NN.json) hold the live flags (decision / recast / voiceClass …). We join
// them here so the view gets the full prose with every flagged sentence already carrying
// its live decision state — and we join by (page + normalized span), NOT by the flag id,
// because merge-rescan renumbers flag ids on decided pages (the chapter stream's ids would
// otherwise drift). Decisions still autosave through /api/deai/decisions by the live id.
//   GET /api/deai/openers-chapter?chapter=PROLOGUE

interface Sent { t: string; code: string; flagId: string | null; para: number; page: number }
const norm = (s: string) => (s || '').replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim()

export default defineEventHandler(async (event) => {
  const chapter = String(getQuery(event).chapter ?? '')
  if (!chapter) return { chapter: '', sentences: [], order: [] }

  const dir = deaiDir()
  let doc: { chapters: Record<string, Sent[]>; order: string[] }
  try { doc = JSON.parse(await readFile(`${dir}/openers-chapters.json`, 'utf8')) } catch {
    return { chapter, sentences: [], order: [], missing: true }
  }
  const stream = doc.chapters[chapter] ?? []

  // load the live flags for every page this chapter touches, keyed by page+span so we can
  // attach decision/recast onto the matching sentence (consume duplicates in order).
  const pages = [...new Set(stream.map(s => s.page))]
  const byKey = new Map<string, Flag[]>()
  await Promise.all(pages.map(async (p) => {
    const pad = String(p).padStart(2, '0')
    try {
      const pd: PageDoc = JSON.parse(await readFile(`${dir}/openers-page-${pad}.json`, 'utf8'))
      for (const fl of pd.flags || []) {
        const k = `${p}|${norm(fl.span ?? '')}`
        ;(byKey.get(k) ?? byKey.set(k, []).get(k)!).push(fl)
      }
    } catch {}
  }))

  const sentences = stream.map((s) => {
    const queue = byKey.get(`${s.page}|${norm(s.t)}`)
    const f = (queue && queue.length ? queue.shift()! : null) as any
    return {
      t: s.t, code: s.code, para: s.para, page: s.page,
      flag: f ? {
        id: f.id, decision: f.decision ?? 'pending', editText: f.editText,
        opener: f.opener, runLen: f.runLen, runCodes: f.runCodes, alsoVariety: f.alsoVariety,
        voiceClass: f.voiceClass ?? null, recast: f.alts?.recast ?? null,
        unique: f.unique, lead: f.lead, why: f.why,
      } : null,
    }
  })
  return { chapter, sentences, order: doc.order ?? [] }
})
