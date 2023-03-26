import { colors } from './colors'
import { space } from './space.css'
import {
  fontSizes,
  fontWeights,
  fonts,
  letterSpacings,
  lineHeights,
} from './typography.css'

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
