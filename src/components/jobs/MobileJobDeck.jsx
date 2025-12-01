import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import JobDetailView from './JobDetailView';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import ApplicationModal from './ApplicationModal';

const MobileJobDeck = ({ jobs, initialJobId, onBack }) => {
    const navigate = useNavigate();
    const { applications, applyToJob } = useData();
    const { user } = useAuth();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const [touchStartY, setTouchStartY] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [slideDirection, setSlideDirection] = useState(''); // 'left' or 'right'

    const [showModal, setShowModal] = useState(false);
    const [applying, setApplying] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Initialize index based on initialJobId
    useEffect(() => {
        const index = jobs.findIndex(j => j.id === Number(initialJobId));
        if (index !== -1) {
            setCurrentIndex(index);
        }
    }, [initialJobId, jobs]);

    const minSwipeDistance = 50;
    const maxVerticalDistance = 50; // Ignore horizontal swipe if vertical scroll is detected

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
        setTouchStartY(e.targetTouches[0].clientY);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = (e) => {
        if (!touchStart || !touchEnd) return;

        const distanceX = touchStart - touchEnd;
        const distanceY = touchStartY - e.changedTouches[0].clientY;

        // If vertical scroll is significant, ignore horizontal swipe
        if (Math.abs(distanceY) > maxVerticalDistance) return;

        const isLeftSwipe = distanceX > minSwipeDistance;
        const isRightSwipe = distanceX < -minSwipeDistance;

        if (isLeftSwipe) {
            handleNext();
        } else if (isRightSwipe) {
            handlePrev();
        }
    };

    const handleNext = () => {
        if (currentIndex < jobs.length - 1 && !isAnimating) {
            setSlideDirection('left');
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
                setIsAnimating(false);
                setSlideDirection('');
                // Update URL without reloading
                const nextJob = jobs[currentIndex + 1];
                window.history.replaceState(null, '', `/jobs/${nextJob.id}`);
            }, 300);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0 && !isAnimating) {
            setSlideDirection('right');
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentIndex(prev => prev - 1);
                setIsAnimating(false);
                setSlideDirection('');
                // Update URL without reloading
                const prevJob = jobs[currentIndex - 1];
                window.history.replaceState(null, '', `/jobs/${prevJob.id}`);
            }, 300);
        }
    };

    const handleApply = () => {
        if (!user) {
            navigate(`/auth?returnUrl=/jobs/${currentJob.id}`);
            return;
        }

        if (user.role !== 'candidate') {
            alert('Solo los candidatos pueden postularse.');
            return;
        }

        if (currentJob.is_external && currentJob.external_url) {
            window.open(currentJob.external_url, '_blank', 'noopener,noreferrer');
            return;
        }

        // Check profile completeness (simplified version)
        const required = ['name', 'title', 'location', 'bio'];
        const hasRequired = required.every(field => user[field] && user[field].trim() !== '');

        if (hasRequired) {
            setShowModal(true);
        } else {
            navigate(`/profile?applyingTo=${currentJob.id}`);
        }
    };

    const handleModalSubmit = async (comments) => {
        setApplying(true);
        try {
            await applyToJob(currentJob.id, user.id, {
                name: user.name,
                email: user.email,
                title: user.title,
                location: user.location,
                bio: user.bio,
                skills: user.skills,
                comments
            });
            setIsSuccess(true);
            setTimeout(() => {
                setShowModal(false);
                setIsSuccess(false);
            }, 3000);
        } catch (error) {
            console.error('Error applying:', error);
            alert(`Error al enviar la postulación: ${error.message || 'Intenta de nuevo.'}`);
        } finally {
            setApplying(false);
        }
    };

    const currentJob = jobs[currentIndex];
    const company = currentJob?.profiles;
    const hasApplied = user && currentJob && applications.some(app => app.job_id === currentJob.id && app.candidate_id === user.id);

    // Animation classes
    const containerClass = `h-full transition-transform duration-300 ease-in-out transform ${slideDirection === 'left' ? '-translate-x-full opacity-0' :
            slideDirection === 'right' ? 'translate-x-full opacity-0' :
                'translate-x-0 opacity-100'
        }`;

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 overflow-hidden">
            {/* Top Navigation Bar */}
            <div className="bg-white px-4 py-3 shadow-sm flex justify-between items-center z-10 flex-shrink-0">
                <button
                    onClick={onBack}
                    className="flex items-center text-slate-600 font-medium text-sm"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Volver
                </button>
                <div className="text-xs text-slate-400 font-medium">
                    {currentIndex + 1} de {jobs.length}
                </div>
            </div>

            {/* Swipeable Content Area */}
            <div
                className="flex-1 relative overflow-hidden"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                <div className={containerClass}>
                    {currentJob && (
                        <div className="h-full pb-20 px-4 pt-4"> {/* Padding for bottom controls */}
                            <JobDetailView
                                job={currentJob}
                                company={company}
                                onApply={handleApply}
                                hasApplied={hasApplied}
                                isMobileDeck={true}
                            />
                        </div>
                    )}
                </div>
            </div>

            <ApplicationModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleModalSubmit}
                jobTitle={currentJob?.title}
                loading={applying}
                success={isSuccess}
            />

            {/* Bottom Controls (Floating) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 flex justify-between items-center z-20 safe-area-bottom">
                <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className={`p-2 rounded-full border ${currentIndex === 0 ? 'text-slate-300 border-slate-200' : 'text-slate-600 border-slate-300 hover:bg-slate-50'}`}
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                    onClick={onBack}
                    className="bg-slate-900 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg"
                >
                    Volver al listado
                </button>

                <button
                    onClick={handleNext}
                    disabled={currentIndex === jobs.length - 1}
                    className={`p-2 rounded-full border ${currentIndex === jobs.length - 1 ? 'text-slate-300 border-slate-200' : 'text-slate-600 border-slate-300 hover:bg-slate-50'}`}
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default MobileJobDeck;
