import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
    const location = useLocation();
    const isJobsPage = location.pathname === '/jobs';
    const isLandingPage = location.pathname === '/';
    const isFullWidth = isJobsPage || isLandingPage;

    // Structured Data for Google Sitelinks
    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebSite",
                "@id": "https://ayjale.com/#website",
                "url": "https://ayjale.com/",
                "name": "AyJale",
                "description": "La plataforma de reclutamiento y búsqueda de empleo en México.",
                "potentialAction": [
                    {
                        "@type": "SearchAction",
                        "target": {
                            "@type": "EntryPoint",
                            "urlTemplate": "https://ayjale.com/jobs?q={search_term_string}"
                        },
                        "query-input": "required name=search_term_string"
                    }
                ],
                "inLanguage": "es-MX"
            },
            {
                "@type": "Organization",
                "@id": "https://ayjale.com/#organization",
                "name": "AyJale",
                "url": "https://ayjale.com/",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://ayjale.com/assets/logo-icon.png",
                    "width": 512,
                    "height": 512
                },
                "sameAs": [
                    "https://www.facebook.com/ayjalemx",
                    "https://www.instagram.com/ayjalemx",
                    "https://www.linkedin.com/company/ayjale"
                ]
            }
        ]
    };

    return (
        <div className={`bg-slate-50 font-sans flex flex-col ${isJobsPage ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify(jsonLd)}
                </script>
            </Helmet>
            <Navbar />
            <main className={`flex-1 ${isFullWidth ? 'w-full' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'} ${isJobsPage ? 'overflow-hidden' : ''}`}>
                {children}
            </main>
            <Footer compact={isJobsPage} />
        </div>
    );
};

export default Layout;
