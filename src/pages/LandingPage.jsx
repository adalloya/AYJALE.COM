import { useState } from 'react';
import { MEXICAN_STATES, JOB_CATEGORIES } from '../data/mockData';
import { Search, MapPin, Briefcase, Package, Truck, Shield, Sparkles, ShoppingBag, Hammer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CompanyCarousel from '../components/CompanyCarousel';
import SEO from '../components/SEO';

const LandingPage = () => {
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        keyword: '',
        state: '',
        category: ''
    });

    const categories = [
        { id: 'almacen', name: 'Almacén', icon: Package, color: 'bg-blue-500' },
        { id: 'chofer', name: 'Chofer', icon: Truck, color: 'bg-orange-500' },
        { id: 'seguridad', name: 'Seguridad', icon: Shield, color: 'bg-slate-700' },
        { id: 'limpieza', name: 'Limpieza', icon: Sparkles, color: 'bg-teal-500' },
        { id: 'ventas', name: 'Ventas', icon: ShoppingBag, color: 'bg-pink-500' },
        { id: 'produccion', name: 'Producción', icon: Hammer, color: 'bg-indigo-500' },
    ];

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (filters.state) params.append('state', filters.state);
        if (filters.category) params.append('category', filters.category);
        if (filters.keyword) params.append('keyword', filters.keyword);
        navigate(`/jobs?${params.toString()}`);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <SEO
                title="Inicio"
                description="Encuentra tu trabajo ideal en México. Conectamos a los mejores candidatos con las empresas líderes del país."
            />
            {/* Hero Section */}
            <section className="text-center space-y-4 py-12">
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                    Encuentra tu trabajo ideal en <span className="text-secondary-500">México</span>
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                    Conectamos a los mejores candidatos con las empresas líderes del país.
                </p>
            </section>

            {/* Search Box */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Puesto, empresa o palabra clave"
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                            value={filters.keyword}
                            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                        />
                    </div>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                        <select
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none appearance-none bg-white"
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
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none appearance-none bg-white"
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
                <div className="mt-4 flex justify-center">
                    <button
                        onClick={handleSearch}
                        className="bg-secondary-600 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-secondary-700 transition-colors shadow-md hover:shadow-lg w-full md:w-auto"
                    >
                        Buscar
                    </button>
                </div>
            </div>

            {/* Trusted Companies Carousel */}
            <div className="mt-16 mb-8">
                <CompanyCarousel />
            </div>

            {/* Featured Categories */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h2 className="text-2xl font-bold text-slate-900 mb-8">Categorías Destacadas</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => navigate(`/jobs?category=${cat.name}`)}
                            className="group relative flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:-translate-y-1"
                        >
                            <div className={`p-4 rounded-full ${cat.color} bg-opacity-10 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                <cat.icon className={`w-8 h-8 ${cat.color.replace('bg-', 'text-')}`} />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 group-hover:text-secondary-600 transition-colors">
                                {cat.name}
                            </h3>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
