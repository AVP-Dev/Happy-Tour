// components/TourCard.js
import React from 'react';
import NextImage from 'next/image';
import { Box, Heading, Text, Button, VStack, HStack, Tag, Flex, AspectRatio } from '@chakra-ui/react';
import { FaHotjar, FaStar, FaGift } from 'react-icons/fa';

// --- НОВОЕ: Вспомогательная функция для создания прокси-URL ---
const getImageProxyUrl = (url) => {
    if (!url) {
        return 'https://placehold.co/600x400/9AE6B4/276749?text=Happy+Tour';
    }
    // Если URL уже абсолютный (старые данные), используем его как есть
    if (url.startsWith('http')) {
        return url;
    }
    // Если это путь к нашим загрузкам, перенаправляем его на наш API
    if (url.startsWith('/uploads/')) {
        // Превращает /uploads/image.webp в /api/images/uploads/image.webp
        return `/api/images${url}`;
    }
    // Возвращаем URL как есть для всех остальных случаев
    return url;
};


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

  // --- ИЗМЕНЕНО: Используем новую функцию для получения URL ---
  const imageUrl = getImageProxyUrl(tour.image_url);

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
            <NextImage
              src={imageUrl}
              alt={tour.title || 'Тур'}
              layout="fill"
              objectFit="cover"
              priority={index < 2} 
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              style={{ borderRadius: '0.75rem 0.75rem 0 0' }}
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
