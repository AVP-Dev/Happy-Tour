import React, { useState, useEffect } from 'react';
import styles from '../../styles/Admin.module.css';

/**
 * Компонент ReviewEditForm для редактирования отзыва.
 * @param {object} props - Свойства компонента.
 * @param {boolean} props.isOpen - Открыта ли форма.
 * @param {function} props.onClose - Функция закрытия формы.
 * @param {object} props.reviewData - Данные редактируемого отзыва.
 * @param {function} props.onDataChange - Функция для обновления данных после сохранения.
 * @param {function} props.showNotification - Функция для показа уведомлений.
 * @param {function} props.handleUnauthorized - Функция для обработки ошибок авторизации.
 */
export default function ReviewEditForm({ isOpen, onClose, reviewData, onDataChange, showNotification, handleUnauthorized }) {
    const [formData, setFormData] = useState({ author: '', text: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Загружаем данные отзыва в форму при изменении reviewData
    useEffect(() => {
        if (reviewData) {
            setFormData({ author: reviewData.author, text: reviewData.text });
        }
    }, [reviewData]);

    /**
     * Обработчик изменения полей формы.
     * @param {Event} e - Событие изменения.
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    /**
     * Обработчик отправки формы.
     * Отправляет обновленные данные отзыва на сервер.
     * @param {Event} e - Событие отправки формы.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/admin/reviews/${reviewData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ author: formData.author, text: formData.text }),
            });
            
            // Обработка ошибки несанкционированного доступа
            if (res.status === 401) { handleUnauthorized(); return; }

            const result = await res.json();
            // Проверка успешности ответа от API
            if (!res.ok) { 
                throw new Error(result.message || 'Произошла ошибка при обновлении отзыва.'); 
            }
            
            showNotification({type: 'success', message: 'Отзыв успешно обновлен!'});
            onDataChange(); // Уведомляем родительский компонент об изменении данных
            onClose(); // Закрываем модальное окно формы
        } catch (error) {
            console.error('Ошибка сохранения отзыва:', error);
            showNotification({type: 'error', message: `Ошибка сохранения: ${error.message}`});
        } finally {
            setIsSubmitting(false); // Снимаем состояние отправки
        }
    };

    if (!isOpen) return null; // Не рендерим компонент, если модальное окно закрыто

    return (
        <div className={`${styles.modalBackdrop} ${styles.notificationModalBackdrop}`}> {/* Используем стили модального окна */}
            <div className={styles.formModal} onMouseDown={e => e.stopPropagation()}> {/* Предотвращаем закрытие при клике внутри */}
                <div className={styles.formHeader}>
                    <h2>Редактировать отзыв</h2>
                    <button type="button" onClick={onClose} className={styles.closeButton} title="Закрыть">&times;</button>
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
