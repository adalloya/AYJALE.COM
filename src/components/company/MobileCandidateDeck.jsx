import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import CandidateDetailView from './CandidateDetailView';
import SwipeTutorial from '../jobs/SwipeTutorial'; // Reusing tutorial
import { useData } from '../../context/DataContext';

const MobileCandidateDeck = ({ candidates, initialCandidateId, onBack, onUnlock, isUnlocked, unlocking, onCandidateChange }) => {
    const navigate = useNavigate();
    const location = useLocation();

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
    const threshold = windowWidth * 0.3;

    // Tutorial State
    const [showTutorial, setShowTutorial] = useState(false);
    const lastInteractionRef = useRef(Date.now());
    const tutorialTimersRef = useRef([]);

    // Search State (Local to deck for now, or could lift up)
    const [showSearch, setShowSearch] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');

    const handleSearch = (keyword) => {
        setShowSearch(false);
        // Navigate to search page with query
        // Since we are likely already on /candidates or similar, we might need to adjust
        // But assuming this component is used in CandidateSearchPage, we can just update URL
        // However, CandidateSearchPage uses local state for search.
        // Ideally, we should pass a onSearch callback.
        // For now, let's assume we want to reload the page with the query or just filter?
        // Actually, if we are in deck mode, we are likely on mobile.
        // Let's assume we want to filter the current list.
        // But the deck takes `candidates` as prop.
        // So we should probably navigate to the search page with the query param.
        // Let's assume the route is /company/candidates
        navigate(`/company/candidates?keyword=${encodeURIComponent(keyword)}`, { replace: true });
    };

    // Initialize and Validate Index
    useEffect(() => {
        const index = candidates.findIndex(c => c.id === initialCandidateId);
        if (index !== -1) {
            if (index !== currentIndex) {
                setCurrentIndex(index);
            }
        } else {
            // If selected candidate is not in the list (e.g. filtered out by search), reset to 0
            if (currentIndex !== 0) {
                setCurrentIndex(0);
            }
        }
    }, [candidates, initialCandidateId]);

    // Tutorial Logic (Reused)
    useEffect(() => {
        tutorialTimersRef.current.forEach(clearTimeout);
        tutorialTimersRef.current = [];

        const scheduleTutorial = (delay) => {
            const timer = setTimeout(() => {
                const timeSinceLastInteraction = Date.now() - lastInteractionRef.current;
                if (timeSinceLastInteraction >= delay - 100) {
                    setShowTutorial(true);
                    setTimeout(() => setShowTutorial(false), 4000);
                }
            }, delay);
            tutorialTimersRef.current.push(timer);
        };

        setTimeout(() => {
            setShowTutorial(true);
            setTimeout(() => setShowTutorial(false), 3000);
        }, 500);

        scheduleTutorial(10000);
        scheduleTutorial(30000);

        return () => {
            tutorialTimersRef.current.forEach(clearTimeout);
        };
    }, []);

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

        if (e.targetTouches && Math.abs(diffX) > Math.abs(diffY)) {
            if (e.cancelable) e.preventDefault();
        }

        setDragX(diffX);
    };

    const onTouchEnd = () => {
        resetInactivity();
        if (!isDragging) return;
        setIsDragging(false);

        const isStartBoundary = currentIndex === 0 && dragX > 50;
        const isEndBoundary = currentIndex === candidates.length - 1 && dragX < -50;

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
            if ((dragX < 0 && currentIndex < candidates.length - 1) || (dragX > 0 && currentIndex > 0)) {
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
        if (onCandidateChange) {
            onCandidateChange(candidates[nextIndex]);
        }
    };

    const handlePrev = () => {
        const prevIndex = currentIndex - 1;
        setCurrentIndex(prevIndex);
        resetState();
        if (onCandidateChange) {
            onCandidateChange(candidates[prevIndex]);
        }
    };

    const resetState = () => {
        setDragX(0);
        setExitDirection(null);
        setIsSwipingOut(false);
    };

    const currentCandidate = candidates[currentIndex];
    const nextCandidate = currentIndex < candidates.length - 1 ? candidates[currentIndex + 1] : null;
    const prevCandidate = currentIndex > 0 ? candidates[currentIndex - 1] : null;

    let backgroundCandidate = null;
    if (dragX > 0) {
        backgroundCandidate = prevCandidate;
    } else if (dragX < 0) {
        backgroundCandidate = nextCandidate;
    }

    const bgScale = isSwipingOut ? 1 : 0.95 + (Math.abs(dragX) / windowWidth) * 0.05;
    const bgOpacity = isSwipingOut ? 1 : 0.5 + (Math.abs(dragX) / windowWidth) * 0.5;
    const bgGrayscale = isSwipingOut ? 0 : 1;

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

    const showBoundaryOverlay = (currentIndex === 0 && dragX > 0) || (currentIndex === candidates.length - 1 && dragX < 0) || boundaryFeedback.active;
    const overlayType = boundaryFeedback.active ? boundaryFeedback.type : (dragX > 0 ? 'start' : 'end');

    return (
        <div className="fixed inset-0 z-[100] bg-slate-100 flex flex-col overflow-hidden">
            {/* Top Bar */}
            <div className="bg-white px-4 py-3 shadow-sm flex justify-between items-center z-20 flex-shrink-0 relative">
                <button
                    onClick={onBack}
                    className="flex items-center text-slate-600 font-medium text-sm"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Volver
                </button>
                <div className="text-xs text-slate-400 font-medium">
                    {currentIndex + 1} de {candidates.length}
                </div>
            </div>

            {/* Deck Area */}
            <div className="flex-1 relative w-full h-full overflow-hidden p-4">

                {/* Background Card */}
                {backgroundCandidate && (
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
                            <CandidateDetailView
                                candidate={backgroundCandidate}
                                isUnlocked={isUnlocked(backgroundCandidate.id)}
                                onUnlock={() => { }}
                                unlocking={false}
                                isMobileDeck={true}
                            />
                        </div>
                    </div>
                )}

                {/* Boundary Overlay */}
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
                        <div className="transform scale-110 text-center p-6 rounded-2xl bg-white/90 backdrop-blur-sm shadow-2xl">
                            {overlayType === 'start' ? (
                                <>
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ChevronLeft className="w-8 h-8 text-blue-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-1">¡Inicio de lista!</h3>
                                    <p className="text-sm text-slate-500 font-medium">Este es el primer candidato</p>
                                </>
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ChevronRight className="w-8 h-8 text-orange-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-1">¡Has visto todo!</h3>
                                    <p className="text-sm text-slate-500 font-medium">No hay más candidatos por ahora</p>
                                </>
                            )}
                        </div>
                    </div>
                )}

                <SwipeTutorial visible={showTutorial} />

                {/* Current Card */}
                {currentCandidate && (
                    <div
                        key={currentCandidate.id}
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
                            <CandidateDetailView
                                candidate={currentCandidate}
                                isUnlocked={isUnlocked(currentCandidate.id)}
                                onUnlock={onUnlock}
                                unlocking={unlocking}
                                isMobileDeck={true}
                            />
                        </div>
                    </div>
                )}

                {!currentCandidate && (
                    <div className="flex items-center justify-center h-full text-slate-400">
                        No hay más candidatos.
                    </div>
                )}
            </div>

            {/* Floating Search Button */}
            <button
                onClick={() => setShowSearch(true)}
                className="absolute bottom-6 right-6 z-[80] bg-white text-secondary-600 p-4 rounded-full shadow-lg border border-slate-100 active:scale-95 transition-transform"
            >
                <Search className="w-6 h-6" />
            </button>

            {/* Search Overlay */}
            {
                showSearch && (
                    <div className="absolute inset-0 z-[90] bg-black/20 backdrop-blur-sm flex items-center justify-center px-6 animate-fade-in-slow" onClick={() => setShowSearch(false)}>
                        <div
                            className="w-full max-w-md transform animate-fly-in origin-bottom relative rounded-full"
                            onClick={e => e.stopPropagation()}
                        >
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (searchKeyword.trim()) {
                                        handleSearch(searchKeyword);
                                    }
                                }}
                                className="relative flex items-center bg-white rounded-full overflow-hidden p-1 border border-transparent animate-breathe"
                            >
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="Buscar candidato..."
                                    className="flex-1 pl-6 pr-3 py-3 bg-transparent border-none text-slate-900 placeholder-slate-400 focus:ring-0 text-base"
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                />
                                {searchKeyword && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchKeyword('')}
                                        className="p-2 text-slate-300 hover:text-slate-500 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="bg-secondary-600 text-white p-3 rounded-full hover:bg-secondary-700 active:scale-95 transition-all shadow-md ml-1"
                                >
                                    <Search className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }

        </div >
    );
};

export default MobileCandidateDeck;
