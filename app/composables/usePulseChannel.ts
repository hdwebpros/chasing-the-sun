import type { PulseStyle } from '~/data/twitch'

export type PulseMessage =
  | { type: 'pulse'; text: string; style: PulseStyle; id: number }
  | { type: 'image'; src: string; id: number }
  | { type: 'chapter'; id: string }
  | { type: 'progress'; book: number; chapter: number; chapterLabel: string }
  | { type: 'reset' }

const CHANNEL_NAME = 'cts-twitch'
// Public MQTT broker — no signup. Anyone subscribed to the same topic gets the messages,
// so the topic includes a salt to keep randos out. If you ever need real privacy, swap for
// a hosted broker with auth.
const MQTT_URL = 'wss://broker.emqx.io:8084/mqtt'
const TOPIC = 'cts-twitch/2026-chasing-the-sun-9f3a'

let mqttClient: any = null
const mqttHandlers = new Set<(msg: PulseMessage) => void>()
let mqttReady: Promise<any> | null = null

async function ensureMqtt() {
  if (mqttClient) return mqttClient
  if (mqttReady) return mqttReady
  mqttReady = (async () => {
    const mqtt = await import('mqtt')
    const client = mqtt.default.connect(MQTT_URL, {
      clientId: `cts-${Math.random().toString(36).slice(2, 10)}`,
      reconnectPeriod: 2000,
    })
    client.on('connect', () => client.subscribe(TOPIC))
    client.on('message', (_topic: string, payload: Uint8Array) => {
      try {
        const msg = JSON.parse(new TextDecoder().decode(payload)) as PulseMessage
        mqttHandlers.forEach((h) => h(msg))
      } catch (e) {
        console.warn('bad mqtt payload', e)
      }
    })
    client.on('error', (e: unknown) => console.warn('mqtt error', e))
    mqttClient = client
    return client
  })()
  return mqttReady
}

function mqttPublish(msg: PulseMessage) {
  ensureMqtt().then((client) => {
    try {
      client.publish(TOPIC, JSON.stringify(msg))
    } catch (e) {
      console.warn('mqtt publish failed', e)
    }
  })
}

export function usePulseChannel() {
  const channel = ref<BroadcastChannel | null>(null)
  const handlers = new Set<(msg: PulseMessage) => void>()

  function send(msg: PulseMessage) {
    channel.value?.postMessage(msg)
    mqttPublish(msg)
  }

  function onMessage(handler: (msg: PulseMessage) => void) {
    handlers.add(handler)
    mqttHandlers.add(handler)
    return () => {
      handlers.delete(handler)
      mqttHandlers.delete(handler)
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
    ensureMqtt()
  })

  onBeforeUnmount(() => {
    channel.value?.close()
    channel.value = null
    handlers.clear()
    // Leave the module-level MQTT socket open; other components may still use it.
  })

  return { send, onMessage }
}
