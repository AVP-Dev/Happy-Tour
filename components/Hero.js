// components/Hero.js
import { Box, Button, Container, Flex, Heading, Text, VStack } from '@chakra-ui/react';

const Hero = ({ onSearchClick }) => {
    return (
        // ИЗМЕНЕНИЕ: Добавлен className="Hero" к корневому Box
        <Box as="section" id="home" className="Hero" position="relative">
            <Flex
                align="center"
                justify="center"
                // Высота установлена в 100vh для полного заполнения экрана
                minHeight="100vh"
                position="relative"
                textAlign="center"
                color="white"
                bgImage="url('/img/hero-background.webp')"
                bgSize="cover"
                bgPosition="center"
                // ИЗМЕНЕНИЕ: Удалено bgAttachment="fixed" для лучшей совместимости с мобильными устройствами
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
        </Box>
    );
};

export default Hero;
