import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Метод не разрешен' });
    }

    const { name, email, phone, message, recaptchaToken } = req.body;

    if (!name || !email || !phone) {
        return res.status(400).send('Пожалуйста, заполните все обязательные поля.');
    }

    // --- Проверка reCAPTCHA ---
    try {
        const secretKey = process.env.RECAPTCHA_SECRET_KEY;
        const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;
        const recaptchaResponse = await fetch(verificationUrl, { method: 'POST' });
        const recaptchaData = await recaptchaResponse.json();

        if (!recaptchaData.success || recaptchaData.score < 0.5) {
            return res.status(400).send('Вы не прошли проверку на робота.');
        }
    } catch (error) {
        console.error("Recaptcha Error:", error);
        return res.status(500).send('Ошибка при проверке reCAPTCHA.');
    }

    // --- Настройка отправки Email ---
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
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Телефон:</strong> ${phone}</p>
        <p><strong>Сообщение:</strong> ${message || 'Нет'}</p>
    `;

    // --- Настройка уведомления в Telegram ---
    const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    const telegramMessage = `*Новая заявка с сайта Happy Tour*\n\n*Имя:* ${name}\n*Телефон:* ${phone}\n*Email:* ${email}\n*Сообщение:* ${message || 'Нет'}`;
    const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

    try {
        await transporter.sendMail({
            from: `"Happy Tour" <${process.env.SMTP_USER}>`,
            to: 'info@happytour.by',
            subject: 'Новая заявка с сайта',
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

        return res.status(200).send('Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.');
    } catch (error) {
        console.error("Mail/Telegram Error:", error);
        return res.status(500).send('Произошла ошибка при отправке формы.');
    }
}
