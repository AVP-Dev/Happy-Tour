// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Используйте remotePatterns вместо domains
    // Добавьте сюда домены, с которых будут загружаться изображения.
    // Если изображения загружаются на тот же домен, где и приложение,
    // и находятся в папке public, то этот раздел может быть не нужен.
    remotePatterns: [
      {
        protocol: 'https', // или 'http'
        hostname: 'your-image-cdn.com', // Замените на домен вашего CDN/сервера изображений
        port: '',
        pathname: '/uploads/tours/**', // Укажите путь, если изображения находятся в подпапках
      },
      {
        protocol: 'https',
        hostname: 'happytour.by', // Если изображения отдаются с вашего же домена
        port: '',
        pathname: '/uploads/tours/**',
      },
      // Добавьте другие домены по мере необходимости
    ],
  },
};

module.exports = nextConfig;
