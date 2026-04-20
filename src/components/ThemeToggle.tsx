'use client'

import { useEffect, useState } from 'react'
import { MoonStar, SunMedium } from 'lucide-react'

const STORAGE_KEY = 'uninest-theme'

type ThemeMode = 'light' | 'dark'

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'dark'
  }

  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') {
    return stored
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>('dark')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const applyTheme = () => {
      const nextTheme = getInitialTheme()
      setTheme(nextTheme)
      document.documentElement.classList.toggle('dark', nextTheme === 'dark')
    }

    applyTheme()

    const handleStorage = () => applyTheme()
    window.addEventListener('storage', handleStorage)

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemChange = () => {
      if (!window.localStorage.getItem(STORAGE_KEY)) {
        applyTheme()
      }
    }

    mediaQuery.addEventListener('change', handleSystemChange)
    setReady(true)

    return () => {
      window.removeEventListener('storage', handleStorage)
      mediaQuery.removeEventListener('change', handleSystemChange)
    }
  }, [])

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    document.documentElement.classList.toggle('dark', nextTheme === 'dark')
    window.localStorage.setItem(STORAGE_KEY, nextTheme)
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:border-electric-blue hover:text-electric-blue"
      aria-label={ready && theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={ready && theme === 'dark' ? 'Light mode' : 'Dark mode'}
    >
      {ready && theme === 'dark' ? <SunMedium size={18} /> : <MoonStar size={18} />}
    </button>
  )
}
