import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

const Analytics = () => {
    const location = useLocation();

    useEffect(() => {
        // Initialize GA4 only once
        const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

        if (gaMeasurementId) {
            if (!window.gaInitialized) {
                ReactGA.initialize(gaMeasurementId);
                window.gaInitialized = true;
            }

            // Send pageview with a custom path
            ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
        } else {
            console.warn('Google Analytics Measurement ID not found (VITE_GA_MEASUREMENT_ID)');
        }
    }, [location]);

    return null;
};

export default Analytics;
