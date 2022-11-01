import { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import '../styles/globals.css'
import React from 'react'
import Head from 'next/head'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: false, staleTime: Infinity },
  },
})

const ThemeProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  /* https://electricanimals.com/articles/next-js-dark-mode-toggle */
  React.useLayoutEffect(() => {
    document.querySelector(':root')?.setAttribute('data-theme', 'dark')
  }, [])

  return <div>{children}</div>
}

export default function App(props: AppProps) {
  const { Component, pageProps } = props

  return (
    <>
      <Head>
        <title>Page title</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <Component {...pageProps} />
          <ReactQueryDevtools initialIsOpen />
        </QueryClientProvider>
      </ThemeProvider>
    </>
  )
}
