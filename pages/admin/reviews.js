import useSWR, { mutate } from 'swr';
import AdminLayout from '../../components/admin/AdminLayout';
import ReviewTable from '../../components/admin/ReviewTable';
import { Heading, Box, Spinner, Center, Alert, AlertIcon, useToast } from '@chakra-ui/react';

// SWR fetcher function
const fetcher = (url) => fetch(url).then((res) => res.json());

export default function ReviewsPage() {
  // Using SWR for data fetching, caching, and revalidation.
  const { data: reviews, error } = useSWR('/api/admin/reviews', fetcher);
  const toast = useToast();

  // Function to handle review status updates.
  const handleUpdateReview = async (id, status) => {
    // Optimistically update the local data to give immediate feedback.
    const optimisticData = reviews.map(r => (r.id === id ? { ...r, status } : r));
    mutate('/api/admin/reviews', optimisticData, false);

    try {
      const response = await fetch(`/api/admin/reviews`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Не удалось обновить статус' }));
        throw new Error(errorData.error);
      }
      
      // Trigger a re-fetch from the server to ensure data consistency.
      mutate('/api/admin/reviews');

      toast({
        title: "Статус обновлен.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      // If the API call fails, revert the optimistic update and show an error.
      mutate('/api/admin/reviews'); // Re-fetch to get the original state
      toast({
        title: "Ошибка обновления.",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Function to handle review deletion.
  const handleDeleteReview = async (id) => {
    // Optimistically filter out the deleted review.
    const optimisticData = reviews.filter(r => r.id !== id);
    mutate('/api/admin/reviews', optimisticData, false);

    try {
      const response = await fetch(`/api/admin/reviews`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!response.ok && response.status !== 204) {
        const errorData = await response.json().catch(() => ({ error: 'Не удалось удалить отзыв' }));
        throw new Error(errorData.error);
      }
      
      // Trigger a re-fetch.
      mutate('/api/admin/reviews');

      toast({
        title: "Отзыв удален.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      // If deletion fails, revert the optimistic update.
      mutate('/api/admin/reviews');
      toast({
        title: "Ошибка удаления.",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const isLoading = !reviews && !error;

  return (
    <AdminLayout>
      <Box>
        <Heading as="h1" mb={6}>Управление отзывами</Heading>
        {isLoading ? (
          <Center p={10}><Spinner size="xl" /></Center>
        ) : error ? (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            Не удалось загрузить отзывы.
          </Alert>
        ) : (
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
