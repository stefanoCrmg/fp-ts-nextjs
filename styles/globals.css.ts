import { globalStyle } from '@vanilla-extract/css'
import { vars } from 'styles/theme.css'

globalStyle('html', {
  margin: 0,
  padding: 0,
  borderWidth: 0,
  fontSize: '100%',
  boxSizing: 'content-box',
  backgroundColor: vars.palette.background,
  color: vars.palette.text,
  textRendering: 'optimizeLegibility',
})
