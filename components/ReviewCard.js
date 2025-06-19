import styles from '../styles/ReviewCard.module.css';

const MAX_LENGTH = 150; 

const ReviewCard = ({ review, onReadMore }) => {
    if (!review || !review.text) {
        return null; 
    }

    const isLongText = review.text.length > MAX_LENGTH;
    const displayedText = isLongText ? `${review.text.substring(0, MAX_LENGTH)}...` : review.text;

    return (
        <div className={styles.card}>
            <div className={styles.content}>
                <p className={styles.text}>"{displayedText}"</p>
            </div>
            
            <div className={styles.authorAndButtonWrapper}>
                <span className={styles.author}>- {review.author || 'Аноним'}</span>
                
                {isLongText ? (
                    <button onClick={() => onReadMore(review)} className={styles.readMoreBtn}>
                        Читать далее
                    </button>
                ) : (
                    <span /> 
                )}
            </div>
        </div>
    );
};

export default ReviewCard;
