// components/admin/TourManager.js
// Компонент для управления турами в административной панели.

import { useState } from 'react';
import dynamic from 'next/dynamic';
// Импорт необходимых иконок из react-icons
import { FiChevronDown, FiEdit2, FiTrash2, FiPlus, FiPlusCircle } from 'react-icons/fi';
import styles from '../../styles/Admin.module.css';

// Динамически импортируем форму TourForm, чтобы она не влияла на начальную загрузку
const TourForm = dynamic(() => import('./TourForm')); 

/**
 * Компонент TourCategory отображает туры в рамках одной категории в виде аккордеона.
 * Теперь принимает `isOpen` и `onToggle` в качестве пропсов для внешнего управления состоянием.
 * @param {object} props - Свойства компонента.
 * @param {string} props.categoryName - Название категории.
 * @param {Array<object>} props.tours - Массив туров в этой категории.
 * @param {function} props.onEdit - Функция для редактирования тура.
 * @param {function} props.onDelete - Функция для удаления тура.
 * @param {boolean} props.isOpen - Определяет, открыт ли аккордеон.
 * @param {function} props.onToggle - Функция для переключения состояния аккордеона.
 */
const TourCategory = ({ categoryName, tours, onEdit, onDelete, isOpen, onToggle }) => {
    // УДАЛЕНО: useState для isOpen, теперь состояние контролируется извне
    // const [isOpen, setIsOpen] = useState(true); 

    return (
        <div className={styles.accordionItem}>
            {/* Кнопка заголовка аккордеона. Использует onToggle из пропсов. */}
            <button className={styles.accordionHeader} onClick={onToggle}>
                <span>{categoryName} ({tours?.length || 0})</span>
                {/* Иконка-индикатор состояния аккордеона. Класс зависит от isOpen из пропсов. */}
                <FiChevronDown className={`${styles.accordionIcon} ${isOpen ? styles.open : ''}`} />
            </button>
            {/* Контент аккордеона, который плавно открывается/закрывается. Класс зависит от isOpen из пропсов. */}
            <div className={`${styles.accordionContentWrapper} ${isOpen ? styles.open : ''}`}>
                {/* Если туров нет, показываем соответствующее сообщение */}
                {!tours || tours.length === 0 ? (
                    <p className={styles.noItems}>В этой категории пока нет туров.</p>
                ) : (
                    // Рендерим туры в виде сетки
                    <div className={styles.tourGrid}> 
                        {tours.map((tour) => (
                            <div key={tour.id} className={styles.tourItemAdmin}>
                                {/* Изображение тура с заглушкой на случай ошибки */}
                                <img 
                                    src={tour.image_url} 
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
        </div>
    );
};

/**
 * Основной компонент TourManager для управления турами в административной панели.
 * @param {object} props - Свойства компонента.
 * @param {Array<object>} props.tours - Массив всех туров, полученных из API.
 * @param {function} props.onDataChange - Функция для обновления данных после изменений.
 * @param {function} props.showNotification - Функция для показа уведомлений.
 * @param {function} props.showConfirm - Функция для показа окна подтверждения.
 */
export default function TourManager({ tours, onDataChange, showNotification, showConfirm }) {
    // Состояние для открытия/закрытия модального окна формы
    const [isModalOpen, setIsModalOpen] = useState(false); 
    // Конфигурация формы (режим: добавление/редактирование, данные тура)
    const [formConfig, setFormConfig] = useState({ mode: 'add', data: null }); 
    // Состояние для активной (открытой) категории аккордеона по умолчанию
    const [openCategory, setOpenCategory] = useState('hot'); 

    // Определяем заголовки для каждой категории туров
    const categoryTitles = {
        hot: 'Горящие туры',
        popular: 'Популярные направления',
        special: 'Выгодные предложения',
    };

    /**
     * Группировка туров по категориям.
     * `tours` приходит как плоский массив, его нужно сгруппировать по ключам категорий.
     */
    const groupedTours = Object.keys(categoryTitles).reduce((acc, key) => {
        // Фильтруем туры по текущей категории. Если туры не загружены, возвращаем пустой массив.
        acc[key] = tours?.filter(tour => tour.category === key) || [];
        return acc;
    }, {});

    /**
     * Обработчик переключения категории аккордеона.
     * Если кликаем по уже открытой категории, закрываем ее. Иначе открываем.
     * @param {string} categoryKey - Ключ категории для переключения.
     */
    const handleToggleCategory = (categoryKey) => {
        setOpenCategory(prev => (prev === categoryKey ? null : categoryKey));
    };

    /**
     * Обработчик добавления нового тура.
     * Открывает форму в режиме добавления, устанавливает категорию по умолчанию.
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
     * Показывает окно подтверждения, затем отправляет запрос на удаление в API.
     * @param {string} tourId - ID тура для удаления.
     */
    const handleDelete = (tourId) => {
        console.log('[CLIENT] Attempting to delete tour with ID:', tourId); // ОТЛАДКА: Лог ID перед удалением
        showConfirm('Вы уверены, что хотите удалить этот тур? Это действие необратимо.', async () => {
            try {
                const res = await fetch('/api/admin/tours', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' }, // <-- КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: Добавлен Content-Type
                    body: JSON.stringify({ id: tourId }),
                });
                const result = await res.json();
                console.log('[CLIENT] Delete API response:', result); // ОТЛАДКА: Лог ответа от API после удаления
                if (!res.ok) throw new Error(result.message);
                showNotification({type: 'success', message: 'Тур успешно удален!'});
                onDataChange(); // Обновляем данные после успешного удаления
            } catch (error) {
                console.error('[CLIENT] Error deleting tour:', error); // ОТЛАДКА: Лог ошибки удаления на клиенте
                showNotification({type: 'error', message: `Ошибка удаления: ${error.message}`});
            }
        });
    };

    // Если туры еще не загружены, показываем сообщение о загрузке
    if (!tours) return <p>Загрузка туров...</p>;

    return (
        <div>
            {/* Заголовок раздела и кнопка добавления тура */}
            <div className={styles.contentHeader} style={{marginBottom: "2rem"}}>
                {/* Пустой div для выравнивания, если нет других элементов в заголовке */}
                <div/>
                {/* Кнопка добавления нового тура (общая для всех категорий) */}
                <button onClick={() => handleAdd(openCategory || 'hot')} className={`${styles.button} ${styles.primaryButton}`}>
                    <FiPlus />
                    <span>Добавить тур</span>
                </button>
            </div>

            {/* Контейнер для аккордеонов категорий туров */}
            <div className={styles.accordionContainer}>
                {/* Рендеринг каждой категории туров в виде аккордеона */}
                {Object.entries(groupedTours).map(([key, categoryTours]) => (
                    <TourCategory
                        key={key}
                        categoryName={categoryTitles[key] || 'Неизвестная категория'} // Заголовок категории
                        tours={categoryTours} // Туры в этой категории
                        onEdit={handleEdit} // Передаем функцию редактирования
                        onDelete={handleDelete} // Передаем функцию удаления
                        // ПЕРЕДАЕМ И ИСПОЛЬЗУЕМ СОСТОЯНИЕ И ФУНКЦИЮ ПЕРЕКЛЮЧЕНИЯ ИЗ РОДИТЕЛЯ
                        isOpen={openCategory === key} // Определяем, открыт ли текущий аккордеон
                        onToggle={() => handleToggleCategory(key)} // Передаем функцию для переключения
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
