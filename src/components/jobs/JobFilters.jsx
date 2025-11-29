import { Search, MapPin, Briefcase, DollarSign, Filter } from 'lucide-react';
import { MEXICAN_STATES, JOB_CATEGORIES } from '../../data/mockData';

const JobFilters = ({ filters, setFilters, onSearch, resultCount }) => {

    const handleChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
                {/* Keyword Search */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Puesto, empresa o palabra clave"
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none text-sm"
                        value={filters.keyword}
                        onChange={(e) => handleChange('keyword', e.target.value)}
                    />
                </div>

                {/* Location */}
                <div className="flex-1 relative">
                    <MapPin className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
                    <select
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none appearance-none bg-white text-sm"
                        value={filters.state}
                        onChange={(e) => handleChange('state', e.target.value)}
                    >
                        <option value="">Selecciona un Estado...</option>
                        {MEXICAN_STATES.map(state => (
                            <option key={state} value={state}>{state}</option>
                        ))}
                    </select>
                </div>



                <button
                    onClick={onSearch}
                    className="bg-secondary-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-secondary-700 transition-colors shadow-sm hover:shadow text-sm whitespace-nowrap"
                >
                    Buscar
                </button>
            </div>

            {/* Advanced Filters Row */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-4 items-center">
                <div className="flex items-center text-slate-500 text-sm font-medium">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros:
                </div>

                {/* Category */}
                <select
                    className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-secondary-500 outline-none bg-white max-w-[200px]"
                    value={filters.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                >
                    <option value="">Todas las Categorías</option>
                    {JOB_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>

                {/* Job Type */}
                <select
                    className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-secondary-500 outline-none bg-white"
                    value={filters.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                >
                    <option value="">Tipo de Empleo</option>
                    <option value="Tiempo completo">Tiempo completo</option>
                    <option value="Medio tiempo">Medio tiempo</option>
                    <option value="Remoto">Remoto</option>
                    <option value="Híbrido">Híbrido</option>
                    <option value="Por proyecto">Por proyecto</option>
                    <option value="Becario / Prácticas">Becario / Prácticas</option>
                </select>

                {/* Min Salary */}
                <div className="relative w-32">
                    <DollarSign className="absolute left-2 top-1.5 text-slate-400 w-4 h-4" />
                    <input
                        type="number"
                        placeholder="Sueldo Mín."
                        className="w-full pl-8 pr-2 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-secondary-500 outline-none text-sm"
                        value={filters.minSalary}
                        onChange={(e) => handleChange('minSalary', e.target.value)}
                    />
                </div>

                <div className="ml-auto text-sm text-slate-500">
                    {resultCount} {resultCount === 1 ? 'resultado' : 'resultados'}
                </div>
            </div>
        </div>
    );
};

export default JobFilters;
