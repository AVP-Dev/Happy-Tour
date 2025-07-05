// components/ContactForm.js
import { useState, useEffect, useCallback } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
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
} from '@chakra-ui/react';
import NextImage from 'next/image'; // ИСПОЛЬЗУЕМ next/image для оптимизации

export default function ContactForm({ onFormSubmit, onClose, tour }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const initialMessage = tour ? `Здравствуйте, меня интересует тур "${tour.title}". Расскажите, пожалуйста, подробнее.` : '';
    
    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        message: initialMessage
    });
    const [errors, setErrors] = useState({});

    const { executeRecaptcha } = useGoogleReCaptcha();

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

    const validateForm = useCallback(() => {
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
    }, [formData]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!validateForm() || !executeRecaptcha) return;

        setIsSubmitting(true);
        const recaptchaToken = await executeRecaptcha('contact_form');

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, recaptchaToken, tourTitle: tour?.title })
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
    }, [executeRecaptcha, formData, onFormSubmit, onClose, validateForm, tour]);
    
    // ИСПРАВЛЕНИЕ: Преобразуем цену в число перед использованием .toFixed()
    const priceAsNumber = tour ? Number(tour.price) : 0;

    return (
        <Box as="form" onSubmit={handleSubmit} noValidate>
            <VStack spacing={4}>
                {tour && (
                    <Flex align="center" w="100%" p={3} bg="gray.50" borderRadius="md">
                        <Box boxSize="60px" position="relative" borderRadius="md" overflow="hidden">
                            <NextImage
                                src={tour.image_url || `https://placehold.co/100x100/38B2AC/E6FFFA?text=Tour`}
                                alt={tour.title}
                                layout="fill"
                                objectFit="cover"
                            />
                        </Box>
                        <Box ml={4}>
                            <Heading as="h4" size="sm" noOfLines={2}>{tour.title}</Heading>
                            <Text fontWeight="bold" color="brand.600" fontSize="md">
                                {/* Используем числовую переменную для форматирования */}
                                от {!isNaN(priceAsNumber) ? priceAsNumber.toFixed(0) : tour.price} {tour.currency}
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
                    <FormLabel>Ваше сообщение</FormLabel>
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
