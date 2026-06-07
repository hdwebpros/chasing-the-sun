import { getPage, readPageDoc, asMode } from '../../../utils/deai'

// Serve one review page: paragraph-snapped prose + cached flags (if detection has
// run for this page). Returns flags:null when the cache file doesn't exist yet.
// ?mode=brogue reads the Hiberno-English dialogue cache (brogue-page-NN.json)
// instead of the de-AI cache — same prose, different flag set.
export default defineEventHandler(async (event) => {
  const n = Number(getRouterParam(event, 'n'))
  if (!Number.isInteger(n) || n < 1) {
    throw createError({ statusCode: 400, statusMessage: 'page must be a positive integer' })
  }
  const mode = asMode(getQuery(event).mode)
  const { total, text } = await getPage(n)
  if (n > total) {
    throw createError({ statusCode: 404, statusMessage: `page ${n} of ${total}` })
  }
  const doc = await readPageDoc(n, mode)
  return {
    page: n,
    total,
    text,
    detected: !!doc,
    chapter: doc?.chapter ?? null,
    pageDetect: doc?.pageDetect ?? null,
    flags: doc?.flags ?? [],
  }
})
