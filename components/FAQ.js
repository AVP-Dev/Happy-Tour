import { useState } from 'react';
import { FaPlus, FaMinus } from 'react-icons/fa';
import styles from '../styles/FAQ.module.css';

// Компонент одного элемента списка (вопрос-ответ)
// Теперь он не хранит свое состояние, а получает его от родителя
const FAQItem = ({ item, isOpen, onToggle }) => {
    return (
        <div className={styles.faq_item}>
            {/* При клике вызывается функция, переданная из родителя */}
            <button className={styles.faq_question} onClick={onToggle}>
                <span>{item.q}</span>
                {/* Иконка и видимость ответа зависят от пропса isOpen */}
                <span className={styles.icon}>{isOpen ? <FaMinus /> : <FaPlus />}</span>
            </button>
            <div className={`${styles.faq_answer_wrapper} ${isOpen ? styles.open : ''}`}>
                <div className={styles.faq_answer_content}>
                    <p>{item.a}</p>
                </div>
            </div>
        </div>
    );
};

// Родительский компонент FAQ, который теперь управляет состоянием
const FAQ = ({ items = [] }) => {
    // Состояние для хранения индекса открытого элемента. null - все закрыты.
    const [openIndex, setOpenIndex] = useState(null);

    // Функция для переключения состояния
    const handleToggle = (index) => {
        // Если кликнули по уже открытому элементу, закрываем его (null).
        // Если кликнули по закрытому, открываем его (сохраняем его индекс).
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className={styles.faq_container}>
            {items.map((item, index) => (
                <FAQItem
                    key={index}
                    item={item}
                    // Передаем, должен ли этот конкретный элемент быть открыт
                    isOpen={openIndex === index}
                    // Передаем функцию, которая будет вызвана при клике
                    onToggle={() => handleToggle(index)}
                />
            ))}
        </div>
    );
};

export default FAQ;
