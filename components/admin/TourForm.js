// components/admin/TourForm.js
import React, { useState, useEffect, useRef } from 'react';
import {
    FormControl, FormLabel, Input, Textarea, Button, VStack,
    Box, Select, NumberInput, NumberInputField, useToast, Image,
    InputGroup, FormErrorMessage, Text, Checkbox,
} from '@chakra-ui/react';
import { FaUpload } from 'react-icons/fa';

const TourForm = ({ initialData = {}, onSubmit, isSubmitting, onCancel }) => {
    const isEditing = !!initialData?.id;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: 0,
        currency: 'BYN',
        category: 'hot',
        published: isEditing ? initialData.published : true,
    });
    const [image, setImage] = useState({
        file: null,
        previewUrl: null,
        existingUrl: null,
    });
    const [errors, setErrors] = useState({});
    const fileInputRef = useRef(null);
    const toast = useToast();

    useEffect(() => {
        if (isEditing) {
            setFormData({
                id: initialData.id,
                title: initialData.title || '',
                description: initialData.description || '',
                price: initialData.price || 0,
                currency: initialData.currency || 'BYN',
                category: initialData.category || 'hot',
                published: initialData.published || false,
            });
            if (initialData.image_url) {
                setImage(prev => ({
                    ...prev,
                    existingUrl: initialData.image_url,
                    previewUrl: initialData.image_url,
                }));
            }
        } else {
             setFormData({
                title: '',
                description: '',
                price: 0,
                currency: 'BYN',
                category: 'hot',
                published: true,
            });
            setImage({ file: null, previewUrl: null, existingUrl: null });
        }
    }, [initialData, isEditing]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast({ title: "Файл слишком большой", description: "Максимальный размер файла 5MB.", status: "error" });
                return;
            }
            setImage(prev => ({
                ...prev,
                file: file,
                previewUrl: URL.createObjectURL(file),
            }));
            if (errors.image) setErrors(prev => ({ ...prev, image: null }));
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = type === 'checkbox' ? checked : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = "Название обязательно";
        if (!formData.price || formData.price <= 0) newErrors.price = "Цена должна быть больше нуля";
        if (!image.existingUrl && !image.file) {
            newErrors.image = "Изображение обязательно";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        let finalImageUrl = image.existingUrl;

        if (image.file) {
            const fileFormData = new FormData();
            fileFormData.append('file', image.file);
            
            try {
                const uploadRes = await fetch('/api/upload', { method: 'POST', body: fileFormData });
                const uploadData = await uploadRes.json();
                if (!uploadRes.ok) throw new Error(uploadData.error || 'Ошибка загрузки файла');
                finalImageUrl = uploadData.url;
            } catch (error) {
                toast({ title: "Ошибка загрузки изображения", description: error.message, status: "error" });
                return;
            }
        }
        
        const finalData = { ...formData, image_url: finalImageUrl };
        onSubmit(finalData);
    };

    return (
        <Box as="form" onSubmit={handleFormSubmit}>
            <VStack spacing={4}>
                <FormControl isInvalid={!!errors.title} isRequired>
                    <FormLabel>Название тура</FormLabel>
                    <Input name="title" value={formData.title} onChange={handleChange} />
                    <FormErrorMessage>{errors.title}</FormErrorMessage>
                </FormControl>

                <FormControl>
                    <FormLabel>Описание</FormLabel>
                    <Textarea name="description" value={formData.description} onChange={handleChange} />
                </FormControl>
                
                <FormControl isInvalid={!!errors.image}>
                    <FormLabel>Изображение *</FormLabel>
                    <InputGroup>
                        <Button leftIcon={<FaUpload />} onClick={() => fileInputRef.current.click()}>
                            {image.file ? 'Изменить' : 'Выбрать файл'}
                        </Button>
                        <Input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png, image/jpeg, image/webp"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                    </InputGroup>
                    {image.previewUrl && (
                        <Box mt={3} p={2} borderWidth="1px" borderRadius="md">
                            <Image src={image.previewUrl} alt="Предпросмотр" borderRadius="md" maxH="200px" />
                            <Text fontSize="sm" color="gray.500" mt={2}>
                                {image.file ? `Новый файл: ${image.file.name}` : `Текущий файл: ${image.existingUrl}`}
                            </Text>
                        </Box>
                    )}
                    <FormErrorMessage>{errors.image}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.price} isRequired>
                    <FormLabel>Цена</FormLabel>
                    <InputGroup>
                        <NumberInput value={formData.price} onChange={(valStr, valNum) => setFormData(p => ({ ...p, price: valNum || 0 }))} min={0} w="full">
                            <NumberInputField />
                        </NumberInput>
                        <Select name="currency" value={formData.currency} onChange={handleChange} w="120px" ml={-1}>
                            <option value="BYN">BYN</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                        </Select>
                    </InputGroup>
                    <FormErrorMessage>{errors.price}</FormErrorMessage>
                </FormControl>

                <FormControl isRequired>
                    <FormLabel>Категория</FormLabel>
                    <Select name="category" value={formData.category} onChange={handleChange}>
                        <option value="hot">Горящие</option>
                        <option value="popular">Популярные</option>
                        {/* --- ИЗМЕНЕНИЕ: Название категории изменено --- */}
                        <option value="special">Выгодные</option>
                    </Select>
                </FormControl>

                <FormControl>
                    <Checkbox
                        name="published"
                        isChecked={formData.published}
                        onChange={handleChange}
                    >
                        Опубликовать тур
                    </Checkbox>
                </FormControl>

                <Button type="submit" colorScheme="green" isLoading={isSubmitting} width="full" mt={4}>
                    {isEditing ? 'Сохранить изменения' : 'Создать тур'}
                </Button>
                <Button variant="ghost" onClick={onCancel} width="full">
                    Отмена
                </Button>
            </VStack>
        </Box>
    );
};

export default TourForm;
