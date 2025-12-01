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
    const [touchStartY, setTouchStartY] = useState(null);

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

    // Initialize index based on initialJobId
    useEffect(() => {
        const index = jobs.findIndex(j => j.id === Number(initialJobId));
        if (index !== -1) {
            setCurrentIndex(index);
        }
    }, [initialJobId, jobs]);

    const onTouchStart = (e) => {
        if (exitDirection) return;
        setIsDragging(true);
        setTouchStart(e.targetTouches[0].clientX);
        setTouchStartY(e.targetTouches[0].clientY);
        setDragX(0);
    };

    const onTouchMove = (e) => {
        if (!isDragging || !touchStart) return;

        const currentX = e.targetTouches[0].clientX;
        const currentY = e.targetTouches[0].clientY;
        const diffX = currentX - touchStart;
        const diffY = currentY - touchStartY;

        // Lock vertical scroll if dragging horizontally
        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (e.cancelable) e.preventDefault(); // Prevent scrolling
        }

        setDragX(diffX);
    };

    const onTouchEnd = () => {
        if (!isDragging) return;
        setIsDragging(false);

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

    // ...

    // Dynamic Styles for Background Card
    // If swiping out, force full scale/opacity/color to match the incoming foreground state
    const bgScale = isSwipingOut ? 1 : 0.95 + (Math.abs(dragX) / windowWidth) * 0.05;
    const bgOpacity = isSwipingOut ? 1 : 0.5 + (Math.abs(dragX) / windowWidth) * 0.5;
    const bgGrayscale = isSwipingOut ? 0 : 1; // 1 = grayscale, 0 = color

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-100 overflow-hidden">
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

                {/* Background Card */}
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
                {/* ... */}

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
