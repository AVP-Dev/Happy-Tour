// components/Layout.js
import dynamic from 'next/dynamic';
import { Flex, Box } from '@chakra-ui/react';
import Header from './Header';
import Footer from './Footer';

// Динамический импорт для компонентов, не критичных для первого рендера
const FloatingContact = dynamic(() => import('./FloatingContact'), { ssr: false });
const CookieBanner = dynamic(() => import('./CookieBanner'), { ssr: false });

const Layout = ({ children }) => {
    return (
        <Flex direction="column" minHeight="100vh">
            <Header />
            {/* Box с flexGrow={1} заставляет main занять все доступное пространство */}
            <Box as="main" flexGrow={1}>
                {children}
            </Box>
            <Footer />
            <FloatingContact />
            <CookieBanner />
        </Flex>
    );
};

export default Layout;
