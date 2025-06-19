import dynamic from 'next/dynamic';
import Header from './Header'; // Убедитесь, что файлы Header и Footer находятся в этой же папке
import Footer from './Footer';

// Динамически импортируем FloatingContact с отключением рендеринга на сервере (SSR)
const FloatingContact = dynamic(() => import('./FloatingContact'), { ssr: false });

const Layout = ({ children }) => {
    return (
        <>
            <Header />
            <main>{children}</main>
            <Footer />
            <FloatingContact />
        </>
    );
};

export default Layout;