<script setup lang="ts">
const { toc, currentChapter, currentChapterLabel, progress, isLoading, bookTitle, loadBook, goToChapter, next, prev, destroy, onTap, onSwipeLeft, onSwipeRight } = useBook()
const { mode, theme, cycleMode } = useReaderTheme()

const readerEl = ref<HTMLElement | null>(null)
const tocOpen = ref(false)
const showUI = ref(true)
let hideTimer: ReturnType<typeof setTimeout> | null = null

const themeIcon = computed(() => {
  switch (mode.value) {
    case 'dark': return 'lucide:moon'
    case 'light': return 'lucide:sun'
    case 'sepia': return 'lucide:coffee'
  }
})

useHead({
  title: () => currentChapterLabel.value ? `${currentChapterLabel.value} — Chasing the Sun` : 'Read — Chasing the Sun',
})

function resetHideTimer() {
  showUI.value = true
  if (hideTimer) clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    if (!tocOpen.value) showUI.value = false
  }, 3000)
}

function toggleUI() {
  showUI.value = !showUI.value
  if (hideTimer) clearTimeout(hideTimer)
  if (showUI.value) {
    hideTimer = setTimeout(() => {
      if (!tocOpen.value) showUI.value = false
    }, 3000)
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    next()
    resetHideTimer()
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    prev()
    resetHideTimer()
  }
}

onMounted(async () => {
  // Register gesture handlers before loading so they're ready for content hooks
  onSwipeLeft(() => { next(); resetHideTimer() })
  onSwipeRight(() => { prev(); resetHideTimer() })
  onTap(() => toggleUI())

  if (readerEl.value) {
    await loadBook(readerEl.value)
  }
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('mousemove', resetHideTimer)
  resetHideTimer()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('mousemove', resetHideTimer)
  if (hideTimer) clearTimeout(hideTimer)
  destroy()
})

function selectChapter(href: string) {
  goToChapter(href)
  tocOpen.value = false
}
</script>

<template>
  <div
    class="min-h-dvh flex flex-col relative transition-colors duration-300"
    :style="{ background: theme.pageBg }"
    @mousemove="resetHideTimer"
  >
    <!-- Top Bar -->
    <header
      class="fixed top-0 left-0 right-0 z-40 transition-all duration-500"
      :class="showUI ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'"
    >
      <div
        class="backdrop-blur-md border-b transition-colors duration-300"
        :style="{ background: theme.headerBg, borderColor: theme.borderColor }"
      >
        <div class="max-w-screen-xl mx-auto flex items-center justify-between px-4 h-14">
          <div class="flex items-center gap-3">
            <!-- TOC Toggle -->
            <Sheet v-model:open="tocOpen">
              <SheetTrigger as-child>
                <Button variant="ghost" size="icon" class="cursor-pointer" :style="{ color: theme.mutedColor }">
                  <Icon name="lucide:list" class="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                class="w-80 sm:w-96 p-0 transition-colors duration-300"
                :style="{ background: theme.pageBg, borderColor: theme.borderColor }"
              >
                <SheetHeader class="px-6 pt-6 pb-4">
                  <SheetTitle class="text-lg" :style="{ color: theme.headingColor }">Table of Contents</SheetTitle>
                  <SheetDescription class="text-sm" :style="{ color: theme.mutedColor }">{{ bookTitle }}</SheetDescription>
                </SheetHeader>
                <Separator :style="{ background: theme.borderColor }" />
                <ScrollArea class="h-[calc(100dvh-8rem)] px-2">
                  <nav class="py-3">
                    <template v-for="item in toc" :key="item.id">
                      <button
                        class="w-full text-left px-4 py-2.5 rounded-md text-sm transition-colors cursor-pointer"
                        :style="currentChapter === item.href
                          ? { color: theme.headingColor }
                          : { color: theme.mutedColor }"
                        @click="selectChapter(item.href)"
                      >
                        {{ item.label }}
                      </button>
                      <button
                        v-for="sub in item.subitems"
                        :key="sub.id"
                        class="w-full text-left pl-8 pr-4 py-2 rounded-md text-sm transition-colors cursor-pointer"
                        :style="currentChapter === sub.href
                          ? { color: theme.headingColor }
                          : { color: theme.mutedColor }"
                        @click="selectChapter(sub.href)"
                      >
                        {{ sub.label }}
                      </button>
                    </template>
                  </nav>
                </ScrollArea>
                <Separator :style="{ background: theme.borderColor }" />
                <div class="px-6 py-4">
                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLSdv3WNVPPugyl8dUrfJJmgsLUPDwFjXrwfRNX6oO667J9WMog/viewform?usp=header"
                    target="_blank"
                    rel="noopener"
                    class="flex items-center gap-2 text-sm transition-colors"
                    :style="{ color: theme.mutedColor }"
                  >
                    <Icon name="lucide:message-square" class="h-4 w-4" />
                    Send Feedback
                  </a>
                </div>
              </SheetContent>
            </Sheet>

            <!-- Back home -->
            <NuxtLink to="/">
              <Button variant="ghost" size="icon" class="cursor-pointer" :style="{ color: theme.mutedColor }">
                <Icon name="lucide:home" class="h-4 w-4" />
              </Button>
            </NuxtLink>
          </div>

          <!-- Current chapter label -->
          <span class="text-sm truncate max-w-xs hidden sm:block" :style="{ color: theme.mutedColor }">
            {{ currentChapterLabel || bookTitle }}
          </span>

          <!-- Right side actions -->
          <div class="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              class="cursor-pointer transition-colors duration-300"
              :style="{ color: theme.mutedColor }"
              :title="`Theme: ${mode}`"
              @click="cycleMode"
            >
              <Icon :name="themeIcon" class="h-4 w-4" />
            </Button>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSdv3WNVPPugyl8dUrfJJmgsLUPDwFjXrwfRNX6oO667J9WMog/viewform?usp=header"
              target="_blank"
              rel="noopener"
            >
              <Button variant="ghost" size="icon" class="cursor-pointer" :style="{ color: theme.mutedColor }">
                <Icon name="lucide:message-square" class="h-4 w-4" />
              </Button>
            </a>
            <a href="/chasing-the-sun-draft.epub" download>
              <Button variant="ghost" size="icon" class="cursor-pointer" :style="{ color: theme.mutedColor }">
                <Icon name="lucide:download" class="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>

      <!-- Progress bar -->
      <div class="h-0.5" :style="{ background: theme.borderColor }">
        <div
          class="h-full transition-all duration-300"
          :style="{ width: `${progress}%`, background: theme.headingColor }"
        />
      </div>
    </header>

    <!-- Loading state -->
    <div
      v-if="isLoading"
      class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 transition-colors duration-300"
      :style="{ background: theme.pageBg }"
    >
      <div
        class="w-10 h-10 border-2 rounded-full animate-spin"
        :style="{ borderColor: `${theme.headingColor}33`, borderTopColor: theme.headingColor }"
      />
      <p class="text-sm" :style="{ color: theme.mutedColor }">Loading book...</p>
    </div>

    <!-- Reader -->
    <main class="flex-1 pt-16 pb-12">
      <div ref="readerEl" class="reader-container w-full max-w-3xl mx-auto h-[calc(100dvh-7rem)]" />
    </main>

    <!-- Bottom Bar -->
    <footer
      class="fixed bottom-0 left-0 right-0 z-40 transition-all duration-500"
      :class="showUI ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'"
    >
      <div
        class="backdrop-blur-md border-t transition-colors duration-300"
        :style="{ background: theme.headerBg, borderColor: theme.borderColor }"
      >
        <div class="max-w-screen-xl mx-auto flex items-center justify-between px-4 h-12">
          <Button
            variant="ghost"
            size="sm"
            class="cursor-pointer"
            :style="{ color: theme.mutedColor }"
            @click="prev"
          >
            <Icon name="lucide:chevron-left" class="h-4 w-4 mr-1" />
            Previous
          </Button>

          <span class="text-xs" :style="{ color: theme.mutedColor }">
            {{ Math.round(progress) }}% complete
          </span>

          <Button
            variant="ghost"
            size="sm"
            class="cursor-pointer"
            :style="{ color: theme.mutedColor }"
            @click="next"
          >
            Next
            <Icon name="lucide:chevron-right" class="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
.reader-container iframe {
  border: none !important;
  background: transparent !important;
}
</style>
