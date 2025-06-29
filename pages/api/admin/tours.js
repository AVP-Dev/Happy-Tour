// pages/api/admin/tours.js
// Этот маршрут API управляет турами (получение, добавление, обновление, удаление)
// с использованием SQLite и локального хранения изображений.

import { getToken } from 'next-auth/jwt'; // Для защиты маршрута
import prisma from '../../../lib/prisma'; // Prisma Client для работы с SQLite
import path from 'path'; // Для работы с путями файловой системы
import fs from 'fs/promises'; // Для асинхронных операций с файловой системой
import formidable from 'formidable'; // Для обработки multipart/form-data (загрузка файлов)
import { v4 as uuidv4 } from 'uuid'; // Для генерации уникальных ID файлов

// ОПРЕДЕЛЕНИЕ ПУТИ ДЛЯ ЗАГРУЗКИ ИЗОБРАЖЕНИЙ ВНУТРИ КОНТЕЙНЕРА COOLIFY
// `process.cwd()` в Next.js продакшен сборке внутри контейнера Docker
// будет указывать на корневую директорию приложения (обычно `/app`).
// `public` - это стандартная директория Next.js для статических файлов,
// которая должна быть доступна.
// Если в Coolify настроено монтирование Host Path -> Container Path
// `/var/lib/happytour_data/uploads` -> `/app/public/uploads` (или `/app/public/uploads/tours`),
// то `path.join(process.cwd(), 'public', 'uploads', 'tours')` будет корректно
// разрешаться в `/app/public/uploads/tours`.
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'tours');

// Отключаем встроенный парсер body Next.js для обработки FormData
// Это необходимо, чтобы formidable мог полностью контролировать парсинг тела запроса.
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Вспомогательная функция для проверки и создания директории, если она не существует.
 * @param {string} dirPath - Путь к директории.
 */
async function ensureDirExists(dirPath) {
  try {
    await fs.access(dirPath); // Проверяем доступность директории
  } catch (e) {
    if (e.code === 'ENOENT') { // Если директория не существует
      await fs.mkdir(dirPath, { recursive: true }); // Создаем ее рекурсивно
      console.log(`[SERVER] Директория для загрузок создана: ${dirPath}`); 
    } else {
      // Перебрасываем другие ошибки доступа
      throw e;
    }
  }
}

export default async function handler(req, res) {
    console.log(`[SERVER] Received ${req.method} request to /api/admin/tours`); 

    // Проверяем аутентификацию администратора
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
        console.warn('[SERVER] Неавторизованный доступ к /api/admin/tours'); 
        return res.status(401).json({ message: 'Не авторизован' });
    }

    // Убедимся, что директория для загрузок существует перед началом операций
    try {
        await ensureDirExists(UPLOADS_DIR);
    } catch (dirError) {
        console.error('[SERVER] Ошибка создания директории для загрузок:', dirError); 
        return res.status(500).json({ message: 'Ошибка сервера: не удалось подготовить директорию для загрузок.' });
    }

    if (req.method === 'GET') {
        // Получение всех туров
        try {
            const tours = await prisma.tour.findMany({
                orderBy: {
                    createdAt: 'desc', // Сортируем по дате создания
                },
            });
            console.log(`[SERVER] Отправка ${tours.length} туров.`); 
            return res.status(200).json(tours);
        } catch (error) {
            console.error('[SERVER] Ошибка получения туров:', error); 
            return res.status(500).json({ message: 'Ошибка получения туров' });
        }
    } else if (req.method === 'POST' || req.method === 'PUT') {
        // Добавление нового тура или обновление существующего
        const form = formidable({
            uploadDir: UPLOADS_DIR, // Временная директория для загрузки файлов
            keepExtensions: true, // Сохранять расширения файлов (например, .jpg, .png)
            maxFileSize: 5 * 1024 * 1024, // Максимальный размер файла: 5MB
            allowEmptyFiles: true, // Разрешить пустые файлы (если поле файла не заполнено)
            minFileSize: 0,
            filename: (name, ext, part) => {
                // Генерируем уникальное имя файла для предотвращения конфликтов
                const uniqueFilename = `${uuidv4()}-${part.originalFilename}`;
                console.log(`[SERVER] Generated unique filename for upload: ${uniqueFilename}`); 
                return uniqueFilename;
            },
        });

        let fields, files;
        try {
            // Парсим входящий запрос для получения полей формы и файлов
            [fields, files] = await form.parse(req);
            console.log('[SERVER] API received fields:', fields); 
            console.log('[SERVER] API received files:', files); 
        } catch (err) {
            console.error('[SERVER] Ошибка парсинга формы formidable:', err); 
            if (err.code === formidable.errors.biggerThanMaxFileSize) {
                return res.status(400).json({ message: 'Файл слишком большой (макс. 5 МБ).' });
            }
            return res.status(500).json({ message: 'Ошибка обработки запроса.' });
        }

        // Преобразуем поля формы в простой объект
        const data = Object.fromEntries(
            Object.entries(fields).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
        );
        console.log('[SERVER] Parsed form data:', data); 

        let imageUrl = data.image_url; // Существующий URL изображения из формы (при редактировании)

        // Если был загружен новый файл изображения
        if (files.image && files.image.length > 0) {
            const uploadedFile = files.image[0];
            // image_url будет относительным путем от public директории
            // Проверяем существование uploadedFile.filepath перед использованием
            if (uploadedFile.filepath) {
                imageUrl = `/uploads/tours/${path.basename(uploadedFile.filepath)}`;
                console.log(`[SERVER] New image uploaded. Path: ${uploadedFile.filepath}, URL: ${imageUrl}`); 
            } else {
                console.error('[SERVER] Uploaded file filepath is undefined.');
                return res.status(500).json({ message: 'Ошибка загрузки файла: не удалось получить путь к файлу.' });
            }
        } else if (req.method === 'POST' && !imageUrl) {
            // При добавлении нового тура изображение обязательно
            console.error('[SERVER] Изображение отсутствует для нового тура (POST).'); 
            return res.status(400).json({ message: 'Изображение обязательно для нового тура.' });
        }
        console.log('[SERVER] Final image URL for DB:', imageUrl); 

        // Логика удаления старого файла при замене изображения (только при PUT)
        if (req.method === 'PUT' && data.id && files.image && files.image.length > 0) {
            try {
                const existingTour = await prisma.tour.findUnique({ where: { id: data.id } });
                if (existingTour && existingTour.image_url) {
                    const oldImagePath = path.join(process.cwd(), 'public', existingTour.image_url);
                    // Проверяем, существует ли файл и что новый URL отличается от старого,
                    // чтобы не удалить только что загруженный файл, если formidable его переместил.
                    // Также добавлена проверка, что файл вообще существует по старому пути
                    const oldFileExists = await fs.stat(oldImagePath).then(() => true).catch(() => false);
                    if (oldFileExists && existingTour.image_url !== imageUrl) {
                        await fs.unlink(oldImagePath);
                        console.log(`[SERVER] Удален старый файл изображения: ${oldImagePath}`); 
                    } else if (!oldFileExists) {
                         console.log(`[SERVER] Старый файл изображения не найден по пути: ${oldImagePath}. Возможно, он уже был удален.`); 
                    } else {
                         console.log(`[SERVER] Старый файл изображения не удален, так как URL нового совпадает или нет нового файла: ${oldImagePath}`); 
                    }
                }
            } catch (unlinkError) {
                console.error(`[SERVER] Ошибка при удалении файла изображения ${data.image_url}:`, unlinkError); 
                // ИСПРАВЛЕНО: Перебрасываем ошибку, чтобы внешний catch обработал её как JSON
                throw new Error(`Не удалось удалить файл изображения: ${unlinkError.message}`); 
            }
        }

        try {
            let tour;
            const tourData = {
                title: data.title,
                description: data.description,
                price: parseFloat(data.price), // Преобразуем цену в число
                currency: data.currency,
                category: data.category,
                image_url: imageUrl, // Сохраняем относительный путь
            };
            console.log('[SERVER] Data to be saved to DB:', tourData); 

            if (req.method === 'PUT') {
                // Обновляем существующий тур по ID
                tour = await prisma.tour.update({
                    where: { id: data.id },
                    data: tourData,
                });
                console.log('[SERVER] Tour successfully updated in DB:', tour.id); 
                return res.status(200).json({ message: 'Тур успешно обновлен!', id: tour.id });
            } else { // POST
                // Создаем новый тур
                tour = await prisma.tour.create({
                    data: tourData,
                });
                console.log('[SERVER] New tour successfully created in DB:', tour.id); 
                return res.status(201).json({ message: 'Тур успешно добавлен!', id: tour.id });
            }
        } catch (error) {
            console.error(`[SERVER] Ошибка сохранения тура (${req.method}):`, error); 
            // Добавляем более конкретную обработку ошибок Prisma, если есть
            if (error.code) {
                console.error(`[SERVER] Prisma Error Code: ${error.code}`);
            }
            return res.status(500).json({ message: `Ошибка сохранения тура: ${error.message}` });
        }

    } else if (req.method === 'DELETE') {
        // Удаление тура
        const { id } = req.body; // Получаем ID тура из тела запроса

        // ИСПРАВЛЕНО: Добавлена валидация UUID для ID
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
        if (!isUuid) {
            console.error('[SERVER] Попытка удаления с невалидным ID (не UUID):', id); 
            return res.status(400).json({ message: 'Неверный формат ID тура. Ожидается UUID.' });
        }

        try {
            console.log('[SERVER] Attempting to delete tour with ID:', id); 

            const tourToDelete = await prisma.tour.findUnique({ where: { id: id } });
            if (!tourToDelete) {
                console.warn(`[SERVER] Тур с ID ${id} не найден для удаления.`); 
                return res.status(404).json({ message: 'Тур не найден.' });
            }

            // Удаляем файл изображения с диска перед удалением записи из БД
            if (tourToDelete.image_url) {
                const imagePath = path.join(process.cwd(), 'public', tourToDelete.image_url);
                try {
                    // Проверяем, существует ли файл перед попыткой удаления
                    if (await fs.stat(imagePath).then(() => true).catch(() => false)) {
                        await fs.unlink(imagePath); // Удаляем файл
                        console.log(`[SERVER] Файл изображения удален: ${imagePath}`); 
                    } else {
                        console.warn(`[SERVER] Файл изображения не найден по пути: ${imagePath}. Возможно, он уже был удален.`);
                    }
                } catch (fileError) {
                    console.error(`[SERVER] Ошибка при удалении файла изображения ${imagePath}:`, fileError); 
                    // ИСПРАВЛЕНО: Перебрасываем ошибку, чтобы внешний catch обработал её как JSON
                    throw new Error(`Не удалось удалить файл изображения: ${fileError.message}`); 
                }
            }

            // Удаляем запись о туре из базы данных
            await prisma.tour.delete({ where: { id: id } });
            console.log(`[SERVER] Тур с ID ${id} успешно удален из БД.`); 
            return res.status(200).json({ message: 'Тур и связанные файлы успешно удалены!' });
        } catch (error) {
            console.error('[SERVER] Ошибка удаления тура:', error); 
            if (error.code === 'P2025') { 
                return res.status(404).json({ message: 'Тур не найден для удаления.' });
            }
            return res.status(500).json({ message: `Ошибка удаления тура: ${error.message}` });
        }
    } else {
        // Если метод запроса не разрешен
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        console.warn(`[SERVER] Метод ${req.method} не разрешен для /api/admin/tours`); 
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
