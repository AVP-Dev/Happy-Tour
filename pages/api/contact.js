// pages/api/contact.js
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { name, email, message, recaptchaToken } = req.body;

        // 1. Проверка reCAPTCHA на сервере
        const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

        if (!RECAPTCHA_SECRET_KEY) {
            console.error('RECAPTCHA_SECRET_KEY не установлен в переменных окружения.');
            return res.status(500).json({ message: 'Ошибка конфигурации сервера (reCAPTCHA).' });
        }

        try {
            const recaptchaVerifyResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `secret=${RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
            });

            const recaptchaData = await recaptchaVerifyResponse.json();

            if (!recaptchaData.success || recaptchaData.score < 0.5) { // Проверяем success и score
                console.warn('reCAPTCHA верификация не пройдена:', recaptchaData);
                return res.status(400).json({ message: 'reCAPTCHA верификация не пройдена. Пожалуйста, попробуйте еще раз.' });
            }
        } catch (error) {
            console.error('Ошибка верификации reCAPTCHA:', error);
            return res.status(500).json({ message: 'Ошибка при верификации reCAPTCHA.' });
        }

        // 2. Отправка Email (существующая логика)
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_TO, // Куда отправлять письма
            subject: `Новое сообщение с сайта Happy Tour от ${name}`,
            html: `
                <p><strong>Имя:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Сообщение:</strong></p>
                <p>${message}</p>
            `,
        };

        try {
            await transporter.sendMail(mailOptions);
            res.status(200).json({ message: 'Сообщение успешно отправлено!' });
        } catch (error) {
            console.error('Ошибка отправки Email:', error);
            res.status(500).json({ message: 'Ошибка при отправке сообщения.' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
