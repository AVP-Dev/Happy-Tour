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
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <button onClick={toggleModal} className={styles.modalClose} aria-label="Закрыть">
                    <FaTimes />
                </button>
                <h2 className={styles.modalTitle}>Удобные способы связи</h2>

                <div className={styles.messengers}>
                    <a href="#" className={`${styles.messengerIcon} ${styles.telegram}`} aria-label="Telegram"><FaTelegramPlane /></a>
                    <a href="#" className={`${styles.messengerIcon} ${styles.viber}`} aria-label="Viber"><FaViber /></a>
                    <a href="#" className={`${styles.messengerIcon} ${styles.whatsapp}`} aria-label="WhatsApp"><FaWhatsapp /></a>
                    <a href="#" className={`${styles.messengerIcon} ${styles.instagram}`} aria-label="Instagram"><FaInstagram /></a>
                </div>

                <div className={styles.separator}>
                    <span>ИЛИ</span>
                </div>
                
                <ContactForm />
            </div>
        </div>
    );
}
