// components/ContactSection.js
import AnimateOnScroll from './AnimateOnScroll';
import ContactForm from './ContactForm';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import {
    Box, Container, Heading, SimpleGrid, VStack, HStack, Text, Link, Icon, Divider
} from '@chakra-ui/react';

const SectionHeading = (props) => (
    <Heading
        as="h2"
        size={{ base: 'xl', md: '2xl' }}
        textAlign="center"
        mb={{ base: 8, md: 12 }}
        fontWeight="bold"
        {...props}
    />
);

const ContactInfoItem = ({ icon, children, href }) => (
    <HStack spacing={4} align="flex-start">
        <Icon as={icon} mt={1} color="brand.500" />
        {href ? (
            // ИЗМЕНЕНИЕ: Добавлено пунктирное подчеркивание при наведении
            <Link 
                href={href} 
                isExternal 
                _hover={{ 
                    color: 'brand.600', 
                    textDecoration: 'underline',
                    textDecorationStyle: 'dotted',
                    textUnderlineOffset: '3px' // Небольшой отступ для красоты
                }}
            >
                {children}
            </Link>
        ) : (
            <Text>{children}</Text>
        )}
    </HStack>
);

const ContactSection = ({ onFormSubmit }) => {
    const minskAddress = 'г. Минск, ул. Немига, дом 40';
    const rechitsaAddress = 'г. Речица, ул. Советская, дом 80';
    
    const yandexMapsUrlMinsk = `https://yandex.by/maps/?text=${encodeURIComponent(minskAddress)}`;
    const yandexMapsUrlRechitsa = `https://yandex.by/maps/?text=${encodeURIComponent(rechitsaAddress)}`;

    return (
        <AnimateOnScroll>
            <Box as="section" id="contact-section" py={{ base: 14, md: 20 }}>
                <Container maxW="container.xl">
                    <SectionHeading>Свяжитесь с нами</SectionHeading>
                    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 10, lg: 16 }} alignItems="stretch">
                        
                        <VStack spacing={6} align="flex-start" h="100%">
                            <Heading as="h3" size="lg">Мы всегда на связи</Heading>
                            <Box 
                                w="100%" 
                                p={{ base: 6, md: 8 }} 
                                bg="rgba(255, 255, 255, 0.85)"
                                borderRadius="lg" 
                                boxShadow="md"
                                flex="1"
                            >
                                <VStack spacing={6} align="flex-start">
                                    <ContactInfoItem icon={FaMapMarkerAlt} href={yandexMapsUrlMinsk}>
                                        {minskAddress}, 1 этаж
                                    </ContactInfoItem>
                                    <ContactInfoItem icon={FaMapMarkerAlt} href={yandexMapsUrlRechitsa}>
                                        {rechitsaAddress}, 1 этаж
                                    </ContactInfoItem>
                                    <ContactInfoItem icon={FaPhoneAlt} href="tel:+375447886761">
                                        +375 (44) 788-67-61
                                    </ContactInfoItem>
                                    <ContactInfoItem icon={FaPhoneAlt} href="tel:+375445615142">
                                        +375 (44) 561-51-42
                                    </ContactInfoItem>
                                    <ContactInfoItem icon={FaEnvelope} href="mailto:info@happytour.by">
                                        info@happytour.by
                                    </ContactInfoItem>
                                    <Box pt={4} w="100%">
                                        <Divider />
                                        <Heading as="h4" size="md" mt={6} mb={3}>Режим работы:</Heading>
                                        <Text color="gray.600">Пн-Пт: 10:00-19:00</Text>
                                        <Text color="gray.600">Сб: 10:00-16:00, Вс: Выходной</Text>
                                    </Box>
                                </VStack>
                            </Box>
                        </VStack>

                        <VStack spacing={6} align="flex-start" h="100%">
                            <Heading as="h3" size="lg">Оставьте заявку онлайн</Heading>
                            <Box 
                                w="100%" 
                                p={{ base: 6, md: 8 }} 
                                bg="white" 
                                borderRadius="lg" 
                                boxShadow="md"
                                flex="1"
                            >
                                <ContactForm onFormSubmit={onFormSubmit} />
                            </Box>
                        </VStack>

                    </SimpleGrid>
                </Container>
            </Box>
        </AnimateOnScroll>
    );
};

export default ContactSection;
