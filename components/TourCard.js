import Image from 'next/image';
import styles from '../styles/TourCard.module.css';

// Получаем onDetailsClick из компонента Carousel
const TourCard = ({ tour, onDetailsClick }) => {
    // Проверка на случай отсутствия данных
    if (!tour || !tour.image || !tour.title) return null;
    
    // Функция-обработчик для кнопки "Подробнее"
    const handleDetailsClick = () => {
        // Вызываем функцию, переданную с главной страницы (index.js)
        if (onDetailsClick) {
            onDetailsClick(tour);
        }
    };

    return (
        <div className={styles.card}>
            <div className={styles.image_container}>
               {/* ИСПРАВЛЕНО: Возвращены все необходимые параметры для компонента Image */}
               <Image 
                    src={tour.image} 
                    alt={tour.title} 
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className={styles.image}
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII="
                />
            </div>

            <div className={styles.content}>
                <h3 className={styles.title}>{tour.title}</h3>
                <p className={styles.description}>{tour.description}</p>
                
                <div className={styles.footer}>
                    {/* Улучшенная структура цены */}
                    <div className={styles.price}>
                        <span>от</span> {tour.price} {tour.currency || '$'}
                    </div>
                    {/* Кнопка вызывает модальное окно */}
                    <button onClick={handleDetailsClick} className={styles.button}>
                        Подробнее
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TourCard;
