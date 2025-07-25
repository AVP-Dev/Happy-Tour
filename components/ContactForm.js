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
    Checkbox,
    Link as ChakraLink,
} from '@chakra-ui/react';
import NextLink from 'next/link';

export default function ContactForm({ onFormSubmit, onClose, tour }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const initialMessage = tour ? `Здравствуйте, меня интересует тур "${tour.title}". Расскажите, пожалуйста, подробнее.` : '';
    
    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        message: initialMessage
    });
    const [privacyChecked, setPrivacyChecked] = useState(false);
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

    const handleCheckboxChange = (e) => {
        setPrivacyChecked(e.target.checked);
        if (errors.privacyPolicy) {
            setErrors(prev => ({ ...prev, privacyPolicy: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Пожалуйста, представьтесь.';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Имя должно содержать минимум 2 символа.';
        }

        // Simplified Contact validation (Phone or Email)
        // This regex checks for either a valid-looking phone number (allows +, digits, spaces, (), -) OR a valid email.
        const contactPattern = /(^(\+?[\d\s()-]{9,15})$)|(^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$)/;
        if (!formData.contact.trim()) {
            newErrors.contact = 'Укажите способ для связи.';
        } else if (!contactPattern.test(formData.contact.trim())) {
            newErrors.contact = 'Введите корректный номер телефона или Email.';
        }

        // Message validation
        if (!formData.message.trim()) {
            newErrors.message = 'Напишите, пожалуйста, ваше сообщение.';
        } else if (formData.message.trim().length < 10) {
            newErrors.message = 'Сообщение должно быть не менее 10 символов.';
        }
        
        // Privacy policy validation
        if (!privacyChecked) {
            newErrors.privacyPolicy = 'Вы должны согласиться с политикой конфиденциальности.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        if (!executeRecaptcha) {
            onFormSubmit?.({ type: 'error', message: 'Ошибка проверки reCAPTCHA. Попробуйте обновить страницу.' });
            return;
        }

        setIsSubmitting(true);
        
        try {
            const recaptchaToken = await executeRecaptcha('contact_form');
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, recaptchaToken, privacyPolicy: privacyChecked })
            });
            const data = await res.json();
            if (res.ok) {
                onFormSubmit?.({ type: 'success', message: data.message || 'Ваше сообщение успешно отправлено!' });
                setFormData({ name: '', contact: '', message: initialMessage });
                setPrivacyChecked(false);
                onClose?.();
            } else {
                onFormSubmit?.({ type: 'error', message: data.message || 'Произошла ошибка.' });
            }
        } catch (error) {
            onFormSubmit?.({ type: 'error', message: 'Не удалось связаться с сервером.' });
        } finally {
            setIsSubmitting(false);
        }
    }, [executeRecaptcha, formData, privacyChecked, onFormSubmit, onClose, initialMessage]);

    return (
        <Box as="form" onSubmit={handleSubmit} noValidate>
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
                    <Input name="name" value={formData.name} onChange={handleChange} placeholder="Как к вам обращаться?" />
                    <FormErrorMessage>{errors.name}</FormErrorMessage>
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.contact}>
                    <FormLabel>Телефон или Email</FormLabel>
                    <Input name="contact" value={formData.contact} onChange={handleChange} placeholder="Номер телефона или email@..." />
                    <FormErrorMessage>{errors.contact}</FormErrorMessage>
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.message}>
                    <FormLabel>Сообщение</FormLabel>
                    <Textarea name="message" value={formData.message} onChange={handleChange} rows={4} placeholder="Опишите ваш вопрос или пожелания" />
                    <FormErrorMessage>{errors.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.privacyPolicy}>
                    <Flex align="start">
                        <Checkbox
                            id="privacyPolicy"
                            isChecked={privacyChecked}
                            onChange={handleCheckboxChange}
                            mt={1}
                            colorScheme="brand"
                        />
                        <FormLabel htmlFor="privacyPolicy" mb="0" ml={2} cursor="pointer" flex="1" fontWeight="normal">
                             <Text fontSize="sm">
                                Я согласен с{' '}
                                <NextLink href="/privacy" passHref legacyBehavior>
                                    <ChakraLink color="brand.500" isExternal>
                                        политикой конфиденциальности
                                    </ChakraLink>
                                </NextLink>
                                {' '}и даю согласие на обработку моих персональных данных.
                            </Text>
                        </FormLabel>
                    </Flex>
                    <FormErrorMessage mt={2}>{errors.privacyPolicy}</FormErrorMessage>
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
