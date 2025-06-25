// components/FloatingContact.js
import { useState } from 'react';
import { FaCommentDots, FaTimes, FaTelegramPlane, FaViber, FaWhatsapp, FaInstagram } from 'react-icons/fa';
import ContactForm from './ContactForm';
import styles from '../styles/FloatingContact.module.css';

export default function FloatingContact() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleModal = () => setIsOpen(!isOpen);

    if (!isOpen) {
        return (
            <button onClick={toggleModal} className={styles.floatingBtn} aria-label="Связаться с нами">
                <FaCommentDots />
            </button>
        );
    }

    return (
        <div className={styles.modalOverlay} onClick={toggleModal}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button onClick={toggleModal} className={styles.modalClose} aria-label="Закрыть">
                    <FaTimes />
                </button>
                <h2 className={styles.modalTitle}>Удобные способы связи</h2>

                <div className={styles.messengers}>
                    {/* UPDATED: Links are now correct */}
                    <a href="https://t.me/happytour.by" target="_blank" rel="noopener noreferrer" className={`${styles.messengerIcon} ${styles.telegram}`} aria-label="Telegram"><FaTelegramPlane /></a>
                    <a href="viber://chat?number=+375447886761" target="_blank" rel="noopener noreferrer" className={`${styles.messengerIcon} ${styles.viber}`} aria-label="Viber"><FaViber /></a>
                    <a href="https://wa.me/375447886761" target="_blank" rel="noopener noreferrer" className={`${styles.messengerIcon} ${styles.whatsapp}`} aria-label="WhatsApp"><FaWhatsapp /></a>
                    <a href="https://www.instagram.com/happytour.by?igsh=ZHV6b3BjODFqMjZv" target="_blank" rel="noopener noreferrer" className={`${styles.messengerIcon} ${styles.instagram}`} aria-label="Instagram"><FaInstagram /></a>
                </div>

                <div className={styles.separator}>
                    <span>ИЛИ</span>
                </div>
                
                <ContactForm onClose={toggleModal} />
            </div>
        </div>
    );
}
