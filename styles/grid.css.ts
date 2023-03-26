import { createVar } from '@vanilla-extract/css'
import * as SPACES from './tokens/space.css'

export const maxGridWidth = createVar()
export const gutter = createVar()
export const columns = createVar()

export const globalVars = {
  [maxGridWidth]: '92.50rem',
  [gutter]: SPACES.fluidS_L,
  [columns]: '12',
}
