import useSWR, { mutate } from 'swr';
import AdminLayout from '../../components/admin/AdminLayout';
import ReviewTable from '../../components/admin/ReviewTable';
import { 
  Heading, Box, Spinner, Center, Alert, AlertIcon, useToast, Text,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  FormControl, FormLabel, Textarea, Button, useDisclosure, Select, HStack
} from '@chakra-ui/react';
import React, { useState, useMemo } from 'react';

// Обновленный fetcher для SWR, который корректно обрабатывает ошибки API
const fetcher = async (url, options) => {
  const defaultOptions = {
    ...options,
    credentials: 'include', 
  };

  const res = await fetch(url, defaultOptions);

  // Если ответ сервера НЕ успешный (не 2xx) И не 204 No Content
  if (!res.ok && res.status !== 204) {
    const errorPayload = await res.json().catch(() => {
      return { error: `Сервер ответил со статусом ${res.status}, но без деталей.` };
    });
    
    const error = new Error(errorPayload.error);
    throw error;
  }

  // Если статус 204, возвращаем null, так как нет тела ответа
  if (res.status === 204) {
    return null;
  }

  // Если все хорошо, возвращаем JSON
  return res.json();
};

export default function ReviewsPage() {
  const { data: reviews, error, isLoading: isSWRLoading, isValidating } = useSWR('/api/admin/reviews', fetcher);
  const toast = useToast();

  // Состояние для модального окна редактирования
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
  const [currentReview, setCurrentReview] = useState(null); 
  const [editedText, setEditedText] = useState(''); 

  // Состояние для фильтрации по статусу
  const [filterStatus, setFilterStatus] = useState('all'); 

  // Мемоизированный список отзывов для фильтрации
  const filteredReviews = useMemo(() => {
    console.log("useMemo: Пересчет filteredReviews");
    console.log("Текущие отзывы (reviews):", reviews);
    console.log("Текущий статус фильтра (filterStatus):", filterStatus);

    if (!reviews) {
      console.log("useMemo: Отзывы еще не загружены, возвращаем пустой массив.");
      return [];
    }
    if (filterStatus === 'all') {
      console.log("useMemo: Фильтр 'все статусы', возвращаем все отзывы.");
      return reviews;
    }
    const result = reviews.filter(review => {
      const match = review.status === filterStatus;
      console.log(`Review ID: ${review.id}, Status: ${review.status}, Filter: ${filterStatus}, Match: ${match}`);
      return match;
    });
    console.log("useMemo: Результат фильтрации:", result);
    return result;
  }, [reviews, filterStatus]);

  const handleUpdateReview = async (id, status) => {
    // Оптимистичное обновление UI
    const optimisticData = reviews.map(r => (r.id === id ? { ...r, status } : r));
    mutate('/api/admin/reviews', optimisticData, false);

    try {
      await fetcher(`/api/admin/reviews`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      // После успешного обновления, перевалидируем данные, чтобы получить актуальный список
      mutate('/api/admin/reviews');
      toast({ title: "Статус обновлен.", status: "success", duration: 3000, isClosable: true, position: "top" });
    } catch (err) {
      // В случае ошибки возвращаем старые данные и показываем тост
      mutate('/api/admin/reviews'); // Откатываем оптимистичное обновление
      toast({ title: "Ошибка обновления статуса.", description: err.message, status: "error", duration: 5000, isClosable: true, position: "top" });
    }
  };

  const handleDeleteReview = async (id) => {
    // Оптимистичное обновление UI
    const optimisticData = reviews.filter(r => r.id !== id);
    mutate('/api/admin/reviews', optimisticData, false);

    try {
      await fetcher(`/api/admin/reviews`, { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      // После успешного удаления, перевалидируем данные
      mutate('/api/admin/reviews');
      toast({ title: "Отзыв успешно удален.", status: "success", duration: 3000, isClosable: true, position: "top" }); 
    } catch (err) {
      // В случае ошибки возвращаем старые данные и показываем тост
      mutate('/api/admin/reviews'); 
      toast({ title: "Ошибка удаления.", description: err.message, status: "error", duration: 5000, isClosable: true, position: "top" });
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
    if (!editedText.trim()) { 
      toast({ title: "Текст отзыва не может быть пустым.", status: "warning", duration: 3000, isClosable: true, position: "top" });
      return;
    }
    if (!currentReview) { 
        toast({ title: "Не выбран отзыв для редактирования.", status: "error", duration: 3000, isClosable: true, position: "top" });
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
        body: JSON.stringify({ id: reviewId, text: editedText }), 
      });
      // Если успешно, повторно получаем данные для подтверждения
      mutate('/api/admin/reviews');
      toast({ title: "Отзыв обновлен.", status: "success", duration: 3000, isClosable: true, position: "top" });
      onEditModalClose(); 
    } catch (err) {
      // В случае ошибки возвращаем старые данные и показываем тост
      mutate('/api/admin/reviews'); 
      toast({ title: "Ошибка обновления отзыва.", description: err.message, status: "error", duration: 5000, isClosable: true, position: "top" });
    }
  };

  // Используем isSWRLoading для индикации загрузки данных через SWR
  const isLoadingData = isSWRLoading && !reviews && !error;

  return (
    <AdminLayout>
      <Box p={{ base: 4, md: 6 }}>
        <Heading as="h1" mb={6}>Управление отзывами</Heading>

        {/* Элементы фильтрации */}
        <HStack mb={6} spacing={4} direction={{ base: 'column', md: 'row' }} w="full" alignItems="stretch">
            <Text flexShrink={0} alignSelf="center">Фильтр по статусу:</Text>
            <Select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)} 
                maxW={{ base: 'full', md: '250px' }}
            >
                <option value="all">Все статусы</option>
                <option value="pending">Ожидают</option>
                <option value="published">Опубликованы</option>
                <option value="rejected">Отклонены</option>
            </Select>
        </HStack>

        {isLoadingData && (
          <Center p={10}><Spinner size="xl" /></Center>
        )}
        {error && !reviews && (
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
            reviews={filteredReviews}
            onUpdate={handleUpdateReview}
            onDelete={handleDeleteReview}
            onEdit={handleEditReview} 
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
                minH="150px" 
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
