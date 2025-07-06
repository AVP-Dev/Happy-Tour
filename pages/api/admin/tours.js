// pages/api/admin/tours.js
import prisma from '../../../lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

// Вспомогательная функция для удаления файла
async function deleteImageFile(imageUrl) {
    // Проверяем, что URL начинается с /api/images/
    if (imageUrl && imageUrl.startsWith('/api/images/')) {
        const imageName = imageUrl.split('/').pop(); // Получаем имя файла из URL
        // Формируем полный путь к файлу на сервере
        const imagePath = path.join(process.cwd(), 'public', 'uploads', 'tours', imageName);
        try {
            await fs.access(imagePath); // Проверяем, существует ли файл
            await fs.unlink(imagePath); // Удаляем файл
            console.log(`Файл изображения успешно удален: ${imagePath}`);
        } catch (fsError) {
            // Если файл не найден (ENOENT) или другая ошибка, логируем предупреждение
            console.warn(`Не удалось удалить файл изображения: ${imagePath}. Ошибка: ${fsError.message}`);
        }
    }
}

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !['admin', 'super_admin'].includes(session.user.role)) {
        return res.status(403).json({ message: 'Доступ запрещен' });
    }

    const userId = session.user.id;

    switch (req.method) {
        case 'GET':
            try {
                const tours = await prisma.tour.findMany({
                    orderBy: { createdAt: 'desc' },
                    include: {
                        createdBy: { select: { name: true, email: true } },
                        updatedBy: { select: { name: true, email: true } }
                    }
                });
                res.status(200).json(tours);
            } catch (error) {
                console.error("API GET /admin/tours Error:", error);
                res.status(500).json({ message: 'Ошибка при получении туров', error: error.message });
            }
            break;

        case 'POST':
            try {
                const { title, description, price, currency, category, image_url, published } = req.body;
                if (!title || !price || !category || !image_url) {
                    return res.status(400).json({ message: 'Не все обязательные поля заполнены.' });
                }
                
                const newTour = await prisma.tour.create({
                    data: {
                        title,
                        description,
                        price: parseFloat(price),
                        currency,
                        category,
                        image_url, 
                        published: published,
                        createdById: userId,
                        updatedById: userId,
                    },
                });
                res.status(201).json(newTour);
            } catch (error) {
                console.error("API POST /admin/tours Error:", error);
                res.status(500).json({ message: 'Ошибка при создании тура', error: error.message });
            }
            break;

        case 'PUT':
            try {
                const { id, title, description, price, currency, category, image_url, published } = req.body;

                if (!id) {
                    return res.status(400).json({ message: 'ID тура не указан для обновления.' });
                }

                // Находим текущий тур, чтобы получить старый URL изображения
                const existingTour = await prisma.tour.findUnique({ where: { id: id } });

                const updatedTour = await prisma.tour.update({
                    where: { id: id },
                    data: {
                        title,
                        description,
                        price: parseFloat(price),
                        currency,
                        category,
                        image_url, 
                        published: published,
                        updatedById: userId,
                    },
                });
                
                // Если URL изображения изменился, удаляем старый файл
                if (existingTour && existingTour.image_url && existingTour.image_url !== image_url) {
                    await deleteImageFile(existingTour.image_url);
                }

                res.status(200).json(updatedTour);
            } catch (error) {
                console.error("API PUT /admin/tours Error:", error);
                if (error.code === 'P2025') {
                    return res.status(404).json({ message: 'Тур с таким ID не найден.' });
                }
                res.status(500).json({ message: 'Ошибка при обновлении тура', error: error.message });
            }
            break;
            
        case 'PATCH':
            try {
                const { id, published } = req.body;
                if (!id || typeof published !== 'boolean') {
                    return res.status(400).json({ message: 'Некорректные данные для обновления статуса.' });
                }
                const updatedTour = await prisma.tour.update({
                    where: { id },
                    data: { 
                        published,
                        updatedById: userId,
                    },
                });
                res.status(200).json(updatedTour);
            } catch (error) {
                 console.error("API PATCH /admin/tours Error:", error);
                if (error.code === 'P2025') {
                    return res.status(404).json({ message: 'Тур с таким ID не найден.' });
                }
                res.status(500).json({ message: 'Ошибка при смене статуса публикации', error: error.message });
            }
            break;

        case 'DELETE':
            try {
                const { id } = req.query;
                if (!id) return res.status(400).json({ message: 'ID тура не указан' });

                const tourToDelete = await prisma.tour.findUnique({ where: { id } });
                if (!tourToDelete) return res.status(404).json({ message: 'Тур для удаления не найден' });
                
                // Удаляем связанное изображение перед удалением тура из БД
                if (tourToDelete.image_url) {
                    await deleteImageFile(tourToDelete.image_url);
                }

                await prisma.tour.delete({ where: { id } });
                res.status(200).json({ message: 'Тур успешно удален' });
            } catch (error) {
                console.error("API DELETE /admin/tours Error:", error);
                res.status(500).json({ message: 'Ошибка при удалении тура', error: error.message });
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
