// pages/api/contact.js
import nodemailer from 'nodemailer';
import { z } from 'zod';
import { validateRecaptcha } from '../../lib/recaptcha';

// ИЗМЕНЕНИЕ: Определяем схему валидации для входящих данных с помощью Zod.
// Это гарантирует, что мы работаем только с корректными и безопасными данными.
const contactSchema = z.object({
    name: z.string().trim().min(2, { message: 'Имя должно содержать минимум 2 символа.' }),
    contact: z.string().trim().min(5, { message: 'Пожалуйста, укажите корректный контакт для связи.' }),
    message: z.string().trim().min(10, { message: 'Сообщение должно содержать минимум 10 символов.' }),
    recaptchaToken: z.string(),
    // Название тура не является обязательным, так как форма может быть отправлена не со страницы тура.
    tourTitle: z.string().optional(),
});


export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Метод не разрешен' });
    }

    // ИЗМЕНЕНИЕ: Безопасная валидация тела запроса по схеме.
    const validationResult = contactSchema.safeParse(req.body);

    // Если валидация не пройдена, отправляем ошибку 400 с подробностями.
    if (!validationResult.success) {
        return res.status(400).json({ 
            message: 'Данные формы неверны.',
            errors: validationResult.error.flatten().fieldErrors,
        });
    }

    // Теперь мы работаем с гарантированно корректными данными.
    const { name, contact, message, recaptchaToken, tourTitle } = validationResult.data;

    // --- Проверка reCAPTCHA ---
    const recaptchaResult = await validateRecaptcha(recaptchaToken);
    if (!recaptchaResult.success) {
        return res.status(400).json({ message: recaptchaResult.message });
    }

    // --- Настройка отправки Email ---
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_PORT == 465, // true для 465, false для других портов
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    const emailHtml = `
        <h2>Новая заявка с сайта Happy Tour</h2>
        <p><strong>Имя:</strong> ${name}</p>
        <p><strong>Контакт:</strong> ${contact}</p>
        <p><strong>Сообщение:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        ${tourTitle ? `
            <hr>
            <h3>Запрос по туру: ${tourTitle}</h3>
        ` : ''}
    `;

    const telegramMessage = `
*Новая заявка с сайта Happy Tour*

*Имя:* ${name}
*Контакт:* ${contact}
*Сообщение:* ${message}
${tourTitle ? `
---
*Запрос по туру:* ${tourTitle}
` : ''}
    `;

    const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

    try {
        await transporter.sendMail({
            from: `"Happy Tour" <${process.env.SMTP_USER}>`,
            to: process.env.EMAIL_TO || 'info@happytour.by',
            subject: tourTitle ? `Заявка на тур: ${tourTitle}` : 'Новая заявка с сайта',
            html: emailHtml,
        });

        if (TELEGRAM_TOKEN && TELEGRAM_CHAT_ID) {
            await fetch(telegramApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: telegramMessage,
                    parse_mode: 'Markdown',
                }),
            });
        }

        return res.status(200).json({ message: 'Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.' });
    } catch (error) {
        console.error("Ошибка при отправке уведомлений:", error);
        return res.status(500).json({ message: 'Произошла внутренняя ошибка сервера при отправке формы.' });
    }
}
