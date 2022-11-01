import { globalStyle } from '@vanilla-extract/css'
import { vars } from 'styles/theme.css'
import './resets.css'

globalStyle('#__next', {
  margin: 0,
  padding: 0,
  borderWidth: 0,
  height: '100%',
  fontSize: '100%',
  backgroundColor: vars.palette.background,
  color: vars.palette.text,
  textRendering: 'optimizeLegibility',
})
