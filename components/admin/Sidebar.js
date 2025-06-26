import React from 'react';
import { FiGrid, FiMessageSquare, FiLogOut, FiUsers } from 'react-icons/fi'; // ДОБАВЛЕНО: FiUsers
import styles from '../../styles/Admin.module.css';
import { useSession } from 'next-auth/react'; // ДОБАВЛЕНО: Для проверки роли

const NavLink = ({ icon, label, isActive, onClick }) => (
    <a
        href="#"
        className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
        onClick={(e) => {
            e.preventDefault();
            onClick();
        }}
    >
        {icon}
        <span>{label}</span>
    </a>
);

// Принимаем className как пропс
export default function Sidebar({ className, activeTab, setActiveTab, user, onLogout }) {
    const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'A';
    const { data: session } = useSession(); // Получаем сессию для проверки роли

    return (
        // Применяем полученный className к корневому элементу
        <aside className={`${styles.sidebar} ${className || ''}`}>
            <div>
                <div className={styles.sidebarHeader}>
                    HappyTour
                </div>
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
                    {/* НОВАЯ ССЫЛКА: Управление администраторами */}
                    {session?.user?.role === 'super_admin' && ( // Показываем только для супер-админов
                        <NavLink
                            icon={<FiUsers size={20} />}
                            label="Управление администраторами"
                            isActive={activeTab === 'users'}
                            onClick={() => setActiveTab('users')}
                        />
                    )}
                </nav>
            </div>

            <div className={styles.sidebarFooter}>
                <div className={styles.userInfo}>
                    <div className={styles.avatar}>
                        {userInitial}
                    </div>
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
