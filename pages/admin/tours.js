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
import useSWR, { mutate } from 'swr'; // Импортируем useSWR и mutate

// Единый fetcher для SWR, который корректно обрабатывает ошибки API и включает куки
const fetcher = async (url, options) => {
    const defaultOptions = {
        ...options,
        credentials: 'include', // Важно для отправки куки сессии
    };

    const res = await fetch(url, defaultOptions);

    if (!res.ok) {
        const errorPayload = await res.json().catch(() => {
            return { error: `Сервер ответил со статусом ${res.status}, но без деталей.` };
        });
        const error = new Error(errorPayload.error);
        throw error;
    }
    return res.json();
};

const AdminToursPage = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    // Переходим на useSWR для управления данными туров
    const { data: tours, error, isLoading: isSWRLoading, isValidating } = useSWR('/api/admin/tours', fetcher, {
        revalidateOnFocus: false, // Отключаем перевалидацию при фокусе окна
        revalidateOnReconnect: false, // Отключаем перевалидацию при восстановлении соединения
        // dedupingInterval: 2000, // Опционально: интервал дедупликации запросов (по умолчанию 2000мс)
    });

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
            }
            // fetchTours() больше не нужен здесь, useSWR сделает это автоматически
        }
    }, [session, status, router, toast]);

    // Фильтрация туров - остается без изменений, работает с данными из SWR
    const filteredTours = useMemo(() => {
        if (!tours) return []; // Убедимся, что tours не null/undefined
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
            const response = await fetcher('/api/admin/tours', { // Используем fetcher
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            
            // После успешного сохранения, обновляем кеш SWR
            mutate('/api/admin/tours'); 
            
            toast({ title: `Тур успешно ${editingTour ? 'обновлен' : 'создан'}`, status: 'success' });
            onClose();
            // fetchTours() заменен на mutate
        } catch (error) {
            toast({ title: 'Ошибка сохранения', description: error.message, status: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (tourId) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот тур? Это действие необратимо.')) return;
        try {
            const response = await fetcher(`/api/admin/tours?id=${tourId}`, { method: 'DELETE' }); // Используем fetcher
            
            // После успешного удаления, обновляем кеш SWR
            mutate('/api/admin/tours'); 

            toast({ title: 'Тур удален', status: 'success' });
            // fetchTours() заменен на mutate
        } catch (error) {
            toast({ title: 'Ошибка удаления', description: error.message, status: 'error' });
        }
    };

    const handleTogglePublished = async (tourId, newStatus) => {
        // Оптимистичное обновление UI
        mutate('/api/admin/tours', 
            tours.map(t => (t.id === tourId ? { ...t, published: newStatus } : t)), 
            false // Не перевалидировать сразу
        );

        try {
            const response = await fetcher('/api/admin/tours', { // Используем fetcher
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: tourId, published: newStatus }),
            });

            if (!response.ok) {
                // В случае ошибки, откатываем оптимистичное обновление
                mutate('/api/admin/tours'); 
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка при смене статуса');
            }
            
            // Если успешно, перевалидируем кеш SWR для подтверждения
            mutate('/api/admin/tours');

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

    // Используем isSWRLoading для индикации загрузки данных через SWR
    const isLoadingData = isSWRLoading && !tours && !error;

    if (status === 'loading' || isLoadingData) {
        return (
            <AdminLayout>
                <Flex justify="center" align="center" h="50vh"><Spinner size="xl" /></Flex>
            </AdminLayout>
        );
    }

    // Если есть ошибка загрузки данных
    if (error && !tours) {
        return (
            <AdminLayout>
                <Alert status="error" borderRadius="md" m={4}>
                    <AlertIcon />
                    <Box>
                        <Text fontWeight="bold">Не удалось загрузить туры.</Text>
                        <Text>Причина: {error.message}</Text>
                    </Box>
                </Alert>
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
                        <option value="special">Выгодные</option>
                    </Select>
                </HStack>
                
                {/* Индикатор загрузки только если данные еще не загружены или идет перевалидация */}
                {(isSWRLoading && !tours) || isValidating ? (
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
