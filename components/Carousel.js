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

  const canLoop = items.length >= 3 * 2; // Проверяем достаточное количество слайдов для бесконечной прокрутки Swiper

  const defaultSettings = {
    modules: [Navigation, Pagination, A11y, Autoplay],
    loop: canLoop, // Включаем бесконечную прокрутку, если достаточно слайдов
    watchOverflow: true, // Автоматически отключает навигацию, если слайдов недостаточно
    grabCursor: true, // Показывает курсор "хватающая рука"
    slidesPerView: 1, // Количество видимых слайдов по умолчанию
    spaceBetween: 16, // Расстояние между слайдами
    autoplay: {
      delay: 4000, // Задержка между сменой слайдов (4 секунды)
      // ИЗМЕНЕНИЕ: disableOnInteraction установлено в false, чтобы автовоспроизведение не останавливалось после взаимодействия
      disableOnInteraction: false, 
      pauseOnMouseEnter: true, // Пауза автовоспроизведения при наведении курсора мыши
    },
    navigation: {
      prevEl: navigationPrevRef.current, // Элемент для кнопки "назад"
      nextEl: navigationNextRef.current, // Элемент для кнопки "вперед"
    },
    pagination: {
      el: paginationRef.current, // Элемент для пагинации (точек)
      clickable: true, // Делает точки пагинации кликабельными
      bulletClass: 'swiper-pagination-bullet-custom', // Пользовательский класс для точек пагинации
      bulletActiveClass: 'swiper-pagination-bullet-active-custom', // Пользовательский класс для активной точки
    },
    onInit: setSwiperInstance, // Получаем экземпляр Swiper после инициализации
    breakpoints: { // Адаптивные настройки для разных размеров экрана
      768: { slidesPerView: 2, spaceBetween: 24 }, // 2 слайда на планшетах
      1024: { slidesPerView: 3, spaceBetween: 30 }, // 3 слайда на десктопах
    },
    ...settings, // Переопределяем настройки пользовательскими, если они переданы
  };
  
  // Обновляем навигацию после того, как Swiper будет готов
  // Это важно, так как ref'ы могут быть не готовы при первой инициализации Swiper
  useEffect(() => {
    if (swiperInstance) {
      swiperInstance.params.navigation.prevEl = navigationPrevRef.current;
      swiperInstance.params.navigation.nextEl = navigationNextRef.current;
      swiperInstance.navigation.init();
      swiperInstance.navigation.update();
    }
  }, [swiperInstance]); // Зависимость от swiperInstance

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
        zIndex="docked"
        boxShadow="md"
        display={{ base: 'none', md: 'flex' }} // Скрываем на мобильных, показываем на больших экранах
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
        zIndex="docked"
        boxShadow="md"
        display={{ base: 'none', md: 'flex' }} // Скрываем на мобильных, показываем на больших экранах
      />
      
      {/* Элемент пагинации (точки) */}
      <HStack
        ref={paginationRef}
        justify="center"
        position="absolute"
        bottom="-40px" // Располагаем ниже карусели
        width="100%"
        left="0"
        // Пользовательские стили для точек пагинации
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
                bg: 'brand.500', // Цвет активной точки
                width: '25px', // Ширина активной точки
            }
        }}
      />
    </Box>
  );
};

export default UniversalCarousel;
