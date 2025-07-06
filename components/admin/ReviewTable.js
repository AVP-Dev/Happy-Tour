// components/admin/ReviewTable.js
import React, { useState, useRef } from 'react';
import {
    Table, Thead, Tbody, Tr, Th, Td, TableContainer,
    Text, Select, Tooltip, IconButton, Box, Stack, Flex, Heading,
    AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
    AlertDialogContent, AlertDialogOverlay, Button, useDisclosure
} from '@chakra-ui/react';
import { FaTrash, FaEdit } from 'react-icons/fa'; // Добавляем FaEdit для кнопки редактирования

// Изменено: пропс onUpdateStatus переименован в onUpdate для соответствия родительскому компоненту ReviewsPage
const ReviewTable = ({ reviews, onUpdate, onDelete, isLoading, onEdit }) => { // Добавлен onEdit
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef();
    const [reviewToDelete, setReviewToDelete] = useState(null);

    if (isLoading) {
        return <Text>Загрузка отзывов...</Text>;
    }

    if (!reviews || reviews.length === 0) {
        return <Text>Отзывы не найдены.</Text>;
    }

    const handleDeleteClick = (reviewId) => {
        setReviewToDelete(reviewId);
        onOpen();
    };

    const confirmDelete = () => {
        if (reviewToDelete) {
            onDelete(reviewToDelete);
        }
        onClose();
    };

    const statusColors = {
        pending: 'yellow',
        published: 'green',
        rejected: 'red',
    };

    return (
        <Box bg="white" rounded="lg" shadow="md" overflow="hidden">
            {/* Версия для десктопа: полная таблица */}
            <TableContainer display={{ base: 'none', md: 'block' }}> {/* Скрываем на мобильных */}
                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th>Автор</Th>
                            <Th>Отзыв</Th>
                            <Th>Рейтинг</Th>
                            <Th>Дата</Th>
                            <Th>Статус</Th>
                            <Th isNumeric>Действия</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {reviews.map((review) => (
                            <Tr key={review.id}>
                                <Td fontWeight="medium">{review.author}</Td>
                                <Td maxW="400px" whiteSpace="normal">{review.text}</Td>
                                <Td>{'⭐'.repeat(review.rating)}</Td>
                                <Td>{new Date(review.date).toLocaleDateString('ru-RU')}</Td>
                                <Td>
                                    <Select
                                        size="sm"
                                        value={review.status}
                                        onChange={(e) => onUpdate(review.id, e.target.value)}
                                        borderColor={`${statusColors[review.status]}.300`}
                                        focusBorderColor={`${statusColors[review.status]}.500`}
                                        w="150px"
                                    >
                                        <option value="pending">Ожидает</option>
                                        <option value="published">Опубликован</option>
                                        <option value="rejected">Отклонен</option>
                                    </Select>
                                </Td>
                                <Td isNumeric>
                                    <Tooltip label="Редактировать" hasArrow>
                                        <IconButton
                                            aria-label="Редактировать отзыв"
                                            icon={<FaEdit />}
                                            size="sm"
                                            variant="ghost"
                                            colorScheme="blue"
                                            onClick={() => onEdit(review)} // Передаем весь объект отзыва для редактирования
                                            mr={2}
                                        />
                                    </Tooltip>
                                    <Tooltip label="Удалить" hasArrow>
                                        <IconButton
                                            aria-label="Удалить отзыв"
                                            icon={<FaTrash />}
                                            size="sm"
                                            variant="ghost"
                                            colorScheme="red"
                                            onClick={() => handleDeleteClick(review.id)}
                                        />
                                    </Tooltip>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>

            {/* Версия для мобильных: карточки */}
            <Stack spacing={4} p={4} display={{ base: 'flex', md: 'none' }}> {/* Показываем на мобильных */}
                {reviews.map((review) => (
                    <Box key={review.id} p={4} borderWidth="1px" borderRadius="lg" shadow="sm">
                        <Flex justify="space-between" align="center" mb={2}>
                            <Heading size="md">{review.author}</Heading>
                            <Text fontSize="sm" color="gray.500">{new Date(review.date).toLocaleDateString('ru-RU')}</Text>
                        </Flex>
                        <Text mb={2}>{review.text}</Text>
                        <Text mb={2}>Рейтинг: {'⭐'.repeat(review.rating)}</Text>
                        
                        <Flex align="center" mb={4}>
                            <Text mr={2}>Статус:</Text>
                            <Select
                                size="sm"
                                value={review.status}
                                onChange={(e) => onUpdate(review.id, e.target.value)}
                                borderColor={`${statusColors[review.status]}.300`}
                                focusBorderColor={`${statusColors[review.status]}.500`}
                                flex="1"
                            >
                                <option value="pending">Ожидает</option>
                                <option value="published">Опубликован</option>
                                <option value="rejected">Отклонен</option>
                            </Select>
                        </Flex>

                        <Flex justify="flex-end">
                            <Tooltip label="Редактировать" hasArrow>
                                <IconButton
                                    aria-label="Редактировать отзыв"
                                    icon={<FaEdit />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="blue"
                                    onClick={() => onEdit(review)}
                                    mr={2}
                                />
                            </Tooltip>
                            <Tooltip label="Удалить" hasArrow>
                                <IconButton
                                    aria-label="Удалить отзыв"
                                    icon={<FaTrash />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="red"
                                    onClick={() => handleDeleteClick(review.id)}
                                />
                            </Tooltip>
                        </Flex>
                    </Box>
                ))}
            </Stack>

            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Удалить отзыв
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            Вы уверены? Это действие нельзя будет отменить.
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Отмена
                            </Button>
                            <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                                Удалить
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
};

export default ReviewTable;
