// components/FloatingContact.js
import {
    Box,
    Flex, // ИСПРАВЛЕНО: Добавлен импорт Flex
    IconButton,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    HStack,
    Link,
    Divider,
    Text,
    VStack,
    Tooltip,
} from '@chakra-ui/react';
import { FaCommentDots, FaTelegramPlane, FaViber, FaWhatsapp, FaInstagram } from 'react-icons/fa';
import ContactForm from './ContactForm';

const FloatingContact = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const socialLinks = [
        { href: "https://t.me/happytour.by", label: "Telegram", icon: FaTelegramPlane, color: "#0088cc" },
        { href: "viber://chat?number=+375447886761", label: "Viber", icon: FaViber, color: "#7360f2" },
        { href: "https://wa.me/375447886761", label: "WhatsApp", icon: FaWhatsapp, color: "#25d366" },
        { href: "https://www.instagram.com/happytour.by?igsh=ZHV6b3BjODFqMjZv", label: "Instagram", icon: FaInstagram, bgGradient: "linear(to-l, #833ab4, #fd1d1d, #fcb045)" },
    ];

    return (
        <>
            <Tooltip label="Связаться с нами" placement="left" hasArrow>
                <IconButton
                    aria-label="Связаться с нами"
                    icon={<FaCommentDots />}
                    isRound
                    size="lg"
                    fontSize="2xl"
                    colorScheme="brand"
                    position="fixed"
                    bottom="30px"
                    right="30px"
                    zIndex="sticky"
                    boxShadow="2xl"
                    onClick={onOpen}
                    _hover={{ transform: 'translateY(-2px) scale(1.05)' }}
                />
            </Tooltip>

            <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
                <ModalOverlay bg="blackAlpha.600" />
                <ModalContent>
                    <ModalHeader bg="brand.500" color="white" borderTopRadius="lg" textAlign="center">
                        Удобные способы связи
                    </ModalHeader>
                    <ModalCloseButton color="white" _focus={{ boxShadow: 'outline-white' }} />
                    <ModalBody py={6}>
                        <VStack spacing={5}>
                            <HStack spacing={5} justify="center">
                                {socialLinks.map(({ href, label, icon, color, bgGradient }) => (
                                    <Tooltip key={label} label={label} placement="top" hasArrow>
                                        <Link href={href} isExternal>
                                            <IconButton
                                                aria-label={label}
                                                icon={<Box as={icon} />}
                                                isRound
                                                size="lg"
                                                fontSize="3xl"
                                                color="white"
                                                bg={color}
                                                bgGradient={bgGradient}
                                                _hover={{ transform: 'translateY(-3px)', opacity: 0.9 }}
                                            />
                                        </Link>
                                    </Tooltip>
                                ))}
                            </HStack>

                            <Flex align="center" width="100%" py={2}>
                                <Divider />
                                <Text px="4" color="gray.500" fontWeight="medium">ИЛИ</Text>
                                <Divider />
                            </Flex>

                            <ContactForm onClose={onClose} />
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
};

export default FloatingContact;
