// components/admin/TourTable.js
import React, { useState, useEffect } from 'react';
import {
    Table, Thead, Tbody, Tr, Th, Td, TableContainer,
    Button, HStack, Text, Image, Box, Tooltip, VStack,
    Flex, Heading, useBreakpointValue, Divider, Spinner,
    Tag, Menu, MenuButton, MenuList, MenuItem, IconButton
} from '@chakra-ui/react';
import { 
    FaEdit, FaTrash, FaEye, FaEyeSlash, 
    FaHotjar, FaStar, FaGift, FaEllipsisV
} from 'react-icons/fa';

const TourTable = ({ tours, onEdit, onDelete, onTogglePublished }) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const displayMode = useBreakpointValue({ base: 'card', md: 'table' });

    if (!tours || tours.length === 0) {
        return <Text p={5} textAlign="center">Туры не найдены.</Text>;
    }

    if (!isClient) {
        return (
            <Flex justify="center" align="center" minH="200px">
                <Spinner />
            </Flex>
        );
    }
    
    const CategoryTag = ({ category }) => {
        const getCategoryDetails = (cat) => {
            switch (cat) {
                case 'hot':
                    return { icon: <FaHotjar />, color: 'red', label: 'Горящий' };
                case 'popular':
                    return { icon: <FaStar />, color: 'orange', label: 'Популярный' };
                // --- ИЗМЕНЕНИЕ: Название категории изменено ---
                case 'special':
                    return { icon: <FaGift />, color: 'purple', label: 'Выгодный' };
                default:
                    return { icon: null, color: 'gray', label: cat };
            }
        };
        const details = getCategoryDetails(category);
        return (
            <Tag size="sm" variant="solid" colorScheme={details.color}>
                <HStack spacing={1}>
                    {details.icon}
                    <Text>{details.label}</Text>
                </HStack>
            </Tag>
        );
    };

    const ActionsMenu = ({ tour }) => (
        <Menu>
            <MenuButton
                as={IconButton}
                aria-label="Действия"
                icon={<FaEllipsisV />}
                variant="ghost"
                size="sm"
            />
            <MenuList>
                <MenuItem 
                    icon={tour.published ? <FaEyeSlash /> : <FaEye />}
                    onClick={() => onTogglePublished(tour.id, !tour.published)}
                >
                    {tour.published ? 'Снять с публикации' : 'Опубликовать'}
                </MenuItem>
                <MenuItem icon={<FaEdit />} onClick={() => onEdit(tour)}>
                    Редактировать
                </MenuItem>
                <MenuItem icon={<FaTrash />} color="red.500" onClick={() => onDelete(tour.id)}>
                    Удалить
                </MenuItem>
            </MenuList>
        </Menu>
    );

    if (displayMode === 'card') {
        return (
            <VStack spacing={4} align="stretch">
                {tours.map((tour) => (
                    <Box key={tour.id} p={4} borderWidth="1px" borderRadius="lg" shadow="md" bg="white">
                        <Flex direction={{ base: 'column', sm: 'row' }} gap={4} align="center">
                            <Image
                                src={tour.image_url}
                                boxSize="100px"
                                objectFit="cover"
                                borderRadius="md"
                                alt={tour.title}
                                fallbackSrc="https://placehold.co/100x100/eee/ccc?text=Нет"
                            />
                            <VStack align="flex-start" flex="1" spacing={2}>
                                <Heading as="h3" size="sm" noOfLines={2}>{tour.title}</Heading>
                                <HStack>
                                    <Text fontSize="lg" fontWeight="bold" color="green.600">
                                        {`${tour.price?.toFixed(0)} ${tour.currency}`}
                                    </Text>
                                    <CategoryTag category={tour.category} />
                                </HStack>
                            </VStack>
                            <Box alignSelf={{ base: 'flex-end', sm: 'center' }}>
                                <ActionsMenu tour={tour} />
                            </Box>
                        </Flex>
                    </Box>
                ))}
            </VStack>
        );
    }

    return (
        <Box bg="white" rounded="lg" shadow="md" overflow="hidden">
            <TableContainer>
                <Table variant="simple" size="sm">
                    <Thead bg="gray.50">
                        <Tr>
                            <Th>Фото</Th>
                            <Th>Название</Th>
                            <Th>Категория</Th>
                            <Th isNumeric>Цена</Th>
                            <Th>Кем обновлен</Th>
                            <Th>Дата обновления</Th>
                            <Th textAlign="center">Управление</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {tours.map((tour) => (
                            <Tr key={tour.id}>
                                <Td>
                                    <Image
                                        src={tour.image_url}
                                        boxSize="50px"
                                        objectFit="cover"
                                        borderRadius="md"
                                        alt={tour.title}
                                        fallbackSrc="https://placehold.co/50x50/eee/ccc?text=Нет"
                                    />
                                </Td>
                                <Td fontWeight="medium" maxW="250px" whiteSpace="normal">{tour.title}</Td>
                                <Td>
                                    <CategoryTag category={tour.category} />
                                </Td>
                                <Td isNumeric>{`${tour.price?.toFixed(0)} ${tour.currency}`}</Td>
                                <Td>
                                    <Tooltip label={tour.updatedBy?.email} placement="top">
                                        <Text cursor="default">{tour.updatedBy?.name || 'Неизвестно'}</Text>
                                    </Tooltip>
                                </Td>
                                <Td>
                                    {new Date(tour.updatedAt).toLocaleDateString()}
                                </Td>
                                <Td textAlign="center">
                                   <ActionsMenu tour={tour} />
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
