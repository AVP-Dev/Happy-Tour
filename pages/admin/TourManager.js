// components/admin/TourManager.js

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { FiChevronDown, FiEdit2, FiTrash2, FiPlusCircle } from 'react-icons/fi';
import styles from '../../styles/Admin.module.css';

// Динамически импортируем форму, чтобы она не влияла на начальную загрузку
const TourForm = dynamic(() => import('../../components/admin/TourForm'));

// Компонент для одной категории (аккордеон)
const TourCategory = ({ categoryName, tours, onEdit, onDelete }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className={styles.accordionItem}>
            <button className={styles.accordionHeader} onClick={() => setIsOpen(!isOpen)}>
                <span>{categoryName} ({tours?.length || 0})</span>
                <FiChevronDown className={`${styles.accordionIcon} ${isOpen ? styles.open : ''}`} />
            </button>
            {isOpen && (
                <div className={styles.accordionContentWrapper}>
                    {!tours || tours.length === 0 ? (
                        <p className={styles.noItems}>В этой категории пока нет туров.</p>
                    ) : (
                        tours.map((tour) => (
                            <div key={tour.id} className={styles.tourItemAdmin}>
                                <img src={tour.image} alt={tour.title} className={styles.tourImageAdmin} onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.png'; }} />
                                <div className={styles.tourInfoAdmin}>
                                    <strong>{tour.title}</strong>
                                    <p>{tour.description}</p>
                                    <span className={styles.tourPriceAdmin}>{tour.price} {tour.currency}</span>
                                </div>
                                <div className={styles.tourActionsAdmin}>
                                    <button onClick={() => onEdit(tour)} className={styles.editBtn} title="Редактировать"><FiEdit2 /></button>
                                    <button onClick={() => onDelete(tour.id)} className={styles.deleteBtn} title="Удалить"><FiTrash2 /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

// Основной компонент менеджера туров
export default function TourManager({ tours, onDataChange, showNotification, showConfirm }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formConfig, setFormConfig] = useState({ mode: 'add', data: null });

    const handleAdd = (category) => {
        setFormConfig({ mode: 'add', data: { category } });
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
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: tourId }),
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
            <div className={styles.contentHeader}>
                <h2>Управление турами</h2>
                 {/* Кнопку добавления можно разместить здесь или для каждой категории */}
            </div>

            <div className={styles.accordion}>
                {Object.entries(categoryTitles).map(([key, title]) => (
                    <div key={key}>
                         <div className={styles.categoryHeader}>
                            <h3>{title}</h3>
                            <button onClick={() => handleAdd(key)} className={styles.addButtonMini}>
                                <FiPlusCircle size={16}/> Добавить в эту категорию
                            </button>
                        </div>
                        <TourCategory
                            categoryName={title}
                            tours={tours?.[key]}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <TourForm 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    config={formConfig}
                    showNotification={showNotification}
                    onDataChange={onDataChange}
                />
            )}
        </div>
    );
}
