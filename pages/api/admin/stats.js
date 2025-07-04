// pages/api/admin/stats.js
import prisma from '../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
    console.log("STATS API: Получен запрос на /api/admin/stats");
    const session = await getServerSession(req, res, authOptions);

    if (!session || !['admin', 'super_admin'].includes(session.user.role)) {
        console.warn("STATS API: Доступ запрещен. Нет сессии или неверная роль.");
        return res.status(403).json({ message: 'Доступ запрещен' });
    }
    console.log(`STATS API: Пользователь ${session.user.email} авторизован.`);

    if (req.method === 'GET') {
        try {
            console.log("STATS API: Попытка получить статистику из БД...");

            const totalToursPromise = prisma.tour.count();
            const pendingReviewsPromise = prisma.review.count({ where: { status: 'pending' } });
            const publishedReviewsPromise = prisma.review.count({ where: { status: 'published' } });
            const rejectedReviewsPromise = prisma.review.count({ where: { status: 'rejected' } });

            console.log("STATS API: Запросы к БД сформированы. Ожидание выполнения...");

            const [totalTours, pendingReviews, publishedReviews, rejectedReviews] = await Promise.all([
                totalToursPromise,
                pendingReviewsPromise,
                publishedReviewsPromise,
                rejectedReviewsPromise
            ]);

            console.log("STATS API: Данные успешно получены из БД.");
            console.log(`STATS API: Туров: ${totalTours}, Отзывов в ожидании: ${pendingReviews}`);

            res.status(200).json({
                totalTours,
                reviews: {
                    pending: pendingReviews,
                    published: publishedReviews,
                    rejected: rejectedReviews,
                },
            });
        } catch (error) {
            console.error("STATS API: КРИТИЧЕСКАЯ ОШИБКА при получении статистики!");
            console.error("STATS API: Сообщение ошибки:", error.message);
            console.error("STATS API: Код ошибки (если есть):", error.code);
            console.error("STATS API: Полный объект ошибки:", JSON.stringify(error, null, 2));

            res.status(500).json({ 
                message: 'Внутренняя ошибка сервера при получении статистики.',
                error: {
                    message: error.message,
                    code: error.code
                }
            });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}