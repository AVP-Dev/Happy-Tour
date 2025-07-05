// pages/_app.js
import { ChakraProvider } from '@chakra-ui/react';
import { SessionProvider } from 'next-auth/react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'; // Импортируем провайдер
import theme from '../theme'; // Ваша тема Chakra UI
import '../styles/Globals.css'; // Ваши глобальные стили
import Layout from '../components/Layout'; // Ваш основной макет

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      {/* Оборачиваем все приложение в GoogleReCaptchaProvider */}
      <GoogleReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}>
        <ChakraProvider theme={theme}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ChakraProvider>
      </GoogleReCaptchaProvider>
    </SessionProvider>
  );
}

export default MyApp;
