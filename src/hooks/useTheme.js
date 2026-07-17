import { useCallback, useEffect, useState } from 'react'

function getInitialTheme() {
  try {
    const stored = localStorage.getItem('lucid-theme')
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    /* localStorage unavailable */
  }
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('lucid-theme', theme)
    } catch {
      /* localStorage unavailable */
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, toggleTheme }
}
