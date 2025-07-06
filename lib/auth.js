// Happy-Tour-main/lib/auth.js
// Вспомогательные функции для безопасного хеширования и верификации паролей.
// Использует библиотеку `bcryptjs` для выполнения криптографических операций.
// Добавлена функция `withAuth` для защиты API маршрутов.

import { hash, compare } from 'bcryptjs';
// Изменено: Импортируем getServerSession из 'next-auth/next'
import { getSession } from 'next-auth/react'; 
import { getServerSession } from 'next-auth/next'; 
import { authOptions } from '../pages/api/auth/[...nextauth]'; // Путь к вашим authOptions

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

/**
 * Middleware для защиты API маршрутов.
 * Проверяет наличие активной сессии и роли пользователя.
 * @param {function} handler - Оригинальный обработчик API маршрута (req, res).
 * @param {string[]} allowedRoles - Массив ролей, которым разрешен доступ (например, ['ADMIN']).
 * @returns {function} Обернутый обработчик API маршрута.
 */
export function withAuth(handler, allowedRoles = []) {
  return async (req, res) => {
    // Изменено: Используем getServerSession для более надежного получения сессии на стороне сервера
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      // Если сессии нет, возвращаем 401 Unauthorized
      console.warn("[AUTH_ERROR] Доступ запрещен: Сессия отсутствует.");
      return res.status(401).json({ error: 'Не авторизован.' });
    }

    // Если пользователь является 'super_admin', он всегда имеет доступ
    if (session.user.role === 'super_admin') {
      console.log(`[AUTH_INFO] Пользователь ${session.user.email} (super_admin) имеет полный доступ.`);
      return handler(req, res);
    }

    // Проверяем роль пользователя, если указаны разрешенные роли
    if (allowedRoles.length > 0 && !allowedRoles.includes(session.user.role)) {
      console.warn(`[AUTH_ERROR] Доступ запрещен: Пользователь ${session.user.email} с ролью '${session.user.role}' не имеет доступа. Требуемые роли: ${allowedRoles.join(', ')}`);
      return res.status(403).json({ error: 'Доступ запрещен. Недостаточно прав.' });
    }

    // Если аутентификация и авторизация прошли успешно, передаем управление оригинальному обработчику
    return handler(req, res);
  };
}
