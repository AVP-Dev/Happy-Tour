import { useState } from 'react';
import { FiCheck, FiTrash2, FiEdit, FiSlash } from 'react-icons/fi';
import styles from '../../styles/Admin.module.css';

/**
 * Компонент ReviewCard для отображения отдельного отзыва.
 * @param {object} props - Свойства компонента.
 * @param {object} props.review - Объект отзыва.
 * @param {React.ReactNode} props.children - Дочерние элементы (кнопки действий).
 */
const ReviewCard = ({ review, children }) => {
    // Форматирование даты из timestamp
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

/**
 * Компонент ReviewManager для управления отзывами (модерация, публикация, удаление).
 * @param {object} props - Свойства компонента.
 * @param {Array<object>} props.reviews - Массив всех отзывов.
 * @param {boolean} props.isLoading - Состояние загрузки данных.
 * @param {function} props.onDataChange - Функция для обновления данных.
 * @param {function} props.showNotification - Функция для показа уведомлений.
 * @param {function} props.showConfirm - Функция для показа окна подтверждения.
 * @param {function} props.handleUnauthorized - Функция для обработки ошибок авторизации.
 */
export default function ReviewManager({ reviews, isLoading, onDataChange, showNotification, showConfirm, handleUnauthorized }) {
    
    /**
     * Обработчик действий с отзывом (опубликовать, снять с публикации, удалить).
     * @param {string} action - Тип действия ('publish', 'unpublish', 'delete').
     * @param {string} reviewId - ID отзыва, над которым производится действие.
     */
    const handleAction = async (action, reviewId) => {
        const methodMap = { publish: 'PUT', unpublish: 'PUT', delete: 'DELETE' };
        const bodyMap = { publish: { status: 'published' }, unpublish: { status: 'pending' } };

        try {
            const res = await fetch(`/api/admin/reviews/${reviewId}`, {
                method: methodMap[action],
                headers: { 'Content-Type': 'application/json' },
                // Отправляем тело запроса только для действий publish/unpublish
                body: ['publish', 'unpublish'].includes(action) ? JSON.stringify(bodyMap[action]) : null,
            });

            // Обработка ошибки несанкционированного доступа
            if (res.status === 401) { handleUnauthorized(); return; }
            // Обработка других ошибок HTTP
            if (!res.ok) { 
                const errorData = await res.json(); 
                throw new Error(errorData.message || 'Произошла ошибка при обновлении отзыва.'); 
            }
            
            showNotification({type: 'success', message: 'Статус отзыва успешно обновлен!'});
            onDataChange(); // Обновляем данные после успешного действия
        } catch (error) {
            showNotification({ type: 'error', message: `Ошибка: ${error.message}` });
        }
    };

    if (isLoading) return <p>Загрузка отзывов...</p>;

    // Фильтруем отзывы по статусу
    const pendingReviews = reviews ? reviews.filter(r => r.status === 'pending') : [];
    const publishedReviews = reviews ? reviews.filter(r => r.status === 'published') : [];

    return (
        <div className={styles.reviewsContainer}>
            {/* Колонка "На модерации" */}
            <div className={styles.reviewColumn}>
                <h2>На модерации ({pendingReviews.length})</h2>
                {pendingReviews.length > 0 ? pendingReviews.map(review => (
                    <ReviewCard key={review.id} review={review}>
                        {/* Кнопка удаления отзыва */}
                        <button 
                            onClick={() => showConfirm('Удалить этот отзыв?', () => handleAction('delete', review.id))} 
                            className={`${styles.button} ${styles.iconButton} ${styles.danger}`}
                            title="Удалить отзыв"
                        >
                            <FiTrash2 size={16}/>
                        </button>
                        {/* Кнопка публикации отзыва */}
                        <button 
                            onClick={() => handleAction('publish', review.id)} 
                            className={`${styles.button} ${styles.primaryButton}`}
                        >
                            <FiCheck/> Опубликовать
                        </button>
                    </ReviewCard>
                )) : <p className={styles.noItems}>Новых отзывов нет.</p>}
            </div>
            {/* Колонка "Опубликованные" */}
            <div className={styles.reviewColumn}>
                <h2>Опубликованные ({publishedReviews.length})</h2>
                {publishedReviews.length > 0 ? publishedReviews.map(review => (
                    <ReviewCard key={review.id} review={review}>
                        {/* Кнопка удаления отзыва */}
                        <button 
                            onClick={() => showConfirm('Удалить этот отзыв?', () => handleAction('delete', review.id))} 
                            className={`${styles.button} ${styles.iconButton} ${styles.danger}`}
                            title="Удалить отзыв"
                        >
                            <FiTrash2 size={16}/>
                        </button>
                        {/* Кнопка снятия с публикации */}
                        <button 
                            onClick={() => handleAction('unpublish', review.id)} 
                            className={`${styles.button} ${styles.secondaryButton}`}
                        >
                            <FiSlash/> Снять с публикации
                        </button>
                    </ReviewCard>
                )) : <p className={styles.noItems}>Опубликованных отзывов нет.</p>}
            </div>
        </div>
    );
}
