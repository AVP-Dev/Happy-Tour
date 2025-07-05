// components/TourCard.js
import React from 'react';
import Image from 'next/image'; // ИЗМЕНЕНИЕ: Импортируем Image из next/image
import { Box, Heading, Text, Button, VStack, HStack, Tag, Flex, AspectRatio } from '@chakra-ui/react';
import { FaHotjar, FaStar, FaGift } from 'react-icons/fa';

// ИЗМЕНЕНИЕ: Добавлен `index` для определения приоритета загрузки
const TourCard = ({ tour, onTourInquiry, index }) => {
  if (!tour) {
    return null;
  }

  const getCategoryDetails = (category) => {
    switch (category) {
      case 'hot':
        return { icon: FaHotjar, color: 'red', label: 'Горящий' };
      case 'popular':
        return { icon: FaStar, color: 'orange', label: 'Популярный' };
      case 'special':
        return { icon: FaGift, color: 'purple', label: 'Выгодный' };
      default:
        return { icon: FaStar, color: 'gray', label: 'Тур' };
    }
  };

  const categoryDetails = getCategoryDetails(tour.category);
  const imageUrl = tour.image_url || `https://placehold.co/600x400/38B2AC/E6FFFA?text=${encodeURIComponent(tour.title || 'Happy Tour')}`;

  return (
    <Flex
        direction="column"
        bg="white"
        borderRadius="xl"
        overflow="hidden"
        boxShadow="lg"
        transition="all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)"
        _hover={{
            transform: 'translateY(-5px)',
            boxShadow: 'xl',
        }}
        height="100%"
        role="group"
    >
      <Box position="relative">
        <AspectRatio ratio={16 / 9}>
            {/* ИЗМЕНЕНИЕ: Используем next/image для оптимизации */}
            <Image
              src={imageUrl}
              alt={tour.title || 'Фотография тура'}
              fill // Используем fill вместо layout="fill" в новых версиях Next.js
              style={{ objectFit: 'cover' }}
              // Загружаем первые 2 картинки в карусели без ленивой загрузки для улучшения LCP
              priority={index < 2} 
              // Помогаем Next.js выбрать правильный размер изображения на разных экранах
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
        </AspectRatio>
        <Tag
          size="lg"
          variant="solid"
          colorScheme={categoryDetails.color}
          position="absolute"
          top={4}
          left={4}
          zIndex={1}
        >
          <HStack spacing={2}>
            <Box as={categoryDetails.icon} />
            <Text>{categoryDetails.label}</Text>
          </HStack>
        </Tag>
      </Box>

      <VStack flex="1" p={5} align="stretch" spacing={3}>
        <Heading as="h3" size="md" noOfLines={2} title={tour.title}>
          {tour.title}
        </Heading>
        
        <Text fontSize="sm" color="gray.600" noOfLines={3} flexGrow={1}>
          {tour.description}
        </Text>
        
        <Flex justify="space-between" align="flex-end" pt={3} borderTop="1px solid" borderColor="gray.200">
          <Box>
            <Text fontSize="sm" color="gray.500" lineHeight="1.2">от</Text>
            <Text fontSize="2xl" fontWeight="bold" color="brand.700" as="span">
              {tour.price}
            </Text>
            <Text fontWeight="semibold" color="gray.600" as="span" ml={1}>
              {tour.currency}
            </Text>
          </Box>
          <Button 
            colorScheme="brand" 
            onClick={() => onTourInquiry(tour)}
          >
            Подробнее
          </Button>
        </Flex>
      </VStack>
    </Flex>
  );
};

export default TourCard;
