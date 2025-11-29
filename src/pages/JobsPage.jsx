import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { MEXICAN_STATES, JOB_CATEGORIES } from '../data/mockData';
import { Search, MapPin, Briefcase, DollarSign, Building } from 'lucide-react';
import SEO from '../components/SEO';

const JobsPage = () => {
    const { jobs, users } = useData();
    const [searchParams, setSearchParams] = useSearchParams();

    const [filters, setFilters] = useState({
        keyword: searchParams.get('keyword') || '',
        state: searchParams.get('state') || '',
        category: searchParams.get('category') || ''
    });

    // Update filters when URL params change
    useEffect(() => {
        setFilters({
            keyword: searchParams.get('keyword') || '',
            state: searchParams.get('state') || '',
            category: searchParams.get('category') || ''
        });
    }, [searchParams]);

    const handleSearch = () => {
        const params = {};
        if (filters.keyword) params.keyword = filters.keyword;
        if (filters.state) params.state = filters.state;
        if (filters.category) params.category = filters.category;
        setSearchParams(params);
    };

    const filteredJobs = jobs.filter(job => {
        const company = users.find(u => u.id === job.companyId);
        const companyName = company ? company.name.toLowerCase() : '';

        const matchesKeyword = job.title.toLowerCase().includes(filters.keyword.toLowerCase()) ||
            job.description.toLowerCase().includes(filters.keyword.toLowerCase()) ||
            companyName.includes(filters.keyword.toLowerCase());

        const matchesState = filters.state ? job.location.includes(filters.state) : true;
        const matchesCategory = filters.category ? job.category === filters.category : true;
        return matchesKeyword && matchesState && matchesCategory && job.active;
    }).sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));

    return (
        <div className="space-y-8">
            <SEO
                title="Vacantes"
                description="Explora cientos de vacantes en todo México. Filtra por estado, categoría y encuentra tu próximo empleo hoy."
            />
            {/* Filters Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Puesto, empresa o palabra clave"
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none"
                            value={filters.keyword}
                            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                        />
                    </div>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                        <select
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none appearance-none bg-white"
                            value={filters.state}
                            onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                        >
                            <option value="">Todo México</option>
                            {MEXICAN_STATES.map(state => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>
                    </div>
                    <div className="relative">
                        <Briefcase className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                        <select
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none appearance-none bg-white"
                            value={filters.category}
                            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        >
                            <option value="">Todas las Categorías</option>
                            {JOB_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={handleSearch}
                        className="bg-secondary-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-secondary-700 transition-colors shadow-sm hover:shadow"
                    >
                        Actualizar Búsqueda
                    </button>
                </div>
            </div>

            {/* Results Section */}
            <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                    {filteredJobs.length} {filteredJobs.length === 1 ? 'Vacante Encontrada' : 'Vacantes Encontradas'}
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredJobs.map(job => {
                        const company = users.find(u => u.id === job.companyId);
                        return (
                            <div key={job.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1 pr-4">
                                        <h3 className="text-lg font-semibold text-slate-900 line-clamp-1">{job.title}</h3>
                                        <p className="text-slate-500 text-sm font-medium mt-1 line-clamp-1">
                                            {job.isConfidential ? 'Empresa Confidencial' : (company?.name || 'Empresa Confidencial')}
                                        </p>
                                        <p className="text-primary-600 font-medium text-sm mt-1">{job.category}</p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        {!job.isConfidential && company?.logo ? (
                                            <img
                                                src={company.logo}
                                                alt={company.name}
                                                className="w-12 h-12 object-contain rounded-lg border border-slate-100 p-1"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                                <Building className="w-6 h-6 text-orange-500 opacity-80" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mb-6">
                                    <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full whitespace-nowrap">{job.type}</span>
                                </div>

                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center text-slate-500 text-sm">
                                        <MapPin className="w-4 h-4 mr-2" />
                                        {job.location}
                                    </div>
                                    <div className="flex items-center text-slate-500 text-sm">
                                        <DollarSign className="w-4 h-4 mr-2" />
                                        ${job.salary.toLocaleString('es-MX')} {job.currency}
                                    </div>
                                </div>

                                <Link
                                    to={`/jobs/${job.id}`}
                                    className="block w-full text-center bg-white border border-secondary-600 text-secondary-600 hover:bg-secondary-50 font-medium py-2 rounded-lg transition-colors"
                                >
                                    Ver Detalles
                                </Link>
                            </div>
                        );
                    })}
                    {filteredJobs.length === 0 && (
                        <div className="col-span-full text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200">
                            No se encontraron vacantes con estos filtros. Intenta ampliar tu búsqueda.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JobsPage;
