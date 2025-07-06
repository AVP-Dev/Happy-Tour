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

const ensureDirectoryExistence = async (filePath) => {
    const dirname = path.dirname(filePath);
    try {
        await fs.access(dirname);
    } catch (e) {
        console.log(`Directory does not exist, creating: ${dirname}`);
        await fs.mkdir(dirname, { recursive: true });
    }
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Метод не разрешен' });
    }

    console.log('[upload.js] Received a file upload request.');
    const form = formidable({});

    try {
        console.log('[upload.js] Parsing form data...');
        const [fields, files] = await form.parse(req);
        
        if (!files.file || !files.file[0]) {
            console.error('[upload.js] Error: No file found in the request.');
            return res.status(400).json({ error: 'Файл не найден в запросе.' });
        }
        
        const file = files.file[0];
        console.log(`[upload.js] File received. Original name: ${file.originalFilename}, Temp path: ${file.filepath}`);

        const originalFilename = file.originalFilename || 'image.webp';
        const fileExtension = path.extname(originalFilename);
        const baseFilename = path.basename(originalFilename, fileExtension);
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const newFilename = `${baseFilename}-${uniqueSuffix}.webp`;

        const publicFolderPath = path.join(process.cwd(), 'public', 'uploads');
        const newFilePath = path.join(publicFolderPath, newFilename);

        console.log(`[upload.js] Ensuring directory exists: ${publicFolderPath}`);
        await ensureDirectoryExistence(newFilePath);

        console.log(`[upload.js] Processing image with sharp and saving to: ${newFilePath}`);
        await sharp(file.filepath)
            .resize({
                width: 1200,
                height: 1200,
                fit: 'inside',
                withoutEnlargement: true,
            })
            .webp({ quality: 80 })
            .toFile(newFilePath);
        
        console.log('[upload.js] File successfully saved.');

        const fileUrl = `/uploads/${newFilename}`;
        console.log(`[upload.js] Returning file URL: ${fileUrl}`);

        res.status(200).json({ url: fileUrl });

    } catch (error) {
        console.error('[upload.js] A CRITICAL ERROR occurred during file upload:', error);
        res.status(500).json({ error: 'Критическая ошибка сервера при загрузке файла.', details: error.message });
    }
}
