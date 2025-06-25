import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { FiEdit, FiTrash2, FiPlus, FiChevronDown } from 'react-icons/fi';
import styles from '../../styles/Admin.module.css';

// Импорт экземпляров Firebase Auth, Firestore и Storage
import { auth, db, storage } from '../../lib/firebase'; // Убедитесь, что auth, db, storage импортированы

const TourForm = dynamic(() => import('./TourForm'));

const TourCard = ({ tour, onEdit, onDelete }) => (
    <div className={styles.tourCardItem}>
        <img 
            src={tour.image} 
            alt={tour.title} 
            className={styles.tourCardImage} 
            onError={(e) => { 
                e.target.onerror = null; 
                e.target.src = 'https://placehold.co/400x200/e2e8f0/a0aec0?text=IMG'; // Заглушка изображения при ошибке
            }}
        />
        <div className={styles.tourCardContent}>
            <h4 className={styles.tourCardTitle}>{tour.title}</h4>
            <div className={styles.tourCardActions}>
                <span className={styles.tourCardPrice}>{tour.price} {tour.currency}</span>
                <div>
                    <button onClick={() => onEdit(tour)} className={styles.iconButton} title="Редактировать"><FiEdit size={16} /></button>
                    <button onClick={() => onDelete(tour.id)} className={`${styles.iconButton} ${styles.danger}`} title="Удалить"><FiTrash2 size={16} /></button>
                </div>
            </div>
        </div>
    </div>
);

const AccordionCategory = ({ title, tours, isOpen, onToggle, onEdit, onDelete }) => {
    return (
        <div className={styles.accordionItem}>
            <button className={styles.accordionHeader} onClick={onToggle}>
                <span>{title} ({tours?.length || 0})</span>
                <FiChevronDown className={`${styles.accordionIcon} ${isOpen ? styles.accordionIconOpen : ''}`} />
            </button>
            <div className={`${styles.accordionContent} ${isOpen ? styles.accordionContentOpen : ''}`}>
                <div className={styles.tourGrid}>
                    {tours && tours.length > 0 ? (
                        tours.map(tour => <TourCard key={tour.id} tour={tour} onEdit={onEdit} onDelete={onDelete} />)
                    ) : (
                        <p>В этой категории пока нет туров.</p>
                    )}
                </div>
            </div>
        </div>
    );
};


export default function TourManager({ tours, isLoading, onDataChange, showNotification, showConfirm }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formConfig, setFormConfig] = useState({ mode: 'add', data: null });
    const [openCategory, setOpenCategory] = useState('hot');

    // ВРЕМЕННЫЙ КОД ДЛЯ ОТЛАДКИ Firebase Auth:
    // Этот useEffect будет выполняться на клиенте после монтирования компонента
    useEffect(() => {
        if (auth) { // Проверяем, что экземпляр auth доступен
            if (auth.currentUser) {
                console.log("Firebase Auth User (from TourManager component):", auth.currentUser.toJSON());
            } else {
                console.log("Firebase Auth User (from TourManager component): null. User not logged in according to Firebase Auth SDK.");
                // Также можно добавить слушатель для отладки изменения состояния аутентификации
                const unsubscribe = auth.onAuthStateChanged(user => {
                    if (user) {
                        console.log("Firebase Auth User state changed to (from TourManager listener):", user.toJSON());
                    } else {
                        console.log("Firebase Auth User state changed to (from TourManager listener): null");
                    }
                });
                return () => unsubscribe(); // Очистка слушателя при размонтировании компонента
            }
        } else {
            console.log("Firebase Auth instance is not available in TourManager component.");
        }
    }, []); // Запускаем один раз при монтировании компонента

    const handleToggleCategory = (categoryKey) => {
        setOpenCategory(prev => (prev === categoryKey ? null : categoryKey));
    };

    const handleAdd = () => {
        setFormConfig({ mode: 'add', data: null });
        setIsModalOpen(true);
    };

    const handleEdit = (tour) => {
        setFormConfig({ mode: 'edit', data: tour });
        setIsModalOpen(true);
    };

    const handleDelete = (tourId) => {
        showConfirm('Вы уверены, что хотите удалить этот тур?', async () => {
            try {
                const res = await fetch('/api/admin/tours', {
                    method: 'DELETE', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: tourId }),
                });
                const result = await res.json();
                if (!res.ok) throw new Error(result.message);
                showNotification({type: 'success', message: 'Тур успешно удален!'});
                onDataChange(); // Обновление списка туров после удаления
            } catch (error) {
                showNotification({type: 'error', message: `Ошибка удаления: ${error.message}`});
            }
        });
    };

    const categoryTitles = {
        hot: 'Горящие туры',
        popular: 'Популярные направления',
        special: 'Выгодные предложения',
    };

    if (isLoading) return <p>Загрузка туров...</p>;

    return (
        <div>
            <div className={styles.contentHeader} style={{marginBottom: "2rem"}}>
                <div/>
                <button onClick={handleAdd} className={`${styles.button} ${styles.primaryButton}`}>
                    <FiPlus />
                    <span>Добавить тур</span>
                </button>
            </div>

            <div className={styles.accordionContainer}>
                {Object.entries(categoryTitles).map(([key, title]) => (
                    <AccordionCategory
                        key={key}
                        title={title}
                        tours={tours?.[key]}
                        isOpen={openCategory === key}
                        onToggle={() => handleToggleCategory(key)}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                ))}
            </div>

            {isModalOpen && (
                <TourForm 
                    isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
                    config={formConfig} showNotification={showNotification} onDataChange={onDataChange}
                />
            )}
        </div>
    );
}
