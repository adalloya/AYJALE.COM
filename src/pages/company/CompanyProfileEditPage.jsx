import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, FileText, MapPin, Phone, Upload, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { MEXICAN_STATES } from '../../data/mockData';
import Toast from '../../components/Toast';
import logoImg from '../../assets/ayjale_logo_new.png';

const CompanyProfileEditPage = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        rfc: '',
        industry: '',
        location: '',
        city: '',
        address: '',
        phone_number: '',
        logo: ''
    });

    useEffect(() => {
        if (user) {
            let stateVal = user.location || '';
            let cityVal = user.city || '';

            if (user.location && user.location.includes(',')) {
                const parts = user.location.split(',').map(p => p.trim());
                if (parts.length >= 2) {
                    const possibleState = parts[parts.length - 1];
                    if (MEXICAN_STATES.includes(possibleState)) {
                        stateVal = possibleState;
                        cityVal = parts.slice(0, parts.length - 1).join(', ');
                    }
                }
            }

            setFormData({
                name: user.name || '',
                rfc: user.rfc || '',
                industry: user.industry || '',
                location: stateVal,
                city: cityVal,
                address: user.address || '',
                phone_number: user.phone_number || '',
                logo: user.logo || ''
            });
        }
    }, [user]);

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

    const formatPhoneNumber = (val) => {
        if (!val) return '';
        const digits = val.replace(/\D/g, '');
        if (digits.length === 0) return '';
        if (digits.length <= 3) return `(${digits}`;
        if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setToast({ message: "La imagen es muy pesada. Sube una imagen menor a 2MB.", type: 'error' });
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, logo: reader.result }));
                setToast({ message: "Logotipo cargado correctamente.", type: 'success' });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const fullLocation = formData.city && formData.location
            ? `${formData.city}, ${formData.location}`
            : (formData.city || formData.location);

        try {
            await updateUser({
                name: capitalizeWords(formData.name.trim()),
                rfc: String(formData.rfc || '').toUpperCase().trim(),
                industry: formData.industry,
                location: fullLocation,
                city: formData.city,
                address: capitalizeWords(formData.address.trim()),
                phone_number: formData.phone_number,
                logo: formData.logo
            });

            setToast({ message: "¡Perfil de empresa guardado exitosamente!", type: 'success' });
            setTimeout(() => {
                navigate('/dashboard');
            }, 800);
        } catch (error) {
            console.error("Error saving company profile:", error);
            setToast({ message: "Error al guardar perfil. Intenta de nuevo.", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <Link to="/dashboard" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-900">Editar Perfil de Empresa</h1>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Completa la información pública de tu empresa para la publicación de vacantes.
                            </p>
                        </div>
                    </div>

                    <img src={logoImg} alt="AyJale" className="h-9 w-auto object-contain" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* 1. NOMBRE DE LA EMPRESA */}
                    <div>
                        <label className="block text-sm font-bold text-slate-900 mb-1">
                            1. Nombre de la Empresa (Razón Social o Nombre Comercial) *
                        </label>
                        <div className="relative">
                            <Building2 className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5 pointer-events-none" />
                            <input
                                type="text"
                                required
                                autoCapitalize="words"
                                className="pl-11 block w-full rounded-xl border border-slate-300 py-3 px-3.5 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
                                placeholder="Ej. Transportes y Logística de México S.A. de C.V."
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                onBlur={() => setFormData(prev => ({ ...prev, name: capitalizeWords(prev.name.trim()) }))}
                            />
                        </div>
                    </div>

                    {/* 2. RFC */}
                    <div>
                        <label className="block text-sm font-bold text-slate-900 mb-1">
                            2. R.F.C. (Registro Federal de Contribuyentes) *
                        </label>
                        <div className="relative">
                            <FileText className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5 pointer-events-none" />
                            <input
                                type="text"
                                required
                                autoCapitalize="characters"
                                className="pl-11 block w-full rounded-xl border border-slate-300 py-3 px-3.5 text-sm font-mono font-bold uppercase text-slate-900 focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
                                placeholder="Ej. TLM901234XYZ"
                                value={formData.rfc}
                                onChange={e => setFormData({ ...formData, rfc: e.target.value.toUpperCase() })}
                            />
                        </div>
                    </div>

                    {/* 3. INDUSTRIA / SECTOR */}
                    <div>
                        <label className="block text-sm font-bold text-slate-900 mb-1">
                            3. Industria / Sector *
                        </label>
                        <select
                            required
                            className="block w-full rounded-xl border border-slate-300 py-3 px-3.5 text-sm font-medium text-slate-900 bg-white focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
                            value={formData.industry}
                            onChange={e => setFormData({ ...formData, industry: e.target.value })}
                        >
                            <option value="">Selecciona Industria / Sector...</option>
                            <option value="Tecnología">Tecnología</option>
                            <option value="Salud">Salud</option>
                            <option value="Educación">Educación</option>
                            <option value="Finanzas">Finanzas</option>
                            <option value="Manufactura">Manufactura</option>
                            <option value="Comercio">Comercio</option>
                            <option value="Servicios">Servicios</option>
                            <option value="Logística y Transporte">Logística y Transporte</option>
                            <option value="Restaurantes y Alimentos">Restaurantes y Alimentos</option>
                            <option value="Construcción">Construcción</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </div>

                    {/* 4. UBICACIÓN (CIUDAD, ESTADO) */}
                    <div>
                        <label className="block text-sm font-bold text-slate-900 mb-1">
                            4. Ubicación (Ciudad, Estado) *
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <input
                                    type="text"
                                    required
                                    autoCapitalize="words"
                                    className="block w-full rounded-xl border border-slate-300 py-3 px-3.5 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
                                    placeholder="Ciudad / Municipio (Ej. Mérida)"
                                    value={formData.city}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    onBlur={() => setFormData(prev => ({ ...prev, city: capitalizeWords(prev.city.trim()) }))}
                                />
                            </div>
                            <div>
                                <select
                                    required
                                    className="block w-full rounded-xl border border-slate-300 py-3 px-3.5 text-sm font-medium text-slate-900 bg-white focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                >
                                    <option value="">Selecciona Estado...</option>
                                    {MEXICAN_STATES.map((stateName, idx) => (
                                        <option key={idx} value={stateName}>{stateName}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* 5. DIRECCIÓN COMPLETA */}
                    <div>
                        <label className="block text-sm font-bold text-slate-900 mb-1">
                            5. Dirección Completa *
                        </label>
                        <div className="relative">
                            <MapPin className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5 pointer-events-none" />
                            <input
                                type="text"
                                required
                                autoCapitalize="words"
                                className="pl-11 block w-full rounded-xl border border-slate-300 py-3 px-3.5 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
                                placeholder="Ej. Calle 60 #123 por 45 y 47, Col. Centro, C.P. 97000"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                onBlur={() => setFormData(prev => ({ ...prev, address: capitalizeWords(prev.address.trim()) }))}
                            />
                        </div>
                    </div>

                    {/* 6. TELÉFONO DE CONTACTO */}
                    <div>
                        <label className="block text-sm font-bold text-slate-900 mb-1">
                            6. Teléfono de Contacto de la Empresa *
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5 pointer-events-none" />
                            <input
                                type="tel"
                                required
                                className="pl-11 block w-full rounded-xl border border-slate-300 py-3 px-3.5 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
                                placeholder="Ej. (999) 123-4567"
                                value={formData.phone_number}
                                onChange={e => setFormData({ ...formData, phone_number: formatPhoneNumber(e.target.value) })}
                            />
                        </div>
                    </div>

                    {/* 7. LOGOTIPO DE LA EMPRESA */}
                    <div className="pt-2">
                        <label className="block text-sm font-bold text-slate-900 mb-1">
                            7. Logotipo de la Empresa (Opcional)
                        </label>
                        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                            {formData.logo ? (
                                <img
                                    src={formData.logo}
                                    alt="Logo Empresa"
                                    className="w-20 h-20 rounded-lg object-contain bg-white border border-slate-200 p-1 shrink-0"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-lg bg-white border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 shrink-0">
                                    <Building2 className="w-8 h-8" />
                                    <span className="text-[10px] text-slate-400 mt-1 font-semibold">Sin Logo</span>
                                </div>
                            )}

                            <div className="flex-1 text-center sm:text-left space-y-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    id="company-logo-file"
                                    className="hidden"
                                    onChange={handleLogoUpload}
                                />
                                <label
                                    htmlFor="company-logo-file"
                                    className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold border border-slate-300 cursor-pointer transition-colors shadow-2xs"
                                >
                                    <Upload className="w-4 h-4 text-slate-500" />
                                    {formData.logo ? 'Cambiar Logotipo' : 'Subir Logotipo (PNG / JPG)'}
                                </label>
                                <p className="text-[11px] text-slate-400">Recomendado: Imagen cuadrada, max 2MB.</p>
                            </div>
                        </div>
                    </div>

                    {/* BOTONES DE ACCIÓN */}
                    <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white ${loading ? 'bg-secondary-400 cursor-not-allowed' : 'bg-secondary-600 hover:bg-secondary-700'} transition-all shadow-md active:scale-98 cursor-pointer`}
                        >
                            {loading ? 'Guardando...' : 'Guardar y Continuar al Panel'}
                            {!loading && <ArrowRight className="w-4 h-4" />}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default CompanyProfileEditPage;
