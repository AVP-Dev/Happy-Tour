import React from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { useSession, signOut, getSession } from 'next-auth/react';
import { FiGrid, FiMail, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import styles from '../../styles/Admin.module.css';

const TourManager = dynamic(() => import('../../components/admin/TourManager'));
const ReviewManager = dynamic(() => import('../../components/admin/ReviewManager'));
const NotificationModal = dynamic(() => import('../../components/admin/NotificationModal'));

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function AdminPage() {
    const { data: session, status } = useSession({ required: true });
    
    const [activeTab, setActiveTab] = React.useState('tours');
    const [notification, setNotification] = React.useState({ isOpen: false, message: '', isConfirm: false });
    const [isSidebarOpen, setSidebarOpen] = React.useState(false);
    
    const { data: toursData } = useSWR(session ? '/api/admin/tours' : null, fetcher);
    const { data: reviewsData } = useSWR(session ? '/api/admin/reviews' : null, fetcher);

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
    const showNotification = (message, isConfirm = false, onConfirmAction = () => {}) => {
        setNotification({ isOpen: true, message, isConfirm, onConfirm: () => { onConfirmAction(); closeNotification(); } });
    };
    const closeNotification = () => setNotification({ isOpen: false, message: '', isConfirm: false });

    const handleLogout = () => {
        showNotification('Вы уверены, что хотите выйти?', true, () => {
            signOut({ callbackUrl: '/admin/login' });
        });
    };
    const handleTabChange = (tabName) => {
        setActiveTab(tabName);
        if (window.innerWidth < 768) setSidebarOpen(false);
    };

    if (status === "loading") {
        return <div className={styles.adminPage}><p>Загрузка...</p></div>;
    }

    return (
        <div className={styles.adminPage}>
            <NotificationModal {...notification} onCancel={closeNotification} />
            <button className={styles.mobileMenuButton} onClick={toggleSidebar}>
                {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
            <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}>
                <div className={styles.sidebarHeader}><h1 className={styles.sidebarTitle}>Happy Tour</h1></div>
                <nav className={styles.sidebarNav}>
                    <button onClick={() => handleTabChange('tours')} className={`${styles.navButton} ${activeTab === 'tours' ? styles.active : ''}`}><FiGrid /> <span>Туры</span></button>
                    <button onClick={() => handleTabChange('reviews')} className={`${styles.navButton} ${activeTab === 'reviews' ? styles.active : ''}`}><FiMail /> <span>Отзывы</span></button>
                </nav>
                <div className={styles.sidebarFooter}><button onClick={handleLogout} className={`${styles.navButton} ${styles.logoutButton}`}><FiLogOut /> <span>Выход</span></button></div>
            </aside>
            <main className={styles.mainContent}>
                <div className={`${styles.contentTab} ${activeTab === 'tours' ? styles.visible : ''}`}>
                    <TourManager tours={toursData} onDataChange={() => {}} showNotification={showNotification} />
                </div>
                <div className={`${styles.contentTab} ${activeTab === 'reviews' ? styles.visible : ''}`}>
                   <ReviewManager reviews={reviewsData} onDataChange={() => {}} showNotification={showNotification} />
                </div>
            </main>
        </div>
    );
}

export async function getServerSideProps(context) {
    const session = await getSession(context);
    if (!session) {
        return {
            redirect: {
                destination: '/admin/login',
                permanent: false,
            },
        };
    }
    return { props: { session } };
}
