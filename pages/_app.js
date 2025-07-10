import { ChakraProvider } from '@chakra-ui/react';
import { SessionProvider } from 'next-auth/react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import Head from 'next/head';
import Layout from '../components/Layout';
import theme from '../theme';
import '../styles/Globals.css'; // ВОЗВРАЩЕН ИМПОРТ ГЛОБАЛЬНЫХ СТИЛЕЙ

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
    const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    return (
        <GoogleReCaptchaProvider
            reCaptchaKey={recaptchaSiteKey}
            scriptProps={{
                async: false,
                defer: true,
                appendTo: 'head',
                nonce: undefined
            }}
        >
            <SessionProvider session={session}>
                <ChakraProvider theme={theme}>
                    <Head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                        <title>Happy Tour</title>
                    </Head>
                    {isAdminRoute ? (
                        <Component {...pageProps} />
                    ) : (
                        <Layout>
                            <Component {...pageProps} />
                        </Layout>
                    )}
                </ChakraProvider>
            </SessionProvider>
        </GoogleReCaptchaProvider>
    );
}

export default MyApp;
