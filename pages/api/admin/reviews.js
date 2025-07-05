// pages/api/admin/reviews.js
import prisma from '../../../lib/prisma';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
    const session = await getSession({ req });

    if (!session || !['admin', 'super_admin'].includes(session.user.role)) {
        return res.status(401).json({ message: 'Неавторизованный доступ.' });
    }

    if (req.method === 'GET') {
        try {
            const reviews = await prisma.review.findMany({
                orderBy: {
                    createdAt: 'desc',
                },
            });

            // ИСПРАВЛЕНИЕ: Сериализуем данные перед отправкой клиенту.
            // Преобразуем типы Date в строки ISO и Decimal в Number.
            const serializedReviews = reviews.map(review => ({
                ...review,
                rating: Number(review.rating),
                date: review.date.toISOString(),
                createdAt: review.createdAt.toISOString(),
                updatedAt: review.updatedAt.toISOString(),
            }));

            return res.status(200).json(serializedReviews);
        } catch (error) {
            console.error("Ошибка при получении отзывов для админки:", error);
            return res.status(500).json({ message: 'Ошибка сервера при получении отзывов.' });
        }
    } 
    
    if (req.method === 'PUT') {
        const { id, status } = req.body;
        if (!id || !status) {
            return res.status(400).json({ message: 'Отсутствуют ID отзыва или новый статус.' });
        }

        try {
            const updatedReview = await prisma.review.update({
                where: { id },
                data: { status },
            });
            return res.status(200).json(updatedReview);
        } catch (error) {
            console.error(`Ошибка при обновлении статуса отзыва ${id}:`, error);
            return res.status(500).json({ message: 'Ошибка сервера при обновлении статуса.' });
        }
    } 
    
    if (req.method === 'DELETE') {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ message: 'Отсутствует ID отзыва для удаления.' });
        }

        try {
            await prisma.review.delete({
                where: { id },
            });
            return res.status(200).json({ message: 'Отзыв успешно удален.' });
        } catch (error) {
            console.error(`Ошибка при удалении отзыва ${id}:`, error);
            return res.status(500).json({ message: 'Ошибка сервера при удалении отзыва.' });
        }
    } 
    
    // Если метод не GET, PUT или DELETE
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Метод ${req.method} не разрешен`);
}
