import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import * as IO from '@fp/IO'
import * as O from 'fp-ts/Option'
import * as IOO from 'fp-ts/IOOption'
import * as DOM from 'fp-ts-std/DOM'
import { pipe } from 'fp-ts/function'
import { useEffect } from 'react'
import { SetAtom } from 'jotai/core/atom'

type SupportedTheme = 'dark' | 'light'

const setDataset =
  <A extends string>(name: string, value: A) =>
  (htlmElement: HTMLElement): IO.IO<void> =>
  () => {
    htlmElement.dataset[name] = value
  }

const isHTMLElement = (e: Element): e is HTMLElement => e instanceof HTMLElement

const updateDOMDataTheme = (theme: SupportedTheme): IO.IO<void> =>
  pipe(
    document,
    DOM.querySelector('body'),
    IO.map(O.filter(isHTMLElement)),
    IOO.chainIOK(setDataset('theme', theme)),
  )

const themeAtom = atomWithStorage<SupportedTheme>('themePreference', 'light')

/*
 * TODO: a useEffect on theme would guarantee having different tab in-sync with theme change.
 * maybe rewrite atomWithStorage to extend its eventListener on storage with a DOM update?
 * https://github.com/pmndrs/jotai/blob/main/src/utils/atomWithStorage.ts#L83
 *
 * Only extending atomWithStorage will not propagate the DOM update in every tab
 *
 * const themeAtom = atom(
 *  (get) => get(baseThemeAtom),
 *  (_get, set, newValue: SupportedTheme) =>
 *    pipe(
 *      updateDOMDataTheme(newValue),
 *      IO.chain((theme) => () => set(baseThemeAtom, theme)),
 *      IO.execute,
 *    ),
 * )
 */

type UseTheme = [SupportedTheme, SetAtom<SupportedTheme, void>]
export const useTheme = (): UseTheme => {
  const [theme, setTheme] = useAtom(themeAtom)

  useEffect(() => {
    if (typeof window === 'undefined') return

    pipe(updateDOMDataTheme(theme), IO.execute)
  }, [theme])

  return [theme, setTheme]
}

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useTheme()

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Change theme
    </button>
  )
}
