// components/TourCard.js
// Компонент для отображения карточки тура на публичной части сайта.
// Теперь использует локальные пути к изображениям.

import Image from 'next/image';
import styles from '../styles/TourCard.module.css';

// Крошечный прозрачный пиксель 1x1 для эффекта размытия при ленивой загрузке
const BLUR_DATA_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII=';

/**
 * Компонент TourCard отображает информацию о туре в виде карточки.
 * Использует next/image для оптимизации загрузки локальных изображений.
 * @param {object} props - Свойства компонента.
 * @param {object} props.tour - Объект тура, содержащий title, description, price, currency, image_url.
 * @param {function} props.onDetailsClick - Функция обратного вызова при клике на кнопку "Подробнее".
 */
const TourCard = ({ tour, onDetailsClick }) => {
    // Проверка наличия обязательных данных для отображения карточки
    // Теперь проверяем tour.image_url вместо tour.image
    if (!tour || !tour.image_url || !tour.title) return null; 
    
    /**
     * Обработчик клика по кнопке "Подробнее".
     * Вызывает onDetailsClick с данными текущего тура.
     */
    const handleDetailsClick = () => {
        if (onDetailsClick) {
            onDetailsClick(tour);
        }
    };

    return (
        <div className={styles.card}>
            <div className={styles.image_container}>
               <Image 
                    // ИЗМЕНЕНО: src теперь использует tour.image_url
                    src={tour.image_url} 
                    alt={tour.title} 
                    fill // Изображение будет заполнять родительский контейнер
                    // Определение размеров изображения для разных брейкпоинтов
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className={styles.image}
                    // PERFORMANCE FIX: Добавлен placeholder="blur" для плавного появления изображения
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
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
