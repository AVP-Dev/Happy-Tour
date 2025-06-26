// pages/api/setup-first-admin.js
// ВНИМАНИЕ: ЭТО ВРЕМЕННЫЙ МАРШРУТ!
// Он предназначен только для ОДНОКРАТНОЙ регистрации первого администратора.
// ПОСЛЕ УСПЕШНОГО ИСПОЛЬЗОВАНИЯ ЭТОТ ФАЙЛ ДОЛЖЕН БЫТЬ УДАЛЕН ИЗ ПРОЕКТА И РЕПОЗИТОРИЯ!

import prisma from '../../lib/prisma'; // Prisma Client
import bcrypt from 'bcryptjs'; // Для хеширования паролей

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Метод не разрешен. Используйте POST.' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email и пароль обязательны.' });
  }

  try {
    // Проверяем, есть ли уже какие-либо администраторы в базе данных
    const existingAdmins = await prisma.adminUser.count();
    if (existingAdmins > 0) {
      console.warn('Попытка зарегистрировать администратора, когда он уже существует.');
      return res.status(403).json({ message: 'Администратор уже существует. Этот маршрут только для первой регистрации.' });
    }

    // Хешируем пароль
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    // Создаем первого администратора со ролью 'super_admin'
    const newAdmin = await prisma.adminUser.create({
      data: {
        email,
        passwordHash,
        role: 'super_admin', // Первая учетная запись всегда супер-админ
      },
    });

    console.log(`Успешно зарегистрирован первый супер-администратор: ${newAdmin.email}`);
    return res.status(201).json({ message: 'Первый супер-администратор успешно зарегистрирован!', email: newAdmin.email });

  } catch (error) {
    // УЛУЧШЕННОЕ ЛОГИРОВАНИЕ
    console.error('Ошибка при регистрации первого администратора:', error.message);
    if (error.code) { // Prisma Client errors have a 'code' property
      console.error('Prisma Error Code:', error.code);
      console.error('Prisma Error Meta:', error.meta);
    }
    return res.status(500).json({ message: 'Ошибка сервера при регистрации администратора.' });
  }
}
