// components/admin/ReviewTable.js
import React from 'react';
import {
    Table, Thead, Tbody, Tr, Th, Td, TableContainer,
    Button, HStack, Text, Select, useToast, Tooltip
} from '@chakra-ui/react';
import { FaTrash } from 'react-icons/fa';

const ReviewTable = ({ reviews, onUpdateStatus, onDelete, isLoading }) => {
    const toast = useToast();

    if (isLoading) {
        return <Text>Загрузка отзывов...</Text>;
    }

    if (!reviews || reviews.length === 0) {
        return <Text>Отзывы не найдены.</Text>;
    }

    const handleStatusChange = async (reviewId, newStatus) => {
        await onUpdateStatus(reviewId, newStatus);
        toast({
            title: `Статус отзыва обновлен на: ${newStatus}.`,
            status: 'success',
            duration: 3000,
            isClosable: true,
        });
    };

    const handleDeleteClick = async (reviewId) => {
        // Используем стандартное подтверждение, так как Chakra UI модальное окно требует больше кода
        if (window.confirm('Вы уверены, что хотите удалить этот отзыв?')) {
            await onDelete(reviewId);
            toast({
                title: 'Отзыв удален.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <TableContainer>
            <Table variant="simple" size="sm">
                <Thead>
                    <Tr>
                        <Th>Автор</Th>
                        <Th>Текст</Th>
                        <Th isNumeric>Рейтинг</Th>
                        <Th>Дата</Th>
                        {/* --- ИЗМЕНЕНИЕ: Новая колонка --- */}
                        <Th>Кем создан</Th>
                        {/* --- КОНЕЦ ИЗМЕНЕНИЯ --- */}
                        <Th>Статус</Th>
                        <Th>Действия</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {reviews.map((review) => (
                        <Tr key={review.id}>
                            <Td>{review.author}</Td>
                            <Td maxW="250px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap" title={review.text}>
                                {review.text}
                            </Td>
                            <Td isNumeric>{review.rating} / 5</Td>
                            <Td>{new Date(review.date).toLocaleDateString()}</Td>
                            
                            {/* --- ИЗМЕНЕНИЕ: Отображение имени создателя --- */}
                            <Td>
                                <Tooltip label={review.createdBy?.email} placement="top">
                                   <Text cursor="default">{review.createdBy?.name || 'Клиент'}</Text>
                                </Tooltip>
                            </Td>
                            {/* --- КОНЕЦ ИЗМЕНЕНИЯ --- */}

                            <Td>
                                <Select
                                    value={review.status}
                                    onChange={(e) => handleStatusChange(review.id, e.target.value)}
                                    size="sm"
                                    bg={review.status === 'published' ? 'green.100' : review.status === 'pending' ? 'yellow.100' : 'red.100'}
                                >
                                    <option value="pending">Ожидает</option>
                                    <option value="published">Опубликован</option>
                                    <option value="rejected">Отклонен</option>
                                </Select>
                            </Td>
                            <Td>
                                <HStack spacing={2}>
                                    <Button
                                        size="sm"
                                        leftIcon={<FaTrash />}
                                        colorScheme="red"
                                        onClick={() => handleDeleteClick(review.id)}
                                    >
                                        Удалить
                                    </Button>
                                </HStack>
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </TableContainer>
    );
};

export default ReviewTable;
