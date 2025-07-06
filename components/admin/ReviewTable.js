import {
  Table, Thead, Tbody, Tr, Th, Td, Select, IconButton, Box, Text
} from '@chakra-ui/react';
import { FaTrash } from 'react-icons/fa';

/**
 * Safely formats a date string.
 * @param {string} dateString - The date string to format.
 * @returns {string} - The formatted date or a fallback message.
 */
const formatDate = (dateString) => {
  try {
    // The original file used new Date(), which showed the current date.
    // This now correctly uses the provided dateString (review.createdAt).
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error("Invalid date format:", dateString);
    return 'Неверная дата';
  }
};

/**
 * Returns a color scheme based on the review status.
 * @param {string} status - The review status.
 * @returns {string} - A Chakra UI color scheme name.
 */
const getStatusScheme = (status) => {
    switch (status) {
        case 'APPROVED': return 'green';
        case 'PENDING': return 'yellow';
        case 'REJECTED': return 'red';
        default: return 'gray';
    }
}

export default function ReviewTable({ reviews, onUpdate, onDelete }) {
  // If the reviews array is empty or doesn't exist, show a message.
  if (!reviews || reviews.length === 0) {
    return <Text p={4}>Отзывы не найдены.</Text>;
  }

  return (
    <Box overflowX="auto" bg="white" borderRadius="md" shadow="md">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Пользователь</Th>
            <Th>Отзыв</Th>
            <Th>Рейтинг</Th>
            <Th>Статус</Th>
            <Th>Дата</Th>
            <Th>Действия</Th>
          </Tr>
        </Thead>
        <Tbody>
          {reviews.map((review) => (
            <Tr key={review.id}>
              {/* Added fallbacks to prevent crashes if data is missing. */}
              <Td>{review.name || 'Аноним'}</Td>
              <Td maxW="400px" whiteSpace="pre-wrap" fontSize="sm">{review.comment || '-'}</Td>
              <Td textAlign="center">{review.rating || 'N/A'}</Td>
              <Td>
                <Select
                  size="sm"
                  value={review.status || 'PENDING'} // Fallback for status
                  onChange={(e) => onUpdate(review.id, e.target.value)}
                  borderColor={`${getStatusScheme(review.status)}.500`}
                  focusBorderColor={`${getStatusScheme(review.status)}.600`}
                  borderRadius="md"
                >
                  <option value="PENDING">В ожидании</option>
                  <option value="APPROVED">Одобрен</option>
                  <option value="REJECTED">Отклонен</option>
                </Select>
              </Td>
              {/* Correctly formatting review.createdAt */}
              <Td>{formatDate(review.createdAt)}</Td>
              <Td>
                <IconButton
                  icon={<FaTrash />}
                  onClick={() => onDelete(review.id)}
                  aria-label="Удалить отзыв"
                  colorScheme="red"
                  variant="ghost"
                  size="sm"
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
