// components/Footer.js
import Link from 'next/link';
import { FaTelegramPlane, FaViber, FaWhatsapp, FaInstagram } from 'react-icons/fa';
import styles from '../styles/Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.footer_container}`}>
                <div className={styles.footer_top}>
                    <div className={styles.footer_copyright}>
                        <Link href="/" className={styles.footer_logo_container}>
                            <img src="/img/logo.png" alt="Happy Tour Logo" className={styles.footer_logo_image} />
                            <span className={styles.footer_logo_text}>Happy Tour</span>
                        </Link>
                        <p>&copy; {new Date().getFullYear()} Happy Tour. Все права защищены.</p>
                        <p>ООО «ХэппиТрэвелКлаб» (УНП 491678156)</p>
                    </div>
                    <div className={styles.footer_social}>
                        <a href="https://t.me/happytour.by" className={styles.social_link} aria-label="Telegram" target="_blank" rel="noopener noreferrer"><FaTelegramPlane /></a>
                        <a href="viber://chat?number=+375447886761" className={styles.social_link} aria-label="Viber" target="_blank" rel="noopener noreferrer"><FaViber /></a>
                        <a href="https://wa.me/375447886761" className={styles.social_link} aria-label="WhatsApp" target="_blank" rel="noopener noreferrer"><FaWhatsapp /></a>
                        <a href="https://www.instagram.com/happytour.by?igsh=ZHV6b3BjODFqMjZv" className={styles.social_link} aria-label="Instagram" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
                    </div>
                    <div className={styles.footer_links}>
                        <Link href="/privacy" className={styles.footer_link}>Политика конфиденциальности</Link>
                        <Link href="/offer" className={styles.footer_link}>Публичная оферта</Link>
                        <p className={styles.disclaimer_text}>
                            Информация и цены на сайте не являются публичной офертой.
                        </p>
                    </div>
                </div>
                {/* ADDED: Creator credit section */}
                <div className={styles.footer_bottom}>
                    <p className={styles.creator_credit}>
                        Разработка сайта — <a href="https://avpdev.com" target="_blank" rel="noopener noreferrer">avpdev.com</a> | Telegram: <a href="https://t.me/avpdevcom" target="_blank" rel="noopener noreferrer">@avpdevcom</a>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
