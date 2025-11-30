import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import JobFilters from '../components/jobs/JobFilters';
import JobDetailView from '../components/jobs/JobDetailView';
import { Building, MapPin, DollarSign } from 'lucide-react';

const JobsPage = () => {
    const { jobs, users, applications } = useData();
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [filters, setFilters] = useState({
        keyword: searchParams.get('keyword') || '',
        state: searchParams.get('state') || '',
        category: searchParams.get('category') || '',
        type: searchParams.get('type') || '',
        minSalary: searchParams.get('minSalary') || ''
    });

    const [selectedJobId, setSelectedJobId] = useState(null);

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

    const filteredJobs = jobs.filter(job => {
        const company = users.find(u => u.id === job.company_id);
        const companyName = company ? company.name.toLowerCase() : '';

        const matchesKeyword = job.title.toLowerCase().includes(filters.keyword.toLowerCase()) ||
            job.description.toLowerCase().includes(filters.keyword.toLowerCase()) ||
            companyName.includes(filters.keyword.toLowerCase());

        const matchesState = filters.state ? job.location.includes(filters.state) : true;
        const matchesCategory = filters.category ? job.category === filters.category : true;
        const matchesType = filters.type ? job.type === filters.type : true;
        const matchesSalary = filters.minSalary ? job.salary >= Number(filters.minSalary) : true;

        return matchesKeyword && matchesState && matchesCategory && matchesType && matchesSalary && job.active;
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Auto-select first job if none selected and jobs exist
    useEffect(() => {
        if (!selectedJobId && filteredJobs.length > 0) {
            setSelectedJobId(filteredJobs[0].id);
        }
    }, [filteredJobs, selectedJobId]);

    const selectedJob = jobs.find(j => j.id === selectedJobId);
    const selectedCompany = selectedJob ? users.find(u => u.id === selectedJob.company_id) : null;
    const hasApplied = user && selectedJob && applications.some(app => app.job_id === selectedJob.id && app.candidate_id === user.id);

    const handleApply = () => {
        if (!selectedJob) return;

        if (!user) {
            navigate(`/auth?returnUrl=/jobs/${selectedJob.id}`);
            return;
        }

        if (user.role !== 'candidate') {
            alert('Solo los candidatos pueden postularse.');
            return;
        }

        if (selectedJob.is_external && selectedJob.external_url) {
            window.open(selectedJob.external_url, '_blank', 'noopener,noreferrer');
            return;
        }

        navigate(`/profile?applyingTo=${selectedJob.id}`);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-64px)] flex flex-col">
            <SEO
                title="Vacantes"
                description="Explora cientos de vacantes en todo México. Filtra por estado, categoría y encuentra tu próximo empleo hoy."
            />

            <JobFilters
                filters={filters}
                setFilters={setFilters}
                onSearch={handleSearch}
                resultCount={filteredJobs.length}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
                {/* Left Column: Job List */}
                <div className="lg:col-span-5 overflow-y-auto custom-scrollbar pr-2 space-y-4 pb-20">
                    {filteredJobs.map(job => {
                        const company = users.find(u => u.id === job.company_id);
                        const isSelected = job.id === selectedJobId;
                        return (
                            <div
                                key={job.id}
                                onClick={() => {
                                    if (window.innerWidth < 1024) {
                                        navigate(`/jobs/${job.id}`);
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
                                        {job.title}
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
                                        <MapPin className="w-3 h-3 mr-1" />
                                        {job.location}
                                    </span>
                                    <span className="flex items-center bg-slate-50 px-2 py-1 rounded">
                                        <DollarSign className="w-3 h-3 mr-1" />
                                        ${job.salary ? job.salary.toLocaleString('es-MX') : 'N/A'}
                                    </span>
                                </div>

                                <div className="text-xs text-slate-400 text-right">
                                    {new Date(job.created_at).toLocaleDateString()}
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
