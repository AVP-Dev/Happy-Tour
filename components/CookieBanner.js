// components/CookieBanner.js
import { useState, useEffect } from 'react';
import NextLink from 'next/link';
import { Box, Text, Button, Link, Flex, Collapse } from '@chakra-ui/react';

const CookieBanner = () => {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        if (localStorage.getItem('cookie_consent') !== 'true') {
            setShowBanner(true);
        }
    }, []);

    const handleAccept = () => {
        setShowBanner(false);
        setTimeout(() => {
            localStorage.setItem('cookie_consent', 'true');
        }, 300);
    };

    return (
        <Box position="fixed" bottom="0" left="0" width="100%" zIndex="banner">
            <Collapse in={showBanner} animateOpacity>
                <Flex
                    bg="rgba(33, 33, 33, 0.95)"
                    color="white"
                    p={4}
                    align="center"
                    justify="space-between"
                    wrap="wrap"
                    gap={4}
                    backdropFilter="blur(5px)"
                >
                    <Text fontSize="sm" flexGrow={1} textAlign={{ base: 'center', md: 'left' }}>
                        Мы используем файлы cookie, чтобы улучшить ваш опыт. Продолжая посещать этот сайт, вы соглашаетесь на использование наших cookie.
                        Подробнее в{' '}
                        <Link as={NextLink} href="/privacy" color="brand.300" textDecoration="underline">
                            политике конфиденциальности
                        </Link>
                        .
                    </Text>
                    <Button
                        colorScheme="brand"
                        onClick={handleAccept}
                        size="sm"
                        flexShrink={0}
                        alignSelf="center"
                    >
                        Принять
                    </Button>
                </Flex>
            </Collapse>
        </Box>
    );
};

export default CookieBanner;
