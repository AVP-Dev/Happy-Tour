// components/Hero.js
import Image from 'next/image';
import styles from '../styles/Hero.module.css';

// A tiny 1x1 transparent pixel for blurring
const BLUR_DATA_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII=';

const Hero = ({ onSearchClick }) => {
    return (
        <section className={styles.hero} id="home">
            {/* Using next/image for the background */}
            <Image
                src="/img/hero-background.webp"
                alt="Красивый пляж и океан на закате"
                fill
                style={{ objectFit: 'cover', zIndex: 0 }}
                priority 
                sizes="100vw"
                quality={85}
                // --- PERFORMANCE FIX: Added blur placeholder ---
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
            />
            <div className={styles.hero_overlay}></div>
            <div className={`container ${styles.hero_content}`}>
                <h1 className={styles.hero_title}>Мир путешествий начинается здесь</h1>
                <p className={styles.hero_text}>Подбираем идеальные туры по всему миру. Ваше путешествие мечты ждет!</p>
                <button onClick={onSearchClick} className="btn btn-primary">
                    Подобрать тур
                </button>
            </div>
        </section>
    );
};

export default Hero;
