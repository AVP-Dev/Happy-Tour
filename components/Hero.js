// components/Hero.js
import { Box, Button, Container, Flex, Heading, Text, VStack } from '@chakra-ui/react';

const Hero = ({ onSearchClick }) => {
    return (
        <Box as="section" id="home" position="relative">
            <Flex
                align="center"
                justify="center"
                minHeight="100vh" // Изменено с 95vh на 100vh
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
            {/* Волна-разделитель удалена */}
        </Box>
    );
};

export default Hero;
