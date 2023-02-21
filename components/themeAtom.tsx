import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import * as O from '@fp-ts/core/Option'
import * as Z from '@effect/io/Effect'
import { constVoid, pipe } from '@fp-ts/core/function'
import { useEffect } from 'react'

type SupportedTheme = 'dark' | 'light'

const setDataset =
  <A extends string>(name: string, value: A) =>
  (htlmElement: HTMLElement): Z.Effect<never, never, void> =>
    Z.sync(() => {
      htlmElement.dataset[name] = value
    })

const DOMquerySelector =
  (q: string) =>
  (parentNode: ParentNode): Z.Effect<never, never, O.Option<Element>> =>
    Z.sync(() => O.fromNullable(parentNode.querySelector(q)))

const isHTMLElement = (e: Element): e is HTMLElement => e instanceof HTMLElement

const updateDOMDataTheme = (
  theme: SupportedTheme,
): Z.Effect<never, never, void> =>
  pipe(
    document,
    DOMquerySelector('body'),
    Z.map(O.filter(isHTMLElement)),
    Z.flatMap(
      O.match(() => Z.succeed(constVoid()), setDataset('theme', theme)),
    ),
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
export const useTheme = () => {
  const [theme, setTheme] = useAtom(themeAtom)

  useEffect(() => {
    if (typeof window === 'undefined') return
    Z.runSync(updateDOMDataTheme(theme))
  }, [theme])

  return [theme, setTheme] as const
}

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useTheme()

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Change theme
    </button>
  )
}
