import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

interface PulseOutput {
  phrase: string
  pulse: string
  style?: 'flash' | 'stamp' | 'whisper'
}

// Reads pulses for a single chapter directly from app/data/twitch.ts on disk.
// Used by /prompter on chapter change so it always sees the latest persisted
// state (the static import is module-cached by Vite and goes stale after PUT).
export default defineEventHandler(async (event) => {
  const chapterId = getRouterParam(event, 'chapter') ?? ''
  if (!/^[a-z0-9_-]+$/i.test(chapterId)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid chapter id' })
  }

  const filePath = join(process.cwd(), 'app', 'data', 'twitch.ts')
  const source = await readFile(filePath, 'utf8')

  const esc = chapterId.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
  const re = new RegExp(
    `^  ${esc}: \\{[\\s\\S]*?^    pulses: \\[\\n([\\s\\S]*?)^    \\],`,
    'm',
  )
  const match = source.match(re)
  if (!match) {
    throw createError({ statusCode: 404, statusMessage: `chapter '${chapterId}' not found` })
  }

  const pulses: PulseOutput[] = []
  const lineRe = /\{\s*phrase:\s*(?<phrase>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'),\s*pulse:\s*(?<pulse>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')(?:,\s*style:\s*'(?<style>flash|stamp|whisper)')?\s*\}/g
  let m: RegExpExecArray | null
  while ((m = lineRe.exec(match[1])) !== null) {
    const entry: PulseOutput = {
      phrase: unquote(m.groups!.phrase),
      pulse: unquote(m.groups!.pulse),
    }
    if (m.groups!.style) entry.style = m.groups!.style as PulseOutput['style']
    pulses.push(entry)
  }

  return { pulses }
})

function unquote(s: string): string {
  const quote = s[0]
  const inner = s.slice(1, -1)
  if (quote === '"') {
    // Could be JSON-stringified or simple double-quoted with \\
    try {
      return JSON.parse(s)
    } catch {
      return inner.replace(/\\\\/g, '\\')
    }
  }
  return inner.replace(/\\\\/g, '\\')
}
