// pages/api/reviews.js
import prisma from '../../lib/prisma';

async function validateRecaptcha(token) {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
        console.error("Критическая ошибка: RECAPTCHA_SECRET_KEY не установлен.");
        // В продакшене всегда возвращаем ошибку, если ключа нет.
        if (process.env.NODE_ENV === 'production') {
            return { success: false, message: "Сервис проверки временно недоступен." };
        }
        // В режиме разработки можно пропустить проверку для удобства.
        console.warn("Проверка reCAPTCHA пропущена в режиме разработки.");
        return { success: true };
    }

    try {
        const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `secret=${secretKey}&response=${token}`,
        });

        if (!response.ok) {
            console.error(`Ошибка при обращении к Google reCAPTCHA: ${response.statusText}`);
            return { success: false, message: "Не удалось связаться с сервисом проверки." };
        }

        const data = await response.json();
        
        // --- ИЗМЕНЕНИЕ: Улучшенная логика проверки и возврата ошибок ---
        if (!data.success) {
            console.warn("Проверка reCAPTCHA не удалась. Причина:", data['error-codes']);
            return { success: false, message: "Проверка на робота не пройдена. Попробуйте еще раз." };
        }

        if (data.score < 0.5) {
            console.log(`Низкий рейтинг reCAPTCHA: ${data.score}. Действие заблокировано.`);
            return { success: false, message: "Ваша активность показалась подозрительной. Попробуйте позже." };
        }

        return { success: true };

    } catch (error) {
        console.error("Непредвиденная ошибка при проверке reCAPTCHA:", error);
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
            console.error('Ошибка при получении отзывов:', error);
            return res.status(500).json({ message: 'Ошибка сервера при получении отзывов.' });
        }
    }

    if (req.method === 'POST') {
        const { author, text, rating, token } = req.body;

        if (!token) {
            return res.status(400).json({ message: 'Токен reCAPTCHA отсутствует.' });
        }

        // --- ИЗМЕНЕНИЕ: Получаем объект с результатом проверки ---
        const recaptchaResult = await validateRecaptcha(token);
        if (!recaptchaResult.success) {
            // Возвращаем клиенту осмысленное сообщение об ошибке
            return res.status(400).json({ message: recaptchaResult.message });
        }

        if (!author || !text || !rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Все поля и оценка обязательны для заполнения.' });
        }

        try {
            const newReview = await prisma.review.create({
                data: {
                    author,
                    text,
                    rating: parseInt(rating),
                    status: 'pending',
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
