// pages/admin/users.js
import React, { useState, useEffect } from 'react';
import {
    Box, Heading, Button, useDisclosure, Modal, ModalOverlay,
    ModalContent, ModalHeader, ModalBody, ModalCloseButton, useToast,
    Spinner, Flex, AlertDialog, AlertDialogBody,
    AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay,
} from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { FaPlus } from 'react-icons/fa';
import AdminLayout from '../../components/admin/AdminLayout';
import UserTable from '../../components/admin/UserTable';
import UserForm from '../../components/admin/UserForm';

const AdminUsersPage = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
    const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
    const toast = useToast();
    const cancelRef = React.useRef();

    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [deletingUserId, setDeletingUserId] = useState(null);

    useEffect(() => {
        if (status === 'loading') return;
        if (status === 'unauthenticated') {
            router.replace('/admin/login');
            return;
        }
        if (status === 'authenticated') {
            const userRole = session?.user?.role;
            if (!['admin', 'super_admin'].includes(userRole)) {
                router.replace('/');
            } else {
                fetchUsers();
            }
        }
    }, [session, status, router]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/users');
            if (!res.ok) throw new Error('Ошибка загрузки пользователей');
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            toast({ title: "Ошибка", description: error.message, status: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateClick = () => {
        setEditingUser(null);
        onFormOpen();
    };

    const handleEditClick = (user) => {
        setEditingUser(user);
        onFormOpen();
    };

    const handleCloseModal = () => {
        setEditingUser(null);
        onFormClose();
    };

    const handleSubmit = async (formData) => {
        setIsSubmitting(true);
        const method = editingUser ? 'PUT' : 'POST';
        const url = '/api/admin/users';
        const body = editingUser ? { ...formData, id: editingUser.id } : formData;
        
        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Произошла ошибка');
            
            toast({
                title: `Пользователь успешно ${editingUser ? 'обновлен' : 'создан'}.`,
                status: 'success',
            });
            fetchUsers();
            handleCloseModal();

        } catch (error) {
            toast({ title: "Ошибка", description: error.message, status: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (userId) => {
        setDeletingUserId(userId);
        onAlertOpen();
    };

    const confirmDelete = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/admin/users?id=${deletingUserId}`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Ошибка удаления');
            }
            toast({ title: "Пользователь удален", status: 'success' });
            fetchUsers();
        } catch (error) {
            toast({ title: "Ошибка", description: error.message, status: 'error' });
        } finally {
            setIsSubmitting(false);
            onAlertClose();
            setDeletingUserId(null);
        }
    };
    
    if (status === 'loading' || (status === 'authenticated' && isLoading)) {
        return <AdminLayout><Flex justify="center" align="center" minH="80vh"><Spinner size="xl" /></Flex></AdminLayout>;
    }
    
    if (status !== 'authenticated' || !['admin', 'super_admin'].includes(session?.user?.role)) {
        return <AdminLayout><Box p={6}><Heading size="lg">Доступ запрещен</Heading></Box></AdminLayout>;
    }

    return (
        <AdminLayout>
            <Box p={{ base: 4, md: 6 }}>
                {/* --- ИЗМЕНЕНИЕ: Адаптивный заголовок и кнопка --- */}
                <Flex
                    direction={{ base: 'column', md: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ base: 'stretch', md: 'center' }}
                    mb={6}
                    gap={4}
                >
                    <Heading as="h1" size="lg">Управление пользователями</Heading>
                    {session.user.role === 'super_admin' && (
                        <Button
                            leftIcon={<FaPlus />}
                            colorScheme="green"
                            onClick={handleCreateClick}
                            w={{ base: 'full', md: 'auto' }} // Кнопка на всю ширину на мобильных
                        >
                            Создать пользователя
                        </Button>
                    )}
                </Flex>

                <UserTable
                    users={users}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    currentUser={session.user}
                    isLoading={isLoading}
                />
            </Box>

            <Modal isOpen={isFormOpen} onClose={handleCloseModal} size="xl" isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{editingUser ? 'Редактировать пользователя' : 'Создать пользователя'}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <UserForm
                            key={editingUser?.id || 'new-user'}
                            initialData={editingUser || {}}
                            onSubmit={handleSubmit}
                            isSubmitting={isSubmitting}
                            onCancel={handleCloseModal}
                        />
                    </ModalBody>
                </ModalContent>
            </Modal>

            <AlertDialog
                isOpen={isAlertOpen}
                leastDestructiveRef={cancelRef}
                onClose={onAlertClose}
                isCentered
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Удалить пользователя
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            Вы уверены? Это действие нельзя будет отменить.
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onAlertClose}>
                                Отмена
                            </Button>
                            <Button colorScheme="red" onClick={confirmDelete} ml={3} isLoading={isSubmitting}>
                                Удалить
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </AdminLayout>
    );
};

export default AdminUsersPage;
