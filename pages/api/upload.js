// pages/api/upload.js
import { promises as fs } from 'fs';
import path from 'path';
import formidable from 'formidable';
import sharp from 'sharp';

export const config = {
    api: {
        bodyParser: false,
    },
};

// Функция для транслитерации и очистки имени файла
const slugify = (text) => {
    const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;'
    const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------'
    const p = new RegExp(a.split('').join('|'), 'g')

    return text.toString().toLowerCase()
        .replace(/\s+/g, '-') // Заменяем пробелы на -
        .replace(p, c => b.charAt(a.indexOf(c))) // Заменяем спецсимволы
        .replace(/&/g, '-and-') // Заменяем & на 'and'
        .replace(/[^\w\-]+/g, '') // Удаляем все не-буквенно-цифровые символы
        .replace(/\-\-+/g, '-') // Заменяем несколько - на один -
        .replace(/^-+/, '') // Убираем - в начале
        .replace(/-+$/, '') // Убираем - в конце
}

// Функция для обеспечения существования директории
const ensureDirectoryExistence = async (filePath) => {
    const dirname = path.dirname(filePath);
    try {
        await fs.access(dirname);
        console.log(`Директория существует: ${dirname}`);
    } catch (e) {
        console.log(`Директория не существует, создаем: ${dirname}`);
        await fs.mkdir(dirname, { recursive: true });
        console.log(`Директория создана: ${dirname}`);
    }
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Метод не разрешен' });
    }

    const form = formidable({});

    try {
        console.log('Начало обработки загрузки файла...');
        const [fields, files] = await form.parse(req);
        const file = files.file[0];

        if (!file) {
            console.error('Ошибка: Файл не найден в запросе.');
            return res.status(400).json({ error: 'Файл не найден' });
        }

        const originalFilename = file.originalFilename || 'image.webp';
        const fileExtension = path.extname(originalFilename);
        const baseFilename = path.basename(originalFilename, fileExtension);
        
        const sanitizedFilename = slugify(baseFilename);

        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const newFilename = `${sanitizedFilename}-${uniqueSuffix}.webp`; // Всегда сохраняем в .webp

        const publicFolderPath = path.join(process.cwd(), 'public', 'uploads');
        const newFilePath = path.join(publicFolderPath, newFilename);

        console.log(`Путь для сохранения файла: ${newFilePath}`);
        await ensureDirectoryExistence(newFilePath);

        console.log(`Начинаем обработку изображения с Sharp. Временный путь: ${file.filepath}`);
        await sharp(file.filepath)
            .resize({
                width: 1200,
                height: 1200,
                fit: 'inside',
                withoutEnlargement: true,
            })
            .webp({ quality: 80 })
            .toFile(newFilePath);
        console.log(`Файл успешно сохранен: ${newFilePath}`);

        const fileUrl = `/uploads/${newFilename}`;
        console.log(`Сгенерированный URL файла: ${fileUrl}`);

        res.status(200).json({ url: fileUrl });
    } catch (error) {
        console.error('Критическая ошибка при загрузке файла:', error);
        res.status(500).json({ error: `Ошибка сервера при загрузке файла: ${error.message}` });
    }
}
