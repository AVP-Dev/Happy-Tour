// components/admin/AdminLayout.js
import React from 'react';
import {
    Box,
    Flex,
    Drawer,
    DrawerOverlay,
    DrawerContent,
    IconButton,
    useDisclosure,
    useBreakpointValue,
    Heading,
} from '@chakra-ui/react';
import { FaBars } from 'react-icons/fa';
import Sidebar from './Sidebar'; // Импортируем наш единый компонент сайдбара

const AdminLayout = ({ children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    // Определяем, является ли экран десктопным, чтобы показывать/скрывать элементы
    const isDesktop = useBreakpointValue({ base: false, lg: true });

    return (
        <Flex minH="100vh" bg="gray.100">
            {/* Сайдбар для десктопа (фиксированный) */}
            {isDesktop && (
                <Box
                    as="nav"
                    position="fixed"
                    left="0"
                    top="0"
                    h="100%"
                    w="260px" // Немного увеличили ширину
                    boxShadow="md"
                    zIndex="sticky"
                >
                    <Sidebar />
                </Box>
            )}

            {/* Основной контент */}
            <Box
                flex="1"
                ml={isDesktop ? '260px' : '0'}
                width="100%"
                transition="margin-left .2s ease-in-out"
            >
                {/* Хедер для мобильных устройств */}
                {!isDesktop && (
                    <Flex
                        as="header"
                        align="center"
                        justify="space-between"
                        px={4}
                        py={2}
                        bg="white"
                        borderBottomWidth="1px"
                        borderColor="gray.200"
                        position="sticky"
                        top="0"
                        zIndex="docked"
                    >
                        <Heading as="h1" size="md" color="brand.500">
                           Happy Tour Admin
                        </Heading>
                        <IconButton
                            aria-label="Открыть меню"
                            icon={<FaBars />}
                            onClick={onOpen}
                            variant="outline"
                        />
                    </Flex>
                )}

                <Box as="main" p={{ base: 4, md: 6, lg: 8 }}>
                    {children}
                </Box>
            </Box>

            {/* Выдвижное меню (Drawer) для мобильных */}
            {!isDesktop && (
                <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
                    <DrawerOverlay />
                    <DrawerContent bg="gray.800">
                        {/* Передаем функцию onClose в сайдбар, чтобы он мог закрыть себя */}
                        <Sidebar onClose={onClose} />
                    </DrawerContent>
                </Drawer>
            )}
        </Flex>
    );
};

export default AdminLayout;
