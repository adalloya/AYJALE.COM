import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import JobDetailView from './JobDetailView';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import ApplicationModal from './ApplicationModal';
import SwipeTutorial from './SwipeTutorial';

const MobileJobDeck = ({ jobs, initialJobId, onBack }) => {
    const navigate = useNavigate();
    const { applications, applyToJob } = useData();
    const { user } = useAuth();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(null);
    const [touchStartY, setTouchStartY] = useState(null);

    const [boundaryFeedback, setBoundaryFeedback] = useState({ active: false, type: null, fading: false });

    const [isSwipingOut, setIsSwipingOut] = useState(false);

    const [dragX, setDragX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [exitDirection, setExitDirection] = useState(null); // 'left' or 'right'

    const cardRef = useRef(null);
    const windowWidth = window.innerWidth;
    const threshold = windowWidth * 0.3; // Drag 30% of screen to trigger

    const [showModal, setShowModal] = useState(false);
    const [applying, setApplying] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Tutorial State
    const [showTutorial, setShowTutorial] = useState(false);
    const lastInteractionRef = useRef(Date.now());
    const tutorialTimersRef = useRef([]);

    // Initialize index based on initialJobId
    useEffect(() => {
        const index = jobs.findIndex(j => j.id === Number(initialJobId));
        if (index !== -1) {
            setCurrentIndex(index);
        }
    }, [initialJobId, jobs]);

    // Tutorial Logic
    useEffect(() => {
        // Clear existing timers
        tutorialTimersRef.current.forEach(clearTimeout);
        tutorialTimersRef.current = [];

        const scheduleTutorial = (delay) => {
            const timer = setTimeout(() => {
                const timeSinceLastInteraction = Date.now() - lastInteractionRef.current;
                // If user has been inactive for roughly the delay time (allow small buffer)
                if (timeSinceLastInteraction >= delay - 100) {
                    setShowTutorial(true);
                    // Hide after 4 seconds
                    setTimeout(() => setShowTutorial(false), 4000);
                }
            }, delay);
            tutorialTimersRef.current.push(timer);
        };

        // Schedule triggers: Immediate (Mount), 10s, 30s, 60s
        // Immediate show on mount (small delay for transition)
        setTimeout(() => {
            setShowTutorial(true);
            setTimeout(() => setShowTutorial(false), 3000);
        }, 500);

        scheduleTutorial(10000); // 10s
        scheduleTutorial(30000); // 30s
        scheduleTutorial(60000); // 60s

        return () => {
            tutorialTimersRef.current.forEach(clearTimeout);
        };
    }, []); // Run once on mount

    const resetInactivity = () => {
        lastInteractionRef.current = Date.now();
        if (showTutorial) setShowTutorial(false);
    };

    const onTouchStart = (e) => {
        resetInactivity();
        if (exitDirection) return;
        setIsDragging(true);
        setTouchStart(e.targetTouches ? e.targetTouches[0].clientX : e.clientX);
        setTouchStartY(e.targetTouches ? e.targetTouches[0].clientY : e.clientY);
        setDragX(0);
    };

    const onTouchMove = (e) => {
        resetInactivity();
        if (!isDragging || !touchStart) return;

        const clientX = e.targetTouches ? e.targetTouches[0].clientX : e.clientX;
        const clientY = e.targetTouches ? e.targetTouches[0].clientY : e.clientY;

        const diffX = clientX - touchStart;
        const diffY = clientY - touchStartY;

        // Lock vertical scroll if dragging horizontally (only for touch)
        if (e.targetTouches && Math.abs(diffX) > Math.abs(diffY)) {
            if (e.cancelable) e.preventDefault(); // Prevent scrolling
        }

        setDragX(diffX);
    };

    const onTouchEnd = () => {
        resetInactivity();
        if (!isDragging) return;
        setIsDragging(false);

        // Check for boundary hit to trigger feedback animation
        const isStartBoundary = currentIndex === 0 && dragX > 50; // Threshold to trigger message
        const isEndBoundary = currentIndex === jobs.length - 1 && dragX < -50;

        if (isStartBoundary || isEndBoundary) {
            const type = isStartBoundary ? 'start' : 'end';
            // Trigger lingering feedback
            setBoundaryFeedback({ active: true, type, fading: false });

            // Start fade out after delay (linger)
            setTimeout(() => {
                setBoundaryFeedback(prev => ({ ...prev, fading: true }));
                // Remove completely after fade duration
                setTimeout(() => {
                    setBoundaryFeedback({ active: false, type: null, fading: false });
                }, 500); // 500ms fade duration matches CSS transition
            }, 1000); // 1s linger duration
        }

        if (Math.abs(dragX) > threshold) {
            // Swiped far enough
            if ((dragX < 0 && currentIndex < jobs.length - 1) || (dragX > 0 && currentIndex > 0)) {
                setIsSwipingOut(true); // Trigger background animation

                if (dragX < 0) {
                    setExitDirection('left');
                    setTimeout(() => handleNext(), 200);
                } else {
                    setExitDirection('right');
                    setTimeout(() => handlePrev(), 200);
                }
            } else {
                setDragX(0); // Boundary hit
            }
        } else {
            setDragX(0); // Not far enough
        }
    };

    const handleNext = () => {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        resetState();
        // Update URL
        const nextJob = jobs[nextIndex];
        window.history.replaceState(null, '', `/jobs/${nextJob.id}`);
    };

    const handlePrev = () => {
        const prevIndex = currentIndex - 1;
        setCurrentIndex(prevIndex);
        resetState();
        // Update URL
        const prevJob = jobs[prevIndex];
        window.history.replaceState(null, '', `/jobs/${prevJob.id}`);
    };

    const resetState = () => {
        setDragX(0);
        setExitDirection(null);
        setIsSwipingOut(false);
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
    const nextJob = currentIndex < jobs.length - 1 ? jobs[currentIndex + 1] : null;
    const prevJob = currentIndex > 0 ? jobs[currentIndex - 1] : null;

    // Determine which card is "behind" based on drag direction
    let backgroundJob = null;
    if (dragX > 0) {
        backgroundJob = prevJob; // Swiping Right -> Show Previous
    } else if (dragX < 0) {
        backgroundJob = nextJob; // Swiping Left -> Show Next
    }

    const company = currentJob?.profiles;
    const backgroundCompany = backgroundJob?.profiles;

    const hasApplied = user && currentJob && applications.some(app => app.job_id === currentJob.id && app.candidate_id === user.id);

    // Dynamic Styles for Background Card
    const bgScale = isSwipingOut ? 1 : 0.95 + (Math.abs(dragX) / windowWidth) * 0.05;
    const bgOpacity = isSwipingOut ? 1 : 0.5 + (Math.abs(dragX) / windowWidth) * 0.5;
    const bgGrayscale = isSwipingOut ? 0 : 1; // 1 = grayscale, 0 = color

    // Dynamic Styles
    const rotate = dragX * 0.05; // Slight rotation
    const opacity = 1 - (Math.abs(dragX) / (windowWidth * 1.5)); // Fade out slightly

    const cardStyle = {
        transform: exitDirection
            ? `translateX(${exitDirection === 'left' ? '-150%' : '150%'}) rotate(${exitDirection === 'left' ? -20 : 20}deg)`
            : `translateX(${dragX}px) rotate(${rotate}deg)`,
        opacity: exitDirection ? 0 : 1, // opacity,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out, opacity 0.3s ease-out',
        zIndex: 10
    };

    // Helper to determine if overlay should be shown
    const showBoundaryOverlay = (currentIndex === 0 && dragX > 0) || (currentIndex === jobs.length - 1 && dragX < 0) || boundaryFeedback.active;
    const overlayType = boundaryFeedback.active ? boundaryFeedback.type : (dragX > 0 ? 'start' : 'end');

    return (
        <div className="fixed inset-0 z-[100] bg-slate-100 flex flex-col overflow-hidden">
            {/* ... Top Bar ... */}
            <div className="bg-white px-4 py-3 shadow-sm flex justify-between items-center z-20 flex-shrink-0 relative">
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

            {/* Deck Area */}
            <div className="flex-1 relative w-full h-full overflow-hidden p-4">

                {/* Background Card (Job) */}
                {backgroundJob && (
                    <div
                        className="absolute inset-4 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
                        style={{
                            transform: `scale(${bgScale})`,
                            opacity: bgOpacity,
                            zIndex: 1,
                            transition: isSwipingOut ? 'all 0.2s ease-out' : 'none'
                        }}
                    >
                        <div
                            className="h-full overflow-hidden pointer-events-none transition-all duration-200"
                            style={{ filter: `grayscale(${bgGrayscale})` }}
                        >
                            <JobDetailView
                                job={backgroundJob}
                                company={backgroundCompany}
                                onApply={() => { }}
                                hasApplied={false}
                                isMobileDeck={true}
                            />
                        </div>
                    </div>
                )}

                {/* Boundary Overlay (Static, Centered) */}
                {showBoundaryOverlay && (
                    <div
                        className="absolute inset-0 z-[60] flex items-center justify-center pointer-events-none"
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.6)',
                            opacity: boundaryFeedback.active
                                ? (boundaryFeedback.fading ? 0 : 1)
                                : Math.min(1, Math.abs(dragX) / (windowWidth * 0.25)),
                            transition: boundaryFeedback.active ? 'opacity 0.5s ease-out' : 'none'
                        }}
                    >
                        <div className="transform scale-110 text-center p-6 rounded-2xl border-4 border-slate-200 bg-white shadow-2xl">
                            {overlayType === 'start' ? (
                                <>
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ChevronLeft className="w-8 h-8 text-blue-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-1">¡Estás al día!</h3>
                                    <p className="text-sm text-slate-500 font-medium">Es la más reciente</p>
                                </>
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ChevronRight className="w-8 h-8 text-orange-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-1">¡Has visto todo!</h3>
                                    <p className="text-sm text-slate-500 font-medium">No hay más por ahora, pero vuelve mañana</p>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Tutorial Overlay */}
                <SwipeTutorial visible={showTutorial} />

                {/* Current Card */}
                {currentJob && (
                    <div
                        key={currentJob.id} // Key ensures fresh mount on change, preventing "slide-in"
                        ref={cardRef}
                        className="absolute inset-4 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden cursor-grab active:cursor-grabbing"
                        style={cardStyle}
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                        onMouseDown={onTouchStart}
                        onMouseMove={onTouchMove}
                        onMouseUp={onTouchEnd}
                        onMouseLeave={onTouchEnd}
                    >
                        <div className="h-full overflow-y-auto custom-scrollbar pb-20">
                            <JobDetailView
                                job={currentJob}
                                company={company}
                                onApply={handleApply}
                                hasApplied={hasApplied}
                                isMobileDeck={true}
                            />
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!currentJob && (
                    <div className="flex items-center justify-center h-full text-slate-400">
                        No hay más vacantes.
                    </div>
                )}

            </div>

            <ApplicationModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleModalSubmit}
                jobTitle={currentJob?.title}
                loading={applying}
                success={isSuccess}
            />

        </div>
    );
};

export default MobileJobDeck;
