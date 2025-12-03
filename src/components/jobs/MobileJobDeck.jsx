import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Search, X, Menu, Home, LayoutDashboard, User, LogOut, Briefcase, LogIn } from 'lucide-react';
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
    let backgroundJob = null;
    if (dragX > 0) {
        backgroundJob = prevJob; // Swiping Right -> Show Previous
    } else if (dragX < 0) {
        backgroundJob = nextJob; // Swiping Left -> Show Next
    }
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

    const handleLogout = () => {
        if (logout) logout();
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
    }, [initialJobId]);

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

        // Check for boundary hit to trigger feedback animation
        const isStartBoundary = currentIndex === 0 && dragX > 50;
        const isEndBoundary = currentIndex === jobs.length - 1 && dragX < -50;

        if (isStartBoundary || isEndBoundary) {
            const type = isStartBoundary ? 'start' : 'end';
            setBoundaryFeedback({ active: true, type, fading: false });

            setTimeout(() => {
                setBoundaryFeedback(prev => ({ ...prev, fading: true }));
                setTimeout(() => {
                    setBoundaryFeedback({ active: false, type: null, fading: false });
                }, 500);
            }, 1000);
        }

        if (Math.abs(dragX) > threshold) {
            if ((dragX < 0 && currentIndex < jobs.length - 1) || (dragX > 0 && currentIndex > 0)) {
                setIsSwipingOut(true);

                if (dragX < 0) {
                    setExitDirection('left');
                    setTimeout(() => handleNext(), 200);
                } else {
                    setExitDirection('right');
                    setTimeout(() => handlePrev(), 200);
                }
            } else {
                setDragX(0);
            }
        } else {
            setDragX(0);
        }
    };

    const handleNext = () => {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        resetState();
        const nextJob = jobs[nextIndex];
        navigate(`/jobs/${nextJob.id}`, {
            replace: true,
            state: location.state
        });
    };

    const handlePrev = () => {
        const prevIndex = currentIndex - 1;
        setCurrentIndex(prevIndex);
        resetState();
        const prevJob = jobs[prevIndex];
        navigate(`/jobs/${prevJob.id}`, {
            replace: true,
            state: location.state
        });
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

    // Dynamic Styles for Background Card
    const bgScale = isSwipingOut ? 1 : 0.95 + (Math.abs(dragX) / windowWidth) * 0.05;
    const bgOpacity = isSwipingOut ? 1 : 0.5 + (Math.abs(dragX) / windowWidth) * 0.5;
    const bgGrayscale = isSwipingOut ? 0 : 1;

    // Dynamic Styles
    const rotate = dragX * 0.05;
    const opacity = 1 - (Math.abs(dragX) / (windowWidth * 1.5));

    const cardStyle = {
        transform: exitDirection
            ? `translateX(${exitDirection === 'left' ? '-150%' : '150%'}) rotate(${exitDirection === 'left' ? -20 : 20}deg)`
            : `translateX(${dragX}px) rotate(${rotate}deg)`,
        opacity: exitDirection ? 0 : 1,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out, opacity 0.3s ease-out',
        zIndex: 10
    };

    // Helper to determine if overlay should be shown
    const showBoundaryOverlay = (currentIndex === 0 && dragX > 0) || (currentIndex === jobs.length - 1 && dragX < 0) || boundaryFeedback.active;
    const overlayType = boundaryFeedback.active ? boundaryFeedback.type : (dragX > 0 ? 'start' : 'end');

    // Render
    return (
        <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col h-[100dvh] w-full overflow-hidden overscroll-none touch-pan-y">
            {/* Header */}
            <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm z-50 h-[60px] flex-shrink-0 relative">
                <button
                    onClick={onBack}
                    className="flex items-center text-slate-600 font-medium text-sm hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-1" />
                    Volver
                </button>

                <div className="text-sm font-medium text-slate-400">
                    {currentIndex + 1} de {jobs.length}
                </div>

                <div className="flex items-center gap-3">
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

            {/* Main Content Area (Swipeable) */}
            <div
                className="flex-1 relative overflow-hidden bg-white"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Cards Container */}
                <div className="absolute inset-0 flex items-center justify-center p-4">
                    {/* Background Card */}
                    {(dragX > 0 ? prevJob : nextJob) && (
                        <div
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
                                    job={dragX > 0 ? prevJob : nextJob}
                                    company={(dragX > 0 ? prevJob : nextJob).profiles}
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
                            company={currentJob.profiles}
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
