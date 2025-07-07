// pages/api/sitemap.js
import prisma from '../../lib/prisma'; // Импортируем Prisma для доступа к базе данных

const BASE_URL = 'https://happytour.by'; // Укажи свой домен

export default async function handler(req, res) {
  // Устанавливаем заголовок Content-Type для XML
  res.setHeader('Content-Type', 'application/xml');

  // Устанавливаем заголовки кэширования для sitemap
  // Кэшируем на 1 час (3600 секунд) на CDN и в браузере
  res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=3600');

  try {
    // Получаем все опубликованные туры (для примера, если бы у них были отдельные страницы)
    // В вашем текущем проекте туры не имеют отдельных страниц, поэтому этот запрос не используется для sitemap.
    // Оставлен для демонстрации, если функционал изменится в будущем.
    const tours = await prisma.tour.findMany({
      where: { published: true },
      select: { id: true, slug: true, updatedAt: true },
    });

    // Получаем все опубликованные отзывы (для примера, если бы у них были отдельные страницы)
    // В вашем текущем проекте отзывы не имеют отдельных страниц, поэтому этот запрос не используется для sitemap.
    // Оставлен для демонстрации, если функционал изменится в будущем.
    const reviews = await prisma.review.findMany({
      where: { status: 'published' },
      select: { id: true, date: true },
    });

    // Генерируем XML-структуру sitemap
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/privacy</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${BASE_URL}/offer</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
`;

    // Блоки для динамических страниц туров и отзывов закомментированы,
    // так как в текущей реализации у них нет отдельных страниц.
    // Если в будущем появятся страницы типа /tours/tour-slug или /reviews/123,
    // раскомментируйте и адаптируйте соответствующие секции.

    sitemap += `
</urlset>`;

    // Отправляем сгенерированный sitemap
    res.status(200).send(sitemap);

  } catch (error) {
    // Важно: логируем ошибку для отладки
    console.error('Ошибка при генерации sitemap:', error);
    // Отправляем 500 ошибку, чтобы показать, что что-то пошло не так на сервере
    res.status(500).send('Ошибка при генерации sitemap.');
  }
}
