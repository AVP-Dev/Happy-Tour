import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { FiAlertTriangle, FiLogIn } from 'react-icons/fi';
import styles from '../../styles/Admin.module.css';

const LoginPage = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { error } = router.query;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const res = await signIn('credentials', {
            redirect: false,
            username: email,
            password,
        });
        
        if (res.ok) {
            router.push('/admin');
        } else {
            router.push('/admin/login?error=CredentialsSignin', undefined, { shallow: true });
            setLoading(false);
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
                                disabled={loading}
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
                                disabled={loading}
                            />
                        </div>

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

export async function getServerSideProps(context) {
    const session = await getSession(context);
    if (session) {
        return { redirect: { destination: '/admin', permanent: false } };
    }
    return { props: {} };
}

export default LoginPage;
