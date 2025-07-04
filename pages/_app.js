// pages/_app.js
import Head from 'next/head';
import Layout from '../components/Layout';
import { ChakraProvider } from '@chakra-ui/react';
import { SessionProvider } from 'next-auth/react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import theme from '../theme'; // Импортируем нашу кастомную тему

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
    const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    return (
        <ChakraProvider theme={theme}> {/* Передаем тему в провайдер */}
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
