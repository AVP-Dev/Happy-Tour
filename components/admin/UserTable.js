// components/admin/UserTable.js
import React from 'react';
import {
    Table, Thead, Tbody, Tr, Th, Td, TableContainer,
    HStack, Text, Badge, IconButton, Box, Tooltip
} from '@chakra-ui/react';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';

const UserTable = ({ users, onEdit, onDelete, isLoading, currentUser }) => {

    if (isLoading) {
        return <Text p={5} textAlign="center">Загрузка пользователей...</Text>;
    }

    if (!users || users.length === 0) {
        return <Text p={5} textAlign="center">Пользователи не найдены.</Text>;
    }

    return (
        <Box bg="white" rounded="lg" shadow="md" overflow="hidden">
            <TableContainer>
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
                            const isCurrentUser = user.id === currentUser?.id;
                            // Редактировать и удалять может только super_admin
                            const canManage = currentUser?.role === 'super_admin';
                            // Удалять себя нельзя
                            const canDelete = canManage && !isCurrentUser;

                            return (
                                <Tr key={user.id} _hover={{ bg: 'gray.50' }}>
                                    <Td fontWeight="medium">{user.name || <Text as="span" color="gray.400">Не указано</Text>}</Td>
                                    <Td>{user.email}</Td>
                                    <Td>
                                        <Badge colorScheme={user.role === 'super_admin' ? 'purple' : 'green'}>
                                            {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                                        </Badge>
                                    </Td>
                                    <Td>{new Date(user.createdAt).toLocaleDateString()}</Td>
                                    <Td isNumeric>
                                        <HStack spacing={2} justify="flex-end">
                                            <Tooltip label="Редактировать" hasArrow>
                                                <IconButton
                                                    icon={<FaPencilAlt />}
                                                    size="sm"
                                                    variant="ghost"
                                                    colorScheme="blue"
                                                    aria-label="Редактировать пользователя"
                                                    onClick={() => onEdit(user)}
                                                    isDisabled={!canManage}
                                                />
                                            </Tooltip>
                                            <Tooltip label={isCurrentUser ? "Нельзя удалить себя" : "Удалить"} hasArrow>
                                                <IconButton
                                                    icon={<FaTrash />}
                                                    size="sm"
                                                    variant="ghost"
                                                    colorScheme="red"
                                                    aria-label="Удалить пользователя"
                                                    onClick={() => onDelete(user.id)}
                                                    isDisabled={!canDelete}
                                                />
                                            </Tooltip>
                                        </HStack>
                                    </Td>
                                </Tr>
                            );
                        })}
                    </Tbody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default UserTable;
