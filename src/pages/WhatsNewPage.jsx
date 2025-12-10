import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Smartphone,
    Brain,
    MessageCircle,
    Zap,
    Shield,
    Target,
    ArrowRight,
    CheckCircle2,
    Sparkles,
    Layers,
    Building2
} from 'lucide-react';
import SEO from '../components/SEO';
import { PhoneFrame, BrowserFrame } from '../components/marketing/DeviceFrames';
import fastRegImage from '../assets/images/fast_registration.png';

const WhatsNewPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50">
            <SEO
                title="Novedades y Características"
                description="Descubre las nuevas herramientas de inteligencia artificial y experiencia móvil de Ayjale."
            />

            {/* Hero Section */}
            <div className="bg-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary-50 to-white opacity-50" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-secondary-100 text-secondary-700 text-sm font-bold mb-6 animate-fade-in">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Nueva Versión 2.0
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
                            El Futuro del Reclutamiento <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-600 to-orange-500">
                                Ya está aquí
                            </span>
                        </h1>
                        <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                            Hemos reinventado la forma de buscar trabajo y contratar talento.
                            Más inteligente, más rápido y totalmente transparente.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => navigate('/jobs')}
                                className="px-8 py-4 bg-secondary-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-secondary-700 hover:scale-105 transition-all flex items-center justify-center"
                            >
                                Probar Ahora
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

                {/* Feature 1: Mobile Experience */}
                <div className="flex flex-col md:flex-row items-center gap-12 mb-24">
                    <div className="flex-1 order-2 md:order-1">
                        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-150 duration-700" />
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                                    <Smartphone className="w-8 h-8" />
                                </div>
                                <h3 className="text-3xl font-bold text-slate-900 mb-4">Job Deck "Swipe-to-Apply"</h3>
                                <p className="text-lg text-slate-600 mb-6">
                                    Olvídate de las listas infinitas. Nuestra nueva experiencia móvil te permite deslizar tarjetas para descubrir tu próximo empleo. Rápido, visual y adictivo.
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex items-center text-slate-700">
                                        <CheckCircle2 className="w-5 h-5 text-blue-500 mr-3" />
                                        Navegación intuitiva tipo Tinder
                                    </li>
                                    <li className="flex items-center text-slate-700">
                                        <CheckCircle2 className="w-5 h-5 text-blue-500 mr-3" />
                                        Postulación en un clic
                                    </li>
                                    <li className="flex items-center text-slate-700">
                                        <CheckCircle2 className="w-5 h-5 text-blue-500 mr-3" />
                                        Modo inmersivo sin distracciones
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 order-1 md:order-2 flex justify-center">
                        <PhoneFrame>
                            <img
                                src="/assets/images/mobile_job_deck.png"
                                alt="Mobile Job Deck UI"
                                className="w-full h-full object-cover"
                            />
                        </PhoneFrame>
                    </div>
                </div>

                {/* Feature 2: AI Intelligence */}
                <div className="flex flex-col md:flex-row items-center gap-12 mb-24">
                    <div className="flex-1 flex justify-center">
                        <BrowserFrame className="w-full max-w-lg">
                            <img
                                src="/assets/images/ai_dashboard.png"
                                alt="AI Assessment Dashboard"
                                className="w-full h-auto object-cover"
                            />
                        </BrowserFrame>
                    </div>
                    <div className="flex-1">
                        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                            <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-50 rounded-full -ml-32 -mt-32 transition-transform group-hover:scale-150 duration-700" />
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 text-indigo-600">
                                    <Brain className="w-8 h-8" />
                                </div>
                                <h3 className="text-3xl font-bold text-slate-900 mb-4">Centro de Evaluaciones con IA</h3>
                                <p className="text-lg text-slate-600 mb-6">
                                    Más allá del CV. Nuestra inteligencia artificial analiza tu perfil en 360 grados para destacar tu verdadero potencial ante las empresas.
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex items-center text-slate-700">
                                        <CheckCircle2 className="w-5 h-5 text-indigo-500 mr-3" />
                                        Pruebas psicométricas y cognitivas gamificadas
                                    </li>
                                    <li className="flex items-center text-slate-700">
                                        <CheckCircle2 className="w-5 h-5 text-indigo-500 mr-3" />
                                        Análisis de voz para nivel de inglés
                                    </li>
                                    <li className="flex items-center text-slate-700">
                                        <CheckCircle2 className="w-5 h-5 text-indigo-500 mr-3" />
                                        Feedback instantáneo de tus fortalezas
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feature 3: Transparency */}
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6 text-green-600">
                            <MessageCircle className="w-6 h-6" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 mb-3">Comunicación Directa</h4>
                        <p className="text-slate-600">
                            Chat integrado tipo WhatsApp. Resuelve dudas directamente con los reclutadores sin salir de la app.
                        </p>
                    </div>
                    <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6 text-orange-600">
                            <Target className="w-6 h-6" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 mb-3">Tracking Real</h4>
                        <p className="text-slate-600">
                            Sabe exactamente en qué etapa estás. "En revisión", "Entrevista" o "Finalista". Sin incertidumbre.
                        </p>
                    </div>
                    <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-6 text-red-600">
                            <Shield className="w-6 h-6" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 mb-3">Seguridad Total</h4>
                        <p className="text-slate-600">
                            Vacantes verificadas y protección de datos. Tú decides quién ve tu información y cuándo.
                        </p>
                    </div>
                </div>

                {/* Feature 4: Fast Registration */}
                <div className="mt-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 md:p-12 text-white overflow-hidden relative">
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/10 rounded-full blur-3xl opacity-50"></div>
                    <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-60 h-60 bg-white/10 rounded-full blur-2xl opacity-30"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                        <div className="flex-1">
                            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 text-white text-sm font-bold mb-6">
                                <Zap className="w-4 h-4 mr-2 text-yellow-300" />
                                Máxima Velocidad
                            </div>
                            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
                                Regístrate en <br />
                                <span className="text-yellow-300">menos de 2 minutos</span>
                            </h2>
                            <p className="text-blue-100 text-lg mb-8 leading-relaxed max-w-xl">
                                Sabemos que urge encontrar trabajo. Por eso eliminamos la burocracia.
                                Sin formularios interminables ni preguntas innecesarias.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-4">
                                        <Smartphone className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="font-semibold text-lg">Optimizado para celular</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-4">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="font-semibold text-lg">Importación inteligente de datos</span>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/auth')}
                                className="mt-10 px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg shadow-xl hover:bg-blue-50 hover:scale-105 transition-all inline-flex items-center"
                            >
                                Comenzar Registro
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 w-full max-w-md md:max-w-none flex justify-center md:justify-end">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-500 rounded-[2rem] transform rotate-3 scale-105 opacity-50 blur-lg"></div>
                                <img
                                    src={fastRegImage}
                                    alt="Fast Registration Interface"
                                    className="relative rounded-[2rem] shadow-2xl border-4 border-white/20 transform -rotate-2 hover:rotate-0 transition-transform duration-500 max-h-[500px] w-auto object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* CTA Section */}
            <div className="bg-slate-900 py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        ¿Listo para vivir la nueva experiencia?
                    </h2>
                    <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
                        Únete a miles de candidatos que ya están encontrando su trabajo ideal con nuestra tecnología.
                    </p>
                    <button
                        onClick={() => navigate('/auth')}
                        className="px-10 py-4 bg-white text-slate-900 rounded-xl font-bold text-lg shadow-lg hover:bg-slate-100 transition-colors"
                    >
                        Crear Cuenta Gratis
                    </button>
                </div>

                {/* Company CTA Section */}
                <div className="mt-20 bg-slate-900 rounded-3xl overflow-hidden shadow-2xl relative">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10" />
                    <div className="relative z-10 px-8 py-16 md:p-20 text-center">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-bold mb-8">
                            <Building2 className="w-4 h-4 mr-2" />
                            Para Reclutadores y Empresas
                        </div>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
                            ¿Buscas Talento?
                        </h2>
                        <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                            Descubre nuestras herramientas exclusivas para empresas: Buscador de CVs con IA, Pipeline de candidatos y más.
                        </p>
                        <button
                            onClick={() => navigate('/solutions/companies')}
                            className="px-10 py-4 bg-white text-slate-900 rounded-xl font-bold text-lg shadow-xl hover:bg-slate-100 hover:scale-105 transition-all inline-flex items-center"
                        >
                            Ver Soluciones para Empresas
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default WhatsNewPage;
