import React from 'react';
import { FiChevronDown, FiEdit2, FiTrash2, FiPlusCircle } from 'react-icons/fi';
import styles from '../../styles/Admin.module.css';
import TourForm from './TourForm';

/**
 * Component to display a single category of tours.
 */
const TourCategory = ({ categoryKey, categoryName, tours, isOpen, onToggle, onEdit, onDelete }) => (
    <div className={styles.accordionItem}>
        <button className={styles.accordionHeader} onClick={() => onToggle(categoryKey)}>
            <span>{categoryName} ({tours?.length || 0})</span>
            <FiChevronDown className={`${styles.accordionIcon} ${isOpen ? styles.open : ''}`} />
        </button>
        <div className={`${styles.accordionContent} ${isOpen ? styles.open : ''}`}>
            {tours?.map((tour, id) => (
                <div key={`${categoryKey}-${id}`} className={styles.tourItemAdmin}>
                    <img 
                        src={tour.image} 
                        alt={tour.title} 
                        className={styles.tourImageAdmin} 
                        onError={(e) => e.target.src = 'https://placehold.co/100x75/eee/ccc?text=Error'}
                    />
                    <div className={styles.tourInfoAdmin}>
                        <strong>{tour.title}</strong>
                        <p>{tour.description}</p>
                        <span>{tour.price} {tour.currency}</span>
                    </div>
                    <div className={styles.tourActionsAdmin}>
                        <button onClick={() => onEdit('edit', categoryKey, id)} className={`${styles.button} ${styles.editButton} ${styles.iconButton}`} title="Редактировать"><FiEdit2 /></button>
                        <button onClick={() => onDelete(categoryKey, id)} className={`${styles.button} ${styles.dangerButton} ${styles.iconButton}`} title="Удалить"><FiTrash2 /></button>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

/**
 * Main component for managing tours.
 * @version 2.3 - Removed useCallback to fix build issue.
 */
export default function TourManager({ tours, onDataChange, showNotification }) {
    const [openCategory, setOpenCategory] = React.useState(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [modalConfig, setModalConfig] = React.useState({ mode: 'add', data: null });

    if (!tours) return <p>Загрузка туров...</p>;

    // FIX: Defined as a plain function without useCallback.
    const handleToggleCategory = (categoryKey) => {
        setOpenCategory(prev => (prev === categoryKey ? null : categoryKey));
    };

    // FIX: Defined as a plain function without useCallback.
    const handleOpenModal = (mode, categoryKey = null, tourId = null) => {
        const config = (mode === 'edit' && categoryKey !== null && tourId !== null)
            ? { mode: 'edit', category: categoryKey, tourId: tourId, data: tours[categoryKey][tourId] }
            : { mode: 'add', data: null };
        
        setModalConfig(config);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    // FIX: Defined as a plain function without useCallback.
    const handleDelete = (categoryKey, tourId) => {
        showNotification('Вы уверены, что хотите удалить этот тур?', true, async () => {
            try {
                const res = await fetch('/api/admin/tours', { 
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ category: categoryKey, tourId }), 
                });
                const result = await res.json();
                if (!res.ok) throw new Error(result.message);
                
                showNotification('Тур успешно удален!');
                onDataChange();
            } catch (error) {
                showNotification(`Ошибка удаления: ${error.message}`);
            }
        });
    };

    const categoryTitles = {
        hot: 'Горящие туры',
        popular: 'Популярные направления',
        special: 'Выгодные предложения',
    };

    return (
        <div>
            {isModalOpen && (
                <TourForm
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    config={modalConfig}
                    showNotification={showNotification}
                    onDataChange={onDataChange}
                />
            )}
            <div className={styles.contentHeader}>
                <h2>Управление турами</h2>
                <button className={`${styles.button} ${styles.primaryButton}`} onClick={() => handleOpenModal('add')}>
                    <FiPlusCircle /><span>Добавить тур</span>
                </button>
            </div>
            <div className={styles.accordion}>
                {Object.entries(tours).map(([key, value]) => (
                    <TourCategory
                        key={key}
                        categoryKey={key}
                        categoryName={categoryTitles[key] || key}
                        tours={value}
                        isOpen={openCategory === key}
                        onToggle={handleToggleCategory}
                        onEdit={handleOpenModal}
                        onDelete={handleDelete}
                    />
                ))}
            </div>
        </div>
    );
}
