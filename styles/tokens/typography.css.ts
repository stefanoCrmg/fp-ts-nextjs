import { createVar } from '@vanilla-extract/css'

export const size0 = createVar()
export const size1 = createVar()
export const size2 = createVar()
export const size3 = createVar()
export const size4 = createVar()
export const size5 = createVar()

export const globalVars = {
  [size0]: 'clamp(1.13rem, calc(1.10rem + 0.13vw), 1.25rem)',
  [size1]: 'clamp(1.35rem, calc(1.31rem + 0.21vw), 1.56rem)',
  [size2]: 'clamp(1.62rem, calc(1.55rem + 0.33vw), 1.95rem)',
  [size3]: 'clamp(1.94rem, calc(1.84rem + 0.50vw), 2.44rem)',
  [size4]: 'clamp(2.33rem, calc(2.19rem + 0.72vw), 3.05rem)',
  [size5]: 'clamp(2.80rem, calc(2.60rem + 1.02vw), 3.82rem)',
}

export const sizeMap = { size0, size1, size2, size3, size4, size5 }
export const weightMap = {
  '100': 100,
  '200': 200,
  '300': 300,
  '400': 400,
  '500': 500,
  '600': 600,
  '700': 700,
  '800': 800,
  '900': 900,
}
