import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  useToast,
  Checkbox,
  Link,
  Text,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import NextLink from 'next/link';

const ContactForm = ({ tourName, onClose }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isAgreed, setIsAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const toast = useToast();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Поле 'Имя' обязательно для заполнения";
    if (!phone.trim()) {
      newErrors.phone = "Поле 'Телефон' обязательно для заполнения";
    } else if (!/^\+?[0-9\s-()]{10,}$/.test(phone)) {
      newErrors.phone = 'Неверный формат номера телефона';
    }
    if (!isAgreed) {
      newErrors.isAgreed = 'Необходимо согласие на обработку данных';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      if (!isAgreed) {
        toast({
            title: 'Подтвердите согласие',
            description: 'Вы должны согласиться с политикой обработки персональных данных.',
            status: 'warning',
            duration: 5000,
            isClosable: true,
        });
      }
      return;
    }

    if (!executeRecaptcha) {
      console.error('Execute recaptcha not yet available');
      toast({
        title: 'Ошибка',
        description: 'Не удалось проверить reCAPTCHA. Попробуйте обновить страницу.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = await executeRecaptcha('contactForm');

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          phone,
          email,
          message,
          tourName: tourName || 'Не указан',
          token,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Заявка успешно отправлена',
          description: 'Мы свяжемся с вами в ближайшее время.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        setName('');
        setPhone('');
        setEmail('');
        setMessage('');
        setIsAgreed(false);
        setErrors({});
        if (onClose) {
          onClose();
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при отправке формы');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось отправить заявку. Пожалуйста, попробуйте еще раз.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={4}>
        <FormControl isRequired isInvalid={errors.name}>
          <FormLabel>Имя</FormLabel>
          <Input
            placeholder="Ваше имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && <FormErrorMessage>{errors.name}</FormErrorMessage>}
        </FormControl>

        <FormControl isRequired isInvalid={errors.phone}>
          <FormLabel>Телефон</FormLabel>
          <Input
            placeholder="+7 (999) 999-99-99"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          {errors.phone && <FormErrorMessage>{errors.phone}</FormErrorMessage>}
        </FormControl>

        <FormControl>
          <FormLabel>Email (необязательно)</FormLabel>
          <Input
            placeholder="example@mail.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Сообщение (необязательно)</FormLabel>
          <Textarea
            placeholder="Ваши пожелания"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </FormControl>

        <FormControl isRequired isInvalid={errors.isAgreed}>
          <Checkbox
            isChecked={isAgreed}
            onChange={(e) => setIsAgreed(e.target.checked)}
          >
            <Text fontSize="sm">
              Я согласен с{' '}
              <NextLink href="/privacy" passHref>
                <Link color="teal.500" isExternal>
                  политикой обработки персональных данных
                </Link>
              </NextLink>
            </Text>
          </Checkbox>
           {errors.isAgreed && <FormErrorMessage>{errors.isAgreed}</FormErrorMessage>}
        </FormControl>

        <Button
          type="submit"
          colorScheme="teal"
          isLoading={isLoading}
          width="full"
        >
          Отправить заявку
        </Button>
      </VStack>
    </Box>
  );
};

export default ContactForm;
