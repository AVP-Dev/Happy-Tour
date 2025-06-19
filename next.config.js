/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // ИЗМЕНЕНИЕ: Добавляем новый домен для заглушек
    domains: ['images.unsplash.com', 'placehold.co'],
  },
}

module.exports = nextConfig
