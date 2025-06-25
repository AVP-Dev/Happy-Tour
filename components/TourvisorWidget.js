// components/TourvisorWidget.js
import Script from 'next/script';
import React from 'react';

/**
 * Tourvisor widget with optimized script loading.
 * The script now uses `next/script` with the `afterInteractive` strategy
 * to prevent blocking the main thread during initial page load.
 * @version 2.0
 */
const TourvisorWidget = () => {
    return (
        <>
            {/* This div is required by the widget for initialization */}
            <div id={`tv-moduleid-${process.env.NEXT_PUBLIC_TOURVISOR_WIDGET_ID}`} className={`tv-search-form tv-moduleid-${process.env.NEXT_PUBLIC_TOURVISOR_WIDGET_ID}`}></div>
            
            {/* The script itself is loaded ONLY after the page becomes interactive */}
            <Script
                id="tourvisor-script"
                src="//tourvisor.ru/module/init.js"
                strategy="afterInteractive"
                onLoad={() => {
                    // This function executes after the script has loaded.
                    if (typeof window !== 'undefined') {
                        window.tv_module_options = {
                            owner: process.env.NEXT_PUBLIC_TOURVISOR_OWNER_ID,
                            widget: process.env.NEXT_PUBLIC_TOURVISOR_WIDGET_ID
                        };
                        if (window.Tourvisor && typeof window.Tourvisor.init === 'function') {
                            try {
                                window.Tourvisor.init();
                            } catch (e) {
                                console.error("Tourvisor initialization failed:", e);
                            }
                        }
                    }
                }}
                onError={(e) => {
                    console.error('Tourvisor script failed to load', e);
                }}
            />
        </>
    );
};

export default TourvisorWidget;
