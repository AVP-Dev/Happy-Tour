/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // --- РЕШАЮЩЕЕ ИЗМЕНЕНИЕ ---
    // Эта строка полностью отключает оптимизацию изображений в Next.js.
    // Компонент <Image> будет работать как обычный тег <img>,
    // но с сохранением пропсов вроде layout="fill".
    unoptimized: true,
    // --- КОНЕЦ ИЗМЕНЕНИЯ ---

    // Оставляем remotePatterns для внешних изображений, если они есть.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'happytour.by',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
};

module.exports = nextConfig;
