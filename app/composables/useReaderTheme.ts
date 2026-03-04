export type ThemeMode = 'dark' | 'light' | 'sepia'

export interface ThemeConfig {
  pageBg: string
  headerBg: string
  textColor: string
  mutedColor: string
  headingColor: string
  borderColor: string
}

export const THEMES: Record<ThemeMode, ThemeConfig> = {
  dark: {
    pageBg: '#0d0d10',
    headerBg: 'rgba(17,17,20,0.9)',
    textColor: '#d4d4d4',
    mutedColor: '#a8a29e',
    headingColor: '#d4a54a',
    borderColor: '#262626',
  },
  light: {
    pageBg: '#ffffff',
    headerBg: 'rgba(255,255,255,0.9)',
    textColor: '#1a1a1a',
    mutedColor: '#6b7280',
    headingColor: '#92600a',
    borderColor: '#e5e7eb',
  },
  sepia: {
    pageBg: '#f4ecd8',
    headerBg: 'rgba(244,236,216,0.9)',
    textColor: '#3d2b1f',
    mutedColor: '#7c6a56',
    headingColor: '#6b4226',
    borderColor: '#d4c4a8',
  },
}

export function useReaderTheme() {
  const mode = useState<ThemeMode>('reader-theme', () => {
    if (import.meta.client) {
      return (localStorage.getItem('cts-theme') as ThemeMode) || 'dark'
    }
    return 'dark'
  })

  const theme = computed(() => THEMES[mode.value])

  function setMode(m: ThemeMode) {
    mode.value = m
    if (import.meta.client) {
      localStorage.setItem('cts-theme', m)
    }
  }

  function cycleMode() {
    const modes: ThemeMode[] = ['dark', 'light', 'sepia']
    const idx = modes.indexOf(mode.value)
    setMode(modes[(idx + 1) % modes.length])
  }

  return { mode, theme, setMode, cycleMode }
}
