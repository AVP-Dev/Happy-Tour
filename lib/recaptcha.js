// lib/recaptcha.js

/**
 * Валидирует токен Google reCAPTCHA v3.
 * @param {string} token - Токен, полученный от клиента.
 * @returns {Promise<{success: boolean, message?: string}>} - Результат валидации.
 */
export async function validateRecaptcha(token) {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    // В режиме разработки, если ключ не установлен, пропускаем проверку для удобства.
    if (process.env.NODE_ENV !== 'production' && !secretKey) {
        console.warn("Проверка reCAPTCHA пропущена в режиме разработки.");
        return { success: true };
    }

    // В продакшене ключ должен быть обязательно.
    if (!secretKey) {
        console.error("Критическая ошибка: RECAPTCHA_SECRET_KEY не установлен в production.");
        return { success: false, message: "Сервис проверки временно недоступен." };
    }

    try {
        const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `secret=${secretKey}&response=${token}`,
        });

        const data = await response.json();

        // Проверяем успешность и оценку (score). 0.5 - стандартный порог.
        if (data.success && data.score >= 0.5) {
            return { success: true };
        } else {
            // Логируем причину неудачи для анализа
            console.warn("Проверка reCAPTCHA не пройдена:", data['error-codes'] || `score ${data.score}`);
            return { success: false, message: "Проверка на робота не пройдена." };
        }
    } catch (error) {
        console.error("Ошибка сети при проверке reCAPTCHA:", error);
        return { success: false, message: "Произошла внутренняя ошибка при проверке." };
    }
}
