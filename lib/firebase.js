// lib/firebase.js
// Этот файл инициализирует клиентский Firebase SDK.
// Он настроен для использования только Firebase Authentication,
// поскольку Firestore и Storage теперь не используются для данных сайта.

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth"; 
// getFirestore и getStorage удалены, так как они больше не используются

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, // Оставим на случай, если вам понадобится этот бакет для чего-то другого в будущем, но для изображений он не используется.
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Инициализируем Firebase App, если он еще не инициализирован
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Получаем экземпляр Firebase Authentication
const auth = getAuth(app);
// db (Firestore) и storage (Storage) больше не инициализируются и не экспортируются.

// ВРЕМЕННЫЙ КОД ДЛЯ ОТЛАДКИ: Сделать 'auth' доступным в консоли браузера.
// Это полезно для отладки в development-среде, но должно быть удалено в production.
if (typeof window !== 'undefined') {
  window._debugFirebaseAuth = auth;
}

// Экспортируем только 'auth'
export { auth };
