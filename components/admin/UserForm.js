// components/admin/UserForm.js
import React, { useState, useEffect } from 'react';
import {
    FormControl, FormLabel, Input, Button, VStack, Select,
    FormErrorMessage, InputGroup, InputRightElement,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

const UserForm = ({ initialData = {}, onSubmit, isSubmitting, onCancel }) => {
    // --- ИЗМЕНЕНИЕ: Добавлено поле name ---
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'admin' });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const isEditing = !!initialData.id;

    useEffect(() => {
        if (isEditing) {
            setFormData({
                id: initialData.id,
                name: initialData.name || '', // <--- ДОБАВЛЕНО
                email: initialData.email || '',
                role: initialData.role || 'admin',
                password: '',
            });
        }
    }, [initialData, isEditing]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.email.includes('@')) newErrors.email = 'Введите корректный email';
        if (!isEditing && (!formData.password || formData.password.length < 6)) {
            newErrors.password = 'Пароль обязателен (минимум 6 символов)';
        }
        // --- ИЗМЕНЕНИЕ: Добавлена валидация имени ---
        if (!formData.name.trim()) newErrors.name = 'Имя обязательно для заполнения';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        onSubmit(formData);
    };

    return (
        <VStack as="form" onSubmit={handleFormSubmit} spacing={4}>
            {/* --- ИЗМЕНЕНИЕ: Добавлено поле для ввода имени --- */}
            <FormControl isInvalid={errors.name} isRequired>
                <FormLabel>Имя</FormLabel>
                <Input name="name" type="text" value={formData.name} onChange={handleChange} />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={errors.email} isRequired>
                <FormLabel>Email</FormLabel>
                <Input name="email" type="email" value={formData.email} onChange={handleChange} />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={errors.password} isRequired={!isEditing}>
                <FormLabel>{isEditing ? 'Новый пароль (необязательно)' : 'Пароль'}</FormLabel>
                <InputGroup>
                    <Input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder={isEditing ? 'Оставьте пустым, чтобы не менять' : ''}
                    />
                    <InputRightElement>
                        <Button h="1.75rem" size="sm" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                        </Button>
                    </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errors.password}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired>
                <FormLabel>Роль</FormLabel>
                <Select name="role" value={formData.role} onChange={handleChange}>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                </Select>
            </FormControl>

            <Button type="submit" colorScheme="green" isLoading={isSubmitting} width="full" mt={4}>
                {isEditing ? 'Сохранить' : 'Создать пользователя'}
            </Button>
            <Button variant="ghost" onClick={onCancel} width="full">
                Отмена
            </Button>
        </VStack>
    );
};

export default UserForm;
