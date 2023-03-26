import {
  createGlobalTheme,
  createGlobalThemeContract,
} from '@vanilla-extract/css'
import { colors } from './tokens/colors'

export const getVarName = (_value: string | null, path: string[]) =>
  path.join('-').replace('.', '_').replace('/', '__')

const makeColorScheme = (mode: 'light' | 'dark') => ({
  palette: {
    background: mode === 'light' ? colors['gray-2'] : colors['gray-8'],
    text: mode === 'light' ? colors['gray-8'] : colors['gray-1'],
    ...colors,
  },
})

const baseColorContract = createGlobalThemeContract(
  makeColorScheme('light'),
  getVarName,
)
createGlobalTheme(
  '[data-theme="light"]',
  baseColorContract,
  makeColorScheme('light'),
)
createGlobalTheme(
  '[data-theme="dark"]',
  baseColorContract,
  makeColorScheme('dark'),
)

export const vars = { ...baseColorContract }
