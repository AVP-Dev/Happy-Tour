// components/Layout.js
import dynamic from 'next/dynamic';
import Header from './Header';
import Footer from './Footer';

// Dynamically import non-critical components
const FloatingContact = dynamic(() => import('./FloatingContact'), { ssr: false });
const CookieBanner = dynamic(() => import('./CookieBanner'), { ssr: false });

const Layout = ({ children }) => {
    return (
        <>
            <Header />
            <main>{children}</main>
            <Footer />
            <FloatingContact />
            {/* ADDED: Cookie consent banner */}
            <CookieBanner />
        </>
    );
};

export default Layout;
