import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import JobDetailView from '../components/jobs/JobDetailView';

const JobDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { jobs, users, applications } = useData();
    const { user } = useAuth();

    const job = jobs.find(j => j.id === Number(id));
    const company = job?.profiles;

    if (!job) {
        return <div className="text-center py-12">Vacante no encontrada.</div>;
    }

    const hasApplied = user && applications.some(app => app.job_id === job.id && app.candidate_id === user.id);

    const handleApply = () => {
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

        navigate(`/profile?applyingTo=${job.id}`);
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <SEO
                title={job.title}
                description={`${job.title} en ${job.location}. ${job.description.substring(0, 150)}...`}
            />
            <JobDetailView
                job={job}
                company={company}
                onApply={handleApply}
                hasApplied={hasApplied}
            />
        </div>
    );
};

export default JobDetailsPage;
