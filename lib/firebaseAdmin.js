// lib/firebaseAdmin.js
// Этот файл инициализирует Firebase Admin SDK.
// Он загружает учетные данные сервисного аккаунта напрямую из переменной окружения,
// что более надежно для сред, таких как Coolify.

import admin from 'firebase-admin';

// Получаем JSON-строку учетных данных из переменной окружения.
// Важно, чтобы эта переменная была корректно настроена в среде Coolify.
const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

let serviceAccount = null;
if (serviceAccountString) {
  try {
    // Парсим JSON-строку.
    // Если ключ private_key содержит символы новой строки, они должны быть экранированы (\n).
    serviceAccount = JSON.parse(serviceAccountString);
    console.log("Firebase Admin SDK: serviceAccountString успешно загружен и распарсен.");
  } catch (error) {
    console.error("Firebase Admin SDK: Ошибка при парсинге FIREBASE_SERVICE_ACCOUNT_KEY:", error.message);
    console.warn("Firebase Admin SDK не будет инициализирован. Функции администратора могут не работать.");
  }
} else {
  console.warn("Firebase Admin SDK: FIREBASE_SERVICE_ACCOUNT_KEY не установлен в переменных окружения. Функции администратора могут не работать.");
}

// Инициализируем Firebase Admin SDK, если он еще не инициализирован
if (!admin.apps.length) {
  if (serviceAccount) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        // Используем NEXT_PUBLIC_FIREBASE_PROJECT_ID из .env для databaseURL
        databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`, 
      });
      console.log("Firebase Admin SDK инициализирован успешно.");
    } catch (error) {
      console.error("Ошибка инициализации Firebase Admin SDK:", error.message);
    }
  }
}

// Экспортируем auth из Admin SDK, которое будет использоваться для генерации Custom Token
const adminAuth = admin.apps.length ? admin.auth() : null;

export { adminAuth };
