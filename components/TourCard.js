// components/TourCard.js
// Отображает отдельную карточку тура на публичных страницах.

import Image from 'next/image';
import styles from '../styles/TourCard.module.css';

// Небольшой прозрачный пиксель 1x1 для эффекта размытия (blur placeholder)
const BLUR_DATA_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII=';

const TourCard = ({ tour, onDetailsClick }) => {
    // Проверяем наличие всех необходимых данных тура, включая image_url
    if (!tour || !tour.image_url || !tour.title) return null; 
    
    /**
     * Обработчик клика по кнопке "Подробнее".
     * Вызывает переданную извне функцию onDetailsClick, если она есть.
     */
    const handleDetailsClick = () => {
        if (onDetailsClick) {
            onDetailsClick(tour);
        }
    };

    return (
        <div className={styles.card}>
            <div className={styles.image_container}>
               {/*
                   ИСПРАВЛЕНО: Используем tour.image_url вместо tour.image.
                   Это поле приходит с бэкенда и содержит путь к изображению.
                   Добавлен blurDataURL для лучшего UX при загрузке изображений.
               */}
               <Image 
                    src={tour.image_url} 
                    alt={tour.title} 
                    fill // Заполняет родительский контейнер
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Адаптивные размеры изображения
                    className={styles.image}
                    placeholder="blur" // Эффект размытия при загрузке
                    blurDataURL={BLUR_DATA_URL} // Данные для размытого плейсхолдера
                />
            </div>
            <div className={styles.content}>
                <h3 className={styles.title}>{tour.title}</h3>
                <p className={styles.description}>{tour.description}</p>
                <div className={styles.footer}>
                    <div className={styles.price}>
                        <span>от</span> {tour.price} {tour.currency || '$'}
                    </div>
                    <button onClick={handleDetailsClick} className={styles.button}>
                        Подробнее
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TourCard;
