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
            if (dragX < 0 && currentIndex < jobs.length - 1) {
                // Swipe Left -> Next
                setExitDirection('left');
                setTimeout(() => {
                    handleNext();
                }, 200); // Wait for animation
            } else if (dragX > 0 && currentIndex > 0) {
                // Swipe Right -> Prev
                setExitDirection('right');
                setTimeout(() => {
                    handlePrev();
                }, 200);
            } else {
                // Boundary hit (first or last item), spring back
                setDragX(0);
            }
        } else {
            // Not far enough, spring back
            setDragX(0);
        }
    };

    const handleNext = () => {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        setDragX(0);
        setExitDirection(null);
        // Update URL
        const nextJob = jobs[nextIndex];
        window.history.replaceState(null, '', `/jobs/${nextJob.id}`);
    };

    const handlePrev = () => {
        const prevIndex = currentIndex - 1;
        setCurrentIndex(prevIndex);
        setDragX(0);
        setExitDirection(null);
        // Update URL
        const prevJob = jobs[prevIndex];
        window.history.replaceState(null, '', `/jobs/${prevJob.id}`);
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
    // If dragging left (negative dragX), show next job. If dragging right, show prev job.
    // Default to next job if no drag.
    const backgroundJob = (dragX > 0 && prevJob) ? prevJob : nextJob;

    const company = currentJob?.profiles;
    const backgroundCompany = backgroundJob?.profiles;

    const hasApplied = user && currentJob && applications.some(app => app.job_id === currentJob.id && app.candidate_id === user.id);

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

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-100 overflow-hidden">
            {/* Top Navigation Bar */}
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

                {/* Background Card (The one appearing) */}
                {backgroundJob && (
                    <div
                        className="absolute inset-4 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transform scale-95 opacity-50"
                        style={{
                            transform: `scale(${0.95 + (Math.abs(dragX) / windowWidth) * 0.05})`,
                            opacity: 0.5 + (Math.abs(dragX) / windowWidth) * 0.5,
                            zIndex: 1
                        }}
                    >
                        <div className="h-full overflow-hidden pointer-events-none opacity-50 grayscale">
                            {/* Simplified view for background to save performance? Or full view? */}
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

                {/* Current Card (Draggable) */}
                {currentJob && (
                    <div
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

            {/* Bottom Controls (Floating) */}
            <div className="fixed bottom-0 left-0 right-0 bg-transparent p-4 flex justify-center items-center z-30 safe-area-bottom pointer-events-none">
                <button
                    onClick={onBack}
                    className="bg-slate-900 text-white px-6 py-3 rounded-full text-sm font-bold shadow-2xl pointer-events-auto transform hover:scale-105 transition-transform"
                >
                    Volver al listado
                </button>
            </div>
        </div>
    );
};

export default MobileJobDeck;
