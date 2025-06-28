import { FiCheckCircle, FiAlertTriangle, FiXCircle } from 'react-icons/fi';
import styles from '../../styles/Admin.module.css';

/**
 * Компонент NotificationModal для отображения уведомлений и диалогов подтверждения.
 * @param {object} props - Свойства компонента.
 * @param {boolean} props.isOpen - Открыто ли модальное окно.
 * @param {string} props.message - Сообщение для отображения.
 * @param {boolean} props.isConfirm - Если true, отображает кнопки "Отмена" и "Подтвердить".
 * @param {function} props.onConfirm - Функция, вызываемая при подтверждении.
 * @param {function} props.onCancel - Функция, вызываемая при отмене или закрытии.
 * @param {string} [props.type='info'] - Тип уведомления ('success', 'error', 'info').
 */
export default function NotificationModal({ isOpen, message, isConfirm, onConfirm, onCancel, type = 'info' }) {
    if (!isOpen) return null; // Не рендерим компонент, если не открыт

    /**
     * Возвращает соответствующую иконку в зависимости от типа уведомления.
     * @returns {React.ReactNode} - React-элемент иконки.
     */
    const getIcon = () => {
        switch (type) {
            case 'success':
                return <FiCheckCircle className={styles.notificationIconSuccess} />;
            case 'error':
                return <FiXCircle className={styles.notificationIconError} />;
            default: // По умолчанию для 'info'
                return <FiAlertTriangle className={styles.notificationIconInfo} />;
        }
    };

    return (
        <div className={`${styles.modalBackdrop} ${styles.notificationModalBackdrop}`} onMouseDown={onCancel}>
            <div className={styles.notificationModal} onMouseDown={e => e.stopPropagation()}> {/* Предотвращаем закрытие при клике внутри */}
                <div className={styles.notificationIconWrapper}>
                    {getIcon()}
                </div>
                <p>{message}</p>
                <div className={styles.notificationActions}>
                    {isConfirm ? (
                        // Кнопки для диалога подтверждения
                        <>
                            <button onClick={onCancel} className={`${styles.button} ${styles.secondaryButton}`}>
                                Отмена
                            </button>
                            <button onClick={onConfirm} className={`${styles.button} ${styles.dangerButton}`}>
                                Подтвердить
                            </button>
                        </>
                    ) : (
                        // Кнопка "OK" для обычного уведомления
                        <button onClick={onCancel} className={`${styles.button} ${styles.primaryButton}`}>
                            OK
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
