// components/TourCard.js
import React from 'react';
import { Box, Image, Text, VStack, Heading, Button, Flex, Badge, useColorModeValue, HStack } from '@chakra-ui/react';
import { FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';

const TourCard = ({ tour, onEdit, onDelete, isAdmin = false }) => {
    const cardBg = useColorModeValue('white', 'gray.700');
    const textColor = useColorModeValue('gray.800', 'whiteAlpha.900');
    const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');

    // Проверяем, что tour и tour.image_url существуют
    // Если image_url начинается с '/', используем его как есть.
    // Если нет, предполагаем, что это полный URL или что-то некорректное и используем заглушку.
    // Добавляем заглушку на случай отсутствия URL или некорректного формата
    const imageUrl = tour?.image_url && tour.image_url.startsWith('/') 
                     ? tour.image_url 
                     : '/placeholder-image.jpg'; 

    return (
        <Box
            maxW="sm"
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            boxShadow="md"
            bg={cardBg}
            transition="all 0.2s"
            _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
        >
            <Image 
                src={imageUrl} 
                alt={tour?.title || 'Изображение тура'} 
                objectFit="cover" 
                width="100%" 
                height="200px" 
                // Обработчик ошибок для случая, если изображение не загружается
                onError={(e) => { 
                    e.target.src = '/placeholder-image.jpg'; // Показываем заглушку
                    e.target.alt = 'Изображение не загружено';
                }}
            />

            <Box p="6">
                <Box display="flex" alignItems="baseline">
                    <Badge borderRadius="full" px="2" colorScheme="teal">
                        {tour?.category || 'Категория'}
                    </Badge>
                    <Text
                        color={secondaryTextColor}
                        fontWeight="semibold"
                        letterSpacing="wide"
                        fontSize="xs"
                        textTransform="uppercase"
                        ml="2"
                    >
                        {tour?.duration || 'Длительность'}
                    </Text>
                </Box>

                <Heading mt="1" fontWeight="semibold" as="h4" lineHeight="tight" isTruncated color={textColor}>
                    {tour?.title || 'Название тура'}
                </Heading>

                <Text mt="2" color={secondaryTextColor} fontSize="sm" noOfLines={3}>
                    {tour?.description || 'Описание тура...'}
                </Text>

                <Flex justifyContent="space-between" alignItems="center" mt="3">
                    <Text fontSize="xl" fontWeight="bold" color={textColor}>
                        {tour?.price ? `${tour.price} ${tour.currency}` : 'Цена не указана'}
                    </Text>
                    {isAdmin && (
                        <HStack spacing={2}>
                            <Button size="sm" onClick={() => onEdit(tour)}>Редактировать</Button>
                            <Button size="sm" colorScheme="red" onClick={() => onDelete(tour.id)}>Удалить</Button>
                        </HStack>
                    )}
                </Flex>
            </Box>
        </Box>
    );
};

export default TourCard;
