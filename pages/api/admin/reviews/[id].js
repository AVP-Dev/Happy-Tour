// pages/api/admin/reviews/[id].js
// Этот маршрут API управляет отдельными отзывами (редактирование, удаление)
// с использованием SQLite через Prisma.

import { getToken } from 'next-auth/jwt'; // Для защиты маршрута
import prisma from '../../../../lib/prisma'; // Prisma Client для работы с SQLite

export default async function handler(req, res) {
    // Проверяем аутентификацию администратора
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
        return res.status(401).json({ message: 'Не авторизован' });
    }

    // Получаем ID отзыва из параметров запроса
    const { id } = req.query;

    try {
        if (req.method === 'PUT') {
            // Обновление отзыва
            const { status, text, author } = req.body;
            const dataToUpdate = {};

            // Добавляем поля для обновления только если они предоставлены и валидны
            if (status && ['pending', 'published'].includes(status)) dataToUpdate.status = status;
            if (text) dataToUpdate.text = text;
            if (author) dataToUpdate.author = author;

            // Если нет данных для обновления, возвращаем ошибку
            if (Object.keys(dataToUpdate).length === 0) {
                return res.status(400).json({ message: 'Нет данных для обновления.' });
            }
            
            // Обновляем отзыв в базе данных
            await prisma.review.update({
                where: { id: id },
                data: dataToUpdate,
            });
            return res.status(200).json({ message: 'Отзыв успешно обновлен.' });
        }
        
        if (req.method === 'DELETE') {
            // Удаление отзыва
            await prisma.review.delete({ where: { id: id } });
            return res.status(200).json({ message: 'Отзыв успешно удален.' });
        }

        // Если метод запроса не разрешен
        res.setHeader('Allow', ['PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);

    } catch (error) {
        console.error(`API Error for review ${id}:`, error);
        return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
}
