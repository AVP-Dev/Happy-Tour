// pages/api/images/[...slug].js
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';

export default async function handler(req, res) {
    const { slug } = req.query;
    if (!slug || !Array.isArray(slug)) {
        return res.status(400).json({ error: 'Неверный путь к файлу' });
    }

    try {
        // Собираем путь к файлу из сегментов slug
        const filePath = path.join(process.cwd(), 'public', ...slug);

        // Проверка безопасности: убеждаемся, что путь не выходит за пределы папки /public
        const publicDir = path.resolve(path.join(process.cwd(), 'public'));
        if (!path.resolve(filePath).startsWith(publicDir)) {
            return res.status(403).json({ error: 'Доступ запрещен' });
        }

        // Проверяем, существует ли файл
        const stats = await fs.promises.stat(filePath);

        if (stats.isFile()) {
            // Определяем MIME-тип файла
            const mimeType = mime.lookup(filePath) || 'application/octet-stream';
            
            // Устанавливаем заголовки ответа
            res.setHeader('Content-Type', mimeType);
            res.setHeader('Content-Length', stats.size);
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

            // Создаем поток для чтения файла и отправляем его в ответ
            const readStream = fs.createReadStream(filePath);
            readStream.pipe(res);
        } else {
            // Если это не файл, возвращаем 404
            res.status(404).json({ error: 'Ресурс не является файлом' });
        }
    } catch (error) {
        // Если файл не найден (ошибка ENOENT) или другая ошибка
        if (error.code === 'ENOENT') {
            res.status(404).json({ error: 'Файл не найден' });
        } else {
            console.error(`Ошибка при отдаче файла ${slug.join('/')}:`, error);
            res.status(500).json({ error: 'Внутренняя ошибка сервера' });
        }
    }
}
