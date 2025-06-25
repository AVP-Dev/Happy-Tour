// components/CookieBanner.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/CookieBanner.module.css';

const CookieBanner = () => {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Check localStorage only on the client side
        const consent = localStorage.getItem('cookie_consent');
        if (consent !== 'true') {
            setShowBanner(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie_consent', 'true');
        setShowBanner(false);
    };

    if (!showBanner) {
        return null;
    }

    return (
        <div className={styles.banner}>
            <p className={styles.text}>
                Мы используем файлы cookie, чтобы улучшить ваш опыт. Продолжая посещать этот сайт, вы соглашаетесь на использование наших cookie.
                Подробнее в <Link href="/privacy" className={styles.link}>политике конфиденциальности</Link>.
            </p>
            <button onClick={handleAccept} className={styles.button}>
                Принять
            </button>
        </div>
    );
};

export default CookieBanner;
