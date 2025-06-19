import React from 'react';
import { FiCheck, FiTrash2 } from 'react-icons/fi';
import styles from '../../styles/Admin.module.css';

/**
 * Component for managing reviews.
 * @version 2.1 - Using standardized 'author' and 'text' fields.
 */
export default function ReviewManager({ reviews, onDataChange, showNotification }) {
    
    if (!reviews) return <p>Загрузка отзывов...</p>;

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            // Запрос на динамический роут [id].js
            const res = await fetch(`/api/admin/reviews/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message);

            showNotification('Статус отзыва успешно обновлен!');
            onDataChange();
        } catch (error) {
            showNotification(`Ошибка обновления: ${error.message}`);
        }
    };

    const handleDelete = (id) => {
        showNotification('Вы уверены, что хотите удалить этот отзыв?', true, async () => {
            try {
                // Запрос на динамический роут [id].js
                const res = await fetch(`/api/admin/reviews/${id}`, {
                    method: 'DELETE'
                });
                if (!res.ok) {
                    const result = await res.json();
                    throw new Error(result.message);
                }
                showNotification('Отзыв успешно удален!');
                onDataChange();
            } catch (error) {
                showNotification(`Ошибка удаления: ${error.message}`);
            }
        });
    };

    const pendingReviews = reviews.filter(r => r.status === 'pending');
    const publishedReviews = reviews.filter(r => r.status === 'published');

    return (
        <div>
            <div className={styles.contentHeader}>
                <h2>Управление отзывами</h2>
            </div>
            <div className={styles.reviewsGrid}>
                <div className={styles.reviewColumn}>
                    <h3>На модерации ({pendingReviews.length})</h3>
                    {pendingReviews.length > 0 ? pendingReviews.map((review) => (
                        <div key={review.id} className={styles.reviewItemAdmin}>
                            {/* Используем стандартизированные поля */}
                            <p><strong>{review.author}</strong></p>
                            <p className={styles.reviewDate}>{new Date(review.date).toLocaleDateString()}</p>
                            <p className={styles.reviewText}>"{review.text}"</p>
                            <div className={styles.reviewActionsAdmin}>
                                <button onClick={() => handleUpdateStatus(review.id, 'published')} className={`${styles.button} ${styles.primaryButton} ${styles.iconButton}`} title="Опубликовать"><FiCheck /></button>
                                <button onClick={() => handleDelete(review.id)} className={`${styles.button} ${styles.dangerButton} ${styles.iconButton}`} title="Удалить"><FiTrash2 /></button>
                            </div>
                        </div>
                    )) : <p>Нет новых отзывов на модерации.</p>}
                </div>
                <div className={styles.reviewColumn}>
                    <h3>Опубликованные ({publishedReviews.length})</h3>
                    {publishedReviews.length > 0 ? publishedReviews.map((review) => (
                        <div key={review.id} className={styles.reviewItemAdmin}>
                            <p><strong>{review.author}</strong></p>
                            <p className={styles.reviewDate}>{new Date(review.date).toLocaleDateString()}</p>
                            <p className={styles.reviewText}>"{review.text}"</p>
                            <div className={styles.reviewActionsAdmin}>
                                <button onClick={() => handleDelete(review.id)} className={`${styles.button} ${styles.dangerButton} ${styles.iconButton}`} title="Удалить"><FiTrash2 /></button>
                            </div>
                        </div>
                    )) : <p>Нет опубликованных отзывов.</p>}
                </div>
            </div>
        </div>
    );
}
