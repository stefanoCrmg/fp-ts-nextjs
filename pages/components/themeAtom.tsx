import { atom, useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import * as IO from '@fp/IO'
import * as O from 'fp-ts/Option'
import * as IOO from 'fp-ts/IOOption'
import * as DOM from 'fp-ts-std/DOM'
import { pipe } from 'fp-ts/function'

type SupportedTheme = 'dark' | 'light'

const setDataset =
  <A extends string>(name: string, value: A) =>
  (htlmElement: HTMLElement): IO.IO<A> =>
  () => {
    htlmElement.dataset[name] = value
    return value
  }

const updateDOMDataTheme = (theme: SupportedTheme): IO.IO<SupportedTheme> =>
  pipe(
    document,
    DOM.querySelector('body'),
    IOO.chainOptionK((e) => (e instanceof HTMLElement ? O.some(e) : O.none)),
    IOO.chainIOK(setDataset('theme', theme)),
    IO.map(O.getOrElse(() => theme)),
  )

export const baseThemeAtom = atomWithStorage<SupportedTheme>(
  'themePreference',
  'light',
)

const themeAtom = atom(
  (get) => get(baseThemeAtom),
  (_get, set, newValue: SupportedTheme) =>
    pipe(
      updateDOMDataTheme(newValue),
      IO.chain((theme) => () => set(baseThemeAtom, theme)),
      IO.execute,
    ),
)

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useAtom(themeAtom)

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Change theme
    </button>
  )
}
