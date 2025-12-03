import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Search, X, Menu, Home, LayoutDashboard, User, LogOut } from 'lucide-react';
import JobDetailView from './JobDetailView';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import ApplicationModal from './ApplicationModal';
import logo from '../../assets/ayjale_logo_new.png';

const MobileJobDeck = ({ jobs, initialJobId, onBack }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { applications, applyToJob } = useData();
    const { user, logout } = useAuth();

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

    // Search State
    const [showSearch, setShowSearch] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        // Assuming logout function is available from useAuth, if not we might need to get it
        // But useAuth usually provides it. Let's check imports.
        // Yes, useAuth is imported.
        // We need to destructure logout from useAuth
    };

    const handleSearch = (keyword) => {
        setShowSearch(false);
        navigate(`/jobs?keyword=${encodeURIComponent(keyword)}`, {
            replace: true // Replace current history entry so "Back" goes to previous context, not search form
        });
    };

    // Initialize index based on initialJobId
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
        if (jobs.length === 0) return;

        const index = jobs.findIndex(j => j.id === Number(initialJobId));
        // Only update if found AND different from current
        if (index !== -1 && index !== currentIndex) {
            setCurrentIndex(index);
            // Ensure we mark as initialized if we sync from URL
            isInitialized.current = true;
        }
    }, [initialJobId]); // IMPORTANT: Do not include 'jobs' here to avoid reset on polling

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
        // Update URL using navigate to keep router in sync
        const nextJob = jobs[nextIndex];
        navigate(`/jobs/${nextJob.id}`, {
            replace: true,
            state: location.state // Preserve state (jobIds list)
        });
    };

    const handlePrev = () => {
        const prevIndex = currentIndex - 1;
        setCurrentIndex(prevIndex);
        resetState();
        // Update URL using navigate to keep router in sync
        const prevJob = jobs[prevIndex];
        navigate(`/jobs/${prevJob.id}`, {
            replace: true,
            state: location.state // Preserve state (jobIds list)
        });
    };

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

    // Render
    return (
        <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col h-[100dvh] w-full overflow-hidden overscroll-none touch-none">
            {/* Header */}
            <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm z-50 h-[60px] flex-shrink-0 relative">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-full transition-colors active:scale-95"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <img src={logo} alt="AyJale" className="h-8 w-auto object-contain" />
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowSearch(true)}
                        className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors active:scale-95"
                    >
                        <Search className="w-6 h-6" />
                    </button>

                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 -mr-2 text-slate-600 hover:bg-slate-50 rounded-full transition-colors active:scale-95"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                            <div className="absolute top-[60px] right-0 w-64 bg-white shadow-xl border border-slate-100 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
                                <div className="p-2">
                                    <button
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            navigate('/');
                                        }}
                                        className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-3 transition-colors"
                                    >
                                        <Home className="w-5 h-5 text-slate-400" />
                                        Inicio
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            navigate('/jobs');
                                        }}
                                        className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-3 transition-colors"
                                    >
                                        <Briefcase className="w-5 h-5 text-slate-400" />
                                        Vacantes
                                    </button>
                                    {user ? (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setIsMenuOpen(false);
                                                    navigate('/profile');
                                                }}
                                                className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-3 transition-colors"
                                            >
                                                <User className="w-5 h-5 text-slate-400" />
                                                Mi Perfil
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsMenuOpen(false);
                                                    navigate('/dashboard');
                                                }}
                                                className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-3 transition-colors"
                                            >
                                                <LayoutDashboard className="w-5 h-5 text-slate-400" />
                                                Panel de candidato
                                            </button>
                                            <div className="h-px bg-slate-100 my-1" />
                                            <button
                                                onClick={() => {
                                                    setIsMenuOpen(false);
                                                    handleLogout();
                                                }}
                                                className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 font-medium flex items-center gap-3 transition-colors"
                                            >
                                                <LogOut className="w-5 h-5" />
                                                Cerrar Sesión
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="h-px bg-slate-100 my-1" />
                                            <button
                                                onClick={() => {
                                                    setIsMenuOpen(false);
                                                    navigate('/auth');
                                                }}
                                                className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-3 transition-colors"
                                            >
                                                <LogIn className="w-5 h-5 text-slate-400" />
                                                Iniciar Sesión
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Search Overlay */}
            {showSearch && (
                <div className="absolute inset-0 z-[60] bg-white animate-in fade-in slide-in-from-top-5 duration-200">
                    <div className="p-4 flex items-center gap-3 border-b border-slate-100">
                        <button
                            onClick={() => setShowSearch(false)}
                            className="p-2 -ml-2 text-slate-400 hover:text-slate-600"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Buscar vacantes..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary-500/20 text-slate-900"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearch(e.target.value);
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <div className="p-6">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Populares</h3>
                        <div className="flex flex-wrap gap-2">
                            {['Ventas', 'Administración', 'Chofer', 'Atención al cliente', 'Limpieza'].map(term => (
                                <button
                                    key={term}
                                    onClick={() => handleSearch(term)}
                                    className="px-4 py-2 bg-slate-50 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors"
                                >
                                    {term}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area (Swipeable) */}
            <div
                className="flex-1 relative overflow-hidden bg-slate-100"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Cards Container */}
                <div className="absolute inset-0 flex items-center justify-center p-4">
                    {/* Next Card (Background) */}
                    {nextJob && (
                        <div
                            className="absolute inset-4 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden transform scale-95 opacity-50 translate-y-4"
                        >
                            <JobDetailView
                                job={nextJob}
                                company={nextJob.profiles}
                                onApply={() => { }} // Dummy handler for background card
                                hasApplied={false}
                                isMobileDeck={true}
                            />
                        </div>
                    )}

                    {/* Current Card (Foreground) */}
                    <div
                        className="absolute inset-4 bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden transition-transform duration-300 ease-out will-change-transform"
                        style={{
                            transform: `translateX(${dragX}px) rotate(${dragX * 0.05}deg)`,
                            zIndex: 10
                        }}
                    >
                        {/* Swipe Indicators */}
                        {dragX !== 0 && (
                            <div className={`absolute top-8 ${dragX > 0 ? 'left-8' : 'right-8'} z-50 transform -rotate-12`}>
                                <div className={`px-4 py-2 border-4 rounded-xl font-bold text-2xl tracking-wider uppercase ${dragX > 0
                                    ? 'border-green-500 text-green-500' // Right swipe (Next/Like)
                                    : 'border-red-500 text-red-500'     // Left swipe (Prev/Dislike)
                                    }`}>
                                    {dragX > 0 ? 'SIGUIENTE' : 'ANTERIOR'}
                                </div>
                            </div>
                        )}

                        <JobDetailView
                            job={currentJob}
                            company={currentJob.profiles}
                            onApply={handleApply}
                            hasApplied={hasApplied}
                            isMobileDeck={true}
                        />
                    </div>
                </div>

                {/* Navigation Controls (Bottom) */}
                <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-6 z-40 pointer-events-none">
                    <button
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className={`w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center transition-all pointer-events-auto ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'active:scale-90 text-red-500'
                            }`}
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>

                    <span className="bg-slate-900/80 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
                        {currentIndex + 1} / {jobs.length}
                    </span>

                    <button
                        onClick={handleNext}
                        disabled={currentIndex === jobs.length - 1}
                        className={`w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center transition-all pointer-events-auto ${currentIndex === jobs.length - 1 ? 'opacity-50 cursor-not-allowed' : 'active:scale-90 text-green-500'
                            }`}
                    >
                        <ChevronRight className="w-8 h-8" />
                    </button>
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
                                className="flex-1 pl-4 pr-3 py-4 bg-transparent border-none text-slate-900 placeholder-slate-400 focus:ring-0 focus:outline-none text-lg outline-none"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                            />
                            {searchKeyword && (
                                <button
                                    type="button"
                                    onClick={() => setSearchKeyword('')}
                                    className="p-3 text-slate-300 hover:text-slate-500 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            )}
                            <button
                                type="submit"
                                className="bg-secondary-600 text-white p-3.5 rounded-xl hover:bg-secondary-700 active:scale-95 transition-all shadow-md ml-1"
                            >
                                <Search className="w-6 h-6" />
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default MobileJobDeck;
