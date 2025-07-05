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

        // --- ИСПРАВЛЕНО: Проверяем, что роль пользователя 'admin' или 'super_admin' ---
        if (status === 'authenticated') {
            const userRole = session?.user?.role;
            if (!['admin', 'super_admin'].includes(userRole)) {
                router.replace('/'); // Если роль не подходит, перенаправляем на главную
            } else {
                fetchReviews(); // Если все в порядке, загружаем отзывы
            }
        }
    }, [session, status, router]);

    // Функция для получения списка отзывов с сервера.
    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/admin/reviews');
            if (!response.ok) {
                throw new Error('Не удалось получить отзывы');
            }
            const data = await response.json();
            setReviews(data);
        } catch (error) {
            console.error('Ошибка при получении отзывов:', error);
            toast({
                title: 'Ошибка.',
                description: 'Не удалось загрузить отзывы.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Обработчик обновления статуса отзыва.
    const handleUpdateReviewStatus = async (reviewId, newStatus) => {
        // ... (остальной код без изменений)
    };

    // Обработчик удаления отзыва.
    const handleDeleteReview = async (reviewId) => {
        // ... (остальной код без изменений)
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
                <Box>
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
