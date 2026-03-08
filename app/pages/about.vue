<script setup lang="ts">
useHead({ title: 'About the Author — Chasing the Sun' })
</script>

<template>
  <div class="min-h-dvh px-4 py-20 sm:py-24">
    <div class="max-w-2xl mx-auto">
      <!-- Author photo -->
      <div class="flex justify-center mb-12">
        <div class="relative">
          <div
            class="absolute -inset-1 rounded-full bg-gradient-to-b from-gold-400/30 to-gold-600/10 blur-sm opacity-50"
          />
          <NuxtImg
            src="/ryan.jpg"
            alt="Ryan Boog"
            class="relative rounded-full w-40 h-40 sm:w-48 sm:h-48 object-cover shadow-2xl shadow-black/50"
          />
        </div>
      </div>

      <!-- Heading -->
      <div class="text-center mb-10 space-y-2">
        <h1 class="text-3xl sm:text-4xl font-bold text-gold-400 tracking-tight">
          About the Author
        </h1>
        <p class="text-neutral-400 text-lg">Ryan Boog</p>
      </div>

      <!-- Origin story -->
      <div class="space-y-6 text-neutral-300 leading-relaxed">
        <p>
          When Ryan's aunt Judy passed away, he received a box of old photographs and a folder of
          genealogy notes. Sifting through faded images and handwritten records, he realized he had
          no idea where his last name came from — or the story behind it.
        </p>

        <p>
          What he found was William Boog, his great-great-grandfather. A man of Scottish blood, born
          in Dublin. Almost no information existed about him, but over nine years of research, Ryan
          uncovered a life that was unreal. A story that stretched across oceans and generations, too
          extraordinary to leave buried.
        </p>

        <p>
          <span class="italic text-gold-400/90">Chasing the Sun</span> is Ryan's debut novel, born
          from that research. It is a work of historical fiction woven around the real life of
          William Boog, a man who built a name from nothing.
        </p>
      </div>

      <!-- Pull quote -->
      <div class="my-12 border-l-2 border-gold-500/40 pl-6">
        <p class="text-gold-400/80 italic text-lg">
          "You can do anything if you put your mind to it."
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
