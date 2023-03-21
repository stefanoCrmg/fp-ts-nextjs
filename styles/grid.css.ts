import { createVar, globalStyle } from '@vanilla-extract/css'

const spaceStoLVar = createVar()

export const gridMaxWidthVar = createVar()
export const gridGutterVar = createVar()
export const gridColumnsVar = createVar()

export const gridGlobalStyle = globalStyle(':root', {
  vars: {
    [spaceStoLVar]: 'clamp(1.13rem, calc(0.65rem + 2.39vw), 2.50rem)',
    [gridMaxWidthVar]: '92.50rem',
    [gridGutterVar]: spaceStoLVar,
    [gridColumnsVar]: '12',
  },
})
