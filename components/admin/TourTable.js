import {
  Table, Thead, Tbody, Tr, Th, Td, IconButton, Switch, Box, Text
} from '@chakra-ui/react';
import { FaEdit, FaTrash } from 'react-icons/fa';

/**
 * Компонент для отображения таблицы туров в админ-панели.
 * Добавлена обертка <Box overflowX="auto"> для обеспечения адаптивности на мобильных устройствах.
 * Эта обертка создает горизонтальный скролл для таблицы, если она не помещается в экран,
 * предотвращая скролл всей страницы.
 */
export default function TourTable({ tours, onEdit, onDelete, onToggle }) {
  if (!tours || tours.length === 0) {
    return <Text p={4}>Туры не найдены.</Text>;
  }

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
              <Td whiteSpace="nowrap">{tour.name}</Td>
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
