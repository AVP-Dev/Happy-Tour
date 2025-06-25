// pages/api/reviews.js
// Этот маршрут API управляет получением (публичная часть) и добавлением (публичная часть) отзывов.
// Использует SQLite через Prisma и включает проверку reCAPTCHA.

import prisma from '../../lib/prisma'; // Prisma Client для работы с SQLite

// Вспомогательная функция для проверки reCAPTCHA
async function verifyRecaptcha(token) {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
        console.error("Секретный ключ ReCaptcha не настроен на сервере!");
        // В development-режиме можем вернуть true, чтобы не блокировать работу
        return process.env.NODE_ENV !== 'production'; 
    }
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;
    try {
        const response = await fetch(verificationUrl, { method: 'POST' });
        const data = await response.json();
        // reCAPTCHA v3 возвращает score, который должен быть >= 0.5 (обычно) для "человека"
        return data.success && data.score >= 0.5;
    } catch (error) {
        console.error("Ошибка при проверке ReCaptcha:", error);
        return false;
    }
}

export default async function handler(req, res) {
    if (req.method === 'GET') {
        // Получение опубликованных отзывов для публичной части сайта
        try {
            const reviewsList = await prisma.review.findMany({
                where: {
                    status: 'published', // Получаем только опубликованные отзывы
                },
                orderBy: {
                    date: 'desc', // Сортируем по дате в убывающем порядке
                },
            });
            return res.status(200).json(reviewsList);
        } catch (error) {
            console.error("Ошибка получения отзывов:", error);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
    
    if (req.method === 'POST') {
        // Добавление нового отзыва с публичной формы
        try {
            const { author, text, recaptchaToken } = req.body;
            // Проверяем наличие обязательных полей
            if (!author || !text || !recaptchaToken) {
                return res.status(400).json({ message: 'Отсутствуют обязательные поля.' });
            }
            
            // Проверяем reCAPTCHA
            const isHuman = await verifyRecaptcha(recaptchaToken);
            if (!isHuman) {
                return res.status(400).json({ message: 'Проверка на робота не пройдена.' });
            }

            // Создаем новый отзыв в базе данных со статусом 'pending' (на модерации)
            const newReview = await prisma.review.create({
                data: {
                    author,
                    text,
                    status: 'pending', // Новые отзывы всегда отправляются на модерацию
                },
            });

            return res.status(201).json({ message: 'Спасибо! Ваш отзыв отправлен на модерацию.', id: newReview.id });
        } catch (error) {
            console.error("Ошибка при отправке отзыва:", error);
            return res.status(500).json({ message: 'Не удалось отправить отзыв. Попробуйте позже.' });
        }
    }

    // Если метод запроса не разрешен
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
