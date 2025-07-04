// components/admin/TourTable.js
import React from 'react';
import {
    Table, Thead, Tbody, Tr, Th, Td, TableContainer,
    HStack, Text, Image, Box, Tooltip,
    Tag, IconButton, Switch
} from '@chakra-ui/react';
import { FaEdit, FaTrash, FaHotjar, FaStar, FaGift } from 'react-icons/fa';

const TourTable = ({ tours, onEdit, onDelete, onTogglePublished }) => {

    const CategoryTag = ({ category }) => {
        const details = {
            hot: { icon: FaHotjar, color: 'red', label: 'Горящий' },
            popular: { icon: FaStar, color: 'orange', label: 'Популярный' },
            special: { icon: FaGift, color: 'purple', label: 'Выгодный' },
        }[category] || { icon: FaStar, color: 'gray', label: category };

        return (
            <Tag size="sm" variant="subtle" colorScheme={details.color}>
                <HStack spacing={1}>
                    <Icon as={details.icon} />
                    <Text>{details.label}</Text>
                </HStack>
            </Tag>
        );
    };

    return (
        <Box bg="white" rounded="lg" shadow="md" overflow="hidden">
            <TableContainer>
                <Table variant="simple" size="md">
                    <Thead bg="gray.50">
                        <Tr>
                            <Th>Фото</Th>
                            <Th>Название</Th>
                            <Th>Категория</Th>
                            <Th isNumeric>Цена</Th>
                            <Th>Опубликован</Th>
                            <Th>Действия</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {tours.map((tour) => (
                            <Tr key={tour.id} _hover={{ bg: 'gray.50' }}>
                                <Td>
                                    <Image
                                        src={tour.image_url}
                                        boxSize="60px"
                                        objectFit="cover"
                                        borderRadius="md"
                                        alt={tour.title}
                                        fallbackSrc="https://placehold.co/60x60/eee/ccc?text=Нет"
                                    />
                                </Td>
                                <Td fontWeight="medium" maxW="300px" whiteSpace="normal">{tour.title}</Td>
                                <Td><CategoryTag category={tour.category} /></Td>
                                <Td isNumeric fontWeight="semibold">{`${tour.price?.toFixed(0)} ${tour.currency}`}</Td>
                                <Td>
                                    <Tooltip label={tour.published ? 'Снять с публикации' : 'Опубликовать'}>
                                        <Switch
                                            colorScheme="brand"
                                            isChecked={tour.published}
                                            onChange={() => onTogglePublished(tour.id, !tour.published)}
                                        />
                                    </Tooltip>
                                </Td>
                                <Td>
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
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default TourTable;
