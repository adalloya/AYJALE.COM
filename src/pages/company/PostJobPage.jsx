import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { MEXICAN_STATES, JOB_CATEGORIES } from '../../data/mockData';
import { MEXICO_DATA } from '../../data/mexicoData';
import { generateJobDescription } from '../../utils/jobDescriptionGenerator';
import { Sparkles, Info } from 'lucide-react';

const PostJobPage = () => {
    const [searchParams] = useSearchParams();
    const jobId = searchParams.get('id');
    const { jobs, addJob, updateJob } = useData();
    const { user } = useAuth();
    const navigate = useNavigate();

    const canHideSalary = user?.role === 'admin' || Boolean(user?.can_hide_salary || user?.canHideSalary);
    const canPostConfidential = user?.role === 'admin' || Boolean(user?.can_post_confidential || user?.canPostConfidential);

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

    const [isGenerating, setIsGenerating] = useState(false);

    const duplicateId = searchParams.get('duplicate');
    const [lastInitializedId, setLastInitializedId] = useState(null);

    useEffect(() => {
        const targetId = jobId || duplicateId;

        if (!targetId) return;
        if (lastInitializedId === targetId) return;
        if (jobs.length === 0) return;

        const jobToEdit = jobs.find(j => j.id === Number(targetId));
        if (jobToEdit) {
            if (jobToEdit.company_id !== user.id && user.role !== 'admin') {
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

            setLastInitializedId(targetId);
        }
    }, [jobId, duplicateId, jobs, user, navigate, lastInitializedId]);

    const handleGenerateDescription = () => {
        if (!formData.title) {
            alert('Por favor escribe un título para el puesto primero.');
            return;
        }

        setIsGenerating(true);

        const fullLocation = formData.city
            ? `${formData.city}, ${formData.location}`
            : formData.location || 'México';

        const companyName = user.name || 'Nuestra Empresa';

        setTimeout(() => {
            const generatedDesc = generateJobDescription(formData.title, companyName, fullLocation);
            setFormData(prev => ({ ...prev, description: generatedDesc }));
            setIsGenerating(false);
        }, 800);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const fullLocation = formData.city
            ? `${formData.city}, ${formData.location}`
            : formData.location;

        const jobData = {
            title: formData.title,
            description: formData.description,
            category: formData.category,
            salary: Number(formData.salary),
            salary_min: formData.salary_min ? Number(formData.salary_min) : null,
            salary_max: formData.salary_max ? Number(formData.salary_max) : null,
            hide_salary: canHideSalary ? formData.hide_salary : false,
            type: formData.type,
            location: fullLocation,
            is_confidential: canPostConfidential ? formData.isConfidential : false,
            currency: 'MXN'
        };

        const successMessage = jobId
            ? '¡Vacante actualizada con éxito!'
            : '¡Vacante publicada con éxito!';

        if (jobId) {
            await updateJob(Number(jobId), jobData);
        } else {
            await addJob(jobData);
        }

        const targetRoute = user.role === 'admin' ? '/admin' : '/dashboard';
        navigate(targetRoute, { state: { message: successMessage } });
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">{jobId ? 'Editar Vacante' : (duplicateId ? 'Duplicar Vacante' : 'Publicar Nueva Vacante')}</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Título de la vacante</label>
                    <input
                        type="text"
                        required
                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Ej. Vendedor, Chofer, Limpieza..."
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-slate-700">Descripción</label>
                        <button
                            type="button"
                            onClick={handleGenerateDescription}
                            disabled={isGenerating || !formData.title}
                            className={`flex items-center text-xs font-medium px-3 py-1.5 rounded-full transition-colors
                                ${!formData.title
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                                }`}
                        >
                            <Sparkles className={`w-3 h-3 mr-1.5 ${isGenerating ? 'animate-spin' : ''}`} />
                            {isGenerating ? 'Generando...' : 'Generar con IA'}
                        </button>
                    </div>
                    <textarea
                        required
                        rows={12}
                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 font-sans"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe las responsabilidades, requisitos y beneficios del puesto..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Categoría</label>
                        <select
                            required
                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 bg-white"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="">Seleccionar...</option>
                            {JOB_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Salario mensual aproximado (MXN)</label>
                        <input
                            type="number"
                            required
                            min="0"
                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                            value={formData.salary}
                            onChange={e => setFormData({ ...formData, salary: e.target.value })}
                            placeholder="Ej. 12000"
                        />
                    </div>
                </div>

                {/* RANGO DE SUELDO (DESDE / HASTA) */}
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-700">Rango de sueldo mensual (MXN)</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Desde</label>
                            <input
                                type="number"
                                min="0"
                                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                                value={formData.salary_min}
                                onChange={e => setFormData({ ...formData, salary_min: e.target.value })}
                                placeholder="Ej. 8,000"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Hasta</label>
                            <input
                                type="number"
                                min="0"
                                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                                value={formData.salary_max}
                                onChange={e => setFormData({ ...formData, salary_max: e.target.value })}
                                placeholder="Ej. 15,000"
                            />
                        </div>
                    </div>

                    {/* NOTA PARA EL RECLUTADOR */}
                    <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <p>
                            <strong>Tip para mejores resultados:</strong> Publicar el rango de sueldo real aumenta significativamente la cantidad y calidad de los candidatos que se postulan a tu vacante.
                        </p>
                    </div>

                    {/* OCULTAR SALARIO - SOLO SI EMPRESA TIENE PERMISO */}
                    {canHideSalary && (
                        <div className="flex items-center pt-1">
                            <input
                                id="hide_salary"
                                type="checkbox"
                                className="h-4 w-4 text-secondary-600 focus:ring-secondary-500 border-slate-300 rounded"
                                checked={formData.hide_salary}
                                onChange={e => setFormData({ ...formData, hide_salary: e.target.checked })}
                            />
                            <label htmlFor="hide_salary" className="ml-2 block text-sm text-slate-900">
                                Ocultar salario en el listado de vacantes
                            </label>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Modalidad</label>
                        <select
                            required
                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 bg-white"
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="Presencial">Presencial</option>
                            <option value="Remoto">Remoto</option>
                            <option value="Híbrido">Híbrido</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Estado</label>
                        <select
                            required
                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 bg-white"
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value, city: '' })}
                        >
                            <option value="">Seleccionar Estado...</option>
                            {MEXICAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Ciudad / Municipio</label>
                        <select
                            required
                            disabled={!formData.location}
                            className={`mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 bg-white ${!formData.location ? 'bg-slate-100 text-slate-400' : ''}`}
                            value={formData.city}
                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                        >
                            <option value="">Seleccionar Ciudad...</option>
                            {formData.location && MEXICO_DATA[formData.location]?.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* EMPRESA CONFIDENCIAL - SOLO SI EMPRESA TIENE PERMISO */}
                {canPostConfidential && (
                    <div className="flex items-center">
                        <input
                            id="confidential"
                            type="checkbox"
                            className="h-4 w-4 text-secondary-600 focus:ring-secondary-500 border-slate-300 rounded"
                            checked={formData.isConfidential}
                            onChange={e => setFormData({ ...formData, isConfidential: e.target.checked })}
                        />
                        <label htmlFor="confidential" className="ml-2 block text-sm text-slate-900">
                            Publicar como Empresa Confidencial (Ocultar nombre y logo)
                        </label>
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    <button
                        type="button"
                        onClick={() => navigate(user.role === 'admin' ? '/admin' : '/dashboard')}
                        className="bg-white text-slate-700 px-4 py-2 rounded-md text-sm font-medium border border-slate-300 hover:bg-slate-50 mr-3"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="bg-secondary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-secondary-700"
                    >
                        {jobId ? 'Guardar Cambios' : 'Publicar Vacante'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PostJobPage;
