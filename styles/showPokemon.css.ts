import { style } from '@vanilla-extract/css'

export const container = style({
  padding: '0 2rem',
})

export const gridContainer = style({
  display: 'grid',
  margin: '0 auto',
  maxWidth: '100rem',
  gap: '1rem',
  gridTemplateColumns: 'repeat(12, 1fr)',
})
