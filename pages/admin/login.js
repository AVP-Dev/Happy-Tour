import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import styles from '../../styles/Admin.module.css';

const LoginPage = () => {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { error } = router.query;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Этот вызов сам обработает и успех, и ошибку
        await signIn('credentials', {
            callbackUrl: '/admin',
            username,
            password,
        });
    };

    return (
        <div className={styles.loginPage}>
            <div className={styles.loginBox}>
                <h2>Вход в панель</h2>
                <p>Пожалуйста, введите логин и пароль.</p>
                <form onSubmit={handleSubmit} className={styles.loginForm}>
                    <div className={styles.formGroup} style={{marginBottom: '1.25rem'}}>
                        <input
                            type="text"
                            name="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Логин"
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className={styles.formGroup} style={{marginBottom: '1.25rem'}}>
                        <input
                            type="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Пароль"
                            required
                            disabled={loading}
                        />
                    </div>
                    <button type="submit" className={`${styles.button} ${styles.primaryButton}`} disabled={loading}>
                        {loading ? 'Вход...' : 'Войти'}
                    </button>
                    {error && <p className={styles.loginError}>Неверный логин или пароль.</p>}
                </form>
            </div>
        </div>
    );
};

// Если пользователь уже вошел, его перекинет в админку
export async function getServerSideProps(context) {
    const session = await getSession(context);
    if (session) {
        return { redirect: { destination: '/admin', permanent: false } };
    }
    return { props: {} };
}

export default LoginPage;
