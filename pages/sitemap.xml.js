import { SitemapStream, streamToPromise } from 'sitemap';
import { createGzip } from 'zlib';
import prisma from '../lib/prisma';

// getServerSideProps будет выполняться на стороне сервера при каждом запросе
export async function getServerSideProps({ res }) {
  try {
    // Создаем новый поток для генерации карты сайта
    const smStream = new SitemapStream({ hostname: 'https://happytour.by' });
    const pipeline = smStream.pipe(createGzip());

    // Добавляем статические страницы
    const staticUrls = [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/offer', changefreq: 'monthly', priority: 0.8 },
      { url: '/privacy', changefreq: 'monthly', priority: 0.5 },
      // Добавьте другие статические страницы, если они есть
    ];

    staticUrls.forEach(url => {
      smStream.write(url);
    });

    // Получаем динамические маршруты из базы данных (например, туры)
    const tours = await prisma.tour.findMany({
      where: {
        published: true, // Убедитесь, что у вас есть такое поле или измените логику
      },
      select: {
        id: true,
        updatedAt: true, // Используем для lastmod
      },
    });

    // Добавляем динамические страницы в карту сайта
    tours.forEach(tour => {
      smStream.write({
        url: `/tour/${tour.id}`, // Убедитесь, что URL-структура верна
        lastmod: tour.updatedAt,
        changefreq: 'weekly',
        priority: 0.9,
      });
    });

    // Завершаем поток
    smStream.end();

    // Преобразуем поток в строку
    const sitemap = await streamToPromise(pipeline);

    // Устанавливаем заголовки ответа
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Encoding', 'gzip');

    // Отправляем сгенерированную карту сайта
    res.write(sitemap);
    res.end();

    // Возвращаем пустые пропсы, так как страница не рендерит React-компонент
    return { props: {} };

  } catch (error) {
    console.error('Ошибка при генерации sitemap:', error);
    // В случае ошибки отправляем статус 500
    res.statusCode = 500;
    res.end();
    return { props: {} };
  }
}

// Компонент не нужен, так как getServerSideProps напрямую управляет ответом
const SitemapPage = () => null;

export default SitemapPage;
