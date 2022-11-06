import Document, { Head, Html, Main, NextScript } from 'next/document'

export default class _Document extends Document {
  render() {
    const setInitialTheme = `
function getUserPreference() {
  if(window.localStorage.getItem('themePreference')) {
    return JSON.parse(window.localStorage.getItem('themePreference'))
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
}
document.body.dataset.theme = getUserPreference();
`
    return (
      <Html>
        <Head />
        <body>
          <script dangerouslySetInnerHTML={{ __html: setInitialTheme }} />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
