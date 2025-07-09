import Head from 'next/head';
import NextImage from 'next/image';
import {
  Box,
  Container,
  Heading,
  Text,
  Flex,
  VStack,
  HStack,
  Divider,
  SimpleGrid,
  Tag,
  Spinner,
  Center,
  Button,
  Icon,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useToast,
} from '@chakra-ui/react';
// ИЗМЕНЕНИЕ: Добавлены иконки для категорий
import { FaHotjar, FaStar, FaGift } from 'react-icons/fa';
import prisma from '../../lib/prisma';
import ContactForm from '../../components/ContactForm';

// Вспомогательный компонент для аккуратного отображения информации
const InfoItem = ({ icon, label, children }) => (
  <HStack align="center" w="100%" spacing={4}>
    <Flex
      p={3}
      bg="brand.100"
      color="brand.600"
      borderRadius="full"
      align="center"
      justify="center"
    >
      <Icon as={icon} w={5} h={5} />
    </Flex>
    <VStack align="start" spacing={0}>
      <Text fontSize="sm" color="gray.500">
        {label}
      </Text>
      <Box fontWeight="medium">{children}</Box>
    </VStack>
  </HStack>
);

const TourPage = ({ tour }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // ИЗМЕНЕНИЕ: Добавлена логика для определения деталей категории, как на главной
  const getCategoryDetails = (category) => {
    switch (category) {
      case 'hot':
        return { icon: FaHotjar, color: 'red', label: 'Горящий' };
      case 'popular':
        return { icon: FaStar, color: 'orange', label: 'Популярный' };
      case 'special':
        return { icon: FaGift, color: 'purple', label: 'Выгодный' };
      default:
        // Возвращаем пустой объект, если категория не задана, чтобы ничего не отображать
        return null;
    }
  };

  const categoryDetails = tour ? getCategoryDetails(tour.category) : null;

  if (!tour) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }
  
  const showNotification = (options) => {
    toast({
        title: options.type === 'success' ? 'Успешно!' : 'Ошибка!',
        description: options.message,
        status: options.type,
        duration: 5000,
        isClosable: true,
        position: 'top-right',
    });
  };

  return (
    <>
      <Head>
        <title>{tour.name} | Happy Tour</title>
        <meta name="description" content={tour.description ? tour.description.substring(0, 160) : ''} />
      </Head>

      <Box>
        <Box h={{ base: '300px', md: '500px' }} position="relative" bg="gray.200">
          {/* ИЗМЕНЕНИЕ: Исправлен источник изображения на tour.image_url */}
          <NextImage
            src={tour.image_url || `https://placehold.co/1200x500/E2E8F0/A0AEC0?text=Happy+Tour`}
            alt={`Фотография тура ${tour.name}`}
            layout="fill"
            objectFit="cover"
            priority
          />
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bgGradient="linear(to-t, blackAlpha.800, transparent)"
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
              <Heading as="h1" size={{ base: 'xl', md: '2xl' }} mb={4} textShadow="0 2px 4px rgba(0,0,0,0.5)">
                {tour.name}
              </Heading>
              {/* ИЗМЕНЕНИЕ: Удалены бейджи страны и города */}
            </Flex>
          </Container>
        </Box>

        <Container maxW="container.xl" py={10}>
          <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={{base: 10, lg: 8}}>
            <VStack spacing={6} align="stretch" gridColumn={{ base: 'auto', lg: 'span 2' }}>
              <Heading as="h2" size="lg">
                Описание тура
              </Heading>
              <Box p={{ base: 6, md: 8 }} bg="rgba(255, 255, 255, 0.85)" borderRadius="lg" boxShadow="md">
                <Text fontSize="md" lineHeight="tall">
                  {tour.description}
                </Text>
              </Box>
            </VStack>

            <VStack
              spacing={6}
              align="stretch"
              p={{ base: 6, md: 8 }}
              bg="rgba(255, 255, 255, 0.85)"
              borderRadius="lg"
              boxShadow="md"
              h="fit-content"
              position={{lg: 'sticky'}}
              top="100px"
            >
              <Heading as="h3" size="lg" textAlign="center">
                Стоимость
              </Heading>
              
              <Flex direction="column" align="center" justify="center" bg="white" p={6} borderRadius="md" boxShadow="inner">
                <Text fontSize="sm" color="gray.500">Цена от</Text>
                <Text fontSize="5xl" fontWeight="extrabold" color="brand.600" lineHeight="1">
                  {tour.price}
                </Text>
                {/* ИЗМЕНЕНИЕ: Валюта теперь берется из данных тура */}
                <Text fontSize="xl" color="gray.600">
                  {tour.currency}
                </Text>
              </Flex>

              <Divider />

              {/* ИЗМЕНЕНИЕ: Отображаем категорию тура, если она есть */}
              {categoryDetails && (
                <InfoItem icon={categoryDetails.icon} label="Категория">
                  <Tag size="lg" variant="subtle" colorScheme={categoryDetails.color} borderRadius="full">
                    {categoryDetails.label}
                  </Tag>
                </InfoItem>
              )}

              <Button colorScheme="brand" size="lg" w="100%" mt={4} onClick={onOpen}>
                Оставить заявку
              </Button>
            </VStack>
          </SimpleGrid>
        </Container>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Заявка на тур</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <ContactForm
                tour={tour}
                onFormSubmit={(options) => {
                    showNotification(options);
                    if (options.type === 'success') {
                        onClose();
                    }
                }}
                onClose={onClose}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

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

    const serializedTour = JSON.parse(JSON.stringify(tour));

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
