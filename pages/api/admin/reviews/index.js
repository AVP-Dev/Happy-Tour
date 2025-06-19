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

// Главный обработчик для GET-запросов (получение списка отзывов)
export default async function handler(req, res) {
    // Здесь должна быть проверка авторизации
    
    if (req.method === 'GET') {
        try {
            const allReviews = await readReviews();

            // Нормализация данных: приводим все отзывы к единой структуре
            const normalizedReviews = allReviews.map(review => {
                const id = review.id || new Date(review.date).getTime();
                return {
                    id: String(id), // ID всегда строка для надежного сравнения
                    author: review.author || review.name,
                    text: review.text || review.message,
                    date: review.date,
                    status: review.status || 'pending'
                };
            });

            // Сортируем по ID (дате), чтобы новые были вверху
            const sortedReviews = normalizedReviews.sort((a, b) => b.id - a.id);
            return res.status(200).json(sortedReviews);

        } catch (error) {
            console.error('API Error in /api/admin/reviews (GET):', error);
            return res.status(500).json({ message: error.message });
        }
    }

    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
