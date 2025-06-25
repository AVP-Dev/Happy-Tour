// pages/index.js
import { useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import useSWR from 'swr';

// Импортируем нашу инициализацию Firebase
import { db } from '../lib/firebase';
// Добавлены query, where, orderBy для фильтрации и сортировки туров
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";

// Основные компоненты
// Layout больше не импортируется здесь, так как он применяется в _app.js
import Hero from '../components/Hero';
import ContactSection from '../components/ContactSection';
import styles from '../styles/Home.module.css';

// Динамически импортируемые компоненты для производительности
const Carousel = dynamic(() => import('../components/Carousel'), { ssr: false });
const FAQ = dynamic(() => import('../components/FAQ'), { ssr: false });
const TourvisorWidget = dynamic(() => import('../components/TourvisorWidget'), { ssr: false });
const Modal = dynamic(() => import('../components/Modal'));
const Notification = dynamic(() => import('../components/Notification'));
const AnimateOnScroll = dynamic(() => import('../components/AnimateOnScroll'), { ssr: false });
const ReviewForm = dynamic(() => import('../components/ReviewForm'), { ssr: false });
const ContactForm = dynamic(() => import('../components/ContactForm'));


const fetcher = url => fetch(url).then(res => res.json());

// Расширенные и улучшенные FAQ (без изменений)
const faqItems = [
    {
        q: "Какие документы мне понадобятся для поездки?",
        a: "Все просто: вам нужен действующий загранпаспорт. Авиабилеты, ваучер на отель и страховку мы оформим и предоставим вам. Если для выбранной страны нужна виза — мы подробно проконсультируем и поможем с ее оформлением. С нами вы не забудете ни одной важной бумаги!"
    },
    {
        q: "Страховка уже включена в стоимость тура?",
        a: "Безусловно! Базовая медицинская страховка, покрывающая неотложные случаи, уже включена в каждый наш тур. Если вы хотите чувствовать себя еще увереннее — например, планируете активный отдых — мы предложим расширенные варианты страховки от невыезда и других рисков."
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

export default function Home({ tours }) {
    // Пока оставляем загрузку отзывов через useSWR.
    // На следующем шаге мы обновим API-роут /api/reviews, чтобы он брал данные из Firestore.
    const { data: reviews, mutate: mutateReviews } = useSWR('/api/reviews', fetcher);

    const [modalState, setModalState] = useState({ isOpen: false, title: '', component: null });

    const openModal = (title, component) => setModalState({ isOpen: true, title, component });
    const closeModal = () => setModalState({ isOpen: false, title: '', component: null });

    const showNotification = ({ type, message }) => {
        openModal('', <Notification type={type} message={message} onClose={closeModal} />);
    };

    const handleTourInquiry = (tour) => {
        openModal(
            `Запрос по туру: ${tour.title}`,
            <ContactForm
                onFormSubmit={showNotification}
                onClose={closeModal}
                initialMessage={`Здравствуйте! Меня интересует тур "${tour.title}".`}
            />
        );
    };

    const handleReviewReadMore = (review) => {
        openModal(
            `Отзыв от ${review.author}`,
            <div style={{ padding: '20px', lineHeight: '1.7', textAlign: 'left' }}>
                <p>"{review.text}"</p>
            </div>
        );
    };

    const handleAddReview = () => {
        openModal(
            'Оставить отзыв',
            <ReviewForm
                onClose={closeModal}
                onReviewSubmitted={() => {
                    mutateReviews();
                    closeModal();
                }}
                onFormSubmit={showNotification}
            />
        );
    };

    const scrollToTourvisor = () => {
        document.getElementById('tourvisor')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        // Используем React.Fragment (<>) как корневой элемент.
        // Layout теперь оборачивает компонент Home в _app.js.
        <>
            <Head>
                <title>Happy Tour - Незабываемые путешествия по всему миру</title>
                <meta name="description" content="Подбор и продажа туров по популярным направлениям. Горящие туры, выгодные предложения и индивидуальный подход от Happy Tour." />
            </Head>

            <Hero onSearchClick={scrollToTourvisor} />

            <main>
                <AnimateOnScroll>
                    <section id="tourvisor" className={styles.tourvisor_section}>
                        <div className="container">
                            <h2 className="section-title">Подбор тура онлайн</h2>
                            <TourvisorWidget />
                        </div>
                    </section>
                </AnimateOnScroll>

                <div className={styles.tours_section_wrapper}>
                    <AnimateOnScroll>
                        <section id="hot-tours" className={styles.tours_section}>
                            <div className="container">
                                <h2 className="section-title">Горящие туры</h2>
                                <Carousel tours={tours.hot} onTourInquiry={handleTourInquiry} />
                            </div>
                        </section>
                    </AnimateOnScroll>

                    <AnimateOnScroll>
                        <section className={styles.tours_section}>
                            <div className="container">
                                <h2 className="section-title">Популярные направления</h2>
                                <Carousel tours={tours.popular} onTourInquiry={handleTourInquiry} />
                            </div>
                        </section>
                    </AnimateOnScroll>

                    <AnimateOnScroll>
                        <section className={styles.tours_section}>
                            <div className="container">
                                <h2 className="section-title">Выгодные предложения</h2>
                                <Carousel tours={tours.special} onTourInquiry={handleTourInquiry} />
                            </div>
                        </section>
                    </AnimateOnScroll>
                </div>

                <AnimateOnScroll>
                    <section id="reviews" className={styles.reviews_section}>
                        <div className="container">
                            <h2 className="section-title">Отзывы наших туристов</h2>
                            <Carousel reviews={reviews} isReviewCarousel={true} onReadMore={handleReviewReadMore} />
                            <div className={styles.add_review_btn_container}>
                               <button onClick={handleAddReview} className="btn btn-primary">Поделиться впечатлениями</button>
                            </div>
                        </div>
                    </section>
                </AnimateOnScroll>

                <AnimateOnScroll>
                    <section id="faq" className={styles.faq_section}>
                        <div className="container">
                            <h2 className="section-title">Отвечаем на важные вопросы</h2>
                            <FAQ items={faqItems} />
                        </div>
                    </section>
                </AnimateOnScroll>
                
                <ContactSection onFormSubmit={showNotification} />

                <Modal isOpen={modalState.isOpen} onClose={closeModal} title={modalState.title}>
                    {modalState.component}
                </Modal>
            </main>
        </>
    );
}

// ЭТО ГЛАВНОЕ ИЗМЕНЕНИЕ: Получение данных туров из Firestore и их сериализация
export async function getStaticProps() {
    try {
        const toursCollectionRef = collection(db, "tours");
        
        // Запросы для получения туров по категориям, отсортированные по дате
        const hotToursQuery = query(toursCollectionRef, where("category", "==", "hot"), orderBy("date", "desc"));
        const popularToursQuery = query(toursCollectionRef, where("category", "==", "popular"), orderBy("date", "desc"));
        const specialToursQuery = query(toursCollectionRef, where("category", "==", "special"), orderBy("date", "desc"));

        // Выполняем все запросы параллельно
        const [hotSnapshot, popularSnapshot, specialSnapshot] = await Promise.all([
            getDocs(hotToursQuery),
            getDocs(popularToursQuery),
            getDocs(specialToursQuery),
        ]);

        // Вспомогательная функция для преобразования Firestore Timestamp в JSON-сериализуемые строки
        const serializeTours = (snapshot) => {
            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    // Преобразуем объекты Timestamp в строки ISO
                    // Убедитесь, что 'createdAt' (или любое другое поле с датой) существует
                    createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
                    date: data.date ? data.date.toDate().toISOString() : null, // Пример для поля 'date'
                };
            });
        };

        // Сериализуем и фильтруем туры по категориям
        const tours = {
            hot: serializeTours(hotSnapshot),
            popular: serializeTours(popularSnapshot),
            special: serializeTours(specialSnapshot),
        };
        
        return {
            props: { tours: tours },
            revalidate: 60, // Включаем регенерацию страницы каждые 60 секунд для обновления данных
        };

    } catch (error) {
        // Обработка ошибок, если не удалось подключиться к базе или получить данные
        console.error("Firebase fetch error in getStaticProps for tours:", error);
        return {
            props: { 
                tours: { hot: [], popular: [], special: [] } // Возвращаем пустые массивы в случае ошибки
            },
        };
    }
}
