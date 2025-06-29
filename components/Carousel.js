// components/Carousel.js
import React from 'react';
import TourCard from './TourCard';
import ReviewCard from './ReviewCard';
import styles from '../styles/Carousel.module.css';

const Carousel = ({ tours, reviews, isReviewCarousel = false, onTourInquiry, onReadMore }) => {
    const items = isReviewCarousel ? reviews : tours;

    // Проверяем, если количество элементов <= 2 (для центрирования)
    // Убедимся, что items существует и не пуст, чтобы избежать ошибок
    const isSmallCount = items && items.length > 0 && items.length <= 2;
    // Применяем класс centeredContent, если количество маленькое
    const carouselContentClass = `${styles.carouselContent} ${isSmallCount ? styles.centeredContent : ''}`;

    if (!items || items.length === 0) {
        return (
            <p className={styles.noItemsMessage}>
                {isReviewCarousel ? 'Пока нет опубликованных отзывов.' : 'Туры скоро появятся!'}
            </p>
        );
    }

    return (
        <div className={styles.carouselContainer}>
            {/* Применяем динамический класс для центрирования */}
            <div className={carouselContentClass}>
                {items.map((item) => (
                    isReviewCarousel ? (
                        <ReviewCard key={item.id} review={item} onReadMore={() => onReadMore(item)} />
                    ) : (
                        <TourCard key={item.id} tour={item} onDetailsClick={onTourInquiry} />
                    )
                ))}
            </div>
        </div>
    );
};

export default Carousel;