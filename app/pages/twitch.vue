<script setup lang="ts">
import { TWITCH_CHAPTERS, imagePath, type TwitchChapter, type PulseStyle } from '~/data/twitch'
import slideshowManifest from '~/data/twitch-slideshows.json'

const SLIDESHOWS = slideshowManifest as Record<string, string[]>

definePageMeta({ layout: false })

useHead({
  title: 'Chasing the Sun — Live',
  meta: [{ name: 'theme-color', content: '#000000' }],
})

const route = useRoute()
const { onMessage } = usePulseChannel()

const SLIDE_MS = 20000
const SPOTLIGHT_MS = 8000
const chapterId = ref<string>((route.query.chapter as string) || 'interlude')
const chapter = computed<TwitchChapter | null>(() => TWITCH_CHAPTERS[chapterId.value] ?? null)

// Image list fetched from server route — auto-discovers files in the folder
const images = ref<string[]>([])

function loadImages(slideshow: string) {
  images.value = SLIDESHOWS[slideshow] ?? []
}

// Slideshow state — two layers crossfade
const currentIdx = ref(0)
const previousIdx = ref<number | null>(null)
let slideTimer: ReturnType<typeof setInterval> | null = null

function advanceSlide() {
  const len = images.value.length
  if (len <= 1) return
  previousIdx.value = currentIdx.value
  currentIdx.value = (currentIdx.value + 1) % len
  setTimeout(() => { previousIdx.value = null }, 1500)
}

function startSlideshow() {
  stopSlideshow()
  currentIdx.value = 0
  previousIdx.value = null
  if (images.value.length <= 1) return
  slideTimer = setInterval(advanceSlide, SLIDE_MS)
}

function stopSlideshow() {
  if (slideTimer) { clearInterval(slideTimer); slideTimer = null }
}

// Reading progress, received from /prompter
const bookProgress = ref(0)
const chapterProgress = ref(0)
const chapterLabel = ref('')

watch(chapter, (c) => {
  if (c) {
    loadImages(c.slideshow)
    startSlideshow()
  } else {
    stopSlideshow()
    images.value = []
  }
})

// Pulse state — one active pulse at a time. New pulse replaces old.
interface ActivePulse { id: number; text: string; style: PulseStyle; key: number }
const activePulse = ref<ActivePulse | null>(null)
let pulseCounter = 0
let pulseTimer: ReturnType<typeof setTimeout> | null = null

const PULSE_MS: Record<PulseStyle, number> = {
  flash: 3000,
  stamp: 4500,
  whisper: 5000,
}

function showPulse(text: string, style: PulseStyle, id: number) {
  if (pulseTimer) clearTimeout(pulseTimer)
  activePulse.value = { id, text, style, key: ++pulseCounter }
  pulseTimer = setTimeout(() => {
    if (activePulse.value?.id === id) activePulse.value = null
  }, PULSE_MS[style])
}

// Spotlight image — temporary takeover above the slideshow
interface ActiveSpotlight { id: number; src: string; key: number }
const spotlight = ref<ActiveSpotlight | null>(null)
let spotlightCounter = 0
let spotlightTimer: ReturnType<typeof setTimeout> | null = null

function showSpotlight(src: string, id: number) {
  if (spotlightTimer) clearTimeout(spotlightTimer)
  spotlight.value = { id, src, key: ++spotlightCounter }
  spotlightTimer = setTimeout(() => {
    if (spotlight.value?.id === id) spotlight.value = null
  }, SPOTLIGHT_MS)
}

onMounted(() => {
  if (chapter.value) {
    loadImages(chapter.value.slideshow)
    startSlideshow()
  }

  onMessage((msg) => {
    if (msg.type === 'chapter') {
      chapterId.value = msg.id
    } else if (msg.type === 'pulse') {
      showPulse(msg.text, msg.style, msg.id)
    } else if (msg.type === 'image') {
      showSpotlight(msg.src, msg.id)
    } else if (msg.type === 'progress') {
      bookProgress.value = msg.book
      chapterProgress.value = msg.chapter
      chapterLabel.value = msg.chapterLabel
    } else if (msg.type === 'reset') {
      activePulse.value = null
      spotlight.value = null
      if (spotlightTimer) { clearTimeout(spotlightTimer); spotlightTimer = null }
      startSlideshow()
    }
  })
})

onBeforeUnmount(() => {
  stopSlideshow()
  if (pulseTimer) clearTimeout(pulseTimer)
  if (spotlightTimer) clearTimeout(spotlightTimer)
})

</script>

<template>
  <div class="fixed inset-0 bg-black overflow-hidden font-serif text-white select-none">
    <!-- Slideshow background -->
    <template v-if="chapter && images.length">
      <img
        v-if="previousIdx !== null && images[previousIdx]"
        :key="`prev-${previousIdx}`"
        :src="imagePath(chapter.slideshow, images[previousIdx]!)"
        class="absolute inset-0 w-full h-full object-cover"
        alt=""
      />
      <img
        :key="`curr-${currentIdx}`"
        :src="imagePath(chapter.slideshow, images[currentIdx]!)"
        class="absolute inset-0 w-full h-full object-cover animate-slide-in"
        alt=""
      />
      <!-- Vignette + left-side darkening for legibility -->
      <div class="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />
      <div class="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
      <div class="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/70 to-transparent" />
    </template>

    <!-- Top-left: logo + chapter -->
    <div class="absolute top-8 left-10 z-20 max-w-[40%]">
      <div class="text-gold-400 text-sm tracking-[0.3em] uppercase font-medium mb-3 opacity-90">
        Chasing the Sun
      </div>
      <div v-if="chapter" class="space-y-1">
        <div class="text-3xl font-semibold text-white drop-shadow-lg">
          {{ chapter.title }}
        </div>
        <div v-if="chapter.subtitle" class="text-lg italic text-neutral-200 drop-shadow-md">
          {{ chapter.subtitle }}
        </div>
      </div>
    </div>

    <!-- Spotlight image overlay: confined to left 2/3 so the streamer's right column stays clear -->
    <Transition name="spotlight">
      <div
        v-if="spotlight"
        :key="spotlight.key"
        class="absolute inset-y-0 left-0 w-2/3 z-[25] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      >
        <img
          :src="spotlight.src"
          class="max-w-[90%] max-h-[90%] object-contain shadow-2xl spotlight-img"
          alt=""
        />
      </div>
    </Transition>

    <!-- Pulse overlay: middle-left third -->
    <div class="absolute inset-y-0 left-0 w-2/3 flex items-center justify-start pl-16 pointer-events-none z-30">
      <Transition
        :name="activePulse?.style ?? 'flash'"
        mode="out-in"
      >
        <div
          v-if="activePulse"
          :key="activePulse.key"
          class="pulse-text"
          :class="`pulse-${activePulse.style}`"
        >
          {{ activePulse.text }}
        </div>
      </Transition>
    </div>

    <!-- Bottom-left: reading progress -->
    <div class="absolute bottom-8 left-10 z-20 w-80 space-y-3">
      <div>
        <div class="flex items-center justify-between text-[11px] text-neutral-300 mb-1.5 tracking-wider uppercase">
          <span>Chapter</span>
          <span class="tabular-nums">{{ Math.round(chapterProgress) }}%</span>
        </div>
        <div class="h-1 bg-white/15 rounded-full overflow-hidden">
          <div
            class="h-full bg-gold-400 transition-[width] duration-500 ease-out"
            :style="{ width: `${chapterProgress}%` }"
          />
        </div>
      </div>
      <div>
        <div class="flex items-center justify-between text-[11px] text-neutral-300 mb-1.5 tracking-wider uppercase">
          <span>Book</span>
          <span class="tabular-nums">{{ Math.round(bookProgress) }}%</span>
        </div>
        <div class="h-1 bg-white/15 rounded-full overflow-hidden">
          <div
            class="h-full bg-white/70 transition-[width] duration-500 ease-out"
            :style="{ width: `${bookProgress}%` }"
          />
        </div>
      </div>
    </div>

    <!-- Fallbacks -->
    <div v-if="!chapter" class="absolute inset-0 flex items-center justify-center text-neutral-400 text-lg">
      No chapter loaded. Try <code class="mx-2 px-2 py-1 bg-white/10 rounded">/twitch?chapter=ch7</code>
    </div>
    <div v-else-if="!images.length" class="absolute inset-0 flex items-center justify-center text-neutral-400 text-lg">
      No images found in <code class="mx-2 px-2 py-1 bg-white/10 rounded">/public/images/twitch/{{ chapter.slideshow }}</code>
    </div>
  </div>
</template>

<style scoped>
.animate-slide-in {
  animation: slideKenBurns 22s ease-out forwards;
}

@keyframes slideKenBurns {
  0%   { opacity: 0; transform: scale(1.08); }
  8%   { opacity: 1; }
  100% { opacity: 1; transform: scale(1.00); }
}

/* Pulse text base */
.pulse-text {
  font-family: 'EB Garamond', Garamond, Georgia, serif;
  line-height: 1.05;
  text-shadow: 0 4px 24px rgba(0,0,0,0.85), 0 0 60px rgba(0,0,0,0.5);
}

.pulse-flash {
  font-size: clamp(3.5rem, 7vw, 7rem);
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.01em;
  max-width: 90%;
}

.pulse-stamp {
  font-size: clamp(4rem, 8vw, 8.5rem);
  font-weight: 800;
  color: #f9efd8;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  border-left: 8px solid #d4a54a;
  padding-left: 2rem;
  max-width: 90%;
}

.pulse-whisper {
  font-size: clamp(2.5rem, 5vw, 5rem);
  font-weight: 400;
  font-style: italic;
  color: #e9c67e;
  letter-spacing: 0.04em;
  max-width: 85%;
}

/* Transitions per style */
.flash-enter-active { animation: flashIn 0.35s cubic-bezier(.2,.8,.2,1); }
.flash-leave-active { animation: flashOut 0.4s ease-in; }
@keyframes flashIn {
  0%   { opacity: 0; transform: translateX(-30px) scale(0.95); }
  60%  { opacity: 1; transform: translateX(0) scale(1.02); }
  100% { opacity: 1; transform: translateX(0) scale(1.00); }
}
@keyframes flashOut {
  to { opacity: 0; transform: translateX(0) scale(1.02); }
}

.stamp-enter-active { animation: stampIn 0.5s cubic-bezier(.2,1.5,.4,1); }
.stamp-leave-active { animation: stampOut 0.4s ease-in; }
@keyframes stampIn {
  0%   { opacity: 0; transform: scale(1.4) rotate(-1deg); filter: blur(8px); }
  60%  { opacity: 1; transform: scale(0.96) rotate(-1deg); filter: blur(0); }
  100% { opacity: 1; transform: scale(1) rotate(-1deg); filter: blur(0); }
}
@keyframes stampOut {
  to { opacity: 0; transform: scale(1) rotate(-1deg); }
}

.whisper-enter-active { animation: whisperIn 1.2s ease-out; }
.whisper-leave-active { animation: whisperOut 0.8s ease-in; }
@keyframes whisperIn {
  0%   { opacity: 0; transform: translateY(20px); filter: blur(4px); }
  100% { opacity: 1; transform: translateY(0); filter: blur(0); }
}
@keyframes whisperOut {
  to { opacity: 0; filter: blur(4px); }
}

/* Spotlight image overlay */
.spotlight-enter-active { transition: opacity 0.5s ease-out; }
.spotlight-leave-active { transition: opacity 0.6s ease-in; }
.spotlight-enter-from, .spotlight-leave-to { opacity: 0; }
.spotlight-img {
  animation: spotlightKenBurns 8s ease-out forwards;
}
@keyframes spotlightKenBurns {
  0%   { transform: scale(0.96); }
  100% { transform: scale(1.04); }
}
</style>
