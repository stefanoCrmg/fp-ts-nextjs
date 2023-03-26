import { globalStyle } from '@vanilla-extract/css'
import { vars } from 'styles/theme.css'
import * as GRID from './grid.css'
import * as SPACES from './tokens/space.css'
import * as TYPOGRAPHY from './tokens/typography.css'

globalStyle('html, body', {
  height: '100%',
  textRendering: 'optimizeLegibility',
  backgroundColor: vars.palette.background,
  color: vars.palette.text,
})

globalStyle('#__next', {
  isolation: 'isolate',
})

globalStyle(':root', {
  vars: {
    ...GRID.globalVars,
    ...TYPOGRAPHY.globalVars,
    ...SPACES.globalVars,
  },
})
