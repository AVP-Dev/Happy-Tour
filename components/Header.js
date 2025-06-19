// components/Header.js

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaBars, FaTimes } from 'react-icons/fa';
import styles from '../styles/Header.module.css';

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }

        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, [isOpen]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const closeMenu = () => {
        setIsOpen(false);
    };

    return (
        <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
            <div className={`container ${styles.header_inner}`}>
                <Link href="/" className={styles.logo_container}>
                    <img src="/img/logo.png" alt="Happy Tour Logo" className={styles.logo_image} />
                    <span className={styles.logo_text}>Happy Tour</span>
                </Link>
                <nav className={`${styles.nav} ${isOpen ? styles.active : ''}`}>
                    {isOpen && (
                        <Link href="/" className={styles.nav_mobile_logo_container} onClick={closeMenu}>
                            <img src="/img/logo.png" alt="Happy Tour Logo" className={styles.nav_mobile_logo_image} />
                            <span className={styles.nav_mobile_logo_text}>Happy Tour</span>
                        </Link>
                    )}
                    <Link href="#home" className={styles.nav_link} onClick={closeMenu}>Главная</Link>
                    <Link href="#hot-tours" className={styles.nav_link} onClick={closeMenu}>Туры</Link>
                    <Link href="#reviews" className={styles.nav_link} onClick={closeMenu}>Отзывы</Link>
                    <Link href="#faq" className={styles.nav_link} onClick={closeMenu}>Популярные вопросы</Link>
                    <Link href="#contacts" className={styles.nav_link} onClick={closeMenu}>Контакты</Link>
                    {/* Новая кнопка "Подбор тура" в мобильном меню */}
                    {isOpen && (
                        <Link href="/#tourvisor" className={`${styles.nav_link} ${styles.nav_button_mobile}`} onClick={closeMenu}>
                            Подбор тура
                        </Link>
                    )}
                </nav>
                {/* Новая кнопка "Подбор тура" на десктопе */}
                <Link href="/#tourvisor" className={`${styles.nav_button} btn btn-primary`}>
                    Подбор тура
                </Link>
                <button className={styles.burger} onClick={toggleMenu} aria-label="Меню">
                    {isOpen ? <FaTimes /> : <FaBars />}
                </button>
            </div>
        </header>
    );
};

export default Header;
