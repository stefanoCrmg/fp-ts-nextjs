import { style } from '@vanilla-extract/css'
import * as GRID from 'styles/grid.css'
import { sprinkles } from 'styles/sprinkles.css'

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

export const gridContainerDelimiter = style({
  maxWidth: GRID.maxGridWidth,
  paddingInline: GRID.gutter,
  marginInline: 'auto',
})

export const gridContainer = style({
  display: 'grid',
  gridTemplateColumns: `repeat(${GRID.columns}, 1fr)`,
  gap: GRID.gutter,
})

export const gridElement = style({
  gridColumn: 'span 6',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
})

export const overlayGridContainer = style({
  position: 'absolute',
  height: '100vh',
  width: '100vw',
})

export const overlayGridItem = style([
  { height: '100vh', opacity: '0.2' },
  sprinkles({ backgroundColor: 'violet-5' }),
])
export const showGrid = style([gridContainerDelimiter, gridContainer])

export const pokemonName = sprinkles({
  fontSize: 'size0',
  color: 'blue-6',
  fontWeight: '600',
  marginTop: 'fluidL_XL',
})
