// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="ru">
      <Head>
        {/* ИЗМЕНЕНИЕ: Все теги <link> для Google Fonts удалены. */}
        {/* Шрифты теперь управляются через next/font в _app.js для лучшей производительности. */}
        
        {/* Preconnect к домену Tourvisor для ускорения загрузки скрипта */}
        <link rel="preconnect" href="https://tourvisor.ru" />
        <link rel="dns-prefetch" href="https://tourvisor.ru" />

        {/* Ссылки на Favicon остаются без изменений */}
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
