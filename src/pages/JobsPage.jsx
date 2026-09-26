import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import JobFilters from '../components/jobs/JobFilters';
import JobDetailView from '../components/jobs/JobDetailView';
import ApplicationModal from '../components/jobs/ApplicationModal';
import { Building, MapPin, DollarSign, Tag, Briefcase, GraduationCap, RotateCcw, Search } from 'lucide-react';

import { formatFriendlyDate } from '../utils/dateUtils';
import { getJobCompany, matchesStateFilter, formatSalaryDisplay, getEducationLevel, getExperienceLevel } from '../utils/jobUtils';

const JobsPage = () => {
    const { jobs, totalJobCount, fetchMoreJobs, users, applications, applyToJob } = useData();
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [showModal, setShowModal] = useState(false);
    const [applying, setApplying] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const [visibleCount, setVisibleCount] = useState(20);

    const [filters, setFilters] = useState({
        keyword: searchParams.get('keyword') || '',
        state: searchParams.get('state') || '',
        category: searchParams.get('category') || '',
        type: searchParams.get('type') || '',
        minSalary: searchParams.get('minSalary') || '',
        salaryRange: searchParams.get('salaryRange') || '',
        datePosted: searchParams.get('datePosted') || '',
        education: searchParams.get('education') || '',
        experience: searchParams.get('experience') || ''
    });

    const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'recent');

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
            minSalary: searchParams.get('minSalary') || '',
            salaryRange: searchParams.get('salaryRange') || '',
            datePosted: searchParams.get('datePosted') || '',
            education: searchParams.get('education') || '',
            experience: searchParams.get('experience') || ''
        });
        setSortBy(searchParams.get('sortBy') || 'recent');
        setVisibleCount(20);
    }, [searchParams]);

    const handleSearch = () => {
        const params = {};
        if (filters.keyword) params.keyword = filters.keyword;
        if (filters.state) params.state = filters.state;
        if (filters.category) params.category = filters.category;
        if (filters.type) params.type = filters.type;
        if (filters.minSalary) params.minSalary = filters.minSalary;
        if (filters.salaryRange) params.salaryRange = filters.salaryRange;
        if (filters.datePosted) params.datePosted = filters.datePosted;
        if (filters.education) params.education = filters.education;
        if (filters.experience) params.experience = filters.experience;
        if (sortBy && sortBy !== 'recent') params.sortBy = sortBy;
        setSearchParams(params);
    };

    const handleResetFilters = () => {
        setFilters({
            keyword: '',
            state: '',
            category: '',
            type: '',
            minSalary: '',
            salaryRange: '',
            datePosted: '',
            education: '',
            experience: ''
        });
        setSearchParams({});
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

            // State Filter (Accent & Alias Insensitive)
            if (filters.state && !matchesStateFilter(job.location, filters.state)) return false;

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

                const allValidCategories = [filters.category];
                if (categoryMapping[filters.category]) {
                    allValidCategories.push(...categoryMapping[filters.category]);
                }
                for (const [key, values] of Object.entries(categoryMapping)) {
                    if (values.includes(filters.category)) {
                        allValidCategories.push(key);
                    }
                }

                if (!allValidCategories.includes(job.category)) return false;
            }

            // Type Filter
            if (filters.type && job.type !== filters.type) return false;

            // Salary Range & Min Salary Filter
            if (filters.salaryRange) {
                const jobMin = Number(job.salary_min || job.salary || 0);
                const jobMax = Number(job.salary_max || job.salary || 0);
                const effectiveSalary = jobMax || jobMin;

                if (effectiveSalary > 0) {
                    if (filters.salaryRange === '0-8000' && effectiveSalary > 8000) return false;
                    if (filters.salaryRange === '8000-12000' && (effectiveSalary < 8000 || effectiveSalary > 12000)) return false;
                    if (filters.salaryRange === '12000-18000' && (effectiveSalary < 12000 || effectiveSalary > 18000)) return false;
                    if (filters.salaryRange === '18000-25000' && (effectiveSalary < 18000 || effectiveSalary > 25000)) return false;
                    if (filters.salaryRange === '25000-40000' && (effectiveSalary < 25000 || effectiveSalary > 40000)) return false;
                    if (filters.salaryRange === '40000+' && effectiveSalary < 40000) return false;
                }
            }

            // Publication Date Filter
            if (filters.datePosted && job.created_at) {
                const jobDate = new Date(job.created_at).getTime();
                const now = Date.now();
                const diffHours = (now - jobDate) / (1000 * 60 * 60);
                if (filters.datePosted === '24h' && diffHours > 24) return false;
                if (filters.datePosted === '7d' && diffHours > 168) return false;
                if (filters.datePosted === '30d' && diffHours > 720) return false;
            }

            // Education Level Filter
            if (filters.education) {
                const jobEdu = getEducationLevel(job);
                if (!jobEdu || jobEdu.toLowerCase() !== filters.education.toLowerCase()) return false;
            }

            // Experience Level Filter
            if (filters.experience) {
                const jobExp = getExperienceLevel(job);
                if (!jobExp || jobExp.toLowerCase() !== filters.experience.toLowerCase()) return false;
            }

            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'salary_desc') {
                const salA = Number(a.salary_max || a.salary_min || a.salary || 0);
                const salB = Number(b.salary_max || b.salary_min || b.salary || 0);
                return salB - salA;
            }
            if (sortBy === 'salary_asc') {
                const salA = Number(a.salary_max || a.salary_min || a.salary || 0);
                const salB = Number(b.salary_max || b.salary_min || b.salary || 0);
                return salA - salB;
            }
            return new Date(b.created_at) - new Date(a.created_at);
        });

    // Auto-select first job if none selected and jobs exist (Desktop only)
    useEffect(() => {
        if (!selectedJobId && filteredJobs.length > 0 && window.innerWidth >= 1024) {
            setSelectedJobId(filteredJobs[0].id);
        }
    }, [filteredJobs, selectedJobId]);

    // Handle resize effect for desktop layout
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024 && selectedJobId) {
                // Keep selected job context if user resizes
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [selectedJobId]);

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

        // Open application modal directly on the job page
        setShowModal(true);
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

        // If company chose to hide salary, show placeholder
        if (job.hide_salary) {
            return 'Salario no publicado';
        }

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

    const hasActiveFilters = Boolean(filters.keyword || filters.state || filters.category || filters.type || filters.minSalary);
    const displayResultCount = hasActiveFilters
        ? filteredJobs.length
        : Math.max(totalJobCount, filteredJobs.length);

    return (
        <div className="w-full max-w-full px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:h-full lg:flex lg:flex-col min-h-screen">
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
                onResetFilters={handleResetFilters}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:flex-1 lg:min-h-0 lg:overflow-hidden">
                {/* Left Column: Job List (1/3 Width) */}
                <div className="lg:col-span-4 lg:overflow-y-auto custom-scrollbar pr-0 lg:pr-2 space-y-3 pb-16 lg:pb-24">
                    {/* Header Row Above Job List: Result Count (Left) & Sort Dropdown (Right) */}
                    <div className="flex items-center justify-between pb-1 text-xs font-bold text-slate-500">
                        <span className="text-slate-700 font-extrabold text-xs">
                            {Number(displayResultCount || 0).toLocaleString('es-MX')} {displayResultCount === 1 ? 'vacante' : 'vacantes'}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                            <span>Ordenar:</span>
                            <select
                                className="border border-slate-200 rounded-lg px-2 py-0.5 text-xs font-bold text-slate-700 bg-white shadow-2xs outline-none cursor-pointer hover:border-slate-300"
                                value={sortBy || 'recent'}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSortBy(val);
                                    const params = Object.fromEntries(searchParams.entries());
                                    if (val && val !== 'recent') {
                                        params.sortBy = val;
                                    } else {
                                        delete params.sortBy;
                                    }
                                    setSearchParams(params);
                                }}
                            >
                                <option value="recent">Más recientes</option>
                                <option value="salary_desc">Sueldo: Mayor a menor</option>
                                <option value="salary_asc">Sueldo: Menor a mayor</option>
                            </select>
                        </div>
                    </div>
                    {filteredJobs.slice(0, visibleCount).map((job, index) => {
                        const companyInfo = getJobCompany(job);
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
                                    <div className="flex justify-between items-start gap-3 mb-2">
                                        <h3 className={`font-bold text-base sm:text-lg line-clamp-1 flex-1 ${isSelected ? 'text-secondary-700' : 'text-slate-900'}`}>
                                            {job.title.charAt(0).toUpperCase() + job.title.slice(1).toLowerCase()}
                                        </h3>
                                        {/* TOP RIGHT SALARY DISPLAY (PURE GREEN TEXT, NO BG/BORDER) */}
                                        {(() => {
                                            const sal = formatSalaryDisplay(job);
                                            return sal.formatted !== 'Salario no publicado' ? (
                                                <div className="text-right flex-shrink-0">
                                                    <span className="text-emerald-600 font-extrabold text-sm sm:text-base tracking-tight whitespace-nowrap">
                                                        {sal.formatted}
                                                        {sal.period && <span className="text-emerald-600 font-bold text-xs ml-0.5">{sal.period}</span>}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="text-right flex-shrink-0">
                                                    <span className="text-slate-400 font-medium text-xs whitespace-nowrap">
                                                        No publicado
                                                    </span>
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    <div className="flex items-center mb-3">
                                        {!job.is_confidential && companyInfo.logo && (
                                            <div className="flex-shrink-0 mr-3">
                                                <img
                                                    src={companyInfo.logo}
                                                    alt={companyInfo.name}
                                                    className="w-8 h-8 object-contain"
                                                />
                                            </div>
                                        )}
                                        <div className="text-sm text-slate-600 font-medium line-clamp-1 flex-1">
                                            {companyInfo.name}
                                        </div>
                                        {job.is_external && (
                                            <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wide ml-2 flex-shrink-0">
                                                Externa
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-2 text-xs text-slate-600 mb-2">
                                        <span className="flex items-center bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                            <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                                            {job.location}
                                        </span>
                                        <span className="flex items-center bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                            <Tag className="w-3 h-3 mr-1 text-slate-400" />
                                            {job.category}
                                        </span>
                                        {(() => {
                                            const edu = getEducationLevel(job);
                                            return edu ? (
                                                <span className="flex items-center bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                                    <GraduationCap className="w-3 h-3 mr-1 text-slate-400" />
                                                    {edu}
                                                </span>
                                            ) : null;
                                        })()}
                                        {(() => {
                                            const exp = getExperienceLevel(job);
                                            return exp ? (
                                                <span className="flex items-center bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                                    <Briefcase className="w-3 h-3 mr-1 text-slate-400" />
                                                    {exp}
                                                </span>
                                            ) : null;
                                        })()}
                                    </div>

                                    <div className="text-xs text-slate-400 text-right">
                                        {formatFriendlyDate(job.created_at)}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* PROGRESSIVE LOAD MORE BUTTON (Only rendered when there are results matching search) */}
                    {filteredJobs.length > 0 && (visibleCount < filteredJobs.length || jobs.length < totalJobCount) && (
                        <div className="pt-2 text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    const nextCount = visibleCount + 20;
                                    setVisibleCount(nextCount);
                                    if (nextCount >= jobs.length && jobs.length < totalJobCount) {
                                        fetchMoreJobs(jobs.length);
                                    }
                                }}
                                className="w-full bg-white hover:bg-slate-50 text-secondary-600 font-extrabold py-3 px-4 rounded-xl border border-secondary-200 shadow-2xs hover:shadow-xs transition-all cursor-pointer text-sm"
                            >
                                Cargar más vacantes
                            </button>
                        </div>
                    )}

                    {/* PROFESSIONAL EMPTY STATE WITH RESET BUTTON */}
                    {filteredJobs.length === 0 && (
                        <div className="text-center py-16 px-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                            <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto border border-slate-200/60">
                                <Search className="w-7 h-7" />
                            </div>
                            <div className="max-w-md mx-auto space-y-1">
                                <h3 className="text-base sm:text-lg font-black text-slate-900">
                                    No encontramos vacantes para tu búsqueda
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                                    Por el momento no tenemos vacantes disponibles que coincidan con los filtros seleccionados. Te sugerimos modificar tu búsqueda o quitar los filtros aplicados.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white font-extrabold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-sm active:scale-95 cursor-pointer"
                            >
                                <RotateCcw className="w-4 h-4 text-orange-400" />
                                Quitar filtros
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Column: Job Details (Desktop Only - 2/3 Width) */}
                <div className="hidden lg:block lg:col-span-8 h-full overflow-hidden">
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
