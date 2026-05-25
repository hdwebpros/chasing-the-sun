import type { PulseStyle } from '~/data/twitch'

export type PulseMessage =
  | { type: 'pulse'; text: string; style: PulseStyle; id: number }
  | { type: 'image'; src: string; id: number }
  | { type: 'chapter'; id: string }
  | { type: 'progress'; book: number; chapter: number; chapterLabel: string }
  | { type: 'reset' }

const CHANNEL_NAME = 'cts-twitch'

// Module-level Pusher singleton so multiple component mounts share one socket.
let pusherClient: any = null
let pusherChannel: any = null
const pusherHandlers = new Set<(msg: PulseMessage) => void>()

async function ensurePusher() {
  if (pusherClient) return pusherClient
  const cfg = useRuntimeConfig()
  const key = cfg.public.pusherKey
  const cluster = cfg.public.pusherCluster
  if (!key || !cluster) return null
  const { default: Pusher } = await import('pusher-js')
  pusherClient = new Pusher(key, { cluster })
  pusherChannel = pusherClient.subscribe(CHANNEL_NAME)
  pusherChannel.bind('msg', (data: PulseMessage) => {
    pusherHandlers.forEach((h) => h(data))
  })
  return pusherClient
}

export function usePulseChannel() {
  const channel = ref<BroadcastChannel | null>(null)
  const handlers = new Set<(msg: PulseMessage) => void>()

  function send(msg: PulseMessage) {
    // Local same-browser viewers (zero latency)
    channel.value?.postMessage(msg)
    // Cross-device viewers via Pusher — fire-and-forget
    $fetch('/api/pulse', { method: 'POST', body: msg }).catch((e) => {
      console.warn('pulse publish failed', e)
    })
  }

  function onMessage(handler: (msg: PulseMessage) => void) {
    handlers.add(handler)
    pusherHandlers.add(handler)
    return () => {
      handlers.delete(handler)
      pusherHandlers.delete(handler)
    }
  }

  onMounted(() => {
    if (typeof BroadcastChannel !== 'undefined') {
      const ch = new BroadcastChannel(CHANNEL_NAME)
      ch.onmessage = (e) => {
        const msg = e.data as PulseMessage
        handlers.forEach((h) => h(msg))
      }
      channel.value = ch
    }
    ensurePusher()
  })

  onBeforeUnmount(() => {
    channel.value?.close()
    channel.value = null
    handlers.clear()
    // Don't tear down the module-level Pusher socket; other components may still need it.
  })

  return { send, onMessage }
}
