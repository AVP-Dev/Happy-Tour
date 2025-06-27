import React, { useState, useEffect } from 'react';
// УДАЛЕНО: import dynamic from 'next/dynamic'; // Больше не нужен для прямых импортов
import useSWR, { mutate } from 'swr';
import { useSession, signOut, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
// ИСПРАВЛЕНИЕ: Добавлен импорт всех необходимых иконок
import { FiMenu, FiX, FiPlus, FiAlertCircle, FiCheck, FiTrash2, FiEdit, FiSlash } from 'react-icons/fi'; 
import styles from '../../styles/Admin.module.css'; 

import Sidebar from '../../components/admin/Sidebar';

// ИЗМЕНЕНИЕ ЗДЕСЬ: Прямой импорт компонентов вместо dynamic
import TourManager from '../../components/admin/TourManager';
import ReviewManager from '../../components/admin/ReviewManager';
import NotificationModal from '../../components/admin/NotificationModal';
import AdminUsersPage from './users'; 

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
    const [activeTab, setActiveTab] = useState('tours'); 
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [notification, setNotification] = useState({ isOpen: false, type: 'info', message: '', isConfirm: false, onConfirm: () => {} });

    // SWR для данных туров
    const { data: toursData, error: toursError, isLoading: toursLoading } = useSWR('/api/admin/tours', fetcher);
    // SWR для данных отзывов
    const { data: reviewsData, error: reviewsError, isLoading: reviewsLoading } = useSWR('/api/admin/reviews', fetcher);
    // SWR для данных пользователей (админов) - будет загружаться только для super_admin
    const { data: adminUsersData, error: adminUsersError, isLoading: adminUsersLoading } = useSWR(
        activeTab === 'users' && session?.user?.role === 'super_admin' ? '/api/admin/users' : null, 
        fetcher
    );

    // Функция для показа уведомлений
    const showNotification = (message, type = 'info', isConfirm = false, onConfirm = () => {}) => {
        setNotification({ isOpen: true, message, type, isConfirm, onConfirm });
    };

    // Функция для показа подтверждения (использует showNotification с isConfirm)
    const showConfirm = (message, onConfirmCallback) => {
        showNotification(message, 'info', true, onConfirmCallback);
    };

    // Функция для закрытия уведомлений
    const closeNotification = () => {
        setNotification(prev => ({ ...prev, isOpen: false }));
    };

    // Функция для обновления данных после изменений
    const handleDataChange = (dataType) => {
        if (dataType === 'tours') {
            mutate('/api/admin/tours');
        } else if (dataType === 'reviews') {
            mutate('/api/admin/reviews');
        } else if (dataType === 'users') {
            mutate('/api/admin/users');
        }
    };

    // Обработчик для Unauthorized ошибок
    const handleUnauthorized = () => {
        showNotification('Сессия истекла или у вас нет прав доступа. Пожалуйста, войдите снова.', 'error', false, () => {
            signOut({ callbackUrl: '/admin/login' });
        });
    };

    // Проверка статуса сессии
    if (status === 'loading') {
        return (
            <div className={styles.adminLayout}>
                <div className={styles.loadingPage}>
                    <FiAlertCircle size={50} className={styles.loadingIcon} />
                    <p>Загрузка сессии...</p>
                </div>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        router.push('/admin/login');
        return null;
    }

    // Удаление файла setup-first-admin.js (после того как админ создан и вход работает)
    useEffect(() => {
        // Этот код не будет выполняться на клиенте, но служит напоминанием
        // IF (process.env.NODE_ENV === 'production') {
        //     // Запустите команду удаления файла на вашем сервере
        //     // Например, через SSH: `rm /path/to/your/project/pages/api/setup-first-admin.js`
        // }
    }, []);

    return (
        <div className={styles.adminLayout}>
            <Sidebar 
                className={isSidebarOpen ? styles.sidebarOpen : ''}
                activeTab={activeTab} 
                setActiveTab={setActiveTab}
                user={session?.user}
                onLogout={() => signOut({ callbackUrl: '/admin/login' })}
            />
            {isSidebarOpen && <div className={styles.pageOverlay} onClick={() => setSidebarOpen(false)}></div>}

            <div className={styles.mainContent}>
                <div className={styles.contentHeader}>
                    {/* Кнопка для открытия/закрытия сайдбара на мобильных */}
                    <button 
                        className={styles.mobileMenuButton} 
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        aria-label={isSidebarOpen ? "Закрыть меню" : "Открыть меню"}
                    >
                        {isSidebarOpen ? <FiX /> : <FiMenu />}
                    </button>
                    <h1>{
                        activeTab === 'tours' ? 'Управление турами' :
                        activeTab === 'reviews' ? 'Управление отзывами' :
                        activeTab === 'users' ? 'Управление администраторами' : ''
                    }</h1>
                </div>
                
                {activeTab === 'tours' && (
                    <TourManager 
                        tours={toursData}
                        isLoading={toursLoading} 
                        onDataChange={() => handleDataChange('tours')} 
                        showNotification={showNotification}
                        showConfirm={showConfirm}
                        handleUnauthorized={handleUnauthorized}
                    />
                )}
                {activeTab === 'reviews' && (
                   <ReviewManager 
                        reviews={reviewsData}
                        isLoading={reviewsLoading}
                        onDataChange={() => handleDataChange('reviews')} 
                        showNotification={showNotification}
                        showConfirm={showConfirm}
                        handleUnauthorized={handleUnauthorized}
                    />
                )}
                {activeTab === 'users' && session?.user?.role === 'super_admin' && (
                    <AdminUsersPage 
                        showNotification={showNotification} 
                        showConfirm={showConfirm}
                        onDataChange={() => handleDataChange('users')}\
                        handleUnauthorized={handleUnauthorized}
                    />
                )}
            </div>

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
    if (!session) {
        return {
            redirect: { destination: '/admin/login', permanent: false },
        };
    }
    return { props: { session } };
}
