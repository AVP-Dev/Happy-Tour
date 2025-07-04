// pages/admin/tours.js
import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Heading, Button, useDisclosure, Modal, ModalOverlay,
    ModalContent, ModalHeader, ModalBody, ModalCloseButton, useToast,
    Spinner, Flex, InputGroup, Input, Select, HStack
} from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { FaPlus } from 'react-icons/fa';
import AdminLayout from '../../components/admin/AdminLayout';
import TourForm from '../../components/admin/TourForm';
import TourTable from '../../components/admin/TourTable';

const AdminToursPage = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    const [tours, setTours] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingTour, setEditingTour] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    useEffect(() => {
        if (status === 'loading') return;
        if (status === 'unauthenticated') {
            router.replace('/admin/login');
        } else if (status === 'authenticated') {
            const allowedRoles = ['admin', 'super_admin'];
            if (!session?.user?.role || !allowedRoles.includes(session.user.role)) {
                toast({ title: "Доступ запрещен", status: "error", duration: 3000, isClosable: true });
                router.replace('/');
            } else {
                fetchTours();
            }
        }
    }, [session, status, router, toast]);

    const fetchTours = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/admin/tours');
            if (!response.ok) throw new Error('Не удалось загрузить туры');
            const data = await response.json();
            setTours(data);
        } catch (error) {
            toast({ title: 'Ошибка загрузки', description: error.message, status: 'error', duration: 5000, isClosable: true });
        } finally {
            setIsLoading(false);
        }
    };

    const filteredTours = useMemo(() => {
        return tours
            .filter(tour => filterCategory === 'all' || tour.category === filterCategory)
            .filter(tour => tour.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [tours, filterCategory, searchQuery]);

    const handleAddClick = () => {
        setEditingTour(null);
        onOpen();
    };

    const handleEditClick = (tour) => {
        setEditingTour(tour);
        onOpen();
    };

    const handleSubmit = async (formData) => {
        setIsSubmitting(true);
        try {
            const method = editingTour ? 'PUT' : 'POST';
            const response = await fetch('/api/admin/tours', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка при сохранении тура');
            }
            toast({ title: `Тур успешно ${editingTour ? 'обновлен' : 'создан'}`, status: 'success' });
            onClose();
            fetchTours();
        } catch (error) {
            toast({ title: 'Ошибка сохранения', description: error.message, status: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (tourId) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот тур? Это действие необратимо.')) return;
        try {
            const response = await fetch(`/api/admin/tours?id=${tourId}`, { method: 'DELETE' });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка при удалении');
            }
            toast({ title: 'Тур удален', status: 'success' });
            fetchTours();
        } catch (error) {
            toast({ title: 'Ошибка удаления', description: error.message, status: 'error' });
        }
    };

    const handleTogglePublished = async (tourId, newStatus) => {
        setTours(currentTours =>
            currentTours.map(t => (t.id === tourId ? { ...t, published: newStatus } : t))
        );

        try {
            const response = await fetch('/api/admin/tours', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: tourId, published: newStatus }),
            });

            if (!response.ok) {
                setTours(currentTours =>
                    currentTours.map(t => (t.id === tourId ? { ...t, published: !newStatus } : t))
                );
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка при смене статуса');
            }
            
            toast({
                title: `Статус тура обновлен`,
                description: `Тур теперь ${newStatus ? 'опубликован' : 'скрыт'}.`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            toast({ title: 'Ошибка', description: error.message, status: 'error' });
        }
    };

    if (status === 'loading' || (isLoading && tours.length === 0)) {
        return (
            <AdminLayout>
                <Flex justify="center" align="center" h="50vh"><Spinner size="xl" /></Flex>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <Box p={{ base: 4, md: 6 }}>
                <Flex
                    direction={{ base: 'column', md: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ base: 'stretch', md: 'center' }}
                    mb={6}
                    gap={4}
                >
                    <Heading as="h1" size="lg">Управление турами</Heading>
                    <Button leftIcon={<FaPlus />} colorScheme="green" onClick={handleAddClick} w={{ base: 'full', md: 'auto' }}>
                        Добавить тур
                    </Button>
                </Flex>

                <HStack mb={6} spacing={4} direction={{ base: 'column', md: 'row' }} w="full" alignItems="stretch">
                    <InputGroup flex={1}>
                        <Input placeholder="Поиск по названию..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </InputGroup>
                    <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} maxW={{ base: 'full', md: '250px' }}>
                        <option value="all">Все категории</option>
                        <option value="hot">Горящие</option>
                        <option value="popular">Популярные</option>
                        {/* --- ИЗМЕНЕНИЕ: Название категории изменено --- */}
                        <option value="special">Выгодные</option>
                    </Select>
                </HStack>
                
                {isLoading ? (
                     <Flex justify="center" align="center" h="20vh"><Spinner size="lg" /></Flex>
                ) : (
                    <TourTable
                        tours={filteredTours}
                        onEdit={handleEditClick}
                        onDelete={handleDelete}
                        onTogglePublished={handleTogglePublished}
                    />
                )}

                <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>{editingTour ? 'Редактировать тур' : 'Создать новый тур'}</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody pb={6}>
                            <TourForm
                                key={editingTour?.id || 'new-tour'}
                                initialData={editingTour}
                                onSubmit={handleSubmit}
                                isSubmitting={isSubmitting}
                                onCancel={onClose}
                            />
                        </ModalBody>
                    </ModalContent>
                </Modal>
            </Box>
        </AdminLayout>
    );
};

export default AdminToursPage;
