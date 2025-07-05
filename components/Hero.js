// components/Hero.js
import { Box, Button, Container, Flex, Heading, Text, VStack } from '@chakra-ui/react';
import Image from 'next/image';

const Hero = ({ onSearchClick }) => {
    return (
        <Box as="section" id="home" position="relative" minHeight="100vh" color="white">
            {/* ИЗМЕНЕНИЕ: Используем next/image для фонового изображения */}
            <Image
                src="/img/hero-background.webp"
                alt="Красивый пляж с пальмами на закате"
                layout="fill"
                objectFit="cover"
                objectPosition="center"
                quality={90}
                priority // Загружаем это изображение в первую очередь, так как оно на первом экране
            />
            
            {/* Оверлей для затемнения */}
            <Box
                position="absolute"
                top={0} left={0} right={0} bottom={0}
                bg="rgba(0, 0, 0, 0.55)"
                zIndex={1}
            />

            <Flex
                align="center"
                justify="center"
                minHeight="100vh"
                position="relative"
                textAlign="center"
                zIndex={2} // Контент должен быть над оверлеем
            >
                <Container maxW="container.md">
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
                            colorScheme="brand"
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
