import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import MobileHeader from './MobileHeader';
import JobDetailView from './JobDetailView';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import ApplicationModal from './ApplicationModal';
import SwipeTutorial from './SwipeTutorial';
import logo from '../../assets/ayjale_logo_new.png';

const MobileJobDeck = ({ jobs, initialJobId, onBack }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { applications, applyToJob } = useData();
    const { user, logout } = useAuth();

    const [currentIndex, setCurrentIndex] = useState(0);

    const currentJob = jobs[currentIndex];
    const nextJob = currentIndex < jobs.length - 1 ? jobs[currentIndex + 1] : null;
    const prevJob = currentIndex > 0 ? jobs[currentIndex - 1] : null;
    const company = currentJob?.profiles;
    const hasApplied = user && currentJob && applications.some(app => app.job_id === currentJob.id && app.candidate_id === user.id);

    // Safety check: Ensure currentIndex is valid
    useEffect(() => {
        if (currentIndex >= jobs.length && jobs.length > 0) {
            setCurrentIndex(0);
        }
    }, [currentIndex, jobs.length]);

    const [touchStart, setTouchStart] = useState(null);
    const [touchStartY, setTouchStartY] = useState(null);

    const [boundaryFeedback, setBoundaryFeedback] = useState({ active: false, type: null, fading: false });

    const [isSwipingOut, setIsSwipingOut] = useState(false);

    const [dragX, setDragX] = useState(0);

    // Determine which card is "behind" based on drag direction
    // Only show if drag is significant to prevent flicker
    const backgroundJob = Math.abs(dragX) > 1 ? (dragX > 0 ? prevJob : nextJob) : null;
    const backgroundCompany = backgroundJob?.profiles;

    const [isDragging, setIsDragging] = useState(false);
    const [exitDirection, setExitDirection] = useState(null); // 'left' or 'right'

    const cardRef = useRef(null);
    const menuRef = useRef(null);
    const windowWidth = window.innerWidth;
    const threshold = windowWidth * 0.3; // Drag 30% of screen to trigger

    const [showModal, setShowModal] = useState(false);
    const [applying, setApplying] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Tutorial State
    const [showTutorial, setShowTutorial] = useState(false);
    const lastInteractionRef = useRef(Date.now());
    const tutorialTimersRef = useRef([]);

    // Search State
    const [showSearch, setShowSearch] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = useCallback(() => {
        if (logout) logout();
    }, [logout]);

    const handleSearch = (keyword) => {
        setShowSearch(false);
        navigate(`/jobs?keyword=${encodeURIComponent(keyword)}`, {
            replace: true // Replace current history entry so "Back" goes to previous context, not search form
        });
    };

    // Initialize index based on initialJobId
    // We split this into two effects to prevent "snap back" when polling updates 'jobs'

    const isInitialized = useRef(false);

    // Effect 1: Initial Load (Runs when jobs populate)
    useEffect(() => {
        if (isInitialized.current || jobs.length === 0) return;

        const index = jobs.findIndex(j => j.id === Number(initialJobId));
        if (index !== -1) {
            setCurrentIndex(index);
            isInitialized.current = true;
        }
    }, [jobs, initialJobId]);

    // Effect 2: Navigation Sync (Runs ONLY when initialJobId changes)
    useEffect(() => {
        if (jobs.length > 0) {
            const index = jobs.findIndex(j => j.id === Number(initialJobId));
            // Only update if found AND different from current
            if (index !== -1 && index !== currentIndex) {
                setCurrentIndex(index);
                // Ensure we mark as initialized if we sync from URL
                isInitialized.current = true;
            }
        }
    }, [initialJobId, jobs]); // Removed currentIndex to avoid loop

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

        // Schedule triggers: Immediate (Mount), 5s, 25s (5+20)
        // Immediate show on mount (small delay for transition)
        setTimeout(() => {
            setShowTutorial(true);
            setTimeout(() => setShowTutorial(false), 3000);
        }, 500);

        scheduleTutorial(5000); // 5s
        scheduleTutorial(25000); // 25s (5s + 20s)

        return () => {
            tutorialTimersRef.current.forEach(clearTimeout);
        };
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isMenuOpen]);

    const resetInactivity = () => {
        lastInteractionRef.current = Date.now();
        if (showTutorial) setShowTutorial(false);
    };

    const handleTouchStart = (e) => {
        resetInactivity();
        if (exitDirection) return;
        setIsDragging(true);
        setTouchStart(e.targetTouches ? e.targetTouches[0].clientX : e.clientX);
        setTouchStartY(e.targetTouches ? e.targetTouches[0].clientY : e.clientY);
        setDragX(0);
    };

    const handleTouchMove = (e) => {
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

    const handleTouchEnd = () => {
        resetInactivity();
        if (!isDragging) return;
        setIsDragging(false);
        setTouchStart(null);
        setTouchStartY(null);

        if (Math.abs(dragX) > threshold) {
            // Swipe Out
            const direction = dragX > 0 ? 'right' : 'left';

            // Boundary Check
            if ((currentIndex === 0 && direction === 'right') ||
                (currentIndex === jobs.length - 1 && direction === 'left')) {
                // Hit boundary - bounce back
                setBoundaryFeedback({
                    active: true,
                    type: direction === 'right' ? 'start' : 'end',
                    fading: false
                });

                // Haptic feedback if available
                if (window.navigator && window.navigator.vibrate) {
                    window.navigator.vibrate(50);
                }

                setDragX(0);

                // Hide feedback after delay
                setTimeout(() => {
                    setBoundaryFeedback(prev => ({ ...prev, fading: true }));
                    setTimeout(() => {
                        setBoundaryFeedback({ active: false, type: null, fading: false });
                    }, 300);
                }, 1500);
                return;
            }

            // Valid Swipe
            setExitDirection(direction);
            setIsSwipingOut(true); // Trigger background transition

            // Wait for animation to complete before switching
            setTimeout(() => {
                if (direction === 'right') {
                    handlePrev();
                } else {
                    handleNext();
                }
                setExitDirection(null);
                setDragX(0);
                setIsSwipingOut(false); // Reset background transition
            }, 200); // 200ms matches CSS transition
        } else {
            // Reset (Snap Back)
            setDragX(0);
        }
    };

    const handleNext = () => {
        if (currentIndex < jobs.length - 1) {
            setCurrentIndex(prev => prev + 1);
            const nextJob = jobs[currentIndex + 1];
            navigate(`/jobs/${nextJob.id}`, {
                replace: true,
                state: location.state
            });
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            const prevJob = jobs[currentIndex - 1];
            navigate(`/jobs/${prevJob.id}`, {
                replace: true,
                state: location.state
            });
        }
    };

    const isProfileComplete = useCallback(() => {
        if (!user) return false;
        const required = ['name', 'title', 'location', 'bio'];
        const hasRequired = required.every(field => user[field] && user[field].trim() !== '');
        const hasSkills = Array.isArray(user.skills) ? user.skills.length > 0 : (user.skills && user.skills.trim() !== '');
        return hasRequired && hasSkills;
    }, [user]);

    const resetState = () => {
        setDragX(0);
        setExitDirection(null);
        setIsSwipingOut(false);
    };

    const handleApply = useCallback(() => {
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

        if (isProfileComplete()) {
            setShowModal(true);
        } else {
            navigate(`/profile?applyingTo=${currentJob.id}`);
        }
    }, [user, currentJob, navigate, isProfileComplete]);

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

    // Calculate dynamic styles for smooth animation
    // We want the background card to scale up and fade in as we drag
    const progress = Math.min(Math.abs(dragX) / threshold, 1); // 0 to 1

    // Background Card Styles
    // Starts at scale 0.9, opacity 0.5
    // Ends at scale 1.0, opacity 1.0
    const bgScale = 0.9 + (0.1 * progress);
    const bgOpacity = 0.5 + (0.5 * progress);
    const bgGrayscale = 1 - progress; // 1 (gray) -> 0 (color)

    // Foreground Card Styles
    const rotate = dragX * 0.05; // Slight rotation

    // Fix: Keep opacity 1 during drag (User Request)
    // Only fade out when actually exiting (swiped away)
    const cardStyle = {
        transform: exitDirection
            ? `translateX(${exitDirection === 'right' ? '150%' : '-150%'}) rotate(${exitDirection === 'right' ? 20 : -20}deg)`
            : `translateX(${dragX}px) rotate(${rotate}deg)`,
        opacity: 1, // Keep fully opaque even when exiting
        transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        zIndex: (isDragging || exitDirection) ? 60 : 40 // Fix: Only float over header when interacting
    };

    // Helper to determine if overlay should be shown
    const showBoundaryOverlay = (currentIndex === 0 && dragX > 0) || (currentIndex === jobs.length - 1 && dragX < 0) || boundaryFeedback.active;
    const overlayType = boundaryFeedback.active ? boundaryFeedback.type : (dragX > 0 ? 'start' : 'end');

    // Memoized Progress Bar
    const progressBar = useMemo(() => (
        <div className="h-1 bg-slate-100 w-full flex-shrink-0">
            <div
                className="h-full bg-secondary-500 transition-all duration-300 ease-out"
                style={{ width: `${((currentIndex + 1) / jobs.length) * 100}%` }}
            />
        </div>
    ), [currentIndex, jobs.length]);

    // Render
    if (!currentJob) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary-600"></div></div>;

    return (
        <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col h-[100dvh] w-full overflow-hidden overscroll-none touch-pan-y">
            <MobileHeader
                currentIndex={currentIndex}
                totalJobs={jobs.length}
                onBack={onBack}
                isMenuOpen={isMenuOpen}
                setIsMenuOpen={setIsMenuOpen}
                user={user}
                handleLogout={handleLogout}
            />
            {progressBar}

            {/* Main Content Area (Swipeable) */}
            <div
                className="flex-1 relative bg-white"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Cards Container */}
                <div className="absolute inset-0 flex items-center justify-center p-4">
                    {/* Background Card */}
                    {backgroundJob && (
                        <div
                            key={backgroundJob.id}
                            className="absolute inset-4 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
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
                                    company={backgroundJob?.profiles}
                                    onApply={() => { }}
                                    hasApplied={false}
                                    isMobileDeck={true}
                                />
                            </div>
                        </div>
                    )}

                    {/* Current Card (Foreground) */}
                    <div
                        key={currentJob?.id}
                        className="absolute inset-4 bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden cursor-grab active:cursor-grabbing"
                        style={cardStyle}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onMouseDown={handleTouchStart}
                        onMouseMove={handleTouchMove}
                        onMouseUp={handleTouchEnd}
                        onMouseLeave={handleTouchEnd}
                    >


                        <JobDetailView
                            job={currentJob}
                            company={currentJob?.profiles}
                            onApply={handleApply}
                            hasApplied={hasApplied}
                            isMobileDeck={true}
                        />
                    </div>
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

            {/* Floating Search Button */}
            <button
                onClick={() => setShowSearch(true)}
                className="absolute bottom-6 right-6 z-[80] bg-white text-orange-600 p-4 rounded-full shadow-lg border border-slate-100 active:scale-95 transition-transform"
            >
                <Search className="w-6 h-6" />
            </button>

            {/* Search Overlay */}
            {showSearch && (
                <div className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm flex items-center justify-center px-6 animate-fade-in" onClick={() => setShowSearch(false)}>
                    <div
                        className="w-full max-w-md transform transition-all scale-100 relative"
                        onClick={e => e.stopPropagation()}
                    >
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (searchKeyword.trim()) {
                                    handleSearch(searchKeyword);
                                }
                            }}
                            className="relative flex items-center bg-white rounded-2xl shadow-2xl overflow-hidden p-1"
                        >
                            <input
                                type="text"
                                autoFocus
                                placeholder="Buscar puesto o empresa..."
                                className="flex-1 min-w-0 pl-4 pr-3 py-4 bg-transparent border-none text-slate-900 placeholder-slate-400 focus:ring-0 focus:outline-none text-lg outline-none"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                            />
                            {searchKeyword && (
                                <button
                                    type="button"
                                    onClick={() => setSearchKeyword('')}
                                    className="p-3 text-slate-300 hover:text-slate-500 transition-colors flex-shrink-0"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            )}
                            <button
                                type="submit"
                                className="bg-secondary-600 text-white p-3.5 rounded-xl hover:bg-secondary-700 active:scale-95 transition-all shadow-md ml-1 flex-shrink-0"
                            >
                                <Search className="w-6 h-6" />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Boundary Feedback Overlay */}
            {(boundaryFeedback.active || (isDragging && ((currentIndex === 0 && dragX > 50) || (currentIndex === jobs.length - 1 && dragX < -50)))) && (
                <div className={`absolute inset-0 z-[60] flex items-center justify-center pointer-events-none transition-opacity duration-300 ${boundaryFeedback.fading ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl p-8 flex flex-col items-center text-center transform scale-110 animate-bounce-subtle border border-slate-100">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${(boundaryFeedback.type === 'start' || (dragX > 0)) ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'}`}>
                            {(boundaryFeedback.type === 'start' || (dragX > 0)) ? (
                                <ChevronLeft className="w-8 h-8" />
                            ) : (
                                <ChevronRight className="w-8 h-8" />
                            )}
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-1">
                            {(boundaryFeedback.type === 'start' || (dragX > 0)) ? '¡Estás al día!' : '¡Has visto todo!'}
                        </h3>
                        <p className="text-slate-500 font-medium">
                            {(boundaryFeedback.type === 'start' || (dragX > 0)) ? 'Es la más reciente' : 'No hay más por ahora, pero vuelve mañana'}
                        </p>
                    </div>
                </div>
            )}

            <SwipeTutorial
                visible={showTutorial}
                onDismiss={() => setShowTutorial(false)}
            />

        </div>
    );
};

export default MobileJobDeck;
