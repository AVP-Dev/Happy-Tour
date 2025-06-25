// components/ContactSection.js
import AnimateOnScroll from './AnimateOnScroll';
import ContactForm from './ContactForm';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import styles from '../styles/Home.module.css';

const ContactSection = ({ onFormSubmit }) => {
    return (
        // --- PERFORMANCE FIX: reCAPTCHA provider wraps only this section ---
        <GoogleReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}>
            <AnimateOnScroll>
                <section id="page_contacts" className={`${styles.contacts_section} section-padding light-bg`}>
                    <div className="container">
                        <h2 className="section-title">Свяжитесь с нами</h2>
                        <div className={styles.contacts_grid}>
                            <div className={styles.contacts_info}>
                                <h3>Мы всегда на связи</h3>
                                <p className={styles.contact_item}>
                                    <FaMapMarkerAlt />
                                    <span>г. Минск, ул. Немига, дом 40, 1 этаж</span>
                                </p>
                                <p className={styles.contact_item}>
                                    <FaMapMarkerAlt />
                                    <span>г. Речица, ул. Советская, дом 80, 1 этаж</span>
                                </p>
                                <p className={styles.contact_item}>
                                    <FaPhoneAlt />
                                    <a href="tel:+375447886761">+375 (44) 788-67-61</a>
                                </p>
                                <p className={styles.contact_item}>
                                    <FaPhoneAlt />
                                    <a href="tel:+375445615142">+375 (44) 561-51-42</a>
                                </p>
                                <p className={styles.contact_item}>
                                    <FaEnvelope />
                                    <a href="mailto:info@happytour.by">info@happytour.by</a>
                                </p>
                                <div className={styles.contact_hours}>
                                    <h4>Режим работы:</h4>
                                    <p>Пн-Пт: 10:00-19:00</p>
                                    <p>Сб: 10:00-16:00, Вс: Выходной</p>
                                </div>
                            </div>
                            <div className={styles.contacts_form}>
                                <h3>Оставьте заявку онлайн</h3>
                                <ContactForm onFormSubmit={onFormSubmit} />
                            </div>
                        </div>
                    </div>
                </section>
            </AnimateOnScroll>
        </GoogleReCaptchaProvider>
    );
};

export default ContactSection;
