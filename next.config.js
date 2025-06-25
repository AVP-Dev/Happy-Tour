/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // ВНИМАНИЕ: Если вы размещаете все изображения локально,
    // вам не нужно указывать внешние домены.
    // 'placehold.co' оставлен на случай использования заглушек.
    domains: ['placehold.co'], 
  },
}

module.exports = nextConfig
