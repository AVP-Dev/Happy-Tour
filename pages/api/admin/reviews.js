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
            return res.status(200).json(reviews);
        } catch (error) {
            return res.status(500).json({ message: 'Ошибка сервера при получении отзывов.' });
        }
    } 
    
    if (req.method === 'PUT') {
        const { id, status } = req.body;
        try {
            const updatedReview = await prisma.review.update({
                where: { id },
                data: { status },
            });
            return res.status(200).json(updatedReview);
        } catch (error) {
            return res.status(500).json({ message: 'Ошибка сервера при обновлении статуса.' });
        }
    } 
    
    if (req.method === 'DELETE') {
        const { id } = req.body;
        try {
            await prisma.review.delete({
                where: { id },
            });
            return res.status(200).json({ message: 'Отзыв успешно удален.' });
        } catch (error) {
            return res.status(500).json({ message: 'Ошибка сервера при удалении отзыва.' });
        }
    } 
    
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Метод ${req.method} не разрешен`);
}
