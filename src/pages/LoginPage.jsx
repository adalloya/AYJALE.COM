import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Building2, CheckCircle, Briefcase, Search } from 'lucide-react';

const LoginPage = () => {
    const { loginByRole } = useAuth();
    const navigate = useNavigate();

    const handleLogin = (role) => {
        if (role === 'candidate') {
            navigate('/auth?mode=login&role=candidate');
        } else {
            navigate('/auth?mode=login&role=company');
        }
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
            <div className="text-center max-w-3xl mx-auto mb-12">
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl mb-4">
                    Bienvenido a <span className="text-secondary-600">Ayjale.com</span>
                </h1>
                <p className="text-xl text-slate-600 mb-8">
                    La plataforma de empleo que conecta el talento mexicano con las mejores oportunidades.
                    <br />
                    <span className="font-medium text-secondary-600">¡Totalmente gratis!</span> Selecciona tu perfil para comenzar.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-16">
                {/* Candidate */}
                <button
                    onClick={() => handleLogin('candidate')}
                    className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-secondary-500 hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-1"
                >
                    <div className="p-5 bg-secondary-50 rounded-full group-hover:bg-secondary-600 transition-colors duration-300 mb-6">
                        <User className="w-10 h-10 text-secondary-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">Soy Candidato</h3>
                    <p className="text-slate-500 text-center leading-relaxed">
                        Busca miles de vacantes, crea tu perfil profesional y postúlate a las mejores empresas de México en segundos.
                    </p>
                    <div className="mt-6 flex items-center text-secondary-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Ingresar como Candidato <span className="ml-2">→</span>
                    </div>
                </button>

                {/* Company */}
                <button
                    onClick={() => handleLogin('company')}
                    className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-secondary-500 hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-1"
                >
                    <div className="p-5 bg-secondary-50 rounded-full group-hover:bg-secondary-600 transition-colors duration-300 mb-6">
                        <Building2 className="w-10 h-10 text-secondary-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">Soy Empresa</h3>
                    <p className="text-slate-500 text-center leading-relaxed">
                        Publica tus vacantes sin costo, gestiona candidatos y encuentra el talento ideal para tu equipo de trabajo.
                    </p>
                    <div className="mt-6 flex items-center text-secondary-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Ingresar como Empresa <span className="ml-2">→</span>
                    </div>
                </button>
            </div>

            {/* Info Section */}
            <div className="max-w-5xl mx-auto mt-8 border-t border-slate-200 pt-12">
                <h2 className="text-2xl font-bold text-center text-slate-900 mb-10">¿Por qué usar Ayjale?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="p-4">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-secondary-100 text-secondary-600 mb-4">
                            <CheckCircle className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 mb-2">100% Gratuito</h3>
                        <p className="text-slate-500">Sin costos ocultos para candidatos ni empresas. Publica y postúlate libremente.</p>
                    </div>
                    <div className="p-4">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-secondary-100 text-secondary-600 mb-4">
                            <Briefcase className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 mb-2">Vacantes Reales</h3>
                        <p className="text-slate-500">Verificamos las empresas para asegurar ofertas de trabajo legítimas y seguras.</p>
                    </div>
                    <div className="p-4">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-secondary-100 text-secondary-600 mb-4">
                            <Search className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 mb-2">Fácil de Usar</h3>
                        <p className="text-slate-500">Plataforma intuitiva diseñada para que encuentres lo que buscas en menos clics.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
