import { MapPin, DollarSign, Briefcase, Calendar, Building, Share2, Flag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

const JobDetailView = ({ job, company, onApply, hasApplied }) => {
    const navigate = useNavigate();
    const { user } = useAuth();

    if (!job) return <div className="p-8 text-center text-slate-500">Selecciona una vacante para ver los detalles.</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-100">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        {!job.is_confidential && company?.logo ? (
                            <img
                                src={company.logo}
                                alt={company.name}
                                className="w-20 h-20 object-contain bg-white rounded-xl border border-slate-100 p-2"
                            />
                        ) : (
                            <div className="w-20 h-20 bg-orange-50 rounded-xl border border-orange-100 flex items-center justify-center">
                                <Building className="w-10 h-10 text-orange-400" />
                            </div>
                        )}
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl font-bold text-slate-900 mb-2 leading-tight">{job.title}</h1>

                        <div className="flex flex-wrap items-center text-sm text-slate-600 mb-4 gap-y-2">
                            <span className="font-semibold text-slate-900 mr-2">
                                {job.is_confidential ? 'Empresa Confidencial' : (company?.name || 'Empresa Confidencial')}
                            </span>
                            <span className="hidden sm:inline mx-2 text-slate-300">•</span>
                            <span className="flex items-center whitespace-nowrap">
                                <MapPin className="w-4 h-4 mr-1 text-slate-400" />
                                {job.location}
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md text-xs font-medium flex items-center">
                                <Briefcase className="w-3 h-3 mr-1.5" />
                                {job.type}
                            </span>
                            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md text-xs font-medium flex items-center">
                                <DollarSign className="w-3 h-3 mr-1.5" />
                                ${job.salary.toLocaleString('es-MX')} {job.currency}
                            </span>
                            {job.is_external && (
                                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-xs font-medium border border-blue-100">
                                    Externa
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                        {hasApplied ? (
                            <button disabled className="flex-1 md:flex-none bg-green-600 text-white px-6 py-3 rounded-xl font-bold text-sm cursor-default opacity-90 shadow-sm whitespace-nowrap">
                                Ya te has postulado
                            </button>
                        ) : (
                            <button
                                onClick={onApply}
                                className="flex-1 md:flex-none bg-secondary-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-secondary-700 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                            >
                                Postularme ahora
                            </button>
                        )}

                        <button className="p-3 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 transition-colors" title="Compartir">
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                <div className="space-y-8">
                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Información del empleo</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900 mb-1 flex items-center">
                                    <Briefcase className="w-4 h-4 mr-2 text-slate-500" />
                                    Tipo de empleo
                                </h3>
                                <p className="text-sm text-slate-600 pl-6 bg-slate-50 inline-block px-3 py-1 rounded-full">
                                    {job.type}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900 mb-1 flex items-center">
                                    <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                                    Publicado
                                </h3>
                                <p className="text-sm text-slate-600 pl-6">
                                    {new Date(job.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Ubicación</h2>
                        <div className="flex items-start text-slate-600 text-sm">
                            <MapPin className="w-5 h-5 mr-2 text-slate-400 mt-0.5" />
                            {job.location}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Descripción completa del empleo</h2>
                        <div className="text-slate-600 whitespace-pre-line leading-relaxed text-sm">
                            {job.description}
                        </div>
                    </section>

                    <div className="pt-8 border-t border-slate-100">
                        <button className="flex items-center text-slate-400 text-sm hover:text-slate-600 transition-colors bg-slate-50 px-4 py-2 rounded-lg">
                            <Flag className="w-4 h-4 mr-2" />
                            Reportar empleo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetailView;
