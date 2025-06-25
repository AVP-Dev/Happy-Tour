import { useState } from 'react';
import { FiCheck, FiTrash2, FiEdit, FiSlash } from 'react-icons/fi';
import styles from '../../styles/Admin.module.css';

const ReviewCard = ({ review, children }) => {
    const formatDate = (timestamp) => {
        if (!timestamp?.seconds) return 'неизвестно';
        return new Date(timestamp.seconds * 1000).toLocaleString('ru-RU', { 
            day: '2-digit', month: 'long', year: 'numeric' 
        });
    };

    return (
        <div className={`${styles.card} ${styles.reviewCard}`}>
            <div className={styles.cardHeader}>
                <span className={styles.reviewAuthor}>{review.author}</span>
                <span className={styles.reviewDate}>{formatDate(review.date)}</span>
            </div>
            <p className={styles.reviewText}>"{review.text}"</p>
            <div className={styles.reviewActions}>
                {children}
            </div>
        </div>
    );
};

export default function ReviewManager({ reviews, isLoading, onDataChange, showNotification, showConfirm, handleUnauthorized }) {
    
    const handleAction = async (action, reviewId) => {
        const methodMap = { publish: 'PUT', unpublish: 'PUT', delete: 'DELETE' };
        const bodyMap = { publish: { status: 'published' }, unpublish: { status: 'pending' } };

        try {
            const res = await fetch(`/api/admin/reviews/${reviewId}`, {
                method: methodMap[action],
                headers: { 'Content-Type': 'application/json' },
                body: ['publish', 'unpublish'].includes(action) ? JSON.stringify(bodyMap[action]) : null,
            });

            if (res.status === 401) { handleUnauthorized(); return; }
            if (!res.ok) { const errorData = await res.json(); throw new Error(errorData.message); }
            
            showNotification({type: 'success', message: 'Статус отзыва обновлен!'});
            onDataChange();
        } catch (error) {
            showNotification({ type: 'error', message: `Ошибка: ${error.message}` });
        }
    };

    if (isLoading) return <p>Загрузка отзывов...</p>;

    const pendingReviews = reviews ? reviews.filter(r => r.status === 'pending') : [];
    const publishedReviews = reviews ? reviews.filter(r => r.status === 'published') : [];

    return (
        <div className={styles.reviewsContainer}>
            <div className={styles.reviewColumn}>
                <h2>На модерации ({pendingReviews.length})</h2>
                {pendingReviews.length > 0 ? pendingReviews.map(review => (
                    <ReviewCard key={review.id} review={review}>
                        <button onClick={() => showConfirm('Удалить этот отзыв?', () => handleAction('delete', review.id))} className={`${styles.button} ${styles.iconButton} ${styles.danger}`}><FiTrash2 size={16}/></button>
                        <button onClick={() => handleAction('publish', review.id)} className={`${styles.button} ${styles.primaryButton}`}><FiCheck/> Опубликовать</button>
                    </ReviewCard>
                )) : <p>Новых отзывов нет.</p>}
            </div>
            <div className={styles.reviewColumn}>
                <h2>Опубликованные ({publishedReviews.length})</h2>
                {publishedReviews.length > 0 ? publishedReviews.map(review => (
                    <ReviewCard key={review.id} review={review}>
                        <button onClick={() => showConfirm('Удалить этот отзыв?', () => handleAction('delete', review.id))} className={`${styles.button} ${styles.iconButton} ${styles.danger}`}><FiTrash2 size={16}/></button>
                        <button onClick={() => handleAction('unpublish', review.id)} className={`${styles.button} ${styles.secondaryButton}`}><FiSlash/> Снять с публикации</button>
                    </ReviewCard>
                )) : <p>Опубликованных отзывов нет.</p>}
            </div>
        </div>
    );
}
