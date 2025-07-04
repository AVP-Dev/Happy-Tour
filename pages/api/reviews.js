// pages/api/reviews.js
import prisma from '../../lib/prisma';
import { getSession } from 'next-auth/react';

async function validateRecaptcha(token) {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    // --- ОТЛАДКА: Проверяем, загружен ли ключ ---
    console.log(`[reCAPTCHA Debug] RECAPTCHA_SECRET_KEY is: ${secretKey ? 'Loaded' : 'NOT LOADED'}`);

    if (!secretKey) {
        if (process.env.NODE_ENV === 'production') {
            return { success: false, message: "Сервис проверки временно недоступен (ключ не найден)." };
        }
        console.warn("Проверка reCAPTCHA пропущена в режиме разработки.");
        return { success: true };
    }

    try {
        const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `secret=${secretKey}&response=${token}`,
        });
        
        // --- ОТЛАДКА: Логируем статус ответа от Google ---
        console.log(`[reCAPTCHA Debug] Google API response status: ${response.status}`);

        const data = await response.json();
        console.log('[reCAPTCHA Debug] Google API response data:', data);

        if (data.success && data.score >= 0.5) {
            return { success: true };
        } else {
            return { success: false, message: "Проверка на робота не пройдена." };
        }
    } catch (error) {
        // --- ОТЛАДКА: Логируем полную ошибку сети ---
        console.error("[reCAPTCHA Debug] Network or fetch error:", error);
        return { success: false, message: "Ошибка сети при проверке reCAPTCHA." };
    }
}


export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { author, text, rating, token } = req.body;

    if (!token) {
        return res.status(400).json({ message: 'Токен reCAPTCHA отсутствует.' });
    }
    
    const recaptchaResult = await validateRecaptcha(token);
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
                status: 'pending',
                createdById: session?.user?.role.includes('admin') ? session.user.id : null,
            },
        });
        return res.status(201).json({ message: 'Спасибо! Ваш отзыв отправлен на модерацию.', review: newReview });
    } catch (error) {
        console.error('Ошибка Prisma при добавлении отзыва:', error);
        return res.status(500).json({ message: 'Не удалось сохранить отзыв.' });
    }
}
