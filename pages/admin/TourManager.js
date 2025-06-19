import { useState } from 'react';
import { useRouter } from 'next/router';
import { FiChevronDown, FiEdit2, FiTrash2, FiPlusCircle } from 'react-icons/fi';
import styles from '../../styles/Admin.module.css';

// Компонент для отдельной категории туров (аккордеон)
const TourCategory = ({ categoryName, tours, onEdit, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={styles.accordionItem}>
            <button className={styles.accordionHeader} onClick={() => setIsOpen(!isOpen)}>
                <span>{categoryName} ({tours.length})</span>
                <FiChevronDown className={`${styles.accordionIcon} ${isOpen ? styles.open : ''}`} />
            </button>
            <div className={`${styles.accordionContent} ${isOpen ? styles.open : ''}`}>
                {tours.map((tour, id) => (
                    <div key={id} className={styles.tourItemAdmin}>
                        <img src={tour.image} alt={tour.title} className={styles.tourImageAdmin} />
                        <div className={styles.tourInfoAdmin}>
                            <strong>{tour.title}</strong>
                            <p>{tour.description}</p>
                            <span>{tour.price}</span>
                        </div>
                        <div className={styles.tourActionsAdmin}>
                            <button onClick={() => onEdit(categoryName, id)} className={styles.editBtn}><FiEdit2 /></button>
                            <button onClick={() => onDelete(categoryName, id)} className={styles.deleteBtn}><FiTrash2 /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


export default function TourManager({ initialData }) {
    const router = useRouter();
    // Здесь должна быть логика для добавления/редактирования/удаления туров
    // Для демонстрации дизайна она упрощена

    const refreshData = () => router.replace(router.asPath);

    const handleEdit = (category, id) => {
        alert(`Редактирование тура "${initialData[category][id].title}"`);
        // Здесь будет логика открытия модального окна с формой
    };

    const handleDelete = async (category, id) => {
        if (confirm('Вы уверены, что хотите удалить этот тур?')) {
            const formData = new FormData();
            formData.append('action', 'delete_tour');
            formData.append('category', category.toLowerCase()); // 'Hot Tours' -> 'hot'
            formData.append('tourId', id);
            
            await fetch('/api/admin/tours', { method: 'POST', body: formData });
            refreshData();
        }
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
                <button className={styles.addButton}>
                    <FiPlusCircle />
                    <span>Добавить тур</span>
                </button>
            </div>
            <div className={styles.accordion}>
                {Object.entries(initialData).map(([key, value]) => (
                    <TourCategory
                        key={key}
                        categoryName={categoryTitles[key]}
                        tours={value}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                ))}
            </div>
        </div>
    );
}
export async function getServerSideProps(context) {
  // Эта функция говорит Next.js, что страница динамическая.
  // Ее содержимое пока не важно, главное - само ее наличие.
  return {
    props: {},
  };
}