import Head from 'next/head';
import Layout from '../components/Layout';
import { SessionProvider } from "next-auth/react";
import { useEffect } from 'react';
import { useRouter } from 'next/router'; // Импортируем useRouter для определения маршрута
import { useSession } from "next-auth/react"; // Импортируем useSession для получения сессии NextAuth
import { auth } from '../lib/firebase'; // Импортируем клиентский Firebase Auth
import { signInWithCustomToken, signOut } from 'firebase/auth'; // Импортируем функции для работы с Auth

// Импорты CSS
import '../styles/Globals.css';
import '../styles/Admin.module.css';
import '../styles/CookieBanner.module.css';
import '../styles/FAQ.module.css';
import '../styles/FloatingContact.module.css';
import '../styles/Footer.module.css';
import '../styles/Form.module.css';
import '../styles/Header.module.css';
import '../styles/Hero.module.css';
import '../styles/Home.module.css';
import '../styles/Modal.module.css';
import '../styles/Notification.module.css';
import '../styles/ReviewCard.module.css';
import '../styles/TourCard.module.css';

// Компонент для синхронизации Firebase Auth на клиенте
// Он должен быть внутри SessionProvider, поэтому его используют как дочерний компонент MyApp
function FirebaseAuthCustomTokenSync() {
    const { data: session, status } = useSession();

    useEffect(() => {
        // Логирование для отладки
        console.log("FirebaseAuthCustomTokenSync: Session Status:", status);
        if (session?.user?.customToken) {
            console.log("FirebaseAuthCustomTokenSync: Custom Token present in session.");
        } else {
            console.log("FirebaseAuthCustomTokenSync: Custom Token NOT present or session not authenticated.");
        }

        if (status === 'authenticated' && session?.user?.customToken) {
            console.log("CLIENT: Attempting Firebase Auth sync with Custom Token.");
            signInWithCustomToken(auth, session.user.customToken)
                .then(() => {
                    console.log("Firebase Auth synced successfully with Custom Token!");
                    if (auth.currentUser) {
                        console.log("Firebase Auth User after sync:", auth.currentUser.toJSON());
                    } else {
                        console.log("Firebase Auth User after sync: still null (unexpected after success).");
                    }
                })
                .catch(error => {
                    console.error("Firebase Auth Custom Token sync error:", error);
                    // Разлогиниваем Firebase Auth, если токен недействителен или ошибка
                    signOut(auth); 
                });
        } else if (status === 'unauthenticated' && auth.currentUser) {
            // Если пользователь разлогинился в NextAuth, разлогиниваем и в Firebase Auth
            signOut(auth);
            console.log("Firebase Auth signed out due to NextAuth unauthenticated status.");
        }
    }, [session, status]); // Зависимости: сессия и статус NextAuth

    return null; // Этот компонент ничего не рендерит
}


function MyApp({ Component, pageProps: { session, ...pageProps } }) {
    const router = useRouter(); // Инициализируем useRouter
    const isAdminRoute = router.pathname.startsWith('/admin'); // Проверяем, является ли маршрут админским

    // Логирование для отладки reCAPTCHA
    useEffect(() => {
        if (!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
            console.warn("Ключ ReCaptcha не найден. Пожалуйста, проверьте файл .env.local");
        }
    }, []);

    return (
        <SessionProvider session={session}>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Happy Tour</title>
            </Head>
            {/* Добавляем компонент для синхронизации Firebase Auth с Custom Token */}
            {/* Он должен быть внутри SessionProvider */}
            <FirebaseAuthCustomTokenSync /> 

            {/* Условный рендеринг Layout */}
            {isAdminRoute ? (
                // Для админских маршрутов не используем общий Layout
                <Component {...pageProps} />
            ) : (
                // Для всех остальных маршрутов используем общий Layout
                <Layout>
                    <Component {...pageProps} />
                </Layout>
            )}
        </SessionProvider>
    );
}

export default MyApp;
