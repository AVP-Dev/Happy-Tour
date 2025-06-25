import React from 'react';
import { FiGrid, FiMessageSquare, FiLogOut } from 'react-icons/fi';
import styles from '../../styles/Admin.module.css';

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
