import fs from 'fs/promises';
import path from 'path';

const REVIEWS_FILE_PATH = path.join(process.cwd(), 'public', 'data', 'reviews.json');

// Вспомогательная функция для чтения
const readReviews = async () => {
    try {
        const fileContent = await fs.readFile(REVIEWS_FILE_PATH, 'utf-8');
        return fileContent.length === 0 ? [] : JSON.parse(fileContent);
    } catch (error) {
        if (error.code === 'ENOENT') return [];
        console.error("Error reading reviews file:", error);
        throw new Error('Ошибка чтения данных отзывов');
    }
};

// Вспомогательная функция для записи
const writeReviews = (data) => fs.writeFile(REVIEWS_FILE_PATH, JSON.stringify(data, null, 2));


// Обработчик для PUT (изменение) и DELETE (удаление)
export default async function handler(req, res) {
    const { id: idFromQuery } = req.query; // ID из URL

    // Здесь также должна быть проверка авторизации

    try {
        let allReviews = await readReviews();
        
        switch (req.method) {
            case 'PUT': { // Обновление статуса
                const { status } = req.body;
                if (!status) {
                    return res.status(400).json({ message: 'Необходим новый статус.' });
                }

                // Ищем индекс отзыва, используя ту же логику генерации ID
                const reviewIndex = allReviews.findIndex(review => {
                    const reviewId = review.id || new Date(review.date).getTime();
                    return String(reviewId) === idFromQuery;
                });

                if (reviewIndex === -1) {
                    return res.status(404).json({ message: 'Отзыв не найден для обновления.' });
                }

                // Обновляем статус
                allReviews[reviewIndex].status = status;

                // Если у отзыва не было ID, добавляем его, чтобы исправить данные
                if (!allReviews[reviewIndex].id) {
                    allReviews[reviewIndex].id = new Date(allReviews[reviewIndex].date).getTime();
                }
                
                await writeReviews(allReviews);
                return res.status(200).json({ message: 'Статус отзыва успешно обновлен.' });
            }
            
            case 'DELETE': { // Удаление
                const initialLength = allReviews.length;

                // Фильтруем массив, удаляя нужный отзыв
                const updatedReviews = allReviews.filter(review => {
                    const reviewId = review.id || new Date(review.date).getTime();
                    return String(reviewId) !== idFromQuery;
                });

                if (updatedReviews.length === initialLength) {
                    return res.status(404).json({ message: 'Отзыв не найден для удаления.' });
                }

                await writeReviews(updatedReviews);
                return res.status(200).json({ message: 'Отзыв успешно удален.' });
            }

            default:
                res.setHeader('Allow', ['PUT', 'DELETE']);
                res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error(`API Error in /api/admin/reviews/${idFromQuery} (${req.method}):`, error);
        return res.status(500).json({ message: error.message || 'Внутренняя ошибка сервера' });
    }
}
