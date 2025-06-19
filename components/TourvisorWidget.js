// components/TourvisorWidget.js
import { useEffect } from 'react';

const TourvisorWidget = () => {
    useEffect(() => {
        if (document.getElementById('tourvisor-script')) {
            return;
        }

        window.tv_module_options = {
            // Используйте переменные окружения
            owner: process.env.NEXT_PUBLIC_TOURVISOR_OWNER_ID,
            widget: process.env.NEXT_PUBLIC_TOURVISOR_WIDGET_ID
        };

        const script = document.createElement('script');
        script.id = 'tourvisor-script';
        script.type = 'text/javascript';
        script.async = true;
        script.src = '//tourvisor.ru/module/init.js';
        document.body.appendChild(script);

        return () => {
            const existingScript = document.getElementById('tourvisor-script');
            if (existingScript && existingScript.parentNode) {
                // existingScript.parentNode.removeChild(existingScript);
            }
        };
    }, []);

    return (
        <div id={`tv-moduleid-${process.env.NEXT_PUBLIC_TOURVISOR_WIDGET_ID}`} className={`tv-search-form tv-moduleid-${process.env.NEXT_PUBLIC_TOURVISOR_WIDGET_ID}`}></div>
    );
};

export default TourvisorWidget;