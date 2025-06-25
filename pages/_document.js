// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="ru">
      <Head>
        {/*
          REMOVED: The render-blocking Font Awesome stylesheet link.
          The project correctly uses the `react-icons` library, which bundles icons as SVG,
          a much more performant and modern approach.
        */}
        {/* Preconnect to the Tourvisor domain to speed up script loading */}
        <link rel="preconnect" href="https://tourvisor.ru" />
        <link rel="dns-prefetch" href="https://tourvisor.ru" />

        {/* Favicon links */}
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <link rel="mask-icon" href="/favicon/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
