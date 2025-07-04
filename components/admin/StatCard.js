// components/admin/StatCard.js
import React from 'react';
import {
    Box,
    Flex,
    Text,
    Icon,
    VStack,
    useTheme,
} from '@chakra-ui/react';

const StatCard = ({ title, stat, icon, colorScheme = 'gray' }) => {
    const theme = useTheme();
    
    // Получаем цвета из темы для указанной цветовой схемы
    const iconBgColor = theme.colors[colorScheme]?.[100] || theme.colors.gray[100];
    const iconColor = theme.colors[colorScheme]?.[600] || theme.colors.gray[600];

    return (
        <Flex
            align="center"
            p={5}
            bg="white"
            borderRadius="lg"
            boxShadow="md"
            border="1px solid"
            borderColor="gray.200"
        >
            <Flex
                w={14}
                h={14}
                align="center"
                justify="center"
                borderRadius="full"
                bg={iconBgColor}
                mr={4}
            >
                <Icon as={icon} boxSize={7} color={iconColor} />
            </Flex>
            <VStack align="flex-start" spacing={0}>
                <Text fontWeight="medium" color="gray.500" noOfLines={1}>
                    {title}
                </Text>
                <Text fontSize="3xl" fontWeight="bold">
                    {stat}
                </Text>
            </VStack>
        </Flex>
    );
};

export default StatCard;
