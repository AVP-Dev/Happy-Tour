// lib/analytics.js

/**
 * Отправляет событие в Google Analytics (GA4).
 * @param {string} eventName Название события (например, 'button_click', 'form_submit').
 * @param {object} eventParams Параметры события (например, { category: 'engagement', label: 'hero_search_button' }).
 */
export const trackGAEvent = (eventName, eventParams = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
    console.log(`GA Event Fired: ${eventName}`, eventParams); // Для отладки
  }
};

/**
 * Отправляет событие в Yandex Metrica.
 * @param {string} eventName Название цели (например, 'search_tour_click', 'contact_form_submit').
 * @param {object} eventParams Параметры события (опционально).
 */
export const trackYMGoal = (eventName, eventParams = {}) => {
  if (typeof window !== 'undefined' && window.ym && process.env.NEXT_PUBLIC_YM_TRACKING_ID) {
    window.ym(process.env.NEXT_PUBLIC_YM_TRACKING_ID, 'reachGoal', eventName, eventParams);
    console.log(`YM Goal Reached: ${eventName}`, eventParams); // Для отладки
  }
};
