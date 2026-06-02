#!/usr/bin/env node
// Surgically edit an existing /twitch slideshow image with Nano Banana (Gemini image-to-image).
//
// Imagen 4 is text-to-image only and cannot edit an existing image — only the Gemini
// image models can. This script feeds an existing image back in plus an edit instruction
// and writes the edited result, so the rest of the composition is preserved.
//
// Usage:
//   node scripts/edit-twitch-image.mjs ch20 1 "Change the shop name on the window to 'Wm. Boog'."
//   node scripts/edit-twitch-image.mjs ch20 12 "Remove the hat from the man's head." --src /tmp/ch20-orig/ch20_12.webp
//   node scripts/edit-twitch-image.mjs ch20 1 "..." --model gemini-3-pro-image-preview
//
// After this, run:
//   node scripts/optimize-twitch-images.mjs <chapter> --delete   # PNG -> WebP (overwrites slot)
//   node scripts/extract-twitch-slideshows.mjs                   # rebuild manifest
//
// Auth: reads the API key from .env (NUXT_PUBLIC_AI_STUDIO_KEY or GEMINI_API_KEY).

import { readFile, writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { GoogleGenAI } from '@google/genai'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const MODEL = 'gemini-2.5-flash-image'   // Nano Banana (cheap). Override with --model.
const ASPECT = '16:9'
const SIZE = '2K'

// --- args -------------------------------------------------------------------
const args = process.argv.slice(2)
const positionals = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1] === '--model') && !(i > 0 && args[i - 1] === '--src'))
const chapter = positionals[0]
const num = positionals[1]
const editPrompt = positionals[2]
const modelArg = args.includes('--model') ? args[args.indexOf('--model') + 1] : null
const model = modelArg || MODEL
const srcArg = args.includes('--src') ? args[args.indexOf('--src') + 1] : null

if (!chapter || !num || !editPrompt) {
  console.error('Usage: node scripts/edit-twitch-image.mjs <chapter> <num> "<edit instruction>" [--src <path>] [--model <id>]')
  process.exit(1)
}

const pad = String(num).padStart(2, '0')
const outDir = join(ROOT, 'public', 'images', 'twitch', chapter)
const srcPath = srcArg || join(outDir, `${chapter}_${pad}.webp`)
const destPath = join(outDir, `${chapter}_${pad}.png`)

// Keep the edited frame consistent with the rest of the slideshow.
const STYLE_GUARD = 'Keep the existing photograph exactly as it is — same composition, framing, lighting, colors, grain and sun-faded vintage look — and change ONLY what is described below. Do not add any new text, border, or watermark.'

async function loadKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY
  const env = await readFile(join(ROOT, '.env'), 'utf8')
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*(NUXT_PUBLIC_AI_STUDIO_KEY|GEMINI_API_KEY|GOOGLE_API_KEY)\s*=\s*(.+?)\s*$/)
    if (m) return m[2].replace(/^["']|["']$/g, '')
  }
  throw new Error('No API key. Set GEMINI_API_KEY or NUXT_PUBLIC_AI_STUDIO_KEY in .env')
}

function mimeFor(path) {
  if (path.endsWith('.png')) return 'image/png'
  if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg'
  return 'image/webp'
}

const ai = new GoogleGenAI({ apiKey: await loadKey() })
const imageB64 = (await readFile(srcPath)).toString('base64')
const prompt = `${STYLE_GUARD}\n\nEdit: ${editPrompt}`

console.log(`\nEditing ${chapter}_${pad} · model ${model}\n  src: ${srcPath}\n  edit: ${editPrompt}\n`)

for (let attempt = 1; attempt <= 3; attempt++) {
  try {
    const res = await ai.models.generateContent({
      model,
      contents: [
        { inlineData: { mimeType: mimeFor(srcPath), data: imageB64 } },
        { text: prompt },
      ],
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
    await writeFile(destPath, Buffer.from(img.inlineData.data, 'base64'))
    console.log(`  ✓ wrote ${destPath}`)
    console.log(`\nNext:\n  node scripts/optimize-twitch-images.mjs ${chapter} --delete\n  node scripts/extract-twitch-slideshows.mjs`)
    process.exit(0)
  } catch (err) {
    console.warn(`  … attempt ${attempt} failed: ${err?.message || err}`)
    if (attempt === 3) { console.error('  ✗ GAVE UP'); process.exit(1) }
    await new Promise((r) => setTimeout(r, 2000 * attempt))
  }
}
