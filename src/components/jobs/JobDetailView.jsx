import { useState } from 'react';
import { MapPin, DollarSign, Briefcase, Calendar, Building, Share2, Flag, Tag, GraduationCap } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatFriendlyDate } from '../../utils/dateUtils';
import { getJobCompany, formatSalaryDisplay, getEducationLevel, getExperienceLevel } from '../../utils/jobUtils';
import { FormattedDescription } from '../../utils/textFormatter';
import ReportJobModal from './ReportJobModal';

const JobDetailView = ({ job, company, onApply, hasApplied, isMobileDeck = false }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { reportJob } = useData();

    const [showReportModal, setShowReportModal] = useState(false);
    const [submittingReport, setSubmittingReport] = useState(false);

    if (!job) return <div className="p-8 text-center text-slate-500">Selecciona una vacante para ver los detalles.</div>;

    const companyInfo = getJobCompany(job);

    const handleShare = () => {
        const url = `${window.location.origin}/jobs?jobId=${job.id}`;
        navigator.clipboard.writeText(url);
        alert('Enlace copiado al portapapeles');
    };

    const handleReport = () => {
        setShowReportModal(true);
    };

    const handleReportSubmit = async (reportData) => {
        setSubmittingReport(true);
        try {
            await reportJob(job.id, reportData);
        } catch (err) {
            console.error('Error submitting job report:', err);
        } finally {
            setSubmittingReport(false);
        }
    };

    // console.log('JobDetailView: Job Data:', job);
    // console.log('JobDetailView: Company Data:', company);

    const formatTitle = (title) => {
        if (!title) return '';
        return title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();
    };

    const formatSalary = (job) => {
        if (!job) return 'No mostrado';

        // If company chose to hide salary, show placeholder
        if (job.hide_salary) return 'Salario no publicado';

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

    // Mobile Deck Layout (Single Unified Scrollable Container)
    if (isMobileDeck) {
        return (
            <div className="bg-white h-full flex flex-col relative overflow-y-auto custom-scrollbar touch-pan-y p-6 pb-24 space-y-6">
                {/* Banner Header */}
                <div className="relative flex-shrink-0 text-center flex flex-col items-center">
                    {!job.is_confidential && companyInfo.logo && (
                        <div className="mb-4 shadow-md rounded-2xl bg-white p-2 border border-slate-100">
                            <img
                                src={companyInfo.logo}
                                alt={companyInfo.name}
                                className="w-16 h-16 object-contain rounded-xl"
                            />
                        </div>
                    )}

                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 mb-1 leading-tight">{formatTitle(job.title)}</h1>
                    <p className="text-slate-600 font-semibold text-sm mb-3">
                        {companyInfo.name}
                    </p>

                    {/* Salary Highlight (Pure Green Text, No Background/Border) */}
                    <div className="mb-4 text-center">
                        {(() => {
                            const sal = formatSalaryDisplay(job);
                            return sal.formatted !== 'Salario no publicado' ? (
                                <div className="inline-flex flex-col items-center">
                                    <div className="text-emerald-600 font-black text-2xl tracking-tight leading-none flex items-baseline justify-center gap-0.5">
                                        <span>{sal.formatted}</span>
                                        {sal.period && <span className="text-emerald-600 font-bold text-sm ml-0.5">{sal.period}</span>}
                                    </div>
                                </div>
                            ) : (
                                <span className="text-slate-400 font-bold text-xs">
                                    Salario no publicado
                                </span>
                            );
                        })()}
                    </div>

                    <div className="flex flex-wrap justify-center gap-2 mb-6 text-xs">
                        <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-medium flex items-center">
                            <MapPin className="w-3 h-3 mr-1.5 text-slate-400" />
                            {job.location}
                        </span>
                        <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-medium flex items-center">
                            <Tag className="w-3 h-3 mr-1.5 text-slate-400" />
                            {job.category}
                        </span>
                        {(() => {
                            const edu = getEducationLevel(job);
                            return edu ? (
                                <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-medium flex items-center">
                                    <GraduationCap className="w-3 h-3 mr-1.5 text-slate-400" />
                                    {edu}
                                </span>
                            ) : null;
                        })()}
                        {(() => {
                            const exp = getExperienceLevel(job);
                            return exp ? (
                                <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-medium flex items-center">
                                    <Briefcase className="w-3 h-3 mr-1.5 text-slate-400" />
                                    {exp}
                                </span>
                            ) : null;
                        })()}
                    </div>

                    {/* Actions (Share on Left, Apply on Right on SAME line) */}
                    <div className="flex items-center gap-3 w-full">
                        <button
                            onClick={handleShare}
                            className="p-3.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 transition-colors bg-white shadow-xs active:scale-95 flex-shrink-0"
                            title="Compartir"
                        >
                            <Share2 className="w-5 h-5" />
                        </button>

                        {hasApplied ? (
                            <button disabled className="flex-1 bg-green-600 text-white px-6 py-3.5 rounded-xl font-bold text-sm cursor-default shadow-sm">
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
                    </div>
                </div>

                {/* Content & Section Grid Cards */}
                <div className="space-y-6">
                    <h2 className="text-base sm:text-lg font-black text-orange-600">Descripción del empleo</h2>
                    <FormattedDescription text={job.description} isMobileDeck={true} />

                    <div className="pt-6 border-t border-slate-100 flex justify-between items-center pb-4">
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
                    {/* Logo - Only render if logo exists */}
                    {!job.is_confidential && companyInfo.logo && (
                        <div className="flex-shrink-0 flex flex-col items-center gap-3">
                            <img
                                src={companyInfo.logo}
                                alt={companyInfo.name}
                                className="w-20 h-20 object-contain bg-white rounded-xl border border-slate-100 p-2"
                            />
                            {job.is_external && (
                                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-xs font-bold border border-blue-100 uppercase tracking-wide">
                                    Externa
                                </span>
                            )}
                        </div>
                    )}

                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl font-bold text-slate-900 mb-2 leading-tight">{formatTitle(job.title)}</h1>

                        <div className="flex flex-wrap items-center text-sm text-slate-600 mb-3 gap-y-2">
                            <span className="font-bold text-slate-900 mr-2">
                                {companyInfo.name}
                            </span>
                            <span className="hidden sm:inline mx-2 text-slate-300">•</span>
                            <span className="flex items-center whitespace-nowrap">
                                <MapPin className="w-4 h-4 mr-1 text-slate-400" />
                                {job.location}
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md text-xs font-medium flex items-center border border-slate-200/60">
                                <MapPin className="w-3 h-3 mr-1.5 text-slate-500" />
                                {job.location}
                            </span>
                            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md text-xs font-medium flex items-center border border-slate-200/60">
                                <Tag className="w-3 h-3 mr-1.5 text-slate-500" />
                                {job.category}
                            </span>
                            {(() => {
                                const edu = getEducationLevel(job);
                                return edu ? (
                                    <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md text-xs font-medium flex items-center border border-slate-200/60">
                                        <GraduationCap className="w-3 h-3 mr-1.5 text-slate-500" />
                                        {edu}
                                    </span>
                                ) : null;
                            })()}
                            {(() => {
                                const exp = getExperienceLevel(job);
                                return exp ? (
                                    <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md text-xs font-medium flex items-center border border-slate-200/60">
                                        <Briefcase className="w-3 h-3 mr-1.5 text-slate-500" />
                                        {exp}
                                    </span>
                                ) : null;
                            })()}
                        </div>
                    </div>

                    {/* Salary & Actions Box */}
                    <div className="flex flex-col items-end gap-3 w-full md:w-auto mt-4 md:mt-0 flex-shrink-0">
                        {(() => {
                            const sal = formatSalaryDisplay(job);
                            return sal.formatted !== 'Salario no publicado' ? (
                                <div className="text-right w-full md:w-auto">
                                    <div className="text-emerald-600 font-black text-2xl tracking-tight leading-none flex items-baseline justify-end gap-0.5">
                                        <span>{sal.formatted}</span>
                                        {sal.period && <span className="text-emerald-600 font-bold text-sm ml-0.5">{sal.period}</span>}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-right text-slate-400 font-bold text-xs">
                                    Salario no publicado
                                </div>
                            );
                        })()}
                        {/* Actions (Share on Left, Apply on Right on SAME line) */}
                        <div className="flex items-center gap-2.5 w-full md:w-auto">
                            <button
                                onClick={handleShare}
                                className="p-3 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 transition-colors bg-white flex-shrink-0"
                                title="Compartir"
                            >
                                <Share2 className="w-5 h-5" />
                            </button>

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
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                <div className="space-y-8">
                    <section>
                        <h2 className="text-lg font-black text-orange-600 mb-4">Descripción del empleo</h2>
                        <FormattedDescription text={job.description} isMobileDeck={false} />
                    </section>

                    <div className="pt-8 border-t border-slate-100 flex justify-between items-center">
                        <button
                            onClick={handleReport}
                            className="flex items-center text-slate-500 font-bold text-xs hover:text-red-600 transition-colors bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-xl border border-red-100 cursor-pointer active:scale-95"
                        >
                            <Flag className="w-4 h-4 mr-2 text-red-600" />
                            Reportar vacante
                        </button>
                        <span className="text-xs text-slate-300 font-mono">ID: {String(job.id).slice(0, 8)}...</span>
                    </div>
                </div>
            </div>

            <ReportJobModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                onSubmit={handleReportSubmit}
                jobTitle={job.title}
                loading={submittingReport}
            />
        </div>
    );
};

export default JobDetailView;
