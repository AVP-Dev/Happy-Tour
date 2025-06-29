// components/admin/TourManager.js
import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import TourForm from './TourForm';
import styles from '../../styles/Admin.module.css';
import { FaEdit, FaTrash, FaPlus, FaChevronDown } from 'react-icons/fa';
import Image from 'next/image';

// Вспомогательная функция для получения данных (для SWR)
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

const TourManager = ({ tours, onDataChange }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [currentTour, setCurrentTour] = useState(null);
    const [expandedCategory, setExpandedCategory] = useState(null); // Состояние для открытой категории

    // Группируем туры по категориям
    const toursByCategory = tours.reduce((acc, tour) => {
        const category = tour.category || 'Без категории'; // Обработка туров без категории
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(tour);
        return acc;
    }, {});

    const handleAddTour = (category = null) => {
        setCurrentTour({ category }); // Предзаполнение категории, если передана
        setIsFormOpen(true);
    };

    const handleEditTour = (tour) => {
        setCurrentTour(tour);
        setIsFormOpen(true);
    };

    const handleDeleteTour = async (id) => {
        if (!confirm('Вы уверены, что хотите удалить этот тур?')) {
            return;
        }
        try {
            const res = await fetch('/api/admin/tours', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json', // Указываем тип контента как JSON
                },
                body: JSON.stringify({ id }), // Передаем ID в теле запроса как JSON
            });

            if (!res.ok) {
                const errorData = await res.json(); // Пытаемся распарсить ответ об ошибке
                throw new Error(errorData.message || 'Failed to delete tour');
            }

            // Если успешно, повторно валидируем данные туров (вызываем мутацию SWR)
            onDataChange();
            // Возможно, добавить уведомление об успехе
            alert('Тур успешно удален!');
        } catch (error) {
            console.error('[CLIENT] Error deleting tour:', error.message);
            // Возможно, добавить уведомление об ошибке
            alert(`Ошибка удаления тура: ${error.message}`);
        }
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setCurrentTour(null);
    };

    // Переключение состояния аккордеона
    const toggleCategory = (category) => {
        setExpandedCategory(expandedCategory === category ? null : category);
    };

    return (
        <div className={styles.card}>
            <div className={styles.contentHeader}>
                <h1>Управление Турами</h1>
                <button onClick={() => handleAddTour()} className={styles.primaryButton}>
                    <FaPlus /> Добавить Тур
                </button>
            </div>

            <div className={styles.accordionContainer}>
                {Object.keys(toursByCategory).length === 0 && (
                    <p className={styles.noItems}>Нет туров для отображения. Добавьте первый тур!</p>
                )}

                {Object.keys(toursByCategory).map((category) => (
                    <div key={category} className={styles.accordionItem}>
                        <div className={styles.accordionHeader} onClick={() => toggleCategory(category)}>
                            <h3>{category} ({toursByCategory[category].length})</h3>
                            <FaChevronDown className={`${styles.accordionIcon} ${expandedCategory === category ? styles.open : ''}`} />
                        </div>
                        <div className={`${styles.accordionContentWrapper} ${expandedCategory === category ? styles.open : ''}`}>
                            <div className={styles.tourGrid}>
                                {toursByCategory[category].map((tour) => (
                                    <div key={tour.id} className={styles.tourItemAdmin}>
                                        {tour.image_url && (
                                            <div style={{ position: 'relative', width: '100%', height: '180px' }}>
                                                <Image 
                                                    src={tour.image_url} 
                                                    alt={tour.title} 
                                                    fill 
                                                    sizes="280px" // Ограничиваем размер для админки
                                                    className={styles.tourImageAdmin} 
                                                    priority={false} // Не приоритетная загрузка для админки
                                                />
                                            </div>
                                        )}
                                        <div className={styles.tourInfoAdmin}>
                                            <strong>{tour.title}</strong>
                                            <p>{tour.description}</p>
                                            <span className={styles.tourPriceAdmin}>
                                                от {tour.price} {tour.currency}
                                            </span>
                                        </div>
                                        <div className={styles.tourActionsAdmin}>
                                            <button onClick={() => handleEditTour(tour)} className={styles.editBtn}>
                                                <FaEdit />
                                            </button>
                                            <button onClick={() => handleDeleteTour(tour.id)} className={styles.deleteBtn}>
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isFormOpen && (
                <TourForm 
                    tour={currentTour} 
                    onClose={handleFormClose} 
                    onTourSaved={() => { 
                        onDataChange(); // Обновляем данные после сохранения/обновления
                        handleFormClose(); // Закрываем форму
                    }} 
                />
            )}
        </div>
    );
};

export default TourManager;