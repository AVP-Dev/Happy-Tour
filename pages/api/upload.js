// pages/api/upload.js
import { promises as fs } from 'fs';
import path from 'path';
import formidable from 'formidable';
import { v4 as uuidv4 } from 'uuid';

export const config = {
    api: {
        bodyParser: false,
    },
};

// Функция для транслитерации и очистки имени файла
function sanitizeFilename(filename) {
    const translitMap = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
        'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
        'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'c',
        'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
        'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh',
        'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O',
        'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'C',
        'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
    };
    let sanitized = filename.split('').map(char => translitMap[char] || char).join('');
    return sanitized
        .replace(/[^a-z0-9._-]+/gi, '-')
        .replace(/--+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase();
}

// Определяем директорию для загрузок
const uploadDir = path.join(process.cwd(), '/public/uploads/tours');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    try {
        // Убеждаемся, что директория существует
        await fs.access(uploadDir).catch(() => fs.mkdir(uploadDir, { recursive: true }));

        const form = formidable({
            uploadDir,
            keepExtensions: true,
            maxFileSize: 5 * 1024 * 1024, // 5 MB
            filename: (name, ext, part) => {
                const originalName = part.originalFilename || 'file';
                const sanitizedName = sanitizeFilename(originalName.replace(ext, ''));
                // Добавляем UUID для 100% уникальности имени файла
                return `${sanitizedName}-${uuidv4()}${ext}`;
            },
            filter: ({ mimetype }) => {
                // Пропускаем только файлы изображений
                return mimetype && mimetype.includes("image");
            },
        });

        // --- ИЗМЕНЕНИЕ: Используем async/await с formidable для более предсказуемого кода ---
        const [fields, files] = await form.parse(req);
        
        const file = files.file?.[0];

        if (!file) {
            console.error('UPLOAD API: Файл не был получен или не прошел фильтр.');
            return res.status(400).json({ error: 'Файл не был загружен или тип файла не поддерживается.' });
        }

        // Формируем публичный URL к файлу
        const fileUrl = `/uploads/tours/${path.basename(file.filepath)}`;
        console.log(`UPLOAD API: Файл успешно загружен. URL: ${fileUrl}`);
        
        return res.status(200).json({ url: fileUrl });

    } catch (error) {
        console.error('UPLOAD API: Ошибка при обработке файла:', error);
        return res.status(500).json({ error: `Внутренняя ошибка сервера: ${error.message}` });
    }
}
