import { useState } from 'react';
import { useRouter } from 'next/router';
import { FiCheck, FiTrash2 } from 'react-icons/fi';
import styles from '../../styles/Admin.module.css';

export default function ReviewManager({ initialData }) {
    const router = useRouter();
    const [reviews, setReviews] = useState(initialData);

    const refreshData = () => router.replace(router.asPath);

    const handleReviewAction = async (action, reviewIndex) => {
        const res = await fetch('/api/admin/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, reviewIndex }),
        });
        if (res.ok) {
            refreshData();
        } else {
            alert('Произошла ошибка');
        }
    };

    const pendingReviews = reviews.filter(r => r.status === 'pending');
    const publishedReviews = reviews.filter(r => r.status === 'published');

    return (
        <div>
            <div className={styles.contentHeader}>
                <h2>Управление отзывами</h2>
            </div>
            
            <div className={styles.reviewsContainer}>
                <div className={styles.reviewColumn}>
                    <h3>На модерации ({pendingReviews.length})</h3>
                    {pendingReviews.length > 0 ? pendingReviews.map((review) => (
                        <div key={review.originalIndex} className={styles.reviewItemAdmin}>
                            <p><strong>{review.name}</strong> <span>({review.email})</span></p>
                            <p className={styles.reviewDate}>{new Date(review.date).toLocaleString()}</p>
                            <p className={styles.reviewText}>"{review.message}"</p>
                            <div className={styles.reviewActionsAdmin}>
                                <button onClick={() => handleReviewAction('publish', review.originalIndex)} className={styles.publishBtn}><FiCheck /> Опубликовать</button>
                                <button onClick={() => handleReviewAction('delete', review.originalIndex)} className={styles.deleteBtn}><FiTrash2 /> Удалить</button>
                            </div>
                        </div>
                    )) : <p>Нет новых отзывов.</p>}
                </div>

                <div className={styles.reviewColumn}>
                    <h3>Опубликованные ({publishedReviews.length})</h3>
                    {publishedReviews.length > 0 ? publishedReviews.map((review) => (
                        <div key={review.originalIndex} className={styles.reviewItemAdmin}>
                            <p><strong>{review.name}</strong></p>
                            <p className={styles.reviewDate}>{new Date(review.date).toLocaleString()}</p>
                            <p className={styles.reviewText}>"{review.message}"</p>
                            <div className={styles.reviewActionsAdmin}>
                                <button onClick={() => handleReviewAction('delete', review.originalIndex)} className={styles.deleteBtn}><FiTrash2 /> Удалить</button>
                            </div>
                        </div>
                    )) : <p>Нет опубликованных отзывов.</p>}
                </div>
            </div>
        </div>
    );
}
export async function getServerSideProps(context) {
  return {
    props: {},
  };
}