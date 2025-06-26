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
  if (token.role !== 'super_admin') {
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
          role: ['admin', 'super_admin'].includes(role) ? role : 'admin', // Защита от некорректной роли
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

      // Не позволяем супер-админу удалить самого себя через этот API (если он единственный)
      if (token.id === id) {
          const adminCount = await prisma.adminUser.count();
          if (adminCount <= 1) {
              return res.status(400).json({ message: 'Нельзя удалить последнего администратора.' }); // Изменено на "последнего администратора"
          }
          // Если есть другие админы, супер-админ может удалить себя.
          // Но лучше требовать, чтобы был минимум один super_admin.
          if (token.role === 'super_admin') {
              const superAdminCount = await prisma.adminUser.count({ where: { role: 'super_admin' } });
              if (superAdminCount <= 1 && userToDelete.role === 'super_admin') { // Проверяем, что удаляемый тоже супер-админ
                  return res.status(400).json({ message: 'Нельзя удалить единственного супер-администратора.' });
              }
          }
      }

      // Не позволяем обычному админу удалить кого-либо, включая себя.
      // Эта проверка уже есть в начале (token.role !== 'super_admin'), но для DELETE она особенно важна.
      // Дополнительная проверка, чтобы обычный админ не мог удалить супер-админа
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
    return res.status(500).json({ message: 'Внутренняя ошибка сервера.' });
  }
}
