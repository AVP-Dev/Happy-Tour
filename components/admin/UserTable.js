// components/admin/UserTable.js
import React from 'react';
import {
    Table, Thead, Tbody, Tr, Th, Td, TableContainer,
    HStack, Text, Badge, IconButton, Box, Tooltip,
    useBreakpointValue, VStack, Flex, Divider
} from '@chakra-ui/react';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';

const UserTable = ({ users, onEdit, onDelete, isLoading, currentUser }) => {
    // Определяем, является ли текущее разрешение мобильным (до 'md').
    const isMobile = useBreakpointValue({ base: true, md: false });

    if (isLoading) {
        return <Text p={5} textAlign="center">Загрузка пользователей...</Text>;
    }

    if (!users || users.length === 0) {
        return <Text p={5} textAlign="center">Пользователи не найдены.</Text>;
    }

    // Если мобильное устройство, рендерим список карточек.
    if (isMobile) {
        return (
            <VStack spacing={4} align="stretch" w="100%">
                {users.map((user) => {
                    const isCurrentUser = user.id === currentUser?.id;
                    const canManage = currentUser?.role === 'super_admin';
                    const canDelete = canManage && !isCurrentUser;

                    return (
                        <Box
                            key={user.id}
                            p={4}
                            shadow="md"
                            borderWidth="1px"
                            borderRadius="lg"
                            bg="white"
                            _dark={{ bg: 'gray.700', borderColor: 'gray.600' }}
                        >
                            <VStack align="stretch" spacing={3}>
                                <Flex justify="space-between">
                                    <Text fontWeight="bold">Имя:</Text>
                                    <Text noOfLines={1} title={user.name || 'Не указано'}>{user.name || <Text as="span" color="gray.400">Не указано</Text>}</Text>
                                </Flex>
                                <Flex justify="space-between">
                                    <Text fontWeight="bold">Email:</Text>
                                    <Text noOfLines={1} title={user.email}>{user.email}</Text>
                                </Flex>
                                <Flex justify="space-between" align="center">
                                    <Text fontWeight="bold">Роль:</Text>
                                    <Badge colorScheme={user.role === 'super_admin' ? 'purple' : 'green'}>
                                        {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                                    </Badge>
                                </Flex>
                                <Flex justify="space-between">
                                    <Text fontWeight="bold">Дата рег.:</Text>
                                    <Text>{new Date(user.createdAt).toLocaleDateString()}</Text>
                                </Flex>
                                <Divider pt={2} />
                                <HStack pt={2} justify="flex-end" spacing={3}>
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
                            </VStack>
                        </Box>
                    );
                })}
            </VStack>
        );
    }

    // Если десктоп, рендерим таблицу.
    return (
        <Box bg="white" _dark={{ bg: 'gray.800' }} rounded="lg" shadow="md" overflow="hidden">
            <TableContainer>
                <Table variant="simple" size="md">
                    <Thead bg="gray.50" _dark={{ bg: 'gray.700' }}>
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
                            const canManage = currentUser?.role === 'super_admin';
                            const canDelete = canManage && !isCurrentUser;

                            return (
                                <Tr key={user.id} _hover={{ bg: 'gray.50', _dark: { bg: 'gray.600' } }}>
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
