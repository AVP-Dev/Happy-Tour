import useSWR, { mutate } from 'swr';
import AdminLayout from '../../components/admin/AdminLayout';
import ReviewTable from '../../components/admin/ReviewTable';
import { Heading, Box, Spinner, Center, Alert, AlertIcon, useToast, Text } from '@chakra-ui/react';

// Обновленный fetcher для SWR, который корректно обрабатывает ошибки API
const fetcher = async (url) => {
  const res = await fetch(url);

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
      toast({ title: "Статус обновлен.", status: "success", duration: 3000, isClosable: true });
    } catch (err) {
      mutate('/api/admin/reviews');
      toast({ title: "Ошибка обновления.", description: err.message, status: "error", duration: 5000, isClosable: true });
    }
  };

  const handleDeleteReview = async (id) => {
    const optimisticData = reviews.filter(r => r.id !== id);
    mutate('/api/admin/reviews', optimisticData, false);

    try {
      await fetch(`/api/admin/reviews`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      mutate('/api/admin/reviews');
      toast({ title: "Отзыв удален.", status: "success", duration: 3000, isClosable: true });
    } catch (err) {
      mutate('/api/admin/reviews');
      toast({ title: "Ошибка удаления.", description: err.message, status: "error", duration: 5000, isClosable: true });
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
          />
        )}
      </Box>
    </AdminLayout>
  );
}
