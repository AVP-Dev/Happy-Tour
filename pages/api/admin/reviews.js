// pages/api/admin/reviews.js
import { getServerSession } from 'next-auth/next';
import prisma from '../../../lib/prisma';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !['admin', 'super_admin'].includes(session.user.role)) {
        return res.status(403).json({ message: 'Доступ запрещен' });
    }

    const userId = session.user.id;

    switch (req.method) {
        case 'GET':
            try {
                const reviews = await prisma.review.findMany({
                    orderBy: { date: 'desc' },
                    include: { createdBy: { select: { name: true, email: true } } }
                });
                res.status(200).json(reviews);
            } catch (error) {
                res.status(500).json({ message: 'Ошибка сервера при получении отзывов.' });
            }
            break;

        case 'POST': // Создание отзыва из админки
            try {
                const { author, text, rating, status } = req.body;
                const newReview = await prisma.review.create({
                    data: { author, text, rating: parseInt(rating, 10), status: status || 'pending', createdById: userId }
                });
                res.status(201).json(newReview);
            } catch (error) {
                res.status(500).json({ message: 'Ошибка сервера при создании отзыва.' });
            }
            break;

        // ИСПРАВЛЕНО: Явно обрабатываем PATCH для обновления статуса
        case 'PATCH':
            try {
                const { id, status } = req.body;
                if (!id || !status) {
                    return res.status(400).json({ message: 'Отсутствуют ID или статус для обновления.' });
                }
                const updatedReview = await prisma.review.update({
                    where: { id: id },
                    data: { status },
                });
                res.status(200).json(updatedReview);
            } catch (error) {
                console.error('Ошибка при обновлении статуса отзыва:', error);
                res.status(500).json({ message: 'Ошибка сервера при обновлении статуса.' });
            }
            break;

        case 'DELETE':
            try {
                const { id } = req.query;
                await prisma.review.delete({ where: { id: id } });
                res.status(204).end();
            } catch (error) {
                res.status(500).json({ message: 'Ошибка сервера при удалении отзыва.' });
            }
            break;
            
        default:
            res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
            res.status(405).json({ message: `Метод ${req.method} не разрешен` });
            break;
    }
}
