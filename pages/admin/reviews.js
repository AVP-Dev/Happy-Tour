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
  const defaultOptions = {
    ...options,
    credentials: 'include', 
  };

  const res = await fetch(url, defaultOptions);

  if (!res.ok) {
    const errorPayload = await res.json().catch(() => {
      return { error: `Сервер ответил со статусом ${res.status}, но без деталей.` };
    });
    
    const error = new Error(errorPayload.error);
    throw error;
  }

  return res.json();
};

export default function ReviewsPage() {
  const { data: reviews, error } = useSWR('/api/admin/reviews', fetcher);
  const toast = useToast();

  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
  const [currentReview, setCurrentReview] = useState(null); 
  const [editedText, setEditedText] = useState(''); 

  const handleUpdateReview = async (id, status) => {
    const optimisticData = reviews.map(r => (r.id === id ? { ...r, status } : r));
    mutate('/api/admin/reviews', optimisticData, false);

    try {
      await fetcher(`/api/admin/reviews`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      mutate('/api/admin/reviews');
      toast({ title: "Статус обновлен.", status: "success", duration: 3000, isClosable: true, position: "top" }); // Изменено: позиция "top"
    } catch (err) {
      mutate('/api/admin/reviews'); 
      toast({ title: "Ошибка обновления статуса.", description: err.message, status: "error", duration: 5000, isClosable: true, position: "top" }); // Изменено: позиция "top"
    }
  };

  const handleDeleteReview = async (id) => {
    const optimisticData = reviews.filter(r => r.id !== id);
    mutate('/api/admin/reviews', optimisticData, false);

    try {
      await fetcher(`/api/admin/reviews`, { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      mutate('/api/admin/reviews');
      toast({ title: "Отзыв удален.", status: "success", duration: 3000, isClosable: true, position: "top" }); // Изменено: позиция "top"
    } catch (err) {
      mutate('/api/admin/reviews'); 
      toast({ title: "Ошибка удаления.", description: err.message, status: "error", duration: 5000, isClosable: true, position: "top" }); // Изменено: позиция "top"
    }
  };

  const handleEditReview = (review) => {
    setCurrentReview(review);
    setEditedText(review.text);
    onEditModalOpen();
  };

  const handleSaveEditedReview = async () => {
    if (!editedText.trim()) { 
      toast({ title: "Текст отзыва не может быть пустым.", status: "warning", duration: 3000, isClosable: true, position: "top" }); // Изменено: позиция "top"
      return;
    }
    if (!currentReview) { 
        toast({ title: "Не выбран отзыв для редактирования.", status: "error", duration: 3000, isClosable: true, position: "top" }); // Изменено: позиция "top"
        return;
    }

    const reviewId = currentReview.id;
    const optimisticData = reviews.map(r => (r.id === reviewId ? { ...r, text: editedText } : r));
    mutate('/api/admin/reviews', optimisticData, false);

    try {
      await fetcher(`/api/admin/reviews`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reviewId, text: editedText }), 
      });
      mutate('/api/admin/reviews');
      toast({ title: "Отзыв обновлен.", status: "success", duration: 3000, isClosable: true, position: "top" }); // Изменено: позиция "top"
      onEditModalClose(); 
    } catch (err) {
      mutate('/api/admin/reviews'); 
      toast({ title: "Ошибка обновления отзыва.", description: err.message, status: "error", duration: 5000, isClosable: true, position: "top" }); // Изменено: позиция "top"
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
            onEdit={handleEditReview} 
          />
        )}
      </Box>

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
