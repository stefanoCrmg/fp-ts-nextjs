import { defineProperties, createSprinkles } from '@vanilla-extract/sprinkles'
import { breakpoints } from './breakpoints'
import { vars } from './theme.css'

const flexAlignment = ['flex-start', 'center', 'flex-end', 'stretch'] as const
const flexibility = [0, 1, 2, 3, 4] as const

const responsiveProperties = defineProperties({
  conditions: {
    xs: {},
    sm: { '@media': `screen and (min-width: ${breakpoints.sm}px)` },
    md: { '@media': `screen and (min-width: ${breakpoints.md}px)` },
    lg: { '@media': `screen and (min-width: ${breakpoints.lg}px)` },
    xl: { '@media': `screen and (min-width: ${breakpoints.xl}px)` },
  },
  defaultCondition: 'xs',
  properties: {
    alignItems: [...flexAlignment, 'baseline'],
    alignSelf: [...flexAlignment, 'baseline'],
    display: ['block', 'flex', 'grid', 'inline-block', 'none', 'contents'],
    flex: {
      1: '1 1 0%',
      auto: '1 1 auto',
      initial: '0 1 auto',
      none: 'none',
    },
    flexBasis: {
      ...vars.space,
    },
    flexDirection: ['column', 'row'],
    flexGrow: flexibility,
    flexShrink: flexibility,
    flexWrap: ['wrap', 'nowrap'],
    fontSize: vars.fontSizes,
    fontWeight: vars.fontWeights,
    gap: vars.space,
    height: vars.space,
    inset: vars.space,
    justifyContent: [...flexAlignment, 'space-around', 'space-between'],
    justifySelf: flexAlignment,
    left: vars.space,
    letterSpacing: vars.letterSpacings,
    lineHeight: vars.lineHeights,
    marginBottom: {
      ...vars.space,
    },
    marginLeft: {
      ...vars.space,
    },
    marginRight: {
      ...vars.space,
    },
    marginTop: {
      ...vars.space,
    },
    maxHeight: vars.space,
    maxWidth: {
      ...vars.space,
      none: 'none',
    },
    minHeight: vars.space,
    minWidth: vars.space,
    overflow: ['auto', 'hidden', 'scroll', 'unset'],
    paddingBottom: vars.space,
    paddingLeft: vars.space,
    paddingRight: vars.space,
    paddingTop: vars.space,
    position: ['absolute', 'fixed', 'relative', 'sticky'],
    right: vars.space,
    textAlign: ['center', 'left', 'right'],
    top: vars.space,
    width: {
      ...vars.space,
    },
  },
  shorthands: {
    margin: ['marginTop', 'marginBottom', 'marginLeft', 'marginRight'],
    marginX: ['marginLeft', 'marginRight'],
    marginY: ['marginTop', 'marginBottom'],
    padding: ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'],
    paddingX: ['paddingLeft', 'paddingRight'],
    paddingY: ['paddingTop', 'paddingBottom'],
  },
})

const unresponsiveProperties = defineProperties({
  properties: {
    aspectRatio: {
      auto: 'auto',
      '1/1': '1 / 1',
      '2/1': '2 / 1',
      '4/1': '4 / 1',
      '4/3': '4 / 3',
      '16/9': '16 / 9',
    },
    cursor: ['default', 'pointer', 'not-allowed'],
    fontFamily: vars.fonts,
    isolation: ['isolate'],
    objectFit: ['contain', 'cover'],
    pointerEvents: ['none'],
    textTransform: ['capitalize', 'lowercase', 'uppercase'],
    transitionProperty: {
      none: 'none',
      all: 'all',
      default:
        'background-color, border-color, color, fill, stroke, opacity, box-shadow, transform',
      colors: 'background-color, border-color, color, fill, stroke',
      opacity: 'opacity',
      shadow: 'box-shadow',
      transform: 'transform',
    },
    transitionTimingFunction: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.42, 0, 0.58, 1)',
    },
    visibility: ['hidden', 'visible'],
    whiteSpace: [
      'normal',
      'nowrap',
      'pre',
      'pre-line',
      'pre-wrap',
      'initial',
      'inherit',
    ],
    wordBreak: ['break-word'],
    wordWrap: ['normal', 'break-word', 'initial', 'inherit'],
    zIndex: {
      '0': 0,
      '10': 10,
      '20': 20,
      '30': 30,
      '40': 40,
      '50': 50,
      '75': 75,
      '100': 100,
      auto: 'auto',
    },
  },
})

const colorProperties = defineProperties({
  properties: {
    color: vars.palette,
    backgroundColor: vars.palette,
  },
})

export const sprinkles = createSprinkles(
  responsiveProperties,
  unresponsiveProperties,
  colorProperties,
)
export type Sprinkles = Parameters<typeof sprinkles>[0]
