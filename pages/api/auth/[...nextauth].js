    import NextAuth from 'next-auth';
    import CredentialsProvider from 'next-auth/providers/credentials';
    import { signInWithEmailAndPassword } from 'firebase/auth';
    import { auth } from '../../../lib/firebase'; // Импортируем клиентский auth из firebase.js
    import { adminAuth } from '../../../lib/firebaseAdmin'; // <<< НОВЫЙ ИМПОРТ: Firebase Admin Auth

    export const authOptions = {
      session: { strategy: 'jwt' },
      pages: {
        signIn: '/admin/login',
        error: '/admin/login',
      },
      providers: [
        CredentialsProvider({
          name: 'Credentials',
          credentials: {
            username: { label: "Username", type: "text" },
            password: {  label: "Password", type: "password" }
          },
          async authorize(credentials, req) {
            try {
              // 1. Аутентификация пользователя через клиентский Firebase Auth (на сервере)
              const userCredential = await signInWithEmailAndPassword(
                auth, 
                credentials.username, 
                credentials.password
              );

              if (userCredential.user) {
                const firebaseUser = userCredential.user;

                // 2. Генерируем Custom Token для этого пользователя через Firebase Admin SDK
                // Этот токен будет использоваться на клиенте для входа в Firebase Auth SDK
                const customToken = await adminAuth.createCustomToken(firebaseUser.uid);
                
                // >>> ЛОГИРУЕМ СГЕНЕРИРОВАННЫЙ CUSTOM TOKEN НА СЕРВЕРЕ <<<
                console.log("SERVER: Generated Custom Token for Firebase Auth Sync:", customToken);

                // Возвращаем объект пользователя NextAuth, включая Custom Token
                return { 
                  id: firebaseUser.uid, 
                  name: firebaseUser.email, 
                  email: firebaseUser.email,
                  customToken: customToken // Передаем Custom Token в сессию NextAuth
                };
              }
              return null;

            } catch (error) {
              console.error("Firebase Auth Error (authorize):", error.code, error.message);
              return null; 
            }
          }
        })
      ],
      callbacks: {
        async jwt({ token, user }) {
          if (user) {
            token.id = user.id;
            if (user.customToken) { // Если Custom Token есть
              token.customToken = user.customToken; // Добавляем его в JWT токен
            }
          }
          return token;
        },
        async session({ session, token }) {
          if (token && session.user) {
            session.user.id = token.id;
            if (token.customToken) { // Если Custom Token есть
              session.user.customToken = token.customToken; // Добавляем его в сессию
            }
          }
          return session;
        }
      },
      secret: process.env.NEXTAUTH_SECRET,
    };

    export default NextAuth(authOptions);
    
