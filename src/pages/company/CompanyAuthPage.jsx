import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';
import { Building2, Mail, Lock, ArrowRight, CheckCircle, Briefcase, Eye, EyeOff, User } from 'lucide-react';
import logo from '../../assets/ayjale_logo_new.png';

const CompanyAuthPage = () => {
    const [searchParams] = useSearchParams();
    const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'register');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const navigate = useNavigate();
    const { user, login, register, loading } = useAuth();

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const capitalizeWords = (str) => {
        if (!str || typeof str !== 'string') return str || '';
        const hasTrailingSpace = str.endsWith(' ');
        const formatted = str
            .toLowerCase()
            .split(' ')
            .map(word => word ? word.charAt(0).toUpperCase() + word.slice(1) : '')
            .join(' ');
        return (hasTrailingSpace && !formatted.endsWith(' ')) ? formatted + ' ' : formatted;
    };

    const handleForgotPassword = async () => {
        if (!formData.email) {
            alert("Por favor ingresa tu correo electrónico en el campo correspondiente primero.");
            return;
        }
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(formData.email.trim(), {
                redirectTo: window.location.origin + '/reset-password',
            });
            if (error) throw error;
            alert("Se ha enviado un correo con instrucciones para restablecer tu contraseña. Revisa tu bandeja de entrada.");
        } catch (error) {
            alert("Error al enviar el correo de recuperación: " + error.message);
        }
    };

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setPasswordError('');

        try {
            if (isLogin) {
                await login(formData.email.trim(), formData.password);
                navigate('/dashboard');
            } else {
                // Validate Password Match
                if (formData.password !== formData.confirmPassword) {
                    setPasswordError('Las contraseñas no coinciden. Por favor verifícalas.');
                    return;
                }

                const recruiterFullName = `${capitalizeWords(formData.first_name.trim())} ${capitalizeWords(formData.last_name.trim())}`.trim();

                await register({
                    name: recruiterFullName,
                    first_name: capitalizeWords(formData.first_name.trim()),
                    last_name: capitalizeWords(formData.last_name.trim()),
                    recruiter_name: recruiterFullName,
                    email: formData.email.trim(),
                    termsAccepted: true
                }, formData.password, 'company');

                navigate('/company/profile');
            }
        } catch (error) {
            console.error("Auth error:", error);
            setPasswordError(error.message || 'Error en la autenticación. Intenta de nuevo.');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-xl shadow-lg border border-slate-100">
                <div className="text-center">
                    <Link to="/" className="inline-block mb-3">
                        <img className="mx-auto h-11 w-auto object-contain transition-transform hover:scale-105" src={logo} alt="AyJale" />
                    </Link>
                    <h2 className="text-3xl font-extrabold text-slate-900">
                        {isLogin ? 'Acceso para empresas' : 'Registro de empresa'}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        {isLogin ? 'Ingresa para gestionar tus vacantes' : 'Paso 1: Crea tu cuenta de reclutador'}
                    </p>
                </div>

                <div className="flex border-b border-slate-200 mb-6">
                    <button
                        type="button"
                        className={`flex-1 py-2 text-sm font-medium border-b-2 cursor-pointer transition-colors ${isLogin ? 'border-secondary-600 text-secondary-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        onClick={() => {
                            setIsLogin(true);
                            setPasswordError('');
                        }}
                    >
                        Iniciar Sesión
                    </button>
                    <button
                        type="button"
                        className={`flex-1 py-2 text-sm font-medium border-b-2 cursor-pointer transition-colors ${!isLogin ? 'border-secondary-600 text-secondary-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        onClick={() => {
                            setIsLogin(false);
                            setPasswordError('');
                        }}
                    >
                        Registro
                    </button>
                </div>

                {passwordError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-semibold text-center">
                        {passwordError}
                    </div>
                )}

                <form className="mt-6 space-y-4" onSubmit={handleSubmit} autoComplete="off">
                    {!isLogin && (
                        <>
                            {/* 1. NOMBRE */}
                            <div className="relative">
                                <User className="absolute top-3.5 left-3.5 text-slate-400 w-5 h-5 pointer-events-none" />
                                <input
                                    type="text"
                                    required
                                    autoCapitalize="words"
                                    className="appearance-none rounded-lg relative block w-full pl-11 pr-3.5 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 text-sm capitalize"
                                    placeholder="Nombre"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    onBlur={() => setFormData(prev => ({ ...prev, first_name: capitalizeWords(prev.first_name.trim()) }))}
                                />
                            </div>

                            {/* 2. APELLIDOS */}
                            <div className="relative">
                                <User className="absolute top-3.5 left-3.5 text-slate-400 w-5 h-5 pointer-events-none" />
                                <input
                                    type="text"
                                    required
                                    autoCapitalize="words"
                                    className="appearance-none rounded-lg relative block w-full pl-11 pr-3.5 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 text-sm capitalize"
                                    placeholder="Apellidos"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    onBlur={() => setFormData(prev => ({ ...prev, last_name: capitalizeWords(prev.last_name.trim()) }))}
                                />
                            </div>
                        </>
                    )}

                    {/* 3. CORREO ELECTRÓNICO */}
                    <div className="relative">
                        <Mail className="absolute top-3.5 left-3.5 text-slate-400 w-5 h-5 pointer-events-none" />
                        <input
                            type="email"
                            required
                            className="appearance-none rounded-lg relative block w-full pl-11 pr-3.5 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 text-sm"
                            placeholder="Correo electrónico"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    {/* 4. CONTRASEÑA */}
                    <div className="space-y-1">
                        <div className="relative">
                            <Lock className="absolute top-3.5 left-3.5 text-slate-400 w-5 h-5 pointer-events-none" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                className="appearance-none rounded-lg relative block w-full pl-11 pr-11 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 text-sm"
                                placeholder="Contraseña"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                            <button
                                type="button"
                                className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        {isLogin && (
                            <div className="flex justify-end pt-1">
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    className="text-xs font-semibold text-secondary-600 hover:text-secondary-700 hover:underline cursor-pointer"
                                >
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </div>
                        )}
                    </div>

                    {/* 5. REPETIR CONTRASEÑA */}
                    {!isLogin && (
                        <div className="relative">
                            <Lock className="absolute top-3.5 left-3.5 text-slate-400 w-5 h-5 pointer-events-none" />
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                required
                                className="appearance-none rounded-lg relative block w-full pl-11 pr-11 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 text-sm"
                                placeholder="Repetir contraseña"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            />
                            <button
                                type="button"
                                className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    )}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white ${loading ? 'bg-secondary-400 cursor-not-allowed' : 'bg-secondary-600 hover:bg-secondary-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 transition-all shadow-md active:scale-98 cursor-pointer`}
                        >
                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                {!loading && <ArrowRight className="h-5 w-5 text-secondary-200 group-hover:text-white" aria-hidden="true" />}
                            </span>
                            {loading ? 'Procesando...' : (isLogin ? 'Ingresar al Panel' : 'Continuar al Perfil de Empresa →')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CompanyAuthPage;
