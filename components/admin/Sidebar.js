// components/admin/Sidebar.js
import React from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Box, VStack, Button, Heading, Divider, Link, Icon } from '@chakra-ui/react';
import { signOut } from 'next-auth/react';
import { FaHome, FaPlane, FaStar, FaUsers, FaSignOutAlt } from 'react-icons/fa';

const NavItem = ({ icon, children, href, onClose }) => {
    const router = useRouter();
    const isActive = router.pathname === href;

    return (
        <Link as={NextLink} href={href} passHref _hover={{ textDecoration: 'none' }}>
            <Button
                as="a"
                leftIcon={<Icon as={icon} />}
                w="full"
                justifyContent="flex-start"
                variant={isActive ? "solid" : "ghost"}
                colorScheme={isActive ? "brand" : "gray"}
                bg={isActive ? "brand.500" : "transparent"}
                color={isActive ? "white" : "gray.300"}
                _hover={{
                    bg: isActive ? 'brand.600' : 'gray.700',
                    color: 'white',
                }}
                onClick={onClose}
            >
                {children}
            </Button>
        </Link>
    );
};

const Sidebar = ({ onClose }) => {
    const { data: session } = useSession(); // Получаем данные сессии
    const userRole = session?.user?.role;

    const navItems = [
        { href: '/admin', icon: FaHome, label: 'Дашборд' },
        { href: '/admin/tours', icon: FaPlane, label: 'Туры' },
        { href: '/admin/reviews', icon: FaStar, label: 'Отзывы' },
    ];
    
    // Добавляем пункт "Пользователи" только для super_admin
    if (userRole === 'super_admin') {
        navItems.push({ href: '/admin/users', icon: FaUsers, label: 'Пользователи' });
    }

    return (
        <VStack h="full" bg="gray.800" color="white" p={4} spacing={2} align="stretch">
            <Heading as="h1" size="lg" my={4} textAlign="center" color="brand.400">
                Happy Tour
            </Heading>
            
            <VStack spacing={2} align="stretch" flexGrow={1}>
                {navItems.map((item) => (
                    <NavItem key={item.href} href={item.href} icon={item.icon} onClose={onClose}>
                        {item.label}
                    </NavItem>
                ))}
            </VStack>

            <Divider my={2} borderColor="gray.600" />

            <Button
                leftIcon={<Icon as={FaSignOutAlt} />}
                variant="ghost"
                color="gray.400"
                _hover={{ bg: 'red.800', color: 'white' }}
                justifyContent="flex-start"
                w="full"
                onClick={() => {
                    onClose && onClose();
                    signOut({ callbackUrl: '/admin/login' });
                }}
            >
                Выйти
            </Button>
        </VStack>
    );
};

export default Sidebar;
