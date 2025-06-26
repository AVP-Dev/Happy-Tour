// pages/api/auth/[...nextauth].js
// Этот маршрут API настраивает NextAuth.js для локальной аутентификации
// с использованием SQLite базы данных и bcryptjs для хеширования паролей.

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '../../../lib/prisma'; // Prisma Client для взаимодействия с SQLite
import bcrypt from 'bcryptjs'; // Для сравнения хешированных паролей

export const authOptions = {
  // Настройка стратегии сессии: 'jwt' рекомендуется для безсерверных и stateless приложений
  session: { strategy: 'jwt' },
  // Настройка страниц для аутентификации
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  // Конфигурация провайдеров аутентификации
  providers: [
    CredentialsProvider({
      name: 'Credentials', // Имя провайдера
      credentials: {
        // Определяем поля формы входа
        email: { label: "Email", type: "text" },
        password: { label: "Пароль", type: "password" }
      },
      // Функция авторизации: здесь происходит проверка учетных данных
      async authorize(credentials, req) {
        if (!credentials.email || !credentials.password) {
            return null; // Если email или пароль отсутствуют, авторизация невозможна
        }

        try {
          // 1. Поиск администратора по email в базе данных SQLite
          const adminUser = await prisma.adminUser.findUnique({
            where: { email: credentials.email },
          });

          // Если администратор не найден, или пароль не совпадает
          if (!adminUser || !bcrypt.compareSync(credentials.password, adminUser.passwordHash)) {
            console.log("Неверный Email или пароль для:", credentials.email);
            return null; // Возвращаем null, если аутентификация не удалась
          }

          // 2. Если аутентификация успешна, возвращаем объект пользователя.
          // Только 'id', 'email' и 'role' необходимы для сессии NextAuth.
          // Не возвращайте 'passwordHash' или другие чувствительные данные.
          console.log("Авторизация успешна для:", adminUser.email);
          return {
            id: adminUser.id,
            email: adminUser.email,
            role: adminUser.role, // Добавляем роль пользователя в объект сессии
          };

        } catch (error) {
          console.error("Ошибка авторизации:", error.message);
          return null; // В случае ошибки возвращаем null
        }
      }
    })
  ],
  // Callbacks для управления JWT и сессией
  callbacks: {
    // JWT callback: Добавляем дополнительные данные пользователя (id, role) в JWT токен
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role; // Добавляем роль из объекта user в токен
      }
      return token;
    },
    // Session callback: Добавляем данные из JWT токена в объект сессии, доступный на клиенте
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role; // Добавляем роль из токена в сессию
      }
      return session;
    }
  },
  // Секретный ключ для хеширования JWT. Должен быть длинной, случайной строкой.
  secret: process.env.NEXTAUTH_SECRET,
};

// Экспортируем обработчик NextAuth
export default NextAuth(authOptions);
