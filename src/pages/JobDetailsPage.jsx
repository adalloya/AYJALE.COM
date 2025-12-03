import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import MobileJobDeck from '../components/jobs/MobileJobDeck';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import JobDetailView from '../components/jobs/JobDetailView';
import { ArrowLeft } from 'lucide-react';
import ApplicationModal from '../components/jobs/ApplicationModal';

const JobDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { jobs, users, applications, applyToJob, loading, incrementJobView } = useData();
    const { user } = useAuth();

    useEffect(() => {
        if (id) {
            // incrementJobView(id); // Temporarily disabled to prevent infinite re-render loop
        }
    }, [id, incrementJobView]);

    const [showModal, setShowModal] = useState(false);
    const [applying, setApplying] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);

            // If resizing to desktop, redirect to main jobs page with selected job
            // We use replace: true to avoid cluttering history
            if (!mobile && id) {
                navigate(`/jobs?jobId=${id}`, { replace: true });
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [id, navigate]);

    const job = jobs.find(j => j.id === Number(id));
    const company = job?.profiles;
    const jobIds = location.state?.jobIds;

    const deckJobs = useMemo(() => {
        return (jobIds && jobIds.length > 0)
            ? jobIds.map(id => jobs.find(j => j.id === id)).filter(Boolean)
            : (job ? [job] : []);
    }, [jobIds, jobs, job]);

    const handleBack = useCallback(() => {
        // Check if we have history state to go back to
        if (location.key !== 'default') {
            navigate(-1);
        } else {
            // Fallback if opened directly
            navigate('/');
        }
    }, [location.key, navigate]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-600"></div>
            </div>
        );
    }

    if (!job) {
        return <div className="text-center py-12">Vacante no encontrada.</div>;
    }

    const hasApplied = user && applications.some(app => app.job_id === job.id && app.candidate_id === user.id);

    const isProfileComplete = () => {
        if (!user) return false;
        const required = ['name', 'title', 'location', 'bio'];
        const hasRequired = required.every(field => user[field] && user[field].trim() !== '');
        const hasSkills = Array.isArray(user.skills) ? user.skills.length > 0 : (user.skills && user.skills.trim() !== '');
        return hasRequired && hasSkills;
    };

    const handleApplyClick = () => {
        if (!user) {
            navigate(`/auth?returnUrl=/jobs/${id}`);
            return;
        }

        if (user.role !== 'candidate') {
            alert('Solo los candidatos pueden postularse.');
            return;
        }

        if (job.is_external && job.external_url) {
            window.open(job.external_url, '_blank', 'noopener,noreferrer');
            return;
        }

        if (isProfileComplete()) {
            setShowModal(true);
        } else {
            navigate(`/profile?applyingTo=${job.id}`);
        }
    };

    const handleModalSubmit = async (comments) => {
        setApplying(true);
        try {
            await applyToJob(job.id, user.id, {
                name: user.name,
                email: user.email,
                title: user.title,
                location: user.location,
                bio: user.bio,
                skills: user.skills, // Assuming it's already in correct format in user object
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



    // If on mobile, always show the deck (either with list or single job)
    if (isMobile) {
        // console.log('JobDetailsPage: Detected Mobile View');
        // Filter jobs from context to match the IDs passed, or use current job if no IDs

        // console.log('JobDetailsPage: Deck Jobs:', deckJobs.length);

        if (deckJobs.length > 0) {
            return (
                <MobileJobDeck
                    jobs={deckJobs}
                    initialJobId={id}
                    onBack={handleBack}
                />
            );
        }
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <SEO
                title={job.title}
                description={`${job.title} en ${job.location}. ${job.description.substring(0, 150)}...`}
            />
            <button
                onClick={() => navigate('/jobs')}
                className="mb-4 flex items-center text-slate-600 hover:text-secondary-600 transition-colors font-medium"
            >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Volver a vacantes
            </button>
            <JobDetailView
                job={job}
                company={company}
                onApply={handleApplyClick}
                hasApplied={hasApplied}
            />
            <ApplicationModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleModalSubmit}
                jobTitle={job.title}
                loading={applying}
                success={isSuccess}
            />
        </div>
    );
};

export default JobDetailsPage;
