// Happy-Tour-main/pages/admin/login.js
// Страница входа в административную панель.
// Этот компонент обрабатывает аутентификацию пользователей с помощью NextAuth.
// Использует компоненты Chakra UI для построения интерфейса формы входа,
// обеспечивая современный и адаптивный дизайн.

import React, { useState } from 'react';
import {
    Box,        // Базовый компонент-контейнер
    Heading,    // Компонент для заголовков (h1, h2, etc.)
    FormControl,// Контейнер для поля формы и его метки
    FormLabel,  // Метка для поля формы
    Input,      // Поле текстового ввода
    Button,     // Кнопка
    Text,       // Компонент для отображения текста
    VStack,     // Вертикальный стек для расположения элементов с отступами
    useToast,   // Хук Chakra UI для отображения уведомлений (тостов)
    Flex        // Flex-контейнер для центрирования содержимого
} from '@chakra-ui/react';
import { signIn } from 'next-auth/react'; // Функция 'signIn' из NextAuth для инициирования процесса аутентификации
import { useRouter } from 'next/router'; // Хук 'useRouter' из Next.js для программной навигации между маршрутами

const AdminLoginPage = () => {
    const [email, setEmail] = useState('');     // Состояние для хранения введенного email
    const [password, setPassword] = useState(''); // Состояние для хранения введенного пароля
    const [isLoading, setIsLoading] = useState(false); // Состояние для управления индикатором загрузки на кнопке
    const toast = useToast(); // Инициализация хука useToast для отображения всплывающих уведомлений
    const router = useRouter(); // Инициализация роутера Next.js для перенаправления

    // Обработчик отправки формы входа.
    const handleSubmit = async (event) => {
        event.preventDefault(); // Предотвращаем стандартное поведение формы (перезагрузку страницы).
        setIsLoading(true); // Устанавливаем состояние загрузки кнопки в 'true'.

        try {
            // Вызываем функцию 'signIn' из NextAuth с провайдером 'credentials'.
            // 'redirect: false' указывает NextAuth не перенаправлять автоматически после входа,
            // чтобы мы могли управлять перенаправлением вручную после обработки ответа.
            const result = await signIn('credentials', {
                redirect: false,
                email,
                password,
            });

            if (result.error) {
                // Если произошла ошибка аутентификации (например, неверный email или пароль),
                // отображаем уведомление об ошибке с описанием от NextAuth.
                toast({
                    title: 'Ошибка входа.',
                    description: result.error, // Описание ошибки, предоставленное NextAuth.
                    status: 'error',
                    duration: 5000, // Уведомление исчезнет через 5 секунд.
                    isClosable: true, // Позволяет пользователю закрыть уведомление вручную.
                });
            } else {
                // Если вход успешен (ошибки нет), отображаем уведомление об успехе
                // и перенаправляем пользователя на дашборд администратора.
                toast({
                    title: 'Вход успешен!',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
                router.push('/admin'); // Программно перенаправляем пользователя на '/admin'.
            }
        } catch (error) {
            // Обработка любых непредвиденных ошибок, которые могут возникнуть во время запроса к API.
            console.error('Ошибка при входе:', error);
            toast({
                title: 'Произошла непредвиденная ошибка.',
                description: error.message || 'Пожалуйста, попробуйте снова.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false); // Всегда выключаем состояние загрузки кнопки после завершения операции (успеха или ошибки).
        }
    };

    return (
        <Flex
            minH="100vh" // Занимает всю высоту viewport, чтобы форма центрировалась по вертикали.
            align="center" // Выравнивает содержимое по центру по вертикали.
            justify="center" // Выравнивает содержимое по центру по горизонтали.
            bg="gray.100" // Светло-серый фон для всей страницы входа.
            p={4} // Внутренний отступ вокруг формы.
        >
            <Box
                bg="white" // Белый фон для контейнера формы.
                p={8} // Внутренний отступ внутри контейнера.
                borderRadius="lg" // Скругленные углы контейнера.
                shadow="lg" // Большая тень для визуального выделения формы.
                maxW="md" // Максимальная ширина контейнера формы для контроля размера на больших экранах.
                width="full" // Занимает всю доступную ширину на мобильных устройствах.
                textAlign="center" // Выравнивание текста по центру внутри контейнера.
            >
                <Heading as="h2" size="xl" mb={6} color="green.500"> {/* Изменено на green.500 */}
                    Вход в админ-панель
                </Heading>
                <form onSubmit={handleSubmit}>
                    <VStack spacing={4}> {/* Вертикальный стек для полей формы с равномерными отступами. */}
                        <FormControl id="email">
                            <FormLabel>Email</FormLabel>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@example.com"
                                required // Поле обязательно для заполнения
                            />
                        </FormControl>
                        <FormControl id="password">
                            <FormLabel>Пароль</FormLabel>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Ваш пароль"
                                required // Поле обязательно для заполнения
                            />
                        </FormControl>
                        <Button
                            type="submit"
                            colorScheme="green" // Изменено на green
                            size="lg" // Большая кнопка.
                            width="full" // Кнопка занимает всю доступную ширину.
                            isLoading={isLoading} // Кнопка блокируется и показывает спиннер, когда 'isLoading' истинно.
                            mt={4} // Отступ сверху.
                        >
                            Войти
                        </Button>
                    </VStack>
                </form>
                <Text mt={4} fontSize="sm" color="gray.600">
                    {/* Опциональное сообщение для разработчиков: как создать первого админа. */}
                    {/* Этот API-маршрут следует использовать только для первоначальной настройки в режиме разработки */}
                    {/* и удалить/защитить перед развертыванием в продакшене. */}
                    Для первоначальной настройки администратора, используйте API-маршрут `/api/setup-first-admin` (только в режиме разработки).
                </Text>
            </Box>
        </Flex>
    );
};

export default AdminLoginPage;
