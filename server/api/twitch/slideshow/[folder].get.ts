import { readdir } from 'node:fs/promises'
import { join } from 'node:path'

export default defineEventHandler(async (event) => {
  const folder = getRouterParam(event, 'folder') ?? ''
  if (!/^[a-z0-9_-]+$/i.test(folder)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid folder' })
  }

  const dir = join(process.cwd(), 'public', 'images', 'twitch', folder)
  try {
    const files = await readdir(dir)
    const images = files.filter((f) => /\.(png|jpe?g|webp|avif)$/i.test(f))

    // Dedupe by basename, preferring modern formats: avif > webp > jpg/jpeg > png
    const rank = (f: string) => {
      const ext = f.toLowerCase().split('.').pop()
      return ext === 'avif' ? 0 : ext === 'webp' ? 1 : ext === 'jpg' || ext === 'jpeg' ? 2 : 3
    }
    const byBase = new Map<string, string>()
    for (const f of images) {
      const base = f.replace(/\.[^.]+$/, '')
      const current = byBase.get(base)
      if (!current || rank(f) < rank(current)) byBase.set(base, f)
    }
    return [...byBase.values()].sort()
  } catch {
    return []
  }
})
