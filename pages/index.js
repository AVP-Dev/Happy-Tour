// pages/index.js
import React, { useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import prisma from '../lib/prisma';

import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    useToast,
    Button,
    Box,
    Text,
    Heading,
    Container
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

const SectionHeading = (props) => (
    <Heading
        as="h2"
        size={{ base: 'xl', md: '2xl' }}
        textAlign="center"
        mb={{ base: 8, md: 12 }}
        fontWeight="bold"
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
        { q: 'Что включено в стоимость тура?', a: 'Обычно в пакетный тур входит авиаперелет, проживание в отеле, трансфер (аэропорт-отель-аэропорт) и медицинская страховка. Тип питания и дополнительные услуги зависят от конкретного предложения.' },
        { q: 'Можно ли отменить или изменить бронирование?', a: 'Да, это возможно. Условия отмены или внесения изменений зависят от правил туроператора и авиакомпании. Рекомендуем уточнять эти детали у менеджера при бронировании.' },
        { q: 'Что делать, если возникли проблемы во время отдыха?', a: 'В ваших документах будут указаны все необходимые контакты: телефон вашего гида, представителя туроператора и круглосуточной службы поддержки. Мы всегда на связи и готовы помочь 24/7.' }
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

            <Box as="section" id="tourvisor" py={sectionPadding} bg="gray.50">
                <Container maxW="container.xl">
                    <SectionHeading>Подбор тура онлайн</SectionHeading>
                    <Text textAlign="center" mb={10} maxW="container.md" mx="auto">
                        Воспользуйтесь нашим удобным поиском для быстрого подбора тура вашей мечты.
                    </Text>
                    <TourvisorWidget />
                </Container>
            </Box>

            <Box as="section" id="hot-tours" py={sectionPadding}>
                <Container maxW="container.xl">
                    <SectionHeading>Горящие туры</SectionHeading>
                    <UniversalCarousel
                        items={hotTours}
                        renderItem={(item) => <TourCard tour={item} onTourInquiry={handleTourInquiry} />}
                    />
                </Container>
            </Box>

            <Box as="section" id="popular-destinations" py={sectionPadding} bg="gray.50">
                <Container maxW="container.xl">
                    <SectionHeading>Популярные направления</SectionHeading>
                    <UniversalCarousel
                        items={popularTours}
                        renderItem={(item) => <TourCard tour={item} onTourInquiry={handleTourInquiry} />}
                    />
                </Container>
            </Box>

            <Box as="section" id="special-offers" py={sectionPadding}>
                <Container maxW="container.xl">
                    <SectionHeading>Выгодные предложения</SectionHeading>
                    <UniversalCarousel
                        items={specialOffers}
                        renderItem={(item) => <TourCard tour={item} onTourInquiry={handleTourInquiry} />}
                    />
                </Container>
            </Box>

            <Box as="section" id="reviews" py={sectionPadding} bg="gray.50">
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

            <Box as="section" id="faq" py={sectionPadding}>
                <Container maxW="container.xl">
                    <SectionHeading>Частые вопросы</SectionHeading>
                    <FAQ items={faqItems} />
                </Container>
            </Box>

            <ContactSection id="contact-section" onFormSubmit={showNotification} />

            <Modal isOpen={isTourModalOpen} onClose={onCloseTourModal} size="xl" isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Заявка на тур</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
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
