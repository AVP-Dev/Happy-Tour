// /components/Notification.js
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import styles from '../styles/Notification.module.css';

/**
 * A beautiful notification component to display success or error messages.
 * @param {object} props
 * @param {'success' | 'error'} props.type - The type of notification.
 * @param {string} props.message - The message to display.
 * @param {() => void} props.onClose - Function to call when the close button is clicked.
 */
const Notification = ({ type, message, onClose }) => {
    const isError = type === 'error';

    return (
        <div className={styles.notification}>
            <div className={isError ? styles.iconError : styles.iconSuccess}>
                {isError ? <FaTimesCircle size={50} /> : <FaCheckCircle size={50} />}
            </div>
            <h3 className={styles.title}>
                {isError ? 'Произошла ошибка' : 'Успешно!'}
            </h3>
            <p className={styles.message}>{message}</p>
            <button onClick={onClose} className={`btn ${isError ? styles.btnError : styles.btnSuccess}`}>
                Закрыть
            </button>
        </div>
    );
};

export default Notification;
