// pages/api/admin/reviews.js
import { getSession } from 'next-auth/react';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    const session = await getSession({ req });

    if (!session || !['admin', 'super_admin'].includes(session.user.role)) {
        return res.status(401).json({ message: 'Доступ запрещен' });
    }

    if (req.method === 'GET') {
        try {
            const reviews = await prisma.review.findMany({
                orderBy: { createdAt: 'desc' },
            });
            return res.status(200).json(reviews);
        } catch (error) {
            return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
        }
    }

    if (req.method === 'PUT') {
        const { id, status } = req.body;
        if (!id || !status) {
            return res.status(400).json({ message: 'Отсутствует ID или новый статус.' });
        }
        try {
            const updatedReview = await prisma.review.update({
                where: { id: String(id) },
                data: { status },
            });
            return res.status(200).json(updatedReview);
        } catch (error) {
            return res.status(500).json({ message: 'Не удалось обновить статус.' });
        }
    }

    if (req.method === 'DELETE') {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ message: 'Отсутствует ID отзыва.' });
        }
        try {
            await prisma.review.delete({
                where: { id: String(id) },
            });
            return res.status(200).json({ message: 'Отзыв успешно удален.' });
        } catch (error) {
            return res.status(500).json({ message: 'Не удалось удалить отзыв.' });
        }
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).end(`Метод ${req.method} не разрешен`);
}
