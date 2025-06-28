// pages/admin/users.js
// Страница для управления учетными записями администраторов.
// Доступна только для супер-администраторов.

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react'; // Для проверки сессии NextAuth
import { FiPlus, FiTrash2, FiUser, FiAlertCircle } from 'react-icons/fi'; // Иконки
import useSWR from 'swr'; // Для получения данных
import styles from '../../styles/Admin.module.css'; // Стили
import NotificationModal from '../../components/admin/NotificationModal'; // Модальное окно уведомлений

// Вспомогательная функция для получения данных с сервера
const fetcher = async (url) => {
    const res = await fetch(url);
    if (!res.ok) {
        const error = new Error('Произошла ошибка при загрузке данных.');
        error.info = await res.json();
        error.status = res.status;
        throw error;
    }
    return res.json();
};

/**
 * Компонент AdminUsersPage для управления администраторами.
 * @param {object} props - Свойства компонента.
 * @param {function} props.showNotification - Функция для показа уведомлений.
 * @param {function} props.showConfirm - Функция для показа окна подтверждения.
 * @param {function} props.onDataChange - Функция для обновления данных.
 * @param {function} props.handleUnauthorized - Функция для обработки ошибок авторизации.
 */
export default function AdminUsersPage({ showNotification, showConfirm, onDataChange, handleUnauthorized }) {
    const { data: session, status } = useSession({ required: true }); // Получаем сессию NextAuth
    const [email, setEmail] = useState(''); // Состояние для email нового админа
    const [password, setPassword] = useState(''); // Состояние для пароля нового админа
    const [role, setRole] = useState('admin'); // Состояние для роли нового админа
    const [isSubmitting, setIsSubmitting] = useState(false); // Состояние отправки формы
    
    // Получаем список администраторов с помощью SWR.
    // Запрос выполняется только если пользователь аутентифицирован и является super_admin.
    const { data: adminUsers, error, isLoading, mutate } = useSWR(
        status === 'authenticated' && session?.user?.role === 'super_admin' ? '/api/admin/users' : null,
        fetcher
    );

    /**
     * Обработчик добавления нового администратора.
     * @param {Event} e - Событие формы.
     */
    const handleAddAdmin = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!email || !password) {
            showNotification({ type: 'error', message: 'Email и пароль обязательны.' });
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
            if (!res.ok) {
                // Если ошибка связана с уже существующим email, выдаем конкретное сообщение
                if (res.status === 409) { // Пример статуса конфликта
                    throw new Error('Пользователь с таким email уже существует.');
                }
                throw new Error(result.message || 'Произошла ошибка при добавлении администратора.');
            }

            showNotification({ type: 'success', message: 'Администратор успешно добавлен!' });
            setEmail(''); // Очищаем поля формы
            setPassword('');
            setRole('admin');
            mutate(); // Обновляем список администраторов через SWR
            onDataChange(); // Уведомляем родителя об изменении данных (для общей панели)
        } catch (err) {
            console.error('Ошибка добавления администратора:', err);
            showNotification({ type: 'error', message: `Ошибка добавления: ${err.message}` });
        } finally {
            setIsSubmitting(false);
        }
    };

    /**
     * Обработчик удаления администратора.
     * @param {string} adminId - ID администратора для удаления.
     */
    const handleDeleteAdmin = (adminId) => {
        showConfirm(
            'Вы уверены, что хотите удалить этого администратора? Это действие необратимо.',
            async () => {
                try {
                    const res = await fetch('/api/admin/users', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: adminId }),
                    });

                    const result = await res.json();
                    if (!res.ok) {
                        throw new Error(result.message || 'Произошла ошибка при удалении администратора.');
                    }

                    showNotification({ type: 'success', message: 'Администратор успешно удален!' });
                    mutate(); // Обновляем список администраторов
                    onDataChange(); // Уведомляем родителя
                } catch (err) {
                    console.error('Ошибка удаления администратора:', err);
                    showNotification({ type: 'error', message: `Ошибка удаления: ${err.message}` });
                }
            }
        );
    };

    // Отображение состояния загрузки или недостаточных прав
    if (status === 'loading') {
        return (
            <div className={styles.adminContainer}>
                <h2 className={styles.sectionTitle} style={{textAlign: 'left'}}>Управление администраторами</h2>
                <div className={`${styles.card} ${styles.errorCard}`}>
                    <FiAlertCircle size={24} />
                    <p>Загрузка прав пользователя...</p>
                </div>
            </div>
        );
    }

    if (status === 'unauthenticated' || session?.user?.role !== 'super_admin') {
        // Перенаправление на страницу входа происходит в _app.js или index.js (главной админки)
        // Здесь просто показываем сообщение, если компонент каким-то образом отрисовался
        return (
            <div className={styles.adminContainer}>
                <div className={`${styles.card} ${styles.errorCard}`}>
                    <FiAlertCircle size={24} />
                    <p>У вас недостаточно прав для доступа к этой странице.</p>
                    <button onClick={() => signOut({ callbackUrl: '/admin/login' })} className={`${styles.button} ${styles.primaryButton}`} style={{marginTop: '1rem'}}>
                        Вернуться на страницу входа
                    </button>
                </div>
            </div>
        );
    }

    // Если данные загружаются (SWR)
    if (isLoading) return <p>Загрузка списка администраторов...</p>;
    // Если произошла ошибка при загрузке данных
    if (error) return <p>Ошибка загрузки администраторов: {error.message}</p>;

    return (
        <div className={styles.adminContainer}>
            <h2 className={styles.sectionTitle} style={{textAlign: 'left'}}>Управление администраторами</h2>

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
                    {/* Кнопка отправки формы */}
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
                                    {/* Не позволяем удалять себя (текущего залогиненного пользователя) */}
                                    {session?.user?.id !== user.id && ( 
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
            {/* NotificationModal управляется родительским компонентом (AdminPage) */}
        </div>
    );
}
