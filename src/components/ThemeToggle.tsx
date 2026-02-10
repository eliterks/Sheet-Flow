import { useEffect, useState } from 'react'

const storageKey = 'qm-theme'

export function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved === 'dark') return true
    if (saved === 'light') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
      localStorage.setItem(storageKey, 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem(storageKey, 'light')
    }
  }, [dark])

  return (
    <button
      className="rounded-md border px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 dark:bg-black/20 dark:hover:bg-black/30"
      onClick={() => setDark((d) => !d)}
      aria-label="Toggle theme"
    >
      {dark ? 'Light' : 'Dark'}
    </button>
  )
}
