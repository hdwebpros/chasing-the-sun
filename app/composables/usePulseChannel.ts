import type { PulseStyle } from '~/data/twitch'

export type PulseMessage =
  | { type: 'pulse'; text: string; style: PulseStyle; id: number }
  | { type: 'chapter'; id: string }
  | { type: 'progress'; book: number; chapter: number; chapterLabel: string }
  | { type: 'reset' }

const CHANNEL_NAME = 'cts-twitch'

export function usePulseChannel() {
  const channel = ref<BroadcastChannel | null>(null)
  const handlers = new Set<(msg: PulseMessage) => void>()

  function send(msg: PulseMessage) {
    channel.value?.postMessage(msg)
  }

  function onMessage(handler: (msg: PulseMessage) => void) {
    handlers.add(handler)
    return () => handlers.delete(handler)
  }

  onMounted(() => {
    if (typeof BroadcastChannel === 'undefined') return
    const ch = new BroadcastChannel(CHANNEL_NAME)
    ch.onmessage = (e) => {
      const msg = e.data as PulseMessage
      handlers.forEach((h) => h(msg))
    }
    channel.value = ch
  })

  onBeforeUnmount(() => {
    channel.value?.close()
    channel.value = null
    handlers.clear()
  })

  return { send, onMessage }
}
