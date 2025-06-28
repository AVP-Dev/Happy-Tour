// components/admin/TourForm.js
// Форма для добавления и редактирования туров.

import React, { useState, useEffect } from 'react';
import styles from '../../styles/Admin.module.css';

export default function TourForm({ isOpen, onClose, config, showNotification, onDataChange }) {
    const [formData, setFormData] = useState({});
    const [imagePreview, setImagePreview] = useState(null); // URL для предпросмотра изображения
    const [imageFile, setImageFile] = useState(null);     // Объект File для загрузки
    const [isSubmitting, setIsSubmitting] = useState(false); // Состояние отправки формы

    useEffect(() => {
        // При открытии формы или изменении конфигурации (добавление/редактирование)
        if (isOpen) {
            const initialData = config.mode === 'edit'
                ? config.data // Если режим редактирования, используем данные тура
                : { category: 'hot', currency: 'BYN' }; // Если добавление, дефолтные значения
            setFormData(initialData);
            // Если есть существующее изображение (при редактировании), показываем его предпросмотр
            setImagePreview(initialData.image_url || null); // Используем image_url из данных
            setImageFile(null); // Сбрасываем выбранный файл
        }
    }, [isOpen, config]); // Зависимости эффекта: isOpen и config

    /**
     * Обработчик изменения полей формы.
     * Обновляет formData соответствующим значением.
     * @param {Event} e - Событие изменения.
     */
    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    /**
     * Обработчик выбора файла изображения.
     * Проверяет размер файла и устанавливает его для предпросмотра.
     * @param {Event} e - Событие изменения input[type="file"].
     */
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // Проверка размера файла (5 МБ)
                showNotification('Файл слишком большой (макс. 5 МБ)');
                e.target.value = ''; // Очищаем выбранный файл в input
                setImageFile(null);
                setImagePreview(null);
                return;
            }
            setImageFile(file); // Сохраняем файл для отправки
            setImagePreview(URL.createObjectURL(file)); // Создаем URL для предпросмотра
        } else {
            setImageFile(null);
            setImagePreview(null);
        }
    };

    /**
     * Обработчик отправки формы.
     * Отправляет данные тура и файл изображения на сервер.
     * @param {Event} e - Событие отправки формы.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Базовая валидация
        if (!formData.title || !formData.price || !formData.category) {
            showNotification("Пожалуйста, заполните все обязательные поля (Название, Цена, Категория).");
            return;
        }
        if (config.mode === 'add' && !imageFile) { // Изображение обязательно при добавлении нового тура
            showNotification("Изображение обязательно для нового тура.");
            return;
        }

        setIsSubmitting(true);
        showNotification("Сохранение тура..."); // Показываем уведомление о процессе сохранения

        try {
            // Создаем объект FormData для отправки текстовых полей и файла
            const dataToSend = new FormData();
            
            // Добавляем текстовые поля из formData
            for (const key in formData) {
                // Исключаем поля, связанные с изображением, так как их логика обрабатывается отдельно
                if (key !== 'image' && formData[key] !== null && formData[key] !== undefined) {
                    dataToSend.append(key, formData[key]);
                }
            }

            // Если есть новый выбранный файл изображения, добавляем его
            if (imageFile) {
                dataToSend.append('image', imageFile);
            } else if (config.mode === 'edit' && formData.image_url) {
                // Если режим редактирования и нет нового файла, но есть старый URL, отправляем его
                // Это нужно, чтобы сервер знал, что изображение не менялось
                dataToSend.append('image_url', formData.image_url);
            }


            // Отправляем запрос на API-маршрут
            const res = await fetch('/api/admin/tours', {
                method: config.mode === 'edit' ? 'PUT' : 'POST', // Метод PUT для редактирования, POST для добавления
                // headers: { 'Content-Type': 'multipart/form-data' } - НЕ НУЖНО.
                // Когда вы отправляете объект FormData, браузер автоматически устанавливает
                // правильный Content-Type: multipart/form-data с необходимым boundary.
                body: dataToSend // Тело запроса - объект FormData
            });

            const result = await res.json(); // Парсим ответ от сервера

            // Проверяем, был ли запрос успешным
            if (!res.ok) {
                throw new Error(result.message || 'Произошла ошибка при сохранении.');
            }
            
            showNotification({type: 'success', message: result.message || 'Тур успешно сохранен!'}); // Показываем уведомление об успехе
            onDataChange(); // Уведомляем родительский компонент об изменении данных
            onClose(); // Закрываем модальное окно формы
        } catch (error) {
            console.error('Ошибка сохранения тура:', error);
            showNotification({type: 'error', message: `Ошибка сохранения: ${error.message}`}); // Показываем уведомление об ошибке
        } finally {
            setIsSubmitting(false); // Снимаем состояние отправки
        }
    };

    if (!isOpen) return null; // Не рендерим компонент, если модальное окно закрыто

    return (
        <div className={styles.modalBackdrop} onMouseDown={onClose}>
            <div className={styles.formModal} onMouseDown={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className={styles.tourForm}>
                    <div className={styles.formHeader}>
                        <h2>{config.mode === 'add' ? 'Добавить новый тур' : 'Редактировать тур'}</h2>
                        <button type="button" onClick={onClose} className={styles.closeButton} title="Закрыть">&times;</button>
                    </div>
                    <div className={styles.formContent}>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                                <label htmlFor="title">Название тура *</label>
                                <input id="title" type="text" name="title" value={formData.title || ''} onChange={handleChange} required />
                            </div>
                            <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                                <label htmlFor="description">Описание</label>
                                <textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} rows="3"></textarea>
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="price">Цена *</label>
                                <input id="price" type="number" name="price" value={formData.price || ''} onChange={handleChange} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="currency">Валюта</label>
                                <select id="currency" name="currency" value={formData.currency || 'BYN'} onChange={handleChange}>
                                    <option value="BYN">BYN</option>
                                    <option value="USD">USD</option>
                                    <option value="RUB">RUB</option>
                                    <option value="EUR">EUR</option>
                                </select>
                            </div>
                            <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                                <label htmlFor="category">Категория *</label>
                                <select id="category" name="category" value={formData.category || 'hot'} onChange={handleChange} required>
                                    <option value="hot">Горящие туры</option>
                                    <option value="popular">Популярные направления</option>
                                    <option value="special">Выгодные предложения</option>
                                </select>
                            </div>
                            <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                                <label htmlFor="image">Изображение *</label>
                                <input id="image" type="file" accept="image/*" onChange={handleImageChange} />
                                {imagePreview && 
                                    <div style={{ marginTop: '1rem' }}>
                                        <img 
                                            src={imagePreview} 
                                            alt="Предпросмотр" 
                                            style={{ width: '150px', height: 'auto', borderRadius: '8px', objectFit: 'cover' }}
                                        />
                                    </div>
                                }
                            </div>
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
