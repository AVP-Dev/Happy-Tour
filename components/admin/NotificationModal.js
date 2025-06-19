import styles from '../../styles/Admin.module.css';

/**
 * A reusable notification modal for alerts and confirmations.
 * @version 2.0
 */
export default function NotificationModal({ isOpen, message, isConfirm, onConfirm, onCancel }) {
    if (!isOpen) return null;

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.notificationModal}>
                <p>{message}</p>
                <div className={styles.notificationActions}>
                    {isConfirm ? (
                        <>
                            <button onClick={onCancel} className={`${styles.button} ${styles.secondaryButton}`}>Отмена</button>
                            <button onClick={onConfirm} className={`${styles.button} ${styles.dangerButton}`}>Подтвердить</button>
                        </>
                    ) : (
                        <button onClick={onCancel} className={`${styles.button} ${styles.primaryButton}`}>OK</button>
                    )}
                </div>
            </div>
        </div>
    );
}
