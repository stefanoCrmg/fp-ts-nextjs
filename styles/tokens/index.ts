import { colors } from './colors'
import { space } from './space'
import {
  fontSizes,
  fontWeights,
  fonts,
  letterSpacings,
  lineHeights,
} from './typography'

export const tokens = {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  letterSpacings,
  lineHeights,
  space,
}

export type Tokens = typeof tokens
