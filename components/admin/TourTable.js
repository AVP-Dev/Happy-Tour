import {
  Table, Thead, Tbody, Tr, Th, Td, IconButton, Switch, Box, Text,
  useBreakpointValue, VStack, HStack, Heading
} from '@chakra-ui/react';
import { FaEdit, FaTrash } from 'react-icons/fa';

/**
 * Карточка тура для мобильного отображения.
 * @param {object} props - Свойства компонента.
 * @param {object} props.tour - Данные тура.
 * @param {Function} props.onEdit - Обработчик редактирования.
 * @param {Function} props.onDelete - Обработчик удаления.
 * @param {Function} props.onToggle - Обработчик переключения статуса.
 */
const TourCard = ({ tour, onEdit, onDelete, onToggle }) => (
  <Box bg="white" p={4} borderRadius="md" shadow="md" w="100%">
    <VStack align="stretch" spacing={3}>
      <Heading size="sm" noOfLines={2}>{tour.name}</Heading>
      <HStack justify="space-between">
        <Text fontWeight="bold">Цена:</Text>
        <Text>{tour.price} BYN</Text>
      </HStack>
      <HStack justify="space-between">
        <Text fontWeight="bold">Активен:</Text>
        <Switch
          isChecked={tour.isActive}
          onChange={() => onToggle(tour.id, !tour.isActive)}
          colorScheme="green"
        />
      </HStack>
      <HStack justify="flex-end" pt={2}>
        <IconButton
          icon={<FaEdit />}
          onClick={() => onEdit(tour)}
          aria-label="Редактировать тур"
          variant="ghost"
        />
        <IconButton
          icon={<FaTrash />}
          onClick={() => onDelete(tour.id)}
          aria-label="Удалить тур"
          variant="ghost"
          colorScheme="red"
        />
      </HStack>
    </VStack>
  </Box>
);

/**
 * Основной компонент, который отображает либо таблицу, либо список карточек
 * в зависимости от размера экрана.
 */
export default function TourTable({ tours, onEdit, onDelete, onToggle }) {
  // Хук для определения текущей точки останова (breakpoint).
  // `true` для мобильных, `false` для десктопов (md и выше).
  const isMobile = useBreakpointValue({ base: true, md: false });

  if (!tours || tours.length === 0) {
    return <Text p={4}>Туры не найдены.</Text>;
  }

  // Для мобильных устройств отображаем список карточек.
  if (isMobile) {
    return (
      <VStack spacing={4} align="stretch">
        {tours.map((tour) => (
          <TourCard key={tour.id} tour={tour} onEdit={onEdit} onDelete={onDelete} onToggle={onToggle} />
        ))}
      </VStack>
    );
  }

  // Для десктопов отображаем таблицу с горизонтальной прокруткой на всякий случай.
  return (
    <Box overflowX="auto" bg="white" borderRadius="md" shadow="md">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Название</Th>
            <Th isNumeric>Цена</Th>
            <Th>Активен</Th>
            <Th>Действия</Th>
          </Tr>
        </Thead>
        <Tbody>
          {tours.map((tour) => (
            <Tr key={tour.id}>
              <Td maxW="400px" whiteSpace="normal">{tour.name}</Td>
              <Td isNumeric>{tour.price}</Td>
              <Td>
                <Switch
                  isChecked={tour.isActive}
                  onChange={() => onToggle(tour.id, !tour.isActive)}
                  colorScheme="green"
                />
              </Td>
              <Td>
                <IconButton
                  icon={<FaEdit />}
                  onClick={() => onEdit(tour)}
                  aria-label="Редактировать тур"
                  variant="ghost"
                  mr={2}
                />
                <IconButton
                  icon={<FaTrash />}
                  onClick={() => onDelete(tour.id)}
                  aria-label="Удалить тур"
                  variant="ghost"
                  colorScheme="red"
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
