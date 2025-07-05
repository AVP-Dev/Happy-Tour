// pages/api/reviews.js
import prisma from '../../lib/prisma';
import { getSession } from 'next-auth/react';
// ИЗМЕНЕНИЕ: Импортируем единую функцию валидации
import { validateRecaptcha } from '../../lib/recaptcha';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    // ИЗМЕНЕНИЕ: Используем стандартизированное имя `recaptchaToken`
    const { author, text, rating, recaptchaToken } = req.body;

    if (!recaptchaToken) {
        return res.status(400).json({ message: 'Токен reCAPTCHA отсутствует.' });
    }
    
    // Используем общую функцию для проверки
    const recaptchaResult = await validateRecaptcha(recaptchaToken);
    if (!recaptchaResult.success) {
        return res.status(400).json({ message: recaptchaResult.message });
    }

    if (!author || !text || !rating) {
        return res.status(400).json({ message: 'Все поля и оценка обязательны.' });
    }
    
    const session = await getSession({ req });

    try {
        const newReview = await prisma.review.create({
            data: {
                author,
                text,
                rating: parseInt(rating),
                status: 'pending', // Отзыв ожидает модерации
                // Привязываем отзыв к админу, если он авторизован
                createdById: session?.user?.role.includes('admin') ? session.user.id : null,
            },
        });
        return res.status(201).json({ message: 'Спасибо! Ваш отзыв отправлен на модерацию.', review: newReview });
    } catch (error) {
        console.error('Ошибка Prisma при добавлении отзыва:', error);
        return res.status(500).json({ message: 'Не удалось сохранить отзыв.' });
    }
}
