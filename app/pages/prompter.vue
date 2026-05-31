<script setup lang="ts">
import { TWITCH_CHAPTERS, type TwitchChapter, type Pulse, type PulseStyle } from '~/data/twitch'
import epubImageManifest from '~/data/epub-images.json'

type EpubImage = { src: string; alt: string }
const manifest = epubImageManifest as Record<string, EpubImage[]>

definePageMeta({ layout: false })

useHead({
  title: 'Prompter — Chasing the Sun',
})

const { rendition, toc, currentChapter, currentChapterLabel, progress, chapterProgress, isLoading, loadBook, goToChapter, next, prev, destroy } = useBook()
const { mode, theme, cycleMode } = useReaderTheme()
const { send } = usePulseChannel()

const readerEl = ref<HTMLElement | null>(null)
const tocOpen = ref(false)

// Pulse state
const pulseIdx = ref(0)
const firedIds = ref<Set<number>>(new Set())

// Match the epubjs href (which can include fragments) against our chapter map
const activeChapter = computed<TwitchChapter | null>(() => {
  const href = currentChapter.value
  if (!href) return null
  const base = href.split('#')[0]
  for (const c of Object.values(TWITCH_CHAPTERS)) {
    if (base?.includes(c.epubHref)) return c
  }
  return null
})

// Editable local copy of pulses; persisted to twitch.ts via PUT when changed
const pulses = ref<Pulse[]>([])
const currentPulse = computed(() => pulses.value[pulseIdx.value] ?? null)
const nextPulse = computed(() => pulses.value[pulseIdx.value + 1] ?? null)

// In dev, fetch fresh from /api so deletes/edits survive page refresh (the
// static `c.pulses` import is module-cached by Vite and goes stale after PUT).
// In prod, the source file isn't on disk for the API to read — just use the
// static import, which IS the deployed source of truth.
async function loadPulsesForChapter(c: TwitchChapter): Promise<Pulse[]> {
  if (!import.meta.dev) return c.pulses.map((p) => ({ ...p }))
  try {
    const res = await $fetch<{ pulses: Pulse[] }>(`/api/twitch/pulses/${c.id}`)
    return res.pulses ?? []
  } catch (e) {
    console.warn('Falling back to static pulses for', c.id, e)
    return c.pulses.map((p) => ({ ...p }))
  }
}

// When chapter changes, sync the twitch view + reset pulse pointer + reload editable pulses
watch(activeChapter, async (c, prev) => {
  if (!c) {
    pulses.value = []
    return
  }
  if (c.id !== prev?.id) {
    pulses.value = await loadPulsesForChapter(c)
    pulseIdx.value = 0
    firedIds.value = new Set()
    clearSelection()
    send({ type: 'chapter', id: c.id })
    refreshHighlights()
  }
}, { immediate: true })

// Auto-derived list of images embedded in the current chapter's xhtml
const chapterImages = computed<EpubImage[]>(() => {
  const c = activeChapter.value
  if (!c) return []
  return manifest[c.epubHref] ?? []
})

// Selection composer state
const selectedText = ref('')
const composerPhrase = ref('')
const composerPulse = ref('')
const composerStyle = ref<PulseStyle>('flash')
const savingPulses = ref(false)
const saveError = ref('')

function clearSelection() {
  selectedText.value = ''
  composerPhrase.value = ''
  composerPulse.value = ''
  composerStyle.value = 'flash'
}

// Convert selection → suggested pulse text (uppercase for stamp, plain otherwise)
function suggestPulseText(text: string, style: PulseStyle): string {
  const trimmed = text.trim().replace(/\s+/g, ' ')
  return style === 'stamp' ? trimmed.toUpperCase() : trimmed
}

watch(composerStyle, (style) => {
  // Re-suggest pulse text when style changes, but only if user hasn't customized
  if (!composerPulse.value || composerPulse.value === suggestPulseText(selectedText.value, style === 'stamp' ? 'flash' : 'stamp')) {
    composerPulse.value = suggestPulseText(selectedText.value, style)
  }
})

async function persistPulses() {
  const c = activeChapter.value
  if (!c) return
  savingPulses.value = true
  saveError.value = ''
  try {
    await $fetch(`/api/twitch/pulses/${c.id}`, {
      method: 'PUT',
      body: { pulses: pulses.value },
    })
  } catch (e: any) {
    saveError.value = e?.statusMessage || e?.message || 'save failed'
    console.error('Failed to persist pulses', e)
  } finally {
    savingPulses.value = false
  }
}

function removePulse(i: number) {
  pulses.value.splice(i, 1)
  // Adjust pulseIdx / firedIds to keep them sensible
  if (pulseIdx.value > i) pulseIdx.value--
  const newFired = new Set<number>()
  firedIds.value.forEach((idx) => {
    if (idx < i) newFired.add(idx)
    else if (idx > i) newFired.add(idx - 1)
  })
  firedIds.value = newFired
  persistPulses()
}

// Reading-order insertion: look up each pulse's phrase in the chapter text
// and slot the new entry at the right position. Falls back to append if the
// phrase can't be found (e.g. user-edited beyond the original selection).
function chapterText(): string {
  const r = rendition.value as any
  const contents = r?.getContents?.() ?? []
  return contents[0]?.document?.body?.textContent ?? ''
}

function norm(s: string): string {
  return s
    .replace(/[‘’‛`]/g, "'")
    .replace(/[“”„]/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function findInsertionIndex(searchText: string): number {
  const text = norm(chapterText())
  if (!text) return pulses.value.length
  const newPos = text.indexOf(norm(searchText))
  if (newPos < 0) return pulses.value.length

  for (let i = 0; i < pulses.value.length; i++) {
    const pos = text.indexOf(norm(pulses.value[i].phrase))
    if (pos < 0) continue
    if (pos > newPos) return i
  }
  return pulses.value.length
}

// Highlight queued phrases inside the epub iframe so they're easy to spot while reading.
// Wraps each pulse phrase in <mark class="pulse-highlight"> and tags current/fired state.
function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getDocs(): Document[] {
  const r = rendition.value as any
  const contents = r?.getContents?.() ?? []
  return contents.map((c: any) => c?.document).filter(Boolean)
}

function injectHighlightStyles(doc: Document) {
  if (doc.getElementById('pulse-highlight-style')) return
  const style = doc.createElement('style')
  style.id = 'pulse-highlight-style'
  style.textContent = `
    mark.pulse-highlight {
      background: rgba(212, 165, 116, 0.28);
      color: inherit;
      font-size: 1.1em;
      font-weight: 600;
      padding: 0.05em 0.2em;
      border-radius: 0.2em;
      transition: background 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease;
    }
    mark.pulse-highlight.pulse-current {
      background: rgba(212, 165, 116, 0.6);
      box-shadow: 0 0 0 2px rgba(212, 165, 116, 0.55);
    }
    mark.pulse-highlight.pulse-fired {
      opacity: 0.4;
    }
  `
  doc.head.appendChild(style)
}

function clearHighlights(doc: Document) {
  doc.querySelectorAll('mark.pulse-highlight').forEach((el) => {
    const parent = el.parentNode
    if (!parent) return
    while (el.firstChild) parent.insertBefore(el.firstChild, el)
    parent.removeChild(el)
  })
  doc.body?.normalize?.()
}

function wrapPhrase(doc: Document, phrase: string, index: number) {
  const target = norm(phrase)
  if (!target) return
  // Quote-tolerant: straight ' / " in the target match either straight or
  // curly variants in the source text. Whitespace is already \s+ between words.
  const escaped = target
    .split(' ')
    .map((w) =>
      escapeRegex(w)
        .replace(/'/g, "['‘’′ʼ]")
        .replace(/"/g, '["“”„″]')
        .replace(/-/g, '[-‐‑‒–—−]'),
    )
    .join('\\s+')
  const re = new RegExp(escaped, 'i')

  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      const el = (node as Text).parentElement
      if (!el) return NodeFilter.FILTER_REJECT
      if (el.closest('mark.pulse-highlight, script, style')) return NodeFilter.FILTER_REJECT
      return NodeFilter.FILTER_ACCEPT
    },
  } as any)

  const nodes: Text[] = []
  let n: Node | null
  while ((n = walker.nextNode())) nodes.push(n as Text)

  for (const textNode of nodes) {
    const m = textNode.data.match(re)
    if (!m || m.index === undefined) continue

    const before = textNode.data.slice(0, m.index)
    const match = textNode.data.slice(m.index, m.index + m[0].length)
    const after = textNode.data.slice(m.index + m[0].length)

    const mark = doc.createElement('mark')
    mark.className = 'pulse-highlight'
    mark.dataset.pulseIdx = String(index)
    mark.textContent = match

    const parent = textNode.parentNode
    if (!parent) continue
    if (before) parent.insertBefore(doc.createTextNode(before), textNode)
    parent.insertBefore(mark, textNode)
    if (after) parent.insertBefore(doc.createTextNode(after), textNode)
    parent.removeChild(textNode)
    return
  }
}

function applyPulseStates(doc: Document) {
  doc.querySelectorAll('mark.pulse-highlight').forEach((el) => {
    const idx = parseInt((el as HTMLElement).dataset.pulseIdx ?? '-1', 10)
    el.classList.toggle('pulse-current', idx === pulseIdx.value)
    el.classList.toggle('pulse-fired', firedIds.value.has(idx))
  })
}

function refreshHighlights() {
  for (const doc of getDocs()) {
    injectHighlightStyles(doc)
    clearHighlights(doc)
    pulses.value.forEach((p, i) => wrapPhrase(doc, p.phrase, i))
    applyPulseStates(doc)
  }
}

function refreshPulseStates() {
  getDocs().forEach(applyPulseStates)
}

watch(pulses, () => refreshHighlights(), { deep: true })
watch([pulseIdx, firedIds], () => refreshPulseStates(), { deep: true })

function addPulseFromComposer() {
  const phrase = composerPhrase.value.trim()
  const pulse = composerPulse.value.trim()
  if (!phrase || !pulse) return
  const entry: Pulse = { phrase, pulse }
  if (composerStyle.value !== 'flash') entry.style = composerStyle.value

  const insertIdx = findInsertionIndex(selectedText.value || phrase)
  pulses.value.splice(insertIdx, 0, entry)

  // Shift pulseIdx + firedIds so they keep pointing at the same logical pulses
  if (pulseIdx.value >= insertIdx) pulseIdx.value++
  const newFired = new Set<number>()
  firedIds.value.forEach((idx) => newFired.add(idx >= insertIdx ? idx + 1 : idx))
  firedIds.value = newFired

  clearSelection()
  persistPulses()
}

function openComposer(text: string) {
  selectedText.value = text
  composerPhrase.value = text.trim().replace(/\s+/g, ' ')
  composerPulse.value = suggestPulseText(text, composerStyle.value)
}

let pulseCounterImg = 0
function fireImage(img: EpubImage) {
  pulseCounterImg++
  send({ type: 'image', src: `/images/epub/${img.src}`, id: pulseCounterImg + 100000 })
}

// Stream reading progress to /twitch
watch([progress, chapterProgress, currentChapterLabel], ([book, chapter, label]) => {
  send({ type: 'progress', book, chapter, chapterLabel: label })
})

let pulseCounter = 0

function firePulse() {
  const p = currentPulse.value
  if (!p) return
  pulseCounter++
  send({
    type: 'pulse',
    text: p.pulse,
    style: p.style ?? 'flash',
    id: pulseCounter,
  })
  firedIds.value.add(pulseIdx.value)
  if (pulseIdx.value < pulses.value.length - 1) {
    pulseIdx.value++
  }
}

function jumpToPulse(i: number) {
  pulseIdx.value = i
}

function fireAt(i: number) {
  pulseIdx.value = i
  firePulse()
}

function resetPulses() {
  pulseIdx.value = 0
  firedIds.value = new Set()
  send({ type: 'reset' })
}

function handleKeydown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA') return

  if (e.key === ' ' || e.key === 'Tab') {
    e.preventDefault()
    firePulse()
  } else if (e.key === 'ArrowRight') {
    next()
  } else if (e.key === 'ArrowLeft') {
    prev()
  } else if (e.key === 'r' && (e.metaKey || e.ctrlKey)) {
    return // let browser reload
  }
}

onMounted(async () => {
  if (readerEl.value) {
    // ?epub=from-drive loads the Drive-regenerated build for local comparison.
    const epubUrl = useRoute().query.epub === 'from-drive'
      ? '/chasing-the-sun-from-drive.epub'
      : undefined
    await loadBook(readerEl.value, epubUrl)
  }
  window.addEventListener('keydown', handleKeydown)

  // Listen for text selection in the epub iframe; open composer with the text.
  // Also re-apply highlights every time a new section/page renders.
  watch(rendition, (r) => {
    if (!r) return
    r.on('selected', (_cfiRange: string, contents: any) => {
      const sel = contents?.window?.getSelection?.()
      const text = sel?.toString?.() ?? ''
      if (text.trim().length >= 3) openComposer(text)
    })
    r.on('rendered', () => {
      // Tiny delay so epub.js finishes its own DOM work first
      setTimeout(refreshHighlights, 50)
    })
  }, { immediate: true })
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  destroy()
})

function selectChapter(href: string) {
  goToChapter(href)
  tocOpen.value = false
}

const themeIcon = computed(() => {
  switch (mode.value) {
    case 'dark': return 'lucide:moon'
    case 'light': return 'lucide:sun'
    case 'sepia': return 'lucide:coffee'
  }
})
</script>

<template>
  <div
    class="h-dvh flex flex-col transition-colors duration-300"
    :style="{ background: theme.pageBg }"
  >
    <!-- Top bar -->
    <header
      class="border-b backdrop-blur-md shrink-0"
      :style="{ background: theme.headerBg, borderColor: theme.borderColor }"
    >
      <div class="flex items-center justify-between px-4 h-14">
        <div class="flex items-center gap-3">
          <Sheet v-model:open="tocOpen">
            <SheetTrigger as-child>
              <Button variant="ghost" size="icon" class="cursor-pointer" :style="{ color: theme.mutedColor }">
                <Icon name="lucide:list" class="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              class="w-80 p-0"
              :style="{ background: theme.pageBg, borderColor: theme.borderColor }"
            >
              <SheetHeader class="px-6 pt-6 pb-4">
                <SheetTitle :style="{ color: theme.headingColor }">Table of Contents</SheetTitle>
                <SheetDescription :style="{ color: theme.mutedColor }">Jump to a chapter</SheetDescription>
              </SheetHeader>
              <ScrollArea class="h-[calc(100dvh-7rem)] px-2">
                <nav class="py-3">
                  <template v-for="item in toc" :key="item.id">
                    <button
                      class="w-full text-left px-4 py-2 rounded-md text-sm cursor-pointer"
                      :style="currentChapter === item.href ? { color: theme.headingColor } : { color: theme.mutedColor }"
                      @click="selectChapter(item.href)"
                    >
                      {{ item.label }}
                    </button>
                    <button
                      v-for="sub in item.subitems"
                      :key="sub.id"
                      class="w-full text-left pl-8 pr-4 py-1.5 rounded-md text-sm cursor-pointer"
                      :style="currentChapter === sub.href ? { color: theme.headingColor } : { color: theme.mutedColor }"
                      @click="selectChapter(sub.href)"
                    >
                      {{ sub.label }}
                    </button>
                  </template>
                </nav>
              </ScrollArea>
            </SheetContent>
          </Sheet>

          <NuxtLink to="/">
            <Button variant="ghost" size="icon" class="cursor-pointer" :style="{ color: theme.mutedColor }">
              <Icon name="lucide:home" class="h-4 w-4" />
            </Button>
          </NuxtLink>

          <a :href="activeChapter ? `/twitch?chapter=${activeChapter.id}` : '/twitch'" target="_blank" rel="noopener">
            <Button variant="ghost" size="sm" class="cursor-pointer gap-2" :style="{ color: theme.mutedColor }">
              <Icon name="lucide:external-link" class="h-4 w-4" />
              Open /twitch
            </Button>
          </a>
        </div>

        <span class="text-sm truncate hidden sm:block" :style="{ color: theme.mutedColor }">
          {{ currentChapterLabel }}
        </span>

        <div class="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            class="cursor-pointer"
            :style="{ color: theme.mutedColor }"
            :title="`Theme: ${mode}`"
            @click="cycleMode"
          >
            <Icon :name="themeIcon" class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>

    <!-- Loading -->
    <div
      v-if="isLoading"
      class="fixed inset-0 z-50 flex items-center justify-center"
      :style="{ background: theme.pageBg }"
    >
      <div
        class="w-10 h-10 border-2 rounded-full animate-spin"
        :style="{ borderColor: `${theme.headingColor}33`, borderTopColor: theme.headingColor }"
      />
    </div>

    <!-- Main: reader (left) + pulse panel (right) -->
    <main class="flex-1 flex min-h-0">
      <!-- Reader -->
      <div class="flex-1 min-w-0 flex flex-col">
        <div ref="readerEl" class="reader-container w-full max-w-3xl mx-auto flex-1 px-4" />
        <div
          class="border-t flex items-center justify-between px-4 h-12 shrink-0"
          :style="{ background: theme.headerBg, borderColor: theme.borderColor }"
        >
          <Button variant="ghost" size="sm" class="cursor-pointer" :style="{ color: theme.mutedColor }" @click="prev">
            <Icon name="lucide:chevron-left" class="h-4 w-4 mr-1" /> Previous
          </Button>
          <span class="text-xs" :style="{ color: theme.mutedColor }">← / → page · Space / Tab fire pulse · select text to add</span>
          <Button variant="ghost" size="sm" class="cursor-pointer" :style="{ color: theme.mutedColor }" @click="next">
            Next <Icon name="lucide:chevron-right" class="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      <!-- Pulse control panel -->
      <aside
        class="w-96 border-l flex flex-col shrink-0"
        :style="{ background: theme.headerBg, borderColor: theme.borderColor }"
      >
        <div class="px-4 py-3 border-b" :style="{ borderColor: theme.borderColor }">
          <div class="flex items-center justify-between mb-1">
            <div class="text-xs uppercase tracking-wider flex items-center gap-2" :style="{ color: theme.mutedColor }">
              Pulses
              <span v-if="savingPulses" class="text-[10px] italic opacity-70">saving…</span>
              <span v-if="saveError" class="text-[10px] text-red-400">save failed: {{ saveError }}</span>
            </div>
            <button
              v-if="activeChapter"
              class="text-xs underline cursor-pointer"
              :style="{ color: theme.mutedColor }"
              @click="resetPulses"
            >
              reset
            </button>
          </div>
          <div v-if="activeChapter" class="text-sm font-semibold" :style="{ color: theme.headingColor }">
            {{ activeChapter.title }}
          </div>
          <div v-else class="text-sm italic" :style="{ color: theme.mutedColor }">
            No pulses configured for this chapter
          </div>
        </div>

        <!-- Selection composer: appears when user selects text in the epub -->
        <div
          v-if="selectedText && activeChapter"
          class="px-4 py-3 border-b space-y-2"
          :style="{ borderColor: theme.borderColor, background: `${theme.headingColor}08` }"
        >
          <div class="flex items-center justify-between">
            <div class="text-xs uppercase tracking-wider" :style="{ color: theme.headingColor }">
              New pulse from selection
            </div>
            <button
              class="text-xs opacity-70 hover:opacity-100 cursor-pointer"
              :style="{ color: theme.mutedColor }"
              @click="clearSelection"
            >
              ✕ cancel
            </button>
          </div>
          <div>
            <label class="block text-[10px] uppercase tracking-wider mb-1" :style="{ color: theme.mutedColor }">
              Phrase (matched in chapter)
            </label>
            <textarea
              v-model="composerPhrase"
              rows="2"
              class="w-full px-2 py-1.5 text-xs rounded border bg-transparent resize-none focus:outline-none focus:ring-1"
              :style="{ borderColor: theme.borderColor, color: theme.headingColor }"
            />
          </div>
          <div>
            <label class="block text-[10px] uppercase tracking-wider mb-1" :style="{ color: theme.mutedColor }">
              Pulse text (shown on /twitch)
            </label>
            <textarea
              v-model="composerPulse"
              rows="2"
              class="w-full px-2 py-1.5 text-sm rounded border bg-transparent resize-none focus:outline-none focus:ring-1 font-semibold"
              :style="{ borderColor: theme.borderColor, color: theme.headingColor }"
            />
          </div>
          <div>
            <label class="block text-[10px] uppercase tracking-wider mb-1" :style="{ color: theme.mutedColor }">
              Style
            </label>
            <div class="flex gap-1">
              <button
                v-for="s in (['flash', 'stamp', 'whisper'] as PulseStyle[])"
                :key="s"
                class="flex-1 px-2 py-1.5 text-xs rounded border cursor-pointer transition-colors"
                :style="composerStyle === s
                  ? { borderColor: theme.headingColor, background: theme.headingColor, color: theme.pageBg }
                  : { borderColor: theme.borderColor, color: theme.mutedColor }"
                @click="composerStyle = s"
              >
                {{ s }}
              </button>
            </div>
          </div>
          <button
            class="w-full px-3 py-2 rounded-md bg-gold-500 hover:bg-gold-400 text-surface-300 font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50"
            :disabled="!composerPhrase.trim() || !composerPulse.trim()"
            @click="addPulseFromComposer"
          >
            + Add pulse
          </button>
        </div>

        <!-- Chapter images: auto-discovered from the epub, click a thumb to spotlight it on /twitch -->
        <div
          v-if="chapterImages.length"
          class="px-4 py-3 border-b"
          :style="{ borderColor: theme.borderColor }"
        >
          <div class="text-xs uppercase tracking-wider mb-2" :style="{ color: theme.mutedColor }">
            Images in this chapter
          </div>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="img in chapterImages"
              :key="img.src"
              class="w-16 h-16 rounded overflow-hidden border cursor-pointer hover:ring-2 hover:ring-gold-500 transition-all"
              :style="{ borderColor: theme.borderColor }"
              :title="`Fire image: ${img.src}`"
              @click="fireImage(img)"
            >
              <img
                :src="`/images/epub/${img.src}`"
                class="w-full h-full object-cover"
                alt=""
              />
            </button>
          </div>
        </div>

        <!-- Big fire button -->
        <div v-if="currentPulse" class="px-4 py-4 border-b" :style="{ borderColor: theme.borderColor }">
          <button
            class="w-full px-4 py-4 rounded-lg bg-gold-500 hover:bg-gold-400 text-surface-300 font-bold text-lg transition-colors cursor-pointer shadow-lg"
            @click="firePulse"
          >
            FIRE → {{ currentPulse.pulse }}
          </button>
          <div v-if="nextPulse" class="mt-2 text-xs" :style="{ color: theme.mutedColor }">
            next: {{ nextPulse.pulse }}
          </div>
        </div>
        <div v-else-if="pulses.length" class="px-4 py-4 border-b text-sm italic" :style="{ borderColor: theme.borderColor, color: theme.mutedColor }">
          All pulses fired. Click any below to re-fire.
        </div>

        <!-- Pulse list -->
        <ScrollArea class="flex-1">
          <div class="p-2 space-y-1">
            <div
              v-for="(p, i) in pulses"
              :key="i"
              class="px-3 py-2 rounded-md text-sm transition-colors flex items-start gap-2 group cursor-pointer"
              :class="{
                'ring-2 ring-gold-500': i === pulseIdx,
                'opacity-50': firedIds.has(i),
              }"
              :style="i === pulseIdx
                ? { background: `${theme.headingColor}15`, color: theme.headingColor }
                : { color: theme.mutedColor }"
              @click="jumpToPulse(i)"
              @dblclick="fireAt(i)"
            >
              <span class="text-xs opacity-60 mt-0.5 shrink-0 w-5 tabular-nums">{{ i + 1 }}</span>
              <div class="min-w-0 flex-1">
                <div class="font-semibold truncate" :style="{ color: theme.headingColor }">
                  {{ p.pulse }}
                </div>
                <div class="text-xs opacity-70 truncate italic mt-0.5">
                  "{{ p.phrase }}"
                </div>
              </div>
              <span class="text-[10px] uppercase tracking-wider opacity-60 shrink-0 mt-1">
                {{ p.style ?? 'flash' }}
              </span>
              <button
                class="ml-1 shrink-0 w-6 h-6 flex items-center justify-center rounded text-xs opacity-0 group-hover:opacity-70 hover:!opacity-100 hover:bg-red-500/20 hover:text-red-400 transition-opacity cursor-pointer"
                :style="{ color: theme.mutedColor }"
                title="Remove pulse"
                @click.stop="removePulse(i)"
              >
                ✕
              </button>
            </div>
          </div>
        </ScrollArea>
      </aside>
    </main>
  </div>
</template>

<style>
.reader-container iframe {
  border: none !important;
  background: transparent !important;
}
</style>
