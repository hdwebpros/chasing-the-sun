<script setup lang="ts">
const { toc, currentChapter, currentChapterLabel, progress, isLoading, bookTitle, loadBook, goToChapter, next, prev, destroy } = useBook()

const readerEl = ref<HTMLElement | null>(null)
const tocOpen = ref(false)
const showUI = ref(true)
let hideTimer: ReturnType<typeof setTimeout> | null = null

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
  <div class="min-h-dvh flex flex-col bg-surface-300 relative" @mousemove="resetHideTimer">
    <!-- Top Bar -->
    <header
      class="fixed top-0 left-0 right-0 z-40 transition-all duration-500"
      :class="showUI ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'"
    >
      <div class="bg-surface-200/90 backdrop-blur-md border-b border-neutral-800/50">
        <div class="max-w-screen-xl mx-auto flex items-center justify-between px-4 h-14">
          <div class="flex items-center gap-3">
            <!-- TOC Toggle -->
            <Sheet v-model:open="tocOpen">
              <SheetTrigger as-child>
                <Button variant="ghost" size="icon" class="text-neutral-400 hover:text-gold-400 cursor-pointer">
                  <Icon name="lucide:list" class="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" class="bg-surface-200 border-neutral-800 w-80 sm:w-96 p-0">
                <SheetHeader class="px-6 pt-6 pb-4">
                  <SheetTitle class="text-gold-400 text-lg">Table of Contents</SheetTitle>
                  <SheetDescription class="text-neutral-500 text-sm">{{ bookTitle }}</SheetDescription>
                </SheetHeader>
                <Separator class="bg-neutral-800" />
                <ScrollArea class="h-[calc(100dvh-8rem)] px-2">
                  <nav class="py-3">
                    <button
                      v-for="item in toc"
                      :key="item.id"
                      class="w-full text-left px-4 py-2.5 rounded-md text-sm transition-colors cursor-pointer"
                      :class="currentChapter === item.href
                        ? 'bg-gold-500/10 text-gold-400'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'"
                      @click="selectChapter(item.href)"
                    >
                      {{ item.label }}
                    </button>
                  </nav>
                </ScrollArea>
                <Separator class="bg-neutral-800" />
                <div class="px-6 py-4">
                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLSdv3WNVPPugyl8dUrfJJmgsLUPDwFjXrwfRNX6oO667J9WMog/viewform?usp=header"
                    target="_blank"
                    rel="noopener"
                    class="flex items-center gap-2 text-sm text-neutral-500 hover:text-gold-400 transition-colors"
                  >
                    <Icon name="lucide:message-square" class="h-4 w-4" />
                    Send Feedback
                  </a>
                </div>
              </SheetContent>
            </Sheet>

            <!-- Back home -->
            <NuxtLink to="/">
              <Button variant="ghost" size="icon" class="text-neutral-400 hover:text-gold-400 cursor-pointer">
                <Icon name="lucide:home" class="h-4 w-4" />
              </Button>
            </NuxtLink>
          </div>

          <!-- Current chapter label -->
          <span class="text-sm text-neutral-500 truncate max-w-xs hidden sm:block">
            {{ currentChapterLabel || bookTitle }}
          </span>

          <!-- Right side actions -->
          <div class="flex items-center gap-2">
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSdv3WNVPPugyl8dUrfJJmgsLUPDwFjXrwfRNX6oO667J9WMog/viewform?usp=header"
              target="_blank"
              rel="noopener"
            >
              <Button variant="ghost" size="icon" class="text-neutral-400 hover:text-gold-400 cursor-pointer">
                <Icon name="lucide:message-square" class="h-4 w-4" />
              </Button>
            </a>
            <a href="/chasing-the-sun.epub" download>
              <Button variant="ghost" size="icon" class="text-neutral-400 hover:text-gold-400 cursor-pointer">
                <Icon name="lucide:download" class="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>

      <!-- Progress bar -->
      <div class="h-0.5 bg-surface-400">
        <div
          class="h-full bg-gradient-to-r from-gold-600 to-gold-400 transition-all duration-300"
          :style="{ width: `${progress}%` }"
        />
      </div>
    </header>

    <!-- Loading state -->
    <div
      v-if="isLoading"
      class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-surface-300"
    >
      <div class="w-10 h-10 border-2 border-gold-500/30 border-t-gold-400 rounded-full animate-spin" />
      <p class="text-neutral-500 text-sm">Loading book...</p>
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
      <div class="bg-surface-200/90 backdrop-blur-md border-t border-neutral-800/50">
        <div class="max-w-screen-xl mx-auto flex items-center justify-between px-4 h-12">
          <Button
            variant="ghost"
            size="sm"
            class="text-neutral-400 hover:text-gold-400 cursor-pointer"
            @click="prev"
          >
            <Icon name="lucide:chevron-left" class="h-4 w-4 mr-1" />
            Previous
          </Button>

          <span class="text-xs text-neutral-600">
            {{ Math.round(progress) }}% complete
          </span>

          <Button
            variant="ghost"
            size="sm"
            class="text-neutral-400 hover:text-gold-400 cursor-pointer"
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
