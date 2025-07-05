// pages/_app.js
import Head from 'next/head';
import { ChakraProvider } from '@chakra-ui/react';
import { SessionProvider } from 'next-auth/react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import theme from '../theme';
import Layout from '../components/Layout';
import { Montserrat, Roboto } from 'next/font/google';

// ИЗМЕНЕНИЕ: Настройка шрифтов через next/font для оптимальной производительности
const montserrat = Montserrat({
  subsets: ['latin', 'cyrillic'],
  weight: ['600', '700', '800'],
  display: 'swap',
  variable: '--font-montserrat', // Создаем CSS-переменную
});

const roboto = Roboto({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-roboto', // Создаем CSS-переменную
});

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
    const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    return (
        // ИЗМЕНЕНИЕ: Добавляем классы шрифтов к корневому элементу
        <main className={`${montserrat.variable} ${roboto.variable}`}>
            <ChakraProvider theme={theme}>
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
        </main>
    );
}

export default MyApp;
