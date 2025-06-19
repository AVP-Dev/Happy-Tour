// /components/ReviewForm.js
import { useState } from 'react';
import styles from '../styles/Form.module.css';

// Вспомогательные функции для валидации
const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

const isValidPhone = (phone) => {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 7;
};

export default function ReviewForm({ onClose, onReviewSubmitted, onFormSubmit }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });

    // Новое состояние для хранения ошибок валидации
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Убираем ошибку при начале ввода
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Имя обязательно для заполнения.';
        }
        if (!formData.message.trim()) {
            newErrors.message = 'Текст отзыва обязателен.';
        }
        
        // --- НОВАЯ ЛОГИКА ВАЛИДАЦИИ ---
        const emailTrimmed = formData.email.trim();
        const phoneTrimmed = formData.phone.trim();

        if (!emailTrimmed && !phoneTrimmed) {
            newErrors.email = 'Пожалуйста, укажите Email или телефон.';
            newErrors.phone = 'Пожалуйста, укажите Email или телефон.';
        } else {
            if (emailTrimmed && !isValidEmail(emailTrimmed)) {
                newErrors.email = 'Пожалуйста, введите корректный Email.';
            }
            if (phoneTrimmed && !isValidPhone(phoneTrimmed)) {
                newErrors.phone = 'Номер телефона должен содержать минимум 7 цифр.';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const isValid = validateForm();
        if (!isValid) return;

        setIsSubmitting(true);

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            
            if (res.ok) {
                if (onFormSubmit) onFormSubmit({ type: 'success', message: data.message || 'Спасибо! Ваш отзыв отправлен на модерацию.' });
                setFormData({ name: '', email: '', phone: '', message: '' }); 
                if (onReviewSubmitted) onReviewSubmitted(); 
                if (onClose) onClose();
            } else {
                if (onFormSubmit) onFormSubmit({ type: 'error', message: data.message || 'Произошла неизвестная ошибка.' });
            }
        } catch (error) {
            console.error('Submit Error:', error);
            if (onFormSubmit) onFormSubmit({ type: 'error', message: 'Не удалось связаться с сервером.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Оставить отзыв</h3>
            <div className={styles.form_group}>
                <input type="text" id="review-name" name="name" required placeholder=" " value={formData.name} onChange={handleChange} />
                <label htmlFor="review-name">Ваше имя *</label>
                {errors.name && <p className={styles.error_message}>{errors.name}</p>}
            </div>
            <div className={styles.form_group}>
                <input type="email" id="review-email" name="email" placeholder=" " value={formData.email} onChange={handleChange} />
                <label htmlFor="review-email">Email</label>
                {errors.email && <p className={styles.error_message}>{errors.email}</p>}
            </div>
            <div className={styles.form_group}>
                <input type="tel" id="review-phone" name="phone" placeholder=" " value={formData.phone} onChange={handleChange} />
                <label htmlFor="review-phone">Телефон</label>
                {errors.phone && <p className={styles.error_message}>{errors.phone}</p>}
            </div>
            <div className={styles.form_group}>
                <textarea id="review-message" name="message" rows="4" required placeholder=" " value={formData.message} onChange={handleChange}></textarea>
                <label htmlFor="review-message">Ваш отзыв *</label>
                {errors.message && <p className={styles.error_message}>{errors.message}</p>}
            </div>
            <p className={styles.form_hint}>Поля, отмеченные *, обязательны. Укажите Email или телефон для связи.</p>
            
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Отправка...' : 'Отправить отзыв'}
            </button>
        </form>
    );
}
