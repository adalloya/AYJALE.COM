import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
    const location = useLocation();
    const isJobsPage = location.pathname === '/jobs';
    const isLandingPage = location.pathname === '/';
    const isFullWidth = isJobsPage || isLandingPage;

    return (
        <div className={`bg-slate-50 font-sans flex flex-col ${isJobsPage ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
            <Navbar />
            <main className={`flex-1 ${isFullWidth ? 'w-full' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'} ${isJobsPage ? 'overflow-hidden' : ''}`}>
                {children}
            </main>
            <Footer compact={isJobsPage} />
        </div>
    );
};

export default Layout;
