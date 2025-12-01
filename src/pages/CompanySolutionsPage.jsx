import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Briefcase,
    Search,
    Zap,
    Users,
    MessageSquare,
    BarChart3,
    CheckCircle2,
    ArrowRight,
    Building2,
    Mail,
    Phone
} from 'lucide-react';
import SEO from '../components/SEO';
import { BrowserFrame } from '../components/marketing/DeviceFrames';

const CompanySolutionsPage = () => {
    const navigate = useNavigate();
    const [formStatus, setFormStatus] = useState('idle'); // idle, submitting, success

    const handleContactSubmit = (e) => {
        e.preventDefault();
        setFormStatus('submitting');
        // Simulate API call
        setTimeout(() => {
            setFormStatus('success');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <SEO
                title="Soluciones para Empresas"
                description="Contrata más rápido con nuestra Inteligencia Artificial. Publica vacantes, filtra candidatos y gestiona procesos en un solo lugar."
            />

            {/* Hero Section */}
            <div className="bg-slate-900 relative overflow-hidden text-white">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary-900 to-slate-900 opacity-90" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center px-4 py-2 rounded-full bg-secondary-500/20 border border-secondary-500/30 text-secondary-300 text-sm font-bold mb-6 animate-fade-in">
                                <Zap className="w-4 h-4 mr-2" />
                                Potenciado por IA
                            </div>
                            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
                                Contrata al mejor talento <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-400 to-orange-400">
                                    en tiempo récord
                                </span>
                            </h1>
                            <p className="text-xl text-slate-300 mb-10 leading-relaxed max-w-lg">
                                Deja que nuestra Inteligencia Artificial haga el trabajo pesado.
                                Filtra, evalúa y conecta con los candidatos ideales automáticamente.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => navigate('/company/login')}
                                    className="px-8 py-4 bg-secondary-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-secondary-700 hover:scale-105 transition-all flex items-center justify-center"
                                >
                                    Publicar Vacante Gratis
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => document.getElementById('contact-form').scrollIntoView({ behavior: 'smooth' })}
                                    className="px-8 py-4 bg-white/10 backdrop-blur border border-white/20 text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all flex items-center justify-center"
                                >
                                    Solicitar Demo
                                </button>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <BrowserFrame className="transform rotate-2 hover:rotate-0 transition-transform duration-500 shadow-2xl border-slate-700">
                                <img
                                    src="/assets/images/recruiter_ai.png"
                                    alt="AI Recruiter Dashboard"
                                    className="w-full h-auto object-cover"
                                />
                            </BrowserFrame>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                        Todo lo que necesitas para reclutar
                    </h2>
                    <p className="text-lg text-slate-600">
                        Una suite completa de herramientas diseñadas para equipos de RH modernos.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-24">
                    <FeatureCard
                        icon={<Search className="w-6 h-6 text-blue-600" />}
                        title="Buscador Inteligente de CVs"
                        description="Encuentra candidatos pasivos con filtros avanzados de habilidades, experiencia y ubicación."
                        color="bg-blue-50"
                    />
                    <FeatureCard
                        icon={<Zap className="w-6 h-6 text-orange-600" />}
                        title="IA Generadora de Vacantes"
                        description="Crea descripciones de puesto atractivas y optimizadas en segundos con nuestra IA."
                        color="bg-orange-50"
                    />
                    <FeatureCard
                        icon={<BarChart3 className="w-6 h-6 text-purple-600" />}
                        title="Algoritmo de Recomendación"
                        description="Recibe automáticamente los perfiles que mejor encajan con tu cultura y requisitos."
                        color="bg-purple-50"
                    />
                </div>

                {/* Deep Dive Feature */}
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-24">
                    <div className="grid md:grid-cols-2 items-center">
                        <div className="p-12">
                            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-8 text-green-600">
                                <Users className="w-8 h-8" />
                            </div>
                            <h3 className="text-3xl font-bold text-slate-900 mb-6">Pipeline de Candidatos Visual</h3>
                            <p className="text-lg text-slate-600 mb-8">
                                Gestiona tus procesos como un profesional. Mueve candidatos entre etapas, programa entrevistas y envía feedback con un sistema Kanban intuitivo.
                            </p>
                            <ul className="space-y-4">
                                <ListItem text="Vista clara de todos tus procesos" />
                                <ListItem text="Chat integrado con candidatos" />
                                <ListItem text="Evaluaciones psicométricas automáticas" />
                            </ul>
                        </div>
                        <div className="bg-slate-50 p-8 h-full flex items-center justify-center border-l border-slate-100">
                            <BrowserFrame className="w-full shadow-lg">
                                <img
                                    src="/assets/images/recruiter_kanban.png"
                                    alt="Kanban Pipeline"
                                    className="w-full h-auto object-cover"
                                />
                            </BrowserFrame>
                        </div>
                    </div>
                </div>

                {/* Contact Form Section */}
                <div id="contact-form" className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="grid md:grid-cols-2">
                        <div className="p-12 text-white">
                            <h3 className="text-3xl font-bold mb-6">¿Quieres ver la plataforma en acción?</h3>
                            <p className="text-slate-300 mb-10 text-lg">
                                Déjanos tus datos y uno de nuestros consultores expertos te contactará para darte una demo personalizada y mostrarte cómo reducir tu tiempo de contratación en un 40%.
                            </p>
                            <div className="space-y-6">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mr-4">
                                        <Building2 className="w-6 h-6 text-secondary-400" />
                                    </div>
                                    <div>
                                        <div className="font-bold">Para Empresas de Todo Tamaño</div>
                                        <div className="text-slate-400 text-sm">Desde Startups hasta Corporativos</div>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mr-4">
                                        <MessageSquare className="w-6 h-6 text-secondary-400" />
                                    </div>
                                    <div>
                                        <div className="font-bold">Consultoría Gratuita</div>
                                        <div className="text-slate-400 text-sm">Análisis de tus necesidades de RH</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-12">
                            {formStatus === 'success' ? (
                                <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                                    </div>
                                    <h4 className="text-2xl font-bold text-slate-900 mb-2">¡Mensaje Recibido!</h4>
                                    <p className="text-slate-600">
                                        Tu solicitud ha sido enviada a nuestro equipo comercial. Te contactaremos en menos de 24 horas.
                                    </p>
                                    <button
                                        onClick={() => setFormStatus('idle')}
                                        className="mt-8 text-secondary-600 font-medium hover:underline"
                                    >
                                        Enviar otra solicitud
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleContactSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                                        <input required type="text" className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none transition-all" placeholder="Ej. Juan Pérez" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Correo Corporativo</label>
                                        <input required type="email" className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none transition-all" placeholder="juan@empresa.com" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Empresa</label>
                                        <input required type="text" className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none transition-all" placeholder="Nombre de tu empresa" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                                        <input required type="tel" className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none transition-all" placeholder="+52 55 1234 5678" />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={formStatus === 'submitting'}
                                        className="w-full py-4 bg-secondary-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-secondary-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        {formStatus === 'submitting' ? (
                                            <span className="animate-pulse">Enviando...</span>
                                        ) : (
                                            <>
                                                Contactar a Ventas
                                                <ArrowRight className="ml-2 w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

const FeatureCard = ({ icon, title, description, color }) => (
    <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 hover:-translate-y-2 transition-transform duration-300">
        <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-6`}>
            {icon}
        </div>
        <h4 className="text-xl font-bold text-slate-900 mb-3">{title}</h4>
        <p className="text-slate-600 leading-relaxed">
            {description}
        </p>
    </div>
);

const ListItem = ({ text }) => (
    <li className="flex items-center text-slate-700">
        <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
        {text}
    </li>
);

export default CompanySolutionsPage;
