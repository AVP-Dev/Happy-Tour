// components/Carousel.js
import { Swiper, SwiperSlide } from 'swiper/react';
// ИСПРАВЛЕНО: Импорт модулей Swiper теперь из 'swiper/modules'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'; 
import TourCard from './TourCard';
import ReviewCard from './ReviewCard'; 

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import styles from '../styles/Carousel.module.css'; // Добавлен импорт стилей модуля

const Carousel = ({ tours, reviews, isReviewCarousel = false, onTourInquiry, onReadMore }) => {
    const items = isReviewCarousel ? reviews : tours;

    // УЛУЧШЕННАЯ ПРОВЕРКА: Проверяем, что items является массивом.
    // Это защитит сайт от падения, если API вернет ошибку вместо списка.
    if (!Array.isArray(items) || items.length === 0) {
        return <p className={styles.noItemsMessage}>Информация в этой категории скоро появится.</p>;
    }

    // Проверяем, если количество элементов <= 2 (для центрирования)
    const isSmallCount = items.length > 0 && items.length <= 2;
    // Removed carouselContentClass and used styles.carouselContent directly in render
    // as centering logic is now within .carouselContent itself or handled by Swiper.js

    const swiperParams = {
        modules: [Navigation, Pagination, Autoplay],
        spaceBetween: 30,
        loop: items.length > 4, // Loop only if more than 4 items (to fit 4 per view)
        centeredSlides: false, 
        navigation: {
            nextEl: '.swiper-button-next-custom',
            prevEl: '.swiper-button-prev-custom',
        },
        pagination: { 
            clickable: true,
            el: '.swiper-pagination-custom',
        },
        autoplay: {
            delay: 6000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
        },
        breakpoints: {
            320: { slidesPerView: 1, spaceBetween: 20 },
            768: { slidesPerView: 2, spaceBetween: 25 },
            1024: { slidesPerView: 3, spaceBetween: 30 },
            1280: { slidesPerView: 4, spaceBetween: 30 }, // ИСПРАВЛЕНО: Устанавливаем 4 слайда на больших экранах
        },
    };

    // If items count is small (less than or equal to 4 on desktop, considering breakpoints),
    // and we don't need loop/autoplay, render them in a simple flex container for centering.
    // Otherwise, use Swiper. This makes the "4 per section" static part clear.
    const isStaticDisplay = items.length <= 4; // Show as static grid if 4 or fewer tours

    if (isStaticDisplay && !isReviewCarousel) { // Reviews might always want carousel if many.
        return (
            <div className={styles.carouselContainer}>
                {/* Используем .carouselContent для центрирования и базового макета */}
                <div className={styles.carouselContent}>
                    {items.map((item, index) => (
                        <TourCard key={item.id || `static-tour-${index}`} tour={item} onTourInquiry={onTourInquiry} />
                    ))}
                </div>
            </div>
        );
    }

    // If items count is larger or it's a review carousel, use Swiper
    return (
        <div className={styles.carouselWrapper}>
            <Swiper {...swiperParams}>
                {items.map((item, index) => (
                    <SwiperSlide key={item.id || `swiper-slide-${index}`} style={{ height: 'auto' }}>
                        {isReviewCarousel 
                            ? <ReviewCard review={item} onReadMore={onReadMore} /> 
                            : <TourCard tour={item} onTourInquiry={onTourInquiry} />
                        }
                    </SwiperSlide>
                ))}
            </Swiper>
            {/* Эти элементы управления стилизуются в globals.css */}
            <div className="swiper-button-prev-custom"></div>
            <div className="swiper-button-next-custom"></div>
            <div className="swiper-pagination-custom"></div>
        </div>
    );
};

export default Carousel;