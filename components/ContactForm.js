// components/ContactForm.js
import { useState, useEffect, useCallback } from 'react';
// ИЗМЕНЕНИЕ: Удаляем импорт useGoogleReCaptcha
// import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import Script from 'next/script'; // Импортируем Script для динамической загрузки reCAPTCHA
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    FormErrorMessage,
    Input,
    Textarea,
    VStack,
    Flex,
    Text,
    Heading,
    Image,
    useToast, // Добавляем useToast для уведомлений
} from '@chakra-ui/react';

export default function ContactForm({ onFormSubmit, onClose, tour }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const initialMessage = tour ? `Здравствуйте, меня интересует тур "${tour.title}". Расскажите, пожалуйста, подробнее.` : '';
    
    const [formData, setFormData] = useState({
        name: '',
        contact: '', // Единое поле для контакта
        message: initialMessage
    });
    const [errors, setErrors] = useState({});
    const toast = useToast(); // Инициализируем useToast

    // ИЗМЕНЕНИЕ: Удаляем executeRecaptcha, будем использовать grecaptcha напрямую
    // const { executeRecaptcha } = useGoogleReCaptcha();

    useEffect(() => {
        const newMessage = tour ? `Здравствуйте, меня интересует тур "${tour.title}". Расскажите, пожалуйста, подробнее.` : '';
        setFormData(prev => ({ ...prev, message: newMessage }));
    }, [tour]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = 'Пожалуйста, представьтесь.';
        }
        if (!formData.contact.trim()) {
            newErrors.contact = 'Укажите способ для связи.';
        }
        if (!formData.message.trim()) {
            newErrors.message = 'Напишите, пожалуйста, ваше сообщение.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);

        let recaptchaToken = '';
        try {
            // ИЗМЕНЕНИЕ: Мануальный вызов reCAPTCHA
            if (typeof grecaptcha !== 'undefined' && grecaptcha.ready) {
                await grecaptcha.ready(async function() {
                    recaptchaToken = await grecaptcha.execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY, { action: 'contact_form' });
                });
            } else {
                toast({
                    title: "Ошибка reCAPTCHA",
                    description: "reCAPTCHA не загружена. Пожалуйста, попробуйте позже.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                setIsSubmitting(false);
                return;
            }
        } catch (recaptchaError) {
            console.error("Ошибка при получении токена reCAPTCHA:", recaptchaError);
            toast({
                title: "Ошибка reCAPTCHA",
                description: "Не удалось получить токен reCAPTCHA. Пожалуйста, попробуйте снова.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            setIsSubmitting(false);
            return;
        }

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, recaptchaToken })
            });
            const data = await res.json();
            if (res.ok) {
                onFormSubmit?.({ type: 'success', message: data.message || 'Ваше сообщение успешно отправлено!' });
                onClose?.();
            } else {
                onFormSubmit?.({ type: 'error', message: data.message || 'Произошла ошибка.' });
            }
        } catch (error) {
            onFormSubmit?.({ type: 'error', message: 'Не удалось связаться с сервером.' });
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, onFormSubmit, onClose, toast]);

    return (
        <Box as="form" onSubmit={handleSubmit} noValidate>
            {/* ИЗМЕНЕНИЕ: Добавляем динамическую загрузку скрипта reCAPTCHA */}
            <Script
                src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
                strategy="afterInteractive"
                async
                defer
            />

            <VStack spacing={4}>
                {tour && (
                    <Flex align="center" w="100%" p={3} bg="gray.50" borderRadius="md">
                        <Image
                            src={tour.image_url || `https://placehold.co/100x100/48BB78/FFFFFF?text=Tour`}
                            alt={tour.title}
                            boxSize="60px"
                            borderRadius="md"
                            objectFit="cover"
                        />
                        <Box ml={3}>
                            <Heading as="h4" size="sm" noOfLines={2}>{tour.title}</Heading>
                            <Text fontWeight="bold" color="brand.600" fontSize="md">
                                от {tour.price?.toFixed(0)} {tour.currency}
                            </Text>
                        </Box>
                    </Flex>
                )}

                <FormControl isRequired isInvalid={!!errors.name}>
                    <FormLabel>Ваше имя</FormLabel>
                    <Input name="name" value={formData.name} onChange={handleChange} />
                    <FormErrorMessage>{errors.name}</FormErrorMessage>
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.contact}>
                    <FormLabel>Контакт (Telegram, Viber, Email или Телефон)</FormLabel>
                    <Input name="contact" value={formData.contact} onChange={handleChange} placeholder="@username, +375..., email@..." />
                    <FormErrorMessage>{errors.contact}</FormErrorMessage>
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.message}>
                    <FormLabel>Описание</FormLabel>
                    <Textarea name="message" value={formData.message} onChange={handleChange} rows={4} />
                    <FormErrorMessage>{errors.message}</FormErrorMessage>
                </FormControl>

                <Button
                    type="submit"
                    colorScheme="brand"
                    isLoading={isSubmitting}
                    loadingText="Отправка..."
                    width="100%"
                    size="lg"
                    mt={2}
                >
                    Отправить заявку
                </Button>
            </VStack>
        </Box>
    );
}
