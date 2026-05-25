#!/usr/bin/env node
// Extracts every image from the epub into public/images/epub/ and writes a
// per-section manifest at app/data/epub-images.json so the prompter can list
// each chapter's embedded images.
//
// Usage: node scripts/extract-epub-images.mjs [path-to.epub]

import { readdir, readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { execSync } from 'node:child_process'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const EPUB = process.argv[2] || join(ROOT, 'public', 'chasing-the-sun-draft.epub')
const WORK = join(ROOT, '.epub-images-work')
const OUT_IMG = join(ROOT, 'public', 'images', 'epub')
const OUT_MANIFEST = join(ROOT, 'app', 'data', 'epub-images.json')

await rm(WORK, { recursive: true, force: true })
await mkdir(WORK, { recursive: true })
execSync(`unzip -q "${EPUB}" -d "${WORK}"`)

// Find the directory holding sections + images. Try a few common roots.
const candidates = ['GoogleDoc', 'OEBPS', 'EPUB']
let contentDir = null
for (const c of candidates) {
  try {
    const entries = await readdir(join(WORK, c))
    if (entries.some((e) => e.endsWith('.xhtml') || e === 'images')) {
      contentDir = join(WORK, c)
      break
    }
  } catch {}
}
if (!contentDir) throw new Error('Could not find epub content dir (looked for GoogleDoc/OEBPS/EPUB)')

const sections = (await readdir(contentDir))
  .filter((f) => /^section-\d+\.xhtml$/.test(f))
  .sort()

const manifest = {}
const imagesToCopy = new Set()

for (const section of sections) {
  const xhtml = await readFile(join(contentDir, section), 'utf8')
  // Match each <img ...> with optional alt and src attributes
  const imgs = []
  const re = /<img\b[^>]*>/g
  let m
  while ((m = re.exec(xhtml)) !== null) {
    const tag = m[0]
    const srcMatch = tag.match(/\bsrc="([^"]+)"/)
    if (!srcMatch) continue
    const altMatch = tag.match(/\balt="([^"]+)"/)
    const fileName = basename(srcMatch[1])
    imagesToCopy.add(srcMatch[1])
    imgs.push({ src: fileName, alt: altMatch?.[1] ?? '' })
  }
  if (imgs.length) manifest[section] = imgs
}

await rm(OUT_IMG, { recursive: true, force: true })
await mkdir(OUT_IMG, { recursive: true })

for (const rel of imagesToCopy) {
  const from = join(contentDir, rel)
  const to = join(OUT_IMG, basename(rel))
  await writeFile(to, await readFile(from))
}

await writeFile(OUT_MANIFEST, JSON.stringify(manifest, null, 2) + '\n', 'utf8')
await rm(WORK, { recursive: true, force: true })

const totalImgs = Object.values(manifest).reduce((sum, arr) => sum + arr.length, 0)
console.log(`Extracted ${totalImgs} image(s) across ${Object.keys(manifest).length} section(s)`)
console.log(`  → ${OUT_IMG}`)
console.log(`  → ${OUT_MANIFEST}`)
