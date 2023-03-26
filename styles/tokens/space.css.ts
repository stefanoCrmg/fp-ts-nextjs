import { createVar } from '@vanilla-extract/css'

/* fixed */
export const fixedXXXS = createVar()
export const fixedXXS = createVar()
export const fixedXS = createVar()
export const fixedS = createVar()
export const fixedM = createVar()
export const fixedL = createVar()
export const fixedXL = createVar()
export const fixedXXL = createVar()
export const fixedXXXL = createVar()
/* fluid */
export const fluidXXXS_XXS = createVar()
export const fluidXXS_XS = createVar()
export const fluidXS_S = createVar()
export const fluidS_M = createVar()
export const fluidM_L = createVar()
export const fluidL_XL = createVar()
export const fluidXL_XXL = createVar()
export const fluidXXL_XXXL = createVar()
/* inverse fluid */
export const fluidS_L = createVar()

export const globalVars = {
  [fixedXXXS]: 'clamp(0.31rem, calc(0.31rem + 0.00vw), 0.31rem)',
  [fixedXXS]: 'clamp(0.56rem, calc(0.55rem + 0.06vw), 0.63rem)',
  [fixedXS]: 'clamp(0.88rem, calc(0.86rem + 0.06vw), 0.94rem)',
  [fixedS]: 'clamp(1.13rem, calc(1.10rem + 0.13vw), 1.25rem)',
  [fixedM]: 'clamp(1.69rem, calc(1.65rem + 0.19vw), 1.88rem)',
  [fixedL]: 'clamp(2.25rem, calc(2.20rem + 0.25vw), 2.50rem)',
  [fixedXL]: 'clamp(3.38rem, calc(3.30rem + 0.38vw), 3.75rem)',
  [fixedXXL]: 'clamp(4.50rem, calc(4.40rem + 0.50vw), 5.00rem)',
  [fixedXXXL]: 'clamp(6.75rem, calc(6.60rem + 0.75vw), 7.50rem)',
  [fluidXXXS_XXS]: 'clamp(0.31rem, calc(0.25rem + 0.31vw), 0.63rem)',
  [fluidXXS_XS]: 'clamp(0.56rem, calc(0.49rem + 0.38vw), 0.94rem)',
  [fluidXS_S]: 'clamp(0.88rem, calc(0.80rem + 0.38vw), 1.25rem)',
  [fluidS_M]: 'clamp(1.13rem, calc(0.98rem + 0.75vw), 1.88rem)',
  [fluidM_L]: 'clamp(1.69rem, calc(1.53rem + 0.81vw), 2.50rem)',
  [fluidL_XL]: 'clamp(2.25rem, calc(1.95rem + 1.50vw), 3.75rem)',
  [fluidXL_XXL]: 'clamp(3.38rem, calc(3.05rem + 1.63vw), 5.00rem)',
  [fluidXXL_XXXL]: 'clamp(4.50rem, calc(3.90rem + 3.00vw), 7.50rem)',
  [fluidS_L]: 'clamp(1.13rem, calc(0.85rem + 1.38vw), 2.50rem)',
}

export const map = {
  fixedXXXS,
  fixedXXS,
  fixedXS,
  fixedS,
  fixedM,
  fixedL,
  fixedXL,
  fixedXXL,
  fixedXXXL,
  fluidXXXS_XXS,
  fluidXXS_XS,
  fluidXS_S,
  fluidS_M,
  fluidM_L,
  fluidL_XL,
  fluidXL_XXL,
  fluidXXL_XXXL,
  fluidS_L,
}
