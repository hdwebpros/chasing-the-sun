#!/usr/bin/env node
// Usage:
//   node scripts/optimize-twitch-images.mjs           # encode .png → .webp, keep originals
//   node scripts/optimize-twitch-images.mjs --delete  # also remove the .png after encoding
//   node scripts/optimize-twitch-images.mjs ch7       # restrict to one folder

import { readdir, stat, unlink } from 'node:fs/promises'
import { join, parse } from 'node:path'
import sharp from 'sharp'

const ROOT = new URL('../public/images/twitch/', import.meta.url).pathname
const QUALITY = 82

const args = process.argv.slice(2)
const deleteOriginals = args.includes('--delete')
const onlyFolder = args.find((a) => !a.startsWith('--'))

const fmt = (n) => (n / 1024 / 1024).toFixed(2) + ' MB'

async function processFolder(folder) {
  const dir = join(ROOT, folder)
  const files = (await readdir(dir)).filter((f) => /\.png$/i.test(f))
  if (!files.length) return null

  let pngTotal = 0
  let webpTotal = 0
  console.log(`\n[${folder}] ${files.length} PNG(s)`)

  for (const file of files) {
    const src = join(dir, file)
    const dest = join(dir, parse(file).name + '.webp')

    const srcSize = (await stat(src)).size
    pngTotal += srcSize

    await sharp(src).webp({ quality: QUALITY, effort: 5 }).toFile(dest)
    const destSize = (await stat(dest)).size
    webpTotal += destSize

    const pct = ((1 - destSize / srcSize) * 100).toFixed(1)
    console.log(`  ${file}: ${fmt(srcSize)} → ${fmt(destSize)} (-${pct}%)`)

    if (deleteOriginals) await unlink(src)
  }

  const pct = ((1 - webpTotal / pngTotal) * 100).toFixed(1)
  console.log(`  TOTAL: ${fmt(pngTotal)} → ${fmt(webpTotal)} (-${pct}%)`)
  return { pngTotal, webpTotal }
}

const folders = onlyFolder
  ? [onlyFolder]
  : (await readdir(ROOT)).filter(async (f) => (await stat(join(ROOT, f))).isDirectory())

let grandPng = 0
let grandWebp = 0
for (const folder of folders) {
  const r = await processFolder(folder)
  if (r) { grandPng += r.pngTotal; grandWebp += r.webpTotal }
}

if (folders.length > 1 && grandPng) {
  const pct = ((1 - grandWebp / grandPng) * 100).toFixed(1)
  console.log(`\nGRAND TOTAL: ${fmt(grandPng)} → ${fmt(grandWebp)} (-${pct}%)`)
}
if (!deleteOriginals) console.log('\n(PNGs kept. Rerun with --delete to remove them once you\'re happy.)')
