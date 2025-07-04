// components/ReviewCard.js
import React from 'react';
import { Box, Text, Button, VStack, HStack, Flex, Icon, Heading } from '@chakra-ui/react';
import { FaStar } from 'react-icons/fa';

const ReviewCard = ({ review, onReadMore }) => {
  const renderStars = (rating) => {
    return (
      <HStack spacing={1}>
        {[...Array(5)].map((_, i) => (
          <Icon
            key={i}
            as={FaStar}
            color={i < rating ? "yellow.400" : "gray.300"}
          />
        ))}
      </HStack>
    );
  };

  return (
    <Flex
      direction="column"
      bg="white"
      borderRadius="xl"
      p={6}
      boxShadow="lg"
      borderTop="4px solid"
      borderColor="brand.400"
      position="relative"
      height={{ base: 'auto', md: '300px' }} // Фиксированная высота для десктопа
      textAlign="left"
      _before={{
        content: '""',
        fontFamily: 'Georgia, serif',
        position: 'absolute',
        top: '10px',
        left: '15px',
        fontSize: '6rem',
        color: 'gray.100',
        lineHeight: 1,
        zIndex: 0,
      }}
    >
      <VStack spacing={4} align="stretch" flex="1" zIndex={1}>
        <Flex justify="space-between" align="center">
          <Heading as="h3" size="sm">{review.author}</Heading>
          {renderStars(review.rating)}
        </Flex>

        <Text fontStyle="italic" color="gray.600" noOfLines={5} flexGrow={1}>
          "{review.text}"
        </Text>
        
        <Flex justify="space-between" align="center" mt="auto">
            <Text fontSize="sm" color="gray.500">
                {new Date(review.date).toLocaleDateString('ru-RU')}
            </Text>
            {review.text && review.text.length > 150 && (
                <Button variant="link" colorScheme="brand" size="sm" onClick={() => onReadMore(review)}>
                    Читать далее
                </Button>
            )}
        </Flex>
      </VStack>
    </Flex>
  );
};

export default ReviewCard;
