import { globalStyle } from '@vanilla-extract/css'
import { vars } from 'styles/theme.css'
export * from './grid.css'

globalStyle('html, body', {
  height: '100%',
  textRendering: 'optimizeLegibility',
  backgroundColor: vars.palette.background,
  color: vars.palette.text,
})

globalStyle('#__next', {
  isolation: 'isolate',
})
