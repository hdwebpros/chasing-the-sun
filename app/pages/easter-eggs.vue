<script setup lang="ts">
useHead({ title: 'Easter Eggs — Chasing the Sun' })

interface EasterEgg {
  id: number
  chapter: string
  teaser: string
  detail: string
  flip?: boolean
}

const eggs: EasterEgg[] = [
  {
    id: 1,
    chapter: 'Chapter 2',
    teaser: 'Why does William read upside down?',
    detail: "William's adopted sister helps teach him to read. He learns to read upside down while she reads to him. This was influenced by the author, Ryan Boog. His sister Aimee used to teach him to read, and he learned how to read upside-down because of it.",
    flip: true,
  },
  {
    id: 2,
    chapter: 'Chapter 3',
    teaser: '"You\'re adopted."',
    detail: "Author Ryan Boog's sister Aimee once teased him by telling him he was adopted. This is how William eventually found out that he was.",
  },
  {
    id: 3,
    chapter: 'Chapter 5',
    teaser: 'Who was William talking to?',
    detail: "That's up for interpretation.",
  },
  {
    id: 4,
    chapter: 'Many Chapters',
    teaser: '"You can do anything if you put your mind to it."',
    detail: "This mantra comes from the author's Grandpa Boog and father, Jerry Boog.",
  },
  {
    id: 5,
    chapter: 'Chapter 12',
    teaser: 'The man on the docks in Boston...',
    detail: "Kennedy on the docks in Boston was none other than PJ Kennedy. He was a dockworker in Boston at the time. He also happened to be the paternal grandfather to John F. Kennedy.",
  },
  {
    id: 6,
    chapter: 'Chapter 14',
    teaser: 'Who is Dording?',
    detail: "Dording, the man who dropped crackers that attracted the goose that got whacked by William, is a friend of the author — of both Irish and Italian heritage.",
  },
  {
    id: 7,
    chapter: 'Chapter 22',
    teaser: 'William sings to the empty chair...',
    detail: 'The lyrics are inspired by Biffy Clyro (from Scotland) and their song "Space".',
  },
  {
    id: 8,
    chapter: 'Chapter 25',
    teaser: 'The swarm of bees',
    detail: "The swarm of bees scene is inspired by the author's sister, Aimee, who uncovered a massive wasp nest and jumped in a lake to escape the stings.",
  },
  {
    id: 9,
    chapter: 'Chapter 25',
    teaser: 'Arms crossed, rocking on his toes...',
    detail: "When William was seen with his arms crossed, rocking up and down from his toes, this was inspired by an action that the author's father, Jerry Boog, often would do towards the end of events.",
  },
  {
    id: 10,
    chapter: 'Chapter 25',
    teaser: 'Edward and Mollie Fitzgerald',
    detail: 'Edward and Mollie Fitzgerald are the real-life parents of F. Scott Fitzgerald.',
  },
  {
    id: 11,
    chapter: 'Chapter 27',
    teaser: '"Keep you in my pocket"',
    detail: "The \"Keep you in my pocket\" line is a line that the author's wife, Emily, used on their kids when they were little.",
  },
  {
    id: 12,
    chapter: 'Chapter 30',
    teaser: 'Frank and Olga McCarthy',
    detail: "Frank and Olga McCarthy are the grandparents of the author's wife, Emily.",
  },
  {
    id: 13,
    chapter: 'Chapter 34',
    teaser: 'Samuel Frederickson',
    detail: "Samuel Frederickson is a combination of the author's youngest son's first name and step-father's last name.",
  },
  {
    id: 14,
    chapter: 'Epilogue',
    teaser: 'William refuses surgery',
    detail: "William's refusal of surgery was inspired by his actual death certificate. He had intestinal blockage yet refused surgery.",
  },
  {
    id: 15,
    chapter: 'Epilogue',
    teaser: '"Found ya"',
    detail: "He was looking for someone who could give him inner peace. He believed it would come with building a name from nothing. He thought he may have some sort of spiritual encounter with his biological father or mother. Afterward, he realized the one who carried him and helped him build a name in spite of death and suffering was God Himself. The very thing that pushed William away from Him in a way proved His existence to him.",
  },
]

const revealed = ref<Set<number>>(new Set())

function toggle(id: number) {
  const next = new Set(revealed.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  revealed.value = next
}

const foundCount = computed(() => revealed.value.size)

function revealAll() {
  revealed.value = new Set(eggs.map((e) => e.id))
}
</script>

<template>
  <div class="min-h-dvh px-4 py-20 sm:py-24">
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12 space-y-4">
        <h1 class="text-3xl sm:text-4xl font-bold text-gold-400 tracking-tight">
          Easter Eggs
        </h1>
        <p class="text-neutral-500 text-lg italic">
          Hidden stories behind the story
        </p>

        <!-- Counter -->
        <div class="flex items-center justify-center gap-3 pt-2">
          <div class="text-sm text-neutral-500">
            <span class="text-gold-400 font-semibold">{{ foundCount }}</span>
            <span class="text-neutral-600"> / </span>
            <span>{{ eggs.length }}</span>
            <span class="ml-1">uncovered</span>
          </div>
          <button
            v-if="foundCount < eggs.length"
            class="text-xs text-neutral-600 hover:text-gold-500 transition-colors underline underline-offset-2 cursor-pointer"
            @click="revealAll"
          >
            reveal all
          </button>
        </div>
      </div>

      <!-- Spoiler warning -->
      <div class="text-center mb-10 py-3 px-4 rounded-xl border border-gold-500/10 bg-gold-500/5">
        <p class="text-sm text-gold-500/70">
          Contains spoilers. Tap a card to reveal.
        </p>
      </div>

      <!-- Eggs grid -->
      <div class="space-y-4">
        <button
          v-for="egg in eggs"
          :key="egg.id"
          class="w-full text-left cursor-pointer group"
          @click="toggle(egg.id)"
        >
          <div
            class="relative rounded-xl border transition-all duration-500 overflow-hidden"
            :class="
              revealed.has(egg.id)
                ? 'border-gold-500/20 bg-gold-500/5'
                : 'border-neutral-800 bg-surface-100 hover:border-gold-500/30 hover:bg-surface-50'
            "
          >
            <!-- Chapter badge + teaser (always visible) -->
            <div class="px-5 py-4 flex items-start gap-4">
              <span
                class="shrink-0 text-xs font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full transition-colors duration-500"
                :class="
                  revealed.has(egg.id)
                    ? 'bg-gold-500/20 text-gold-400'
                    : 'bg-neutral-800 text-neutral-500'
                "
              >
                {{ egg.chapter }}
              </span>
              <div class="flex-1 min-w-0">
                <p
                  class="font-medium transition-colors duration-300"
                  :class="
                    revealed.has(egg.id) ? 'text-gold-300' : 'text-neutral-300'
                  "
                >
                  {{ egg.teaser }}
                </p>
              </div>
              <!-- Reveal indicator -->
              <span
                class="shrink-0 text-neutral-600 transition-all duration-300"
                :class="revealed.has(egg.id) ? 'rotate-180 text-gold-500/50' : 'group-hover:text-neutral-400'"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </span>
            </div>

            <!-- Revealed content -->
            <Transition
              enter-active-class="transition-all duration-500 ease-out"
              enter-from-class="max-h-0 opacity-0"
              enter-to-class="max-h-96 opacity-100"
              leave-active-class="transition-all duration-300 ease-in"
              leave-from-class="max-h-96 opacity-100"
              leave-to-class="max-h-0 opacity-0"
            >
              <div v-if="revealed.has(egg.id)" class="overflow-hidden">
                <div class="px-5 pb-5 pt-1">
                  <div class="border-t border-gold-500/10 pt-4">
                    <p
                      class="text-neutral-400 leading-relaxed"
                      :class="egg.flip ? 'first-letter:rotate-180' : ''"
                    >
                      {{ egg.detail }}
                    </p>
                    <!-- Fun upside-down text easter egg within the easter egg -->
                    <p
                      v-if="egg.flip"
                      class="mt-3 text-sm text-gold-500/40 italic"
                      style="transform: rotate(180deg)"
                    >
                      Can you read this? Ryan could.
                    </p>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </button>
      </div>

      <!-- Footer -->
      <div class="mt-16 text-center space-y-4">
        <p class="text-sm text-neutral-600 italic">
          Know something we missed? The author might have hidden more than even he remembers.
        </p>
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
