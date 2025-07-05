// components/admin/ReviewTable.js
import React from 'react';
import {
    Table, Thead, Tbody, Tr, Th, Td, TableContainer,
    HStack, Text, Select, useToast, Tooltip, IconButton, Box, VStack, Flex,
    AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, Button, useDisclosure
} from '@chakra-ui/react';
import { FaTrash, FaEdit } from 'react-icons/fa'; // Добавил FaEdit на случай, если понадобится для будущих расширений

const ReviewTable = ({ reviews, onUpdateStatus, onDelete, isLoading }) => {
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure(); // Для AlertDialog
    const cancelRef = React.useRef();
    const [reviewToDelete, setReviewToDelete] = React.useState(null);

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
            position: 'top-right',
        });
    };

    const confirmDelete = (reviewId) => {
        setReviewToDelete(reviewId);
        onOpen(); // Открыть AlertDialog
    };

    const handleDelete = async () => {
        if (reviewToDelete) {
            await onDelete(reviewToDelete);
            toast({
                title: 'Отзыв удален.',
                status: 'success',
                duration: 3000,
                isClosable: true,
                position: 'top-right',
            });
            setReviewToDelete(null);
            onClose(); // Закрыть AlertDialog
        }
    };

    const statusColors = {
        pending: 'yellow',
        published: 'green',
        rejected: 'red',
    };

    return (
        <Box bg="white" rounded="lg" shadow="md" overflow="hidden">
            {/* Таблица для больших экранов */}
            <TableContainer display={{ base: 'none', md: 'block' }}>
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
                                            onClick={() => confirmDelete(review.id)}
                                        />
                                    </Tooltip>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>

            {/* Карточки для мобильных экранов */}
            <VStack spacing={4} align="stretch" display={{ base: 'flex', md: 'none' }} p={4}>
                {reviews.map((review) => (
                    <Box key={review.id} p={4} borderWidth="1px" borderRadius="lg" shadow="sm" bg="white">
                        <HStack justifyContent="space-between" mb={2}>
                            <Text fontWeight="bold" fontSize="lg">{review.author}</Text>
                            <Tooltip label="Удалить" hasArrow>
                                <IconButton
                                    aria-label="Удалить отзыв"
                                    icon={<FaTrash />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="red"
                                    onClick={() => confirmDelete(review.id)}
                                />
                            </Tooltip>
                        </HStack>
                        <Text mb={2} color="gray.600">{review.text}</Text>
                        <Flex justifyContent="space-between" alignItems="center" mt={3}>
                            <Text fontSize="sm" color="gray.500">Рейтинг: {review.rating} / 5</Text>
                            <Select
                                value={review.status}
                                onChange={(e) => handleStatusChange(review.id, e.target.value)}
                                size="sm"
                                borderColor={`${statusColors[review.status]}.300`}
                                focusBorderColor={`${statusColors[review.status]}.500`}
                                w="120px" // Уменьшенная ширина для мобильных
                            >
                                <option value="pending">Ожидает</option>
                                <option value="published">Опубликован</option>
                                <option value="rejected">Отклонен</option>
                            </Select>
                        </Flex>
                    </Box>
                ))}
            </VStack>

            {/* AlertDialog для подтверждения удаления */}
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
                            Вы уверены, что хотите удалить этот отзыв? Это действие необратимо.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Отмена
                            </Button>
                            <Button colorScheme="red" onClick={handleDelete} ml={3}>
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
