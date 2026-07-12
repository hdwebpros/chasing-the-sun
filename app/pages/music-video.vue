<script setup lang="ts">
const src = '/images/characters/william-masters/music-video/where-do-you-set-v1.mp4'
const poster = '/images/characters/william-masters/music-video/poster.jpg'

useHead({ title: 'Music Video — Chasing the Sun' })
useSeoMeta({
  description:
    'Where Do You Set, Oh Sun? — the official music video for Chasing the Sun, tracing William Boog\'s life from the Dublin slums to the American West.',
  ogTitle: 'Where Do You Set, Oh Sun? — Chasing the Sun',
  ogDescription:
    'The official music video for Chasing the Sun.',
  ogImage: poster,
  ogType: 'video.other',
})
</script>

<template>
  <div class="min-h-dvh px-4 py-20 sm:py-24 relative overflow-hidden">
    <!-- Ambient glow -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gold-500/5 blur-[120px]" />
    </div>

    <div class="relative z-10 max-w-3xl mx-auto">
      <!-- Heading -->
      <div class="text-center mb-10 space-y-3">
        <p class="text-sm uppercase tracking-[0.2em] text-gold-500/60">Official Music Video</p>
        <h1 class="text-3xl sm:text-4xl font-bold text-gold-400 tracking-tight">
          Where Do You Set, Oh Sun?
        </h1>
        <p class="text-neutral-400 text-lg">A song from <span class="italic">Chasing the Sun</span></p>
      </div>

      <!-- Video player -->
      <div class="relative group">
        <div
          class="absolute -inset-1 rounded-xl bg-gradient-to-b from-gold-400/30 to-gold-600/10 blur-sm opacity-50"
        />
        <video
          class="relative w-full rounded-xl shadow-2xl shadow-black/50 bg-black"
          :src="src"
          :poster="poster"
          controls
          playsinline
          preload="metadata"
        >
          Your browser does not support the video tag.
          <a :href="src" class="text-gold-400 underline">Download the music video</a>.
        </video>
      </div>

      <!-- Blurb -->
      <div class="mt-10 space-y-6 text-neutral-300 leading-relaxed">
        <p>
          <span class="italic text-gold-400/90">Where Do You Set, Oh Sun?</span> traces William Boog's
          life across oceans and generations &mdash; from the rain-soaked slums of Dublin to a boot shop,
          a wedding, a coffin ship, and the wide American West &mdash; as he wrestles with fate and fights
          to make a name mean something.
        </p>
      </div>

      <!-- Back home -->
      <div class="text-center mt-16">
        <NuxtLink
          to="/"
          class="inline-block text-sm text-gold-500/60 hover:text-gold-400 transition-colors"
        >
          &larr; Back home
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
