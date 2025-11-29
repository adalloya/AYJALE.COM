import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Building2, ShieldCheck } from 'lucide-react';

const LoginPage = () => {
    const { loginByRole } = useAuth();
    const navigate = useNavigate();

    const handleLogin = (role) => {
        const success = loginByRole(role);
        if (success) {
            navigate(role === 'candidate' ? '/' : '/dashboard');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-slate-900">Bienvenido a Ayjale.com</h1>
                <p className="mt-2 text-slate-600">Selecciona un rol para simular el inicio de sesión</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                {/* Candidate */}
                <button
                    onClick={() => handleLogin('candidate')}
                    className="flex flex-col items-center p-8 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-secondary-500 hover:shadow-md transition-all group"
                >
                    <div className="p-4 bg-secondary-50 rounded-full group-hover:bg-secondary-100 transition-colors">
                        <User className="w-8 h-8 text-secondary-600" />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-slate-900">Candidato</h3>
                    <p className="mt-2 text-sm text-slate-500 text-center">
                        Busca vacantes, postúlate y gestiona tu perfil profesional.
                    </p>
                </button>

                {/* Company */}
                <button
                    onClick={() => handleLogin('company')}
                    className="flex flex-col items-center p-8 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-secondary-500 hover:shadow-md transition-all group"
                >
                    <div className="p-4 bg-secondary-50 rounded-full group-hover:bg-secondary-100 transition-colors">
                        <Building2 className="w-8 h-8 text-secondary-600" />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-slate-900">Empresa</h3>
                    <p className="mt-2 text-sm text-slate-500 text-center">
                        Publica vacantes, gestiona candidatos y encuentra talento.
                    </p>
                </button>

                {/* Admin */}
                <button
                    onClick={() => handleLogin('admin')}
                    className="flex flex-col items-center p-8 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-secondary-500 hover:shadow-md transition-all group"
                >
                    <div className="p-4 bg-secondary-50 rounded-full group-hover:bg-secondary-100 transition-colors">
                        <ShieldCheck className="w-8 h-8 text-secondary-600" />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-slate-900">Administrador</h3>
                    <p className="mt-2 text-sm text-slate-500 text-center">
                        Gestiona usuarios, modera contenido y ve métricas.
                    </p>
                </button>
            </div>
        </div>
    );
};

export default LoginPage;
