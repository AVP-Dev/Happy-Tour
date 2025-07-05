// pages/_app.js
import Head from 'next/head';
import { ChakraProvider } from '@chakra-ui/react';
import { SessionProvider } from 'next-auth/react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import theme from '../theme';
import Layout from '../components/Layout';
import { Global, css } from '@emotion/react';

// ИЗМЕНЕНИЕ: SVG-код контурной карты, основанный на твоем файле.
// Я его почистил и стилизовал, чтобы он выглядел как легкий фон.
const userWorldMapSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 761">
  <g fill="#E2E8F0" opacity="0.6" stroke="none">
    <path d="M546.8 688.8 c-0.7-0.7-2.4-1.3-3.8-1.3-1.8 0-2.5-0.5-2.3-1.8 0.1-1.7-0.1-1.7-2.1 0.2-2.9 2.7-3.1 2.7-4.6-0.9-1.4-3.5-1.4-3.5-4.5-1.4-1.3 0.8-3.4 1.5-4.7 1.3-1.3-0.1-3.6 0.1-5.2 0.6-2.2 0.6-3.1 0.4-3.8-0.9-0.5-0.9-1.5-1.6-2.3-1.6-0.8 0-2.1-1-2.9-2.2-0.8-1.1-2.7-2.2-4.2-2.4-1.5-0.2-3.9-1.4-5.3-2.8-1.5-1.5-3.2-2.6-3.8-2.6-0.6 0-1.6-0.7-2.3-1.5-1-1.2-1-1.8 0-3 0.7-0.9 0.9-2.2 0.5-3.2-0.5-1-0.9-2.5-0.9-3.3-0.1-0.9-0.9-1.4-2.3-1.3-1.2 0.2-5.4-1.3-9.3-3.3-5.7-2.9-7-4-7-5.9 0-1.3 0.8-3 1.8-3.7 1-0.7 2.1-2.1 2.5-3 0.5-1.4 0.1-1.8-1.6-1.8-3 0-5.2-3.4-3.2-5 0.7-0.6 1.3-1.9 1.2-2.8 0-0.9 0.7-2.9 1.6-4.3 1.7-2.5 6.3-4 11.9-4 1 0 2.3-1 2.9-2.2 0.7-1.2 1.8-2.6 2.5-3 0.7-0.4 1.3-2.3 1.2-4.2-0.1-1.9 0.4-4 1.1-4.8 1.6-2 0.6-16.5-1.4-18.7-1-1.1-1.5-3.7-1.5-7.3 0-4.9 0.4-5.9 3.1-8.6 3.2-3.2 3.8-7.9 0.9-7.3-0.8 0.2-1.9-0.3-2.5-1-0.6-0.7-1.9-1.8-3-2.4-1.9-1.1-3.2-5-3.8-11.9-0.2-1.6 0.7-5.2 1.9-8 1.3-2.7 2.5-7.7 2.8-11 0.6-6.6 2.3-12.5 3.7-12.5 0.5 0 0.9-0.7 0.9-1.5 0-1.4 0.5-1.7 4-1.9 0.8-0.1 1.5-0.6 1.5-1.3 0-1.5 4.9-5.3 6.8-5.3 0.8 0 1.8 1.1 2.1 2.5 0.4 1.4 1.5 3.4 2.6 4.5 1.2 1.2 1.9 3.1 1.8 4.8-0.3 4.8 10.6 18.2 14.9 18.2 1.2 0 2.7 0.9 3.3 2 0.6 1.1 2 2 3.1 2 1.3 0 2.3 1 3 2.8 0.7 2 2.7 3.7 7.3 6 3.5 1.8 7.3 3.2 8.5 3.2 2.3 0 9.1 3.9 12.9 7.4 4.1 3.7 5.3 7 4.6 13.1-0.6 4.6-1.1 5.7-3.2 6.8-1.4 0.6-2.9 2.4-3.3 4-0.4 1.5-0.4 2.5 0.1 2.2 0.4-0.3 1.4 0.2 2.1 1.1 1.2 1.4 1.4 1.4 2.5-0.1 2.9-3.9 10.2 0.3 7.7 4.4-1 1.6-0.9 1.8 0.8 1.4 2.8-0.8 2.5 2.8-0.6 5.7-2.9 2.7-1.9 4.9 1.4 2.9 1.7-1.2 2.3-1.1 3.7 0.3 1.6 1.6 1.1 4.3-0.7 3.3-0.5-0.4-0.9 0.1-0.9 0.9 0 0.9 0.7 1.6 1.5 1.6 1.8 0 1.8 0.1 0.5 3.4-0.7 2-0.6 2.7 0.8 3.5 1.6 0.9 1.5 1.2-0.4 5.3-1.4 3-1.8 5.2-1.3 7.3 0.4 1.7 0.7 2.6 0.8 2 0.4-2.5 3.1 3.3 3.1 6.6 0 2.1 0.5 4.1 1.1 4.5 0.6 0.3 0.8 1.7 0.4 3.3-0.6 2.5-0.6 2.5 0.9 0.6 1.4-1.7 1.7-1.8 2.6-0.5 0.6 0.8 0.8 2.4 0.5 3.5-0.3 1.6 0.3 2.4 2.4 3.2 3.2 1.1 3.8 3.2 3.3 9.5-0.5 4.5-2.7 5.6-5.7 2.8-2-1.8-8.2-2.9-7.2-1.2 0.3 0.4 0.1 1.7-0.4 3-0.9 2.4-3.3 2.9-4.6 1-1.2-2-3.7-1.5-4.4 0.7-0.4 1.8 0.1 2.1 5 2.5 4.8 0.4 5.6 0.8 5.9 2.7 0.2 1.2-0.6 3.1-1.7 4.2-1 1-2.1 3-2.3 4.3l-0.3 2.3-18.7 0.3c-14 0.2-18.9-0.1-20-1z"/>
  </g>
</svg>
`;

const encodedPattern = `url("data:image/svg+xml,${encodeURIComponent(userWorldMapSvg)}")`;

const globalStyles = css`
  body {
    background-color: #F7FAFC !important; /* gray.50 */
    background-image: ${encodedPattern} !important;
    /* ИЗМЕНЕНИЕ: Устанавливаем повторение и размер, а не cover */
    background-repeat: repeat !important;
    background-size: 400px !important; /* Размер одного элемента паттерна */
    background-attachment: fixed !important;
  }
  /* Делаем корневой div Next.js прозрачным */
  #__next {
    background: transparent !important;
  }
`;

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
    const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    return (
        <ChakraProvider theme={theme}>
            <Global styles={globalStyles} />
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Happy Tour</title>
            </Head>
            <GoogleReCaptchaProvider reCaptchaKey={recaptchaSiteKey}>
                <SessionProvider session={session}>
                    {isAdminRoute ? (
                        <Component {...pageProps} />
                    ) : (
                        <Layout>
                            <Component {...pageProps} />
                        </Layout>
                    )}
                </SessionProvider>
            </GoogleReCaptchaProvider>
        </ChakraProvider>
    );
}

export default MyApp;
