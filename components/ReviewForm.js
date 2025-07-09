// components/ReviewForm.js
import React, { useState, useCallback } from 'react';
// ИЗМЕНЕНИЕ: Удаляем импорт useGoogleReCaptcha
// import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import Script from 'next/script'; // Импортируем Script для динамической загрузки reCAPTCHA
import { FaStar } from 'react-icons/fa';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    FormErrorMessage,
    Input,
    Textarea,
    VStack,
    HStack,
    Icon,
    IconButton,
    useToast, // Добавляем useToast для уведомлений
} from '@chakra-ui/react';

const StarRating = ({ rating, setRating }) => {
    const [hover, setHover] = useState(null);
    return (
        <HStack spacing={1}>
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                    <IconButton
                        key={ratingValue}
                        aria-label={`Оценка ${ratingValue}`}
                        variant="ghost"
                        color={ratingValue <= (hover || rating) ? "yellow.400" : "gray.300"}
                        icon={<Icon as={FaStar} boxSize={8} />}
                        onClick={() => setRating(ratingValue)}
                        onMouseEnter={() => setHover(ratingValue)}
                        onMouseLeave={() => setHover(null)}
                    />
                );
            })}
        </HStack>
    );
};

export default function ReviewForm({ onClose, onReviewSubmitted }) {
    const [formData, setFormData] = useState({ author: '', text: '' });
    const [rating, setRating] = useState(5);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    // ИЗМЕНЕНИЕ: Удаляем executeRecaptcha, будем использовать grecaptcha напрямую
    // const { executeRecaptcha } = useGoogleReCaptcha();
    const toast = useToast(); // Инициализируем useToast

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.author.trim()) newErrors.author = 'Пожалуйста, представьтесь.';
        if (!formData.text.trim()) newErrors.text = 'Пожалуйста, напишите пару слов о поездке.';
        else if (formData.text.trim().length < 10) newErrors.text = 'Отзыв должен содержать не менее 10 символов.';
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
                    recaptchaToken = await grecaptcha.execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY, { action: 'review_form' });
                });
            } else {
                toast({
                    title: "Ошибка reCAPTCHA",
                    description: "reCAPTCHA не загружена. Пожалуйста, попробуйте обновить страницу.",
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
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, rating, recaptchaToken }),
            });
            const data = await response.json();

            if (response.ok) {
                onReviewSubmitted?.({ type: 'success', message: data.message || 'Спасибо за ваш отзыв!' });
                onClose?.();
            } else {
                throw new Error(data.message || 'Произошла неизвестная ошибка.');
            }
        } catch (error) {
            onReviewSubmitted?.({ type: 'error', message: error.message });
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, rating, onReviewSubmitted, onClose, toast]);

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
                <FormControl>
                    <FormLabel textAlign="center" width="100%">Ваша оценка</FormLabel>
                    <HStack justify="center" width="100%">
                       <StarRating rating={rating} setRating={setRating} />
                    </HStack>
                </FormControl>
                
                <FormControl isRequired isInvalid={!!errors.author}>
                    <FormLabel>Ваше имя</FormLabel>
                    <Input name="author" value={formData.author} onChange={handleChange} />
                    <FormErrorMessage>{errors.author}</FormErrorMessage>
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.text}>
                    <FormLabel>Ваш отзыв</FormLabel>
                    <Textarea name="text" value={formData.text} onChange={handleChange} rows={5} />
                    <FormErrorMessage>{errors.text}</FormErrorMessage>
                </FormControl>

                <Button
                    type="submit"
                    colorScheme="brand"
                    isLoading={isSubmitting}
                    loadingText="Публикация..."
                    width="100%"
                    size="lg"
                >
                    Опубликовать отзыв
                </Button>
            </VStack>
        </Box>
    );
}
