import dynamic from 'next/dynamic';
import { Box } from '@chakra-ui/react';
import Header from './Header';
import Footer from './Footer';

// Динамический импорт для компонентов, которые не нужны при первой загрузке
const FloatingContact = dynamic(() => import('./FloatingContact'), { ssr: false });
const CookieBanner = dynamic(() => import('./CookieBanner'), { ssr: false });

const Layout = ({ children }) => {
    return (
        <Box
            position="relative"
            minHeight="100vh"
            display="flex"
            flexDirection="column"
            // Псевдоэлемент для фонового изображения
            _before={{
                content: '""',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                // Убедись, что изображение находится в /public/pattern-world-map-travel.webp
                backgroundImage: "url('/pattern-world-map-travel.webp')",
                backgroundSize: 'cover', // Можно поменять на 'contain' или 'auto'
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed', // Фон зафиксирован при скролле
                zIndex: -2, // Помещаем на самый задний план
                opacity: 0.1, // Делаем фон полупрозрачным, чтобы не мешал контенту
            }}
            // Псевдоэлемент для сплошного цвета под контентом, если фон не загрузится
            _after={{
                content: '""',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bg: 'white', // Основной цвет фона сайта
                zIndex: -1, // Находится над изображением, но под контентом
            }}
        >
            <Header />
            <Box as="main" flexGrow={1} zIndex="1" position="relative">
                {children}
            </Box>
            <Footer />
            <FloatingContact />
            <CookieBanner />
        </Box>
    );
};

export default Layout;
