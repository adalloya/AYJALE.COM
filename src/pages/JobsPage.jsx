import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import JobFilters from '../components/jobs/JobFilters';
import JobDetailView from '../components/jobs/JobDetailView';
import ApplicationModal from '../components/jobs/ApplicationModal';
import { Building, MapPin, DollarSign, Tag, Briefcase } from 'lucide-react';

import { formatFriendlyDate } from '../utils/dateUtils';

const JobsPage = () => {
    const { jobs, users, applications, applyToJob } = useData();
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [showModal, setShowModal] = useState(false);
    const [applying, setApplying] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const [filters, setFilters] = useState({
        keyword: searchParams.get('keyword') || '',
        state: searchParams.get('state') || '',
        category: searchParams.get('category') || '',
        type: searchParams.get('type') || '',
        minSalary: searchParams.get('minSalary') || ''
    });

    const [selectedJobId, setSelectedJobId] = useState(() => {
        const jobIdParam = searchParams.get('jobId');
        return jobIdParam ? Number(jobIdParam) : null;
    });

    // Update filters when URL params change
    useEffect(() => {
        setFilters({
            keyword: searchParams.get('keyword') || '',
            state: searchParams.get('state') || '',
            category: searchParams.get('category') || '',
            type: searchParams.get('type') || '',
            minSalary: searchParams.get('minSalary') || ''
        });
    }, [searchParams]);

    const handleSearch = () => {
        const params = {};
        if (filters.keyword) params.keyword = filters.keyword;
        if (filters.state) params.state = filters.state;
        if (filters.category) params.category = filters.category;
        if (filters.type) params.type = filters.type;
        if (filters.minSalary) params.minSalary = filters.minSalary;
        setSearchParams(params);
    };

    const filteredJobs = jobs
        .filter(job => {
            if (!job.active) return false;

            // Keyword Filter
            if (filters.keyword) {
                const keyword = filters.keyword.toLowerCase();
                const companyName = job.profiles ? job.profiles.name.toLowerCase() : '';
                const matchesKeyword = job.title.toLowerCase().includes(keyword) ||
                    job.description.toLowerCase().includes(keyword) ||
                    companyName.includes(keyword);
                if (!matchesKeyword) return false;
            }

            // State Filter
            if (filters.state && !job.location.includes(filters.state)) return false;

            // Category Filter (with Legacy Mapping)
            if (filters.category) {
                const categoryMapping = {
                    'Almacén e Inventarios': ['Almacén'],
                    'Limpieza y Servicios Generales': ['Limpieza'],
                    'Administrativo y Oficina': ['Administración'],
                    'Logística y Transporte': ['Chofer'],
                    'Producción y Manufactura': ['Producción'],
                    'Ventas y Comercio': ['Ventas'],
                    'Mantenimiento y Reparaciones': ['Mantenimiento'],
                    'Seguridad y Vigilancia': ['Seguridad'],
                    'Hostelería y Turismo': ['Servicios']
                };

                const legacyMatches = categoryMapping[filters.category] || [];
                const allValidCategories = [filters.category, ...legacyMatches];

                if (!allValidCategories.includes(job.category)) return false;
            }

            // Type Filter
            if (filters.type && job.type !== filters.type) return false;

            // Salary Filter
            if (filters.minSalary) {
                const min = Number(filters.minSalary);
                const jobMin = job.salary_min || job.salary || 0;
                const jobMax = job.salary_max || job.salary || 0;
                if (jobMax < min) return false;
            }

            return true;
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Auto-select first job if none selected and jobs exist (Desktop only)
    useEffect(() => {
        if (!selectedJobId && filteredJobs.length > 0 && window.innerWidth >= 1024) {
            setSelectedJobId(filteredJobs[0].id);
        }
    }, [filteredJobs, selectedJobId]);

    // Handle resize and initial mobile load
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024 && selectedJobId) {
                // If resizing to mobile and a job is selected, go to deck view
                navigate(`/jobs/${selectedJobId}`, {
                    state: {
                        jobIds: filteredJobs.map(j => j.id),
                        fromJobsPage: true
                    }
                });
            }
        };

        // Check for explicit "deck view" request (from Landing Page categories)
        const viewMode = searchParams.get('view');
        const isMobile = window.innerWidth < 1024;

        if (isMobile && filteredJobs.length > 0) {
            // If "view=deck" is present OR we are just landing here without explicit "showList" intent
            // AND we haven't already navigated (check if we are already on a detail page? No, this is JobsPage)

            if (viewMode === 'deck' || !location.state?.showList) {
                const targetJobId = selectedJobId || filteredJobs[0].id;
                navigate(`/jobs/${targetJobId}`, {
                    replace: true, // Replace history to avoid back button loop
                    state: {
                        jobIds: filteredJobs.map(j => j.id),
                        fromJobsPage: true
                    }
                });
            }
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [selectedJobId, filteredJobs, navigate, location.state, searchParams]);

    const selectedJob = jobs.find(j => j.id === selectedJobId);
    const selectedCompany = selectedJob ? selectedJob.profiles : null;
    const hasApplied = user && selectedJob && applications.some(app => app.job_id === selectedJob.id && app.candidate_id === user.id);

    const isProfileComplete = () => {
        if (!user) return false;
        const required = ['name', 'title', 'location', 'bio'];
        const hasRequired = required.every(field => user[field] && user[field].trim() !== '');
        const hasSkills = Array.isArray(user.skills) ? user.skills.length > 0 : (user.skills && user.skills.trim() !== '');
        return hasRequired && hasSkills;
    };

    const handleApply = () => {
        if (!user) {
            navigate(`/auth?returnUrl=/jobs`);
            return;
        }

        if (user.role !== 'candidate') {
            alert('Solo los candidatos pueden postularse.');
            return;
        }

        const job = jobs.find(j => j.id === selectedJobId);
        if (!job) return;

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
        const job = jobs.find(j => j.id === selectedJobId);
        if (!job) return;

        setApplying(true);
        try {
            await applyToJob(job.id, user.id, {
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

    // Helper to format salary for list view
    const formatSalaryList = (job) => {
        if (!job) return 'No mostrado';
        const fmt = (n) => {
            const num = Number(n);
            return isNaN(num) ? n : num.toLocaleString('es-MX');
        };

        let salaryText = 'No mostrado';
        if (job.salary_min && job.salary_max) salaryText = `$${fmt(job.salary_min)} - $${fmt(job.salary_max)}`;
        else if (job.salary_min) salaryText = `Desde $${fmt(job.salary_min)}`;
        else if (job.salary_max) salaryText = `Hasta $${fmt(job.salary_max)}`;
        else if (job.salary && job.salary !== 'N/A') {
            const num = Number(job.salary);
            salaryText = !isNaN(num) && num > 0 ? `$${fmt(num)}` : 'No mostrado';
        }

        if (job.salary_period && salaryText !== 'No mostrado') {
            const periodMap = {
                'monthly': 'mensuales',
                'yearly': 'anuales',
                'weekly': 'semanales',
                'hourly': 'por hora',
                'daily': 'diarios'
            };
            const translatedPeriod = periodMap[job.salary_period.toLowerCase()] || job.salary_period;
            salaryText += ` ${translatedPeriod}`;
        }
        return salaryText;
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-4 h-full flex flex-col">
            <SEO
                title="Vacantes"
                description="Explora cientos de vacantes en todo México. Filtra por estado, categoría y encuentra tu próximo empleo hoy."
            />

            <ApplicationModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleModalSubmit}
                jobTitle={jobs.find(j => j.id === selectedJobId)?.title}
                loading={applying}
                success={isSuccess}
            />

            <JobFilters
                filters={filters}
                setFilters={setFilters}
                onSearch={handleSearch}
                resultCount={filteredJobs.length}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 lg:overflow-hidden">
                {/* Left Column: Job List */}
                <div className="lg:col-span-5 lg:overflow-y-auto custom-scrollbar pr-2 space-y-4 pb-20">
                    {filteredJobs.map((job, index) => {
                        const company = job.profiles;
                        const isSelected = job.id === selectedJobId;

                        return (
                            <div key={job.id}>
                                <div
                                    onClick={() => {
                                        if (window.innerWidth < 1024) {
                                            navigate(`/jobs/${job.id}`, {
                                                state: {
                                                    jobIds: filteredJobs.map(j => j.id),
                                                    fromJobsPage: true
                                                }
                                            });
                                        } else {
                                            setSelectedJobId(job.id);
                                        }
                                    }}
                                    className={`bg-white rounded-xl p-4 cursor-pointer transition-all border ${isSelected
                                        ? 'border-orange-500 ring-1 ring-orange-500 shadow-md'
                                        : 'border-slate-200 hover:border-orange-300 hover:shadow-sm'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className={`font-bold text-lg line-clamp-1 ${isSelected ? 'text-secondary-700' : 'text-slate-900'}`}>
                                            {job.title.charAt(0).toUpperCase() + job.title.slice(1).toLowerCase()}
                                        </h3>
                                        {job.is_external && (
                                            <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wide">
                                                Externa
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center mb-3">
                                        <div className="flex-shrink-0 mr-3">
                                            {!job.is_confidential && company?.logo ? (
                                                <img
                                                    src={company.logo}
                                                    alt={company.name}
                                                    className="w-8 h-8 object-contain"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 bg-orange-100 rounded-md flex items-center justify-center">
                                                    <Building className="w-4 h-4 text-orange-500 opacity-80" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-sm text-slate-600 font-medium line-clamp-1">
                                            {job.is_confidential ? 'Empresa Confidencial' : (company?.name || 'Empresa Confidencial')}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 text-xs text-slate-500 mb-3">
                                        <span className="flex items-center bg-slate-50 px-2 py-1 rounded">
                                            <Briefcase className="w-3 h-3 mr-1" />
                                            {job.type}
                                        </span>
                                        <span className="flex items-center bg-slate-50 px-2 py-1 rounded">
                                            <Tag className="w-3 h-3 mr-1" />
                                            {job.category}
                                        </span>
                                        <span className="flex items-center bg-slate-50 px-2 py-1 rounded">
                                            <MapPin className="w-3 h-3 mr-1" />
                                            {job.location}
                                        </span>
                                        <span className="flex items-center bg-slate-50 px-2 py-1 rounded">
                                            <DollarSign className="w-3 h-3 mr-1" />
                                            {formatSalaryList(job)}
                                        </span>
                                    </div>

                                    <div className="text-xs text-slate-400 text-right">
                                        {formatFriendlyDate(job.created_at)}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {filteredJobs.length === 0 && (
                        <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200">
                            No se encontraron vacantes.
                        </div>
                    )}
                </div>

                {/* Right Column: Job Details (Desktop Only) */}
                <div className="hidden lg:block lg:col-span-7 h-full overflow-hidden">
                    <JobDetailView
                        job={selectedJob}
                        company={selectedCompany}
                        onApply={handleApply}
                        hasApplied={hasApplied}
                    />
                </div>
            </div>
        </div>
    );
};

export default JobsPage;
