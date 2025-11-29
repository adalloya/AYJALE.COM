import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { MapPin, DollarSign, Briefcase, Calendar, Building } from 'lucide-react';
import SEO from '../components/SEO';

const JobDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { jobs, users, applyToJob, applications } = useData();
    const { user } = useAuth();

    const job = jobs.find(j => j.id === Number(id));
    const company = users.find(u => u.id === job?.company_id);

    if (!job) {
        return <div className="text-center py-12">Vacante no encontrada.</div>;
    }

    const hasApplied = user && applications.some(app => app.jobId === job.id && app.candidateId === user.id);

    const handleApply = () => {
        if (!user) {
            navigate(`/auth?returnUrl=/jobs/${id}`);
            return;
        }

        if (user.role !== 'candidate') {
            alert('Solo los candidatos pueden postularse.');
            return;
        }

        if (job.is_external && job.external_url) {
            // Track application internally before redirecting (optional, but good for analytics)
            // For now, just redirect
            window.open(job.external_url, '_blank', 'noopener,noreferrer');
            return;
        }

        navigate(`/profile?applyingTo=${job.id}`);
    };

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <SEO
                title={job.title}
                description={`${job.title} en ${job.location}. ${job.description.substring(0, 150)}...`}
            />
            <div className="bg-primary-50 p-8 border-b border-primary-100">
                <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-6">
                        <div className="flex-shrink-0 bg-white p-2 rounded-xl shadow-sm">
                            {!job.is_confidential && company?.logo ? (
                                <img
                                    src={company.logo}
                                    alt={company.name}
                                    className="w-20 h-20 object-contain"
                                />
                            ) : (
                                <div className="w-20 h-20 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <Building className="w-10 h-10 text-orange-500 opacity-80" />
                                </div>
                            )}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">{job.title}</h1>
                            <div className="flex items-center mt-2 text-primary-700 font-medium text-lg">
                                <Building className="w-5 h-5 mr-2" />
                                {job.is_confidential ? 'Empresa Confidencial' : (company?.name || 'Empresa Confidencial')}
                            </div>
                        </div>
                    </div>
                    <span className="bg-white text-primary-600 px-4 py-1 rounded-full text-sm font-semibold shadow-sm">
                        {job.type}
                    </span>
                    {job.is_external && (
                        <span className="ml-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
                            Externa
                        </span>
                    )}
                </div>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Descripción del Puesto</h2>
                        <p className="text-slate-600 whitespace-pre-line leading-relaxed">
                            {job.description}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Requisitos y Detalles</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center text-slate-600">
                                <MapPin className="w-5 h-5 mr-3 text-slate-400" />
                                {job.location}
                            </div>
                            <div className="flex items-center text-slate-600">
                                <DollarSign className="w-5 h-5 mr-3 text-slate-400" />
                                ${job.salary.toLocaleString('es-MX')} {job.currency} / Mes
                            </div>
                            <div className="flex items-center text-slate-600">
                                <Briefcase className="w-5 h-5 mr-3 text-slate-400" />
                                {job.category}
                            </div>
                            <div className="flex items-center text-slate-600">
                                <Calendar className="w-5 h-5 mr-3 text-slate-400" />
                                Publicado: {new Date(job.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    </section>
                </div>

                <div className="md:col-span-1">
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 sticky top-8">
                        <h3 className="font-bold text-slate-900 mb-4">¿Te interesa?</h3>
                        {job.is_external && (
                            <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-100">
                                Esta es una vacante externa de <strong>{job.source || 'un sitio asociado'}</strong>.
                                Al postularte serás redirigido para completar el proceso.
                            </div>
                        )}

                        {hasApplied ? (
                            <button disabled className="w-full bg-green-600 text-white py-3 rounded-lg font-medium cursor-default opacity-90">
                                Ya te has postulado
                            </button>
                        ) : (
                            <button
                                onClick={handleApply}
                                className="w-full bg-secondary-600 text-white py-3 rounded-lg font-medium hover:bg-secondary-700 transition-colors shadow-sm hover:shadow"
                            >
                                {job.is_external ? 'Postularme en Sitio Externo' : 'Postularme Ahora'}
                            </button>
                        )}
                        <p className="mt-4 text-xs text-slate-500 text-center">
                            Al postularte aceptas compartir tu perfil con la empresa.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetailsPage;
