import React, { useState, useEffect } from 'react';
import styles from '../../styles/Admin.module.css';

export default function ReviewEditForm({ isOpen, onClose, reviewData, onDataChange, showNotification, handleUnauthorized }) {
    const [formData, setFormData] = useState({ author: '', text: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (reviewData) {
            setFormData({ author: reviewData.author, text: reviewData.text });
        }
    }, [reviewData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/admin/reviews/${reviewData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ author: formData.author, text: formData.text }),
            });
            
            if (res.status === 401) return handleUnauthorized();

            const result = await res.json();
            if (!res.ok) throw new Error(result.message);
            
            showNotification('Отзыв успешно обновлен!');
            onDataChange();
            onClose();
        } catch (error) {
            showNotification(`Ошибка сохранения: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={`${styles.modalBackdrop} ${styles.notificationModalBackdrop}`}>
            <div className={styles.formModal} onMouseDown={e => e.stopPropagation()}>
                <div className={styles.formHeader}>
                    <h2>Редактировать отзыв</h2>
                    <button onClick={onClose} className={styles.closeButton} title="Закрыть">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formContent}>
                        <div className={styles.formGroup}>
                            <label htmlFor="author">Автор *</label>
                            <input id="author" type="text" name="author" value={formData.author} onChange={handleChange} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="text">Текст отзыва *</label>
                            <textarea id="text" name="text" value={formData.text} onChange={handleChange} required rows="8"></textarea>
                        </div>
                    </div>
                    <div className={styles.formActions}>
                        <button type="button" onClick={onClose} className={`${styles.button} ${styles.secondaryButton}`}>Отмена</button>
                        <button type="submit" className={`${styles.button} ${styles.primaryButton}`} disabled={isSubmitting}>
                            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
