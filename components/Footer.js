// components/Footer.js

import Link from 'next/link';
import { FaTelegramPlane, FaViber, FaWhatsapp, FaInstagram } from 'react-icons/fa';
import styles from '../styles/Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.footer_content}`}>
                <div className={styles.footer_copyright}>
                    <Link href="/" className={styles.footer_logo_container}>
                        <img src="/img/logo.png" alt="Happy Tour Logo" className={styles.footer_logo_image} />
                        <span className={styles.footer_logo_text}>Happy Tour</span>
                    </Link>
                    <p>&copy; {new Date().getFullYear()} Happy Tour. Все права защищены.</p>
                    <p>ООО «ХэппиТрэвелКлаб»</p>
                    <p>УНП 491678156</p>
                    {/* Надпись "Информация и цены..." перемещена в footer_links */}
                </div>
                <div className={styles.footer_social}>
                    <a href="https://t.me/happytour.by" className={styles.social_link} aria-label="Telegram" target="_blank" rel="noopener noreferrer"><FaTelegramPlane /></a>
                    <a href="viber://chat?number=+375447886761" className={styles.social_link} aria-label="Viber" target="_blank" rel="noopener noreferrer"><FaViber /></a>
                    <a href="https://wa.me/375447886761" className={styles.social_link} aria-label="WhatsApp" target="_blank" rel="noopener noreferrer"><FaWhatsapp /></a>
                    <a href="https://www.instagram.com/happytour.by?igsh=ZHV6b3BjODFqMjZv" className={styles.social_link} aria-label="Instagram" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
                </div>
                <div className={styles.footer_links}>
                    <Link href="/privacy" className={styles.footer_link} target="_blank" rel="noopener noreferrer">Политика конфиденциальности</Link>
                    <Link href="/offer" className={styles.footer_link} target="_blank" rel="noopener noreferrer">Публичная оферта</Link>
                    {/* Новое место для надписи */}
                    <p className={styles.disclaimer_text}>
                        Информация и цены, представленные на сайте, носят справочный характер и не является публичной офертой
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
