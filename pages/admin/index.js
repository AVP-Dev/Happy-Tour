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
// ИСПРАВЛЕННЫЙ ПУТЬ: Убедитесь, что './users' находится в той же директории, что и index.js
const AdminUsersPage = dynamic(() => import('./users')); 

// fetcher остается без изменений
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
    const { data: session, status } = useSession({ required: true });
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('tours'); 
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [notification, setNotification] = useState({ isOpen: false, type: 'info', message: '', isConfirm: false, onConfirm: () => {} });

    const { data: toursData, error: toursError } = useSWR('/api/admin/tours', fetcher);
    const { data: reviewsData, error: reviewsError } = useSWR('/api/admin/reviews', fetcher);
    
    const groupedTours = toursData?.reduce((acc, tour) => {
        acc[tour.category] = acc[tour.category] || [];
        acc[tour.category].push(tour);
        return acc;
    }, {});

    useEffect(() => {
        if (isSidebarOpen) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
        return () => document.body.classList.remove('no-scroll');
    }, [isSidebarOpen]);

    const showNotification = (message, type = 'info', isConfirm = false, onConfirm = () => {}) => {
        setNotification({ isOpen: true, message, type, isConfirm, onConfirm });
    };

    const showConfirm = (message, onConfirm) => {
        showNotification(message, 'info', true, onConfirm);
    };

    const closeNotification = () => {
        setNotification(prev => ({ ...prev, isOpen: false }));
    };

    const handleDataChange = (tab) => {
        if (tab === 'tours') mutate('/api/admin/tours');
        if (tab === 'reviews') mutate('/api/admin/reviews');
        if (tab === 'users') mutate('/api/admin/users');
    };

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/admin/login' });
    };

    if (status === 'loading') {
        return (
            <div className={styles.adminLayout}>
                <div className={styles.loadingPage}>
                    <p>Загрузка админ-панели...</p>
                </div>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        router.push('/admin/login');
        return null;
    }

    return (
        <div className={styles.adminLayout}>
            <Sidebar 
                className={isSidebarOpen ? styles.sidebarOpen : ''}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                user={session?.user}
                onLogout={handleLogout}
            />

            {isSidebarOpen && <div className={styles.pageOverlay} onClick={() => setSidebarOpen(false)} />}

            <div className={styles.mainContent}>
                <button onClick={() => setSidebarOpen(!isSidebarOpen)} className={styles.mobileMenuButton}>
                    {isSidebarOpen ? <FiX /> : <FiMenu />}
                </button>

                {activeTab === 'tours' && (
                    <TourManager 
                        tours={groupedTours}
                        onDataChange={() => handleDataChange('tours')} 
                        showNotification={showNotification} 
                        showConfirm={showConfirm}
                    />
                )}
                {activeTab === 'reviews' && (
                   <ReviewManager 
                        reviews={reviewsData}
                        onDataChange={() => handleDataChange('reviews')} 
                        showNotification={showNotification}
                        showConfirm={showConfirm}
                        handleUnauthorized={() => signOut({ callbackUrl: '/admin/login' })}
                    />
                )}
                {activeTab === 'users' && session?.user?.role === 'super_admin' && (
                    <AdminUsersPage 
                        showNotification={showNotification} 
                        showConfirm={showConfirm}
                        onDataChange={() => handleDataChange('users')}
                        handleUnauthorized={() => signOut({ callbackUrl: '/admin/login' })}
                    />
                )}
            </div>

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
