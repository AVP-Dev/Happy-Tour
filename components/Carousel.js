// components/Carousel.js
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y, Autoplay } from 'swiper/modules';
import { Box, IconButton, HStack, Text } from '@chakra-ui/react'; // ИСПРАВЛЕНО: Добавлен импорт Text
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import TourCardSkeleton from './TourCardSkeleton';

// Импортируем базовые стили Swiper
import 'swiper/css';
import 'swiper/css/pagination'; // Только для логики, стили будут кастомные

const UniversalCarousel = ({
  items = [],
  renderItem,
  isLoading,
  loadingSkeletons = 3,
  settings = {},
}) => {
  if (isLoading) {
    // Логика скелетонов остается прежней
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
  const navigationPrevRef = React.useRef(null);
  const navigationNextRef = React.useRef(null);
  const paginationRef = React.useRef(null);

  const defaultSettings = {
    modules: [Navigation, Pagination, A11y, Autoplay],
    loop: canLoop,
    watchOverflow: true,
    grabCursor: true,
    slidesPerView: 1,
    spaceBetween: 16,
    autoplay: {
      delay: 4000,
      disableOnInteraction: true,
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
    onBeforeInit: (swiper) => {
        swiper.params.navigation.prevEl = navigationPrevRef.current;
        swiper.params.navigation.nextEl = navigationNextRef.current;
        swiper.params.pagination.el = paginationRef.current;
    },
    breakpoints: {
      768: { slidesPerView: 2, spaceBetween: 24 },
      1024: { slidesPerView: 3, spaceBetween: 30 },
    },
    ...settings,
  };

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
      
      <IconButton
        ref={navigationPrevRef}
        aria-label="Previous slide"
        icon={<FaChevronLeft />}
        isRound
        position="absolute"
        top="50%"
        left={{ base: -2, md: 0 }}
        transform="translateY(-50%)"
        zIndex="docked"
        boxShadow="md"
        display={{ base: 'none', md: 'flex' }}
      />
      <IconButton
        ref={navigationNextRef}
        aria-label="Next slide"
        icon={<FaChevronRight />}
        isRound
        position="absolute"
        top="50%"
        right={{ base: -2, md: 0 }}
        transform="translateY(-50%)"
        zIndex="docked"
        boxShadow="md"
        display={{ base: 'none', md: 'flex' }}
      />
      
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
