import prisma from '../../../lib/prisma';
import { withAuth } from '../../../lib/auth';

// The original file was missing PUT and DELETE handlers.
// This version adds the required logic to update and delete reviews.
async function handler(req, res) {
  // Using a switch statement to handle different HTTP methods.
  switch (req.method) {
    case 'GET':
      try {
        const reviews = await prisma.review.findMany({
          orderBy: {
            createdAt: 'desc', // Sort reviews by creation date
          },
        });
        return res.status(200).json(reviews);
      } catch (error) {
        console.error("API Error fetching reviews:", error);
        return res.status(500).json({ error: 'Внутренняя ошибка сервера при загрузке отзывов.' });
      }

    case 'PUT':
      try {
        const { id, status } = req.body;

        // Validate incoming data
        if (!id || !status) {
          return res.status(400).json({ error: 'Отсутствует ID или статус в теле запроса.' });
        }
        
        const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: `Недопустимое значение статуса: ${status}` });
        }

        const updatedReview = await prisma.review.update({
          where: { id },
          data: { status },
        });
        return res.status(200).json(updatedReview);
      } catch (error) {
        console.error("API Error updating review:", error);
        // Handle Prisma's specific error for a record not found
        if (error.code === 'P2025') {
             return res.status(404).json({ error: 'Отзыв не найден.' });
        }
        return res.status(500).json({ error: 'Не удалось обновить отзыв.' });
      }

    case 'DELETE':
      try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: 'Отсутствует ID в теле запроса.' });
        }
        await prisma.review.delete({
          where: { id },
        });
        // 204 No Content is a standard successful response for DELETE
        return res.status(204).end();
      } catch (error) {
        console.error("API Error deleting review:", error);
        if (error.code === 'P2025') {
             return res.status(404).json({ error: 'Отзыв не найден.' });
        }
        return res.status(500).json({ error: 'Не удалось удалить отзыв.' });
      }

    default:
      // Handle unsupported HTTP methods
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Метод ${req.method} не поддерживается`);
  }
}

// The withAuth HOC remains unchanged
export default withAuth(handler, ['ADMIN']);
