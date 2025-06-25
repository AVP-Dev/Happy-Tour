// lib/firebaseAdmin.js
// Этот файл инициализирует Firebase Admin SDK.
// Он загружает учетные данные сервисного аккаунта из файла JSON,
// а не из переменной окружения, чтобы избежать проблем с парсингом многострочных ключей.

import admin from 'firebase-admin';
import path from 'path'; // Для работы с путями файловой системы
import fs from 'fs';   // Для чтения файлов

// Путь к файлу serviceAccountKey.json
// Предполагаем, что serviceAccountKey.json находится в корне проекта
// или в директории lib. Измените путь, если ваш файл находится в другом месте.
const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccountKey.json');
// Если файл serviceAccountKey.json находится в той же директории, что и firebaseAdmin.js:
// const serviceAccountPath = path.resolve(__dirname, 'serviceAccountKey.json');


let serviceAccount = null;
try {
  // Читаем файл serviceAccountKey.json
  const rawServiceAccount = fs.readFileSync(serviceAccountPath, 'utf8');
  serviceAccount = JSON.parse(rawServiceAccount);
  console.log("Firebase Admin SDK: serviceAccountKey.json успешно загружен.");
} catch (error) {
  console.error("Firebase Admin SDK: Ошибка при загрузке или парсинге serviceAccountKey.json:", error.message);
  console.warn("Firebase Admin SDK не будет инициализирован. Функции администратора могут не работать.");
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
