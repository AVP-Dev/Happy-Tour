// components/admin/ReviewTable.js
import React, { useState, useRef } from 'react';
import {
    Table, Thead, Tbody, Tr, Th, Td, TableContainer,
    Text, Select, Tooltip, IconButton, Box,
    AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
    AlertDialogContent, AlertDialogOverlay, Button, useDisclosure
} from '@chakra-ui/react';
import { FaTrash } from 'react-icons/fa';

// Изменено: пропс onUpdateStatus переименован в onUpdate для соответствия родительскому компоненту ReviewsPage
const ReviewTable = ({ reviews, onUpdate, onDelete, isLoading }) => {
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
            <TableContainer>
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
                                        // Изменено: вызов onUpdate вместо onUpdateStatus
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
