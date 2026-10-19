import { useEffect, useState } from 'react'

const STORAGE_KEY = 'recipeFinder.darkMode'

function getInitialTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) return stored === 'true'
  } catch {
    // ignore storage errors and fall through to system preference
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

export function useDarkMode() {
  const [isDark, setIsDark] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    try {
      localStorage.setItem(STORAGE_KEY, String(isDark))
    } catch {
      // ignore storage write failures
    }
  }, [isDark])

  return [isDark, () => setIsDark((prev) => !prev)]
}
