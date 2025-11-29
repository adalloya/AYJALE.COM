import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { Mail, Lock, User, Briefcase, ArrowRight, CheckCircle, Building, Phone } from 'lucide-react';
import logo from '../assets/ayjale_logo_new.png';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [userType, setUserType] = useState('candidate'); // 'candidate' or 'company'
    const navigate = useNavigate();
    const location = useLocation();
    const { login, register, loading, loginWithGoogle, loginWithApple } = useAuth();
    const returnUrl = new URLSearchParams(location.search).get('returnUrl') || '/dashboard';

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        termsAccepted: false
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isLogin) {
                await login(formData.email, formData.password);
            } else {
                await register({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    termsAccepted: formData.termsAccepted
                }, formData.password, userType);
            }
            navigate(returnUrl);
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
                    <Link to="/">
                        <img className="mx-auto h-20 w-auto object-contain mb-6" src={logo} alt="AyJale" />
                    </Link>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        {isLogin ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        {isLogin ? 'Ingresa para continuar con tu postulación' : 'Regístrate para postularte a esta vacante'}
                    </p>
                </div>

                <div className="flex border-b border-slate-200 mb-6">
                    <button
                        className={`flex-1 py-2 text-sm font-medium border-b-2 ${isLogin ? 'border-secondary-600 text-secondary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setIsLogin(true)}
                    >
                        Iniciar Sesión
                    </button>
                    <button
                        className={`flex-1 py-2 text-sm font-medium border-b-2 ${!isLogin ? 'border-secondary-600 text-secondary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setIsLogin(false)}
                    >
                        Crear Cuenta
                    </button>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {!isLogin && (
                            <div className="relative">
                                <User className="absolute top-3 left-3 text-slate-400 w-5 h-5" />
                                <input
                                    type="text"
                                    required
                                    className="appearance-none rounded-lg relative block w-full px-10 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-secondary-500 focus:border-secondary-500 focus:z-10 sm:text-sm"
                                    placeholder="Nombre Completo"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        )}
                        <div className="relative">
                            <Mail className="absolute top-3 left-3 text-slate-400 w-5 h-5" />
                            <input
                                type="email"
                                required
                                className="appearance-none rounded-lg relative block w-full px-10 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-secondary-500 focus:border-secondary-500 focus:z-10 sm:text-sm"
                                placeholder="Correo Electrónico"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        {!isLogin && (
                            <div className="relative">
                                <Phone className="absolute top-3 left-3 text-slate-400 w-5 h-5" />
                                <input
                                    type="tel"
                                    required
                                    className="appearance-none rounded-lg relative block w-full px-10 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-secondary-500 focus:border-secondary-500 focus:z-10 sm:text-sm"
                                    placeholder="Número Telefónico"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        )}
                        <div className="relative">
                            <Lock className="absolute top-3 left-3 text-slate-400 w-5 h-5" />
                            <input
                                type="password"
                                required
                                className="appearance-none rounded-lg relative block w-full px-10 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-secondary-500 focus:border-secondary-500 focus:z-10 sm:text-sm"
                                placeholder="Contraseña"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                        {!isLogin && (
                            <div className="flex items-center justify-center space-x-4 mt-4">
                                <label className="flex items-center">
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
                                <label className="flex items-center">
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
                                className="w-full inline-flex justify-center py-2.5 px-4 border border-slate-300 rounded-lg shadow-sm bg-white text-sm font-medium text-slate-500 hover:bg-slate-50"
                            >
                                <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                                </svg>
                                <span className="ml-2">Google</span>
                            </button>
                        </div>

                        <div>
                            <button
                                onClick={() => loginWithApple()}
                                className="w-full inline-flex justify-center py-2.5 px-4 border border-slate-300 rounded-lg shadow-sm bg-white text-sm font-medium text-slate-500 hover:bg-slate-50"
                            >
                                <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                                </svg>
                                <span className="ml-2">Apple</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    );
};

export default AuthPage;
