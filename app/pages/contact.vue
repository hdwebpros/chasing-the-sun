<script setup lang="ts">
useHead({ title: 'Contact — Chasing the Sun' })
</script>

<template>
  <div class="min-h-dvh flex items-center justify-center px-4">
    <div class="text-center space-y-4">
      <h1 class="text-3xl sm:text-4xl font-bold text-gold-400">Contact</h1>
      <p class="text-neutral-400">
        For questions, feedback, or anything else:
      </p>
      <a
        href="mailto:ryan.j.boog@gmail.com"
        class="inline-block text-gold-400 hover:text-gold-300 transition-colors text-lg"
      >
        ryan.j.boog@gmail.com
      </a>
      <NuxtLink to="/" class="inline-block text-sm text-gold-500/60 hover:text-gold-400 transition-colors mt-4">
        &larr; Back home
      </NuxtLink>
    </div>
  </div>
</template>
