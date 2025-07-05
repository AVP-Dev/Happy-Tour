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
    
    // ИЗМЕНЕНИЕ: Обновлен и дополнен список вопросов и ответов
    const faqItems = [
        { 
            q: "Какие документы мне понадобятся?", 
            a: "Все просто: вам нужен действующий загранпаспорт. Авиабилеты, ваучер на отель и страховку мы оформим и предоставим вам. Если для выбранной страны нужна виза — мы подробно проконсультируем и поможем с ее оформлением. С нами вы не забудете ни одной важной бумаги!" 
        },
        { 
            q: "Страховка уже в цене? Я защищен?", 
            a: "Безусловно! Базовая медицинская страховка, покрывающая неотложные случаи, уже включена в каждый наш тур. Если вы хотите чувствовать себя еще увереннее — например, планируете активный отдых — мы предложим расширенные варианты страховки." 
        },
        { 
            q: "Что такое 'горящий тур' и в чем подвох?", 
            a: "Никакого подвоха! 'Горящий тур' — это прекрасная возможность отдохнуть по очень выгодной цене. Туроператоры снижают стоимость на туры с вылетом в ближайшие дни, чтобы гарантированно заполнить места. Это тот же качественный отдых, но со скидкой за вашу спонтанность." 
        },
        { 
            q: "Что делать, если мои планы изменятся?", 
            a: "Мы понимаем, что жизнь непредсказуема. Условия отмены или переноса тура зависят от правил авиакомпании и отеля. Мы всегда подбираем максимально гибкие варианты и честно рассказываем обо всех условиях. Для полного спокойствия рекомендуем оформить страховку от невыезда." 
        },
        { 
            q: "Как не ошибиться с выбором отеля?", 
            a: "Доверьтесь нам! Мы знаем отели не по картинкам, а по реальным отзывам наших туристов. Расскажите, чего вы ждете от отдыха, и мы подберем идеальный вариант: тихий отель для двоих, веселый — для всей семьи или с лучшим пляжем на побережье. Ваш комфорт — наш главный приоритет." 
        },
        { 
            q: "Почему иногда просят доплатить 'топливный сбор'?", 
            a: "Это редкая, но возможная ситуация. Топливный сбор — это плата авиакомпании за изменение цен на авиатопливо. Мы всегда стараемся включать все сборы в итоговую стоимость, но если авиакомпания вводит его после бронирования, мы честно и прозрачно информируем вас об этом." 
        },
        {
            q: "Нужно ли мне платить за подбор тура?",
            a: "Нет, наши услуги по подбору тура и консультации абсолютно бесплатны. Вы платите только за сам тур по цене туроператора, без каких-либо скрытых комиссий. Наша работа — найти для вас лучший вариант, а нашу комиссию нам платит туроператор."
        }
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

            <Box as="section" id="tourvisor" py={sectionPadding}>
                <Container maxW="container.xl">
                    <SectionHeading>Подбор тура онлайн</SectionHeading>
                    <TourvisorWidget />
                </Container>
            </Box>

            <Box as="section" id="hot-tours" py={sectionPadding}>
                 <Container maxW="container.xl">
                    <SectionHeading>Горящие туры</SectionHeading>
                    <UniversalCarousel
                        items={hotTours}
                        renderItem={(item, index) => <TourCard tour={item} onTourInquiry={handleTourInquiry} index={index} />}
                    />
                </Container>
            </Box>
            
            <Box as="section" id="popular-destinations" py={sectionPadding}>
                <Container maxW="container.xl">
                    <SectionHeading>Популярные направления</SectionHeading>
                    <UniversalCarousel
                        items={popularTours}
                        renderItem={(item, index) => <TourCard tour={item} onTourInquiry={handleTourInquiry} index={index} />}
                    />
                </Container>
            </Box>

            <Box as="section" id="special-offers" py={sectionPadding}>
                <Container maxW="container.xl">
                    <SectionHeading>Выгодные предложения</SectionHeading>
                    <UniversalCarousel
                        items={specialOffers}
                        renderItem={(item, index) => <TourCard tour={item} onTourInquiry={handleTourInquiry} index={index} />}
                    />
                </Container>
            </Box>

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

export async function getStaticProps() {
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
            ...(review.createdAt && { createdAt: review.createdAt.toISOString() }),
            updatedAt: review.updatedAt.toISOString(),
        }));

        return {
            props: {
                tours: serializedTours,
                reviews: serializedReviews,
            },
            revalidate: 600,
        };
    } catch (error) {
        console.error("Ошибка в getStaticProps:", error);
        return {
            props: {
                tours: [],
                reviews: [],
            },
        };
    }
}
