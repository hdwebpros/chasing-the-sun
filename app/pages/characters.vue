<script setup lang="ts">
useHead({ title: 'Characters — Chasing the Sun' })

interface Character {
  name: string
  role: string
  summary: string
  group: string
  images?: { src: string; alt: string }[]
  aiGenerated?: boolean
  invented?: boolean
}

const showDescriptions = ref(false)

const characters: Character[] = [
  // ── The Boogs ──────────────────────────────────────────────
  {
    name: 'William Boog',
    role: 'Protagonist',
    group: 'The Boogs',
    summary:
      'Born in a Dublin tenement in November 1841 and given away by his mother before he could lift his own head, William grows up an orphan told a curse walks with him. He apprentices as a bootmaker under Doyle, opens his own shop at eighteen, and emigrates to America in 1873, reinventing himself as a house painter and building a business across Boston, St. Paul, and finally Grants Pass, Oregon. In his breast pocket he keeps a single folded sheet of paper — a private ledger of every name he loves and every one he has had to cross out. By the time he sits down at eighty-four to dictate his will, he has buried seven of his thirteen children, a stillborn son, and his first wife, and is still chasing the promise of something better over the next horizon.',
    images: [
      { src: '/images/characters/William-Boog-Portrait.jpg', alt: 'William Boog portrait' },
      { src: '/images/characters/William-With-Hat.jpg', alt: 'William Boog standing with hat' },
    ],
  },
  {
    name: 'Mary Moran',
    role: "William's First Wife",
    group: 'The Boogs',
    summary:
      "A Dublin washerwoman with lye-cracked hands, strong arms, and a fiercer heart, Mary is the steady anchor to William's restless ambition. She marries him in 1864, follows him across an ocean, and bears him nine children and a stillborn son — burying them one after another as her faith quietly fractures with each loss. She keeps her own private count of the dead, and when the gin loosens her tongue she tells William to his face that he is the one who carries the sickness. She dies in St. Paul in 1887, having laid six of her nine children in the ground herself.",
    images: [
      { src: '/images/characters/Mary-Moran-AI.jpg', alt: 'Mary Moran' },
    ],
    aiGenerated: true,
  },
  {
    name: 'Charlotte "Lottie" Travers Boog',
    role: "William's Second Wife",
    group: 'The Boogs',
    summary:
      "A Kansas-raised widow who had already buried one husband and raised six children alone before meeting William at a parish social in 1890. A lawyer's daughter who learned to paint houses at sixteen, she reads a coat of paint the way William does, and she is practical, sharp-witted, and unafraid to face his demons. She bears him four more children, takes over his ledgers and properties, and holds the blended family together across two states when he leaves for Oregon — even letting the world, and the census, believe he has died. She outlives him.",
    images: [
      { src: '/images/characters/Lottie-young.jpg', alt: 'Lottie as a young woman' },
      { src: '/images/characters/Lottie.jpg', alt: 'Lottie later in life' },
    ],
  },

  // ── Children of William & Mary ─────────────────────────────
  {
    name: 'George Boog',
    role: 'Firstborn of William & Mary',
    group: 'Children of William & Mary',
    summary:
      "William and Mary's firstborn, George is a healthy, curious baby who grips his father's thumb and tracks him across the room — until a winter cough deepens into whooping cough. He dies in Dublin at eleven months, the first name William ever crosses out on his folded paper, and the grief that first teaches him what the paper is for.",
  },
  {
    name: 'Austin Boog',
    role: 'Son of William & Mary',
    group: 'Children of William & Mary',
    summary:
      'The eldest son to survive infancy, Austin is serious beyond his years — he fetches water without being asked and shepherds his younger siblings while William works the bench. When diphtheria sweeps the family\'s Boston tenement, Austin dies on December 18, 1874, only seven years old, six days before his little sister Teresa. His last questions to his father were about moving again and whether there would be birds to hunt wherever they went next; William swore he would kill every bird in the world for him — and spent decades shooting anything that flew to keep the promise.',
  },
  {
    name: 'Mary Margaret Boog',
    role: 'Daughter of William & Mary',
    group: 'Children of William & Mary',
    summary:
      "William and Mary's eldest surviving daughter carries her mother's dark hair, fierce bearing, and directness. She survives childhood diphtheria, outlasts Boston, and after her mother's death quietly takes over the Sunday meals — refusing to let anyone else — bridging her mother's family and Lottie's. She dies of leukemia at twenty-four in 1893, pressing her mother's brooch into Lottie's hands on her deathbed.",
  },
  {
    name: 'Letitia Boog',
    role: 'Daughter of William & Mary — Sister Berissima',
    group: 'Children of William & Mary',
    summary:
      "The quietest and most composed of the children, Letitia is the very first of the City of Paris's passengers to board when the family emigrates — she had always been the one who went first. She tends a garden at every home the family occupies and is the first to comfort a crying sibling. She enters the convent at St. Catherine's as Sister Berissima, teaches painting at Saint Agatha's Conservatory, and is sent to Florence to copy the masters. She hands her father back the deed to the house he put in her name; she has chosen a life beyond property.",
    images: [
      { src: '/images/characters/Letitia.jpg', alt: 'Letitia Boog' },
    ],
  },
  {
    name: 'William Boog Jr.',
    role: 'Son of William & Mary',
    group: 'Children of William & Mary',
    summary:
      "Born at 13 Aston's Quay in Dublin, William Jr. is the child his father swore the crossings-out would never reach. He lives only eleven months before dying in Dublin — the second infant son William buries, and another early mark on the folded paper.",
  },
  {
    name: 'Rose Boog',
    role: 'Daughter of William & Mary — Sister Magdalen',
    group: 'Children of William & Mary',
    summary:
      "The youngest of Mary's children, Rose is born in St. Paul in 1878 — into the promise of the prairie rather than the wreckage of Boston — and grows into a genuinely gifted painter. From nothing but her father's spoken memories she paints the River Liffey at golden hour, shop sign and all, though she has never once seen Dublin; it moves William to tears. She joins the Sisters of St. Joseph of Carondelet as Sister Magdalen and turns her art into a lifelong devotion.",
    images: [
      { src: '/images/characters/Rose-Sister-Magdelan-Boog.jpg', alt: 'Rose as Sister Magdalen' },
      { src: '/images/characters/Rose-Boog-Painting.jpg', alt: 'Rose painting at an easel' },
    ],
  },

  // ── Children of William & Lottie ───────────────────────────
  {
    name: 'Charlotte Magdalen Boog',
    role: 'Daughter of William & Lottie',
    group: 'Children of William & Lottie',
    summary:
      "The first child of William and Lottie, born in St. Paul in 1892, Charlotte inherits her father's dark hair and eyes and grows into a capable young woman who learns the family's property ledger at her mother's side, taking over the books as a teenager. Rose chooses her middle name, Magdalen, tying her to the faith that runs through both halves of the family.",
    images: [
      { src: '/images/characters/Charlotte-Jr.jpg', alt: 'Charlotte Magdalen Boog' },
      { src: '/images/characters/Charlotte-Jr-2.jpeg', alt: 'Charlotte Magdalen Boog later in life' },
    ],
  },
  {
    name: 'Alex Boog',
    role: 'Son of William & Lottie',
    group: 'Children of William & Lottie',
    summary:
      "The youngest of William and Lottie's four children, Alex arrives in March 1898 with his father's looks and his mother's temperament — and is barely two when William leaves for Oregon, convinced that distance is the only thing that will keep his last surviving son alive. Alex grows up on his mother's stories and a compass his father left behind for him, forever asking after the man who went west.",
    images: [
      { src: '/images/characters/alex-boog.jpg', alt: 'Alex Boog portrait' },
      { src: '/images/characters/alex-boog-1.jpg', alt: 'Alex Boog in military uniform' },
      { src: '/images/characters/alex-boog-2.jpg', alt: 'Alex Boog as a young man' },
    ],
  },

  // ── Others in the Story ────────────────────────────────────
  {
    name: 'Valentin Travers',
    role: "Lottie's First Husband",
    group: 'Others in the Story',
    summary:
      "Lottie's first husband, older than her and remembered as a good man, Valentin carried a medal from the war that he never quite knew where to put. He died young, leaving Lottie to bury him and raise their six children alone in Kansas — the loss that forged the resilience she would later bring to William's household. For years after, she still set his plate at breakfast some mornings before catching herself.",
    images: [
      { src: '/images/characters/Valentin-Travers.jpg', alt: 'Valentin Travers' },
    ],
  },
  {
    name: 'Doyle',
    role: "William's Mentor",
    group: 'Others in the Story',
    invented: true,
    summary:
      'A barrel-chested Dublin bootmaker with thirty years of craft in his hands, Doyle takes twelve-year-old William on as an unpaid apprentice after the boy stands in the rain outside his workshop until he relents — won over, despite himself, by a crude scrap of self-stitched leather. Gruff and demanding but quietly proud, he teaches William everything he knows while warning that the machines are coming for the hand trade, a prophecy that follows William across the ocean.',
  },
  {
    name: 'Hollis',
    role: 'Attorney in Grants Pass',
    group: 'Others in the Story',
    invented: true,
    summary:
      "An attorney in Grants Pass, Oregon who in 1925 sits down to draft eighty-four-year-old William's will and ends up hearing the story of a lifetime. Patient and perceptive, he is the one who finally asks whether it was William's own restless ambition that wore Mary out — and, hearing the answer, admits he doesn't know what to say to it.",
  },
]

const groups = computed(() => {
  const order: string[] = []
  const map = new Map<string, Character[]>()
  for (const c of characters) {
    if (!map.has(c.group)) {
      map.set(c.group, [])
      order.push(c.group)
    }
    map.get(c.group)!.push(c)
  }
  return order.map((title) => ({ title, items: map.get(title)! }))
})
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
        <p class="text-sm text-neutral-600 max-w-md mx-auto">
          Nearly everyone here was real. Only Doyle and Hollis are the author's inventions.
        </p>
      </div>

      <!-- Spoiler warning -->
      <div class="text-center mb-12 py-3 px-4 rounded-xl border border-gold-500/10 bg-gold-500/5 flex flex-col sm:flex-row items-center justify-center gap-3">
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

      <!-- Character list, grouped -->
      <div class="space-y-14">
        <section
          v-for="grp in groups"
          :key="grp.title"
          class="space-y-8"
        >
          <h2 class="text-xs uppercase tracking-[0.2em] font-semibold text-gold-500/50 text-center">
            {{ grp.title }}
          </h2>

          <article
            v-for="character in grp.items"
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
                <h3 class="text-xl sm:text-2xl font-bold text-gold-300">
                  {{ character.name }}
                </h3>
                <span class="text-sm text-gold-500/60 italic">
                  {{ character.role }}
                </span>
                <span
                  v-if="character.invented"
                  class="text-[10px] uppercase tracking-wider font-semibold bg-neutral-800 text-neutral-500 px-2 py-0.5 rounded-full"
                >
                  Author's invention
                </span>
              </div>
              <Transition
                enter-active-class="transition-all duration-400 ease-out"
                enter-from-class="max-h-0 opacity-0"
                enter-to-class="max-h-96 opacity-100"
                leave-active-class="transition-all duration-300 ease-in"
                leave-from-class="max-h-96 opacity-100"
                leave-to-class="max-h-0 opacity-0"
              >
                <p v-if="showDescriptions" class="text-neutral-400 leading-relaxed overflow-hidden">
                  {{ character.summary }}
                </p>
              </Transition>
            </div>
          </article>
        </section>
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
