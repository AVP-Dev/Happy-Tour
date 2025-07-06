// pages/api/auth/[...nextauth].js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyPassword } from '../../../lib/auth';
import prisma from '../../../lib/prisma';

export const authOptions = {
    session: {
        strategy: 'jwt',
    },
    url: process.env.NEXTAUTH_URL, 
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Пароль", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials) {
                    throw new Error("Не предоставлены данные для входа");
                }
                const user = await prisma.adminUser.findUnique({
                    where: { email: credentials.email },
                });
                if (!user) {
                    throw new Error('Пользователь с таким email не найден.');
                }
                const isValid = await verifyPassword(credentials.password, user.passwordHash);
                if (!isValid) {
                    throw new Error('Неверный пароль.');
                }
                
                return {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    name: user.name,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.name = user.name;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.name = token.name;
            }
            return session;
        },
    },
    pages: {
        signIn: '/admin/login',
        error: '/admin/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
