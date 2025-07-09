import Head from 'next/head';
import { ChakraProvider } from '@chakra-ui/react';
import { SessionProvider } from 'next-auth/react';
import theme from '../theme';
import Layout from '../components/Layout';
import '../styles/Globals.css'; // Подключаем глобальные стили

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
    // Проверяем, является ли текущий маршрут админ-панелью
    const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');

    return (
        <ChakraProvider theme={theme}>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Happy Tour</title>
            </Head>
            <SessionProvider session={session}>
                {isAdminRoute ? (
                    // Если это админка, рендерим компонент без основного Layout
                    <Component {...pageProps} />
                ) : (
                    // Для всех остальных страниц используем основной Layout
                    <Layout>
                        <Component {...pageProps} />
                    </Layout>
                )}
            </SessionProvider>
        </ChakraProvider>
    );
}

export default MyApp;
