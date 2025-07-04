// pages/api/reviews.js
import prisma from '../../lib/prisma';
import { getSession } from 'next-auth/react';

// Функция для валидации токена reCAPTCHA
async function validateRecaptcha(token) {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    // В режиме разработки можно пропустить проверку для удобства
    if (process.env.NODE_ENV !== 'production' && !secretKey) {
        console.warn("Проверка reCAPTCHA пропущена в режиме разработки.");
        return { success: true };
    }
    
    if (!secretKey) {
        console.error("Критическая ошибка: RECAPTCHA_SECRET_KEY не установлен.");
        return { success: false, message: "Сервис проверки временно недоступен." };
    }

    try {
        const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `secret=${secretKey}&response=${token}`,
        });
        const data = await response.json();

        if (data.success && data.score >= 0.5) {
            return { success: true };
        } else {
            console.warn("Проверка reCAPTCHA не удалась:", data['error-codes'] || `score: ${data.score}`);
            return { success: false, message: "Проверка на робота не пройдена." };
        }
    } catch (error) {
        console.error("Ошибка при проверке reCAPTCHA:", error);
        return { success: false, message: "Произошла внутренняя ошибка при проверке." };
    }
}


export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const reviews = await prisma.review.findMany({
                where: { status: 'published' },
                orderBy: { date: 'desc' },
            });
            return res.status(200).json(reviews);
        } catch (error) {
            return res.status(500).json({ message: 'Ошибка сервера при получении отзывов.' });
        }
    }

    if (req.method === 'POST') {
        const { author, text, rating, token } = req.body;

        // --- ДОБАВЛЕНО: Проверка reCAPTCHA ---
        if (!token) {
            return res.status(400).json({ message: 'Токен reCAPTCHA отсутствует.' });
        }
        const recaptchaResult = await validateRecaptcha(token);
        if (!recaptchaResult.success) {
            return res.status(400).json({ message: recaptchaResult.message });
        }
        // --- КОНЕЦ ПРОВЕРКИ ---

        if (!author || !text || !rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Все поля и оценка обязательны для заполнения.' });
        }
        
        // Попытаемся получить сессию, чтобы связать отзыв с админом, если он его оставил
        const session = await getSession({ req });

        try {
            const newReview = await prisma.review.create({
                data: {
                    author,
                    text,
                    rating: parseInt(rating),
                    status: 'pending', // Все новые отзывы требуют модерации
                    // Если отзыв оставляет залогиненный админ, привязываем его ID
                    createdById: session?.user?.role.includes('admin') ? session.user.id : null,
                },
            });
            return res.status(201).json({ message: 'Спасибо! Ваш отзыв отправлен на модерацию.', review: newReview });
        } catch (error) {
            console.error('Ошибка Prisma при добавлении отзыва:', error);
            return res.status(500).json({ message: 'Не удалось сохранить отзыв в базе данных.' });
        }
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}
