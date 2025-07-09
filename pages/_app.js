// pages/_app.js
import Head from 'next/head';
import { ChakraProvider } from '@chakra-ui/react';
import { SessionProvider } from 'next-auth/react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import theme from '../theme';
import Layout from '../components/Layout';

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
    const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    return (
        <ChakraProvider theme={theme}>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Happy Tour</title>
            </Head>
            {/* ИЗМЕНЕНИЕ: Добавлены scriptProps для более надежной загрузки скрипта reCAPTCHA.
                async/defer - лучшие практики для загрузки внешних скриптов.
                appendTo="body" - гарантирует, что скрипт будет добавлен в конец body,
                что часто решает проблемы с порядком инициализации. */}
            <GoogleReCaptchaProvider
                reCaptchaKey={recaptchaSiteKey}
                scriptProps={{
                    async: true,
                    defer: true,
                    appendTo: 'body',
                    nonce: undefined
                }}
            >
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
