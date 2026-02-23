import ePub, { type Book, type Rendition, type NavItem } from 'epubjs'

interface TocItem {
  id: string
  label: string
  href: string
  subitems: TocItem[]
}

type GestureHandler = () => void

export function useBook() {
  const book = shallowRef<Book | null>(null)
  const rendition = shallowRef<Rendition | null>(null)
  const toc = ref<TocItem[]>([])
  const currentChapter = ref('')
  const currentChapterLabel = ref('')
  const progress = ref(0)
  const totalLocations = ref(0)
  const isLoading = ref(true)
  const bookTitle = ref('')
  const bookAuthor = ref('')
  const atStart = ref(true)
  const atEnd = ref(false)

  let onTapHandler: GestureHandler | null = null
  let onSwipeLeftHandler: GestureHandler | null = null
  let onSwipeRightHandler: GestureHandler | null = null

  function onTap(handler: GestureHandler) { onTapHandler = handler }
  function onSwipeLeft(handler: GestureHandler) { onSwipeLeftHandler = handler }
  function onSwipeRight(handler: GestureHandler) { onSwipeRightHandler = handler }

  function attachTouchListeners(doc: Document) {
    let startX = 0
    let startY = 0
    let startTime = 0

    doc.addEventListener('touchstart', (e: TouchEvent) => {
      const touch = e.touches[0]
      startX = touch.clientX
      startY = touch.clientY
      startTime = Date.now()
    }, { passive: true })

    doc.addEventListener('touchend', (e: TouchEvent) => {
      const touch = e.changedTouches[0]
      const dx = touch.clientX - startX
      const dy = touch.clientY - startY
      const elapsed = Date.now() - startTime

      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)

      // Swipe: horizontal movement > 50px, more horizontal than vertical, under 500ms
      if (absDx > 50 && absDx > absDy * 1.5 && elapsed < 500) {
        if (dx < 0) {
          onSwipeLeftHandler?.()
        } else {
          onSwipeRightHandler?.()
        }
      } else if (absDx < 10 && absDy < 10 && elapsed < 300) {
        // Tap: minimal movement, quick touch
        onTapHandler?.()
      }
    }, { passive: true })
  }

  function flattenToc(items: NavItem[]): TocItem[] {
    return items.map(item => ({
      id: item.id,
      label: item.label.trim(),
      href: item.href,
      subitems: item.subitems ? flattenToc(item.subitems) : [],
    }))
  }

  async function loadBook(el: HTMLElement) {
    isLoading.value = true
    const b = ePub('/chasing-the-sun.epub')
    book.value = b

    const r = b.renderTo(el, {
      width: '100%',
      height: '100%',
      spread: 'none',
      flow: 'paginated',
    })

    rendition.value = r

    // Apply reading styles
    r.themes.default({
      'html': {
        'font-family': '"EB Garamond", "Garamond", Georgia, serif !important',
        'color': '#d4d4d4 !important',
        'background': 'transparent !important',
        'line-height': '1.8 !important',
      },
      'body': {
        'font-family': '"EB Garamond", "Garamond", Georgia, serif !important',
        'color': '#d4d4d4 !important',
        'background': 'transparent !important',
        'padding': '0 1rem !important',
        'max-width': '65ch',
        'margin': '0 auto !important',
        'font-size': '1.2rem !important',
        'line-height': '1.8 !important',
      },
      'p': {
        'font-family': '"EB Garamond", "Garamond", Georgia, serif !important',
        'color': '#d4d4d4 !important',
        'line-height': '1.8 !important',
        'margin-bottom': '0.75em !important',
      },
      'h1, h2, h3, h4, h5, h6': {
        'font-family': '"EB Garamond", "Garamond", Georgia, serif !important',
        'color': '#d4a54a !important',
        'margin-top': '1.5em !important',
        'margin-bottom': '0.5em !important',
      },
      'a': {
        'color': '#d4a54a !important',
      },
      'img': {
        'max-width': '100% !important',
        'height': 'auto !important',
      },
      'blockquote': {
        'border-left': '3px solid #d4a54a !important',
        'padding-left': '1em !important',
        'color': '#a8a29e !important',
        'font-style': 'italic !important',
      },
      'em, i': {
        'color': '#e5e5e5 !important',
      },
    })

    // Attach touch gesture listeners to each content document (inside iframe)
    r.hooks.content.register((contents: any) => {
      const doc = contents.document
      if (doc) attachTouchListeners(doc)
    })

    await r.display()

    const nav = await b.loaded.navigation
    toc.value = flattenToc(nav.toc)

    const metadata = await b.loaded.metadata
    bookTitle.value = metadata.title || 'Chasing the Sun'
    bookAuthor.value = metadata.creator || ''

    await b.locations.generate(1024)
    totalLocations.value = b.locations.length()

    r.on('relocated', (location: any) => {
      if (b.locations.length()) {
        progress.value = b.locations.percentageFromCfi(location.start.cfi) * 100
      }
      atStart.value = location.atStart ?? false
      atEnd.value = location.atEnd ?? false

      // Find current chapter
      const href = location.start?.href
      if (href) {
        const found = findChapterByHref(toc.value, href)
        if (found) {
          currentChapter.value = found.href
          currentChapterLabel.value = found.label
        }
      }

      // Save position
      if (import.meta.client) {
        localStorage.setItem('cts-position', location.start.cfi)
      }
    })

    // Restore position
    if (import.meta.client) {
      const savedCfi = localStorage.getItem('cts-position')
      if (savedCfi) {
        await r.display(savedCfi)
      }
    }

    isLoading.value = false
  }

  function findChapterByHref(items: TocItem[], href: string): TocItem | null {
    for (const item of items) {
      if (href.includes(item.href.split('#')[0])) return item
      if (item.subitems.length) {
        const found = findChapterByHref(item.subitems, href)
        if (found) return found
      }
    }
    return null
  }

  function goToChapter(href: string) {
    rendition.value?.display(href)
  }

  function next() {
    rendition.value?.next()
  }

  function prev() {
    rendition.value?.prev()
  }

  function destroy() {
    book.value?.destroy()
    book.value = null
    rendition.value = null
  }

  return {
    book,
    rendition,
    toc,
    currentChapter,
    currentChapterLabel,
    progress,
    totalLocations,
    isLoading,
    bookTitle,
    bookAuthor,
    atStart,
    atEnd,
    loadBook,
    goToChapter,
    next,
    prev,
    destroy,
    onTap,
    onSwipeLeft,
    onSwipeRight,
  }
}
