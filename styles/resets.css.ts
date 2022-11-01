import { globalStyle as resetStyle } from '@vanilla-extract/css'

/*
  1. Use a more-intuitive box-sizing model.
*/

resetStyle('*, *::before, *::after', {
  boxSizing: 'border-box',
})

/*
  2. Remove default margin
*/
resetStyle('*', { margin: 0 })
/*
  3. Allow percentage-based heights in the application
*/
resetStyle('html, body', { height: '100%' })
/*
  Typographic tweaks!
  4. Add accessible line-height
  5. Improve text rendering
*/
resetStyle('body', {
  lineHeight: 1.5,
})

/*
  6. Improve media defaults
*/
resetStyle('img, picture, video, canvas, svg', {
  display: 'block',
  maxWidth: '100%',
})
/*
  7. Remove built-in form typography styles
*/
resetStyle('input, button, textarea, select', { font: 'inherit' })
/*
  8. Avoid text overflows
*/
resetStyle('p, h1, h2, h3, h4, h5, h6', { overflowWrap: 'break-word' })
/*
  9. Create a root stacking context
*/
resetStyle('#root, #__next', { isolation: 'isolate' })
