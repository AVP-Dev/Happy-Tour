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
        <Icon as={icon} mt={1} color="brand.400" />
        {href ? (
            <Link href={href} _hover={{ color: 'brand.300' }}>{children}</Link>
        ) : (
            <Text>{children}</Text>
        )}
    </HStack>
);

const SectionWrapper = ({ bgImage, children, ...rest }) => (
    <Box
        position="relative"
        py={{ base: 14, md: 20 }}
        bgImage={`url(${bgImage})`}
        bgSize="cover"
        bgPosition="center"
        bgAttachment="fixed"
        _before={{
            content: '""',
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            bg: 'rgba(0, 0, 0, 0.75)',
        }}
        {...rest}
    >
        <Container maxW="container.xl" position="relative" zIndex={1}>
            {children}
        </Container>
    </Box>
);

const ContactSection = ({ onFormSubmit }) => {
    return (
        // УБРАН ЛИШНИЙ GoogleReCaptchaProvider
        <AnimateOnScroll>
            <SectionWrapper id="contact-section" bgImage="/img/contacts-city-night.webp">
                <SectionHeading color="white">Свяжитесь с нами</SectionHeading>
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 10, lg: 16 }} color="white">
                    <VStack spacing={6} align="flex-start">
                        <Heading as="h3" size="lg" color="white">Мы всегда на связи</Heading>
                        <ContactInfoItem icon={FaMapMarkerAlt}>
                            г. Минск, ул. Немига, дом 40, 1 этаж
                        </ContactInfoItem>
                        <ContactInfoItem icon={FaMapMarkerAlt}>
                            г. Речица, ул. Советская, дом 80, 1 этаж
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
                            <Divider borderColor="gray.600" />
                            <Heading as="h4" size="md" mt={6} mb={3} color="white">Режим работы:</Heading>
                            <Text color="gray.300">Пн-Пт: 10:00-19:00</Text>
                            <Text color="gray.300">Сб: 10:00-16:00, Вс: Выходной</Text>
                        </Box>
                    </VStack>
                    <VStack spacing={6} align="flex-start">
                        <Heading as="h3" size="lg" color="white">Оставьте заявку онлайн</Heading>
                        <Box w="100%" p={{ base: 6, md: 8 }} bg="rgba(255, 255, 255, 0.1)" backdropFilter="blur(10px)" borderRadius="lg">
                            <ContactForm onFormSubmit={onFormSubmit} />
                        </Box>
                    </VStack>
                </SimpleGrid>
            </SectionWrapper>
        </AnimateOnScroll>
    );
};

export default ContactSection;
