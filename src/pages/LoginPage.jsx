import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { Mail, Lock, User, Building2, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import logo from '../assets/ayjale_logo_new.png';

const LoginPage = () => {
    const [searchParams] = useSearchParams();
    const initialRole = searchParams.get('role') === 'company' ? 'company' : 'candidate';

    const [userRole, setUserRole] = useState(initialRole);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { user, login, loginWithGoogle, loginWithApple } = useAuth();
    const navigate = useNavigate();

    const returnUrl = searchParams.get('returnUrl') || '/dashboard';

    if (user) {
        return <Navigate to={returnUrl} replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setIsSubmitting(true);

        try {
            await login(email.trim(), password);
            navigate(returnUrl);
        } catch (error) {
            console.error("Login error:", error);
            setErrorMsg(error.message || 'Error en las credenciales. Por favor verifícalas e intenta de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email.trim()) {
            alert("Por favor ingresa tu correo electrónico en el campo arriba primero.");
            return;
        }
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo: window.location.origin + '/reset-password',
            });
            if (error) throw error;
            alert("Se ha enviado un correo con instrucciones para restablecer tu contraseña. Revisa tu bandeja de entrada.");
        } catch (error) {
            alert("Error al enviar el correo de recuperación: " + error.message);
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
                
                {/* LOGO & TITLE */}
                <div className="text-center">
                    <Link to="/" className="inline-block mb-3">
                        <img className="mx-auto h-12 w-auto object-contain transition-transform hover:scale-105" src={logo} alt="AyJale" />
                    </Link>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Inicia Sesión
                    </h2>
                    <p className="mt-1.5 text-sm text-slate-600 font-medium">
                        Accede a tu cuenta para continuar en AyJale
                    </p>
                </div>

                {/* ROLE SELECTOR TABS */}
                <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                    <button
                        type="button"
                        onClick={() => {
                            setUserRole('candidate');
                            setErrorMsg('');
                        }}
                        className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            userRole === 'candidate'
                                ? 'bg-white text-secondary-700 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <User className="w-4 h-4" />
                        Soy Candidato
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setUserRole('company');
                            setErrorMsg('');
                        }}
                        className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            userRole === 'company'
                                ? 'bg-white text-secondary-700 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <Building2 className="w-4 h-4" />
                        Soy Empresa
                    </button>
                </div>

                {/* ERROR ALERT */}
                {errorMsg && (
                    <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-semibold text-center leading-relaxed">
                        ⚠️ {errorMsg}
                    </div>
                )}

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico</label>
                        <div className="relative">
                            <Mail className="absolute top-3.5 left-3.5 text-slate-400 w-5 h-5 pointer-events-none" />
                            <input
                                type="email"
                                required
                                autoComplete="email"
                                className="appearance-none rounded-xl relative block w-full pl-11 pr-3.5 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 text-sm font-medium"
                                placeholder={userRole === 'company' ? "ejemplo@empresa.com" : "tuemail@ejemplo.com"}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-bold text-slate-700">Contraseña</label>
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="text-xs font-semibold text-secondary-600 hover:text-secondary-700 hover:underline cursor-pointer"
                            >
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>
                        <div className="relative">
                            <Lock className="absolute top-3.5 left-3.5 text-slate-400 w-5 h-5 pointer-events-none" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                autoComplete="current-password"
                                className="appearance-none rounded-xl relative block w-full pl-11 pr-11 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 text-sm font-medium"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full mt-2 bg-secondary-600 hover:bg-secondary-700 text-white font-extrabold py-3.5 px-4 rounded-xl text-sm transition-all shadow-md active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                        {isSubmitting ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </form>

                {/* REGISTER PROMPT AT BOTTOM */}
                <div className="pt-4 border-t border-slate-100 text-center space-y-2">
                    <p className="text-xs text-slate-600 font-medium">
                        ¿Aún no tienes cuenta en AyJale?
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <Link
                            to="/auth?mode=register&role=candidate"
                            className="inline-block text-xs font-bold text-secondary-600 hover:text-secondary-700 bg-secondary-50 hover:bg-secondary-100 border border-secondary-200 px-3 py-2 rounded-xl transition-colors"
                        >
                            Regístrate como Candidato
                        </Link>
                        <Link
                            to="/company/login?mode=register"
                            className="inline-block text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-2 rounded-xl transition-colors"
                        >
                            Registra tu Empresa
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LoginPage;
