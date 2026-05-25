#!/usr/bin/env node
// Scans public/images/twitch/<folder>/ and writes app/data/twitch-slideshows.json
// so /twitch can resolve slideshow contents at build time (the runtime API route
// can't read public/ in a Nitro production build — process.cwd() doesn't point
// at the unpacked assets).
//
// Usage: node scripts/extract-twitch-slideshows.mjs

import { readdir, writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SRC = join(ROOT, 'public', 'images', 'twitch')
const OUT = join(ROOT, 'app', 'data', 'twitch-slideshows.json')

const IMG_RE = /\.(png|jpe?g|webp|avif)$/i
const rank = (f) => {
  const ext = f.toLowerCase().split('.').pop()
  return ext === 'avif' ? 0 : ext === 'webp' ? 1 : ext === 'jpg' || ext === 'jpeg' ? 2 : 3
}

const folders = (await readdir(SRC, { withFileTypes: true }))
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort()

const manifest = {}
for (const folder of folders) {
  const files = (await readdir(join(SRC, folder))).filter((f) => IMG_RE.test(f))
  // Dedupe by basename, prefer modern formats
  const byBase = new Map()
  for (const f of files) {
    const base = f.replace(/\.[^.]+$/, '')
    const current = byBase.get(base)
    if (!current || rank(f) < rank(current)) byBase.set(base, f)
  }
  manifest[folder] = [...byBase.values()].sort()
}

await writeFile(OUT, JSON.stringify(manifest, null, 2) + '\n', 'utf8')
console.log(`wrote ${OUT} — ${folders.length} folders, ${Object.values(manifest).reduce((n, a) => n + a.length, 0)} images`)
