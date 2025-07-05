// pages/admin/reviews.js
import React, { useState, useEffect } from 'react';
import { Box, Heading, useToast, Spinner, Flex } from '@chakra-ui/react';
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

    useEffect(() => {
        if (status === 'loading') return;
        if (status === 'unauthenticated') {
            router.replace('/admin/login');
            return;
        }
        if (session && !['admin', 'super_admin'].includes(session.user.role)) {
            router.replace('/');
        } else {
            fetchReviews();
        }
    }, [session, status, router]);

    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/admin/reviews');
            if (!response.ok) throw new Error('Не удалось получить отзывы');
            const data = await response.json();
            setReviews(data);
        } catch (error) {
            toast({ title: 'Ошибка.', description: error.message, status: 'error', duration: 5000, isClosable: true });
        } finally {
            setIsLoading(false);
        }
    };

    // ИЗМЕНЕНИЕ: Реализована логика обновления статуса
    const handleUpdateReviewStatus = async (reviewId, newStatus) => {
        try {
            const response = await fetch('/api/admin/reviews', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: reviewId, status: newStatus }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Не удалось обновить статус');
            }
            
            // Обновляем состояние локально для мгновенного отклика UI
            setReviews(prevReviews =>
                prevReviews.map(review =>
                    review.id === reviewId ? { ...review, status: newStatus } : review
                )
            );

            toast({ title: 'Статус обновлен!', status: 'success', duration: 3000, isClosable: true });
        } catch (error) {
            toast({ title: 'Ошибка.', description: error.message, status: 'error', duration: 5000, isClosable: true });
        }
    };

    // ИЗМЕНЕНИЕ: Реализована логика удаления
    const handleDeleteReview = async (reviewId) => {
        try {
            const response = await fetch('/api/admin/reviews', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: reviewId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Не удалось удалить отзыв');
            }
            
            // Удаляем отзыв из локального состояния
            setReviews(prevReviews => prevReviews.filter(review => review.id !== reviewId));
            
            toast({ title: 'Отзыв удален.', status: 'success', duration: 3000, isClosable: true });
        } catch (error) {
            toast({ title: 'Ошибка.', description: error.message, status: 'error', duration: 5000, isClosable: true });
        }
    };

    if (status === 'loading' || isLoading) {
        return (
            <AdminLayout>
                <Flex justify="center" align="center" minH="50vh">
                    <Spinner size="xl" color="brand.500" />
                </Flex>
            </AdminLayout>
        );
    }
    
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

    return null;
};

export default AdminReviewsPage;
