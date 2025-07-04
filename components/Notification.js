// components/Notification.js
import { useEffect } from 'react';
import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import styles from '../styles/Notification.module.css';

// Иконки и заголовки для разных типов уведомлений
const icons = {
    success: <FaCheckCircle />,
    error: <FaExclamationTriangle />,
    info: <FaExclamationTriangle />,
};

const titles = {
    success: 'Успешно!',
    error: 'Произошла ошибка',
    info: 'Внимание',
}

const Notification = ({ isOpen, message, type = 'info', onClose }) => {
    useEffect(() => {
        if (isOpen) {
            // Блокируем прокрутку фона, когда модальное окно открыто
            document.body.style.overflow = 'hidden';
            
            // Добавляем возможность закрыть окно по нажатию на Escape
            const handleEsc = (event) => {
                if (event.key === 'Escape') {
                    onClose();
                }
            };
            window.addEventListener('keydown', handleEsc);

            // Функция очистки при размонтировании компонента
            return () => {
                document.body.style.overflow = 'unset';
                window.removeEventListener('keydown', handleEsc);
            };
        }
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    return (
        // Оверлей, который затемняет фон
        <div className={styles.overlay} onClick={onClose}>
            {/* Контент модального окна. Клик по нему не закрывает окно */}
            <div className={`${styles.modal} ${styles[type]}`} onClick={(e) => e.stopPropagation()}>
                <div className={styles.icon_wrapper}>
                    {icons[type]}
                </div>
                <h3 className={styles.title}>{titles[type]}</h3>
                <p className={styles.message}>{message}</p>
                <button onClick={onClose} className={styles.close_button}>
                    Закрыть
                </button>
            </div>
        </div>
    );
};

export default Notification;
