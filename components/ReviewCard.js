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
      // ИЗМЕНЕНИЕ: Убрана фиксированная высота. Теперь карточка будет гибкой.
      // height="100%" заставит ее растянуться до высоты самой высокой карточки в ряду.
      height="100%"
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
      {/* ИЗМЕНЕНИЕ: Внутренний VStack теперь тоже растягивается,
          чтобы подвал всегда был прижат к низу. */}
      <VStack spacing={4} align="stretch" flex="1" zIndex={1} direction="column">
        <Flex justify="space-between" align="center">
          <Heading as="h3" size="sm">{review.author}</Heading>
          {renderStars(review.rating)}
        </Flex>

        {/* flexGrow={1} заставляет текст занимать все доступное пространство */}
        <Text fontStyle="italic" color="gray.600" noOfLines={5} flexGrow={1}>
          "{review.text}"
        </Text>
        
        {/* mt="auto" прижимает этот блок к низу карточки */}
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
