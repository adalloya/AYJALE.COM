import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building2, Mail, Lock, ArrowRight } from 'lucide-react';

const CompanyAuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const navigate = useNavigate();
    const { login, register } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isLogin) {
                await login(formData.email, formData.password);
                navigate('/dashboard');
            } else {
                await register({
                    name: formData.name,
                    email: formData.email,
                    rfc: formData.rfc,
                    industry: formData.industry,
                    location: formData.location,
                    address: formData.address,
                    recruiter_name: formData.recruiter_name,
                    phone_number: formData.phone_number,
                    termsAccepted: true
                }, formData.password, 'company');
                navigate('/onboarding');
            }
        } catch (error) {
            console.error("Auth error:", error);
            alert(error.message || 'Error en la autenticación. Intenta de nuevo.');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-slate-100">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-secondary-100 rounded-full flex items-center justify-center mb-4">
                        <Building2 className="h-6 w-6 text-secondary-600" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900">
                        {isLogin ? 'Acceso para Empresas' : 'Registra tu Empresa'}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        {isLogin ? 'Ingresa para gestionar tus vacantes' : 'Publica tus vacantes y encuentra talento'}
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
                                <Building2 className="absolute top-3 left-3 text-slate-400 w-5 h-5" />
                                <input
                                    type="text"
                                    required
                                    className="appearance-none rounded-lg relative block w-full px-10 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-secondary-500 focus:border-secondary-500 focus:z-10 sm:text-sm"
                                    placeholder="Nombre de la Empresa"
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
                                placeholder="Correo Corporativo"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
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
                            <>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            required
                                            className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-secondary-500 focus:border-secondary-500 focus:z-10 sm:text-sm"
                                            placeholder="R.F.C."
                                            value={formData.rfc || ''}
                                            onChange={(e) => setFormData({ ...formData, rfc: e.target.value })}
                                        />
                                    </div>
                                    <select
                                        required
                                        className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-secondary-500 focus:border-secondary-500 focus:z-10 sm:text-sm bg-white"
                                        value={formData.industry || ''}
                                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                    >
                                        <option value="">Industria / Sector...</option>
                                        <option value="Tecnología">Tecnología</option>
                                        <option value="Salud">Salud</option>
                                        <option value="Educación">Educación</option>
                                        <option value="Finanzas">Finanzas</option>
                                        <option value="Manufactura">Manufactura</option>
                                        <option value="Comercio">Comercio</option>
                                        <option value="Servicios">Servicios</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-secondary-500 focus:border-secondary-500 focus:z-10 sm:text-sm"
                                        placeholder="Ubicación (Ciudad, Estado)"
                                        value={formData.location || ''}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-secondary-500 focus:border-secondary-500 focus:z-10 sm:text-sm"
                                        placeholder="Dirección Completa"
                                        value={formData.address || ''}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            required
                                            className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-secondary-500 focus:border-secondary-500 focus:z-10 sm:text-sm"
                                            placeholder="Nombre del Reclutador"
                                            value={formData.recruiter_name || ''}
                                            onChange={(e) => setFormData({ ...formData, recruiter_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="tel"
                                            required
                                            className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-secondary-500 focus:border-secondary-500 focus:z-10 sm:text-sm"
                                            placeholder="Teléfono de Contacto"
                                            value={formData.phone_number || ''}
                                            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                    </div>

                    {/* Logo Upload Field */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Logotipo de la Empresa</label>
                        <input
                            type="file"
                            accept="image/*"
                            className="block w-full text-sm text-slate-500
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-full file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-secondary-50 file:text-secondary-700
                                            hover:file:bg-secondary-100"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        setFormData({ ...formData, logo: reader.result });
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />
                        <p className="mt-1 text-xs text-slate-500">Formato: PNG, JPG (Max 2MB)</p>
                    </div>
                </>
                        )}

                <div>
                    <button
                        type="submit"
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-secondary-600 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500"
                    >
                        <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                            <ArrowRight className="h-5 w-5 text-secondary-500 group-hover:text-secondary-400" aria-hidden="true" />
                        </span>
                        {isLogin ? 'Ingresar al Panel' : 'Registrar Empresa'}
                    </button>
                </div>
            </div>
        </form>
            </div >
        </div >
    );
};

export default CompanyAuthPage;
