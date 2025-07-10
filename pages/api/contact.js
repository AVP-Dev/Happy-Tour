// pages/api/contact.js
import { validateRecaptcha } from '../../lib/recaptcha';

/**
 * Escapes HTML special characters in a string to prevent issues with Telegram's HTML parse mode.
 * @param {string} text The text to escape.
 * @returns {string} The escaped text.
 */
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Formats a contact string (phone or email) into a clickable HTML link for Telegram.
 * @param {string} contact The contact string (phone number or email address).
 * @returns {string} An HTML anchor tag.
 */
function formatContactLink(contact) {
  const isEmail = contact.includes('@');
  const escapedContact = escapeHtml(contact);

  if (isEmail) {
    return `<a href="mailto:${escapedContact}">${escapedContact}</a>`;
  } else {
    // Create a tel: link by removing non-numeric characters for the href attribute.
    const phoneLink = contact.replace(/[^+\d]/g, '');
    return `<a href="tel:${phoneLink}">${escapedContact}</a>`;
  }
}

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

    // Escape user-provided data to ensure it's safely rendered in HTML
    const nameEscaped = escapeHtml(name);
    const messageEscaped = escapeHtml(message);
    const contactLink = formatContactLink(contact);

    let tourInfo = '';
    if (tour && tour.title) {
        const titleEscaped = escapeHtml(tour.title);
        const priceEscaped = escapeHtml(String(tour.price));
        const currencyEscaped = escapeHtml(tour.currency);
        // ИЗМЕНЕНИЕ: Добавлены тематические эмодзи в блок с информацией о туре
        tourInfo = `\n\n<b>---</b>\n` +
                   `🎫 <b>Запрос по туру:</b> ${titleEscaped}\n` +
                   `💰 <b>Цена:</b> ${priceEscaped} ${currencyEscaped}`;
    }

    // Construct the message using HTML for rich formatting
    // ИЗМЕНЕНИЕ: Добавлены тематические эмодзи
    const telegramMessage = `<b>🌴 Новая заявка с сайта HappyTour.by! ✈️</b>\n\n` +
                            `👤 <b>Имя:</b> ${nameEscaped}\n` +
                            `📞 <b>Контакт:</b> ${contactLink}\n` +
                            `💬 <b>Сообщение:</b> ${messageEscaped || 'Нет'}` +
                            `${tourInfo}`;

    const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    const TELEGRAM_TOPIC_ID = process.env.TELEGRAM_TOPIC_ID;

    if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
        console.error("Критическая ошибка: Переменные для Telegram не установлены.");
        return res.status(500).json({ message: 'Сервис уведомлений временно недоступен.' });
    }

    const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

    try {
        const telegramPayload = {
            chat_id: TELEGRAM_CHAT_ID,
            text: telegramMessage,
            parse_mode: 'HTML', // Use HTML parse mode for clickable links
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
