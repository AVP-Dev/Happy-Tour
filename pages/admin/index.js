// pages/admin/index.js
import React from 'react';
import {
    Box,
    Heading,
    Text,
    Flex,
    Spinner,
    SimpleGrid,
    Button,
    HStack,
} from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import AdminLayout from '../../components/admin/AdminLayout';
import StatCard from '../../components/admin/StatCard';
import { FaPlane, FaStar, FaClock, FaCheckCircle, FaPlus } from 'react-icons/fa';

const fetcher = (url) => fetch(url).then((res) => res.json());

const AdminDashboardPage = () => {
    const { data: session, status } = useSession();
    const router = useRouter();

    const { data: stats, error } = useSWR('/api/admin/stats', fetcher);

    React.useEffect(() => {
        if (status === 'loading') return;

        if (status === 'unauthenticated') {
            router.replace('/admin/login');
        } else if (status === 'authenticated') {
            const allowedRoles = ['admin', 'super_admin'];
            if (!session?.user?.role || !allowedRoles.includes(session.user.role)) {
                // router.replace('/'); 
            }
        }
    }, [session, status, router]);

    if (status === 'loading' || (!stats && !error)) {
        return (
            <AdminLayout>
                <Flex justify="center" align="center" minH="80vh">
                    <Spinner size="xl" color="green.500" />
                </Flex>
            </AdminLayout>
        );
    }

    const allowedRoles = ['admin', 'super_admin'];
    if (!session || !session.user?.role || !allowedRoles.includes(session.user.role)) {
         return (
            <AdminLayout>
                <Heading as="h1" size="xl" mb={2}>Доступ запрещен</Heading>
                <Text>У вас нет прав для просмотра этой страницы.</Text>
            </AdminLayout>
        );
    }

    // --- ИЗМЕНЕНИЕ: Эта логика правильная. Если имени нет, используется email. ---
    // Проблема, скорее всего, не в коде, а в старой сессии или данных в БД.
    const welcomeName = session.user.name || session.user.email;

    return (
        <AdminLayout>
            <Box>
                <Heading as="h1" size="xl" mb={2}>
                    Добро пожаловать, {welcomeName}!
                </Heading>
                <Text fontSize="lg" color="gray.600" mb={8}>
                    Обзор текущей ситуации на вашем сайте.
                </Text>

                <Heading as="h2" size="lg" mb={4}>Статистика</Heading>
                {error && <Text color="red.500">Не удалось загрузить статистику.</Text>}
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{ base: 5, lg: 8 }} mb={10}>
                    <StatCard
                        title="Всего туров"
                        stat={stats?.totalTours ?? '...'}
                        icon={FaPlane}
                        bgColor="blue.50"
                        iconColor="blue.500"
                    />
                    <StatCard
                        title="Отзывов на модерации"
                        stat={stats?.reviews?.pending ?? '...'}
                        icon={FaClock}
                        bgColor="yellow.50"
                        iconColor="yellow.500"
                    />
                    <StatCard
                        title="Опубликованных отзывов"
                        stat={stats?.reviews?.published ?? '...'}
                        icon={FaCheckCircle}
                        bgColor="green.50"
                        iconColor="green.500"
                    />
                </SimpleGrid>

                 <Heading as="h2" size="lg" mb={4}>Быстрые действия</Heading>
                 <HStack spacing={4}>
                    <Button
                        leftIcon={<FaPlus />}
                        colorScheme="green"
                        onClick={() => router.push('/admin/tours')}
                    >
                        Добавить тур
                    </Button>
                    <Button
                        leftIcon={<FaStar />}
                        colorScheme="yellow"
                        onClick={() => router.push('/admin/reviews')}
                    >
                        Модерация отзывов
                    </Button>
                 </HStack>
            </Box>
        </AdminLayout>
    );
};

export default AdminDashboardPage;
