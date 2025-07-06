import prisma from '../../../lib/prisma';
import { withAuth } from '../../../lib/auth';

async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      try {
        console.log("[API_INFO] /api/admin/reviews (GET): Попытка получить отзывы."); 
        const reviews = await prisma.review.findMany({
          orderBy: { 
            date: 'desc', 
          },
        });
        console.log(`[API_INFO] /api/admin/reviews (GET): Успешно получено ${reviews.length} отзывов.`); 
        return res.status(200).json(reviews);
      } catch (error) {
        console.error("[API_ERROR] /api/admin/reviews (GET):", {
            message: error.message,
            code: error.code, 
            stack: error.stack,
            name: error.name, 
        });

        if (error.code) {
          const errorMessage = `Ошибка базы данных (код: ${error.code}). Проверьте лог сервера для деталей.`;
          return res.status(500).json({ error: errorMessage });
        }
        
        return res.status(500).json({ error: `Внутренняя ошибка сервера. Не удалось получить отзывы. Детали: ${error.message || 'Неизвестная ошибка.'}` });
      }

    case 'PUT':
      try {
        const { id, status, text } = req.body; 
        if (!id || (!status && !text)) { 
          return res.status(400).json({ error: 'Отсутствует ID или данные для обновления (статус или текст).' });
        }

        const updateData = {};
        if (status) {
            updateData.status = status;
        }
        if (text) { 
            updateData.text = text;
        }

        const updatedReview = await prisma.review.update({
          where: { id },
          data: updateData, 
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

// Изменено: Разрешаем роли 'admin' и 'super_admin'
export default withAuth(handler, ['admin', 'super_admin']); 
