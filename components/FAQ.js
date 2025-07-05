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
                    >
                        <h2>
                            <AccordionButton 
                                p={5} 
                                _hover={{ bg: 'gray.50' }}
                                _expanded={{ bg: 'brand.500', color: 'white' }}
                            >
                                <Box as="span" flex="1" textAlign="left">
                                    <Text fontSize="lg" fontWeight="semibold">{item.q}</Text>
                                </Box>
                                <AccordionIcon fontSize="2xl" />
                            </AccordionButton>
                        </h2>
                        <AccordionPanel pb={5} px={5} bg="white">
                            <Text color="gray.700">{item.a}</Text>
                        </AccordionPanel>
                    </AccordionItem>
                ))}
            </VStack>
        </Box>
    );
};

export default FAQ;
