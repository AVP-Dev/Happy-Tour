import prisma from '../../../lib/prisma';
import { withAuth } from '../../../lib/auth';
import { Prisma } from '@prisma/client'; // Импортируем типы ошибок Prisma

async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      try {
        const reviews = await prisma.review.findMany({
          orderBy: {
            createdAt: 'desc',
          },
        });
        return res.status(200).json(reviews);
      } catch (error) {
        // Расширенное логирование на сервере для полной диагностики
        console.error("[API_ERROR] /api/admin/reviews:", error);

        // Проверяем, является ли ошибка известной ошибкой Prisma
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          const errorMessage = `Ошибка базы данных (код: ${error.code}). Проверьте лог сервера.`;
          return res.status(500).json({ error: errorMessage });
        }
        // Проверяем на ошибки валидации (часто - несоответствие схемы)
        if (error instanceof Prisma.PrismaClientValidationError) {
          const errorMessage = `Ошибка валидации данных Prisma. Возможно, схема БД и schema.prisma не синхронизированы.`;
          return res.status(500).json({ error: errorMessage });
        }
        
        // Общая ошибка, если тип не определен
        return res.status(500).json({ error: 'Внутренняя ошибка сервера. Не удалось получить отзывы.' });
      }

    case 'PUT':
      // Код для PUT остается без изменений
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
        return res.status(500).json({ error: 'Не удалось обновить отзыв.' });
      }

    case 'DELETE':
      // Код для DELETE остается без изменений
      try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: 'Отсутствует ID.' });
        }
        await prisma.review.delete({ where: { id } });
        return res.status(204).end();
      } catch (error) {
        console.error("[API_ERROR] /api/admin/reviews (DELETE):", error);
        return res.status(500).json({ error: 'Не удалось удалить отзыв.' });
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Метод ${req.method} не поддерживается`);
  }
}

export default withAuth(handler, ['ADMIN']);
