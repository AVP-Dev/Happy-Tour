// components/TourCardSkeleton.js
import React from 'react';
import { Box, VStack, HStack, Skeleton, AspectRatio } from '@chakra-ui/react';

const TourCardSkeleton = () => {
  return (
    <Box
        bg="white"
        borderRadius="xl"
        overflow="hidden"
        boxShadow="lg"
        height="100%"
    >
        <AspectRatio ratio={16 / 9}>
            <Skeleton />
        </AspectRatio>
      
        <VStack p={5} align="stretch" spacing={4}>
            <Skeleton height="24px" width="80%" />
            <VStack align="stretch" spacing={2}>
                <Skeleton height="16px" />
                <Skeleton height="16px" />
                <Skeleton height="16px" width="60%" />
            </VStack>
            <HStack justify="space-between" align="center" pt={3} borderTop="1px solid" borderColor="gray.200">
                <Skeleton height="28px" width="100px" />
                <Skeleton height="40px" width="110px" borderRadius="lg" />
            </HStack>
        </VStack>
    </Box>
  );
};

export default TourCardSkeleton;
