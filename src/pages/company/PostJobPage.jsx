import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { MEXICAN_STATES, JOB_CATEGORIES } from '../../data/mockData';
import { MEXICO_DATA } from '../../data/mexicoData';
import { generateJobDescription } from '../../utils/jobDescriptionGenerator';
import { Sparkles, Info, Building2, Plus, Upload, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Toast from '../../components/Toast';

const PostJobPage = () => {
    const [searchParams] = useSearchParams();
    const jobId = searchParams.get('id');
    const { jobs, addJob, updateJob, adminGetUsers, adminCreateCompanyProfile } = useData();
    const { user } = useAuth();
    const navigate = useNavigate();

    const isAdmin = user?.role === 'admin';
    const canHideSalary = isAdmin || Boolean(user?.can_hide_salary || user?.canHideSalary);
    const canPostConfidential = isAdmin || Boolean(user?.can_post_confidential || user?.canPostConfidential);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        salary: '',
        salary_min: '',
        salary_max: '',
        hide_salary: false,
        type: 'Presencial',
        location: '',
        city: '',
        isConfidential: false
    });

    // Admin Multi-Company Publishing State
    const [companies, setCompanies] = useState([]);
    const [companyMode, setCompanyMode] = useState('existing'); // 'existing' | 'new'
    const [selectedCompanyId, setSelectedCompanyId] = useState('');
    const [newCompanyData, setNewCompanyData] = useState({
        name: '',
        logo: '',
        rfc: '',
        industry: '',
        phone: '',
        recruiter_name: ''
    });

    const [toast, setToast] = useState(null);
    const [successBanner, setSuccessBanner] = useState('');

    const [isGenerating, setIsGenerating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const duplicateId = searchParams.get('duplicate');
    const [lastInitializedId, setLastInitializedId] = useState(null);

    // Helpers for Capitalization & Money Formatting
    const capitalizeWords = (str) => {
        if (!str) return '';
        return str
            .split(' ')
            .map(word => word ? word.charAt(0).toUpperCase() + word.slice(1) : '')
            .join(' ');
    };

    const formatMoneyInput = (val) => {
        if (!val && val !== 0) return '';
        const digits = String(val).replace(/\D/g, '');
        if (!digits) return '';
        return `$ ${Number(digits).toLocaleString('es-MX')}`;
    };

    const parseMoneyValue = (val) => {
        if (!val && val !== 0) return '';
        const digits = String(val).replace(/\D/g, '');
        return digits ? digits : '';
    };

    // Load registered companies for Admin selector
    useEffect(() => {
        if (isAdmin && adminGetUsers) {
            adminGetUsers().then(usersData => {
                const companyList = (usersData || []).filter(u => u.role === 'company');
                setCompanies(companyList);
                if (companyList.length > 0 && !selectedCompanyId) {
                    setSelectedCompanyId(companyList[0].id);
                } else if (companyList.length === 0) {
                    setCompanyMode('new');
                }
            }).catch(err => console.error("Error loading companies for admin:", err));
        }
    }, [isAdmin, adminGetUsers]);

    useEffect(() => {
        const targetId = jobId || duplicateId;

        if (!targetId) return;
        if (lastInitializedId === targetId) return;
        if (jobs.length === 0) return;

        const jobToEdit = jobs.find(j => j.id === Number(targetId));
        if (jobToEdit) {
            if (jobToEdit.company_id !== user.id && !isAdmin) {
                navigate('/dashboard');
                return;
            }

            let state = jobToEdit.location;
            let city = '';

            if (jobToEdit.location && jobToEdit.location.includes(',')) {
                const parts = jobToEdit.location.split(',').map(p => p.trim());
                if (parts.length >= 2) {
                    const possibleState = parts[parts.length - 1];
                    if (MEXICAN_STATES.includes(possibleState)) {
                        state = possibleState;
                        city = parts.slice(0, parts.length - 1).join(', ');
                    }
                }
            }

            setFormData({
                title: jobToEdit.title + (duplicateId ? ' (Copia)' : ''),
                description: jobToEdit.description,
                category: jobToEdit.category,
                salary: jobToEdit.salary,
                salary_min: jobToEdit.salary_min || '',
                salary_max: jobToEdit.salary_max || '',
                hide_salary: jobToEdit.hide_salary || false,
                type: jobToEdit.type,
                location: state,
                city: city,
                isConfidential: jobToEdit.is_confidential
            });

            if (isAdmin && jobToEdit.company_id) {
                setSelectedCompanyId(jobToEdit.company_id);
            }

            setLastInitializedId(targetId);
        }
    }, [jobId, duplicateId, jobs, user, isAdmin, navigate, lastInitializedId]);

    const handleGenerateDescription = () => {
        if (!formData.title) {
            alert('Por favor escribe un título de la vacante primero.');
            return;
        }

        setIsGenerating(true);

        const fullLocation = formData.city
            ? `${formData.city}, ${formData.location}`
            : formData.location || 'México';

        const companyName = isAdmin
            ? (companyMode === 'new' ? (newCompanyData.name || 'Empresa') : (companies.find(c => c.id === selectedCompanyId)?.name || 'Empresa'))
            : (user.name || 'Nuestra Empresa');

        setTimeout(() => {
            const generatedDesc = generateJobDescription(formData.title, companyName, fullLocation);
            setFormData(prev => ({ ...prev, description: generatedDesc }));
            setIsGenerating(false);
        }, 800);
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("La imagen es muy pesada. Sube un archivo menor a 2MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewCompanyData(prev => ({ ...prev, logo: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const fullLocation = formData.city
                ? `${formData.city}, ${formData.location}`
                : formData.location;

            let finalCompanyId = user.id;

            let targetCompanyProfile = null;

            // Admin company assignment logic
            if (isAdmin) {
                if (companyMode === 'new') {
                    if (!newCompanyData.name.trim()) {
                        alert('Por favor ingresa el nombre de la nueva empresa.');
                        setIsSubmitting(false);
                        return;
                    }
                    const createdCompany = await adminCreateCompanyProfile({
                        ...newCompanyData,
                        location: fullLocation
                    });
                    finalCompanyId = createdCompany?.id || crypto.randomUUID();
                    targetCompanyProfile = createdCompany || { name: newCompanyData.name, logo: newCompanyData.logo };
                } else if (companyMode === 'existing') {
                    if (!selectedCompanyId) {
                        alert('Por favor selecciona una empresa de la lista o elige "Crear Nueva Empresa".');
                        setIsSubmitting(false);
                        return;
                    }
                    finalCompanyId = selectedCompanyId;
                    targetCompanyProfile = companies.find(c => c.id === selectedCompanyId) || null;
                }
            }

            const salaryMinVal = formData.salary_min ? Number(formData.salary_min) : null;
            const salaryMaxVal = formData.salary_max ? Number(formData.salary_max) : null;
            const calculatedSalary = salaryMinVal || salaryMaxVal || 0;

            const selectedComp = companies.find(c => c.id === selectedCompanyId);
            const resolvedCompanyName = targetCompanyProfile?.name || selectedComp?.name || (companyMode === 'new' ? newCompanyData.name : null);
            const resolvedCompanyLogo = targetCompanyProfile?.logo || targetCompanyProfile?.logo_url || selectedComp?.logo || (companyMode === 'new' ? newCompanyData.logo : null);

            const jobData = {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                salary: calculatedSalary,
                salary_min: salaryMinVal,
                salary_max: salaryMaxVal,
                hide_salary: canHideSalary ? formData.hide_salary : false,
                type: formData.type,
                location: fullLocation,
                is_confidential: canPostConfidential ? formData.isConfidential : false,
                currency: 'MXN',
                company_id: finalCompanyId,
                empresa_override: resolvedCompanyName,
                logo_override: resolvedCompanyLogo,
                company_name: resolvedCompanyName,
                company_logo: resolvedCompanyLogo,
                companyProfile: targetCompanyProfile || (resolvedCompanyName ? { name: resolvedCompanyName, logo: resolvedCompanyLogo } : null)
            };

            if (jobId) {
                await updateJob(Number(jobId), jobData);
                setToast({ message: '¡Vacante actualizada con éxito!', type: 'success' });
                setTimeout(() => {
                    navigate(isAdmin ? '/users' : '/dashboard');
                }, 1200);
            } else {
                await addJob(jobData);

                if (isAdmin) {
                    const publishedTitle = formData.title;
                    setToast({ message: '🎉 ¡Vacante publicada con éxito!', type: 'success' });
                    setSuccessBanner(`¡Vacante "${publishedTitle}" publicada con éxito! Ya puedes ingresar los datos para publicar otra vacante.`);
                    window.scrollTo({ top: 0, behavior: 'smooth' });

                    // Reset title, description & salary fields for rapid multi-job posting
                    setFormData(prev => ({
                        ...prev,
                        title: '',
                        description: '',
                        salary: '',
                        salary_min: '',
                        salary_max: ''
                    }));
                } else {
                    navigate('/dashboard', { state: { message: '¡Vacante publicada con éxito!' } });
                }
            }
        } catch (error) {
            console.error("Error submitting job:", error);
            alert("Error al publicar la vacante: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 relative">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* SUCCESS BANNER FOR ADMIN FAST MULTI-POSTING */}
            {successBanner && (
                <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                        <span className="text-sm font-bold">{successBanner}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/users')}
                        className="text-xs font-bold bg-white text-green-800 border border-green-300 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors shrink-0 cursor-pointer"
                    >
                        📋 Ir al Panel Admin
                    </button>
                </div>
            )}

            <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">
                        {jobId ? 'Editar Vacante' : (duplicateId ? 'Duplicar Vacante' : 'Publicar Vacante')}
                    </h1>
                    {isAdmin && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full mt-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Herramienta Administrador
                        </span>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* ADMIN COMPANY SELECTOR & CREATOR SECTION */}
                {isAdmin && (
                    <div className="p-5 rounded-2xl border border-secondary-200 bg-secondary-50/50 space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-secondary-200">
                            <Building2 className="w-5 h-5 text-secondary-600" />
                            <h3 className="font-bold text-slate-900 text-sm">Empresa Publicadora de la Vacante</h3>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setCompanyMode('existing')}
                                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${companyMode === 'existing' ? 'bg-secondary-600 text-white border-secondary-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
                            >
                                🏢 Seleccionar Empresa Registrada
                            </button>
                            <button
                                type="button"
                                onClick={() => setCompanyMode('new')}
                                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${companyMode === 'new' ? 'bg-secondary-600 text-white border-secondary-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
                            >
                                ➕ Crear Nueva Empresa
                            </button>
                        </div>

                        {companyMode === 'existing' ? (
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Empresa Destino</label>
                                <select
                                    required={isAdmin && companyMode === 'existing'}
                                    className="w-full rounded-xl border-slate-300 shadow-2xs text-sm border p-2.5 bg-white font-medium"
                                    value={selectedCompanyId}
                                    onChange={e => setSelectedCompanyId(e.target.value)}
                                >
                                    <option value="">Selecciona una empresa...</option>
                                    {companies.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} ({c.email}) {c.rfc ? `• RFC: ${c.rfc}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="space-y-4 pt-1">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">Nombre de la Empresa *</label>
                                        <input
                                            type="text"
                                            required={isAdmin && companyMode === 'new'}
                                            placeholder="Ej. OXXO, Coppel, Ternium, Grupo Bimbo..."
                                            className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-medium"
                                            value={newCompanyData.name}
                                            onChange={e => setNewCompanyData({ ...newCompanyData, name: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">RFC (Opcional)</label>
                                        <input
                                            type="text"
                                            placeholder="Ej. BIM901020ABC"
                                            className="w-full rounded-xl border border-slate-300 p-2.5 text-sm uppercase font-mono"
                                            value={newCompanyData.rfc}
                                            onChange={e => setNewCompanyData({ ...newCompanyData, rfc: e.target.value.toUpperCase() })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">Reclutador / Contacto (Opcional)</label>
                                        <input
                                            type="text"
                                            placeholder="Ej. Lic. Carlos Mendoza"
                                            className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                                            value={newCompanyData.recruiter_name}
                                            onChange={e => setNewCompanyData({ ...newCompanyData, recruiter_name: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">Teléfono / LADA (Opcional)</label>
                                        <input
                                            type="text"
                                            placeholder="Ej. 8112345678"
                                            className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                                            value={newCompanyData.phone}
                                            onChange={e => setNewCompanyData({ ...newCompanyData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Logo de la Empresa (Opcional)</label>
                                    <div className="flex items-center gap-4">
                                        {newCompanyData.logo && (
                                            <img src={newCompanyData.logo} alt="Logo Previsto" className="w-12 h-12 object-contain rounded-xl border p-1 bg-white" />
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            className="text-xs text-slate-600 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1">Título de la vacante</label>
                    <input
                        type="text"
                        required
                        autoCapitalize="words"
                        className="block w-full rounded-xl border-slate-300 shadow-2xs focus:border-secondary-500 focus:ring-secondary-500 text-sm border p-3 font-semibold text-slate-900"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: capitalizeWords(e.target.value) })}
                        onBlur={e => setFormData({ ...formData, title: capitalizeWords(e.target.value.trim()) })}
                        placeholder="Ej. Vendedor, Chofer, Limpieza..."
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-bold text-slate-800">Descripción completa</label>
                        <button
                            type="button"
                            onClick={handleGenerateDescription}
                            disabled={isGenerating || !formData.title}
                            className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer
                                ${!formData.title
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                                }`}
                        >
                            <Sparkles className={`w-3.5 h-3.5 mr-1.5 ${isGenerating ? 'animate-spin' : ''}`} />
                            {isGenerating ? 'Generando...' : 'Generar con IA'}
                        </button>
                    </div>
                    <textarea
                        required
                        rows={10}
                        className="block w-full rounded-xl border-slate-300 shadow-2xs focus:border-secondary-500 focus:ring-secondary-500 text-sm border p-3 font-sans leading-relaxed text-slate-800"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe las responsabilidades, requisitos y beneficios del puesto..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1">Categoría</label>
                    <select
                        required
                        className="block w-full rounded-xl border-slate-300 shadow-2xs text-sm border p-3 bg-white font-medium"
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                    >
                        <option value="">Seleccionar Categoría...</option>
                        {JOB_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                {/* RANGO DE SUELDO (DESDE / HASTA) CON FORMATO MONEDA */}
                <div className="space-y-3 p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                    <label className="block text-sm font-bold text-slate-900">Rango de sueldo mensual (MXN)</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Desde ($ MXN)</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                className="block w-full rounded-xl border-slate-300 shadow-2xs text-sm border p-2.5 bg-white font-bold text-slate-900"
                                value={formatMoneyInput(formData.salary_min)}
                                onChange={e => {
                                    const raw = parseMoneyValue(e.target.value);
                                    setFormData({ ...formData, salary_min: raw });
                                }}
                                placeholder="$ 8,000"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Hasta ($ MXN)</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                className="block w-full rounded-xl border-slate-300 shadow-2xs text-sm border p-2.5 bg-white font-bold text-slate-900"
                                value={formatMoneyInput(formData.salary_max)}
                                onChange={e => {
                                    const raw = parseMoneyValue(e.target.value);
                                    setFormData({ ...formData, salary_max: raw });
                                }}
                                placeholder="$ 15,000"
                            />
                        </div>
                    </div>

                    {/* NOTA RECLUTADOR */}
                    <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900">
                        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <p>
                            <strong>Tip para mejores resultados:</strong> Publicar el rango de sueldo real aumenta significativamente la cantidad y calidad de los candidatos que se postulan a tu vacante.
                        </p>
                    </div>

                    {/* OCULTAR SALARIO */}
                    {canHideSalary && (
                        <div className="flex items-center pt-1">
                            <input
                                id="hide_salary"
                                type="checkbox"
                                className="h-4 w-4 text-secondary-600 focus:ring-secondary-500 border-slate-300 rounded cursor-pointer"
                                checked={formData.hide_salary}
                                onChange={e => setFormData({ ...formData, hide_salary: e.target.checked })}
                            />
                            <label htmlFor="hide_salary" className="ml-2 block text-sm font-semibold text-slate-800 cursor-pointer">
                                Ocultar salario a los candidatos en el listado de vacantes
                            </label>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-1">Modalidad</label>
                        <select
                            required
                            className="block w-full rounded-xl border-slate-300 shadow-2xs text-sm border p-3 bg-white font-medium"
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="Presencial">Presencial</option>
                            <option value="Remoto">Remoto</option>
                            <option value="Híbrido">Híbrido</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-1">Estado</label>
                        <select
                            required
                            className="block w-full rounded-xl border-slate-300 shadow-2xs text-sm border p-3 bg-white font-medium"
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value, city: '' })}
                        >
                            <option value="">Seleccionar Estado...</option>
                            {MEXICAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-800 mb-1">Ciudad / Municipio</label>
                        <select
                            required
                            disabled={!formData.location}
                            className={`block w-full rounded-xl border-slate-300 shadow-2xs text-sm border p-3 bg-white font-medium ${!formData.location ? 'bg-slate-100 text-slate-400' : ''}`}
                            value={formData.city}
                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                        >
                            <option value="">Seleccionar Ciudad / Municipio...</option>
                            {formData.location && MEXICO_DATA[formData.location]?.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* EMPRESA CONFIDENCIAL */}
                {canPostConfidential && (
                    <div className="flex items-center p-3 rounded-xl border border-slate-200 bg-slate-50">
                        <input
                            id="confidential"
                            type="checkbox"
                            className="h-4 w-4 text-secondary-600 focus:ring-secondary-500 border-slate-300 rounded cursor-pointer"
                            checked={formData.isConfidential}
                            onChange={e => setFormData({ ...formData, isConfidential: e.target.checked })}
                        />
                        <label htmlFor="confidential" className="ml-2 block text-sm font-semibold text-slate-800 cursor-pointer">
                            Publicar como Empresa Confidencial (Ocultar nombre y logo)
                        </label>
                    </div>
                )}

                <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}
                        className="bg-white text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold border border-slate-300 hover:bg-slate-50 mr-3 transition-colors cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-secondary-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-secondary-700 transition-all shadow-md active:scale-98 disabled:opacity-50 cursor-pointer"
                    >
                        {isSubmitting ? 'Publicando...' : (jobId ? 'Guardar Cambios' : 'Publicar Vacante')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PostJobPage;
