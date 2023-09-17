import { useEffect, useLayoutEffect, useState } from 'react'

export enum Theme {
  LIGTH = 'light',
  DARK = 'dark',
}

export enum StorageKey {
  THEME = 'THEME',
}

export function useTheme(init: Theme) {
  const [theme, setTheme] = useState(init)

  if (typeof window !== 'undefined') {
    useLayoutEffect(() => {
      if (localStorage.getItem(StorageKey.THEME))
        setTheme(localStorage.getItem(StorageKey.THEME) as Theme)
      else if (window.matchMedia('(prefers-color-scheme: dark)').matches)
        setTheme(Theme.DARK)
    }, [])
  }

  useEffect(() => {
    document.documentElement.setAttribute('theme', theme)
    localStorage.setItem(StorageKey.THEME, theme)
  }, [theme])

  return [theme, setTheme] as const
}
