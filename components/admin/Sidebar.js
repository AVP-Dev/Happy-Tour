import React from 'react';
import { FiGrid, FiMessageSquare, FiLogOut, FiUsers } from 'react-icons/fi'; // Импорт необходимых иконок
import styles from '../../styles/Admin.module.css'; // Импорт стилей
import { useSession } from 'next-auth/react'; // Хук для получения данных сессии

/**
 * Вспомогательный компонент для ссылки в сайдбаре.
 * @param {object} props - Свойства компонента.
 * @param {React.ReactNode} props.icon - Иконка ссылки.
 * @param {string} props.label - Текстовая метка ссылки.
 * @param {boolean} props.isActive - Активна ли ссылка.
 * @param {function} props.onClick - Обработчик клика по ссылке.
 */
const NavLink = ({ icon, label, isActive, onClick }) => (
    <a
        href="#" /* Использование '#' для предотвращения перехода по URL */
        className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
        onClick={(e) => {
            e.preventDefault(); // Предотвращаем перезагрузку страницы
            onClick(); // Вызываем переданный обработчик
        }}
    >
        {icon}
        <span>{label}</span>
    </a>
);

/**
 * Компонент Sidebar (боковая панель навигации).
 * @param {object} props - Свойства компонента.
 * @param {string} props.className - Дополнительные классы CSS для сайдбара.
 * @param {string} props.activeTab - Активная вкладка.
 * @param {function} props.setActiveTab - Функция для установки активной вкладки.
 * @param {object} props.user - Объект пользователя из сессии.
 * @param {function} props.onLogout - Функция для выхода из системы.
 */
export default function Sidebar({ className, activeTab, setActiveTab, user, onLogout }) {
    // Получаем первую букву email пользователя для аватара
    const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'A';
    const { data: session } = useSession(); // Получаем сессию для проверки роли пользователя

    return (
        // Применяем полученный className к корневому элементу для адаптивности
        <aside className={`${styles.sidebar} ${className || ''}`}>
            <div>
                {/* Заголовок сайдбара */}
                <div className={styles.sidebarHeader}>
                    HappyTour
                </div>
                {/* Навигационные ссылки */}
                <nav>
                    <NavLink
                        icon={<FiGrid size={20} />}
                        label="Управление турами"
                        isActive={activeTab === 'tours'}
                        onClick={() => setActiveTab('tours')}
                    />
                    <NavLink
                        icon={<FiMessageSquare size={20} />}
                        label="Управление отзывами"
                        isActive={activeTab === 'reviews'}
                        onClick={() => setActiveTab('reviews')}
                    />
                    {/* Ссылка на управление администраторами, видна только супер-админам */}
                    {session?.user?.role === 'super_admin' && (
                        <NavLink
                            icon={<FiUsers size={20} />}
                            label="Управление администраторами"
                            isActive={activeTab === 'users'}
                            onClick={() => setActiveTab('users')}
                        />
                    )}
                </nav>
            </div>

            {/* Нижняя часть сайдбара: информация о пользователе и кнопка выхода */}
            <div className={styles.sidebarFooter}>
                <div className={styles.userInfo}>
                    <div className={styles.avatar}>
                        {userInitial}
                    </div>
                    {/* Отображаем email пользователя или "Admin" */}
                    <span className={styles.userName}>{user?.email || 'Admin'}</span>
                </div>
                <NavLink
                    icon={<FiLogOut size={20} />}
                    label="Выйти"
                    onClick={onLogout}
                />
            </div>
        </aside>
    );
}
