import { style } from '@vanilla-extract/css'

export const container = style({
  padding: '0 2rem',
})

export const main = style({
  minHeight: '100vh',
  padding: '4rem 0',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
})

export const footer = style({
  display: 'flex',
  flex: 1,
  padding: '2rem 0',
  borderTop: '1px solid #eaeaea',
  justifyContent: 'center',
  alignItems: 'center',
})

export const footerA = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexGrow: 1,
})

export const title = style({
  margin: 0,
  // lineHeight: '1export const 15',
  fontSize: '4rem',
  // selectors: {
  //   '& a': {
  //     color: '#0070f3',
  //     textDecoration: 'none',
  //   },
  // '& a:hover, & a:focus, & a:active': {
  //   textDecoration: 'none',
  // },
  // },
})

export const description = style({
  margin: '4rem 0',
  // lineheight: 1export const 5,
  // fontSize: 1export const 5rem,
})

export const code = style({
  background: '#fafafa',
  borderRadius: 5,
  padding: '0 75rem',
  fontSize: '1 1rem',
  fontFamily: ['Menlo', 'Lucida Console', 'Liberation Mono'],
})

export const grid = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexWrap: 'wrap',
  maxWidth: 800,
})

export const card = style({
  margin: '1rem',
  padding: '1 5rem',
  textAlign: 'left',
  color: 'inherit',
  textDecoration: 'none',
  border: '1px solid #eaeaea',
  borderRadius: 10,
  maxWidth: 300,
})

// export const card:hover,
// export const card:focus,
// export const card:active= style({
//   color: #0070f3,
//   bordercolor: #0070f3,
// })

// export const card h2= style({
//   margin: 0 0 1rem 0,
//   fontsize: 1export const 5rem,
// })

// export const card p= style({
//   margin: 0,
//   fontsize: 1export const 25rem,
//   lineheight: 1export const 5,
// })

// export const logo= style({
//   height: 1em,
//   marginleft: 0export const 5rem,
// })

// @media (maxwidth: 600px)= style({
//   export const grid= style({
//     width: 100%,
//     flexdirection: column,
//   })
// })

// @media (preferscolorscheme: dark)= style({
//   export const card,
//   export const footer= style({
//     bordercolor: #222,
//   })
//   export const code= style({
//     background: #111,
//   })
//   export const logo img= style({
//     filter: invert(1),
//   })
// })
