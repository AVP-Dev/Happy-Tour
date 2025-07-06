// components/admin/TourForm.js
import React, { useState, useEffect, useRef } from 'react';
import {
    FormControl, FormLabel, Input, Textarea, Button, VStack,
    Box, Select, NumberInput, NumberInputField, useToast, Image,
    InputGroup, FormErrorMessage, Text, Checkbox, SimpleGrid, HStack, Icon, Center
} from '@chakra-ui/react';
import { FaUpload } from 'react-icons/fa';

const TourForm = ({ initialData, onSubmit, isSubmitting, onCancel }) => {
    const isEditing = !!initialData?.id;
    const toast = useToast();
    const fileInputRef = useRef(null);

    const getInitialState = (data) => ({
        title: data?.title || '',
        description: data?.description || '',
        price: data?.price || 0,
        currency: data?.currency || 'BYN',
        category: data?.category || 'hot',
        published: isEditing ? data.published : true,
    });

    const [formData, setFormData] = useState(getInitialState(initialData));
    const [image, setImage] = useState({
        file: null,
        previewUrl: initialData?.image_url || null,
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialData) {
            setFormData(getInitialState(initialData));
            setImage({
                file: null,
                previewUrl: initialData.image_url || null,
            });
        }
    }, [initialData]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast({ title: "Файл слишком большой", description: "Максимальный размер файла 5MB.", status: "error", position: "top-right" });
                return;
            }
            setImage({ file: file, previewUrl: URL.createObjectURL(file) });
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
        if (!isEditing && !image.file && !initialData?.image_url) {
            newErrors.image = "Изображение обязательно для нового тура";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        let finalImageUrl = image.previewUrl;

        if (image.file) {
            const fileFormData = new FormData();
            fileFormData.append('file', image.file);
            
            try {
                const uploadRes = await fetch('/api/upload', { method: 'POST', body: fileFormData });
                const uploadData = await uploadRes.json();
                if (!uploadRes.ok) {
                    throw new Error(uploadData.error || 'Ошибка загрузки файла');
                }
                finalImageUrl = uploadData.url; 
                toast({ title: "Изображение успешно загружено", status: "success", position: "top-right" });
            } catch (error) {
                toast({ title: "Ошибка загрузки изображения", description: error.message, status: "error", position: "top-right" });
                return;
            }
        }
        
        const finalData = { 
            ...formData, 
            image_url: finalImageUrl,
            ...(isEditing && { id: initialData.id })
        };
        onSubmit(finalData);
    };

    const previewUrl = image.previewUrl;

    return (
        <VStack as="form" onSubmit={handleFormSubmit} spacing={6} align="stretch">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <VStack spacing={6}>
                    <FormControl isInvalid={!!errors.title} isRequired>
                        <FormLabel>Название тура</FormLabel>
                        <Input name="title" value={formData.title} onChange={handleChange} />
                        <FormErrorMessage>{errors.title}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={!!errors.price} isRequired>
                        <FormLabel>Цена</FormLabel>
                        <InputGroup>
                            <NumberInput 
                                value={formData.price} 
                                onChange={(valStr, valNum) => setFormData(p => ({ ...p, price: valNum || 0 }))} 
                                min={0} 
                                w="full"
                            >
                                <NumberInputField />
                            </NumberInput>
                            <Select 
                                name="currency" 
                                value={formData.currency} 
                                onChange={handleChange} 
                                w="120px" 
                                borderLeftRadius={0}
                            >
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
                            <option value="special">Выгодные</option>
                        </Select>
                    </FormControl>

                </VStack>

                <FormControl isInvalid={!!errors.image} isRequired={!isEditing && !initialData?.image_url}>
                    <FormLabel>Изображение тура</FormLabel>
                    <Center
                        p={4}
                        border="2px dashed"
                        borderColor="gray.300"
                        borderRadius="md"
                        cursor="pointer"
                        _hover={{ borderColor: 'brand.500' }}
                        onClick={() => fileInputRef.current.click()}
                        position="relative"
                        minH="200px"
                    >
                        <Input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png, image/jpeg, image/webp"
                            onChange={handleFileChange}
                            hidden
                        />
                        {previewUrl ? (
                            <Image src={previewUrl} alt="Предпросмотр" borderRadius="md" maxH="200px" />
                        ) : (
                            <VStack color="gray.500">
                                <Icon as={FaUpload} boxSize={8} />
                                <Text>Нажмите, чтобы загрузить</Text>
                            </VStack>
                        )}
                    </Center>
                    <FormErrorMessage>{errors.image}</FormErrorMessage>
                </FormControl>
            </SimpleGrid>

            <FormControl>
                <FormLabel>Описание</FormLabel>
                <Textarea name="description" value={formData.description} onChange={handleChange} rows={5} />
            </FormControl>

            <FormControl>
                <Checkbox name="published" isChecked={formData.published} onChange={handleChange}>
                    Опубликовать тур на сайте
                </Checkbox>
            </FormControl>

            <HStack justifyContent="flex-end" spacing={4} mt={4}>
                <Button variant="ghost" onClick={onCancel}>
                    Отмена
                </Button>
                <Button type="submit" colorScheme="brand" isLoading={isSubmitting}>
                    {isEditing ? 'Сохранить изменения' : 'Создать тур'}
                </Button>
            </HStack>
        </VStack>
    );
};

export default TourForm;
