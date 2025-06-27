// components/TourCard.js
import Image from 'next/image';
import styles from '../styles/TourCard.module.css';

// A tiny 1x1 transparent pixel for blurring
const BLUR_DATA_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII=';

const TourCard = ({ tour, onDetailsClick }) => {
    if (!tour || !tour.image || !tour.title) return null;
    
    const handleDetailsClick = () => {
        if (onDetailsClick) {
            onDetailsClick(tour);
        }
    };

    return (
        <div className={styles.card}>
            <div className={styles.image_container}>
               <Image 
                    src={tour.image} 
                    alt={tour.title} 
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className={styles.image}
                    // --- PERFORMANCE FIX: Added blur placeholder ---
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                />
            </div>
            <div className={styles.content}>
                <h3 className={styles.title}>{tour.title}</h3>
                <p className={styles.description}>{tour.description}</p>
                <div className={styles.footer}>
                    <div className={styles.price}>
                        <span>от</span> {tour.price} {tour.currency || '$'}
                    </div>
                    <button onClick={handleDetailsClick} className={styles.button}>
                        Подробнее
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TourCard;
