// pages/admin/login.js
import React, { useState } from 'react';
import {
    Box,
    Heading,
    FormControl,
    FormLabel,
    Input,
    Button,
    VStack,
    useToast,
    Flex,
    Image,
    InputGroup,
    InputRightElement,
    IconButton, // ИСПРАВЛЕНО: Добавлен импорт IconButton
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';

const AdminLoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const toast = useToast();
    const router = useRouter();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);

        try {
            const result = await signIn('credentials', {
                redirect: false,
                email,
                password,
            });

            if (result.error) {
                toast({
                    title: 'Ошибка входа.',
                    description: "Неверный email или пароль.",
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                    position: 'top',
                });
            } else {
                router.push('/admin');
            }
        } catch (error) {
            toast({
                title: 'Произошла непредвиденная ошибка.',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'top',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Flex
            minH="100vh"
            align="center"
            justify="center"
            bg="gray.100"
        >
            <VStack spacing={8} mx="auto" w={{ base: '90%', md: '400px' }}>
                <Image src="/img/logo.png" alt="Happy Tour Logo" boxSize="100px" />
                <Box
                    bg="white"
                    p={8}
                    borderRadius="xl"
                    shadow="lg"
                    width="full"
                >
                    <Heading as="h1" size="lg" mb={6} textAlign="center">
                        Вход в панель
                    </Heading>
                    <form onSubmit={handleSubmit}>
                        <VStack spacing={4}>
                            <FormControl id="email" isRequired>
                                <FormLabel>Email</FormLabel>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@example.com"
                                />
                            </FormControl>
                            <FormControl id="password" isRequired>
                                <FormLabel>Пароль</FormLabel>
                                <InputGroup>
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Ваш пароль"
                                    />
                                    <InputRightElement>
                                        <IconButton
                                            aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                                            variant="ghost"
                                            icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                                            onClick={() => setShowPassword(!showPassword)}
                                        />
                                    </InputRightElement>
                                </InputGroup>
                            </FormControl>
                            <Button
                                type="submit"
                                colorScheme="brand"
                                size="lg"
                                width="full"
                                isLoading={isLoading}
                                mt={4}
                            >
                                Войти
                            </Button>
                        </VStack>
                    </form>
                </Box>
            </VStack>
        </Flex>
    );
};

export default AdminLoginPage;
