// pages/api/upload.js
import { promises as fs } from 'fs';
import path from 'path';
import formidable from 'formidable';
import sharp from 'sharp'; // Библиотека для обработки изображений

export const config = {
    api: {
        bodyParser: false,
    },
};

// Функция для обеспечения существования директории
const ensureDirectoryExistence = async (filePath) => {
    const dirname = path.dirname(filePath);
    try {
        await fs.access(dirname);
    } catch (e) {
        await fs.mkdir(dirname, { recursive: true });
    }
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Метод не разрешен' });
    }

    const form = formidable({});

    try {
        const [fields, files] = await form.parse(req);
        const file = files.file[0];

        if (!file) {
            return res.status(400).json({ error: 'Файл не найден' });
        }

        // Генерируем уникальное имя файла и путь
        const originalFilename = file.originalFilename || 'image.webp';
        const fileExtension = path.extname(originalFilename);
        const baseFilename = path.basename(originalFilename, fileExtension);
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const newFilename = `${baseFilename}-${uniqueSuffix}.webp`; // Всегда сохраняем в .webp

        const publicFolderPath = path.join(process.cwd(), 'public', 'uploads');
        const newFilePath = path.join(publicFolderPath, newFilename);

        // Убедимся, что папка 'public/uploads' существует
        await ensureDirectoryExistence(newFilePath);

        // --- ИЗМЕНЕНО: Сжатие и конвертация изображения с помощью sharp ---
        await sharp(file.filepath)
            .resize({
                width: 1200, // Максимальная ширина
                height: 1200, // Максимальная высота
                fit: 'inside', // Сохраняет пропорции, вписывая в размеры
                withoutEnlargement: true, // Не увеличивать, если изображение меньше
            })
            .webp({ quality: 80 }) // Конвертируем в WebP с качеством 80%
            .toFile(newFilePath);
        // --- КОНЕЦ ИЗМЕНЕНИЯ ---

        const fileUrl = `/uploads/${newFilename}`;

        res.status(200).json({ url: fileUrl });
    } catch (error) {
        console.error('Ошибка при загрузке файла:', error);
        res.status(500).json({ error: 'Ошибка сервера при загрузке файла.' });
    }
}
