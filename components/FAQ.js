// components/FAQ.js
import {
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Box,
    Text,
} from '@chakra-ui/react';

const FAQ = ({ items = [] }) => {
    return (
        <Box maxW="800px" mx="auto">
            <Accordion allowToggle>
                {items.map((item, index) => (
                    <AccordionItem key={index}>
                        <h2>
                            <AccordionButton>
                                <Box as="span" flex="1" textAlign="left">
                                    <Text>{item.q}</Text>
                                </Box>
                                <AccordionIcon />
                            </AccordionButton>
                        </h2>
                        <AccordionPanel>
                            {item.a}
                        </AccordionPanel>
                    </AccordionItem>
                ))}
            </Accordion>
        </Box>
    );
};

export default FAQ;
