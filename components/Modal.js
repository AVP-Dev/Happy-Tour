// components/Modal.js
import { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import styles from '../styles/Modal.module.css';

export default function Modal({ isOpen, onClose, title, children }) {
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.body.classList.add('bodyModalOpen');
            window.addEventListener('keydown', handleEsc);
        }

        return () => {
            document.body.classList.remove('bodyModalOpen');
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    // Проверяем, нужна ли дочерним элементам reCAPTCHA
    const needsRecaptcha = 
        children && 
        (children.type?.name === 'ContactForm' || children.type?.name === 'ReviewForm');
    
    const ModalContent = () => (
        <div className={styles.modal_overlay} onClick={onClose}>
            <div className={styles.modal_content_wrapper} onClick={e => e.stopPropagation()}>
                <div className={styles.modal_header}>
                    <h2 className={styles.modal_title}>{title}</h2>
                    <button className={styles.modal_close} onClick={onClose} aria-label="Закрыть">
                        <FaTimes />
                    </button>
                </div>
                <div className={styles.modal_body}>
                    {children}
                </div>
            </div>
        </div>
    );

    // Если форма присутствует в модальном окне, оборачиваем ее в провайдер reCAPTCHA
    if (needsRecaptcha) {
        // Убедитесь, что ключ сайта reCAPTCHA доступен в переменных окружения
        const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
        if (!recaptchaSiteKey) {
            console.error("Ключ сайта reCAPTCHA (NEXT_PUBLIC_RECAPTCHA_SITE_KEY) не установлен.");
            return <ModalContent />; // Отображаем модальное окно без reCAPTCHA, чтобы избежать сбоя
        }
        return (
            <GoogleReCaptchaProvider reCaptchaKey={recaptchaSiteKey}>
                <ModalContent />
            </GoogleReCaptchaProvider>
        );
    }
    
    return <ModalContent />;
}
