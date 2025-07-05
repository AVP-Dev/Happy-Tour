// Happy-Tour-main/pages/admin/reviews.js
// Страница управления отзывами в административной панели.

import React, { useState, useEffect } from 'react';
import {
    Box,
    Heading,
    useToast,
    Spinner,
    Flex
} from '@chakra-ui/react';
import AdminLayout from '../../components/admin/AdminLayout';
import ReviewTable from '../../components/admin/ReviewTable';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

const AdminReviewsPage = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const toast = useToast();

    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Эффект для загрузки отзывов и защиты маршрута.
    useEffect(() => {
        if (status === 'loading') return; // Ничего не делаем, пока сессия загружается

        if (status === 'unauthenticated') {
            router.replace('/admin/login'); // Если не авторизован, на страницу входа
            return;
        }

        if (status === 'authenticated') {
            const userRole = session?.user?.role;
            if (!['admin', 'super_admin'].includes(userRole)) {
                toast({ title: "Доступ запрещен", status: "error", duration: 3000, isClosable: true });
                router.replace('/'); // Если роль не подходит, перенаправляем на главную
            } else {
                fetchReviews(); // Если все в порядке, загружаем отзывы
            }
        }
    }, [session, status, router, toast]); // Добавил toast в зависимости

    // Функция для получения списка отзывов с сервера.
    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/admin/reviews');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Не удалось получить отзывы');
            }
            const data = await response.json();
            setReviews(data);
        } catch (error) {
            console.error('Ошибка при получении отзывов:', error);
            toast({
                title: 'Ошибка загрузки.',
                description: error.message || 'Не удалось загрузить отзывы.',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'top-right',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Обработчик обновления статуса отзыва.
    const handleUpdateReviewStatus = async (reviewId, newStatus) => {
        // Оптимистичное обновление UI
        setReviews(currentReviews =>
            currentReviews.map(review =>
                review.id === reviewId ? { ...review, status: newStatus } : review
            )
        );

        try {
            const response = await fetch('/api/admin/reviews', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: reviewId, status: newStatus }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                // Откат UI в случае ошибки
                setReviews(currentReviews =>
                    currentReviews.map(review =>
                        review.id === reviewId ? { ...review, status: review.status } : review // Возвращаем старый статус
                    )
                );
                throw new Error(errorData.message || 'Ошибка при обновлении статуса отзыва.');
            }
            toast({
                title: 'Статус отзыва обновлен.',
                status: 'success',
                duration: 3000,
                isClosable: true,
                position: 'top-right',
            });
        } catch (error) {
            console.error('Ошибка при обновлении статуса отзыва:', error);
            toast({
                title: 'Ошибка.',
                description: error.message || 'Не удалось обновить статус отзыва.',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'top-right',
            });
            // Повторная загрузка данных, чтобы гарантировать актуальное состояние
            fetchReviews();
        }
    };

    // Обработчик удаления отзыва.
    const handleDeleteReview = async (reviewId) => {
        try {
            const response = await fetch(`/api/admin/reviews?id=${reviewId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка при удалении отзыва.');
            }
            toast({
                title: 'Отзыв удален.',
                status: 'success',
                duration: 3000,
                isClosable: true,
                position: 'top-right',
            });
            fetchReviews(); // Повторная загрузка отзывов после удаления
        } catch (error) {
            console.error('Ошибка при удалении отзыва:', error);
            toast({
                title: 'Ошибка.',
                description: error.message || 'Не удалось удалить отзыв.',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'top-right',
            });
        }
    };

    // Отображаем спиннер во время загрузки сессии.
    if (status === 'loading') {
        return (
            <Flex justify="center" align="center" minH="100vh">
                <Spinner size="xl" color="green.500" />
            </Flex>
        );
    }
    
    // Рендерим страницу только если пользователь авторизован и имеет нужную роль.
    if (status === 'authenticated' && ['admin', 'super_admin'].includes(session?.user?.role)) {
        return (
            <AdminLayout>
                <Box p={{ base: 4, md: 6 }}> {/* Добавлены адаптивные отступы */}
                    <Heading as="h1" size="xl" mb={6}>Управление отзывами</Heading>
                    <ReviewTable
                        reviews={reviews}
                        onUpdateStatus={handleUpdateReviewStatus}
                        onDelete={handleDeleteReview}
                        isLoading={isLoading}
                    />
                </Box>
            </AdminLayout>
        );
    }

    // В противном случае ничего не рендерим (так как уже произошло перенаправление).
    return null;
};

export default AdminReviewsPage;
