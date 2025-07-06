import useSWR, { mutate } from 'swr';
import AdminLayout from '../../components/admin/AdminLayout';
import ReviewTable from '../../components/admin/ReviewTable';
import { 
  Heading, Box, Spinner, Center, Alert, AlertIcon, useToast, Text,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  FormControl, FormLabel, Textarea, Button, useDisclosure 
} from '@chakra-ui/react';
import React, { useState } from 'react';

// Обновленный fetcher для SWR, который корректно обрабатывает ошибки API
const fetcher = async (url, options) => {
  // Добавляем credentials: 'include' по умолчанию для всех запросов,
  // чтобы гарантировать отправку куки с аутентификацией.
  const defaultOptions = {
    ...options,
    credentials: 'include', // Важно для отправки куки сессии
  };

  const res = await fetch(url, defaultOptions);

  // Если ответ сервера НЕ успешный (не 2xx)
  if (!res.ok) {
    // Пытаемся получить тело ошибки в формате JSON
    const errorPayload = await res.json().catch(() => {
      // Если тело не JSON или пустое, создаем свою ошибку
      return { error: `Сервер ответил со статусом ${res.status}, но без деталей.` };
    });
    
    // Создаем объект ошибки с детальным сообщением от API
    const error = new Error(errorPayload.error);
    throw error;
  }

  // Если все хорошо, возвращаем JSON
  return res.json();
};

export default function ReviewsPage() {
  const { data: reviews, error } = useSWR('/api/admin/reviews', fetcher);
  const toast = useToast();

  // Состояние для модального окна редактирования
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
  const [currentReview, setCurrentReview] = useState(null); // Отзыв, который сейчас редактируется
  const [editedText, setEditedText] = useState(''); // Текст отзыва в форме редактирования

  const handleUpdateReview = async (id, status) => {
    // Оптимистичное обновление UI
    const optimisticData = reviews.map(r => (r.id === id ? { ...r, status } : r));
    mutate('/api/admin/reviews', optimisticData, false);

    try {
      await fetcher(`/api/admin/reviews`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
        // credentials: 'include' уже добавлен в fetcher по умолчанию
      });
      // Если успешно, повторно получаем данные для подтверждения
      mutate('/api/admin/reviews');
      toast({ title: "Статус обновлен.", status: "success", duration: 3000, isClosable: true });
    } catch (err) {
      // В случае ошибки возвращаем старые данные и показываем тост
      mutate('/api/admin/reviews'); // Откатываем оптимистичное обновление
      toast({ title: "Ошибка обновления статуса.", description: err.message, status: "error", duration: 5000, isClosable: true });
    }
  };

  const handleDeleteReview = async (id) => {
    // Оптимистичное обновление UI
    const optimisticData = reviews.filter(r => r.id !== id);
    mutate('/api/admin/reviews', optimisticData, false);

    try {
      await fetcher(`/api/admin/reviews`, { // Используем fetcher для единообразной обработки ошибок
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
        // credentials: 'include' уже добавлен в fetcher по умолчанию
      });
      // Если успешно, повторно получаем данные для подтверждения
      mutate('/api/admin/reviews');
      toast({ title: "Отзыв удален.", status: "success", duration: 3000, isClosable: true });
    } catch (err) {
      // В случае ошибки возвращаем старые данные и показываем тост
      mutate('/api/admin/reviews'); // Откатываем оптимистичное обновление
      toast({ title: "Ошибка удаления.", description: err.message, status: "error", duration: 5000, isClosable: true });
    }
  };

  // Функция для открытия модального окна редактирования
  const handleEditReview = (review) => {
    setCurrentReview(review);
    setEditedText(review.text);
    onEditModalOpen();
  };

  // Функция для сохранения отредактированного отзыва
  const handleSaveEditedReview = async () => {
    if (!editedText.trim()) { // Проверяем только editedText, currentReview уже должен быть установлен
      toast({ title: "Текст отзыва не может быть пустым.", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    if (!currentReview) { // Дополнительная проверка, хотя currentReview должен быть установлен
        toast({ title: "Не выбран отзыв для редактирования.", status: "error", duration: 3000, isClosable: true });
        return;
    }

    const reviewId = currentReview.id;
    // Оптимистичное обновление UI для текста отзыва
    const optimisticData = reviews.map(r => (r.id === reviewId ? { ...r, text: editedText } : r));
    mutate('/api/admin/reviews', optimisticData, false);

    try {
      await fetcher(`/api/admin/reviews`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reviewId, text: editedText }), // Отправляем только ID и текст
        // credentials: 'include' уже добавлен в fetcher по умолчанию
      });
      // Если успешно, повторно получаем данные для подтверждения
      mutate('/api/admin/reviews');
      toast({ title: "Отзыв обновлен.", status: "success", duration: 3000, isClosable: true });
      onEditModalClose(); // Закрываем модальное окно после успешного сохранения
    } catch (err) {
      // В случае ошибки возвращаем старые данные и показываем тост
      mutate('/api/admin/reviews'); // Откатываем оптимистичное обновление
      toast({ title: "Ошибка обновления отзыва.", description: err.message, status: "error", duration: 5000, isClosable: true });
    }
  };

  const isLoading = !reviews && !error;

  return (
    <AdminLayout>
      <Box>
        <Heading as="h1" mb={6}>Управление отзывами</Heading>
        {isLoading && (
          <Center p={10}><Spinner size="xl" /></Center>
        )}
        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">Не удалось загрузить отзывы.</Text>
              <Text>Причина: {error.message}</Text>
            </Box>
          </Alert>
        )}
        {reviews && (
          <ReviewTable
            reviews={reviews}
            onUpdate={handleUpdateReview}
            onDelete={handleDeleteReview}
            onEdit={handleEditReview} // Передаем новую функцию обработки редактирования
          />
        )}
      </Box>

      {/* Модальное окно для редактирования отзыва */}
      <Modal isOpen={isEditModalOpen} onClose={onEditModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Редактировать отзыв</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Текст отзыва</FormLabel>
              <Textarea 
                value={editedText} 
                onChange={(e) => setEditedText(e.target.value)} 
                placeholder="Введите текст отзыва"
                minH="150px" // Увеличиваем высоту текстового поля
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onEditModalClose}>Отмена</Button>
            <Button colorScheme="blue" ml={3} onClick={handleSaveEditedReview}>Сохранить</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AdminLayout>
  );
}
