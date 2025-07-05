// components/admin/ReviewTable.js
import React from 'react';
import {
    Table, Thead, Tbody, Tr, Th, Td, TableContainer,
    HStack, Text, Select, useToast, Tooltip, IconButton, Box
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
            title: `Статус отзыва обновлен.`,
            status: 'success',
            duration: 3000,
            isClosable: true,
        });
    };

    const handleDeleteClick = async (reviewId) => {
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

    const statusColors = {
        pending: 'yellow',
        published: 'green',
        rejected: 'red',
    };

    return (
        <Box bg="white" rounded="lg" shadow="md" overflow="hidden">
            <TableContainer>
                <Table variant="simple" size="md">
                    <Thead bg="gray.50">
                        <Tr>
                            <Th>Автор</Th>
                            <Th>Текст</Th>
                            <Th isNumeric>Рейтинг</Th>
                            <Th>Статус</Th>
                            <Th isNumeric>Действия</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {reviews.map((review) => (
                            <Tr key={review.id} _hover={{ bg: 'gray.50' }}>
                                <Td fontWeight="medium">{review.author}</Td>
                                <Td maxW="350px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap" title={review.text}>
                                    {review.text}
                                </Td>
                                <Td isNumeric>{review.rating} / 5</Td>
                                <Td>
                                    <Select
                                        value={review.status}
                                        onChange={(e) => handleStatusChange(review.id, e.target.value)}
                                        size="sm"
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
        </Box>
    );
};

export default ReviewTable;
