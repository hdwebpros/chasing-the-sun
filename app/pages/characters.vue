<script setup lang="ts">
useHead({ title: 'Characters — Chasing the Sun' })

interface Character {
  name: string
  role: string
  summary: string
  images?: { src: string; alt: string }[]
  aiGenerated?: boolean
}

const showDescriptions = ref(false)

const characters: Character[] = [
  {
    name: 'William Boog',
    role: 'Protagonist',
    summary:
      'Born in a Dublin tenement in 1841, William is a self-made man who apprentices as a bootmaker, emigrates to America, and builds a painting empire across Boston, St. Paul, and Grants Pass, Oregon. He carries the weight of burying seven children and a wife, yet never stops chasing the promise of something better over the next horizon.',
    images: [
      { src: '/images/characters/William-Boog-Portrait.jpg', alt: 'William Boog portrait' },
      { src: '/images/characters/William-With-Hat.jpg', alt: 'William Boog standing with hat' },
    ],
  },
  {
    name: 'Mary Moran',
    role: "William's First Wife",
    summary:
      "A washerwoman's daughter from Dublin with strong arms and a fiercer heart, Mary is the steady anchor to William's restless ambition. She follows him across an ocean and through the deaths of five children, her faith quietly fracturing with each loss until her own death in St. Paul in 1887.",
    images: [
      { src: '/images/characters/Mary-Moran-AI.jpg', alt: 'Mary Moran' },
    ],
    aiGenerated: true,
  },
  {
    name: 'Charlotte "Lottie" Travers Boog',
    role: "William's Second Wife",
    summary:
      "A Kansas-raised widow who already buried one husband and raised six children alone before meeting William at a parish social in 1890. Practical, sharp-witted, and unafraid to confront William's demons, she manages his properties and holds the family together across two states when he leaves for Oregon.",
    images: [
      { src: '/images/characters/Lottie-young.jpg', alt: 'Lottie as a young woman' },
      { src: '/images/characters/Lottie.jpg', alt: 'Lottie later in life' },
    ],
  },
  {
    name: 'Austin Boog',
    role: 'Son of William & Mary',
    summary:
      'Serious as a magistrate from childhood, Austin is the eldest surviving son who watches over his younger siblings with a maturity far beyond his years. He dies of diphtheria in Boston at age thirteen, his last words to his father about wanting to move again and see new things.',
  },
  {
    name: 'Mary Margaret Boog',
    role: 'Daughter of William & Mary',
    summary:
      "William and Mary's eldest surviving daughter carries her mother's dark hair, fierce bearing, and directness — she is the one who holds the family together when no one else can. She dies of leukemia at twenty-four, giving her mother's brooch to Lottie on her deathbed.",
  },
  {
    name: 'Letitia Boog',
    role: 'Daughter of William & Mary — Sister Berissima',
    summary:
      "The quietest and most deeply empathetic of William and Mary's children, Letitia tends gardens at every home the family occupies and is always the first to comfort a crying sibling. She enters the convent at St. Catherine's, taking the name Sister Berissima, returning the deed to her house because she has chosen a life beyond property.",
  },
  {
    name: 'William Boog Jr.',
    role: 'Son of William & Mary',
    summary:
      'Born at 13 Aston\'s Quay in Dublin and carried to America as an infant, William Jr. grows into the steady, rooted version of his father — running his own painting crew in St. Paul and building a stable life. He dies of the Spanish flu in February 1919, the seventh X on his father\'s folded paper.',
  },
  {
    name: 'Rose Boog',
    role: 'Daughter of William & Mary — Sister Magdalen',
    summary:
      "The youngest of Mary's surviving children, Rose is born into the promise of St. Paul rather than the wreckage of Boston, and develops a gift for painting that moves her father to tears. She joins the Sisters of St. Joseph of Carondelet as Sister Magdalen, turning her art into a lifelong devotion.",
    images: [
      { src: '/images/characters/Rose-Sister-Magdelan-Boog.jpg', alt: 'Rose as Sister Magdalen' },
      { src: '/images/characters/Rose-Boog-Painting.jpg', alt: 'Rose painting at an easel' },
    ],
  },
  {
    name: 'Charlotte Magdalen Boog',
    role: 'Daughter of William & Lottie',
    summary:
      "The first child of William and Lottie, Charlotte inherits her father's dark hair and eyes and grows into a capable young woman who learns to manage the family's property ledger at her mother's side. Rose picks her middle name, Magdalen, connecting her to the faith that runs through both sides of the family.",
    images: [
      { src: '/images/characters/Charlotte-Jr.jpg', alt: 'Charlotte Magdalen Boog' },
      { src: '/images/characters/Charlotte-Jr-2.jpeg', alt: 'Charlotte Magdalen Boog later in life' },
    ],
  },
  {
    name: 'Alex Boog',
    role: 'Son of William & Lottie',
    summary:
      "The youngest of William and Lottie's four children, Alex arrives red-faced and screaming in March 1898, carrying his father's looks and his mother's temperament. He grows up largely without his father present, clinging to his mother and asking questions about the man who left for Oregon.",
    images: [
      { src: '/images/characters/alex-boog.jpg', alt: 'Alex Boog portrait' },
      { src: '/images/characters/alex-boog-1.jpg', alt: 'Alex Boog in military uniform' },
      { src: '/images/characters/alex-boog-2.jpg', alt: 'Alex Boog as a young man' },
    ],
  },
  {
    name: 'Valentin Travers',
    role: "Lottie's First Husband",
    summary:
      "A Civil War veteran who fought at Fort Sumter and earned a congressional medal, Valentin is remembered as a great man who came home every night and asked about Lottie's day. His death left Lottie to raise six children alone, forging the resilience she would need when William entered her life.",
    images: [
      { src: '/images/characters/Valentin-Travers.jpg', alt: 'Valentin Travers' },
    ],
  },
  {
    name: 'Doyle',
    role: "William's Mentor",
    summary:
      'A barrel-chested Dublin bootmaker with thirty years of craft in his hands, Doyle takes on the twelve-year-old William as an unpaid apprentice after seeing a crude piece of hand-stitched leather. Gruff and demanding but silently proud, he watches from across the street when his apprentice opens his own shop at eighteen.',
  },
  {
    name: 'Hollis',
    role: 'Attorney in Grants Pass',
    summary:
      "An attorney in Grants Pass, Oregon who in 1925 sits down to draft an eighty-four-year-old William's will and ends up hearing the story of a lifetime. Patient and perceptive, he asks the one question no one else ever dared — whether William's ambition is what wore Mary out.",
  },
]
</script>

<template>
  <div class="min-h-dvh px-4 py-20 sm:py-24">
    <div class="max-w-3xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-14 space-y-3">
        <h1 class="text-3xl sm:text-4xl font-bold text-gold-400 tracking-tight">
          Characters
        </h1>
        <p class="text-neutral-500 text-lg italic">
          The people who lived this story
        </p>
      </div>

      <!-- Spoiler warning -->
      <div class="text-center mb-10 py-3 px-4 rounded-xl border border-gold-500/10 bg-gold-500/5 flex flex-col sm:flex-row items-center justify-center gap-3">
        <p class="text-sm text-gold-500/70">
          Descriptions contain spoilers.
        </p>
        <button
          class="text-sm font-medium px-4 py-1.5 rounded-full transition-colors cursor-pointer"
          :class="showDescriptions
            ? 'bg-gold-500/20 text-gold-400 hover:bg-gold-500/30'
            : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'"
          @click="showDescriptions = !showDescriptions"
        >
          {{ showDescriptions ? 'Hide descriptions' : 'Show descriptions' }}
        </button>
      </div>

      <!-- Character list -->
      <div class="space-y-10">
        <article
          v-for="character in characters"
          :key="character.name"
          class="rounded-2xl border border-neutral-800 bg-surface-100 overflow-hidden"
        >
          <!-- Images -->
          <div
            v-if="character.images?.length"
            class="flex gap-3 p-4 pb-0 overflow-x-auto"
          >
            <figure
              v-for="(img, i) in character.images"
              :key="i"
              class="shrink-0 relative"
            >
              <NuxtImg
                :src="img.src"
                :alt="img.alt"
                class="rounded-lg h-52 sm:h-64 w-auto object-contain"
                loading="lazy"
              />
              <span
                v-if="character.aiGenerated && i === 0"
                class="absolute bottom-2 left-2 text-[10px] uppercase tracking-wider font-semibold bg-surface-300/90 text-neutral-500 px-2 py-0.5 rounded-full"
              >
                AI recreation
              </span>
            </figure>
          </div>

          <!-- Text content -->
          <div class="p-5 sm:p-6 space-y-3">
            <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 class="text-xl sm:text-2xl font-bold text-gold-300">
                {{ character.name }}
              </h2>
              <span class="text-sm text-gold-500/60 italic">
                {{ character.role }}
              </span>
            </div>
            <Transition
              enter-active-class="transition-all duration-400 ease-out"
              enter-from-class="max-h-0 opacity-0"
              enter-to-class="max-h-48 opacity-100"
              leave-active-class="transition-all duration-300 ease-in"
              leave-from-class="max-h-48 opacity-100"
              leave-to-class="max-h-0 opacity-0"
            >
              <p v-if="showDescriptions" class="text-neutral-400 leading-relaxed overflow-hidden">
                {{ character.summary }}
              </p>
            </Transition>
          </div>
        </article>
      </div>

      <!-- Footer -->
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
