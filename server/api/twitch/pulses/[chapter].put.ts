import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

interface PulseInput {
  phrase: string
  pulse: string
  style?: 'flash' | 'stamp' | 'whisper'
}

// Dev-only: rewrites the pulses array for a single chapter in app/data/twitch.ts
export default defineEventHandler(async (event) => {
  if (process.env.NODE_ENV === 'production') {
    throw createError({ statusCode: 403, statusMessage: 'editing disabled in production' })
  }

  const chapterId = getRouterParam(event, 'chapter') ?? ''
  if (!/^[a-z0-9_-]+$/i.test(chapterId)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid chapter id' })
  }

  const body = await readBody<{ pulses?: PulseInput[] }>(event)
  const pulses = Array.isArray(body?.pulses) ? body!.pulses! : null
  if (!pulses) {
    throw createError({ statusCode: 400, statusMessage: 'pulses array required' })
  }

  // Validate entries
  for (const p of pulses) {
    if (typeof p.phrase !== 'string' || typeof p.pulse !== 'string') {
      throw createError({ statusCode: 400, statusMessage: 'each pulse needs phrase + pulse strings' })
    }
    if (p.style && !['flash', 'stamp', 'whisper'].includes(p.style)) {
      throw createError({ statusCode: 400, statusMessage: 'invalid style' })
    }
  }

  const filePath = join(process.cwd(), 'app', 'data', 'twitch.ts')
  const original = await readFile(filePath, 'utf8')

  // Locate the chapter's pulses block:
  //   {chapterId}: { ... pulses: [\n  ...entries...\n    ],
  // Indents are stable: chapter at 2-space, pulses keyword at 4-space, entries at 6-space, closing at 4-space.
  const esc = chapterId.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
  const re = new RegExp(
    `(^  ${esc}: \\{[\\s\\S]*?^    pulses: \\[\\n)([\\s\\S]*?)(^    \\],)`,
    'm',
  )
  const match = original.match(re)
  if (!match) {
    throw createError({ statusCode: 404, statusMessage: `chapter '${chapterId}' not found in twitch.ts` })
  }

  const serialized = pulses.map(serializePulse).join('\n')
  const replacement = match[1] + (serialized ? serialized + '\n' : '') + match[3]
  const updated = original.replace(re, replacement)

  await writeFile(filePath, updated, 'utf8')
  return { ok: true, count: pulses.length }
})

function quoteString(s: string): string {
  const hasSingle = /'/.test(s)
  const hasDouble = /"/.test(s)
  if (!hasSingle) return `'${s.replace(/\\/g, '\\\\')}'`
  if (!hasDouble) return `"${s.replace(/\\/g, '\\\\')}"`
  return JSON.stringify(s)
}

function serializePulse(p: PulseInput): string {
  const parts = [`phrase: ${quoteString(p.phrase)}`, `pulse: ${quoteString(p.pulse)}`]
  if (p.style && p.style !== 'flash') parts.push(`style: '${p.style}'`)
  return `      { ${parts.join(', ')} },`
}
