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
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEsc);
        }

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    // Check if the children contain a form that needs reCAPTCHA
    const needsRecaptcha = 
        children && 
        (children.type?.name === 'ContactForm' || children.type?.name === 'ReviewForm');
    
    const ModalContent = () => (
        <div className={styles.modal_overlay} onClick={onClose}>
            <div className={styles.modal_content} onClick={e => e.stopPropagation()}>
                <button className={styles.modal_close} onClick={onClose} aria-label="Закрыть">
                    <FaTimes />
                </button>
                <h2 className={styles.modal_title}>{title}</h2>
                {children}
            </div>
        </div>
    );

    // If a form is present in the modal, wrap it with the provider.
    if (needsRecaptcha) {
        return (
            <GoogleReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}>
                <ModalContent />
            </GoogleReCaptchaProvider>
        );
    }
    
    // Otherwise, render as usual.
    return <ModalContent />;
}
