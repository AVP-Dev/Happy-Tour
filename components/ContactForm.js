// components/ContactForm.js
import { useState } from 'react';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    VStack,
    Heading,
    Text,
    useToast,
    FormErrorMessage,
} from '@chakra-ui/react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'; // Импорт хука reCAPTCHA

const ContactForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();
    const { executeRecaptcha } = useGoogleReCaptcha(); // Инициализация хука reCAPTCHA

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Очищаем ошибку при изменении поля
        if (errors[e.target.name]) {
            setErrors(prev => ({ ...prev, [e.target.name]: undefined }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Имя обязательно';
        if (!formData.email.trim()) {
            newErrors.email = 'Email обязателен';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Некорректный формат Email';
        }
        if (!formData.message.trim()) newErrors.message = 'Сообщение обязательно';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast({
                title: "Ошибка валидации",
                description: "Пожалуйста, заполните все обязательные поля.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        if (!executeRecaptcha) {
            console.error('reCAPTCHA не загружен!');
            toast({
                title: "Ошибка reCAPTCHA",
                description: "reCAPTCHA не загружена. Пожалуйста, попробуйте еще раз.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const token = await executeRecaptcha('contact_form_submit'); // Получаем токен reCAPTCHA

            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...formData, recaptchaToken: token }), // Отправляем токен с данными формы
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: 'Сообщение отправлено!',
                    description: 'Мы свяжемся с вами в ближайшее время.',
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                });
                setFormData({ name: '', email: '', message: '' });
                setErrors({}); // Очищаем ошибки после успешной отправки
            } else {
                toast({
                    title: 'Ошибка отправки.',
                    description: data.message || 'Что-то пошло не так. Попробуйте еще раз.',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error('Ошибка отправки формы:', error);
            toast({
                title: 'Ошибка отправки.',
                description: 'Не удалось отправить сообщение. Пожалуйста, попробуйте позже.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box
            as="form"
            onSubmit={handleSubmit}
            p={8}
            borderRadius="lg"
            boxShadow="xl"
            bg="white"
            maxW="lg"
            mx="auto"
            my={10}
        >
            <VStack spacing={6}>
                <Heading as="h3" size="lg" textAlign="center" color="brand.500">
                    Свяжитесь с нами
                </Heading>
                <Text textAlign="center" color="gray.600">
                    Есть вопросы? Отправьте нам сообщение, и мы с радостью ответим.
                </Text>

                <FormControl id="name" isRequired isInvalid={!!errors.name}>
                    <FormLabel>Ваше имя</FormLabel>
                    <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Введите ваше имя"
                        focusBorderColor="brand.500"
                        borderRadius="md"
                    />
                    <FormErrorMessage>{errors.name}</FormErrorMessage>
                </FormControl>

                <FormControl id="email" isRequired isInvalid={!!errors.email}>
                    <FormLabel>Ваш Email</FormLabel>
                    <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Введите ваш Email"
                        focusBorderColor="brand.500"
                        borderRadius="md"
                    />
                    <FormErrorMessage>{errors.email}</FormErrorMessage>
                </FormControl>

                <FormControl id="message" isRequired isInvalid={!!errors.message}>
                    <FormLabel>Ваше сообщение</FormLabel>
                    <Textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Напишите ваше сообщение здесь..."
                        size="sm"
                        rows={6}
                        focusBorderColor="brand.500"
                        borderRadius="md"
                    />
                    <FormErrorMessage>{errors.message}</FormErrorMessage>
                </FormControl>

                <Button
                    type="submit"
                    colorScheme="brand"
                    size="lg"
                    width="full"
                    mt={4}
                    isLoading={isSubmitting}
                    loadingText="Отправка..."
                    borderRadius="md"
                >
                    Отправить сообщение
                </Button>
            </VStack>
        </Box>
    );
};

export default ContactForm;
