import { calc } from '@vanilla-extract/css-utils'

export const shadowColor = '220 3% 15%'
export const shadowStrength = 0.01
export const shadows = {
  1: `0 1px 2px -1px hsl(${shadowColor} / ${calc(shadowStrength)
    .add(0.09)
    .multiply(100)}))`,
} as const
