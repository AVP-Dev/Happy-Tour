import React, { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr'; // Для управления данными и их кешированием
import { useSession, signOut, getSession } from 'next-auth/react'; // Для управления сессией аутентификации
import { useRouter } from 'next/router'; // Для программной навигации
// Импорт необходимых иконок из react-icons
import { FiMenu, FiX, FiPlus, FiAlertCircle, FiCheck, FiTrash2, FiEdit, FiSlash } from 'react-icons/fi'; 
import styles from '../../styles/Admin.module.css'; // Импорт модульных CSS-стилей

import Sidebar from '../../components/admin/Sidebar'; // Боковая панель навигации
import TourManager from '../../components/admin/TourManager'; // Менеджер туров
import ReviewManager from '../../components/admin/ReviewManager'; // Менеджер отзывов
import NotificationModal from '../../components/admin/NotificationModal'; // Модальное окно уведомлений
import AdminUsersPage from './users'; // Страница управления пользователями-админами

/**
 * Функция-фетчер для SWR. Отправляет GET-запросы к API.
 * @param {string} url - URL для запроса.
 * @returns {Promise<object>} - Промис с JSON-ответом.
 * @throws {Error} - Выбрасывает ошибку, если ответ сервера не OK.
 */
const fetcher = async (url) => {
    const res = await fetch(url);
    if (!res.ok) {
        const error = new Error('An error occurred while fetching the data.');
        error.info = await res.json(); // Добавляем информацию об ошибке
        error.status = res.status; // Добавляем статус ошибки
        throw error;
    }
    return res.json();
};

/**
 * Главный компонент страницы административной панели.
 */
export default function AdminPage() {
    const { data: session, status } = useSession({ required: true }); // Получаем данные сессии
    const router = useRouter(); // Инициализируем роутер
    const [activeTab, setActiveTab] = useState('tours'); // Состояние для активной вкладки сайдбара
    const [isSidebarOpen, setSidebarOpen] = useState(false); // Состояние для открытия/закрытия сайдбара на мобильных
    // Состояние для управления модальными окнами уведомлений и подтверждений
    const [notification, setNotification] = useState({ 
        isOpen: false, 
        type: 'info', 
        message: '', 
        isConfirm: false, 
        onConfirm: () => {} 
    });

    // SWR для данных туров. Автоматически переполучает данные при изменениях.
    const { data: toursData, error: toursError, isLoading: toursLoading } = useSWR('/api/admin/tours', fetcher);
    // SWR для данных отзывов.
    const { data: reviewsData, error: reviewsError, isLoading: reviewsLoading } = useSWR('/api/admin/reviews', fetcher);
    // SWR для данных пользователей (админов). Загружается только если активна вкладка 'users' и пользователь - 'super_admin'.
    const { data: adminUsersData, error: adminUsersError, isLoading: adminUsersLoading } = useSWR(
        activeTab === 'users' && session?.user?.role === 'super_admin' ? '/api/admin/users' : null, 
        fetcher
    );

    /**
     * Функция для показа уведомлений.
     * @param {object | string} options - Объект с { message, type, isConfirm, onConfirm } или просто сообщение.
     * @param {string} [type='info'] - Тип уведомления ('success', 'error', 'info').
     * @param {boolean} [isConfirm=false] - Флаг для диалога подтверждения.
     * @param {function} [onConfirm=() => {}] - Колбэк для подтверждения.
     */
    const showNotification = (options, type = 'info', isConfirm = false, onConfirm = () => {}) => {
        if (typeof options === 'string') {
            setNotification({ isOpen: true, message: options, type, isConfirm, onConfirm });
        } else {
            setNotification({ isOpen: true, ...options });
        }
    };

    /**
     * Функция для показа диалога подтверждения.
     * Использует `showNotification` с `isConfirm: true`.
     * @param {string} message - Сообщение подтверждения.
     * @param {function} onConfirmCallback - Колбэк, вызываемый при подтверждении.
     */
    const showConfirm = (message, onConfirmCallback) => {
        showNotification({ message, type: 'info', isConfirm: true, onConfirm: onConfirmCallback });
    };

    /**
     * Функция для закрытия модальных окон уведомлений/подтверждений.
     */
    const closeNotification = () => {
        setNotification(prev => ({ ...prev, isOpen: false }));
    };

    /**
     * Функция для принудительного обновления данных с помощью SWR.
     * @param {string} dataType - Тип данных для обновления ('tours', 'reviews', 'users').
     */
    const handleDataChange = (dataType) => {
        if (dataType === 'tours') {
            mutate('/api/admin/tours');
        } else if (dataType === 'reviews') {
            mutate('/api/admin/reviews');
        } else if (dataType === 'users') {
            mutate('/api/admin/users');
        }
    };

    /**
     * Обработчик для случаев несанкционированного доступа (401 Unauthorized).
     * Показывает уведомление и перенаправляет на страницу входа.
     */
    const handleUnauthorized = () => {
        showNotification({
            type: 'error', 
            message: 'Сессия истекла или у вас нет прав доступа. Пожалуйста, войдите снова.', 
            isConfirm: false, 
            onConfirm: () => {} // Не используется для этого типа уведомления
        });
        // Задержка перед редиректом, чтобы пользователь успел прочитать сообщение
        setTimeout(() => {
            signOut({ callbackUrl: '/admin/login' });
        }, 3000); 
    };

    // Отображение заглушки во время загрузки сессии
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

    // Перенаправление на страницу входа, если пользователь не аутентифицирован
    if (status === 'unauthenticated') {
        router.push('/admin/login');
        return null;
    }

    // Хук для удаления файла setup-first-admin.js в продакшене.
    // Этот код не будет выполняться на клиенте, но служит напоминанием.
    useEffect(() => {
        // В реальном продакшене этот файл должен быть удален вручную или автоматически
        // после первого запуска и создания админа для безопасности.
        // Пример (псевдокод для сервера):
        // IF (process.env.NODE_ENV === 'production') {
        //     // Запустите команду удаления файла на вашем сервере
        //     // Например, через SSH: `rm /path/to/your/project/pages/api/setup-first-admin.js`
        // }
    }, []);

    return (
        <div className={styles.adminLayout}>
            {/* Сайдбар */}
            <Sidebar 
                className={isSidebarOpen ? styles.sidebarOpen : ''}
                activeTab={activeTab} 
                setActiveTab={setActiveTab}
                user={session?.user}
                onLogout={() => signOut({ callbackUrl: '/admin/login' })}
            />
            {/* Оверлей, который закрывает сайдбар при клике на мобильных */}
            {isSidebarOpen && <div className={styles.pageOverlay} onClick={() => setSidebarOpen(false)}></div>}

            {/* Основное содержимое админ-панели */}
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
                    {/* Заголовок текущей активной вкладки */}
                    <h1>{
                        activeTab === 'tours' ? 'Управление турами' :
                        activeTab === 'reviews' ? 'Управление отзывами' :
                        activeTab === 'users' ? 'Управление администраторами' : ''
                    }</h1>
                </div>
                
                {/* Условный рендеринг компонентов в зависимости от активной вкладки */}
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
                {/* Вкладка "Управление администраторами" видна только супер-админам */}
                {activeTab === 'users' && session?.user?.role === 'super_admin' && (
                    <AdminUsersPage 
                        showNotification={showNotification} 
                        showConfirm={showConfirm}
                        onDataChange={() => handleDataChange('users')}
                        handleUnauthorized={handleUnauthorized}
                    />
                )}
            </div>

            {/* Модальное окно уведомлений/подтверждений, которое управляется со всей страницы */}
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

/**
 * Функция getServerSideProps для проверки аутентификации на стороне сервера.
 * Если пользователь не аутентифицирован, перенаправляет на страницу входа.
 * @param {object} context - Контекст запроса Next.js.
 * @returns {object} - Объект с редиректом или пропсами.
 */
export async function getServerSideProps(context) {
    const session = await getSession(context);
    if (!session) {
        return {
            redirect: { destination: '/admin/login', permanent: false },
        };
    }
    return { props: { session } };
}
