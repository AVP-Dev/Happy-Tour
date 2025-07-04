/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        // Этот паттерн разрешает изображения с вашего собственного сервера.
        // Так как сайт и фото на одном VPS, мы указываем домен сайта.
        protocol: 'https', // Используйте 'http', если на VPS нет SSL-сертификата, или 'https' при наличии
        hostname: 'happytour.by',
        port: '',
        pathname: '/**', // Разрешаем все пути (например, /uploads/...)
      },
      {
        // Этот паттерн нужен для аватарок пользователей, если вы используете Google Auth
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
