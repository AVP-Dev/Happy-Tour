// components/admin/UserTable.js
import React from 'react';
import {
    Table, Thead, Tbody, Tr, Th, Td, TableContainer,
    Button, HStack, Text, Badge, IconButton, Box, VStack,
    Flex, useBreakpointValue, Divider, Heading
} from '@chakra-ui/react';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';

const UserTable = ({ users, onEdit, onDelete, isLoading, currentUser }) => {
    // Определяем, какой вид отображать: 'table' для десктопов, 'card' для мобильных
    const displayMode = useBreakpointValue({ base: 'card', md: 'table' });

    if (isLoading) {
        return <Text p={5} textAlign="center">Загрузка пользователей...</Text>;
    }

    if (!users || users.length === 0) {
        return <Text p={5} textAlign="center">Пользователи не найдены.</Text>;
    }

    // --- РЕНДЕРИНГ КАРТОЧЕК ДЛЯ МОБИЛЬНЫХ УСТРОЙСТВ ---
    if (displayMode === 'card') {
        return (
            <VStack spacing={4} align="stretch">
                {users.map((user) => {
                    const isCurrentUser = user.id === currentUser.id;
                    const canEdit = currentUser.role === 'super_admin';
                    const canDelete = currentUser.role === 'super_admin' && !isCurrentUser;

                    return (
                        <Box key={user.id} p={4} borderWidth="1px" borderRadius="lg" shadow="md" bg="white">
                            <VStack align="stretch" spacing={2}>
                                <Heading as="h3" size="sm" noOfLines={1}>
                                    {user.name || <Text as="span" color="gray.400">Имя не указано</Text>}
                                </Heading>
                                <Text fontSize="sm" color="gray.600">{user.email}</Text>
                            </VStack>
                            <Divider my={3} />
                            <VStack align="stretch" spacing={2} fontSize="sm">
                                <Flex justify="space-between">
                                    <Text fontWeight="bold">Роль:</Text>
                                    <Badge colorScheme={user.role === 'super_admin' ? 'red' : 'purple'}>
                                        {user.role}
                                    </Badge>
                                </Flex>
                                <Flex justify="space-between">
                                    <Text fontWeight="bold">Дата регистрации:</Text>
                                    <Text>{new Date(user.createdAt).toLocaleDateString()}</Text>
                                </Flex>
                            </VStack>
                            <Divider my={3} />
                            <HStack spacing={2} justify="flex-end">
                                <Button
                                    leftIcon={<FaPencilAlt />}
                                    size="sm"
                                    colorScheme="yellow"
                                    onClick={() => onEdit(user)}
                                    isDisabled={!canEdit}
                                >
                                    Редакт.
                                </Button>
                                <Button
                                    leftIcon={<FaTrash />}
                                    size="sm"
                                    colorScheme="red"
                                    onClick={() => onDelete(user.id)}
                                    isDisabled={!canDelete}
                                >
                                    Удалить
                                </Button>
                            </HStack>
                        </Box>
                    );
                })}
            </VStack>
        );
    }

    // --- РЕНДЕРИНГ ТАБЛИЦЫ ДЛЯ ПЛАНШЕТОВ И ДЕСКТОПОВ ---
    return (
        <TableContainer borderWidth="1px" borderRadius="lg" bg="white" shadow="md">
            <Table variant="simple" size="md">
                <Thead bg="gray.50">
                    <Tr>
                        <Th>Имя</Th>
                        <Th>Email</Th>
                        <Th>Роль</Th>
                        <Th>Дата регистрации</Th>
                        <Th isNumeric>Действия</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {users.map((user) => {
                        const isCurrentUser = user.id === currentUser.id;
                        const canEdit = currentUser.role === 'super_admin';
                        const canDelete = currentUser.role === 'super_admin' && !isCurrentUser;

                        return (
                            <Tr key={user.id}>
                                <Td fontWeight="medium">{user.name || <Text as="span" color="gray.400">Не указано</Text>}</Td>
                                <Td>{user.email}</Td>
                                <Td>
                                    <Badge colorScheme={user.role === 'super_admin' ? 'red' : 'purple'}>
                                        {user.role}
                                    </Badge>
                                </Td>
                                <Td>{new Date(user.createdAt).toLocaleDateString()}</Td>
                                <Td isNumeric>
                                    <HStack spacing={2} justify="flex-end">
                                        <IconButton
                                            icon={<FaPencilAlt />}
                                            size="sm"
                                            colorScheme="yellow"
                                            aria-label="Редактировать пользователя"
                                            onClick={() => onEdit(user)}
                                            isDisabled={!canEdit}
                                        />
                                        <IconButton
                                            icon={<FaTrash />}
                                            size="sm"
                                            colorScheme="red"
                                            aria-label="Удалить пользователя"
                                            onClick={() => onDelete(user.id)}
                                            isDisabled={!canDelete}
                                        />
                                    </HStack>
                                </Td>
                            </Tr>
                        );
                    })}
                </Tbody>
            </Table>
        </TableContainer>
    );
};

export default UserTable;
