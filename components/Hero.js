import styles from '../styles/Hero.module.css';

/**
 * Hero-компонент (главный экран).
 * (React v18, Next.js v14)
 * @param {object} props - Свойства компонента.
 * @param {function} props.onSearchClick - Функция обратного вызова для клика по кнопке.
 */
const Hero = ({ onSearchClick }) => {
    return (
        <section className={styles.hero} id="home">
            <div className={styles.hero_overlay}></div>
            <div className={`container ${styles.hero_content}`}>
                {/* ИЗМЕНЕНИЕ: Тексты стали более живыми и универсальными */}
                <h1 className={styles.hero_title}>Мир путешествий начинается здесь</h1>
                <p className={styles.hero_text}>Подбираем идеальные туры по всему миру. От пляжного отдыха до захватывающих приключений — ваше путешествие мечты ждет!</p>
                
                <button onClick={onSearchClick} className="btn btn-primary">
                    Подобрать тур
                </button>
            </div>
        </section>
    );
};

export default Hero;
