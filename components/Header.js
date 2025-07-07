// components/Header.js
import { useState, useEffect } from 'react';
import NextLink from 'next/link';
import NextImage from 'next/image'; // Импортируем NextImage
import { useRouter } from 'next/router';
import {
    Box,
    Flex,
    Container,
    Link,
    Button,
    // Image, // Удаляем импорт Chakra UI Image, так как будем использовать NextImage
    Heading,
    HStack,
    VStack,
    IconButton,
    useDisclosure,
    Drawer,
    DrawerBody,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
} from '@chakra-ui/react';
import { FaBars } from 'react-icons/fa';

const Header = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [isScrolled, setIsScrolled] = useState(false);
    const router = useRouter();
    const isNotHomePage = router.pathname !== '/';

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    
    useEffect(() => {
        onClose();
    }, [router.asPath, onClose]);

    const scrollToSection = (e, anchor) => {
        e.preventDefault();
        onClose();
        const targetId = anchor.substring(1);
        if (router.pathname === '/') {
            document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
        } else {
            router.push(`/${anchor}`);
        }
    };

    const navLinks = [
        { label: 'Главная', anchor: '#home' },
        { label: 'Туры', anchor: '#hot-tours' },
        { label: 'Отзывы', anchor: '#reviews' },
        { label: 'Популярные вопросы', anchor: '#faq' },
        { label: 'Контакты', anchor: '#contact-section' },
    ];

    const headerStyles = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: "docked",
        transition: "background-color 0.4s ease, box-shadow 0.4s ease, backdrop-filter 0.4s ease",
        ...(isScrolled || isNotHomePage ? {
            bg: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            boxShadow: 'sm',
        } : {
            bg: 'transparent',
            boxShadow: 'none',
        })
    };
    
    const linkColor = isScrolled || isNotHomePage ? 'gray.700' : 'white';
    const textShadow = isScrolled || isNotHomePage ? 'none' : '1px 1px 3px rgba(0,0,0,0.4)';

    return (
        <Box as="header" {...headerStyles}>
            <Container maxW="container.xl">
                <Flex as="nav" align="center" justify="space-between" py={{ base: 1, md: 2 }}>
                    <Link as={NextLink} href="/" display="flex" alignItems="center" _hover={{ textDecoration: 'none' }}>
                        {/* ИЗМЕНЕНИЕ: Используем NextImage для логотипа */}
                        <Box position="relative" h={{ base: '55px', md: '75px' }} w={{ base: '150px', md: '200px' }}> {/* Обертка для задания размеров */}
                            <NextImage
                                src="/img/logo.png"
                                alt="Happy Tour Logo"
                                layout="fill" // Используем layout="fill" для адаптивного размера внутри родителя
                                objectFit="contain" // Убедимся, что логотип вписывается без обрезки
                                priority // Загружаем логотип с высоким приоритетом, так как он виден на первом экране
                            />
                        </Box>
                        <Heading as="span" size={{ base: 'md', md: 'lg' }} color="brand.500" ml={2} lineHeight={1}>
                            Happy Tour
                        </Heading>
                    </Link>

                    <HStack spacing={8} display={{ base: 'none', md: 'flex' }}>
                        {navLinks.map(({ label, anchor }) => (
                            <Link 
                                key={label}
                                as={NextLink} 
                                href={`/${anchor}`}
                                onClick={(e) => scrollToSection(e, anchor)}
                                fontWeight="600"
                                color={linkColor}
                                textShadow={textShadow}
                                _hover={{ color: 'brand.500', textDecoration: 'none' }}
                                position="relative"
                                _after={{
                                    content: '""',
                                    position: 'absolute',
                                    width: '0',
                                    height: '2px',
                                    bottom: '-5px',
                                    left: '0',
                                    bgColor: 'brand.500',
                                    transition: 'width .3s',
                                }}
                                _hover_after={{ width: '100%' }}
                            >
                                {label}
                            </Link>
                        ))}
                    </HStack>

                    <Button
                        display={{ base: 'none', md: 'inline-flex' }}
                        onClick={(e) => scrollToSection(e, '#tourvisor')}
                    >
                        Подбор тура
                    </Button>

                    <IconButton
                        aria-label="Открыть меню"
                        icon={<FaBars />}
                        display={{ base: 'flex', md: 'none' }}
                        onClick={onOpen}
                        variant="ghost"
                        fontSize="2xl"
                        color={linkColor}
                    />
                </Flex>
            </Container>

            <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerBody>
                        <VStack as="nav" spacing={6} mt={16} align="stretch">
                            {navLinks.map(({ label, anchor }) => (
                                <Link
                                    key={label}
                                    as={NextLink}
                                    href={`/${anchor}`}
                                    onClick={(e) => scrollToSection(e, anchor)}
                                    fontSize="xl"
                                    fontWeight="bold"
                                    textAlign="center"
                                >
                                    {label}
                                </Link>
                            ))}
                            <Button
                                size="lg"
                                mt={4}
                                onClick={(e) => scrollToSection(e, '#tourvisor')}
                            >
                                Подбор тура
                            </Button>
                        </VStack>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </Box>
    );
};

export default Header;
