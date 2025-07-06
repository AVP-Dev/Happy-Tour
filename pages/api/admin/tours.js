// pages/api/admin/tours.js
import prisma from '../../../lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

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
                // --- ИЗМЕНЕНО: Просто получаем данные как есть ---
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
                        image_url, // Сохраняем относительный путь, который пришел от /api/upload
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
                // --- ИЗМЕНЕНО: Просто получаем данные как есть ---
                const { id, title, description, price, currency, category, image_url, published } = req.body;

                if (!id) {
                    return res.status(400).json({ message: 'ID тура не указан для обновления.' });
                }

                const updatedTour = await prisma.tour.update({
                    where: { id: id },
                    data: {
                        title,
                        description,
                        price: parseFloat(price),
                        currency,
                        category,
                        image_url, // Сохраняем относительный или абсолютный путь как есть
                        published: published,
                        updatedById: userId,
                    },
                });
                
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
                
                if (tourToDelete.image_url && tourToDelete.image_url.startsWith('/')) {
                    const imagePath = path.join(process.cwd(), 'public', tourToDelete.image_url);
                     try {
                        await fs.unlink(imagePath);
                    } catch (fsError) {
                        console.warn(`Не удалось удалить файл изображения: ${imagePath}`, fsError.message);
                    }
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
