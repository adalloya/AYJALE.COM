import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { MEXICAN_STATES, JOB_CATEGORIES } from '../../data/mockData';

const PostJobPage = () => {
    const [searchParams] = useSearchParams();
    const jobId = searchParams.get('id');
    const { jobs, postJob, updateJob } = useData(); // Assuming updateJob exists in context
    const { user } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        salary: '',
        type: 'Presencial',
        location: '',
        isConfidential: false
    });

    useEffect(() => {
        if (jobId && jobs.length > 0) {
            const jobToEdit = jobs.find(j => j.id === Number(jobId));
            if (jobToEdit) {
                // Security check
                if (jobToEdit.company_id !== user.id) {
                    navigate('/dashboard');
                    return;
                }
                setFormData({
                    title: jobToEdit.title,
                    description: jobToEdit.description,
                    category: jobToEdit.category,
                    salary: jobToEdit.salary,
                    type: jobToEdit.type,
                    location: jobToEdit.location,
                    isConfidential: jobToEdit.is_confidential
                });
            }
        }
    }, [jobId, jobs, user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const jobData = {
            title: formData.title,
            description: formData.description,
            category: formData.category,
            salary: Number(formData.salary),
            type: formData.type,
            location: formData.location,
            is_confidential: formData.isConfidential,
            currency: 'MXN'
        };

        if (jobId) {
            await updateJob(Number(jobId), jobData);
        } else {
            await postJob(jobData);
        }
        navigate('/dashboard');
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">{jobId ? 'Editar Vacante' : 'Publicar Nueva Vacante'}</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Título del Puesto</label>
                    <input
                        type="text"
                        required
                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Descripción</label>
                    <textarea
                        required
                        rows={4}
                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
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
                        <label className="block text-sm font-medium text-slate-700">Salario Mensual (MXN)</label>
                        <input
                            type="number"
                            required
                            min="0"
                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                            value={formData.salary}
                            onChange={e => setFormData({ ...formData, salary: e.target.value })}
                        />
                    </div>
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
                        <label className="block text-sm font-medium text-slate-700">Ubicación (Estado)</label>
                        <select
                            required
                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 bg-white"
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                        >
                            <option value="">Seleccionar...</option>
                            {MEXICAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>

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

                <div className="flex justify-end pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
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
