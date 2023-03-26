import { defineProperties, createSprinkles } from '@vanilla-extract/sprinkles'
import { breakpoints } from './breakpoints'
import { vars } from './theme.css'
import * as SPACES from './tokens/space.css'
import * as TYPOGRAPHY from './tokens/typography.css'

const responsiveProperties = defineProperties({
  conditions: {
    xs: { '@media': `screen and (min-width: ${breakpoints.xs}px)` },
    sm: { '@media': `screen and (min-width: ${breakpoints.sm}px)` },
    md: { '@media': `screen and (min-width: ${breakpoints.md}px)` },
    lg: { '@media': `screen and (min-width: ${breakpoints.lg}px)` },
    xl: { '@media': `screen and (min-width: ${breakpoints.xl}px)` },
    xxl: { '@media': `screen and (min-width: ${breakpoints.xxl}px)` },
  },
  defaultCondition: 'xs',
  properties: {
    fontSize: {
      size0: TYPOGRAPHY.size0,
      size1: TYPOGRAPHY.size1,
      size2: TYPOGRAPHY.size2,
      size3: TYPOGRAPHY.size3,
      size4: TYPOGRAPHY.size4,
      size5: TYPOGRAPHY.size5,
    },
    fontWeight: vars.fontWeights,
    marginBottom: SPACES.map,
    marginLeft: SPACES.map,
    marginRight: SPACES.map,
    marginTop: SPACES.map,
    paddingBottom: SPACES.map,
    paddingLeft: SPACES.map,
    paddingRight: SPACES.map,
    paddingTop: SPACES.map,
  },
})

const colorProperties = defineProperties({
  properties: {
    color: vars.palette,
    backgroundColor: vars.palette,
  },
})

export const sprinkles = createSprinkles(responsiveProperties, colorProperties)
export type Sprinkles = Parameters<typeof sprinkles>[0]
