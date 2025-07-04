// components/TourCardSkeleton.js
// Этот компонент отображает заглушку (скелетон) для карточки тура во время загрузки данных.

import React from 'react';
import styles from '../styles/TourCardSkeleton.module.css';

const TourCardSkeleton = () => {
  return (
    <div className={styles.card}>
      <div className={styles.image}></div>
      <div className={styles.content}>
        <div className={styles.title}></div>
        <div className={styles.description}></div>
        <div className={styles.description_short}></div>
        <div className={styles.footer}>
          <div className={styles.price}></div>
          <div className={styles.button}></div>
        </div>
      </div>
    </div>
  );
};

export default TourCardSkeleton;
