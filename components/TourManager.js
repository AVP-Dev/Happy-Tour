// pages/admin/TourManager.js

import { useState } from 'react';
import dynamic from 'next/dynamic';
// ИСПРАВЛЕНО: Добавлен FiPlus в импорт для кнопки "Добавить тур"
import { FiChevronDown, FiEdit2, FiTrash2, FiPlus, FiPlusCircle } from 'react-icons/fi'; 
import styles from '../../styles/Admin.module.css';

// Динамически импортируем форму TourForm, чтобы она не влияла на начальную загрузку
const TourForm = dynamic(() => import('../../components/admin/TourForm'));

/**
 * Компонент TourCategory отображает туры в рамках одной категории в виде аккордеона.
 * @param {object} props - Свойства компонента.
 * @param {string} props.categoryName - Название категории.
 * @param {Array<object>} props.tours - Массив туров в этой категории.
 * @param {function} props.onEdit - Функция для редактирования тура.
 * @param {function} props.onDelete - Функция для удаления тура.
 */
const TourCategory = ({ categoryName, tours, onEdit, onDelete }) => {
    const [isOpen, setIsOpen] = useState(true); // Состояние для открытия/закрытия аккордеона

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
                        <div className={styles.tourGrid}> {/* Добавлен класс для сетки туров */}
                            {tours.map((tour) => (
                                <div key={tour.id} className={styles.tourItemAdmin}>
                                    {/* ИСПРАВЛЕНО: src теперь использует tour.image_url вместо tour.image */}
                                    <img 
                                        src={tour.image_url} //
                                        alt={tour.title} 
                                        className={styles.tourImageAdmin} 
                                        onError={(e) => { 
                                            e.target.onerror = null; 
                                            e.target.src = '/placeholder.png'; // Заглушка изображения при ошибке
                                        }} 
                                    />
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
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

/**
 * Основной компонент TourManager для управления турами в административной панели.
 * @param {object} props - Свойства компонента.
 * @param {object} props.tours - Объект с турами, сгруппированными по категориям.
 * @param {function} props.onDataChange - Функция для обновления данных.
 * @param {function} props.showNotification - Функция для показа уведомлений.
 * @param {function} props.showConfirm - Функция для показа окна подтверждения.
 */
export default function TourManager({ tours, onDataChange, showNotification, showConfirm }) {
    const [isModalOpen, setIsModalOpen] = useState(false); // Состояние для открытия/закрытия модального окна формы
    const [formConfig, setFormConfig] = useState({ mode: 'add', data: null }); // Конфигурация формы (добавление/редактирование, данные)
    const [openCategory, setOpenCategory] = useState('hot'); // Состояние для открытой категории аккордеона

    /**
     * Обработчик переключения категории аккордеона.
     * @param {string} categoryKey - Ключ категории.
     */
    const handleToggleCategory = (categoryKey) => {
        setOpenCategory(prev => (prev === categoryKey ? null : categoryKey));
    };

    /**
     * Обработчик добавления нового тура.
     * Открывает форму в режиме добавления, с указанной категорией по умолчанию.
     * @param {string} category - Категория для нового тура.
     */
    const handleAdd = (category) => {
        setFormConfig({ mode: 'add', data: { category } });
        setIsModalOpen(true);
    };

    /**
     * Обработчик редактирования тура.
     * Открывает форму в режиме редактирования с данными выбранного тура.
     * @param {object} tour - Объект тура для редактирования.
     */
    const handleEdit = (tour) => {
        setFormConfig({ mode: 'edit', data: tour });
        setIsModalOpen(true);
    };

    /**
     * Обработчик удаления тура.
     * Показывает окно подтверждения, затем отправляет запрос на удаление.
     * @param {string} tourId - ID тура для удаления.
     */
    const handleDelete = (tourId) => {
        showConfirm('Вы уверены, что хотите удалить этот тур? Это действие необратимо.', async () => {
            try {
                const res = await fetch('/api/admin/tours', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: tourId }),
                });
                const result = await res.json();
                if (!res.ok) throw new Error(result.message);
                showNotification('Тур успешно удален!');
                onDataChange(); // Обновляем данные после удаления
            } catch (error) {
                showNotification(`Ошибка удаления: ${error.message}`);
            }
        });
    };

    // Заголовки для категорий туров
    const categoryTitles = {
        hot: 'Горящие туры',
        popular: 'Популярные направления',
        special: 'Выгодные предложения',
    };

    // Если данные загружаются, показываем сообщение о загрузке
    // ИЗМЕНЕНО: Проверка isLoading теперь зависит от наличия данных tours
    if (!tours) return <p>Загрузка туров...</p>;

    return (
        <div>
            <div className={styles.contentHeader} style={{marginBottom: "2rem"}}>
                {/* Пустой div для выравнивания, если нет других элементов */}
                <div/>
                {/* Кнопка добавления нового тура (общая для всех категорий) */}
                <button onClick={() => handleAdd(openCategory || 'hot')} className={`${styles.button} ${styles.primaryButton}`}>
                    <FiPlus /> {/* ИСПРАВЛЕНО: Теперь использует FiPlus */}
                    <span>Добавить тур</span>
                </button>
            </div>

            <div className={styles.accordionContainer}>
                {/* Рендеринг каждой категории туров в виде аккордеона */}
                {Object.entries(tours).map(([key, categoryTours]) => (
                    <AccordionCategory
                        key={key}
                        title={categoryTitles[key] || 'Неизвестная категория'} // Заголовок категории
                        tours={categoryTours} // Туры в этой категории
                        isOpen={openCategory === key} // Открыта ли текущая категория
                        onToggle={() => handleToggleCategory(key)} // Обработчик переключения
                        onEdit={handleEdit} // Передаем функцию редактирования
                        onDelete={handleDelete} // Передаем функцию удаления
                    />
                ))}
            </div>

            {/* Модальное окно формы для добавления/редактирования туров */}
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

// Вспомогательный компонент для AccordionCategory, чтобы не дублировать код в TourManager
const AccordionCategory = ({ title, tours, isOpen, onToggle, onEdit, onDelete }) => (
    <div className={styles.accordionItem}>
        <button className={styles.accordionHeader} onClick={onToggle}>
            <span>{title} ({tours?.length || 0})</span>
            <FiChevronDown className={`${styles.accordionIcon} ${isOpen ? styles.open : ''}`} />
        </button>
        {isOpen && (
            <div className={styles.accordionContentWrapper}>
                {!tours || tours.length === 0 ? (
                    <p className={styles.noItems}>В этой категории пока нет туров.</p>
                ) : (
                    <div className={styles.tourGrid}>
                        {tours.map((tour) => (
                            <div key={tour.id} className={styles.tourItemAdmin}>
                                <img 
                                    src={tour.image_url} // ИСПРАВЛЕНО: tour.image -> tour.image_url
                                    alt={tour.title} 
                                    className={styles.tourImageAdmin} 
                                    onError={(e) => { 
                                        e.target.onerror = null; 
                                        e.target.src = '/placeholder.png'; // Заглушка
                                    }} 
                                />
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
                        ))}
                    </div>
                )}
            </div>
        )}
    </div>
);
