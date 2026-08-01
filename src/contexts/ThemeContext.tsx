import { createContext, useContext, useEffect, useState, useRef, useCallback, type ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const STORAGE_KEY = 'itflow-theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'light' || stored === 'dark') return stored
    } catch {}
    return 'dark'
  })

  const [overlay, setOverlay] = useState<Theme | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const phaseRef = useRef(0)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {}
  }, [theme])

  useEffect(() => {
    if (!overlay) return
    const el = overlayRef.current
    if (!el) return

    phaseRef.current = 0
    const isDark = overlay === 'dark'
    const startPos = isDark ? 'translateY(100%)' : 'translateY(-100%)'

    el.style.transition = 'none'
    el.style.transform = startPos
    el.offsetHeight

    el.style.transition = 'transform 0.45s cubic-bezier(0.65, 0, 0.35, 1)'
    el.style.transform = 'translateY(0)'
  }, [overlay])

  const onTransitionEvent = useCallback(() => {
    const el = overlayRef.current
    if (!el || !overlay) return

    if (phaseRef.current === 0) {
      phaseRef.current = 1

      setThemeState(overlay)

      const isDark = overlay === 'dark'
      const endPos = isDark ? 'translateY(-100%)' : 'translateY(100%)'

      el.style.transition = 'transform 0.45s cubic-bezier(0.65, 0, 0.35, 1)'
      el.style.transform = endPos
    } else {
      phaseRef.current = 0
      setOverlay(null)
    }
  }, [overlay])

  const toggleTheme = useCallback(() => {
    if (overlay) return
    const target = theme === 'light' ? 'dark' : 'light'
    setOverlay(target)
  }, [theme, overlay])

  const setTheme = useCallback((t: Theme) => {
    if (overlay) return
    setOverlay(t)
  }, [overlay])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
      {overlay && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[99999] pointer-events-none"
          style={{
            backgroundColor: overlay === 'dark' ? '#09090b' : '#ffffff',
            willChange: 'transform',
          }}
          onTransitionEnd={onTransitionEvent}
        />
      )}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
