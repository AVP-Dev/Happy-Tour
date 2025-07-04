// pages/api/admin/reviews.js
import { getServerSession } from 'next-auth/next';
import prisma from '../../../lib/prisma'; // ИСПРАВЛЕНО
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions);

    // --- ИЗМЕНЕНИЕ: Расширяем права до super_admin ---
    if (!session || !['admin', 'super_admin'].includes(session.user.role)) {
        return res.status(403).json({ message: 'Доступ запрещен' });
    }

    const userId = session.user.id;

    switch (req.method) {
        case 'GET':
            try {
                const reviews = await prisma.review.findMany({
                    orderBy: { date: 'desc' },
                    // --- ИЗМЕНЕНИЕ: Включаем имя создателя в ответ ---
                    include: {
                        createdBy: {
                            select: { name: true, email: true }
                        }
                    }
                });
                res.status(200).json(reviews);
            } catch (error) {
                console.error('Ошибка при получении отзывов:', error);
                res.status(500).json({ message: 'Ошибка сервера при получении отзывов.' });
            }
            break;
        
        // --- ИЗМЕНЕНИЕ: Добавляем метод POST для создания отзыва из админки ---
        // Это полезно, если нужно добавить отзыв вручную
        case 'POST':
            try {
                const { author, text, rating, status } = req.body;
                if (!author || !text || !rating) {
                    return res.status(400).json({ message: 'Не все обязательные поля заполнены.' });
                }
                const newReview = await prisma.review.create({
                    data: {
                        author,
                        text,
                        rating: parseInt(rating, 10),
                        status: status || 'pending',
                        createdById: userId, // Привязываем создателя
                    }
                });
                res.status(201).json(newReview);
            } catch (error) {
                console.error('Ошибка при создании отзыва:', error);
                res.status(500).json({ message: 'Ошибка сервера при создании отзыва.' });
            }
            break;

        case 'PUT':
            try {
                const { id, status } = req.body;
                if (!id || !status) {
                    return res.status(400).json({ message: 'Отсутствуют обязательные поля: ID или статус.' });
                }
                const updatedReview = await prisma.review.update({
                    where: { id: id },
                    data: { status },
                });
                res.status(200).json(updatedReview);
            } catch (error) {
                console.error('Ошибка при обновлении отзыва:', error);
                res.status(500).json({ message: 'Ошибка сервера при обновлении отзыва.' });
            }
            break;
        case 'DELETE':
            try {
                const { id } = req.query;
                if (!id) {
                    return res.status(400).json({ message: 'Отсутствует ID отзыва для удаления.' });
                }
                await prisma.review.delete({
                    where: { id: id },
                });
                res.status(204).end();
            } catch (error) {
                console.error('Ошибка при удалении отзыва:', error);
                res.status(500).json({ message: 'Ошибка сервера при удалении отзыва.' });
            }
            break;
        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).json({ message: `Метод ${req.method} не разрешен` });
            break;
    }
}
