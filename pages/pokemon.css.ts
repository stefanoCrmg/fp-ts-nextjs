import { style } from '@vanilla-extract/css'

export const pageContainer = style({
  maxWidth: '1280px',
  margin: '0 auto',
  display: 'flex',
  justifyContent: 'center',
})
export const container = style({
  width: '25%',
})

export const content = style({
  width: '100%',
  filter: 'drop-shadow(0 0 2em #c026d3)',
})
