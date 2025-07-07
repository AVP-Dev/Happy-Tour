// pages/sitemap.js
// Этот файл генерирует динамический sitemap.xml с использованием getServerSideProps.
// Временно отключен доступ к Prisma для диагностики проблем с 404.

// import prisma from '../lib/prisma'; // Закомментируем импорт Prisma

const BASE_URL = 'https://happytour.by'; // Укажи свой домен

export async function getServerSideProps({ res }) {
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=3600');

  try {
    // Временно убираем запросы к Prisma
    // const tours = await prisma.tour.findMany({ /* ... */ });
    // const reviews = await prisma.review.findMany({ /* ... */ });

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
</urlset>`;

    res.write(sitemap);
    res.end();

  } catch (error) {
    console.error('Ошибка при генерации sitemap (диагностика):', error);
    res.statusCode = 500;
    res.write('Ошибка при генерации sitemap (диагностика).');
    res.end();
  }

  return {
    props: {},
  };
}

export default function SitemapPage() {
  return null;
}
