/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        // Этот паттерн разрешает изображения с вашего собственного сервера.
        protocol: 'https',
        hostname: 'happytour.by',
        port: '',
        pathname: '/**',
      },
      {
        // Этот паттерн нужен для аватарок пользователей Google Auth
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        // ИЗМЕНЕНИЕ: Добавлен домен для плейсхолдеров
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // ИЗМЕНЕНИЕ: Добавлена конфигурация для доверенных прокси
  // Это критически важно, если ваше приложение работает за прокси/балансировщиком нагрузки (как в Coolify)
  // и NextAuth.js не может корректно определить хост/протокол.
  // Установка 'true' означает, что Next.js будет доверять всем заголовкам X-Forwarded-*.
  // В продакшене для большей безопасности лучше указать массив IP-адресов ваших прокси.
  server: {
    trustedProxies: true, 
  },
};

module.exports = nextConfig;
