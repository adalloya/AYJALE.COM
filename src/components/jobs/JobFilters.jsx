import { useMemo, useState, useEffect } from 'react';
import { Search, MapPin, Filter, ChevronDown, RotateCcw } from 'lucide-react';
import { MEXICAN_STATES, JOB_CATEGORIES } from '../../data/mockData';
import { useData } from '../../context/DataContext';
import { getEducationLevel, getExperienceLevel, matchesStateFilter } from '../../utils/jobUtils';

const JobFilters = ({ filters, setFilters, onSearch, onResetFilters }) => {
    const { jobs, totalJobCount } = useData();
    // Expand by default on mobile screens (< 768px)
    const [isExpanded, setIsExpanded] = useState(() => window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setIsExpanded(true);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const activeFilterCount = [filters.salaryRange, filters.category, filters.education, filters.experience].filter(Boolean).length;

    // Pre-aggregate high-performance facet index (< 1ms zero-lag in-memory computation)
    const facets = useMemo(() => {
        const counts = {
            salary: { '0-8000': 0, '8000-12000': 0, '12000-18000': 0, '18000-25000': 0, '25000-40000': 0, '40000+': 0 },
            date: { '24h': 0, '7d': 0, '30d': 0 },
            category: {},
            education: {},
            experience: {}
        };

        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        const sevenDays = 7 * oneDay;
        const thirtyDays = 30 * oneDay;

        (jobs || []).forEach(job => {
            if (!job.active) return;

            // Apply active state filter to facet calculations so counts reflect 100% of selected state!
            if (filters.state && !matchesStateFilter(job.location, filters.state)) return;

            // 1. Salary facets
            const sal = Number(job.salary_max || job.salary_min || job.salary || 0);
            if (sal > 0) {
                if (sal <= 8000) counts.salary['0-8000']++;
                if (sal >= 8000 && sal <= 12000) counts.salary['8000-12000']++;
                if (sal >= 12000 && sal <= 18000) counts.salary['12000-18000']++;
                if (sal >= 18000 && sal <= 25000) counts.salary['18000-25000']++;
                if (sal >= 25000 && sal <= 40000) counts.salary['25000-40000']++;
                if (sal >= 40000) counts.salary['40000+']++;
            }

            // 2. Date facets
            if (job.created_at) {
                const createdTime = new Date(job.created_at).getTime();
                const diff = now - createdTime;
                if (diff <= oneDay) counts.date['24h']++;
                if (diff <= sevenDays) counts.date['7d']++;
                if (diff <= thirtyDays) counts.date['30d']++;
            }

            // 3. Category facets
            if (job.category) {
                counts.category[job.category] = (counts.category[job.category] || 0) + 1;
            }

            // 4. Education facets
            const edu = getEducationLevel(job);
            if (edu) {
                counts.education[edu] = (counts.education[edu] || 0) + 1;
            }

            // 5. Experience facets
            const exp = getExperienceLevel(job);
            if (exp) {
                counts.experience[exp] = (counts.experience[exp] || 0) + 1;
            }
        });

        return counts;
    }, [jobs, filters.state]);

    // Aggregate state vacancy counts across all active jobs for the state dropdown selector
    const stateCounts = useMemo(() => {
        const counts = {};
        (jobs || []).forEach(job => {
            if (!job.active) return;
            MEXICAN_STATES.forEach(st => {
                if (matchesStateFilter(job.location, st)) {
                    counts[st] = (counts[st] || 0) + 1;
                }
            });
        });
        return counts;
    }, [jobs]);

    const activeCategories = JOB_CATEGORIES.filter(cat => (facets.category[cat] || 0) > 0);

    const totalActiveCount = Math.max(totalJobCount || 0, (jobs || []).filter(j => j.active).length);

    return (
        <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-2xs border border-slate-200/90 mb-4 space-y-3">
            <div className="flex flex-col md:flex-row gap-2.5 items-center">
                {/* Keyword Search */}
                <div className="flex-1 w-full relative">
                    <Search className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Puesto, empresa o palabra clave"
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none text-sm font-medium"
                        value={filters.keyword}
                        onChange={(e) => handleChange('keyword', e.target.value)}
                    />
                </div>

                {/* Location */}
                <div className="flex-1 w-full relative">
                    <MapPin className="absolute left-3.5 top-3 text-slate-400 w-4 h-4 pointer-events-none z-10" />
                    <select
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none appearance-none bg-white text-sm font-medium text-slate-800 cursor-pointer"
                        value={filters.state}
                        onChange={(e) => handleChange('state', e.target.value)}
                    >
                        <option value="">Todo México ({totalActiveCount.toLocaleString('es-MX')})</option>
                        {MEXICAN_STATES.map(state => {
                            const count = stateCounts[state] || 0;
                            return (
                                <option key={state} value={state}>
                                    {state} ({count.toLocaleString('es-MX')})
                                </option>
                            );
                        })}
                    </select>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    {/* Collapsible Filter Toggle Button */}
                    <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border flex-1 md:flex-none ${isExpanded || activeFilterCount > 0 ? 'bg-secondary-50 text-secondary-700 border-secondary-300' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                    >
                        <Filter className="w-3.5 h-3.5 text-secondary-600" />
                        <span>{isExpanded ? 'Ocultar Filtros' : 'Filtros'}</span>
                        {activeFilterCount > 0 && (
                            <span className="bg-secondary-600 text-white w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center">
                                {activeFilterCount}
                            </span>
                        )}
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    <button
                        onClick={onSearch}
                        className="bg-secondary-600 text-white px-6 py-2 rounded-xl font-extrabold hover:bg-secondary-700 transition-all shadow-2xs hover:shadow text-sm whitespace-nowrap cursor-pointer active:scale-95 flex-1 md:flex-none"
                    >
                        Buscar
                    </button>
                </div>
            </div>

            {/* COLLAPSIBLE HORIZONTAL PILL FILTER ROW */}
            {isExpanded && (
                <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2 items-center animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="flex items-center text-slate-400 text-xs font-bold mr-1">
                        <Filter className="w-3.5 h-3.5 mr-1" />
                        Filtrar por:
                    </div>

                    {/* 1. Sueldo Filter */}
                    <select
                        className={`border rounded-xl px-3 py-1.5 text-xs font-bold outline-none cursor-pointer transition-all ${filters.salaryRange ? 'bg-secondary-50 border-secondary-300 text-secondary-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                        value={filters.salaryRange || ''}
                        onChange={(e) => handleChange('salaryRange', e.target.value)}
                    >
                        <option value="">Cualquier sueldo</option>
                        <option value="0-8000">Hasta $8,000 / mes ({facets.salary['0-8000']})</option>
                        <option value="8000-12000">$8,000 - $12,000 / mes ({facets.salary['8000-12000']})</option>
                        <option value="12000-18000">$12,000 - $18,000 / mes ({facets.salary['12000-18000']})</option>
                        <option value="18000-25000">$18,000 - $25,000 / mes ({facets.salary['18000-25000']})</option>
                        <option value="25000-40000">$25,000 - $40,000 / mes ({facets.salary['25000-40000']})</option>
                        <option value="40000+">Más de $40,000 / mes ({facets.salary['40000+']})</option>
                    </select>

                    {/* 2. Categoría Filter */}
                    <select
                        className={`border rounded-xl px-3 py-1.5 text-xs font-bold outline-none cursor-pointer transition-all max-w-[210px] ${filters.category ? 'bg-secondary-50 border-secondary-300 text-secondary-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                        value={filters.category || ''}
                        onChange={(e) => handleChange('category', e.target.value)}
                    >
                        <option value="">Todas las categorías</option>
                        {activeCategories.map(cat => (
                            <option key={cat} value={cat}>
                                {cat} ({facets.category[cat]})
                            </option>
                        ))}
                    </select>

                    {/* 3. Educación Filter */}
                    <select
                        className={`border rounded-xl px-3 py-1.5 text-xs font-bold outline-none cursor-pointer transition-all ${filters.education ? 'bg-secondary-50 border-secondary-300 text-secondary-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                        value={filters.education || ''}
                        onChange={(e) => handleChange('education', e.target.value)}
                    >
                        <option value="">Todos los niveles educativos</option>
                        <option value="Licenciatura">Licenciatura ({facets.education['Licenciatura'] || 0})</option>
                        <option value="Preparatoria / Bachillerato">Preparatoria / Bachillerato ({facets.education['Preparatoria / Bachillerato'] || 0})</option>
                        <option value="Carrera Técnica">Carrera Técnica ({facets.education['Carrera Técnica'] || 0})</option>
                        <option value="Secundaria">Secundaria ({facets.education['Secundaria'] || 0})</option>
                    </select>

                    {/* 4. Experiencia Filter */}
                    <select
                        className={`border rounded-xl px-3 py-1.5 text-xs font-bold outline-none cursor-pointer transition-all ${filters.experience ? 'bg-secondary-50 border-secondary-300 text-secondary-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                        value={filters.experience || ''}
                        onChange={(e) => handleChange('experience', e.target.value)}
                    >
                        <option value="">Cualquier experiencia</option>
                        <option value="Sin experiencia">Sin experiencia ({facets.experience['Sin experiencia'] || 0})</option>
                        <option value="6 meses de exp.">6 meses de exp. ({facets.experience['6 meses de exp.'] || 0})</option>
                        <option value="1 - 2 años de exp.">1 - 2 años de exp. ({facets.experience['1 - 2 años de exp.'] || 0})</option>
                        <option value="2 - 3 años de exp.">2 - 3 años de exp. ({facets.experience['2 - 3 años de exp.'] || 0})</option>
                        <option value="3+ años de exp.">3+ años de exp. ({facets.experience['3+ años de exp.'] || 0})</option>
                    </select>

                    {/* Quitar Filtros Button */}
                    {(activeFilterCount > 0 || filters.keyword || filters.state) && (
                        <button
                            type="button"
                            onClick={onResetFilters}
                            className="ml-auto text-xs font-extrabold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Quitar filtros</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default JobFilters;
