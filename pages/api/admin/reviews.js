import prisma from '../../../lib/prisma';
import { withAuth } from '../../../lib/auth';

// Эта версия убирает прямой импорт { Prisma } из '@prisma/client',
// который мог вызывать падение сервера при проблемах с генерацией клиента Prisma.
// Обработка ошибок теперь полагается на проверку кодов ошибок, что более надежно.

async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      try {
        // Логирование для отслеживания выполнения на сервере
        console.log("[API_INFO] /api/admin/reviews (GET): Попытка получить отзывы."); 
        const reviews = await prisma.review.findMany({
          // orderBy: { // Закомментировано для отладки. Если после этого заработает,
          //   createdAt: 'desc', // то проблема в поле createdAt или его индексации.
          // },
        });
        // Логирование успешного получения данных
        console.log(`[API_INFO] /api/admin/reviews (GET): Успешно получено ${reviews.length} отзывов.`); 
        return res.status(200).json(reviews);
      } catch (error) {
        // Расширенное логирование на сервере для полной диагностики
        console.error("[API_ERROR] /api/admin/reviews (GET):", {
            message: error.message,
            code: error.code, // Код ошибки Prisma
            stack: error.stack,
            name: error.name, // Имя ошибки для дополнительной диагностики
        });

        // Проверяем наличие кода ошибки, характерного для Prisma
        if (error.code) {
          const errorMessage = `Ошибка базы данных (код: ${error.code}). Проверьте лог сервера для деталей.`;
          return res.status(500).json({ error: errorMessage });
        }
        
        // Общая ошибка - теперь с более подробным сообщением для клиента
        return res.status(500).json({ error: `Внутренняя ошибка сервера. Не удалось получить отзывы. Детали: ${error.message || 'Неизвестная ошибка.'}` });
      }

    case 'PUT':
      try {
        const { id, status } = req.body;
        if (!id || !status) {
          return res.status(400).json({ error: 'Отсутствует ID или статус.' });
        }
        const updatedReview = await prisma.review.update({
          where: { id },
          data: { status },
        });
        return res.status(200).json(updatedReview);
      } catch (error) {
        console.error("[API_ERROR] /api/admin/reviews (PUT):", error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Отзыв для обновления не найден.' });
        }
        return res.status(500).json({ error: 'Не удалось обновить отзыв.' });
      }

    case 'DELETE':
      try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: 'Отсутствует ID.' });
        }
        await prisma.review.delete({ where: { id } });
        return res.status(204).end();
      } catch (error) {
        console.error("[API_ERROR] /api/admin/reviews (DELETE):", error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Отзыв для удаления не найден.' });
        }
        return res.status(500).json({ error: 'Не удалось удалить отзыв.' });
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Метод ${req.method} не поддерживается`);
  }
}

export default withAuth(handler, ['ADMIN']);
