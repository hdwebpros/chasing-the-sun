<script setup lang="ts">
const isOpen = ref(false)
const route = useRoute()

const navItems = [
  { label: 'Home', to: '/', icon: 'lucide:home' },
  { label: 'Read the eBook', to: '/read', icon: 'lucide:book-open' },
  { label: 'About the Author', to: '/about', icon: 'lucide:feather' },
  { label: 'Easter Eggs', to: '/easter-eggs', icon: 'lucide:sparkles' },
  { label: 'Research & Timeline', to: '/research', icon: 'lucide:scroll-text' },
  { label: 'Contact', to: '/contact', icon: 'lucide:send' },
  { label: 'Email Signup', to: '/signup', icon: 'lucide:mail-plus' },
]

function close() {
  isOpen.value = false
}

watch(isOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

watch(() => route.path, () => {
  isOpen.value = false
})
</script>

<template>
  <!-- Hamburger Button -->
  <button
    class="fixed top-4 right-4 z-[100] w-11 h-11 flex items-center justify-center rounded-full backdrop-blur-md border border-neutral-700/50 bg-surface-300/80 transition-all duration-300 cursor-pointer hover:border-gold-500/50"
    :class="isOpen ? 'bg-transparent border-transparent backdrop-blur-none' : ''"
    @click="isOpen = !isOpen"
  >
    <!-- Hamburger / X icon -->
    <div class="relative w-5 h-4 flex flex-col justify-between">
      <span
        class="block h-0.5 w-full bg-gold-400 rounded-full transition-all duration-300 origin-center"
        :class="isOpen ? 'translate-y-[7px] rotate-45' : ''"
      />
      <span
        class="block h-0.5 w-full bg-gold-400 rounded-full transition-all duration-300"
        :class="isOpen ? 'opacity-0 scale-x-0' : ''"
      />
      <span
        class="block h-0.5 w-full bg-gold-400 rounded-full transition-all duration-300 origin-center"
        :class="isOpen ? '-translate-y-[7px] -rotate-45' : ''"
      />
    </div>
  </button>

  <!-- Full-screen overlay -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-500 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-400 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[90] bg-surface-300/98 backdrop-blur-xl flex flex-col items-center justify-center"
      >
        <!-- Nav items -->
        <nav class="flex flex-col items-center gap-2 w-full max-w-sm px-6">
          <NuxtLink
            v-for="(item, i) in navItems"
            :key="item.to"
            :to="item.to"
            class="group flex items-center gap-4 w-full px-6 py-4 rounded-2xl text-xl font-medium transition-all duration-300 hover:bg-gold-500/10"
            :class="route.path === item.to ? 'text-gold-400' : 'text-neutral-300 hover:text-gold-400'"
            :style="{ transitionDelay: `${i * 50}ms` }"
            @click="close"
          >
            <Icon :name="item.icon" class="h-5 w-5 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </nav>

        <!-- Footer -->
        <div class="absolute bottom-8 text-center">
          <p class="text-sm text-neutral-600">Chasing the Sun</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
