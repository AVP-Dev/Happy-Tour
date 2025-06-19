import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper';
import TourCard from './TourCard';
import ReviewCard from './ReviewCard'; 

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const Carousel = ({ tours, reviews, isReviewCarousel = false, onTourInquiry, onReadMore }) => {
    const items = isReviewCarousel ? reviews : tours;

    if (!items || items.length === 0) {
        return <p>Информация в этой категории скоро появится.</p>;
    }

    const swiperParams = {
        modules: [Navigation, Pagination, Autoplay],
        spaceBetween: 30,
        slidesPerView: 1, 
        
        loop: items.length > 4,
        centeredSlides: items.length > 4,

        navigation: true,
        pagination: { clickable: true },
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        breakpoints: {
            640: { 
                slidesPerView: 2, 
                centeredSlides: false 
            },
            1024: { 
                slidesPerView: 3, 
                centeredSlides: items.length > 3
            },
            1280: { 
                slidesPerView: 4, 
                centeredSlides: items.length > 4
            },
        },
    };

    return (
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
    );
};

export default Carousel;
