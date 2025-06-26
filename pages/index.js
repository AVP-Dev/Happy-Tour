// pages/index.js
// Это главный публичный маршрут для домашней страницы.

import Head from 'next/head';
import dynamic from 'next/dynamic';
import useSWR from 'swr'; // Для получения данных для каруселей и FAQ (если используются)

// Удален импорт firebase, так как эта страница не использует его напрямую.
// import { db } from '../lib/firebase'; 

// Динамические импорты для секций (для оптимизации загрузки)
const Hero = dynamic(() => import('../components/Hero'));
const Carousel = dynamic(() => import('../components/Carousel'));
const ContactSection = dynamic(() => import('../components/ContactSection'));
const FAQ = dynamic(() => import('../components/FAQ'));
const Modal = dynamic(() => import('../components/Modal'));
const Notification = dynamic(() => import('../components/Notification'));
const TourvisorWidget = dynamic(() => import('../components/TourvisorWidget'), { ssr: false }); // Клиентский виджет

// Вспомогательная функция для получения данных (для SWR)
const fetcher = async (url) => {
    const res = await fetch(url);
    if (!res.ok) {
        const error = new Error('An error occurred while fetching the data.');
        error.info = await res.json();
        error.status = res.status;
        throw error;
    }
    return res.json();
};

export default function Home() {
    // Состояния для модальных окон и уведомлений
    const [isTourModalOpen, setIsTourModalOpen] = useState(false);
    const [selectedTour, setSelectedTour] = useState(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [notification, setNotification] = useState({ isOpen: false, type: 'info', message: '' });

    // Получение данных туров
    // Группируем туры по категориям для каруселей
    const { data: toursData, error: toursError } = useSWR('/api/admin/tours', fetcher);
    const hotTours = toursData?.filter(tour => tour.category === 'hot') || [];
    const popularTours = toursData?.filter(tour => tour.category === 'popular') || [];
    const specialOffers = toursData?.filter(tour => tour.category === 'special') || [];

    // Получение данных отзывов (только опубликованные)
    const { data: reviewsData, error: reviewsError } = useSWR('/api/reviews', fetcher);
    const publishedReviews = reviewsData || [];

    // Данные для секции FAQ
    const faqItems = [
        { q: 'Как выбрать идеальный тур?', a: 'Наши эксперты помогут вам определиться с направлением, бюджетом и активностями, исходя из ваших предпочтений. Мы подберем лучшие предложения со всего мира.' },
        { q: 'Что входит в стоимость тура?', a: 'Обычно в стоимость включены перелет, проживание, трансферы и страховка. Дополнительные услуги, такие как экскурсии, оговариваются отдельно.' },
        { q: 'Можно ли забронировать тур онлайн?', a: 'Да, вы можете оставить заявку на подбор тура прямо на нашем сайте, и мы свяжемся с вами для уточнения деталей и оформления.' },
        { q: 'Какие документы нужны для путешествия?', a: 'В большинстве случаев необходим действующий загранпаспорт. Для некоторых стран может потребоваться виза. Наши менеджеры проконсультируют вас по всем вопросам.' },
        { q: 'Какие способы оплаты доступны?', a: 'Мы принимаем оплату наличными, банковскими картами, а также предоставляем возможность рассрочки. Все детали обсуждаются индивидуально.' },
    ];

    /**
     * Обработчик клика по кнопке "Подобрать тур" в Hero секции.
     * Прокручивает страницу до виджета Tourvisor.
     */
    const handleSearchClick = () => {
        document.getElementById('tourvisor').scrollIntoView({ behavior: 'smooth' });
    };

    /**
     * Обработчик клика "Подробнее" на карточке тура.
     * Открывает модальное окно с деталями тура.
     * @param {object} tour - Объект тура.
     */
    const handleTourInquiry = (tour) => {
        setSelectedTour(tour);
        setIsTourModalOpen(true);
    };

    /**
     * Обработчик клика "Читать далее" на карточке отзыва.
     * Открывает модальное окно с полным текстом отзыва.
     * @param {object} review - Объект отзыва.
     */
    const handleReadMoreReview = (review) => {
        setSelectedReview(review);
        setIsReviewModalOpen(true);
    };

    /**
     * Показывает уведомление.
     * @param {string} message - Текст сообщения.
     * @param {'success' | 'error'} type - Тип уведомления.
     */
    const showNotification = (message, type = 'info') => {
        setNotification({ isOpen: true, message, type });
    };

    /**
     * Закрывает уведомление.
     */
    const closeNotification = () => {
        setNotification(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <>
            <Head>
                <title>Happy Tour - Ваш идеальный отпуск начинается здесь!</title>
                <meta name="description" content="Подбираем идеальные туры по всему миру. Горящие туры, популярные направления, выгодные предложения. Ваше путешествие мечты ждет!" />
            </Head>

            {/* Hero Section */}
            <Hero onSearchClick={handleSearchClick} />

            {/* Tourvisor Widget Section */}
            <section id="tourvisor" className="section-padding light-bg">
                <div className="container">
                    <h2 className="section-title">Подбор тура онлайн</h2>
                    <p style={{textAlign: 'center', marginBottom: '40px', maxWidth: '800px', margin: '0 auto 40px'}}>
                        Воспользуйтесь нашим удобным поиском для быстрого подбора тура вашей мечты.
                    </p>
                    <TourvisorWidget />
                </div>
            </section>

            {/* Hot Tours Section */}
            <section id="hot-tours" className="section-padding">
                <div className="container">
                    <h2 className="section-title">Горящие туры</h2>
                    {toursError && <p style={{textAlign: 'center', color: 'red'}}>Ошибка загрузки туров: {toursError.message}</p>}
                    {!toursData && !toursError && <p style={{textAlign: 'center'}}>Загрузка горящих туров...</p>}
                    <Carousel tours={hotTours} onTourInquiry={handleTourInquiry} />
                </div>
            </section>

            {/* Popular Destinations Section */}
            <section id="popular-destinations" className="section-padding light-bg">
                <div className="container">
                    <h2 className="section-title">Популярные направления</h2>
                    <Carousel tours={popularTours} onTourInquiry={handleTourInquiry} />
                </div>
            </section>

            {/* Special Offers Section */}
            <section id="special-offers" className="section-padding">
                <div className="container">
                    <h2 className="section-title">Выгодные предложения</h2>
                    <Carousel tours={specialOffers} onTourInquiry={handleTourInquiry} />
                </div>
            </section>

            {/* Reviews Section */}
            <section id="reviews" className="section-padding light-bg">
                <div className="container">
                    <h2 className="section-title">Отзывы наших клиентов</h2>
                    {reviewsError && <p style={{textAlign: 'center', color: 'red'}}>Ошибка загрузки отзывов: {reviewsError.message}</p>}
                    {!reviewsData && !reviewsError && <p style={{textAlign: 'center'}}>Загрузка отзывов...</p>}
                    <Carousel reviews={publishedReviews} isReviewCarousel={true} onReadMore={handleReadMoreReview} />
                    
                    <div className={styles.add_review_btn_container}>
                        <button onClick={() => setIsReviewModalOpen(true)} className="btn btn-primary">
                            Оставить отзыв
                        </button>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="section-padding">
                <div className="container">
                    <h2 className="section-title">Популярные вопросы</h2>
                    <FAQ items={faqItems} />
                </div>
            </section>

            {/* Contact Section */}
            <ContactSection onFormSubmit={showNotification} />

            {/* Modals */}
            {/* Модальное окно деталей тура */}
            <Modal isOpen={isTourModalOpen} onClose={() => setIsTourModalOpen(false)} title={selectedTour?.title}>
                {selectedTour && (
                    <div className="tour-details-modal-content">
                        {selectedTour.image_url && 
                            <img src={selectedTour.image_url} alt={selectedTour.title} style={{maxWidth: '100%', height: 'auto', borderRadius: '8px', marginBottom: '1rem'}} />
                        }
                        <p>{selectedTour.description}</p>
                        <p><strong>Цена:</strong> от {selectedTour.price} {selectedTour.currency}</p>
                        <p><strong>Категория:</strong> {selectedTour.category}</p>
                        <button 
                            onClick={() => {
                                setIsTourModalOpen(false);
                                handleSearchClick(); // Прокрутка к виджету Tourvisor
                                showNotification('Ваша заявка на тур отправлена! Скоро свяжемся с вами.', 'success');
                            }} 
                            className="btn btn-primary"
                            style={{marginTop: '1rem'}}
                        >
                            Оставить заявку на этот тур
                        </button>
                    </div>
                )}
            </Modal>

            {/* Модальное окно отзыва */}
            <Modal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} title="Оставить отзыв">
                <ReviewForm 
                    onClose={() => setIsReviewModalOpen(false)} 
                    onReviewSubmitted={() => showNotification('Ваш отзыв успешно отправлен и будет опубликован после модерации.', 'success')} 
                    onFormSubmit={showNotification} // Для отображения уведомлений об ошибках/успехе
                    initialMessage={selectedReview?.text ? `Отзыв на тур: ${selectedTour.title}` : ''}
                />
            </Modal>

            {/* Модальное окно полного отзыва (для "Читать далее") */}
            <Modal isOpen={selectedReview !== null && isReviewModalOpen === false} onClose={() => setSelectedReview(null)} title={selectedReview?.author}>
                {selectedReview && (
                    <div className="review-full-text-modal">
                        <p style={{fontStyle: 'italic', marginBottom: '1rem'}}>"{selectedReview.text}"</p>
                        <p style={{fontWeight: 'bold', textAlign: 'right'}}>- {selectedReview.author}</p>
                        <p style={{fontSize: '0.8rem', textAlign: 'right', color: 'var(--gray-color)'}}>
                            {new Date(selectedReview.date).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                )}
            </Modal>


            {/* Уведомление (всплывающее, не модальное) */}
            <Notification
                isOpen={notification.isOpen}
                message={notification.message}
                type={notification.type}
                onClose={closeNotification}
            />
        </>
    );
}
