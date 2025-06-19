// /pages/index.js

import fs from 'fs';
import path from 'path';
import Head from 'next/head';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';

// Компоненты
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import Carousel from '../components/Carousel';
import ContactForm from '../components/ContactForm';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaTelegramPlane, FaViber, FaWhatsapp, FaInstagram } from 'react-icons/fa';
import styles from '../styles/Home.module.css';

// Динамический импорт для оптимизации
const AnimateOnScroll = dynamic(() => import('../components/AnimateOnScroll'), { ssr: false });
const FAQ = dynamic(() => import('../components/FAQ'), { ssr: false });
const Modal = dynamic(() => import('../components/Modal'), { ssr: false });
const ReviewForm = dynamic(() => import('../components/ReviewForm'), { ssr: false });
const TourvisorWidget = dynamic(() => import('../components/TourvisorWidget'), { ssr: false });
const Notification = dynamic(() => import('../components/Notification'), { ssr: false });

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
    }
];

export async function getStaticProps() {
    const toursFilePath = path.join(process.cwd(), 'public', 'data', 'data.json');
    const toursJsonData = fs.readFileSync(toursFilePath);
    const toursData = JSON.parse(toursJsonData);
    return { props: { toursData }, revalidate: 60 };
}

const fetcher = url => fetch(url).then(res => res.json());

export default function Home({ toursData }) {
    const { data: reviews, mutate: mutateReviews } = useSWR('/api/reviews', fetcher);

    const [isReviewFormModalOpen, setReviewFormModalOpen] = useState(false);
    const [isFullReviewModalOpen, setFullReviewModalOpen] = useState(false);
    const [isTourModalOpen, setTourModalOpen] = useState(false);

    const [selectedReview, setSelectedReview] = useState(null);
    const [selectedTour, setSelectedTour] = useState(null);

    const [notification, setNotification] = useState({ show: false, type: 'success', message: '' });

    const handleShowNotification = ({ type, message }) => {
        setNotification({ show: true, type, message });
    };

    const handleReviewSubmitted = () => {
        setReviewFormModalOpen(false); // Закрываем форму отзыва
        mutateReviews(); // Обновляем список отзывов
    };

    const handleTourInquiry = (tour) => {
        setSelectedTour(tour);
        setTourModalOpen(true);
    };

    const handleReadMoreReview = (review) => {
        setSelectedReview(review);
        setFullReviewModalOpen(true);
    };

    return (
        <Layout>
            <Head>
                <title>Happy Tour | Туры по всему миру. Ваш идеальный отдых</title>
                <meta name="description" content="Подбираем туры мечты по всему миру. Горящие предложения, популярные направления и индивидуальный подход. Начните свое путешествие с Happy Tour!" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Hero onSearchClick={() => document.getElementById('tourvisor').scrollIntoView({ behavior: 'smooth' })} />

            <main>
                <section id="tourvisor" className={styles.tourvisor_section}>
                    <div className="container">
                         <h2 className="section-title">Найдите свой идеальный тур</h2>
                         <TourvisorWidget />
                    </div>
                </section>

                <div className={styles.tours_section_wrapper}>
                    <AnimateOnScroll>
                        <section id="hot-tours" className={styles.tours_section}>
                            <div className="container">
                                <h2 className="section-title">Горящие туры. Успейте поймать!</h2>
                                <Carousel tours={toursData.hot} onTourInquiry={handleTourInquiry} />
                            </div>
                        </section>
                    </AnimateOnScroll>

                    <AnimateOnScroll>
                        <section id="popular-tours" className={styles.tours_section}>
                            <div className="container">
                                <h2 className="section-title">Самые популярные направления</h2>
                                <Carousel tours={toursData.popular} onTourInquiry={handleTourInquiry} />
                            </div>
                        </section>
                    </AnimateOnScroll>

                    <AnimateOnScroll>
                        <section id="special-offers" className={styles.tours_section}>
                            <div className="container">
                                <h2 className="section-title">Наши эксклюзивные предложения</h2>
                                <Carousel tours={toursData.special} onTourInquiry={handleTourInquiry} />
                            </div>
                        </section>
                    </AnimateOnScroll>
                </div>

                <AnimateOnScroll>
                    <section id="faq" className={`${styles.faq_section} ${styles.light_bg}`}>
                        <div className="container">
                            <h2 className="section-title">Отвечаем на важные вопросы</h2>
                            <FAQ items={faqItems} />
                        </div>
                    </section>
                </AnimateOnScroll>

                <AnimateOnScroll>
                    <section id="reviews" className={styles.reviews_section}>
                        <div className="container">
                             <h2 className="section-title">Что о нас говорят путешественники</h2>
                             <Carousel
                                 reviews={reviews}
                                 isReviewCarousel={true}
                                 onReadMore={handleReadMoreReview}
                             />
                             <div className={styles.add_review_btn_container}>
                                 <button onClick={() => setReviewFormModalOpen(true)} className="btn btn-primary">Поделиться впечатлениями</button>
                             </div>
                        </div>
                    </section>
                </AnimateOnScroll>

                <AnimateOnScroll>
                    <section id="contacts" className={`${styles.contacts_section} ${styles.light_bg}`}>
                        <div className="container">
                            <h2 className="section-title">Свяжитесь с нами</h2>
                            <div className={styles.contacts_grid}>
                                <div className={styles.contacts_info}>
                                    <h3 className={styles.contacts_subtitle}>Мы всегда на связи</h3>
                                    <p className={styles.contact_item}><FaMapMarkerAlt /> г. Минск, ул. Немига, дом 40, 1 этаж</p>
                                    <p className={styles.contact_item}><FaMapMarkerAlt /> г. Речица, ул. Советская, дом 80, 1 этаж</p>
                                    <p className={styles.contact_item}><FaPhoneAlt /> <a href="tel:+375447886761">+375 (44) 788-67-61</a></p>
                                    <p className={styles.contact_item}><FaPhoneAlt /> <a href="tel:+375445615142">+375 (44) 561-51-42</a></p>
                                    <p className={styles.contact_item}><FaEnvelope /> <a href="mailto:info@happytour.by">info@happytour.by</a></p>
                                    <p className={styles.contact_item}>ООО «ХэппиТрэвелКлаб»</p>
                                    <p className={styles.contact_item}>УНП 491678156</p>
                                    <div className={styles.social_links}>
                                        {/* Добавлены target="_blank" rel="noopener noreferrer" для открытия в новой вкладке */}
                                        <a href="https://t.me/happytour.by" className={styles.social_link} aria-label="Telegram" target="_blank" rel="noopener noreferrer"><FaTelegramPlane /></a>
                                        <a href="viber://chat?number=+375447886761" className={styles.social_link} aria-label="Viber" target="_blank" rel="noopener noreferrer"><FaViber /></a>
                                        <a href="https://wa.me/375447886761" className={styles.social_link} aria-label="WhatsApp" target="_blank" rel="noopener noreferrer"><FaWhatsapp /></a>
                                        <a href="https://www.instagram.com/happytour.by?igsh=ZHV6b3BjODFqMjZv" className={styles.social_link} aria-label="Instagram" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
                                    </div>
                                    <div className={styles.contact_hours}>
                                        <h4>Режим работы:</h4>
                                        <p>Пн-Пт: 10:00-19:00</p>
                                        <p>Сб: 10:00-16:00</p>
                                        <p>Вс: Выходной</p>
                                    </div>
                                </div>
                                <div className={styles.contacts_form}>
                                    <h3 className={styles.contacts_subtitle}>Оставьте заявку онлайн</h3>
                                    <ContactForm onFormSubmit={handleShowNotification} />
                                </div>
                            </div>
                        </div>
                    </section>
                </AnimateOnScroll>

                <Modal isOpen={isReviewFormModalOpen} onClose={() => setReviewFormModalOpen(false)}>
                    <ReviewForm
                        onClose={() => setReviewFormModalOpen(false)}
                        onReviewSubmitted={handleReviewSubmitted}
                        onFormSubmit={handleShowNotification}
                    />
                </Modal>

                <Modal isOpen={isFullReviewModalOpen} onClose={() => setFullReviewModalOpen(false)}>
                    {selectedReview && (
                        <div style={{padding: '20px', textAlign: 'left'}}>
                            <p style={{fontStyle: 'italic', lineHeight: 1.7}}>{selectedReview.text}</p>
                            <p style={{fontWeight: 'bold', textAlign: 'right', marginTop: '20px'}}>- {selectedReview.author}</p>
                        </div>
                    )}
                </Modal>

                <Modal isOpen={isTourModalOpen} onClose={() => setTourModalOpen(false)}>
                    {selectedTour && (
                        <>
                            <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Заявка на тур: {selectedTour.title}</h3>
                            <ContactForm
                                onClose={() => setTourModalOpen(false)}
                                initialMessage={`Здравствуйте! Меня интересует тур "${selectedTour.title}". Пожалуйста, свяжитесь со мной для уточнения деталей.`}
                                onFormSubmit={handleShowNotification}
                            />
                        </>
                    )}
                </Modal>

                <Modal isOpen={notification.show} onClose={() => setNotification({ ...notification, show: false })}>
                    <Notification
                        type={notification.type}
                        message={notification.message}
                        onClose={() => setNotification({ ...notification, show: false })}
                    />
                </Modal>
            </main>
        </Layout>
    );
}
