// components/ReviewForm.js
import React, { useState } from 'react';
import {
    FormControl, FormLabel, Input, Textarea, Button, Box, Flex,
    useToast, FormErrorMessage, Text, Select, VStack, HStack // Добавлен HStack
} from '@chakra-ui/react';
import { GoogleReCaptcha, useGoogleReCaptcha } from 'react-google-recaptcha-v3'; // Убедимся, что импорт useGoogleReCaptcha есть
import { StarIcon } from '@chakra-ui/icons';

const ReviewForm = ({ onClose, onReviewSubmitted }) => {
    const toast = useToast();
    const [author, setAuthor] = useState('');
    const [rating, setRating] = useState(0);
    const [text, setText] = useState('');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { executeRecaptcha } = useGoogleReCaptcha(); // Используем хук из глобального провайдера

    const validate = () => {
        const newErrors = {};
        if (!author) newErrors.author = 'Имя обязательно';
        if (!text) newErrors.text = 'Текст отзыва обязателен';
        if (rating === 0) newErrors.rating = 'Поставьте оценку';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);

        if (!executeRecaptcha) {
            console.log('Execute recaptcha not yet available');
            toast({
                title: 'Ошибка.',
                description: 'ReCAPTCHA не загружена. Пожалуйста, попробуйте еще раз.',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'top-right',
            });
            setIsSubmitting(false);
            return;
        }

        try {
            const token = await executeRecaptcha('submit_review');
            if (!token) {
                throw new Error('ReCAPTCHA верификация не удалась.');
            }

            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Recaptcha-Token': token, // Отправляем токен на сервер
                },
                body: JSON.stringify({ author, rating, text }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка при отправке отзыва.');
            }

            onReviewSubmitted({ type: 'success', message: 'Ваш отзыв успешно отправлен и будет опубликован после модерации!' });
            setAuthor('');
            setRating(0);
            setText('');
            onClose();
        } catch (error) {
            console.error('Ошибка отправки отзыва:', error);
            onReviewSubmitted({ type: 'error', message: error.message || 'Не удалось отправить отзыв. Пожалуйста, попробуйте еще раз.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box as="form" onSubmit={handleSubmit}>
            <VStack spacing={4}>
                <FormControl id="author" isRequired isInvalid={errors.author}>
                    <FormLabel>Ваше имя</FormLabel>
                    <Input value={author} onChange={(e) => setAuthor(e.target.value)} />
                    <FormErrorMessage>{errors.author}</FormErrorMessage>
                </FormControl>

                <FormControl id="rating" isRequired isInvalid={errors.rating}>
                    <FormLabel>Оценка</FormLabel>
                    <HStack spacing={1}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <StarIcon
                                key={star}
                                cursor="pointer"
                                color={star <= rating ? 'yellow.400' : 'gray.300'}
                                onClick={() => setRating(star)}
                                boxSize={6}
                            />
                        ))}
                    </HStack>
                    <FormErrorMessage>{errors.rating}</FormErrorMessage>
                </FormControl>

                <FormControl id="reviewText" isRequired isInvalid={errors.text}>
                    <FormLabel>Ваш отзыв</FormLabel>
                    <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Поделитесь своими впечатлениями..." />
                    <FormErrorMessage>{errors.text}</FormErrorMessage>
                </FormControl>

                {/* Компонент GoogleReCaptcha нужен для инициализации скрипта и получения токена */}
                {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
                    <GoogleReCaptcha onVerify={() => {}} />
                )}

                <Button type="submit" colorScheme="blue" size="lg" isLoading={isSubmitting} loadingText="Отправка" mt={6} w="full">
                    Оставить отзыв
                </Button>
            </VStack>
        </Box>
    );
};

export default ReviewForm;
