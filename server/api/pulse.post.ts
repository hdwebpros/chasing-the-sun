import Pusher from 'pusher'

let pusher: Pusher | null = null
function getPusher(): Pusher | null {
  if (pusher) return pusher
  const cfg = useRuntimeConfig()
  if (!cfg.pusherAppId || !cfg.pusherSecret || !cfg.public.pusherKey || !cfg.public.pusherCluster) {
    return null
  }
  pusher = new Pusher({
    appId: cfg.pusherAppId,
    key: cfg.public.pusherKey,
    secret: cfg.pusherSecret,
    cluster: cfg.public.pusherCluster,
    useTLS: true,
  })
  return pusher
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (!body || typeof body !== 'object' || typeof body.type !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'invalid payload' })
  }
  const p = getPusher()
  if (!p) {
    throw createError({ statusCode: 503, statusMessage: 'pusher not configured' })
  }
  await p.trigger('cts-twitch', 'msg', body)
  return { ok: true }
})
