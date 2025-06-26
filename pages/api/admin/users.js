// pages/api/admin/users.js
// API-маршрут для управления учетными записями администраторов (CRUD).
// Доступно только для авторизованных пользователей с ролью 'super_admin'.
// НЕ ИМПОРТИРУЕТ КЛИЕНТСКИЕ КОМПОНЕНТЫ ИЛИ CSS.

import { getToken } from 'next-auth/jwt'; // Для получения токена сессии
import prisma from '../../../lib/prisma'; // Prisma Client
import bcrypt from 'bcryptjs'; // Для хеширования паролей

export default async function handler(req, res) {
  // 1. Проверка аутентификации и авторизации (только для супер-админа)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return res.status(401).json({ message: 'Не авторизован.' });
  }

  // Проверяем роль: только супер-админ может управлять другими админами
  // Если токен не имеет роли или роль не super_admin
  if (!token.role || token.role !== 'super_admin') {
    return res.status(403).json({ message: 'Недостаточно прав. Только супер-администраторы могут управлять учетными записями.' });
  }

  try {
    if (req.method === 'GET') {
      // Получение списка всех администраторов (без хешей паролей)
      const adminUsers = await prisma.adminUser.findMany({
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
        },
        orderBy: {
            createdAt: 'asc', // Сортировка по дате создания
        }
      });
      return res.status(200).json(adminUsers);
    } 
    
    else if (req.method === 'POST') {
      // Добавление нового администратора
      const { email, password, role } = req.body;

      if (!email || !password || !role) {
        return res.status(400).json({ message: 'Email, пароль и роль обязательны.' });
      }

      // Проверяем, существует ли пользователь с таким email
      const existingUser = await prisma.adminUser.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ message: 'Пользователь с таким email уже существует.' });
      }

      // Хешируем пароль
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(password, salt);

      const newAdmin = await prisma.adminUser.create({
        data: {
          email,
          passwordHash,
          // Проверяем, чтобы роль была либо 'admin', либо 'super_admin'. Иначе по умолчанию 'admin'.
          role: ['admin', 'super_admin'].includes(role) ? role : 'admin', 
        },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
        }
      });
      return res.status(201).json({ message: 'Администратор успешно добавлен.', admin: newAdmin });
    } 
    
    else if (req.method === 'DELETE') {
      // Удаление администратора
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ message: 'ID администратора обязателен.' });
      }

      // 1. Не позволяем супер-админу удалить себя, если он единственный супер-админ.
      if (token.id === id && token.role === 'super_admin') {
          const superAdminCount = await prisma.adminUser.count({ where: { role: 'super_admin' } });
          if (superAdminCount <= 1) {
              return res.status(400).json({ message: 'Нельзя удалить единственного супер-администратора.' });
          }
      }

      // 2. Не позволяем обычному админу удалить кого-либо, или супер-админа.
      // Эта проверка уже есть в начале (token.role !== 'super_admin'), но для DELETE она особенно важна.
      const userToDelete = await prisma.adminUser.findUnique({ where: { id } });
      if (userToDelete && userToDelete.role === 'super_admin' && token.role !== 'super_admin') {
          return res.status(403).json({ message: 'Недостаточно прав для удаления супер-администратора.' });
      }

      await prisma.adminUser.delete({ where: { id } });
      return res.status(200).json({ message: 'Администратор успешно удален.' });
    } 
    
    else {
      // Неподдерживаемый метод HTTP
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }

  } catch (error) {
    console.error('Ошибка в API управления администраторами:', error);
    // Дополнительная проверка на уникальность email (если Prisma выдает ошибку UNIQUE constraint failed)
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        return res.status(409).json({ message: 'Пользователь с таким email уже существует.' });
    }
    return res.status(500).json({ message: 'Внутренняя ошибка сервера.' });
  }
}
