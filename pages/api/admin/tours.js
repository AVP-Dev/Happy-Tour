import fs from 'fs/promises';
import path from 'path';

// It's better to store file path in a constant
const TOURS_FILE_PATH = path.join(process.cwd(), 'public', 'data', 'data.json');

// Helper function to read data
const readToursData = async () => {
    try {
        const fileData = await fs.readFile(TOURS_FILE_PATH, 'utf-8');
        return JSON.parse(fileData);
    } catch (error) {
        if (error.code === 'ENOENT') return {}; // Return empty object if file doesn't exist
        console.error("Could not read tours data:", error);
        throw new Error("Не удалось прочитать данные туров.");
    }
};

// Helper function to write data
const writeToursData = async (data) => {
    try {
        await fs.writeFile(TOURS_FILE_PATH, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Could not write tours data:", error);
        throw new Error("Не удалось сохранить данные туров.");
    }
};

// Main handler
export default async function handler(req, res) {
    // In a real app, you must protect your API routes.
    // The commented-out 'next-auth' code has been removed to fix the build error.
    // You should implement a real authentication check here (e.g., using cookies or tokens).

    try {
        const tours = await readToursData();

        switch (req.method) {
            case 'GET':
                return res.status(200).json(tours);

            case 'POST': { // Add a new tour
                const { category, title, description, price, currency, image } = req.body;
                if (!category || !title || !price || !image || !tours[category]) {
                    return res.status(400).json({ message: 'Неверная категория или отсутствуют обязательные поля.' });
                }
                const newTour = { title, description, price: parseFloat(price), currency, image };
                tours[category].push(newTour);
                await writeToursData(tours);
                return res.status(201).json({ message: 'Тур успешно добавлен!' });
            }

            case 'PUT': { // Edit an existing tour
                const { category, tourId, title, description, price, currency, image } = req.body;
                if (category === undefined || tourId === undefined || !tours[category] || tours[category][tourId] === undefined) {
                    return res.status(400).json({ message: 'Ошибка: Неверные данные для редактирования.' });
                }
                tours[category][tourId] = { title, description, price: parseFloat(price), currency, image };
                await writeToursData(tours);
                return res.status(200).json({ message: 'Тур успешно обновлен!' });
            }
            
            case 'DELETE': { // Delete a tour
                const { category, tourId } = req.body;
                if (!tours[category] || tours[category][tourId] === undefined) {
                    return res.status(404).json({ message: 'Тур для удаления не найден.' });
                }
                tours[category].splice(tourId, 1);
                await writeToursData(tours);
                return res.status(200).json({ message: 'Тур успешно удален.' });
            }
            
            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                return res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error(`API Error in /api/admin/tours (${req.method}):`, error);
        return res.status(500).json({ message: error.message || 'Внутренняя ошибка сервера.' });
    }
}

// Increase body size limit for base64 images
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '5mb',
        },
    },
};
