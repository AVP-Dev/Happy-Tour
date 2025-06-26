// pages/admin/users.js
// Страница для управления учетными записями администраторов.
// Доступна только для супер-администраторов.

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react'; // Для проверки сессии NextAuth
import { FiPlus, FiTrash2, FiUser, FiAlertCircle } from 'react-icons/fi'; // Иконки
import useSWR from 'swr'; // Для получения данных
import styles from '../../styles/Admin.module.css'; // Стили
import NotificationModal from '../../components/admin/NotificationModal'; // Модальное окно уведомлений

// Вспомогательная функция для получения данных
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

export default function AdminUsersPage() {
    const { data: session, status } = useSession({ required: true }); // Получаем сессию NextAuth
    const [email, setEmail] = useState(''); // Состояние для email нового админа
    const [password, setPassword] = useState(''); // Состояние для пароля нового админа
    const [role, setRole] = useState('admin'); // Состояние для роли нового админа
    const [isSubmitting, setIsSubmitting] = useState(false); // Состояние отправки формы
    const [notification, setNotification] = useState({ isOpen: false, type: 'info', message: '', isConfirm: false, onConfirm: () => {} });

    // Получаем список администраторов с помощью SWR
    const { data: adminUsers, error, isLoading, mutate } = useSWR(
        status === 'authenticated' && session?.user?.role === 'super_admin' ? '/api/admin/users' : null,
        fetcher
    );

    // Функция для показа уведомлений
    const showNotification = (message, type = 'info', isConfirm = false, onConfirm = () => {}) => {
        setNotification({ isOpen: true, message, type, isConfirm, onConfirm });
    };

    // Функция для закрытия уведомлений
    const closeNotification = () => {
        setNotification(prev => ({ ...prev, isOpen: false }));
    };

    /**
     * Обработчик добавления нового администратора.
     * @param {Event} e - Событие формы.
     */
    const handleAddAdmin = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!email || !password) {
            showNotification('Email и пароль обязательны.', 'error');
            setIsSubmitting(false);
            return;
        }

        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role }),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message);

            showNotification('Администратор успешно добавлен!', 'success');
            setEmail('');
            setPassword('');
            setRole('admin');
            mutate(); // Обновляем список администраторов
        } catch (err) {
            console.error('Ошибка добавления администратора:', err);
            showNotification(`Ошибка добавления: ${err.message}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    /**
     * Обработчик удаления администратора.
     * @param {string} adminId - ID администратора для удаления.
     */
    const handleDeleteAdmin = (adminId) => {
        showNotification(
            'Вы уверены, что хотите удалить этого администратора?',
            'info', // тип может быть 'info' для запроса
            true, // isConfirm: true для показа кнопок подтверждения
            async () => {
                closeNotification(); // Закрываем модальное окно перед выполнением
                try {
                    const res = await fetch('/api/admin/users', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: adminId }),
                    });

                    const result = await res.json();
                    if (!res.ok) throw new Error(result.message);

                    showNotification('Администратор успешно удален!', 'success');
                    mutate(); // Обновляем список администраторов
                } catch (err) {
                    console.error('Ошибка удаления администратора:', err);
                    showNotification(`Ошибка удаления: ${err.message}`, 'error');
                }
            }
        );
    };

    // Если сессия загружается или пользователь не супер-админ, показываем заглушку
    if (status === 'loading') {
        return (
            <div className={styles.adminContainer}>
                <h2 className="section-title" style={{textAlign: 'left'}}>Управление администраторами</h2>
                <div className={`${styles.card} ${styles.errorCard}`}>
                    <FiAlertCircle size={24} />
                    <p>Загрузка прав пользователя...</p>
                </div>
            </div>
        );
    }

    if (status === 'unauthenticated' || session?.user?.role !== 'super_admin') {
        return (
            <div className={styles.adminLayout}> {/* Используем adminLayout для правильного центрирования на странице логина */}
                <div className={`${styles.loginPage} ${styles.adminContainer}`}> {/* И loginPage для центрирования контента */}
                    <div className={`${styles.card} ${styles.errorCard}`}>
                        <FiAlertCircle size={24} />
                        <p>У вас недостаточно прав для доступа к этой странице.</p>
                        <button onClick={() => signOut({ callbackUrl: '/admin/login' })} className={`${styles.button} ${styles.primaryButton}`} style={{marginTop: '1rem'}}>
                            Вернуться на страницу входа
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading) return <p>Загрузка списка администраторов...</p>;
    if (error) return <p>Ошибка загрузки администраторов: {error.message}</p>;

    return (
        <div className={styles.adminContainer}>
            <h2 className="section-title" style={{textAlign: 'left'}}>Управление администраторами</h2>

            {/* Форма добавления нового администратора */}
            <div className={styles.card}>
                <h3>Добавить нового администратора</h3>
                <form onSubmit={handleAddAdmin} className={styles.formGrid} style={{marginTop: '1.5rem'}}>
                    <div className={styles.formGroup}>
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@example.com"
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="password">Пароль</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="role">Роль</label>
                        <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="admin">Администратор</option>
                            <option value="super_admin">Супер-администратор</option>
                        </select>
                    </div>
                    <div className={styles.formGroup} style={{gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem'}}>
                        <button type="submit" className={`${styles.button} ${styles.primaryButton}`} disabled={isSubmitting}>
                            <FiPlus size={16} />
                            {isSubmitting ? 'Добавление...' : 'Добавить администратора'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Список существующих администраторов */}
            <div className={`${styles.card} ${styles.usersListCard}`}>
                <h3>Существующие администраторы</h3>
                {!adminUsers || adminUsers.length === 0 ? (
                    <p className={styles.noItems}>Администраторы пока не добавлены.</p>
                ) : (
                    <div className={styles.adminUserGrid}>
                        {adminUsers.map((user) => (
                            <div key={user.id} className={styles.adminUserItem}>
                                <div className={styles.adminUserInfo}>
                                    <FiUser size={20} className={styles.adminUserIcon} />
                                    <div>
                                        <strong>{user.email}</strong>
                                        <span className={styles.adminUserRole}>{user.role === 'super_admin' ? 'Супер-администратор' : 'Администратор'}</span>
                                        <span className={styles.adminUserDate}>Создан: {new Date(user.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className={styles.adminUserActions}>
                                    {/* Не позволяем удалять себя, если есть такая логика, и не единственного супер-админа */}
                                    {session?.user?.id !== user.id && ( // Не позволяем удалить текущего залогиненного пользователя
                                        <button 
                                            onClick={() => handleDeleteAdmin(user.id)} 
                                            className={`${styles.button} ${styles.iconButton} ${styles.danger}`} 
                                            title="Удалить администратора"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Модальное окно уведомлений */}
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
