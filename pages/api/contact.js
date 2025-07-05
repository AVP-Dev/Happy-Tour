// pages/api/contact.js
import nodemailer from 'nodemailer';
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

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: true,
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
        <p>${message.replace(/\n/g, '<br>') || 'Нет'}</p>
        ${tour ? `
            <hr>
            <h3>Запрос по туру: ${tour.title}</h3>
            <p><strong>Цена:</strong> ${tour.price} ${tour.currency}</p>
        ` : ''}
    `;

    const telegramMessage = `
*Новая заявка с сайта Happy Tour*

*Имя:* ${name}
*Контакт:* ${contact}
*Сообщение:* ${message || 'Нет'}
${tour ? `
---
*Запрос по туру:* ${tour.title}
*Цена:* ${tour.price} ${tour.currency}
` : ''}
    `;

    const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

    try {
        await transporter.sendMail({
            from: `"Happy Tour" <${process.env.SMTP_USER}>`,
            to: 'info@happytour.by',
            subject: tour ? `Заявка на тур: ${tour.title}` : 'Новая заявка с сайта',
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
        console.error("Mail/Telegram Error:", error);
        return res.status(500).json({ message: 'Произошла ошибка при отправке формы.' });
    }
}
