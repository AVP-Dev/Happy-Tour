// Happy-Tour-main/lib/auth.js
// Вспомогательные функции для безопасного хеширования и верификации паролей.
// Использует библиотеку `bcryptjs` для выполнения криптографических операций.

import { hash, compare } from 'bcryptjs';

/**
 * Хеширует предоставленный пароль с использованием алгоритма bcrypt.
 * @param {string} password - Пароль в открытом виде для хеширования.
 * @returns {Promise<string>} Промис, который разрешается хешированным паролем.
 */
export async function hashPassword(password) {
    // '12' - это 'saltRounds' (количество раундов хеширования).
    // Чем больше значение, тем безопаснее хеш, но тем дольше занимает хеширование.
    // 12 - это хороший баланс между безопасностью и производительностью для большинства приложений.
    const hashedPassword = await hash(password, 12);
    return hashedPassword;
}

/**
 * Сравнивает предоставленный пароль (в открытом виде) с хешированным паролем.
 * @param {string} password - Пароль, введенный пользователем (в открытом виде).
 * @param {string} hashedPassword - Хешированный пароль, хранящийся в базе данных.
 * @returns {Promise<boolean>} Промис, который разрешается 'true', если пароли совпадают, 'false' в противном случае.
 */
export async function verifyPassword(password, hashedPassword) {
    // Функция 'compare' безопасно сравнивает открытый пароль с хешем,
    // предотвращая атаки по времени (timing attacks).
    const isValid = await compare(password, hashedPassword);
    return isValid;
}
