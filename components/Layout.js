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
                // Убедитесь, что изображение находится в /public/pattern-world-map-travel.webp
                backgroundImage: "url('/pattern-world-map-travel.webp')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                zIndex: -1, // Помещаем на самый задний план
                opacity: 0.1, // Регулируйте прозрачность фона по вкусу
            }}
        >
            <Header />
            {/* Основной контент теперь не имеет своего фона, позволяя видеть фон Layout */}
            <Box as="main" flexGrow={1} zIndex="1" position="relative" bg="transparent">
                {children}
            </Box>
            <Footer />
            <FloatingContact />
            <CookieBanner />
        </Box>
    );
};

export default Layout;
