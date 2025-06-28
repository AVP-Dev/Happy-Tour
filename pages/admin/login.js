import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { FiAlertTriangle, FiLogIn } from 'react-icons/fi';
import styles from '../../styles/Admin.module.css';

/**
 * Страница входа в панель администратора.
 */
const LoginPage = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { error } = router.query; // Получаем параметр ошибки из URL

    /**
     * Обработчик отправки формы входа.
     * @param {Event} e - Событие отправки формы.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Включаем состояние загрузки

        // Выполняем попытку входа с учетными данными
        const res = await signIn('credentials', {
            redirect: false, // Отключаем автоматическое перенаправление
            email, 
            password,
        });
        
        if (res.ok) {
            router.push('/admin'); // В случае успеха перенаправляем на главную страницу админки
        } else {
            // В случае ошибки перенаправляем на страницу входа с параметром ошибки
            // Это позволит отобразить сообщение об ошибке пользователю
            router.push('/admin/login?error=CredentialsSignin', undefined, { shallow: true });
            setLoading(false); // Выключаем состояние загрузки
        }
    };

    return (
        // Эта обертка с классом adminLayout активирует все нужные CSS переменные
        <div className={styles.adminLayout}>
            <div className={styles.loginPage}>
                <div className={styles.loginBox}>
                    <h2>HappyTour</h2>
                    <p>Вход в панель администратора</p>
                    <form onSubmit={handleSubmit} className={styles.loginForm}>
                        <div className={styles.formGroup}>
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@example.com"
                                required
                                disabled={loading} /* Деактивируем поле во время загрузки */
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="password">Пароль</label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                disabled={loading} /* Деактивируем поле во время загрузки */
                            />
                        </div>

                        {/* Отображаем сообщение об ошибке, если есть */}
                        {error && (
                            <div className={styles.loginError}>
                                <FiAlertTriangle />
                                <span>Неверный Email или пароль.</span>
                            </div>
                        )}

                        <button type="submit" className={`${styles.button} ${styles.primaryButton}`} disabled={loading} style={{width: '100%', marginTop: '1rem'}}>
                            <FiLogIn />
                            {loading ? 'Вход...' : 'Войти'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

/**
 * Функция getServerSideProps для проверки сессии на стороне сервера.
 * Если пользователь уже аутентифицирован, перенаправляет его на страницу админки.
 * @param {object} context - Контекст запроса Next.js.
 * @returns {object} - Объект с редиректом или пропсами.
 */
export async function getServerSideProps(context) {
    const session = await getSession(context);
    if (session) {
        return { redirect: { destination: '/admin', permanent: false } };
    }
    return { props: {} };
}

export default LoginPage;
