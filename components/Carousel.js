import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper';
import TourCard from './TourCard';
import ReviewCard from './ReviewCard'; 

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const Carousel = ({ tours, reviews, isReviewCarousel = false, onTourInquiry, onReadMore }) => {
    const items = isReviewCarousel ? reviews : tours;

    // УЛУЧШЕННАЯ ПРОВЕРКА: Проверяем, что items является массивом.
    // Это защитит сайт от падения, если API вернет ошибку вместо списка.
    if (!Array.isArray(items) || items.length === 0) {
        return <p style={{textAlign: 'center', padding: '1rem'}}>Информация в этой категории скоро появится.</p>;
    }

    const swiperParams = {
        modules: [Navigation, Pagination, Autoplay],
        spaceBetween: 30,
        loop: items.length > 3, // Цикл включается, если элементов больше, чем может поместиться на экране
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
            1280: { slidesPerView: 4, spaceBetween: 30 },
        },
    };

    return (
        <div className="carousel-wrapper">
            <Swiper {...swiperParams}>
                {items.map((item, index) => (
                    <SwiperSlide key={item.id || `slide-${index}`} style={{ height: 'auto' }}>
                        {isReviewCarousel 
                            ? <ReviewCard review={item} onReadMore={onReadMore} /> 
                            : <TourCard tour={item} onDetailsClick={onTourInquiry} />
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
