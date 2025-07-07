import Head from 'next/head';
import {
  Box,
  Container,
  Heading,
  Text,
  Image,
  Flex,
  Badge,
  VStack,
  HStack,
  Divider,
  SimpleGrid,
  Tag,
  Spinner,
  Center
} from '@chakra-ui/react';
import { FaMapMarkerAlt, FaMoneyBillWave } from 'react-icons/fa';
import prisma from '../../lib/prisma';

// Этот компонент будет отображать детальную информацию о туре
const TourPage = ({ tour }) => {
  // Если данные тура еще загружаются или не найдены
  if (!tour) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <>
      <Head>
        <title>{tour.name} | Happy Tour</title>
        <meta name="description" content={tour.description ? tour.description.substring(0, 160) : ''} />
      </Head>

      <Box>
        {/* Главное изображение тура */}
        <Box h={{ base: '300px', md: '500px' }} position="relative" bg="gray.200">
          <Image
            src={tour.mainImage}
            alt={`Фотография тура ${tour.name}`}
            w="100%"
            h="100%"
            objectFit="cover"
            // Надежная заглушка, если изображение не загрузится
            fallbackSrc={`https://placehold.co/1200x500/E2E8F0/A0AEC0?text=Фото+тура`}
          />
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bg="blackAlpha.600"
          />
          <Container maxW="container.xl" h="100%">
            <Flex
              h="100%"
              direction="column"
              justify="flex-end"
              align="flex-start"
              color="white"
              pb={10}
              position="relative"
            >
              <Heading as="h1" size={{ base: 'xl', md: '2xl' }} mb={4}>
                {tour.name}
              </Heading>
              <HStack spacing={4}>
                <Badge colorScheme="teal" fontSize="md" p={2}>
                  {tour.country}
                </Badge>
                <Badge colorScheme="orange" fontSize="md" p={2}>
                  {tour.city}
                </Badge>
              </HStack>
            </Flex>
          </Container>
        </Box>

        <Container maxW="container.xl" py={10}>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
            {/* Основная информация */}
            <VStack spacing={6} align="stretch" gridColumn={{ base: 'auto', md: 'span 2' }}>
              <Heading as="h2" size="lg">
                Описание тура
              </Heading>
              <Text fontSize="md" lineHeight="tall">
                {tour.description}
              </Text>
              <Divider my={6} />
            </VStack>

            {/* Боковая панель с ключевой информацией */}
            <VStack
              spacing={5}
              align="stretch"
              p={6}
              bg="gray.50"
              borderRadius="md"
              border="1px solid"
              borderColor="gray.200"
              _dark={{ 
                bg: 'gray.700',
                borderColor: 'gray.600' 
              }}
            >
              <Heading as="h3" size="md" textAlign="center">
                Ключевая информация
              </Heading>
              <Divider />
              <HStack>
                <FaMoneyBillWave size="1.5em" color="teal" />
                <Text fontWeight="bold">Цена:</Text>
                <Text>{tour.price} руб.</Text>
              </HStack>
              <HStack>
                <FaMapMarkerAlt size="1.5em" color="blue" />
                <Text fontWeight="bold">Тип тура:</Text>
                <Tag size="lg" variant="solid" colorScheme="blue">
                  {tour.tourType}
                </Tag>
              </HStack>
            </VStack>
          </SimpleGrid>
        </Container>
      </Box>
    </>
  );
};

// Эта функция выполняется на сервере при каждом запросе к странице
export async function getServerSideProps(context) {
  const { id } = context.params;

  try {
    const tour = await prisma.tour.findUnique({
      where: { id: id },
    });

    if (!tour) {
      return {
        notFound: true,
      };
    }

    // Prisma возвращает дату как объект Date, его нужно серилизовать в строку
    const serializedTour = {
      ...tour,
      createdAt: tour.createdAt.toISOString(),
      updatedAt: tour.updatedAt.toISOString(),
    };

    return {
      props: {
        tour: serializedTour,
      },
    };
  } catch (error) {
    console.error('Failed to fetch tour:', error);
    return {
      notFound: true,
    };
  }
}

export default TourPage;
