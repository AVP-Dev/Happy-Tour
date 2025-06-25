// pages/api/admin/reviews/index.js
// Этот маршрут API управляет получением и добавлением отзывов для административной панели,
// а также обработкой POST-запросов на изменение статуса отзыва (публикация/удаление).
// Использует SQLite через Prisma.

import { getToken } from 'next-auth/jwt'; // Для защиты маршрута
import prisma from '../../../../lib/prisma'; // Prisma Client для работы с SQLite

export default async function handler(req, res) {
    if (req.method === 'GET') {
        // Получение всех отзывов для админ-панели (включая pending и published)
        // Проверяем аутентификацию администратора
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        if (!token) {
            return res.status(401).json({ message: 'Не авторизован' });
        }
        try {
            const reviewsList = await prisma.review.findMany({
                orderBy: {
                    date: 'desc', // Сортируем по дате в убывающем порядке
                },
            });
            return res.status(200).json(reviewsList);
        } catch (error) {
            console.error("Ошибка получения отзывов для админки:", error);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
    
    if (req.method === 'POST') {
        // Этот POST используется для изменения статуса отзыва (публикация/удаление)
        // из компонента ReviewManager, который использует /api/admin/reviews
        // (хотя ReviewManager теперь использует [id].js для этих действий,
        // этот маршрут оставим для обратной совместимости или если есть другие POST-запросы)
        
        // Проверяем аутентификацию администратора
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        if (!token) {
            return res.status(401).json({ message: 'Не авторизован' });
        }

        const { action, reviewId, author, text, status } = req.body;

        try {
            if (action === 'publish' || action === 'unpublish') {
                // Изменение статуса отзыва
                if (!reviewId) return res.status(400).json({ message: 'ID отзыва обязателен.' });
                const newStatus = action === 'publish' ? 'published' : 'pending';
                await prisma.review.update({
                    where: { id: reviewId },
                    data: { status: newStatus },
                });
                return res.status(200).json({ message: `Отзыв успешно ${action === 'publish' ? 'опубликован' : 'снят с публикации'}.` });
            } else if (action === 'delete') {
                // Удаление отзыва
                if (!reviewId) return res.status(400).json({ message: 'ID отзыва обязателен.' });
                await prisma.review.delete({ where: { id: reviewId } });
                return res.status(200).json({ message: 'Отзыв успешно удален.' });
            } else if (author && text) {
                // Добавление нового отзыва (если этот маршрут используется для этого)
                const newReview = await prisma.review.create({
                    data: {
                        author,
                        text,
                        status: 'pending', // Новые отзывы всегда на модерации
                    },
                });
                return res.status(201).json({ message: 'Спасибо! Ваш отзыв отправлен на модерацию.', id: newReview.id });
            } else {
                return res.status(400).json({ message: 'Неизвестное действие или отсутствуют обязательные поля.' });
            }
        } catch (error) {
            console.error("Ошибка при обработке запроса отзывов:", error);
            return res.status(500).json({ message: 'Ошибка сервера при обработке отзыва.' });
        }
    }

    // Если метод запроса не разрешен
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
