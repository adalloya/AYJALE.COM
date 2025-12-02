import { useState } from 'react';
import { MEXICAN_STATES, JOB_CATEGORIES } from '../data/mockData';
import { Search, MapPin, Briefcase, Package, Truck, Shield, Sparkles, ShoppingBag, Hammer, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CompanyCarousel from '../components/CompanyCarousel';
import MexicoMap from '../components/MexicoMap';
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

        // Force deck view on mobile search
        if (window.innerWidth < 1024) {
            params.append('view', 'deck');
        }

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
            <div className="max-w-4xl mx-auto">
                <div className="bg-white p-2 rounded-2xl md:rounded-full shadow-lg border border-slate-200 flex flex-col md:flex-row items-center gap-2 md:gap-0">
                    <div className="relative w-full md:flex-1 md:border-r md:border-slate-200">
                        <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Título del empleo, palabras clave..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl md:rounded-l-full focus:outline-none focus:bg-slate-50 transition-colors"
                            value={filters.keyword}
                            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                        />
                    </div>
                    <div className="relative w-full md:flex-1">
                        <select
                            className="w-full px-4 py-3 rounded-xl md:rounded-r-full focus:outline-none focus:bg-slate-50 transition-colors appearance-none bg-transparent cursor-pointer"
                            value={filters.state}
                            onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                        >
                            <option value="">Selecciona un Estado...</option>
                            {MEXICAN_STATES.map(state => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleSearch}
                        className="w-full md:w-auto bg-secondary-600 text-white px-8 py-3 rounded-xl md:rounded-full font-bold hover:bg-secondary-700 transition-colors shadow-sm whitespace-nowrap md:ml-2"
                    >
                        Buscar empleos
                    </button>
                </div>
            </div>

            {/* Trusted Companies Carousel */}
            <div className="mt-16 mb-8">
                <CompanyCarousel />
            </div>

            {/* Featured Categories */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-slate-900 flex items-center justify-center gap-3">
                        <Briefcase className="w-8 h-8 text-secondary-600" />
                        Categorías Destacadas
                    </h2>
                    <p className="text-slate-600 mt-3 text-lg max-w-2xl mx-auto">
                        Explora las áreas con mayor demanda y encuentra tu lugar.
                    </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => {
                                const isMobile = window.innerWidth < 1024;
                                navigate(`/jobs?category=${cat.name}${isMobile ? '&view=deck' : ''}`);
                            }}
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

            <div className="bg-slate-50 border-y border-slate-200">
                <MexicoMap />
            </div>

            {/* What's New Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-slate-900 flex items-center justify-center gap-3">
                        <Sparkles className="w-8 h-8 text-secondary-600" />
                        Novedades
                    </h2>
                    <p className="text-slate-600 mt-3 text-lg max-w-2xl mx-auto">
                        Descubre las últimas actualizaciones y herramientas para mejorar tu búsqueda.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Card 1: AI */}
                    <div onClick={() => navigate('/whats-new')} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1">
                        <div className="h-48 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Sparkles className="w-16 h-16 text-white opacity-90 group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-secondary-600 transition-colors">Inteligencia Artificial</h3>
                            <p className="text-slate-600 mb-4 line-clamp-2">Descubre cómo nuestra nueva IA analiza tu perfil para encontrar las mejores vacantes automáticamente.</p>
                            <div className="flex items-center text-secondary-600 font-bold text-sm">
                                Leer más <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Mobile App (Placeholder) */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1">
                        <div className="h-48 bg-gradient-to-br from-secondary-500 to-orange-500 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Briefcase className="w-16 h-16 text-white opacity-90 group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-secondary-600 transition-colors">Nueva App Móvil</h3>
                            <p className="text-slate-600 mb-4 line-clamp-2">Lleva tu búsqueda de empleo a todos lados con nuestra nueva experiencia móvil optimizada.</p>
                            <div className="flex items-center text-secondary-600 font-bold text-sm">
                                Próximamente <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Companies (Placeholder) */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1">
                        <div className="h-48 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Shield className="w-16 h-16 text-white opacity-90 group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-secondary-600 transition-colors">Empresas Verificadas</h3>
                            <p className="text-slate-600 mb-4 line-clamp-2">Conoce nuestro nuevo sello de verificación para empresas seguras y confiables.</p>
                            <div className="flex items-center text-secondary-600 font-bold text-sm">
                                Ver empresas <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
