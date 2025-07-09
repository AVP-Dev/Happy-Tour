// components/FAQ.js
import {
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Box,
    Text,
    VStack,
} from '@chakra-ui/react';

const FAQ = ({ items = [] }) => {
    return (
        <Box maxW="800px" mx="auto">
            <VStack as={Accordion} allowToggle spacing={4} align="stretch">
                {items.map((item, index) => (
                    <AccordionItem 
                        key={index} 
                        borderWidth="1px" 
                        borderRadius="lg" 
                        boxShadow="sm"
                        overflow="hidden"
                        _last={{ mb: "0" }}
                        // ИЗМЕНЕНИЕ: Добавил полупрозрачный фон для всего элемента.
                        // Это создаст "подложку" для текста вопроса и ответа, улучшая читаемость.
                        // 'rgba(255, 255, 255, 0.85)' - белый цвет с 85% непрозрачности.
                        // Можешь поменять 0.85 на 0.9 или 1.0, если нужно еще плотнее.
                        bg="rgba(255, 255, 255, 0.85)"
                    >
                        <h2>
                            <AccordionButton 
                                p={5} 
                                _hover={{ bg: 'gray.100' }} // Сделал ховер чуть заметнее
                                _expanded={{ bg: 'brand.500', color: 'white' }}
                            >
                                <Box as="span" flex="1" textAlign="left">
                                    <Text fontSize="lg" fontWeight="semibold">{item.q}</Text>
                                </Box>
                                <AccordionIcon fontSize="2xl" />
                            </AccordionButton>
                        </h2>
                        {/* ИЗМЕНЕНИЕ: Убрал `bg="white"`, так как фон теперь задан на родительском AccordionItem. */}
                        <AccordionPanel pb={5} px={5}>
                            <Text color="gray.700">{item.a}</Text>
                        </AccordionPanel>
                    </AccordionItem>
                ))}
            </VStack>
        </Box>
    );
};

export default FAQ;
