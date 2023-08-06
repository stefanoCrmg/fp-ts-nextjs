import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import * as O from 'effect/Option'
import * as Effect from 'effect/Effect'
import { constVoid, pipe } from 'effect/Function'

type SupportedTheme = 'dark' | 'light'

const setDataset =
  <A extends string>(name: string, value: A) =>
  (htlmElement: HTMLElement): Effect.Effect<never, never, void> =>
    Effect.sync(() => {
      htlmElement.dataset[name] = value
    })

const DOMquerySelector =
  (q: string) =>
  (parentNode: ParentNode): Effect.Effect<never, never, O.Option<Element>> =>
    Effect.sync(() => O.fromNullable(parentNode.querySelector(q)))

const isHTMLElement = (e: Element): e is HTMLElement => e instanceof HTMLElement

const updateDOMDataTheme = (
  theme: SupportedTheme,
): Effect.Effect<never, never, void> =>
  pipe(
    document,
    DOMquerySelector('body'),
    Effect.map(O.filter(isHTMLElement)),
    Effect.flatMap(
      O.match({
        onNone: () => Effect.succeed(constVoid()),
        onSome: setDataset('theme', theme),
      }),
    ),
  )

const themeAtom = atomWithStorage<SupportedTheme>('themePreference', 'light')

/*
 * TODO: a useEffect on theme would guarantee having different tab in-sync with theme change, but it will force at least one repaint?
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
  const wrapSetTheme = (theme: SupportedTheme) =>
    pipe(
      updateDOMDataTheme(theme),
      Effect.zip(Effect.sync(() => setTheme(theme))),
      Effect.runSync,
    )

  return [theme, wrapSetTheme] as const
}

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useTheme()

  return (
    <button
      onClick={() => {
        setTheme(theme === 'dark' ? 'light' : 'dark')
      }}
    >
      Change theme
    </button>
  )
}
