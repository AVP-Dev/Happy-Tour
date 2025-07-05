// components/admin/TourTable.js
import React from 'react';
import {
    Table, Thead, Tbody, Tr, Th, Td, TableContainer,
    HStack, Text, Switch, useToast, Tooltip, IconButton, Box, VStack, Flex // Добавлен HStack
} from '@chakra-ui/react';
import { FaEdit, FaTrash } from 'react-icons/fa';

const TourTable = ({ tours, onEdit, onDelete, onTogglePublished }) => {
    const toast = useToast();

    if (!tours || tours.length === 0) {
        return <Text>Туры не найдены.</Text>;
    }

    return (
        <Box bg="white" rounded="lg" shadow="md" overflow="hidden">
            {/* Таблица для больших экранов */}
            <TableContainer display={{ base: 'none', md: 'block' }}>
                <Table variant="simple" size="md">
                    <Thead bg="gray.50">
                        <Tr>
                            <Th>Название</Th>
                            <Th>Категория</Th>
                            <Th isNumeric>Цена</Th>
                            <Th>Опубликован</Th>
                            <Th isNumeric>Действия</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {tours.map((tour) => (
                            <Tr key={tour.id} _hover={{ bg: 'gray.50' }}>
                                <Td fontWeight="medium">{tour.title}</Td>
                                <Td>{tour.category}</Td>
                                <Td isNumeric>{tour.price} {tour.currency}</Td>
                                <Td>
                                    <Switch
                                        isChecked={tour.published}
                                        onChange={() => onTogglePublished(tour.id, !tour.published)}
                                        colorScheme="green"
                                    />
                                </Td>
                                <Td isNumeric>
                                    <HStack spacing={2} justifyContent="flex-end">
                                        <Tooltip label="Редактировать" hasArrow>
                                            <IconButton
                                                aria-label="Редактировать тур"
                                                icon={<FaEdit />}
                                                size="sm"
                                                variant="ghost"
                                                colorScheme="blue"
                                                onClick={() => onEdit(tour)}
                                            />
                                        </Tooltip>
                                        <Tooltip label="Удалить" hasArrow>
                                            <IconButton
                                                aria-label="Удалить тур"
                                                icon={<FaTrash />}
                                                size="sm"
                                                variant="ghost"
                                                colorScheme="red"
                                                onClick={() => onDelete(tour.id)}
                                            />
                                        </Tooltip>
                                    </HStack>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>

            {/* Карточки для мобильных экранов */}
            <VStack spacing={4} align="stretch" display={{ base: 'flex', md: 'none' }} p={4}>
                {tours.map((tour) => (
                    <Box key={tour.id} p={4} borderWidth="1px" borderRadius="lg" shadow="sm" bg="white">
                        <HStack justifyContent="space-between" mb={2}>
                            <Text fontWeight="bold" fontSize="lg">{tour.title}</Text>
                            <HStack spacing={2}>
                                <Tooltip label="Редактировать" hasArrow>
                                    <IconButton
                                        aria-label="Редактировать тур"
                                        icon={<FaEdit />}
                                        size="sm"
                                        variant="ghost"
                                        colorScheme="blue"
                                        onClick={() => onEdit(tour)}
                                    />
                                </Tooltip>
                                <Tooltip label="Удалить" hasArrow>
                                    <IconButton
                                        aria-label="Удалить тур"
                                        icon={<FaTrash />}
                                        size="sm"
                                        variant="ghost"
                                        colorScheme="red"
                                        onClick={() => onDelete(tour.id)}
                                    />
                                </Tooltip>
                            </HStack>
                        </HStack>
                        <Text mb={2} color="gray.600">Категория: {tour.category}</Text>
                        <Text mb={2} color="gray.600">Цена: {tour.price} {tour.currency}</Text>
                        <Flex justifyContent="space-between" alignItems="center" mt={3}>
                            <Text fontSize="sm" color="gray.500">Опубликован:</Text>
                            <Switch
                                isChecked={tour.published}
                                onChange={() => onTogglePublished(tour.id, !tour.published)}
                                colorScheme="green"
                            />
                        </Flex>
                    </Box>
                ))}
            </VStack>
        </Box>
    );
};

export default TourTable;
