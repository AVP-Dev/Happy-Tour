import { useState, useCallback } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import styles from '../styles/Form.module.css';

export default function ReviewForm({ onClose, onReviewSubmitted, onFormSubmit }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
    const [errors, setErrors] = useState({});
    const { executeRecaptcha } = useGoogleReCaptcha();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Имя обязательно для заполнения.';
        if (!formData.message.trim()) newErrors.message = 'Текст отзыва обязателен.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!validateForm() || !executeRecaptcha) return;
        setIsSubmitting(true);
        const recaptchaToken = await executeRecaptcha('review_form');
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ author: formData.name, text: formData.message, recaptchaToken })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            if (onFormSubmit) onFormSubmit({ type: 'success', message: data.message });
            if (onReviewSubmitted) onReviewSubmitted(); 
            if (onClose) onClose();
        } catch (error) {
            if (onFormSubmit) onFormSubmit({ type: 'error', message: error.message || 'Не удалось связаться с сервером.' });
        } finally {
            setIsSubmitting(false);
        }
    }, [executeRecaptcha, formData, onFormSubmit, onReviewSubmitted, onClose, validateForm]);

    return (
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Оставить отзыв</h3>
            <div className={styles.form_group}>
                <input type="text" id="review-name" name="name" required placeholder=" " value={formData.name} onChange={handleChange} />
                <label htmlFor="review-name">Ваше имя *</label>
                {errors.name && <p className={styles.error_message}>{errors.name}</p>}
            </div>
            <div className={styles.form_group}>
                <textarea id="review-message" name="message" rows="4" required placeholder=" " value={formData.message} onChange={handleChange}></textarea>
                <label htmlFor="review-message">Ваш отзыв *</label>
                {errors.message && <p className={styles.error_message}>{errors.message}</p>}
            </div>
            <p className={styles.recaptchaNotice}>Этот сайт защищен reCAPTCHA. Применяются Политика конфиденциальности и Условия использования Google.</p>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Отправка...' : 'Отправить отзыв'}
            </button>
        </form>
    );
}
