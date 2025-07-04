// components/Hero.js
import { Box, Button, Container, Flex, Heading, Text, VStack } from '@chakra-ui/react';

const Hero = ({ onSearchClick }) => {
    return (
        <Box as="section" id="home" position="relative" bg="#f7fafc">
            <Flex
                align="center"
                justify="center"
                minHeight="95vh"
                position="relative"
                textAlign="center"
                color="white"
                bgImage="url('/img/hero-background.webp')"
                bgSize="cover"
                bgPosition="center"
                bgAttachment="fixed"
                _after={{
                    content: '""',
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    bg: 'rgba(0, 0, 0, 0.55)',
                }}
            >
                <Container maxW="container.md" position="relative" zIndex={1}>
                    <VStack spacing={6}>
                        <Heading
                            as="h1"
                            fontSize={{ base: '3xl', md: '5xl' }}
                            fontWeight="bold"
                            textShadow="0 2px 4px rgba(0, 0, 0, 0.5)"
                            lineHeight="1.2"
                        >
                            Мир путешествий начинается здесь
                        </Heading>
                        <Text
                            fontSize={{ base: 'lg', md: 'xl' }}
                            maxW="xl"
                            textShadow="0 1px 3px rgba(0, 0, 0, 0.5)"
                        >
                            Подбираем идеальные туры по всему миру. Ваше путешествие мечты ждет!
                        </Text>
                        <Button
                            onClick={onSearchClick}
                            size="lg"
                            height="56px"
                            px={8}
                            fontSize="lg"
                        >
                            Подобрать тур
                        </Button>
                    </VStack>
                </Container>
            </Flex>
            {/* Добавлен фигурный разделитель для плавного перехода */}
            <Box
                position="absolute"
                bottom="-1px" // Небольшое смещение для идеального прилегания
                left={0}
                width="100%"
                overflow="hidden"
                lineHeight={0}
                transform="rotate(180deg)"
            >
                <svg
                    data-name="Layer 1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1200 120"
                    preserveAspectRatio="none"
                    style={{ display: 'block', width: 'calc(100% + 1.3px)', height: '80px' }}
                >
                    <path
                        d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                        style={{ fill: '#f7fafc' }} // Цвет фона следующей секции (gray.50)
                    ></path>
                </svg>
            </Box>
        </Box>
    );
};

export default Hero;
