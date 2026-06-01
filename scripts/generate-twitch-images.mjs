#!/usr/bin/env node
// Generate /twitch slideshow backgrounds with Nano Banana (Gemini image model).
//
// Reads a per-chapter prompt file at scripts/prompts/<chapter>.json:
//   { "style": "<shared style block applied to every image>",
//     "scenes": ["scene 1 prompt", "scene 2 prompt", ...] }
// and writes PNGs to public/images/twitch/<chapter>/<chapter>_NN.png.
//
// After this, run:
//   node scripts/optimize-twitch-images.mjs <chapter> --delete   # PNG -> WebP
//   node scripts/extract-twitch-slideshows.mjs                   # rebuild manifest
//
// Usage:
//   node scripts/generate-twitch-images.mjs ch18                 # all scenes, skip existing
//   node scripts/generate-twitch-images.mjs ch18 --force         # regenerate all
//   node scripts/generate-twitch-images.mjs ch18 --only 3,7      # just scenes 3 and 7
//
// Auth: reads the API key from .env (NUXT_PUBLIC_AI_STUDIO_KEY or GEMINI_API_KEY).

import { readFile, writeFile, mkdir, access } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { GoogleGenAI } from '@google/genai'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// Nano Banana Pro. Swap to 'gemini-2.5-flash-image' for the cheaper standard model.
const MODEL = 'gemini-3-pro-image-preview'
const ASPECT = '16:9'   // slideshow is full-screen landscape (object-cover)
const SIZE = '2K'       // 1K | 2K | 4K — 2K is plenty for a background, keeps cost down

// --- args -------------------------------------------------------------------
const args = process.argv.slice(2)
const chapter = args.find((a) => !a.startsWith('--'))
const force = args.includes('--force')
const onlyArg = args[args.indexOf('--only') + 1]
const only = args.includes('--only') && onlyArg
  ? new Set(onlyArg.split(',').map((n) => parseInt(n, 10)))
  : null

if (!chapter) {
  console.error('Usage: node scripts/generate-twitch-images.mjs <chapter> [--force] [--only 3,7]')
  process.exit(1)
}

// --- api key (from .env, no extra deps) -------------------------------------
async function loadKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY
  try {
    const env = await readFile(join(ROOT, '.env'), 'utf8')
    for (const line of env.split('\n')) {
      const m = line.match(/^\s*(NUXT_PUBLIC_AI_STUDIO_KEY|GEMINI_API_KEY|GOOGLE_API_KEY)\s*=\s*(.+?)\s*$/)
      if (m) return m[2].replace(/^["']|["']$/g, '')
    }
  } catch {}
  throw new Error('No API key. Set GEMINI_API_KEY or NUXT_PUBLIC_AI_STUDIO_KEY in .env')
}

const exists = (p) => access(p).then(() => true, () => false)

async function generateOne(ai, prompt, dest, label) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          responseModalities: ['Image'],
          imageConfig: { aspectRatio: ASPECT, imageSize: SIZE },
        },
      })
      const parts = res?.candidates?.[0]?.content?.parts ?? []
      const img = parts.find((p) => p.inlineData?.data)
      if (!img) {
        const text = parts.find((p) => p.text)?.text
        throw new Error(`no image in response${text ? ` (model said: ${text.slice(0, 200)})` : ''}`)
      }
      await writeFile(dest, Buffer.from(img.inlineData.data, 'base64'))
      console.log(`  ✓ ${label}`)
      return true
    } catch (err) {
      const msg = err?.message || String(err)
      console.warn(`  … ${label} attempt ${attempt} failed: ${msg}`)
      if (attempt === 3) { console.error(`  ✗ ${label} GAVE UP`); return false }
      await new Promise((r) => setTimeout(r, 2000 * attempt))
    }
  }
}

// --- main -------------------------------------------------------------------
const promptsPath = join(ROOT, 'scripts', 'prompts', `${chapter}.json`)
let spec
try {
  spec = JSON.parse(await readFile(promptsPath, 'utf8'))
} catch {
  console.error(`Missing or invalid prompt file: ${promptsPath}`)
  process.exit(1)
}
const { style = '', scenes = [] } = spec
if (!scenes.length) { console.error('No scenes in prompt file.'); process.exit(1) }

const ai = new GoogleGenAI({ apiKey: await loadKey() })
const outDir = join(ROOT, 'public', 'images', 'twitch', chapter)
await mkdir(outDir, { recursive: true })

console.log(`\n${chapter}: ${scenes.length} scenes · model ${MODEL} · ${ASPECT} ${SIZE}\n`)
let ok = 0, skipped = 0
for (let i = 0; i < scenes.length; i++) {
  const n = i + 1
  if (only && !only.has(n)) continue
  const dest = join(outDir, `${chapter}_${String(n).padStart(2, '0')}.png`)
  if (!force && (await exists(dest))) { console.log(`  - ${chapter}_${String(n).padStart(2, '0')} exists (skip)`); skipped++; continue }
  const prompt = `${style}\n\nScene: ${scenes[i]}`.trim()
  if (await generateOne(ai, prompt, dest, `${chapter}_${String(n).padStart(2, '0')}`)) ok++
}

console.log(`\nDone: ${ok} generated, ${skipped} skipped.`)
console.log(`Next:\n  node scripts/optimize-twitch-images.mjs ${chapter} --delete\n  node scripts/extract-twitch-slideshows.mjs`)
