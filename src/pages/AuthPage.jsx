import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { Mail, Lock, User, Briefcase, ArrowRight, CheckCircle, Building, Phone, Eye, EyeOff } from 'lucide-react';
import logo from '../assets/ayjale_logo_new.png';

const AuthPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const initialMode = searchParams.get('mode');
    const initialRole = searchParams.get('role');

    const [isLogin, setIsLogin] = useState(initialMode !== 'register');
    const [userType, setUserType] = useState(initialRole === 'company' ? 'company' : 'candidate');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { user, login, register, loading, loginWithGoogle, loginWithApple } = useAuth();
    const returnUrl = searchParams.get('returnUrl') || '/dashboard';

    if (user) {
        return <Navigate to={returnUrl || '/dashboard'} replace />;
    }

    const [formData, setFormData] = useState({
        name: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        termsAccepted: false
    });
    const [phoneDisplay, setPhoneDisplay] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const passwordCriteria = {
        length: formData.password.length >= 8,
        number: /\d/.test(formData.password),
        symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password),
        upperLower: /[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password)
    };

    const handlePhoneChange = (inputVal) => {
        let digits = inputVal.replace(/\D/g, '');
        if (digits.startsWith('52') && digits.length >= 12) {
            digits = digits.slice(2);
        }
        digits = digits.slice(0, 10);

        let formatted = '';
        if (digits.length > 0) {
            if (digits.length <= 3) {
                formatted = `(${digits}`;
            } else if (digits.length <= 6) {
                formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
            } else {
                formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)} ${digits.slice(6)}`;
            }
        }

        setPhoneDisplay(formatted);
        const rawValue = digits ? `+52${digits}` : '';
        setFormData(prev => ({ ...prev, phone: rawValue }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setPasswordError('');

        if (!isLogin) {
            if (!passwordCriteria.length || !passwordCriteria.number || !passwordCriteria.symbol || !passwordCriteria.upperLower) {
                setPasswordError('La contraseña debe tener al menos 8 caracteres, un número, un símbolo, una letra mayúscula y una minúscula.');
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                setPasswordError('Las contraseñas no coinciden. Por favor verifícalas.');
                return;
            }
        }

        try {
            if (isLogin) {
                await login(formData.email, formData.password);
                navigate(returnUrl);
            } else {
                await register({
                    name: formData.name,
                    lastName: formData.lastName,
                    last_name: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    termsAccepted: formData.termsAccepted
                }, formData.password, userType);
                navigate('/profile');
            }
        } catch (error) {
            console.error("Auth error:", error);
            alert(error.message || 'Error en la autenticación. Intenta de nuevo.');
        }
    };

    const handleForgotPassword = async () => {
        if (!formData.email) {
            alert("Por favor ingresa tu correo electrónico primero.");
            return;
        }
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
                redirectTo: window.location.origin + '/reset-password',
            });
            if (error) throw error;
            alert("Se ha enviado un correo para restablecer tu contraseña.");
        } catch (error) {
            alert("Error al enviar el correo: " + error.message);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-slate-100">
                <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                    <Link to="/" className="inline-block mb-3">
                        <img className="mx-auto h-11 w-auto object-contain transition-transform hover:scale-105" src={logo} alt="AyJale" />
                    </Link>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        {isLogin ? 'Acceso para candidatos' : 'Registro de candidato'}
                    </h2>
                    {isLogin && (
                        <p className="mt-2 text-sm text-slate-600">
                            Ingresa para continuar con tu postulación
                        </p>
                    )}
                </div>

                <div className="flex border-b border-slate-200 mb-6">
                    <button
                        className={`flex-1 py-2 text-sm font-medium border-b-2 ${isLogin ? 'border-secondary-600 text-secondary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        onClick={() => {
                            setIsLogin(true);
                            setPasswordError('');
                        }}
                    >
                        Iniciar Sesión
                    </button>
                    <button
                        className={`flex-1 py-2 text-sm font-medium border-b-2 ${!isLogin ? 'border-secondary-600 text-secondary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        onClick={() => {
                            setIsLogin(false);
                            setPasswordError('');
                        }}
                    >
                        Registro
                    </button>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit} autoComplete="off">
                    <div className="space-y-4">
                        {!isLogin && (
                            <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mb-2">
                                <span className="text-red-500 font-bold">*</span> Campos obligatorios
                            </p>
                        )}
                        {!isLogin && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <div className="relative">
                                        <User className="absolute top-3.5 left-3 text-slate-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            name="givenName"
                                            autoComplete="given-name"
                                            required
                                            className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-secondary-500 focus:border-secondary-500 text-sm"
                                            placeholder="Nombre *"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    {formData.name.length > 0 && (
                                        <p className="text-[11px] text-slate-500 mt-1 pl-1 font-medium">
                                            💡 Ej. Juan Carlos
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <div className="relative">
                                        <User className="absolute top-3.5 left-3 text-slate-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            name="familyName"
                                            autoComplete="family-name"
                                            required
                                            className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-secondary-500 focus:border-secondary-500 text-sm"
                                            placeholder="Apellidos *"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        />
                                    </div>
                                    {formData.lastName.length > 0 && (
                                        <p className="text-[11px] text-slate-500 mt-1 pl-1 font-medium">
                                            💡 Ej. Pérez López
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                        <div>
                            <div className="relative">
                                <Mail className="absolute top-3.5 left-3 text-slate-400 w-5 h-5" />
                                <input
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none rounded-lg relative block w-full px-10 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-secondary-500 focus:border-secondary-500 text-sm"
                                    placeholder={isLogin ? "Correo Electrónico" : "Correo Electrónico *"}
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            {!isLogin && formData.email.length > 0 && (
                                <p className="text-[11px] text-slate-500 mt-1 pl-1 font-medium">
                                    💡 Ej. tuemail@ejemplo.com
                                </p>
                            )}
                        </div>
                        {!isLogin && (
                            <div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 font-semibold text-sm select-none">
                                        🇲🇽 +52
                                    </div>
                                    <input
                                        type="tel"
                                        name="phone"
                                        autoComplete="tel"
                                        required
                                        className="appearance-none rounded-lg relative block w-full pl-20 pr-4 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-secondary-500 focus:border-secondary-500 text-sm"
                                        placeholder="(999) 123 4567 *"
                                        value={phoneDisplay}
                                        onChange={(e) => handlePhoneChange(e.target.value)}
                                    />
                                </div>
                                <p className="text-[11px] text-slate-500 mt-1 pl-1 font-medium">
                                    💡 Ingresa tus 10 dígitos (Ej. 999 123 4567)
                                </p>
                            </div>
                        )}
                        <div>
                            <div className="relative">
                                <Lock className="absolute top-3.5 left-3 text-slate-400 w-5 h-5" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    autoComplete={isLogin ? "current-password" : "new-password"}
                                    required
                                    className="appearance-none rounded-lg relative block w-full pl-10 pr-10 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-secondary-500 focus:border-secondary-500 text-sm"
                                    placeholder={isLogin ? "Contraseña" : "Contraseña *"}
                                    value={formData.password}
                                    onChange={(e) => {
                                        setFormData({ ...formData, password: e.target.value });
                                        if (passwordError) setPasswordError('');
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute top-3.5 right-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {!isLogin && (
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1 mt-2">
                                    <p className="font-semibold text-slate-700 mb-1">Requisitos de la contraseña:</p>
                                    <div className="grid grid-cols-2 gap-1.5">
                                        <span className={`flex items-center gap-1 ${passwordCriteria.length ? 'text-green-600 font-semibold' : 'text-slate-500'}`}>
                                            {passwordCriteria.length ? '✓' : '•'} Al menos 8 caracteres
                                        </span>
                                        <span className={`flex items-center gap-1 ${passwordCriteria.number ? 'text-green-600 font-semibold' : 'text-slate-500'}`}>
                                            {passwordCriteria.number ? '✓' : '•'} Un número (0-9)
                                        </span>
                                        <span className={`flex items-center gap-1 ${passwordCriteria.symbol ? 'text-green-600 font-semibold' : 'text-slate-500'}`}>
                                            {passwordCriteria.symbol ? '✓' : '•'} Un símbolo (!@#$...)
                                        </span>
                                        <span className={`flex items-center gap-1 ${passwordCriteria.upperLower ? 'text-green-600 font-semibold' : 'text-slate-500'}`}>
                                            {passwordCriteria.upperLower ? '✓' : '•'} Mayúscula y minúscula
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                        {!isLogin && (
                            <div className="relative">
                                <Lock className="absolute top-3.5 left-3 text-slate-400 w-5 h-5" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    autoComplete="new-password"
                                    required
                                    className={`appearance-none rounded-lg relative block w-full pl-10 pr-10 py-3 border ${passwordError ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'} placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-secondary-500 focus:border-secondary-500 text-sm`}
                                    placeholder="Repite tu contraseña *"
                                    value={formData.confirmPassword}
                                    onChange={(e) => {
                                        setFormData({ ...formData, confirmPassword: e.target.value });
                                        if (passwordError) setPasswordError('');
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute top-3.5 right-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                                    aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        )}
                        {passwordError && (
                            <p className="text-xs text-red-600 font-semibold bg-red-50 border border-red-200 p-2.5 rounded-lg">
                                ⚠️ {passwordError}
                            </p>
                        )}
                        {/* Role selector hidden as per user request - defaults to candidate */}
                        {!isLogin && !initialRole && (
                            <div className="flex items-center justify-center space-x-4 mt-4">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="userType"
                                        value="candidate"
                                        checked={userType === 'candidate'}
                                        onChange={(e) => setUserType(e.target.value)}
                                        className="mr-2 text-secondary-600 focus:ring-secondary-500"
                                    />
                                    <span className="text-sm text-slate-700">Candidato</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="userType"
                                        value="company"
                                        checked={userType === 'company'}
                                        onChange={(e) => setUserType(e.target.value)}
                                        className="mr-2 text-secondary-600 focus:ring-secondary-500"
                                    />
                                    <span className="text-sm text-slate-700">Empresa</span>
                                </label>
                            </div>
                        )}
                        {!isLogin && (
                            <div className="flex items-start mt-4">
                                <div className="flex items-center h-5">
                                    <input
                                        id="terms"
                                        name="terms"
                                        type="checkbox"
                                        required
                                        checked={formData.termsAccepted}
                                        onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                                        className="focus:ring-secondary-500 h-4 w-4 text-secondary-600 border-slate-300 rounded"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="terms" className="font-medium text-slate-700">
                                        Acepto los <Link to="/terminos" target="_blank" className="text-secondary-600 hover:text-secondary-500">Términos y Condiciones</Link> y la <Link to="/privacidad" target="_blank" className="text-secondary-600 hover:text-secondary-500">Política de Privacidad</Link>
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>

                    {isLogin && (
                        <div className="flex items-center justify-end">
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="text-sm font-medium text-secondary-600 hover:text-secondary-500"
                            >
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${loading ? 'bg-secondary-400 cursor-not-allowed' : 'bg-secondary-600 hover:bg-secondary-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500`}
                        >
                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                {!loading && <ArrowRight className="h-5 w-5 text-secondary-500 group-hover:text-secondary-400" aria-hidden="true" />}
                            </span>
                            {loading ? 'Procesando...' : (isLogin ? 'Ingresar' : 'Registrarme')}
                        </button>
                    </div>
                </form>

                {/* Social Login - Hidden temporarily */}
                {/*
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-slate-500">O continúa con</span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <div>
                                <button
                                    onClick={() => loginWithGoogle()}
                                    className="w-full inline-flex justify-center py-2.5 px-4 rounded-lg shadow-sm bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 border border-slate-200"
                                >
                                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5 mr-2" />
                                    <span>Google</span>
                                </button>
                            </div>

                            <div>
                                <button
                                    onClick={() => loginWithApple()}
                                    className="w-full inline-flex justify-center py-2.5 px-4 rounded-lg shadow-sm bg-black text-sm font-medium text-white hover:bg-slate-900 border border-transparent"
                                >
                                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                                    </svg>
                                    <span>Apple</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    */}
            </div >
        </div >
    );
};

export default AuthPage;
