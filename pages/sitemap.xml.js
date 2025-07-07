// pages/sitemap.xml.js
import { SitemapStream, streamToPromise } from 'sitemap';
import { createGzip } from 'zlib';
import { Readable } from 'stream';
import prisma from '../lib/prisma';

/**
 * Эта страница не будет рендериться как компонент.
 * Вся логика выполняется на стороне сервера в getServerSideProps.
 * @returns {null}
 */
const SitemapXml = () => null;

export const getServerSideProps = async ({ res }) => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://happytour.by';

    // Устанавливаем заголовки ответа
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Encoding', 'gzip');

    // Получаем динамические маршруты туров из базы данных
    const tours = await prisma.tour.findMany({
      where: {
        published: true,
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    const tourLinks = tours.map((tour) => ({
      // Важно: убедитесь, что у вас есть страницы для туров по адресу /tours/[slug]
      url: `/tours/${tour.slug}`,
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: tour.updatedAt.toISOString(), // Дата должна быть в формате ISO
    }));

    // Определяем статические страницы
    const staticLinks = [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/offer', changefreq: 'monthly', priority: 0.5 },
      { url: '/privacy', changefreq: 'monthly', priority: 0.5 },
    ];

    const allLinks = [...staticLinks, ...tourLinks];

    // Создаем поток для генерации sitemap
    const stream = new SitemapStream({ hostname: baseUrl });

    // Создаем конвейер для сжатия в gzip и отправки в ответ
    // Это более эффективно, чем буферизация всего файла в памяти
    const pipeline = Readable.from(allLinks).pipe(stream).pipe(createGzip());

    // Направляем сгенерированный и сжатый sitemap напрямую в ответ
    pipeline.pipe(res).on('error', (e) => {
      throw e;
    });

    // Ожидаем завершения потока
    await streamToPromise(pipeline);

  } catch (error) {
    console.error('Ошибка генерации Sitemap:', error);
    res.statusCode = 500;
    res.end();
  }

  // Возвращаем пустые props, так как мы напрямую управляем ответом
  return {
    props: {},
  };
};

export default SitemapXml;
