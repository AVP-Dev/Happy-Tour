// pages/api/admin/users.js

import prisma from '../../../lib/prisma'; // ИСПРАВЛЕНО
import { hashPassword, verifyPassword } from '../../../lib/auth'; // ИСПРАВЛЕНО
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !['admin', 'super_admin'].includes(session.user.role)) {
        return res.status(403).json({ message: 'Доступ запрещен' });
    }

    switch (req.method) {
        case 'GET':
            try {
                // --- ИЗМЕНЕНИЕ: Явно выбираем все поля, включая 'name' ---
                const users = await prisma.adminUser.findMany({
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: 'desc' },
                });
                res.status(200).json(users);
            } catch (error) {
                res.status(500).json({ message: 'Ошибка при получении пользователей' });
            }
            break;

        case 'POST':
            if (session.user.role !== 'super_admin') {
                return res.status(403).json({ message: 'Недостаточно прав для создания пользователя' });
            }
            try {
                const { name, email, password, role } = req.body;
                if (!name || !email || !password || !role) {
                    return res.status(400).json({ message: 'Все поля обязательны' });
                }
                const hashedPassword = await hashPassword(password);
                const newUser = await prisma.adminUser.create({
                    data: { name, email, passwordHash: hashedPassword, role },
                });
                res.status(201).json({ id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role });
            } catch (error) {
                if (error.code === 'P2002') {
                    return res.status(409).json({ message: 'Пользователь с таким email уже существует.' });
                }
                res.status(500).json({ message: 'Ошибка при создании пользователя' });
            }
            break;

        case 'PUT':
             if (session.user.role !== 'super_admin') {
                return res.status(403).json({ message: 'Недостаточно прав для редактирования' });
            }
            try {
                const { id, name, email, password, role } = req.body;
                if (!id) return res.status(400).json({ message: 'ID не указан' });

                const dataToUpdate = { name, email, role };
                if (password) {
                    dataToUpdate.passwordHash = await hashPassword(password);
                }

                const updatedUser = await prisma.adminUser.update({
                    where: { id },
                    data: dataToUpdate,
                });
                res.status(200).json({ id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role });
            } catch (error) {
                 if (error.code === 'P2002') {
                    return res.status(409).json({ message: 'Пользователь с таким email уже существует.' });
                }
                res.status(500).json({ message: 'Ошибка при обновлении пользователя' });
            }
            break;

        case 'DELETE':
            if (session.user.role !== 'super_admin') {
                return res.status(403).json({ message: 'Недостаточно прав для удаления' });
            }
            try {
                const { id } = req.query;
                if (id === session.user.id) {
                    return res.status(400).json({ message: 'Нельзя удалить самого себя.' });
                }
                await prisma.adminUser.delete({ where: { id: String(id) } });
                res.status(200).json({ message: 'Пользователь удален' });
            } catch (error) {
                res.status(500).json({ message: 'Ошибка при удалении пользователя' });
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
