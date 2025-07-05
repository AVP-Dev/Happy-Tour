// pages/api/admin/reviews.js
import prisma from '../../../lib/prisma';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
    const session = await getSession({ req });

    // Проверка аутентификации и роли администратора
    if (!session || !session.user || session.user.role !== 'admin') {
        return res.status(403).json({ message: 'Доступ запрещен. Требуются права администратора.' });
    }

    if (req.method === 'GET') {
        try {
            const reviews = await prisma.review.findMany({
                orderBy: { createdAt: 'desc' },
            });
            return res.status(200).json(reviews);
        } catch (error) {
            console.error('Ошибка при получении отзывов:', error);
            return res.status(500).json({ message: 'Не удалось получить отзывы.' });
        }
    } else if (req.method === 'PUT') {
        // Редактирование отзыва
        const { id, author, text, rating, status } = req.body;

        if (!id || !author || !text || !rating || !status) {
            return res.status(400).json({ message: 'Все поля отзыва обязательны для обновления.' });
        }

        try {
            const updatedReview = await prisma.review.update({
                where: { id },
                data: {
                    author,
                    text,
                    rating: parseInt(rating), // Убедитесь, что рейтинг является числом
                    status,
                },
            });
            return res.status(200).json({ message: 'Отзыв успешно обновлен.', review: updatedReview });
        } catch (error) {
            console.error('Ошибка при обновлении отзыва:', error);
            return res.status(500).json({ message: 'Не удалось обновить отзыв.' });
        }
    } else if (req.method === 'DELETE') {
        // Удаление отзыва
        const { id } = req.query; // ID отзыва будет в query параметрах для DELETE запроса

        if (!id) {
            return res.status(400).json({ message: 'ID отзыва обязателен для удаления.' });
        }

        try {
            await prisma.review.delete({
                where: { id },
            });
            return res.status(200).json({ message: 'Отзыв успешно удален.' });
        } catch (error) {
            console.error('Ошибка при удалении отзыва:', error);
            return res.status(500).json({ message: 'Не удалось удалить отзыв.' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
