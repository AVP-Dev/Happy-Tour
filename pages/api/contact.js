// pages/api/contact.js
// ИЗМЕНЕНИЕ: Убрали импорт nodemailer
import { validateRecaptcha } from '../../lib/recaptcha';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Метод не разрешен' });
    }

    const { name, contact, message, recaptchaToken, tour } = req.body;

    if (!name || !contact) {
        return res.status(400).json({ message: 'Пожалуйста, заполните все обязательные поля.' });
    }

    const recaptchaResult = await validateRecaptcha(recaptchaToken);
    if (!recaptchaResult.success) {
        return res.status(400).json({ message: recaptchaResult.message });
    }

    // ИЗМЕНЕНИЕ: Код для отправки email полностью удален.

    const telegramMessage = `
*Новая заявка с сайта Happy Tour*

*Имя:* ${name}
*Контакт:* ${contact}
*Описание:* ${message || 'Нет'}
${tour ? `
---
*Запрос по туру:* ${tour.title}
*Цена:* ${tour.price} ${tour.currency}
` : ''}
    `;

    const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    const TELEGRAM_TOPIC_ID = process.env.TELEGRAM_TOPIC_ID;

    // Проверяем, есть ли вообще способ отправить уведомление
    if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
        console.error("Критическая ошибка: Переменные для Telegram не установлены.");
        return res.status(500).json({ message: 'Сервис уведомлений временно недоступен.' });
    }

    const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

    try {
        // ИЗМЕНЕНИЕ: Отправка email удалена. Осталась только отправка в Telegram.
        const telegramPayload = {
            chat_id: TELEGRAM_CHAT_ID,
            text: telegramMessage,
            parse_mode: 'Markdown',
            ...(TELEGRAM_TOPIC_ID && { message_thread_id: TELEGRAM_TOPIC_ID }),
        };

        const telegramResponse = await fetch(telegramApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(telegramPayload),
        });

        // Добавил проверку ответа от Telegram для лучшей отладки
        if (!telegramResponse.ok) {
            const telegramResult = await telegramResponse.json();
            console.error("Telegram API Error:", telegramResult);
            throw new Error('Не удалось отправить уведомление в Telegram.');
        }

        return res.status(200).json({ message: 'Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.' });
    } catch (error) {
        console.error("Telegram Error:", error.message);
        return res.status(500).json({ message: 'Произошла ошибка при отправке формы.' });
    }
}
