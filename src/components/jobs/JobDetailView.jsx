import { MapPin, DollarSign, Briefcase, Calendar, Building, Share2, Flag, Tag } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatFriendlyDate } from '../../utils/dateUtils';

const JobDetailView = ({ job, company, onApply, hasApplied, isMobileDeck = false }) => {
    const navigate = useNavigate();
    const { user } = useAuth();

    if (!job) return <div className="p-8 text-center text-slate-500">Selecciona una vacante para ver los detalles.</div>;

    const handleShare = () => {
        const url = `${window.location.origin}/jobs?jobId=${job.id}`;
        navigator.clipboard.writeText(url);
        alert('Enlace copiado al portapapeles');
    };

    const handleReport = () => {
        window.location.href = `mailto:soporte@ayjale.com?subject=Reporte de Vacante ${job.id}&body=Hola, quiero reportar la vacante "${job.title}" por la siguiente razón:`;
    };

    // console.log('JobDetailView: Job Data:', job);
    // console.log('JobDetailView: Company Data:', company);

    const formatTitle = (title) => {
        if (!title) return '';
        return title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();
    };

    const formatSalary = (job) => {
        if (!job) return 'No mostrado';

        let salaryText = 'No mostrado';

        // Helper to format number
        const fmt = (n) => {
            const num = Number(n);
            return isNaN(num) ? n : num.toLocaleString('es-MX');
        };

        if (job.salary_min && job.salary_max) {
            salaryText = `${fmt(job.salary_min)} - ${fmt(job.salary_max)}`;
        } else if (job.salary_min) {
            salaryText = `Desde ${fmt(job.salary_min)}`;
        } else if (job.salary_max) {
            salaryText = `Hasta ${fmt(job.salary_max)}`;
        } else if (job.salary && job.salary !== 'N/A') {
            // Handle legacy salary (check if it's a valid number-like value)
            const num = Number(job.salary);
            if (!isNaN(num) && num > 0) {
                salaryText = `${fmt(num)}`;
            }
        }

        if (job.salary_period && typeof job.salary_period === 'string' && salaryText !== 'No mostrado') {
            const periodMap = {
                'monthly': 'mensuales',
                'yearly': 'anuales',
                'weekly': 'semanales',
                'hourly': 'por hora',
                'daily': 'diarios'
            };
            const translatedPeriod = periodMap[job.salary_period.toLowerCase()] || job.salary_period;
            salaryText += ` ${translatedPeriod}`;
        }

        return salaryText;
    };

    // Mobile Deck Layout
    if (isMobileDeck) {
        return (
            <div className="bg-white h-full flex flex-col relative overflow-hidden">
                {/* Banner Header */}
                <div className="relative p-6 pt-12 pb-8 flex-shrink-0">
                    {/* Background Logo Banner */}
                    <div className="absolute inset-0 overflow-hidden z-0">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-white z-10" />
                        {!job.is_confidential && company?.logo ? (
                            <img
                                src={company.logo}
                                alt=""
                                className="w-full h-full object-cover opacity-50 blur-sm scale-110"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 opacity-50" />
                        )}
                    </div>

                    {/* Content Overlay */}
                    <div className="relative z-20 flex flex-col items-center text-center">
                        {/* Company Logo (Floating) */}
                        <div className="mb-4 shadow-lg rounded-2xl bg-white p-2">
                            {!job.is_confidential && company?.logo ? (
                                <img
                                    src={company.logo}
                                    alt={company.name}
                                    className="w-16 h-16 object-contain rounded-xl"
                                />
                            ) : (
                                <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center">
                                    <Building className="w-8 h-8 text-slate-300" />
                                </div>
                            )}
                        </div>

                        <h1 className="text-2xl font-bold text-slate-900 mb-2 leading-tight">{formatTitle(job.title)}</h1>
                        <p className="text-slate-600 font-medium mb-4">
                            {job.is_confidential ? 'Empresa Confidencial' : (company?.name || 'Empresa Confidencial')}
                        </p>

                        <div className="flex flex-wrap justify-center gap-2 mb-6">
                            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                                <Briefcase className="w-3 h-3 mr-1.5" />
                                {job.type}
                            </span>
                            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                                <Tag className="w-3 h-3 mr-1.5" />
                                {job.category}
                            </span>
                            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                                <DollarSign className="w-3 h-3 mr-1.5" />
                                {formatSalary(job)}
                            </span>
                            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                                <MapPin className="w-3 h-3 mr-1.5" />
                                {job.location}
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 w-full">
                            {hasApplied ? (
                                <button disabled className="flex-1 bg-green-600 text-white px-6 py-3.5 rounded-xl font-bold text-sm cursor-default opacity-90 shadow-sm">
                                    Ya te has postulado
                                </button>
                            ) : (
                                <button
                                    onClick={onApply}
                                    className="flex-1 bg-secondary-600 text-white px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-secondary-700 transition-all shadow-md active:scale-95"
                                >
                                    Postularme ahora
                                </button>
                            )}

                            <button
                                onClick={handleShare}
                                className="p-3.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 transition-colors bg-white shadow-sm active:scale-95"
                                title="Compartir"
                            >
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-20">
                    <div className="prose prose-slate prose-sm max-w-none">
                        <h2 className="text-lg font-bold text-slate-900 mb-4 mt-2">Descripción completa del empleo</h2>
                        <div className="text-slate-600 whitespace-pre-line leading-relaxed">
                            {job.description}
                        </div>
                    </div>

                    <div className="pt-8 mt-8 border-t border-slate-100 flex justify-between items-center pb-8">
                        <button
                            onClick={handleReport}
                            className="flex items-center text-slate-400 text-xs hover:text-slate-600 transition-colors"
                        >
                            <Flag className="w-3 h-3 mr-1.5" />
                            Reportar empleo
                        </button>
                        <span className="text-xs text-slate-300 font-mono">ID: {String(job.id).slice(0, 8)}</span>
                    </div>
                </div>
            </div>
        );
    }

    // Standard Desktop Layout
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-100">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex flex-col items-center gap-3">
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
                        {job.is_external && (
                            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-xs font-bold border border-blue-100 uppercase tracking-wide">
                                Externa
                            </span>
                        )}
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl font-bold text-slate-900 mb-2 leading-tight">{formatTitle(job.title)}</h1>

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
                                <Tag className="w-3 h-3 mr-1.5" />
                                {job.category}
                            </span>
                            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md text-xs font-medium flex items-center">
                                <DollarSign className="w-3 h-3 mr-1.5" />
                                {formatSalary(job)}
                            </span>
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

                        <button
                            onClick={handleShare}
                            className="p-3 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 transition-colors"
                            title="Compartir"
                        >
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                <div className="space-y-8">
                    <section>
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Descripción completa del empleo</h2>
                        <div className="text-slate-600 whitespace-pre-line leading-relaxed text-sm">
                            {job.description}
                        </div>
                    </section>

                    <div className="pt-8 border-t border-slate-100 flex justify-between items-center">
                        <button
                            onClick={handleReport}
                            className="flex items-center text-slate-400 text-sm hover:text-slate-600 transition-colors bg-slate-50 px-4 py-2 rounded-lg"
                        >
                            <Flag className="w-4 h-4 mr-2" />
                            Reportar empleo
                        </button>
                        <span className="text-xs text-slate-300 font-mono">ID: {String(job.id).slice(0, 8)}...</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetailView;
