import { FiCheckCircle, FiAlertTriangle, FiXCircle } from 'react-icons/fi';
import styles from '../../styles/Admin.module.css';

export default function NotificationModal({ isOpen, message, isConfirm, onConfirm, onCancel, type = 'info' }) {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <FiCheckCircle className={styles.notificationIconSuccess} />;
            case 'error':
                return <FiXCircle className={styles.notificationIconError} />;
            default:
                return <FiAlertTriangle className={styles.notificationIconInfo} />;
        }
    };

    return (
        <div className={`${styles.modalBackdrop} ${styles.notificationModalBackdrop}`}>
            <div className={styles.notificationModal}>
                <div className={styles.notificationIconWrapper}>
                    {getIcon()}
                </div>
                <p>{message}</p>
                <div className={styles.notificationActions}>
                    {isConfirm ? (
                        <>
                            <button onClick={onCancel} className={`${styles.button} ${styles.secondaryButton}`}>
                                Отмена
                            </button>
                            <button onClick={onConfirm} className={`${styles.button} ${styles.dangerButton}`}>
                                Подтвердить
                            </button>
                        </>
                    ) : (
                        <button onClick={onCancel} className={`${styles.button} ${styles.primaryButton}`}>
                            OK
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
