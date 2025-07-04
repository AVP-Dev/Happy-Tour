// pages/index.js
import React, { useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import prisma from '../lib/prisma';

import {
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
    useDisclosure, useToast, Button, Box, Text, Heading, Container
} from '@chakra-ui/react';

import TourCard from '../components/TourCard';
import ReviewCard from '../components/ReviewCard';

const Hero = dynamic(() => import('../components/Hero'));
const UniversalCarousel = dynamic(() => import('../components/Carousel'));
const ContactSection = dynamic(() => import('../components/ContactSection'));
const FAQ = dynamic(() => import('../components/FAQ'));
const ReviewForm = dynamic(() => import('../components/ReviewForm'));
const ContactForm = dynamic(() => import('../components/ContactForm'));
const TourvisorWidget = dynamic(() => import('../components/TourvisorWidget'), { ssr: false });

// Обертка для секций с фоновым изображением
const SectionWrapper = ({ bgImage, children, ...rest }) => (
    <Box
        position="relative"
        py={{ base: 14, md: 20 }}
        bgImage={`url(${bgImage})`}
        bgSize="cover"
        bgPosition="center"
        bgAttachment="fixed"
        _before={{
            content: '""',
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            bg: 'rgba(0, 0, 0, 0.65)',
        }}
        {...rest}
    >
        <Container maxW="container.xl" position="relative" zIndex={1}>
            {children}
        </Container>
    </Box>
);

const SectionHeading = ({ color = 'gray.800', ...props }) => (
    <Heading
        as="h2"
        size={{ base: 'xl', md: '2xl' }}
        textAlign="center"
        mb={{ base: 8, md: 12 }}
        fontWeight="bold"
        color={color}
        {...props}
    />
);

export default function Home({ tours, reviews }) {
    const { isOpen: isTourModalOpen, onOpen: onOpenTourModal, onClose: onCloseTourModal } = useDisclosure();
    const { isOpen: isReviewModalOpen, onOpen: onOpenReviewModal, onClose: onCloseReviewModal } = useDisclosure();
    const toast = useToast();

    const [selectedTour, setSelectedTour] = useState(null);
    const [selectedReview, setSelectedReview] = useState(null);

    const hotTours = tours.filter(tour => tour.category === 'hot');
    const popularTours = tours.filter(tour => tour.category === 'popular');
    const specialOffers = tours.filter(tour => tour.category === 'special');
    
    const faqItems = [
        { q: 'Как забронировать тур?', a: 'Вы можете выбрать тур через наш онлайн-поиск и оставить заявку. Наш менеджер свяжется с вами в течение 15 минут для подтверждения деталей и обсуждения всех вопросов. Также вы всегда можете позвонить нам или прийти в офис.' },
        { q: 'Какие способы оплаты вы принимаете?', a: 'Мы предлагаем несколько удобных способов: оплата банковской картой онлайн через защищенную систему, оплата по QR-коду через ЕРИП, а также наличными или картой у нас в офисе. Возможна покупка тура в рассрочку.' },
        { q: 'Какие документы нужны для поездки?', a: 'Стандартный пакет включает действующий паспорт и медицинскую страховку. Для некоторых стран требуется виза. Мы предоставим полный список документов и поможем с оформлением визы.' },
    ];

    const handleTourInquiry = (tour) => {
        setSelectedTour(tour);
        onOpenTourModal();
    };

    const handleReadMoreReview = (review) => {
        setSelectedReview(review);
        onOpenReviewModal();
    };
    
    const handleOpenAddReviewModal = () => {
        setSelectedReview(null);
        onOpenReviewModal();
    };

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
    
    const sectionPadding = { base: 14, md: 20 };

    return (
        <>
            <Head>
                <title>Happy Tour - Ваш идеальный отпуск начинается здесь!</title>
                <meta name="description" content="Подбираем идеальные туры по всему миру. Горящие туры, популярные направления, выгодные предложения. Ваше путешествие мечты ждет!" />
            </Head>

            <Hero onSearchClick={() => document.getElementById('tourvisor')?.scrollIntoView({ behavior: 'smooth' })} />

            <SectionWrapper id="tourvisor" bgImage="/img/search-tours-map.webp">
                <SectionHeading color="white">Подбор тура онлайн</SectionHeading>
                <Text textAlign="center" mb={10} maxW="container.md" mx="auto" color="gray.200">
                    Воспользуйтесь нашим удобным поиском для быстрого подбора тура вашей мечты.
                </Text>
                <TourvisorWidget />
            </SectionWrapper>

            <SectionWrapper id="hot-tours" bgImage="/img/tours-lagoon-bungalows.webp">
                <SectionHeading color="white">Горящие туры</SectionHeading>
                <UniversalCarousel
                    items={hotTours}
                    renderItem={(item) => <TourCard tour={item} onTourInquiry={handleTourInquiry} />}
                />
            </SectionWrapper>
            
            <Box as="section" id="popular-destinations" py={sectionPadding}>
                <Container maxW="container.xl">
                    <SectionHeading>Популярные направления</SectionHeading>
                    <UniversalCarousel
                        items={popularTours}
                        renderItem={(item) => <TourCard tour={item} onTourInquiry={handleTourInquiry} />}
                    />
                </Container>
            </Box>

            <SectionWrapper id="special-offers" bgImage="/img/reviews-happy-couple.webp">
                <SectionHeading color="white">Выгодные предложения</SectionHeading>
                <UniversalCarousel
                    items={specialOffers}
                    renderItem={(item) => <TourCard tour={item} onTourInquiry={handleTourInquiry} />}
                />
            </SectionWrapper>

            <Box as="section" id="reviews" py={sectionPadding}>
                <Container maxW="container.xl">
                    <SectionHeading>Отзывы наших клиентов</SectionHeading>
                     <UniversalCarousel
                        items={reviews}
                        renderItem={(item) => <ReviewCard review={item} onReadMore={handleReadMoreReview} />}
                    />
                    <Box textAlign="center" mt={10}>
                        <Button onClick={handleOpenAddReviewModal} size="lg">
                            Оставить отзыв
                        </Button>
                    </Box>
                </Container>
            </Box>

            <SectionWrapper id="faq" bgImage="/img/faq-clouds-minimal.webp">
                <SectionHeading color="white">Частые вопросы</SectionHeading>
                <FAQ items={faqItems} />
            </SectionWrapper>

            <ContactSection id="contact-section" onFormSubmit={showNotification} />

            <Modal isOpen={isTourModalOpen} onClose={onCloseTourModal} size="xl" isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Заявка на тур</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        {selectedTour && (
                             <ContactForm
                                tour={selectedTour}
                                onFormSubmit={(options) => {
                                    showNotification(options);
                                    if (options.type === 'success') onCloseTourModal();
                                }}
                                onClose={onCloseTourModal}
                            />
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>

            <Modal isOpen={isReviewModalOpen} onClose={onCloseReviewModal} size="xl" isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{selectedReview ? `Отзыв от ${selectedReview.author}` : "Оставить свой отзыв"}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        {selectedReview ? (
                            <Box>
                                <Text fontStyle="italic" mb={4}>"{selectedReview.text}"</Text>
                                <Text fontWeight="bold" textAlign="right">- {selectedReview.author}</Text>
                                <Text fontSize="sm" textAlign="right" color="gray.500">
                                    {new Date(selectedReview.date).toLocaleDateString('ru-RU')}
                                </Text>
                            </Box>
                        ) : (
                            <ReviewForm
                                onClose={onCloseReviewModal}
                                onReviewSubmitted={(options) => {
                                    showNotification(options);
                                    if (options.type === 'success') {
                                        onCloseReviewModal();
                                    }
                                }}
                            />
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
}

export async function getServerSideProps() {
    try {
        const tours = await prisma.tour.findMany({
            where: { published: true },
            orderBy: { createdAt: 'desc' },
        });

        const reviews = await prisma.review.findMany({
            where: { status: 'published' },
            orderBy: { date: 'desc' },
        });

        const serializedTours = tours.map(tour => ({
            ...tour,
            createdAt: tour.createdAt.toISOString(),
            updatedAt: tour.updatedAt.toISOString(),
        }));
        const serializedReviews = reviews.map(review => ({
            ...review,
            date: review.date.toISOString(),
            updatedAt: review.updatedAt.toISOString(),
        }));

        return {
            props: {
                tours: serializedTours,
                reviews: serializedReviews,
            },
        };
    } catch (error) {
        console.error("Ошибка в getServerSideProps:", error);
        return {
            props: {
                tours: [],
                reviews: [],
            },
        };
    }
}
