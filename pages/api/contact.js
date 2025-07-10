// pages/api/contact.js
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

    // Формируем обновленное сообщение для Telegram
    const telegramMessage = `*🔥 Новая заявка! 🔥*\n\n` +
                            `*Сайт:* HappyTour.by\n` +
                            `*Имя:* ${name}\n` +
                            `*Контакт:* \`${contact}\`\n` + // Оборачиваем контакт в ` для удобного копирования
                            `*Сообщение:* ${message || 'Нет'}\n` +
                            `${tour ? `\n---\n*Запрос по туру:* ${tour.title}\n*Цена:* ${tour.price} ${tour.currency}\n` : ''}`;

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
```

Я сохранил всю твою логику, включая проверку reCAPTCHA и отправку в топик Telegram, просто изменил текст сообщения. Теперь ты будешь точно знать, откуда прилетел л