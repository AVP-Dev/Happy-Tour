import {
  Table, Thead, Tbody, Tr, Th, Td, Select, IconButton, Box, Text,
  useBreakpointValue, VStack, HStack, Heading
} from '@chakra-ui/react';
import { FaTrash } from 'react-icons/fa';

const formatDate = (dateString) => {
  try {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch (error) {
    console.error("Invalid date format:", dateString);
    return 'Неверная дата';
  }
};

const getStatusScheme = (status) => {
  switch (status) {
    case 'APPROVED': return 'green';
    case 'PENDING': return 'yellow';
    case 'REJECTED': return 'red';
    default: return 'gray';
  }
};

/**
 * Карточка отзыва для мобильного отображения.
 */
const ReviewCard = ({ review, onUpdate, onDelete }) => (
    <Box bg="white" p={4} borderRadius="md" shadow="md" w="100%">
        <VStack align="stretch" spacing={3}>
            <HStack justify="space-between">
                <Heading size="sm" noOfLines={1}>{review.name || 'Аноним'}</Heading>
                <Text fontSize="xs" color="gray.500">{formatDate(review.createdAt)}</Text>
            </HStack>
            <HStack>
                <Text fontWeight="bold">Рейтинг:</Text>
                <Text>{review.rating || 'N/A'} / 5</Text>
            </HStack>
            {review.comment && <Text fontSize="sm" noOfLines={5}>{review.comment}</Text>}
            <HStack justify="space-between" align="center">
                 <Text fontWeight="bold">Статус:</Text>
                 <Select
                  size="sm"
                  maxW="150px"
                  value={review.status || 'PENDING'}
                  onChange={(e) => onUpdate(review.id, e.target.value)}
                  borderColor={`${getStatusScheme(review.status)}.500`}
                  focusBorderColor={`${getStatusScheme(review.status)}.600`}
                  borderRadius="md"
                >
                  <option value="PENDING">В ожидании</option>
                  <option value="APPROVED">Одобрен</option>
                  <option value="REJECTED">Отклонен</option>
                </Select>
            </HStack>
             <HStack justify="flex-end" pt={2}>
                <IconButton
                  icon={<FaTrash />}
                  onClick={() => onDelete(review.id)}
                  aria-label="Удалить отзыв"
                  colorScheme="red"
                  variant="ghost"
                  size="sm"
                />
            </HStack>
        </VStack>
    </Box>
);

/**
 * Основной компонент для отображения отзывов.
 */
export default function ReviewTable({ reviews, onUpdate, onDelete }) {
  const isMobile = useBreakpointValue({ base: true, md: false });

  if (!reviews || reviews.length === 0) {
    return <Text p={4}>Отзывы не найдены.</Text>;
  }

  // Мобильный вид
  if (isMobile) {
      return (
          <VStack spacing={4} align="stretch">
              {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} onUpdate={onUpdate} onDelete={onDelete} />
              ))}
          </VStack>
      );
  }

  // Десктопный вид
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
              <Td whiteSpace="nowrap">{review.name || 'Аноним'}</Td>
              <Td maxW="400px" whiteSpace="pre-wrap" fontSize="sm">{review.comment || '-'}</Td>
              <Td textAlign="center">{review.rating || 'N/A'}</Td>
              <Td>
                <Select
                  size="sm"
                  value={review.status || 'PENDING'}
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
              <Td whiteSpace="nowrap">{formatDate(review.createdAt)}</Td>
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
