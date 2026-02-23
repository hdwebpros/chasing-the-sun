<script setup lang="ts">
const isHovered = ref(false)

useHead({
  title: 'Chasing the Sun',
})
</script>

<template>
  <div class="min-h-dvh flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
    <!-- Ambient glow -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gold-500/5 blur-[120px]" />
    </div>

    <div class="relative z-10 flex flex-col items-center gap-10 max-w-2xl w-full">
      <!-- Cover Image -->
      <div
        class="relative group cursor-pointer"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
      >
        <div
          class="absolute -inset-1 rounded-lg bg-gradient-to-b from-gold-400/30 to-gold-600/10 blur-sm transition-opacity duration-500"
          :class="isHovered ? 'opacity-100' : 'opacity-50'"
        />
        <NuxtLink to="/read">
          <img
            src="/cover.jpg"
            alt="Chasing the Sun — Book Cover"
            class="relative rounded-lg shadow-2xl shadow-black/50 w-64 sm:w-72 md:w-80 transition-transform duration-500"
            :class="isHovered ? 'scale-[1.02]' : 'scale-100'"
          />
        </NuxtLink>
      </div>

      <!-- Title & Author -->
      <div class="text-center space-y-3">
        <h1 class="text-4xl sm:text-5xl font-bold text-gold-400 tracking-tight">
          Chasing the Sun
        </h1>
        <p class="text-neutral-400 text-lg italic">
          An online reading experience
        </p>
      </div>

      <!-- CTA -->
      <NuxtLink to="/read">
        <Button
          size="lg"
          class="bg-gold-500 hover:bg-gold-400 text-surface-300 font-semibold text-lg px-10 py-6 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-gold-500/20 cursor-pointer"
        >
          <Icon name="lucide:book-open" class="mr-2 h-5 w-5" />
          Start Reading
        </Button>
      </NuxtLink>

      <!-- Links -->
      <div class="flex items-center gap-6 text-sm text-neutral-500">
        <NuxtLink
          to="/read"
          class="hover:text-gold-400 transition-colors"
        >
          Table of Contents
        </NuxtLink>
        <span class="text-neutral-700">|</span>
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSdv3WNVPPugyl8dUrfJJmgsLUPDwFjXrwfRNX6oO667J9WMog/viewform?usp=header"
          target="_blank"
          rel="noopener"
          class="hover:text-gold-400 transition-colors"
        >
          Send Feedback
        </a>
        <span class="text-neutral-700">|</span>
        <a
          href="/chasing-the-sun.epub"
          download
          class="hover:text-gold-400 transition-colors"
        >
          Download EPUB
        </a>
      </div>
    </div>
  </div>
</template>
