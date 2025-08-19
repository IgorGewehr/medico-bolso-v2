import { useEffect } from 'react';

declare global {
    interface Window {
        fbq: any;
        gtag: any;
        dataLayer: any[];
    }
}

interface AnalyticsProps {
    facebookPixelId?: string;
    googleAnalyticsId?: string;
    googleAdsId?: string;
}

const Analytics: React.FC<AnalyticsProps> = ({
    facebookPixelId = '1033180232110037',
    googleAnalyticsId = 'GA_MEASUREMENT_ID',
    googleAdsId = 'AW-17010595542'
}) => {
    useEffect(() => {
        // Initialize Facebook Pixel
        if (facebookPixelId && typeof window !== 'undefined') {
            const fbScript = document.createElement('script');
            fbScript.innerHTML = `
                !function(f,b,e,v,n,t,s){
                    if(f.fbq) return;
                    n=f.fbq=function(){n.callMethod?
                        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                    if(!f._fbq) f._fbq=n;
                    n.push=n; n.loaded=!0; n.version='2.0'; n.queue=[];
                    t=b.createElement(e); t.async=!0;
                    t.src=v; s=b.getElementsByTagName(e)[0];
                    s.parentNode.insertBefore(t,s)
                }(window, document,'script',
                   'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${facebookPixelId}');
                fbq('track', 'PageView');
            `;
            document.head.appendChild(fbScript);
        }

        // Initialize Google Analytics
        if (googleAnalyticsId && typeof window !== 'undefined') {
            const gaScript = document.createElement('script');
            gaScript.async = true;
            gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`;
            document.head.appendChild(gaScript);

            const gaConfigScript = document.createElement('script');
            gaConfigScript.innerHTML = `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${googleAnalyticsId}');
                ${googleAdsId ? `gtag('config', '${googleAdsId}');` : ''}
            `;
            document.head.appendChild(gaConfigScript);
        }

        // Track initial events after scripts load
        const trackInitialEvents = () => {
            if (typeof window.fbq === 'function') {
                window.fbq('track', 'InitiateCheckout');
                window.fbq('track', 'Lead');
            }

            if (typeof window.gtag === 'function' && googleAdsId) {
                window.gtag('event', 'conversion', {
                    'send_to': `${googleAdsId}/8yPWCPKzsLkaENatpK8_`
                });
            }
        };

        const timer = setTimeout(trackInitialEvents, 1000);
        return () => clearTimeout(timer);
    }, [facebookPixelId, googleAnalyticsId, googleAdsId]);

    return null;
};

// Utility functions for tracking events
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (typeof window !== 'undefined') {
        // Facebook Pixel
        if (typeof window.fbq === 'function') {
            window.fbq('track', eventName, parameters);
        }

        // Google Analytics
        if (typeof window.gtag === 'function') {
            window.gtag('event', eventName, parameters);
        }
    }
};

export const trackPageView = (page: string) => {
    if (typeof window !== 'undefined') {
        // Facebook Pixel
        if (typeof window.fbq === 'function') {
            window.fbq('track', 'PageView');
        }

        // Google Analytics
        if (typeof window.gtag === 'function') {
            window.gtag('config', 'GA_MEASUREMENT_ID', {
                page_path: page,
            });
        }
    }
};

export const trackPurchase = (value: number, currency: string = 'BRL') => {
    trackEvent('Purchase', {
        value,
        currency,
    });
};

export const trackLead = (source?: string) => {
    trackEvent('Lead', {
        source,
    });
};

export default Analytics;