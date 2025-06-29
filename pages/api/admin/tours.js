// pages/api/admin/tours.js
// Этот маршрут API управляет созданием, чтением, обновлением и удалением туров.
// Использует SQLite через Prisma и formidable для загрузки файлов.

import prisma from '../../../lib/prisma'; // Prisma Client для работы с SQLite
import { IncomingForm } from 'formidable'; // Для обработки загрузки файлов
import fs from 'fs'; // Node.js File System module
import path from 'path'; // Node.js Path module
import { v4 as uuidv4 } from 'uuid'; // Для генерации уникальных имен файлов

// Отключение встроенного bodyParser Next.js, так как formidable будет обрабатывать тело запроса
export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
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
            console.error("Ошибка получения туров:", error);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    if (req.method === 'POST') {
        // Добавление нового тура
        const form = new IncomingForm({
            uploadDir: path.join(process.cwd(), 'public', 'uploads', 'tours'), // Директория для загрузки
            keepExtensions: true, // Сохранять расширение файла
            maxFileSize: 5 * 1024 * 1024, // Максимальный размер файла 5MB
        });

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error("Ошибка парсинга формы:", err);
                return res.status(500).json({ message: 'Ошибка загрузки файла.' });
            }

            console.log("[SERVER] API received fields:", fields);
            console.log("[SERVER] API received files:", files);

            const { title, description, price, currency, category } = Object.fromEntries(
                Object.keys(fields).map(key => [key, fields[key][0]])
            ); // formidable возвращает поля как массивы

            if (!title || !description || !price || !currency || !category) {
                // Если какой-то из обязательных полей отсутствует, удалить загруженный файл
                if (files.image && files.image[0]) {
                    fs.unlink(files.image[0].filepath, (unlinkErr) => {
                        if (unlinkErr) console.error("Ошибка удаления неиспользованного файла:", unlinkErr);
                    });
                }
                return res.status(400).json({ message: 'Отсутствуют обязательные поля.' });
            }

            console.log("[SERVER] Parsed form data:", { title, description, price, currency, category });

            let imageUrl = null;
            if (files.image && files.image[0]) {
                const oldPath = files.image[0].filepath;
                const fileExtension = path.extname(files.image[0].originalFilename);
                const newFilename = uuidv4() + fileExtension; // Генерируем уникальное имя файла
                const newPath = path.join(process.cwd(), 'public', 'uploads', 'tours', newFilename);

                // Переименовываем файл
                try {
                    fs.renameSync(oldPath, newPath);
                    imageUrl = `/uploads/tours/${newFilename}`; // URL, доступный публично
                    console.log(`[SERVER] New image uploaded. Path: ${newPath}, URL: ${imageUrl}`);
                } catch (renameErr) {
                    console.error("Ошибка переименования файла:", renameErr);
                    return res.status(500).json({ message: 'Ошибка сохранения изображения.' });
                }
            } else {
                console.log("[SERVER] No image file uploaded.");
            }

            // Конвертируем price в число, если это строка
            const parsedPrice = parseFloat(price);
            if (isNaN(parsedPrice)) {
                return res.status(400).json({ message: 'Неверный формат цены.' });
            }

            try {
                console.log("[SERVER] Data to be saved to DB:", {
                    title,
                    description,
                    price: parsedPrice,
                    currency,
                    category,
                    image_url: imageUrl, // Сохраняем URL изображения
                });

                const newTour = await prisma.tour.create({
                    data: {
                        title,
                        description,
                        price: parsedPrice,
                        currency,
                        category,
                        image_url: imageUrl, // Сохраняем URL изображения
                    },
                });
                console.log("[SERVER] New tour successfully created in DB:", newTour.id);
                return res.status(201).json({ message: 'Тур успешно добавлен!', tour: newTour });
            } catch (dbError) {
                console.error("Ошибка создания тура в БД:", dbError);
                // Если произошла ошибка БД, пытаемся удалить загруженный файл
                if (imageUrl && fs.existsSync(path.join(process.cwd(), 'public', imageUrl))) {
                    fs.unlink(path.join(process.cwd(), 'public', imageUrl), (unlinkErr) => {
                        if (unlinkErr) console.error("Ошибка удаления файла после ошибки БД:", unlinkErr);
                    });
                }
                return res.status(500).json({ message: 'Ошибка базы данных при создании тура.' });
            }
        });
        return; // Важно, чтобы избежать отправки ответа до завершения formidable.parse
    }

    if (req.method === 'PUT') {
        // Обновление существующего тура
        const form = new IncomingForm({
            uploadDir: path.join(process.cwd(), 'public', 'uploads', 'tours'),
            keepExtensions: true,
            maxFileSize: 5 * 1024 * 1024,
        });

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error("Ошибка парсинга формы для PUT:", err);
                return res.status(500).json({ message: 'Ошибка обработки данных для обновления.' });
            }

            console.log("[SERVER] API received fields for PUT:", fields);
            console.log("[SERVER] API received files for PUT:", files);

            const tourId = fields.id && fields.id[0]; // ID тура для обновления
            if (!tourId) {
                return res.status(400).json({ message: 'Tour ID is required for update.' });
            }

            const existingTour = await prisma.tour.findUnique({ where: { id: tourId } });
            if (!existingTour) {
                return res.status(404).json({ message: 'Tour not found.' });
            }

            const updateData = {};
            // Обновляем только те поля, которые были предоставлены
            if (fields.title && fields.title[0]) updateData.title = fields.title[0];
            if (fields.description && fields.description[0]) updateData.description = fields.description[0];
            if (fields.price && fields.price[0]) updateData.price = parseFloat(fields.price[0]);
            if (fields.currency && fields.currency[0]) updateData.currency = fields.currency[0];
            if (fields.category && fields.category[0]) updateData.category = fields.category[0];

            let newImageUrl = existingTour.image_url; // По умолчанию оставляем старое изображение
            if (files.image && files.image[0]) {
                const oldPath = files.image[0].filepath;
                const fileExtension = path.extname(files.image[0].originalFilename);
                const newFilename = uuidv4() + fileExtension;
                const newPath = path.join(process.cwd(), 'public', 'uploads', 'tours', newFilename);

                try {
                    fs.renameSync(oldPath, newPath);
                    newImageUrl = `/uploads/tours/${newFilename}`;

                    // Удаляем старое изображение, если оно есть и отличается от нового
                    if (existingTour.image_url && existingTour.image_url !== newImageUrl) {
                        const oldImagePath = path.join(process.cwd(), 'public', existingTour.image_url);
                        fs.unlink(oldImagePath, (unlinkErr) => {
                            if (unlinkErr) console.error("Ошибка удаления старого изображения:", unlinkErr);
                        });
                    }
                } catch (renameErr) {
                    console.error("Ошибка переименования нового файла для PUT:", renameErr);
                    return res.status(500).json({ message: 'Ошибка сохранения нового изображения.' });
                }
            }
            updateData.image_url = newImageUrl;

            try {
                const updatedTour = await prisma.tour.update({
                    where: { id: tourId },
                    data: updateData,
                });
                console.log("[SERVER] Tour successfully updated in DB:", updatedTour.id);
                return res.status(200).json({ message: 'Тур успешно обновлен!', tour: updatedTour });
            } catch (dbError) {
                console.error("Ошибка обновления тура в БД:", dbError);
                return res.status(500).json({ message: 'Ошибка базы данных при обновлении тура.' });
            }
        });
        return;
    }

    if (req.method === 'DELETE') {
        // Handle DELETE request for a tour
        try {
            const { id } = req.body; // Expecting ID in the request body from client
            if (!id) {
                console.error("[SERVER] DELETE request: Tour ID is missing from body.");
                return res.status(400).json({ message: 'Tour ID is required for deletion.' });
            }

            console.log(`[SERVER] Attempting to delete tour with ID: ${id}`);

            // Find the tour to get its image_url before deleting
            const tourToDelete = await prisma.tour.findUnique({
                where: { id: id },
            });

            if (!tourToDelete) {
                console.error(`[SERVER] Tour with ID ${id} not found for deletion.`);
                return res.status(404).json({ message: 'Tour not found.' });
            }

            // Delete the tour from the database
            await prisma.tour.delete({
                where: { id: id },
            });
            console.log(`[SERVER] Tour with ID ${id} deleted from database.`);

            // If an image is associated, attempt to delete it from the file system
            if (tourToDelete.image_url) {
                const imagePath = path.join(process.cwd(), 'public', tourToDelete.image_url);
                fs.unlink(imagePath, (err) => {
                    if (err) {
                        console.error(`[SERVER] Error deleting image file: ${imagePath}`, err);
                        // Log the error but don't prevent tour deletion in DB
                    } else {
                        console.log(`[SERVER] Successfully deleted image file: ${imagePath}`);
                    }
                });
            }

            return res.status(200).json({ message: 'Tour and associated image deleted successfully.' });
        } catch (error) {
            console.error("[SERVER] Error deleting tour:", error);
            // Changed to a more generic message for client-side
            return res.status(500).json({ message: 'Failed to delete tour due to an internal server error.' });
        }
    }

    // Если метод запроса не разрешен
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}