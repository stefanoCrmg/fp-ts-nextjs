import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { useEffect } from 'react'
import * as IO from '@fp/IO'

type SupportedTheme = 'dark' | 'light'

const updateDataTheme =
  (theme: SupportedTheme): IO.IO<void> =>
  () =>
    (document.body.dataset.theme = theme)

export const themeAtom = atomWithStorage<SupportedTheme>(
  'themePreference',
  'light',
)

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useAtom(themeAtom)
  useEffect(() => {
    updateDataTheme(theme)()
  }, [theme])

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Change theme
    </button>
  )
}
