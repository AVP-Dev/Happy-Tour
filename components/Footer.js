// components/Footer.js
import NextLink from 'next/link';
import { Box, Container, Link, Text, Image, VStack, HStack, SimpleGrid, Divider, Flex } from '@chakra-ui/react';
import { FaTelegramPlane, FaViber, FaWhatsapp, FaInstagram } from 'react-icons/fa';

const Footer = () => {
    const socialLinks = [
        { href: "https://t.me/happytour.by", label: "Telegram", icon: FaTelegramPlane },
        { href: "viber://chat?number=+375447886761", label: "Viber", icon: FaViber },
        { href: "https://wa.me/375447886761", label: "WhatsApp", icon: FaWhatsapp },
        { href: "https://www.instagram.com/happytour.by?igsh=ZHV6b3BjODFqMjZv", label: "Instagram", icon: FaInstagram },
    ];

    // Добавлен `as="footer"` для семантической корректности.
    return (
        <Box as="footer" bg="#1a1a1a" color="white" borderTop="5px solid" borderColor="brand.500">
            <Container maxW="container.xl" py={{ base: 8, md: 10 }}>
                <VStack spacing={8}>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="100%" textAlign={{ base: 'center', md: 'left' }}>
                        {/* Copyright and Logo */}
                        <VStack spacing={4} align={{ base: 'center', md: 'flex-start' }}>
                            <Link as={NextLink} href="/" display="flex" alignItems="center" _hover={{ opacity: 0.8 }}>
                                <Image src="/img/logo.png" alt="Happy Tour Logo" h="40px" />
                                <Text as="span" fontSize="1.5rem" fontWeight="700" ml={3} color="brand.400">
                                    Happy Tour
                                </Text>
                            </Link>
                            <Text color="gray.400" fontSize="sm">
                                &copy; {new Date().getFullYear()} Happy Tour. Все права защищены.
                            </Text>
                            <Text color="gray.400" fontSize="sm">
                                ООО «ХэппиТрэвелКлаб» (УНП 491678156)
                            </Text>
                        </VStack>

                        {/* Social Links */}
                        <VStack spacing={4} justify="center">
                             <Text fontSize="lg" fontWeight="bold">Присоединяйтесь</Text>
                            <HStack spacing={5}>
                                {socialLinks.map(({ href, label, icon }) => (
                                    <Link key={label} href={href} isExternal aria-label={label} fontSize="2xl" _hover={{ color: 'brand.300', transform: 'translateY(-2px)' }}>
                                        <Box as={icon} />
                                    </Link>
                                ))}
                            </HStack>
                        </VStack>

                        {/* Legal Links */}
                        <VStack spacing={3} align={{ base: 'center', md: 'flex-end' }}>
                            <Link as={NextLink} href="/privacy" _hover={{ color: 'brand.300' }}>
                                Политика конфиденциальности
                            </Link>
                            <Link as={NextLink} href="/offer" _hover={{ color: 'brand.300' }}>
                                Публичная оферта
                            </Link>
                            <Text color="gray.500" fontSize="xs" maxW="300px" textAlign={{ base: 'center', md: 'right' }} pt={2}>
                                Информация и цены на сайте не являются публичной офертой.
                            </Text>
                        </VStack>
                    </SimpleGrid>

                    <Divider borderColor="gray.700" />

                    {/* Creator Credit - ИЗМЕНЕНО для адаптивности */}
                    <Flex
                      direction={{ base: 'column', md: 'row' }}
                      align="center"
                      justify="center"
                      color="gray.400"
                      fontSize="sm"
                    >
                      <Text>
                        Разработка сайта —{' '}
                        <Link href="https://avpdev.com" isExternal color="gray.200" _hover={{ color: 'brand.300' }}>
                          avpdev.com
                        </Link>
                      </Text>
                      <Text mx={{ base: 0, md: 2 }} display={{ base: 'none', md: 'inline' }}>
                        |
                      </Text>
                      <Text>
                        Telegram:{' '}
                        <Link href="https://t.me/avpdevcom" isExternal color="gray.200" _hover={{ color: 'brand.300' }}>
                          @avpdevcom
                        </Link>
                      </Text>
                    </Flex>
                </VStack>
            </Container>
        </Box>
    );
};

export default Footer;
