import { useEffect } from 'react';

const TourvisorWidget = () => {
    useEffect(() => {
        // Эта функция будет выполнена только один раз после того, как компонент отобразится в браузере.

        // Проверяем, не был ли скрипт уже загружен ранее
        if (document.getElementById('tourvisor-script')) {
            return;
        }

        // Устанавливаем опции виджета в глобальный объект window, как того требует скрипт Tourvisor
        // ВАЖНО: 'owner' должен быть вашим ID партнера. 'widget' обновлен до предоставленного вами ID.
        window.tv_module_options = {
            owner: '26693', // Пожалуйста, убедитесь, что это ваш реальный ID партнера
            widget: '9971464'  // Обновлен до ID, предоставленного вами
        };

        // Создаем тег <script> программно
        const script = document.createElement('script');
        script.id = 'tourvisor-script';
        script.type = 'text/javascript';
        script.async = true;
        script.src = '//tourvisor.ru/module/init.js';

        // Добавляем скрипт в конец <body>, чтобы он загрузился последним и не блокировал страницу
        document.body.appendChild(script);

        // Функция очистки, которая сработает, если компонент будет удален со страницы
        return () => {
            const existingScript = document.getElementById('tourvisor-script');
            if (existingScript && existingScript.parentNode) {
                // В некоторых случаях удаление скрипта может вызвать проблемы,
                // поэтому эту строку можно закомментировать, если что-то пойдет не так.
                // existingScript.parentNode.removeChild(existingScript);
            }
        };
    }, []); // Пустой массив зависимостей гарантирует, что эффект выполнится только один раз

    return (
        // Возвращаем div с ID и классами, которые ожидает Tourvisor для встраивания своего виджета.
        // ID соответствует 'widget' опции.
        <div id="tv-moduleid-9971464" className="tv-search-form tv-moduleid-9971464"></div>
    );
};

export default TourvisorWidget;
