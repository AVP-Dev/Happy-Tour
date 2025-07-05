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
                return res.status(200).json(reviews);
            } catch (error) {
                console.error('Ошибка сервера при получении отзывов:', error); // Добавлен console.error
                return res.status(500).json({ message: 'Ошибка сервера при получении отзывов.' });
            }

        case 'PATCH':
            try {
                const { id, status } = req.body;
                if (!id || !status) {
                    return res.status(400).json({ message: 'Отсутствуют ID или статус для обновления.' });
                }
                const updatedReview = await prisma.review.update({
                    where: { id: id },
                    data: {
                        status,
                        // updatedById: userId, // ЭТА СТРОКА УДАЛЕНА, так как Prisma не находит это поле
                    },
                });
                return res.status(200).json(updatedReview);
            } catch (error) {
                console.error('Ошибка при обновлении статуса отзыва:', error);
                // Проверяем, является ли ошибка PrismaClientValidationError
                if (error.code === 'P2025') {
                    return res.status(404).json({ message: 'Отзыв с таким ID не найден.' });
                }
                // Для других ошибок Prisma или общих ошибок
                return res.status(500).json({ message: 'Ошибка сервера при обновлении статуса.', error: error.message });
            }

        case 'DELETE':
            try {
                const { id } = req.query;
                await prisma.review.delete({ where: { id: id } });
                return res.status(204).end();
            } catch (error) {
                console.error('Ошибка сервера при удалении отзыва:', error); // Добавлен console.error
                if (error.code === 'P2025') {
                    return res.status(404).json({ message: 'Отзыв с таким ID не найден.' });
                }
                return res.status(500).json({ message: 'Ошибка сервера при удалении отзыва.', error: error.message });
            }
            
        default:
            res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
            return res.status(405).json({ message: `Метод ${req.method} не разрешен` });
    }
}
