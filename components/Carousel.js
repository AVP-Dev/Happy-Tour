// components/Carousel.js
import React, { useRef, useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y, Autoplay } from 'swiper/modules';
import { Box, IconButton, HStack, Text } from '@chakra-ui/react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import TourCardSkeleton from './TourCardSkeleton';

import 'swiper/css';
import 'swiper/css/pagination';

const UniversalCarousel = ({
  items = [],
  renderItem,
  isLoading,
  loadingSkeletons = 3,
  settings = {},
}) => {
  const [swiperInstance, setSwiperInstance] = useState(null);
  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);
  const paginationRef = useRef(null);

  if (isLoading) {
    return (
      <HStack spacing={6} overflow="hidden">
        {[...Array(loadingSkeletons)].map((_, index) => (
          <Box key={index} flex="1 0 calc(33.333% - 16px)">
            <TourCardSkeleton />
          </Box>
        ))}
      </HStack>
    );
  }

  if (!Array.isArray(items) || items.length === 0) {
    return (
      <Box textAlign="center" py={10}>
        <Text fontSize="lg" color="gray.500">
          Ничего не найдено.
        </Text>
      </Box>
    );
  }

  const canLoop = items.length >= 3 * 2;

  const defaultSettings = {
    modules: [Navigation, Pagination, A11y, Autoplay],
    loop: canLoop,
    watchOverflow: true,
    grabCursor: true,
    slidesPerView: 1,
    spaceBetween: 16,
    autoplay: {
      delay: 4000,
      disableOnInteraction: false, 
      pauseOnMouseEnter: true,
    },
    navigation: {
      prevEl: navigationPrevRef.current,
      nextEl: navigationNextRef.current,
    },
    pagination: {
      el: paginationRef.current,
      clickable: true,
      bulletClass: 'swiper-pagination-bullet-custom',
      bulletActiveClass: 'swiper-pagination-bullet-active-custom',
    },
    onInit: setSwiperInstance,
    breakpoints: {
      768: { slidesPerView: 2, spaceBetween: 24 },
      1024: { slidesPerView: 3, spaceBetween: 30 },
    },
    ...settings,
  };
  
  useEffect(() => {
    if (swiperInstance) {
      swiperInstance.params.navigation.prevEl = navigationPrevRef.current;
      swiperInstance.params.navigation.nextEl = navigationNextRef.current;
      swiperInstance.navigation.init();
      swiperInstance.navigation.update();
    }
  }, [swiperInstance]);

  return (
    <Box position="relative" px={{ base: 0, md: 12 }}>
      <Swiper {...defaultSettings}>
        {items.map((item) => (
          <SwiperSlide key={item.id} style={{ height: 'auto' }}>
            <Box p={1} height="100%">
              {renderItem(item)}
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
      
      {/* Кнопка "назад" для навигации */}
      <IconButton
        ref={navigationPrevRef}
        aria-label="Previous slide"
        icon={<FaChevronLeft />}
        isRound
        position="absolute"
        top="50%"
        left={{ base: -2, md: 0 }}
        transform="translateY(-50%)"
        zIndex={20}
        boxShadow="md"
        // ИЗМЕНЕНИЕ: Кнопки теперь скрыты на всех экранах
        display='none'
      />
      {/* Кнопка "вперед" для навигации */}
      <IconButton
        ref={navigationNextRef}
        aria-label="Next slide"
        icon={<FaChevronRight />}
        isRound
        position="absolute"
        top="50%"
        right={{ base: -2, md: 0 }}
        transform="translateY(-50%)"
        zIndex={20}
        boxShadow="md"
        // ИЗМЕНЕНИЕ: Кнопки теперь скрыты на всех экранах
        display='none'
      />
      
      {/* Элемент пагинации (точки) */}
      <HStack
        ref={paginationRef}
        justify="center"
        position="absolute"
        bottom="-40px"
        width="100%"
        left="0"
        sx={{
            '.swiper-pagination-bullet-custom': {
                width: '10px',
                height: '10px',
                bg: 'gray.300',
                borderRadius: 'full',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
            },
            '.swiper-pagination-bullet-active-custom': {
                bg: 'brand.500',
                width: '25px',
            }
        }}
      />
    </Box>
  );
};

export default UniversalCarousel;
