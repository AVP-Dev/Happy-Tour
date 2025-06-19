import React from 'react';
import styles from '../../styles/Admin.module.css';

const initialFormState = {
    title: '', description: '', price: '', currency: 'BYN', image: '', category: ''
};

/**
 * Modal form for adding and editing tours.
 * @version 2.4 - Added scrollable form area for long content.
 */
export default function TourForm({ isOpen, onClose, config, showNotification, onDataChange }) {
    const [formData, setFormData] = React.useState(initialFormState);
    const [imagePreview, setImagePreview] = React.useState(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    React.useEffect(() => {
        const className = 'bodyModalOpen';
        if (isOpen) {
            document.body.classList.add(className);
        } else {
            document.body.classList.remove(className);
        }
        return () => {
            document.body.classList.remove(className);
        };
    }, [isOpen]);

    React.useEffect(() => {
        if (isOpen) {
            if (config.mode === 'edit' && config.data) {
                setFormData({
                    title: config.data.title || '',
                    description: config.data.description || '',
                    price: config.data.price || '',
                    currency: config.data.currency || 'BYN',
                    image: config.data.image || '',
                    category: config.category
                });
                setImagePreview(config.data.image);
            } else {
                setFormData(initialFormState);
                setImagePreview(null);
            }
        }
    }, [isOpen, config]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            if (file.size > 5 * 1024 * 1024) {
                showNotification('Ошибка: Размер файла не должен превышать 5МБ.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image: reader.result }));
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            showNotification('Пожалуйста, выберите корректный файл изображения.');
            e.target.value = null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const isEditMode = config.mode === 'edit';
        const url = '/api/admin/tours';
        const method = isEditMode ? 'PUT' : 'POST';

        const payload = {
            ...formData,
            tourId: isEditMode ? config.tourId : undefined,
        };
        
        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message || 'Произошла ошибка на сервере');
            
            showNotification(result.message);
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
        <div className={styles.modalBackdrop} onMouseDown={onClose}>
            <div className={styles.formModal} onMouseDown={e => e.stopPropagation()}>
                <div className={styles.formHeader}>
                    <h2>{config.mode === 'add' ? 'Добавить новый тур' : 'Редактировать тур'}</h2>
                    <button onClick={onClose} className={styles.closeButton} title="Закрыть">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className={styles.tourForm}>
                    <div className={styles.formContent}>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup} style={{gridColumn: '1 / -1'}}>
                                <label htmlFor="title">Название *</label>
                                <input id="title" type="text" name="title" value={formData.title} onChange={handleChange} required />
                            </div>
                            <div className={styles.formGroup} style={{gridColumn: '1 / -1'}}>
                                <label htmlFor="category">Категория *</label>
                                <select id="category" name="category" value={formData.category} onChange={handleChange} required disabled={config.mode === 'edit'}>
                                    <option value="" disabled>Выберите категорию</option>
                                    <option value="hot">Горящие туры</option>
                                    <option value="popular">Популярные направления</option>
                                    <option value="special">Выгодные предложения</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="price">Цена *</label>
                                <input id="price" type="number" name="price" value={formData.price} onChange={handleChange} required min="0" />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="currency">Валюта</label>
                                <select id="currency" name="currency" value={formData.currency} onChange={handleChange}>
                                    <option value="BYN">BYN</option>
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                </select>
                            </div>
                            <div className={styles.formGroup} style={{gridColumn: '1 / -1'}}>
                                <label htmlFor="description">Описание *</label>
                                <textarea id="description" name="description" value={formData.description} onChange={handleChange} required rows="4"></textarea>
                            </div>
                            <div className={styles.formGroup} style={{gridColumn: '1 / -1'}}>
                                <label htmlFor="image">Изображение *</label>
                                <input id="image" type="file" accept="image/*" onChange={handleImageChange} required={!formData.image} />
                                {imagePreview && <img src={imagePreview} alt="Предпросмотр" className={styles.imagePreview} />}
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
