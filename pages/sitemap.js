// pages/sitemap.js
// Этот файл генерирует динамический sitemap.xml с использованием getServerSideProps.
// Это позволяет Next.js напрямую обрабатывать запрос /sitemap.xml,
// обходя необходимость настройки правил перенаправления на уровне прокси-сервера (Traefik/Caddy).

import prisma from '../lib/prisma'; // Импортируем Prisma для доступа к базе данных

const BASE_URL = 'https://happytour.by'; // Укажи свой домен

// getServerSideProps запускается на каждом запросе к этой странице на сервере.
// Это позволяет нам динамически генерировать XML-ответ.
export async function getServerSideProps({ res }) {
  // Устанавливаем заголовок Content-Type для XML, чтобы браузеры и поисковые системы
  // правильно интерпретировали ответ как XML-файл.
  res.setHeader('Content-Type', 'application/xml');

  // Устанавливаем заголовки кэширования. Это важно для производительности,
  // так как sitemap не меняется очень часто. Кэшируем на 1 час (3600 секунд)
  // на CDN и в браузере.
  res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=3600');

  try {
    // Получаем все опубликованные туры.
    // Хотя в текущей реализации у туров нет отдельных страниц,
    // этот запрос оставлен здесь как пример для будущего расширения функционала.
    const tours = await prisma.tour.findMany({
      where: { published: true },
      select: { id: true, slug: true, updatedAt: true },
    });

    // Получаем все опубликованные отзывы.
    // Аналогично турам, оставлено для будущего расширения.
    const reviews = await prisma.review.findMany({
      where: { status: 'published' },
      select: { id: true, date: true },
    });

    // Начинаем формирование XML-строки sitemap.
    // Включаем обязательные XML-декларации и корневой элемент <urlset>.
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

    // Закомментированные блоки для динамических страниц туров и отзывов.
    // Если в будущем появятся отдельные страницы для туров (например, /tours/tour-slug)
    // или отзывов (например, /reviews/123), раскомментируйте и адаптируйте эти секции.
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

    // Завершаем XML-структуру sitemap.
    sitemap += `
</urlset>`;

    // Отправляем сгенерированный XML-файл в ответ.
    res.write(sitemap); // Используем res.write для потоковой записи
    res.end(); // Завершаем ответ

  } catch (error) {
    // В случае ошибки при генерации sitemap, логируем ее и отправляем 500 ошибку.
    console.error('Ошибка при генерации sitemap:', error);
    res.statusCode = 500;
    res.write('Ошибка при генерации sitemap.');
    res.end();
  }

  // getServerSideProps всегда должен возвращать объект с 'props'.
  // В данном случае, так как мы напрямую отправляем ответ через 'res',
  // пропсы не используются для рендеринга HTML, поэтому возвращаем пустой объект.
  return {
    props: {},
  };
}

// Этот компонент страницы не будет рендерить никакого HTML,
// так как ответ уже был отправлен через getServerSideProps.
// Он просто служит точкой входа для Next.js.
export default function SitemapPage() {
  return null;
}
