import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import useSWR, { mutate } from 'swr';
import { useSession, signOut, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { FiMenu, FiX } from 'react-icons/fi';
import styles from '../../styles/Admin.module.css';

import Sidebar from '../../components/admin/Sidebar';

const TourManager = dynamic(() => import('../../components/admin/TourManager'));
const ReviewManager = dynamic(() => import('../../components/admin/ReviewManager'));
const NotificationModal = dynamic(() => import('../../components/admin/NotificationModal'));

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

export default function AdminPage() {
    const { data: session } = useSession({ required: true });
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('tours');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [notification, setNotification] = useState({ isOpen: false, type: 'info', message: '', isConfirm: false, onConfirm: () => {} });

    const { data: toursData, error: toursError } = useSWR('/api/admin/tours', fetcher);
    const { data: reviewsData, error: reviewsError } = useSWR('/api/admin/reviews', fetcher);

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push('/admin/login');
    };

    const showNotification = (config) => {
        setNotification({ 
            isOpen: true, 
            message: config.message,
            type: config.type || 'info',
            isConfirm: false,
            onConfirm: () => {}
        });
    };

    const showConfirm = (message, onConfirmCallback) => {
        setNotification({
            isOpen: true, message, type: 'confirm', isConfirm: true,
            onConfirm: () => {
                onConfirmCallback();
                closeNotification();
            },
        });
    };

    const closeNotification = () => setNotification({ ...notification, isOpen: false });

    const handleDataChange = (key) => {
        mutate(`/api/admin/${key}`);
    };
    
    useEffect(() => {
        if (isSidebarOpen) {
            setSidebarOpen(false);
        }
    }, [activeTab]);

    const tabTitles = {
        tours: 'Управление турами',
        reviews: 'Управление отзывами'
    };
    
    return (
        <div className={styles.adminLayout}>
            {isSidebarOpen && <div className={styles.pageOverlay} onClick={() => setSidebarOpen(false)}></div>}
            
            {/* Убрали div-обертку и передаем className напрямую в компонент */}
            <Sidebar
                className={isSidebarOpen ? styles.sidebarOpen : ''}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                user={session?.user}
                onLogout={handleLogout}
            />
            
            <main className={styles.mainContent}>
                <div className={styles.contentHeader}>
                    <h1>{tabTitles[activeTab]}</h1>
                     <button className={styles.mobileMenuButton} onClick={() => setSidebarOpen(!isSidebarOpen)}>
                        {isSidebarOpen ? <FiX /> : <FiMenu />}
                    </button>
                </div>

                {activeTab === 'tours' && (
                    <TourManager 
                        tours={toursData}
                        isLoading={!toursData && !toursError}
                        onDataChange={() => handleDataChange('tours')} 
                        showNotification={showNotification} 
                        showConfirm={showConfirm}
                    />
                )}
                {activeTab === 'reviews' && (
                   <ReviewManager 
                        reviews={reviewsData}
                        isLoading={!reviewsData && !reviewsError}
                        onDataChange={() => handleDataChange('reviews')} 
                        showNotification={showNotification}
                        showConfirm={showConfirm}
                        handleUnauthorized={handleLogout}
                    />
                )}
            </main>

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

export async function getServerSideProps(context) {
    const session = await getSession(context);
    if (!session) {
        return {
            redirect: { destination: '/admin/login', permanent: false },
        };
    }
    return { props: { session } };
}
