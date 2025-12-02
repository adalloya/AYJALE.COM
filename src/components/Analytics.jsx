import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

const Analytics = () => {
    const location = useLocation();

    useEffect(() => {
        // Initialize GA4 only once
        if (!window.gaInitialized) {
            ReactGA.initialize('G-2G0Q10W8W8'); // User provided ID
            window.gaInitialized = true;
        }
    }, []); // Empty dependency array means this runs once on mount

    useEffect(() => {
        // Send pageview with a custom path whenever location changes
        // This assumes GA4 has been initialized by the previous useEffect
        if (window.gaInitialized) {
            ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
        } else {
            // This case should ideally not be hit if initialization is guaranteed on mount
            console.warn('Google Analytics not initialized when attempting to send pageview.');
        }
    }, [location]); // Rerun when location changes

    return null;
};

export default Analytics;
