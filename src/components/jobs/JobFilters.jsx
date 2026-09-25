import { useMemo } from 'react';
import { Search, MapPin, Briefcase, DollarSign, Filter, Calendar, Tag, GraduationCap, ArrowUpDown } from 'lucide-react';
import { MEXICAN_STATES, JOB_CATEGORIES } from '../../data/mockData';
import { useData } from '../../context/DataContext';
import { getEducationLevel, getExperienceLevel } from '../../utils/jobUtils';

const JobFilters = ({ filters, setFilters, onSearch, resultCount, sortBy, onSortChange }) => {
    const { jobs } = useData();

    const handleChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    // Pre-aggregate high-performance facet index (< 1ms zero-lag in-memory computation)
    const facets = useMemo(() => {
        const counts = {
            salary: { '0-8000': 0, '8000-12000': 0, '12000-18000': 0, '18000-25000': 0, '25000-40000': 0, '40000+': 0 },
            date: { '24h': 0, '7d': 0, '30d': 0 },
            type: {},
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

            // 3. Modality / Type facets
            if (job.type) {
                counts.type[job.type] = (counts.type[job.type] || 0) + 1;
            }

            // 4. Category facets
            if (job.category) {
                counts.category[job.category] = (counts.category[job.category] || 0) + 1;
            }

            // 5. Education facets
            const edu = getEducationLevel(job);
            if (edu) {
                counts.education[edu] = (counts.education[edu] || 0) + 1;
            }

            // 6. Experience facets
            const exp = getExperienceLevel(job);
            if (exp) {
                counts.experience[exp] = (counts.experience[exp] || 0) + 1;
            }
        });

        return counts;
    }, [jobs]);

    const activeCategories = JOB_CATEGORIES.filter(cat => (facets.category[cat] || 0) > 0);

    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
                {/* Keyword Search */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Puesto, empresa o palabra clave"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none text-sm font-medium"
                        value={filters.keyword}
                        onChange={(e) => handleChange('keyword', e.target.value)}
                    />
                </div>

                {/* Location */}
                <div className="flex-1 relative">
                    <MapPin className="absolute left-3.5 top-3 text-slate-400 w-4 h-4 pointer-events-none z-10" />
                    <select
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none appearance-none bg-white text-sm font-medium text-slate-800"
                        value={filters.state}
                        onChange={(e) => handleChange('state', e.target.value)}
                    >
                        <option value="">Todo México</option>
                        {MEXICAN_STATES.map(state => (
                            <option key={state} value={state}>{state}</option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={onSearch}
                    className="bg-secondary-600 text-white px-7 py-2.5 rounded-xl font-extrabold hover:bg-secondary-700 transition-all shadow-sm hover:shadow text-sm whitespace-nowrap cursor-pointer active:scale-95"
                >
                    Buscar
                </button>
            </div>

            {/* OCC-STYLE HORIZONTAL PILL FILTER ROW & SORTING CONTROL */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2.5 items-center">
                <div className="flex items-center text-slate-400 text-xs font-bold mr-1">
                    <Filter className="w-3.5 h-3.5 mr-1" />
                    Filtros:
                </div>

                {/* 1. Sueldo Filter */}
                <select
                    className={`border rounded-xl px-3 py-1.5 text-xs font-bold outline-none cursor-pointer transition-all ${filters.salaryRange ? 'bg-secondary-50 border-secondary-300 text-secondary-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                    value={filters.salaryRange || ''}
                    onChange={(e) => handleChange('salaryRange', e.target.value)}
                >
                    <option value="">Sueldo ▾</option>
                    <option value="0-8000">Hasta $8,000 / mes ({facets.salary['0-8000']})</option>
                    <option value="8000-12000">$8,000 - $12,000 / mes ({facets.salary['8000-12000']})</option>
                    <option value="12000-18000">$12,000 - $18,000 / mes ({facets.salary['12000-18000']})</option>
                    <option value="18000-25000">$18,000 - $25,000 / mes ({facets.salary['18000-25000']})</option>
                    <option value="25000-40000">$25,000 - $40,000 / mes ({facets.salary['25000-40000']})</option>
                    <option value="40000+">Más de $40,000 / mes ({facets.salary['40000+']})</option>
                </select>

                {/* 2. Fecha Filter */}
                <select
                    className={`border rounded-xl px-3 py-1.5 text-xs font-bold outline-none cursor-pointer transition-all ${filters.datePosted ? 'bg-secondary-50 border-secondary-300 text-secondary-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                    value={filters.datePosted || ''}
                    onChange={(e) => handleChange('datePosted', e.target.value)}
                >
                    <option value="">Fecha ▾</option>
                    <option value="24h">Últimas 24 horas ({facets.date['24h']})</option>
                    <option value="7d">Última semana ({facets.date['7d']})</option>
                    <option value="30d">Último mes ({facets.date['30d']})</option>
                </select>

                {/* 3. Modalidad Filter */}
                <select
                    className={`border rounded-xl px-3 py-1.5 text-xs font-bold outline-none cursor-pointer transition-all ${filters.type ? 'bg-secondary-50 border-secondary-300 text-secondary-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                    value={filters.type || ''}
                    onChange={(e) => handleChange('type', e.target.value)}
                >
                    <option value="">Modalidad ▾</option>
                    <option value="Tiempo completo">Tiempo completo ({facets.type['Tiempo completo'] || 0})</option>
                    <option value="Medio tiempo">Medio tiempo ({facets.type['Medio tiempo'] || 0})</option>
                    <option value="Remoto">Remoto ({facets.type['Remoto'] || 0})</option>
                    <option value="Híbrido">Híbrido ({facets.type['Híbrido'] || 0})</option>
                    <option value="Por proyecto">Por proyecto ({facets.type['Por proyecto'] || 0})</option>
                    <option value="Becario / Prácticas">Becario / Prácticas ({facets.type['Becario / Prácticas'] || 0})</option>
                </select>

                {/* 4. Categoría Filter */}
                <select
                    className={`border rounded-xl px-3 py-1.5 text-xs font-bold outline-none cursor-pointer transition-all max-w-[210px] ${filters.category ? 'bg-secondary-50 border-secondary-300 text-secondary-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                    value={filters.category || ''}
                    onChange={(e) => handleChange('category', e.target.value)}
                >
                    <option value="">Categoría ▾</option>
                    {activeCategories.map(cat => (
                        <option key={cat} value={cat}>
                            {cat} ({facets.category[cat]})
                        </option>
                    ))}
                </select>

                {/* 5. Educación Filter */}
                <select
                    className={`border rounded-xl px-3 py-1.5 text-xs font-bold outline-none cursor-pointer transition-all ${filters.education ? 'bg-secondary-50 border-secondary-300 text-secondary-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                    value={filters.education || ''}
                    onChange={(e) => handleChange('education', e.target.value)}
                >
                    <option value="">Educación ▾</option>
                    <option value="Licenciatura">Licenciatura ({facets.education['Licenciatura'] || 0})</option>
                    <option value="Preparatoria / Bachillerato">Preparatoria / Bachillerato ({facets.education['Preparatoria / Bachillerato'] || 0})</option>
                    <option value="Carrera Técnica">Carrera Técnica ({facets.education['Carrera Técnica'] || 0})</option>
                    <option value="Secundaria">Secundaria ({facets.education['Secundaria'] || 0})</option>
                </select>

                {/* 6. Experiencia Filter */}
                <select
                    className={`border rounded-xl px-3 py-1.5 text-xs font-bold outline-none cursor-pointer transition-all ${filters.experience ? 'bg-secondary-50 border-secondary-300 text-secondary-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                    value={filters.experience || ''}
                    onChange={(e) => handleChange('experience', e.target.value)}
                >
                    <option value="">Experiencia ▾</option>
                    <option value="Sin experiencia">Sin experiencia ({facets.experience['Sin experiencia'] || 0})</option>
                    <option value="6 meses de exp.">6 meses de exp. ({facets.experience['6 meses de exp.'] || 0})</option>
                    <option value="1 - 2 años de exp.">1 - 2 años de exp. ({facets.experience['1 - 2 años de exp.'] || 0})</option>
                    <option value="2 - 3 años de exp.">2 - 3 años de exp. ({facets.experience['2 - 3 años de exp.'] || 0})</option>
                    <option value="3+ años de exp.">3+ años de exp. ({facets.experience['3+ años de exp.'] || 0})</option>
                </select>

                {/* Sort Control & Vacancy Counter */}
                <div className="ml-auto flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                        <span>Ordenar por:</span>
                        <select
                            className="border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700 bg-white shadow-2xs outline-none cursor-pointer hover:border-slate-300"
                            value={sortBy || 'recent'}
                            onChange={(e) => onSortChange && onSortChange(e.target.value)}
                        >
                            <option value="recent">Más recientes ⬇</option>
                            <option value="salary_desc">Sueldo: Mayor a menor ⬇</option>
                            <option value="salary_asc">Sueldo: Menor a mayor ⬆</option>
                        </select>
                    </div>

                    <span className="text-xs font-extrabold text-slate-800 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/80">
                        {Number(resultCount || 0).toLocaleString('es-MX')} {resultCount === 1 ? 'vacante' : 'vacantes'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default JobFilters;
