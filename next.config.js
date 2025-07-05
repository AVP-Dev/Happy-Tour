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
        // ИЗМЕНЕНИЕ: Добавлен домен для плейсхолдеров, чтобы next/image мог их оптимизировать
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      // Добавьте сюда другие домены, если изображения хранятся на внешних CDN
    ],
  },
};

module.exports = nextConfig;
