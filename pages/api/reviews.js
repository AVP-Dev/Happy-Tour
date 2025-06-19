import path from 'path';
import { promises as fs } from 'fs';

// Путь к файлу с отзывами
const reviewsFilePath = path.join(process.cwd(), 'public', 'data', 'reviews.json');

// Асинхронная функция для чтения данных
async function getReviews() {
    try {
        const fileContents = await fs.readFile(reviewsFilePath, 'utf8');
        return JSON.parse(fileContents);
    } catch (error) {
        // Если файл не существует или пуст, возвращаем пустой массив
        console.error('Could not read reviews file:', error);
        return [];
    }
}

// Асинхронная функция для записи данных
async function saveReviews(data) {
    await fs.writeFile(reviewsFilePath, JSON.stringify(data, null, 2), 'utf8');
}

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const allReviews = await getReviews();
            // Показываем только опубликованные отзывы
            const publishedReviews = allReviews.filter(review => review.status === 'published');
            // Сортируем по дате, новые вверху
            res.status(200).json(publishedReviews.sort((a, b) => new Date(b.date) - new Date(a.date)));
        } catch (error) {
            res.status(500).json({ message: 'Server error while getting reviews.' });
        }
    } 
    else if (req.method === 'POST') {
        try {
            const { name, email, phone, message } = req.body;

            if (!name || !message) {
                return res.status(400).json({ message: 'Имя и текст отзыва обязательны.' });
            }
            if (!email && !phone) {
                return res.status(400).json({ message: 'Необходимо указать Email или телефон.' });
            }

            const allReviews = await getReviews();
            const newReview = {
                id: Date.now().toString(), // id лучше делать строкой
                author: name, 
                email: email || '',
                phone: phone || '',
                text: message,
                date: new Date().toISOString(),
                status: 'pending' // Новый отзыв ждет модерации
            };

            allReviews.unshift(newReview);
            await saveReviews(allReviews);

            res.status(201).json({ message: 'Спасибо! Ваш отзыв отправлен на модерацию.' });
        } catch (error) {
            res.status(500).json({ message: 'Server error while posting a review.' });
        }
    } 
    else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
