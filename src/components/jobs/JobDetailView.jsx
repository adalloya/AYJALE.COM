import { MapPin, DollarSign, Briefcase, Calendar, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

const JobDetailView = ({ job, company, onApply, hasApplied }) => {
    const navigate = useNavigate();
    const { user } = useAuth();

    if (!job) return <div className="p-8 text-center text-slate-500">Selecciona una vacante para ver los detalles.</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
            <div className="bg-primary-50 p-6 border-b border-primary-100">
                <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 bg-white p-2 rounded-xl shadow-sm">
                            {!job.is_confidential && company?.logo ? (
                                <img
                                    src={company.logo}
                                    alt={company.name}
                                    className="w-16 h-16 object-contain"
                                />
                            ) : (
                                <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <Building className="w-8 h-8 text-orange-500 opacity-80" />
                                </div>
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
                            <div className="flex items-center mt-1 text-primary-700 font-medium">
                                <Building className="w-4 h-4 mr-2" />
                                {job.is_confidential ? 'Empresa Confidencial' : (company?.name || 'Empresa Confidencial')}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                    <span className="bg-white text-primary-600 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                        {job.type}
                    </span>
                    {job.is_external && (
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                            Externa
                        </span>
                    )}
                </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                <div className="grid grid-cols-1 gap-6">
                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-3">Descripción del Puesto</h2>
                        <p className="text-slate-600 whitespace-pre-line leading-relaxed text-sm">
                            {job.description}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-3">Requisitos y Detalles</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex items-center text-slate-600 text-sm">
                                <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                                {job.location}
                            </div>
                            <div className="flex items-center text-slate-600 text-sm">
                                <DollarSign className="w-4 h-4 mr-2 text-slate-400" />
                                ${job.salary.toLocaleString('es-MX')} {job.currency} / Mes
                            </div>
                            <div className="flex items-center text-slate-600 text-sm">
                                <Briefcase className="w-4 h-4 mr-2 text-slate-400" />
                                {job.category}
                            </div>
                            <div className="flex items-center text-slate-600 text-sm">
                                <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                                Publicado: {new Date(job.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    </section>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-4">
                        <h3 className="font-bold text-slate-900 mb-3">¿Te interesa?</h3>
                        {job.is_external && (
                            <div className="mb-3 p-2 bg-blue-50 text-blue-700 rounded-lg text-xs border border-blue-100">
                                Esta es una vacante externa de <strong>{job.source || 'un sitio asociado'}</strong>.
                                Al postularte serás redirigido.
                            </div>
                        )}

                        {hasApplied ? (
                            <button disabled className="w-full bg-green-600 text-white py-2 rounded-lg font-medium cursor-default opacity-90 text-sm">
                                Ya te has postulado
                            </button>
                        ) : (
                            <button
                                onClick={onApply}
                                className="w-full bg-secondary-600 text-white py-2 rounded-lg font-medium hover:bg-secondary-700 transition-colors shadow-sm hover:shadow text-sm"
                            >
                                {job.is_external ? 'Postularme en Sitio Externo' : 'Postularme Ahora'}
                            </button>
                        )}
                        <p className="mt-2 text-xs text-slate-500 text-center">
                            Al postularte aceptas compartir tu perfil con la empresa.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetailView;
