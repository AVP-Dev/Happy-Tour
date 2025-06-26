import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import useSWR, { mutate } from 'swr';
import { useSession, signOut, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { FiMenu, FiX } from 'react-icons/fi';
import styles from '../../styles/Admin.module.css';

import Sidebar from '../../components/admin/Sidebar';

const TourManager = dynamic(() => import('../../components/admin/TourManager'));
const ReviewManager = dynamic(() => import('../../components/admin/ReviewManager'));
const NotificationModal = dynamic(() => import('../../components/admin/NotificationModal'));
const AdminUsersPage = dynamic(() => import('./users')); // Динамический импорт страницы управления админами

// Удален импорт Firebase db, так как он больше не используется.
// import { db } from '../lib/firebase'; 

const fetcher = async (url) => {
    const res = await fetch(url);
    if (!res.ok) {
        const error = new Error('An error occurred while fetching the data.');
        error.info = await res.json();
        error.status = res.status;
        throw error;
    }
    return res.json();
};

export default function AdminPage() {
    const { data: session, status } = useSession({ required: true });
    const router = useRouter();
    // activeTab теперь может быть 'tours', 'reviews' или 'users'
    const [activeTab, setActiveTab] = useState('tours'); 
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [notification, setNotification] = useState({ isOpen: false, type: 'info', message: '', isConfirm: false, onConfirm: () => {} });

    // Получаем данные для TourManager
    const { data: toursData, error: toursError } = useSWR('/api/admin/tours', fetcher);
    // Получаем данные для ReviewManager
    const { data: reviewsData, error: reviewsError } = useSWR('/api/admin/reviews', fetcher);
    
    // Группируем туры по категориям для TourManager
    const groupedTours = toursData?.reduce((acc, tour) => {
        acc[tour.category] = acc[tour.category] || [];
        acc[tour.category].push(tour);
        return acc;
    }, {});

    useEffect(() => {
        // Синхронизация статуса сайдбара с классом на body для предотвращения прокрутки
        if (isSidebarOpen) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
        return () => document.body.classList.remove('no-scroll');
    }, [isSidebarOpen]);

    /**
     * Показывает модальное окно уведомлений.
     * @param {string} message - Сообщение.
     * @param {'success' | 'error' | 'info'} type - Тип уведомления.
     * @param {boolean} isConfirm - Требуется ли подтверждение.
     * @param {function} onConfirm - Callback для подтверждения.
     */
    const showNotification = (message, type = 'info', isConfirm = false, onConfirm = () => {}) => {
        setNotification({ isOpen: true, message, type, isConfirm, onConfirm });
    };

    /**
     * Показывает модальное окно подтверждения.
     * @param {string} message - Сообщение подтверждения.
     * @param {function} onConfirm - Callback при подтверждении.
     */
    const showConfirm = (message, onConfirm) => {
        showNotification(message, 'info', true, onConfirm);
    };

    /**
     * Закрывает модальное окно уведомлений.
     */
    const closeNotification = () => {
        setNotification(prev => ({ ...prev, isOpen: false }));
    };

    /**
     * Запускает повторную загрузку данных для указанной вкладки.
     * @param {'tours' | 'reviews' | 'users'} tab - Вкладка, которую нужно обновить.
     */
    const handleDataChange = (tab) => {
        if (tab === 'tours') mutate('/api/admin/tours');
        if (tab === 'reviews') mutate('/api/admin/reviews');
        if (tab === 'users') mutate('/api/admin/users'); // ДОБАВЛЕНО
    };

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/admin/login' });
    };

    // Если сессия загружается
    if (status === 'loading') {
        return (
            <div className={styles.adminLayout}>
                <div className={styles.loadingPage}>
                    <p>Загрузка админ-панели...</p>
                </div>
            </div>
        );
    }

    // Если пользователь не аутентифицирован, перенаправляем на страницу логина
    if (status === 'unauthenticated') {
        router.push('/admin/login');
        return null;
    }

    return (
        <div className={styles.adminLayout}>
            {/* Sidebar передает role текущего пользователя */}
            <Sidebar 
                className={isSidebarOpen ? styles.sidebarOpen : ''}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                user={session?.user} // Передаем объект пользователя из сессии
                onLogout={handleLogout}
            />

            {isSidebarOpen && <div className={styles.pageOverlay} onClick={() => setSidebarOpen(false)} />}

            <div className={styles.mainContent}>
                <button onClick={() => setSidebarOpen(!isSidebarOpen)} className={styles.mobileMenuButton}>
                    {isSidebarOpen ? <FiX /> : <FiMenu />}
                </button>

                {/* Условный рендеринг менеджеров в зависимости от активной вкладки */}
                {activeTab === 'tours' && (
                    <TourManager 
                        tours={groupedTours}
                        onDataChange={() => handleDataChange('tours')} 
                        showNotification={showNotification} 
                        showConfirm={showConfirm}
                    />
                )}
                {activeTab === 'reviews' && (
                   <ReviewManager 
                        reviews={reviewsData}
                        onDataChange={() => handleDataChange('reviews')} 
                        showNotification={showNotification}
                        showConfirm={showConfirm}
                        handleUnauthorized={() => signOut({ callbackUrl: '/admin/login' })} // При 401 разлогиниваем
                    />
                )}
                {activeTab === 'users' && session?.user?.role === 'super_admin' && ( // Показываем только супер-админу
                    <AdminUsersPage 
                        showNotification={showNotification} 
                        showConfirm={showConfirm}
                        onDataChange={() => handleDataChange('users')} // Добавлено: для обновления списка админов
                        handleUnauthorized={() => signOut({ callbackUrl: '/admin/login' })}
                    />
                )}
            </div>

            {/* Модальное окно для уведомлений и подтверждений */}
            <NotificationModal 
                isOpen={notification.isOpen}
                message={notification.message}
                type={notification.type}
                isConfirm={notification.isConfirm}
                onConfirm={notification.onConfirm}
                onCancel={closeNotification}
            />
        </div>
    );
}

export async function getServerSideProps(context) {
    const session = await getSession(context);
    // Проверяем наличие сессии. Если нет, перенаправляем на страницу входа.
    if (!session) {
        return {
            redirect: { destination: '/admin/login', permanent: false },
        };
    }
    // Если сессия есть, но пользователь не супер-админ, и он пытается попасть на страницу users,
    // то можно перенаправить его на страницу туров или показать сообщение об ошибке доступа
    // Это будет обработано в клиентском коде AdminUsersPage
    return { props: { session } };
}
