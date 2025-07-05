// components/admin/ReviewTable.js
import React, { useState, useRef } from 'react';
import {
    Table, Thead, Tbody, Tr, Th, Td, TableContainer,
    HStack, Text, Select, useToast, Tooltip, IconButton, Box,
    AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter, Button,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, useDisclosure,
    FormControl, FormLabel, Input, Textarea, FormErrorMessage, Icon
} from '@chakra-ui/react';
import { FaTrash, FaEdit, FaStar } from 'react-icons/fa';

// Вспомогательный компонент для формы редактирования отзыва
const ReviewEditForm = ({ review, onSubmit, onClose, isLoading }) => {
    const [formData, setFormData] = useState({
        author: review.author,
        text: review.text,
        rating: review.rating,
        status: review.status,
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleRatingChange = (newRating) => {
        setFormData(prev => ({ ...prev, rating: newRating }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.author.trim()) newErrors.author = 'Имя автора обязательно.';
        if (!formData.text.trim()) newErrors.text = 'Текст отзыва обязателен.';
        if (!formData.rating || formData.rating < 1 || formData.rating > 5) newErrors.rating = 'Рейтинг должен быть от 1 до 5.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(review.id, formData);
        }
    };

    return (
        <Box as="form" onSubmit={handleSubmit} noValidate>
            <VStack spacing={4}>
                <FormControl isRequired isInvalid={!!errors.author}>
                    <FormLabel>Автор</FormLabel>
                    <Input name="author" value={formData.author} onChange={handleChange} />
                    <FormErrorMessage>{errors.author}</FormErrorMessage>
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.text}>
                    <FormLabel>Текст отзыва</FormLabel>
                    <Textarea name="text" value={formData.text} onChange={handleChange} rows={5} />
                    <FormErrorMessage>{errors.text}</FormErrorMessage>
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.rating}>
                    <FormLabel>Рейтинг</FormLabel>
                    <HStack justify="flex-start">
                        {[...Array(5)].map((_, index) => {
                            const ratingValue = index + 1;
                            return (
                                <IconButton
                                    key={ratingValue}
                                    aria-label={`Оценка ${ratingValue}`}
                                    variant="ghost"
                                    color={ratingValue <= formData.rating ? "yellow.400" : "gray.300"}
                                    icon={<Icon as={FaStar} boxSize={6} />}
                                    onClick={() => handleRatingChange(ratingValue)}
                                    // Можно добавить onMouseEnter/onMouseLeave для интерактивности
                                />
                            );
                        })}
                    </HStack>
                    <FormErrorMessage>{errors.rating}</FormErrorMessage>
                </FormControl>

                <FormControl isRequired>
                    <FormLabel>Статус</FormLabel>
                    <Select name="status" value={formData.status} onChange={handleChange}>
                        <option value="pending">Ожидает</option>
                        <option value="published">Опубликован</option>
                        <option value="rejected">Отклонен</option>
                    </Select>
                </FormControl>

                <HStack width="100%" justify="flex-end" mt={4}>
                    <Button variant="ghost" onClick={onClose}>Отмена</Button>
                    <Button colorScheme="blue" type="submit" isLoading={isLoading}>Сохранить</Button>
                </HStack>
            </VStack>
        </Box>
    );
};


const ReviewTable = ({ reviews, onUpdateReview, onDelete, isLoading }) => {
    const toast = useToast();

    // Состояние для модального окна удаления
    const { isOpen: isDeleteAlertOpen, onOpen: onDeleteAlertOpen, onClose: onDeleteAlertClose } = useDisclosure();
    const cancelRef = useRef();
    const [reviewToDelete, setReviewToDelete] = useState(null);

    // Состояние для модального окна редактирования
    const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
    const [reviewToEdit, setReviewToEdit] = useState(null);
    const [isEditSubmitting, setIsEditSubmitting] = useState(false);


    if (isLoading) {
        return <Text p={4}>Загрузка отзывов...</Text>;
    }

    if (!reviews || reviews.length === 0) {
        return <Text p={4}>Отзывы не найдены.</Text>;
    }

    const handleStatusChange = async (reviewId, newStatus) => {
        try {
            await onUpdateReview(reviewId, { status: newStatus });
            toast({
                title: `Статус отзыва обновлен.`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: 'Ошибка обновления статуса.',
                description: error.message || 'Не удалось обновить статус отзыва.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const confirmDelete = (review) => {
        setReviewToDelete(review);
        onDeleteAlertOpen();
    };

    const performDelete = async () => {
        if (reviewToDelete) {
            try {
                await onDelete(reviewToDelete.id);
                toast({
                    title: 'Отзыв удален.',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
            } catch (error) {
                toast({
                    title: 'Ошибка удаления.',
                    description: error.message || 'Не удалось удалить отзыв.',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
            } finally {
                onDeleteAlertClose();
                setReviewToDelete(null);
            }
        }
    };

    const openEditModal = (review) => {
        setReviewToEdit(review);
        onEditModalOpen();
    };

    const handleEditSubmit = async (id, updatedData) => {
        setIsEditSubmitting(true);
        try {
            await onUpdateReview(id, updatedData);
            toast({
                title: 'Отзыв успешно обновлен.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            onEditModalClose();
            setReviewToEdit(null);
        } catch (error) {
            toast({
                title: 'Ошибка обновления отзыва.',
                description: error.message || 'Не удалось обновить отзыв.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsEditSubmitting(false);
        }
    };

    const statusColors = {
        pending: 'yellow',
        published: 'green',
        rejected: 'red',
    };

    return (
        <Box bg="white" rounded="lg" shadow="md" overflow="hidden">
            <TableContainer overflowX="auto"> {/* Добавлено overflowX="auto" для прокрутки на маленьких экранах */}
                <Table variant="simple" size="md">
                    <Thead bg="gray.50">
                        <Tr>
                            <Th>Автор</Th>
                            {/* Скрываем текст отзыва на очень маленьких экранах */}
                            <Th display={{ base: 'none', md: 'table-cell' }}>Текст</Th>
                            {/* Скрываем рейтинг на маленьких экранах */}
                            <Th isNumeric display={{ base: 'none', sm: 'table-cell' }}>Рейтинг</Th>
                            <Th>Статус</Th>
                            <Th isNumeric>Действия</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {reviews.map((review) => (
                            <Tr key={review.id} _hover={{ bg: 'gray.50' }}>
                                <Td fontWeight="medium">
                                    <Text maxW={{ base: '120px', md: 'none' }} overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                                        {review.author}
                                    </Text>
                                </Td>
                                <Td display={{ base: 'none', md: 'table-cell' }} maxW="350px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap" title={review.text}>
                                    {review.text}
                                </Td>
                                <Td isNumeric display={{ base: 'none', sm: 'table-cell' }}>{review.rating} / 5</Td>
                                <Td>
                                    <Select
                                        value={review.status}
                                        onChange={(e) => handleStatusChange(review.id, e.target.value)}
                                        size="sm"
                                        borderColor={`${statusColors[review.status]}.300`}
                                        focusBorderColor={`${statusColors[review.status]}.500`}
                                        w={{ base: '100px', md: '150px' }} // Адаптивная ширина
                                    >
                                        <option value="pending">Ожидает</option>
                                        <option value="published">Опубликован</option>
                                        <option value="rejected">Отклонен</option>
                                    </Select>
                                </Td>
                                <Td isNumeric>
                                    <HStack spacing={1} justify="flex-end">
                                        <Tooltip label="Редактировать" hasArrow>
                                            <IconButton
                                                aria-label="Редактировать отзыв"
                                                icon={<FaEdit />}
                                                size="sm"
                                                variant="ghost"
                                                colorScheme="blue"
                                                onClick={() => openEditModal(review)}
                                            />
                                        </Tooltip>
                                        <Tooltip label="Удалить" hasArrow>
                                            <IconButton
                                                aria-label="Удалить отзыв"
                                                icon={<FaTrash />}
                                                size="sm"
                                                variant="ghost"
                                                colorScheme="red"
                                                onClick={() => confirmDelete(review)}
                                            />
                                        </Tooltip>
                                    </HStack>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>

            {/* Модальное окно подтверждения удаления */}
            <AlertDialog
                isOpen={isDeleteAlertOpen}
                leastDestructiveRef={cancelRef}
                onClose={onDeleteAlertClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Удалить отзыв
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            Вы уверены, что хотите удалить отзыв от &quot;{reviewToDelete?.author}&quot;? Это действие необратимо.
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onDeleteAlertClose}>
                                Отмена
                            </Button>
                            <Button colorScheme="red" onClick={performDelete} ml={3}>
                                Удалить
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>

            {/* Модальное окно редактирования отзыва */}
            <Modal isOpen={isEditModalOpen} onClose={onEditModalClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Редактировать отзыв</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {reviewToEdit && (
                            <ReviewEditForm
                                review={reviewToEdit}
                                onSubmit={handleEditSubmit}
                                onClose={onEditModalClose}
                                isLoading={isEditSubmitting}
                            />
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default ReviewTable;
