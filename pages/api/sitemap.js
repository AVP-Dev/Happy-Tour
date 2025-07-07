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
    // Получаем все опубликованные туры
    const tours = await prisma.tour.findMany({
      where: { published: true },
      select: { id: true, slug: true, updatedAt: true }, // Выбираем только нужные поля
    });

    // Получаем все опубликованные отзывы
    const reviews = await prisma.review.findMany({
      where: { status: 'published' },
      select: { id: true, date: true }, // Выбираем только нужные поля
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

    // Добавляем динамические страницы туров (если у них есть отдельные страницы)
    // Если у вас нет отдельных страниц для каждого тура (например, /tours/tour-slug),
    // то этот блок можно удалить. Если есть, убедитесь, что у каждого тура есть уникальный slug.
    // Если slug нет, вам нужно будет создать маршрут типа /tours/[id].js
    // и генерировать URL на основе ID, или добавить поле 'slug' в вашу модель Tour.
    // Пример: <loc>${BASE_URL}/tours/${tour.slug}</loc>
    // В вашем текущем проекте нет отдельных страниц для туров,
    // поэтому этот блок оставлен закомментированным как пример для будущего.
    /*
    tours.forEach(tour => {
      sitemap += `
  <url>
    <loc>${BASE_URL}/tours/${tour.slug}</loc>
    <lastmod>${tour.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });
    */

    // Добавляем динамические страницы отзывов (если у них есть отдельные страницы)
    // Аналогично турам, если у вас нет отдельных страниц для каждого отзыва,
    // этот блок можно удалить.
    /*
    reviews.forEach(review => {
      sitemap += `
  <url>
    <loc>${BASE_URL}/reviews/${review.id}</loc>
    <lastmod>${review.date.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });
    */

    sitemap += `
</urlset>`;

    // Отправляем сгенерированный sitemap
    res.status(200).send(sitemap);

  } catch (error) {
    console.error('Ошибка при генерации sitemap:', error);
    res.status(500).send('Ошибка при генерации sitemap.');
  }
}
