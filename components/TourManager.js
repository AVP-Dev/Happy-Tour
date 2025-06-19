import { useState } from 'react';
import styles from '../styles/Admin.module.css';

export default function TourManager({ toursByCategory, onUpdate }) {
    const [editingTour, setEditingTour] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleEditClick = (category, id) => {
        setEditingTour({ category, id, data: toursByCategory[category][id] });
        window.scrollTo(0, 0);
    };

    const handleCancelEdit = () => {
        setEditingTour(null);
    };

    const handleDeleteClick = async (category, id) => {
        if (!confirm('Вы уверены, что хотите удалить этот тур? Это действие необратимо.')) {
            return;
        }
        setIsLoading(true);
        const formData = new FormData();
        formData.append('action', 'delete_tour');
        formData.append('category', category);
        formData.append('tourId', id);

        const res = await fetch('/api/admin/tours', { method: 'POST', body: formData });
        const data = await res.json();
        setMessage(data.message);
        setIsLoading(false);
        if (res.ok) onUpdate();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        const formData = new FormData(e.target);
        formData.append('action', editingTour ? 'edit_tour' : 'add_tour');
        if (editingTour) {
            formData.append('category', editingTour.category);
            formData.append('tourId', editingTour.id);
            formData.append('currentImagePath', editingTour.data.image || '');
        }

        const res = await fetch('/api/admin/tours', { method: 'POST', body: formData });
        const data = await res.json();
        setMessage(data.message);
        setIsLoading(false);
        if (res.ok) {
            onUpdate();
            setEditingTour(null);
            e.target.reset();
        }
    };

    return (
        <div>
            {message && <p className={styles.message}>{message}</p>}
            <div className={styles.formContainer}>
                <h3>{editingTour ? 'Редактирование тура' : 'Добавить новый тур'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="category">Категория</label>
                        <select name="category" id="category" defaultValue={editingTour?.category || 'hot'} required disabled={!!editingTour}>
                            <option value="hot">Горящие туры</option>
                            <option value="popular">Популярные направления</option>
                            <option value="special">Выгодные предложения</option>
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="title">Заголовок</label>
                        <input type="text" name="title" id="title" defaultValue={editingTour?.data.title || ''} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="description">Описание</label>
                        <textarea name="description" id="description" rows="4" defaultValue={editingTour?.data.description || ''} required></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="price">Цена</label>
                        <input type="text" name="price" id="price" defaultValue={editingTour?.data.price || ''} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="image">Изображение</label>
                        <input type="file" name="image" id="image" accept="image/*" />
                        {editingTour && editingTour.data.image && <p>Текущее изображение: {editingTour.data.image}</p>}
                    </div>
                    <div className={styles.formActions}>
                        <button type="submit" disabled={isLoading}>{isLoading ? 'Сохранение...' : 'Сохранить'}</button>
                        {editingTour && <button type="button" onClick={handleCancelEdit}>Отмена</button>}
                    </div>
                </form>
            </div>

            <div className={styles.toursList}>
                <h3>Список туров</h3>
                {Object.entries(toursByCategory).map(([category, tours]) => (
                    <div key={category}>
                        <h4>{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                        {tours.map((tour, id) => (
                            <div key={`${category}-${id}`} className={styles.tourItem}>
                                <img src={tour.image} alt={tour.title} className={styles.tourImage} />
                                <div className={styles.tourInfo}>
                                    <strong>{tour.title}</strong>
                                    <p>{tour.description}</p>
                                    <span>{tour.price}</span>
                                </div>
                                <div className={styles.tourActions}>
                                    <button onClick={() => handleEditClick(category, id)} className={styles.editBtn}>Ред.</button>
                                    <button onClick={() => handleDeleteClick(category, id)} className={styles.deleteBtn}>Удл.</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
