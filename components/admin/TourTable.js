// components/admin/TourTable.js
import React from 'react';
import {
    Table, Thead, Tbody, Tr, Th, Td, TableContainer,
    HStack, Text, Image, Box, Tooltip, Icon,
    Tag, IconButton, Switch, Stack, Flex, Heading, useToast // Добавлен useToast
} from '@chakra-ui/react';
import { FaEdit, FaTrash, FaHotjar, FaStar, FaGift } from 'react-icons/fa';

const TourTable = ({ tours, onEdit, onDelete, onTogglePublished: parentOnTogglePublished }) => {
    const toast = useToast(); // Инициализация useToast

    const CategoryTag = ({ category }) => {
        const details = {
            hot: { icon: FaHotjar, color: 'red', label: 'Горящий' },
            popular: { icon: FaStar, color: 'orange', label: 'Популярный' },
            special: { icon: FaGift, color: 'purple', label: 'Выгодный' },
        }[category] || { icon: FaStar, color: 'gray', label: category };

        return (
            <Tag size="sm" variant="subtle" colorScheme={details.color}>
                <HStack spacing={1}>
                    <Icon as={details.icon} />
                    <Text>{details.label}</Text>
                </HStack>
            </Tag>
        );
    };

    // Обновленная функция onTogglePublished
    const onTogglePublished = async (id, newPublishedStatus) => {
        try {
            const res = await fetch('/api/admin/tours', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, published: newPublishedStatus }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Ошибка при смене статуса публикации');
            }

            // Уведомление об успехе
            toast({
                title: `Тур успешно ${newPublishedStatus ? 'опубликован' : 'снят с публикации'}`,
                status: 'success',
                position: 'top', // Централизованное уведомление
                duration: 3000,
                isClosable: true,
            });

            // Вызываем родительскую функцию для обновления состояния в списке туров
            parentOnTogglePublished(id, newPublishedStatus);

        } catch (error) {
            console.error("Ошибка при смене статуса публикации:", error);
            toast({
                title: 'Ошибка',
                description: error.message,
                status: 'error',
                position: 'top', // Централизованное уведомление
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <Box bg="white" rounded="lg" shadow="md" overflow="hidden">
            {/* Версия для десктопа: полная таблица */}
            <TableContainer display={{ base: 'none', md: 'block' }}> {/* Скрываем на мобильных */}
                <Table variant="simple" size="md">
                    <Thead bg="gray.50">
                        <Tr>
                            <Th>Фото</Th>
                            <Th>Название</Th>
                            <Th>Категория</Th>
                            <Th isNumeric>Цена</Th>
                            <Th>Опубликован</Th>
                            <Th isNumeric>Действия</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {tours.map((tour) => (
                            <Tr key={tour.id} _hover={{ bg: 'gray.50' }}>
                                <Td>
                                    <Image
                                        src={tour.image_url}
                                        boxSize="60px"
                                        objectFit="cover"
                                        borderRadius="md"
                                        alt={tour.title}
                                        fallbackSrc="https://placehold.co/60x60/eee/ccc?text=Нет"
                                    />
                                </Td>
                                <Td fontWeight="medium" maxW="300px" whiteSpace="normal">{tour.title}</Td>
                                <Td><CategoryTag category={tour.category} /></Td>
                                <Td isNumeric fontWeight="semibold">{`${tour.price?.toFixed(0)} ${tour.currency}`}</Td>
                                <Td>
                                    <Tooltip label={tour.published ? 'Снять с публикации' : 'Опубликовать'}>
                                        <Switch
                                            colorScheme="brand"
                                            isChecked={tour.published}
                                            onChange={() => onTogglePublished(tour.id, !tour.published)}
                                        />
                                    </Tooltip>
                                </Td>
                                <Td isNumeric>
                                    <HStack spacing={2} justify="flex-end">
                                        <Tooltip label="Редактировать" hasArrow>
                                            <IconButton
                                                aria-label="Редактировать тур"
                                                icon={<FaEdit />}
                                                size="sm"
                                                variant="ghost"
                                                colorScheme="blue"
                                                onClick={() => onEdit(tour)}
                                            />
                                        </Tooltip>
                                        <Tooltip label="Удалить" hasArrow>
                                            <IconButton
                                                aria-label="Удалить тур"
                                                icon={<FaTrash />}
                                                size="sm"
                                                variant="ghost"
                                                colorScheme="red"
                                                onClick={() => onDelete(tour.id)}
                                            />
                                        </Tooltip>
                                    </HStack>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>

            {/* Версия для мобильных: карточки */}
            <Stack spacing={4} p={4} display={{ base: 'flex', md: 'none' }}> {/* Показываем на мобильных */}
                {tours.map((tour) => (
                    <Box key={tour.id} p={4} borderWidth="1px" borderRadius="lg" shadow="sm">
                        <Flex align="center" mb={2}>
                            <Image
                                src={tour.image_url}
                                boxSize="80px"
                                objectFit="cover"
                                borderRadius="md"
                                alt={tour.title}
                                fallbackSrc="https://placehold.co/80x80/eee/ccc?text=Нет"
                                mr={4}
                            />
                            <Box>
                                <Heading size="md" mb={1}>{tour.title}</Heading>
                                <CategoryTag category={tour.category} />
                                <Text fontWeight="semibold" mt={1}>{`${tour.price?.toFixed(0)} ${tour.currency}`}</Text>
                            </Box>
                        </Flex>
                        
                        <Flex justify="space-between" align="center" mt={4}>
                            <Text>Опубликован:</Text>
                            <Tooltip label={tour.published ? 'Снять с публикации' : 'Опубликовать'}>
                                <Switch
                                    colorScheme="brand"
                                    isChecked={tour.published}
                                    onChange={() => onTogglePublished(tour.id, !tour.published)}
                                />
                            </Tooltip>
                        </Flex>

                        <HStack spacing={2} justify="flex-end" mt={4}>
                            <Tooltip label="Редактировать" hasArrow>
                                <IconButton
                                    aria-label="Редактировать тур"
                                    icon={<FaEdit />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="blue"
                                    onClick={() => onEdit(tour)}
                                />
                            </Tooltip>
                            <Tooltip label="Удалить" hasArrow>
                                <IconButton
                                    aria-label="Удалить тур"
                                    icon={<FaTrash />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="red"
                                    onClick={() => onDelete(tour.id)}
                                />
                            </Tooltip>
                        </HStack>
                    </Box>
                ))}
            </Stack>
        </Box>
    );
};

export default TourTable;
