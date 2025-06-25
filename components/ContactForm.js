// /components/ContactForm.js
import { useState, useEffect, useCallback } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import styles from '../styles/Form.module.css';

// --- Validation helper functions ---
const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

const isValidPhone = (phone) => {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 7;
};


export default function ContactForm({ onFormSubmit, onClose, initialMessage = '' }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: initialMessage });
    const [errors, setErrors] = useState({});

    // reCAPTCHA hook
    const { executeRecaptcha } = useGoogleReCaptcha();

    useEffect(() => {
        setFormData(prev => ({ ...prev, message: initialMessage }));
    }, [initialMessage]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = 'Имя обязательно для заполнения.';
        }
        
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


    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        
        const isValid = validateForm();
        if (!isValid || !executeRecaptcha) {
            console.log("Validation failed or executeRecaptcha not available.");
            return;
        }

        setIsSubmitting(true);

        // Generate reCAPTCHA token
        const recaptchaToken = await executeRecaptcha('contact_form');

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Send form data along with the reCAPTCHA token
                body: JSON.stringify({ ...formData, recaptchaToken })
            });

            const data = await res.json();
            
            if (res.ok) {
                if (onFormSubmit) onFormSubmit({ type: 'success', message: data.message || 'Ваше сообщение успешно отправлено!' });
                setFormData({ name: '', email: '', phone: '', message: '' }); 
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
    }, [executeRecaptcha, formData, onFormSubmit, onClose]);

    return (
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.form_group}>
                <input type="text" id="contact-name" name="name" required placeholder=" " value={formData.name} onChange={handleChange} />
                <label htmlFor="contact-name">Ваше имя *</label>
                {errors.name && <p className={styles.error_message}>{errors.name}</p>}
            </div>
            <div className={styles.form_group}>
                <input type="email" id="contact-email" name="email" placeholder=" " value={formData.email} onChange={handleChange} />
                <label htmlFor="contact-email">Email</label>
                {errors.email && <p className={styles.error_message}>{errors.email}</p>}
            </div>
            <div className={styles.form_group}>
                <input type="tel" id="contact-phone" name="phone" placeholder=" " value={formData.phone} onChange={handleChange} />
                <label htmlFor="contact-phone">Телефон</label>
                {errors.phone && <p className={styles.error_message}>{errors.phone}</p>}
            </div>
            <div className={styles.form_group}>
                <textarea id="contact-message" name="message" rows="4" placeholder=" " value={formData.message} onChange={handleChange}></textarea>
                <label htmlFor="contact-message">Ваше сообщение</label>
            </div>
            <p className={styles.form_hint}>Поля, отмеченные *, обязательны. Укажите Email или телефон для связи.</p>
            
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Отправка...' : 'Отправить сообщение'}
            </button>
        </form>
    );
}
