import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  future: { compatibilityVersion: 4 },

  modules: [
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    'shadcn-nuxt',
  ],

  fonts: {
    families: [
      {
        name: 'EB Garamond',
        provider: 'google',
        weights: [400, 500, 600, 700, 800],
        styles: ['normal', 'italic'],
      },
    ],
  },

  css: ['~/assets/css/tailwind.css'],

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['epubjs'],
    },
  },
  
  shadcn: {
    prefix: "",
    componentDir: "./app/components/ui",
  },

  app: {
    head: {
      title: 'Chasing the Sun',
      meta: [
        { name: 'description', content: 'Read Chasing the Sun — an immersive online reading experience.' },
        { name: 'theme-color', content: '#0d0d10' },
      ],
      htmlAttrs: { lang: 'en' },
    },
  },
})
