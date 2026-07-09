import ePub, { type Book, type Rendition, type NavItem } from 'epubjs'
import { THEMES, useReaderTheme } from './useReaderTheme'

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
  const chapterProgress = ref(0)
  const totalLocations = ref(0)
  const isLoading = ref(true)
  const bookTitle = ref('')
  const bookAuthor = ref('')
  const atStart = ref(true)
  const atEnd = ref(false)

  const { theme, mode } = useReaderTheme()

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
    let lastX = 0
    let lastY = 0

    doc.addEventListener('touchstart', (e: TouchEvent) => {
      const touch = e.touches[0]
      startX = lastX = touch.clientX
      startY = lastY = touch.clientY
      startTime = Date.now()
    }, { passive: true })

    // Track the latest position so touchcancel (see below) still knows where
    // the finger ended up.
    doc.addEventListener('touchmove', (e: TouchEvent) => {
      const touch = e.touches[0]
      if (touch) { lastX = touch.clientX; lastY = touch.clientY }
    }, { passive: true })

    function evaluate(endX: number, endY: number, allowTap: boolean) {
      const dx = endX - startX
      const dy = endY - startY
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
      } else if (allowTap && absDx < 10 && absDy < 10 && elapsed < 300) {
        // Tap: minimal movement, quick touch
        onTapHandler?.()
      }
    }

    doc.addEventListener('touchend', (e: TouchEvent) => {
      const touch = e.changedTouches[0]
      evaluate(touch.clientX, touch.clientY, true)
    }, { passive: true })

    // iOS Safari fires touchcancel (not touchend) when it decides a drag is a
    // native scroll. Recover the swipe from the last tracked position; never
    // treat a cancel as a tap.
    doc.addEventListener('touchcancel', () => {
      evaluate(lastX, lastY, false)
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

  async function loadBook(el: HTMLElement, epubUrl = '/chasing-the-sun-draft.epub') {
    isLoading.value = true
    const b = ePub(epubUrl)
    book.value = b

    const r = b.renderTo(el, {
      width: '100%',
      height: '100%',
      spread: 'none',
      flow: 'paginated',
    })

    rendition.value = r

    // Apply theme styles directly via content hook (avoids epubjs theme layering issues)
    function applyThemeToDoc(doc: Document) {
      const cfg = THEMES[mode.value]
      let styleEl = doc.getElementById('cts-theme')
      if (!styleEl) {
        styleEl = doc.createElement('style')
        styleEl.id = 'cts-theme'
        doc.head.appendChild(styleEl)
      }
      styleEl.textContent = `
        html, body, p, div, span, li, td, th, em, i, strong, b {
          color: ${cfg.textColor} !important;
          background: transparent !important;
        }
        html, body, p {
          font-family: "EB Garamond", "Garamond", Georgia, serif !important;
          line-height: 1.8 !important;
        }
        html, body {
          /* Reserve horizontal gestures for our swipe handler. Without this,
             iOS Safari treats a horizontal drag on the paginated columns as a
             native pan and fires touchcancel instead of touchend, so the swipe
             is lost. pan-y still allows any vertical scrolling. */
          touch-action: pan-y !important;
          overscroll-behavior: none !important;
        }
        body {
          padding: 0 1rem !important;
          max-width: 65ch;
          margin: 0 auto !important;
          font-size: 1.125rem !important;
        }
        p { margin-bottom: 0.75em !important; }
        h1, h2, h3, h4, h5, h6 {
          font-family: "EB Garamond", "Garamond", Georgia, serif !important;
          color: ${cfg.headingColor} !important;
        }
        h1, h2, h3, h4, h5, h6,
        h1 span, h2 span, h3 span, h4 span, h5 span, h6 span {
          color: ${cfg.headingColor} !important;
        }
        h1 { font-size: 2rem !important; font-weight: 700 !important; text-align: center !important; margin-top: 2em !important; margin-bottom: 0.5em !important; }
        h2 { font-size: 1.5rem !important; font-weight: 700 !important; text-align: center !important; margin-top: 1.5em !important; margin-bottom: 0.5em !important; }
        h3, h4, h5, h6 { margin-top: 1.5em !important; margin-bottom: 0.5em !important; }
        a { color: ${cfg.headingColor} !important; }
        img { max-width: 100% !important; height: auto !important; }
        blockquote { border-left: 3px solid ${cfg.headingColor} !important; padding-left: 1em !important; color: ${cfg.mutedColor} !important; font-style: italic !important; }
      `
    }

    // Track content documents so we can re-theme them
    const contentDocs: Document[] = []

    // Attach touch gesture listeners and theme to each content document (inside iframe)
    r.hooks.content.register((contents: any) => {
      const doc = contents.document
      if (doc) {
        attachTouchListeners(doc)
        applyThemeToDoc(doc)
        contentDocs.push(doc)
      }
    })

    // Watch for theme changes — update the single style element in each iframe
    watch(mode, () => {
      contentDocs.forEach((doc) => {
        try { applyThemeToDoc(doc) } catch {}
      })
    })

    await r.display()

    const nav = await b.loaded.navigation
    toc.value = flattenToc(nav.toc)

    const metadata = await b.loaded.metadata
    bookTitle.value = metadata.title || 'Chasing the Sun'
    bookAuthor.value = metadata.creator || ''

    try {
      await b.locations.generate(1024)
      totalLocations.value = b.locations.length()
    } catch {
      totalLocations.value = 0
    }

    // Position is saved per-epub and tagged with the spine length, so a different
    // build (or the ?epub=from-drive preview) never tries to restore a stale CFI —
    // that mismatch is what throws epubjs IndexSizeErrors.
    await b.loaded.spine.catch(() => {})
    const posKey = `cts-position:${epubUrl}`
    const spineCount = (b.spine as any)?.spineItems?.length ?? 0

    r.on('relocated', (location: any) => {
      if (b.locations.length()) {
        progress.value = b.locations.percentageFromCfi(location.start.cfi) * 100
      }
      const displayed = location.start?.displayed
      if (displayed && displayed.total > 0) {
        chapterProgress.value = (displayed.page / displayed.total) * 100
      } else {
        chapterProgress.value = 0
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
        localStorage.setItem(posKey, JSON.stringify({ cfi: location.start.cfi, n: spineCount }))
      }
    })

    // Restore position — only if it was saved for this same build (matching spine
    // length). Otherwise the structure changed and the CFI is stale; clear it.
    if (import.meta.client) {
      let saved: { cfi?: string, n?: number } | null = null
      try { saved = JSON.parse(localStorage.getItem(posKey) || 'null') } catch {}
      if (saved?.cfi && saved.n === spineCount) {
        try {
          await r.display(saved.cfi)
        } catch {
          localStorage.removeItem(posKey)
          await r.display().catch(() => {})
        }
      } else if (saved) {
        localStorage.removeItem(posKey)
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
    chapterProgress,
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
