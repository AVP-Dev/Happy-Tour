// pages/api/images/[imageName].js
import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req, res) {
    const { imageName } = req.query;

    if (!imageName) {
        return res.status(400).json({ error: 'Имя изображения не указано' });
    }

    // Убедитесь, что imageName не содержит '../' для предотвращения обхода директорий
    const sanitizedImageName = path.basename(imageName); 

    // Путь к папке, где хранятся загруженные изображения
    const imagePath = path.join(process.cwd(), 'public', 'uploads', 'tours', sanitizedImageName);

    try {
        // Проверяем существование файла
        await fs.access(imagePath);

        // Определяем Content-Type на основе расширения файла
        const ext = path.extname(sanitizedImageName).toLowerCase();
        let contentType = 'application/octet-stream'; // По умолчанию
        switch (ext) {
            case '.webp':
                contentType = 'image/webp';
                break;
            case '.png':
                contentType = 'image/png';
                break;
            case '.jpg':
            case '.jpeg':
                contentType = 'image/jpeg';
                break;
            case '.gif':
                contentType = 'image/gif';
                break;
            // Добавьте другие типы, если необходимо
        }

        // Читаем файл и отправляем его в ответе
        const imageBuffer = await fs.readFile(imagePath);
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // Агрессивное кеширование для изображений
        res.status(200).send(imageBuffer);
    } catch (error) {
        console.error(`Ошибка при отдаче изображения ${sanitizedImageName}:`, error);
        if (error.code === 'ENOENT') {
            return res.status(404).json({ error: 'Изображение не найдено' });
        }
        res.status(500).json({ error: 'Ошибка сервера при отдаче изображения.' });
    }
}
