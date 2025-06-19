import { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import styles from '../styles/Modal.module.css';

export default function Modal({ isOpen, onClose, title, children }) {
    useEffect(() => {
        // Функция для обработки нажатия клавиши Escape
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        // Добавляем слушатель, когда модальное окно открыто
        if (isOpen) {
            document.body.style.overflow = 'hidden'; // Предотвращаем прокрутку фона
            window.addEventListener('keydown', handleEsc);
        }

        // Функция очистки: удаляем слушатель и восстанавливаем прокрутку
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]); // Эффект будет срабатывать при изменении isOpen

    if (!isOpen) {
        return null;
    }

    return (
        // Клик на оверлей закрывает окно
        <div className={styles.modal_overlay} onClick={onClose}>
            {/* Клик на контент не закрывает окно */}
            <div className={styles.modal_content} onClick={e => e.stopPropagation()}>
                <button className={styles.modal_close} onClick={onClose} aria-label="Закрыть">
                    <FaTimes />
                </button>
                <h2 className={styles.modal_title}>{title}</h2>
                {children}
            </div>
        </div>
    );
}
