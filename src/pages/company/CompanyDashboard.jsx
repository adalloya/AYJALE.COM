import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    Plus, Edit, Trash2, Users, Upload, Briefcase, Share2, Facebook, MessageCircle,
    Eye, EyeOff, XCircle, Copy, RefreshCw, FileText, MapPin, Phone
} from 'lucide-react';
import EditCompanyProfileModal from '../../components/company/EditCompanyProfileModal';
import Toast from '../../components/Toast';

const CompanyDashboard = () => {
    const { user, updateUser } = useAuth();
    const { jobs, deleteJob, applications, toggleJobStatus, closeJob, republishJob } = useData();
    const navigate = useNavigate();
    const location = useLocation();

    const myJobs = jobs.filter(job => job.company_id === user.id);

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (location.state?.message) {
            setToast({ message: location.state.message, type: 'success' });
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const handleSaveProfile = async (updatedData) => {
        try {
            await updateUser(updatedData);
            setIsEditingProfile(false);
            setToast({ message: 'Perfil actualizado correctamente', type: 'success' });
        } catch (error) {
            console.error("Error updating profile:", error);
            setToast({ message: 'Error al actualizar perfil', type: 'error' });
        }
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
                updateUser({ logo: reader.result });
                setToast({ message: 'Logo actualizado correctamente', type: 'success' });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-8">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* COMPANY PROFILE BANNER */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 relative">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-slate-900">Perfil de Empresa</h2>
                    <button
                        onClick={() => navigate('/company/profile')}
                        className="text-secondary-600 hover:text-secondary-700 text-sm font-medium flex items-center bg-secondary-50 px-3.5 py-1.5 rounded-xl border border-secondary-200/80 transition-colors cursor-pointer"
                    >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar Información
                    </button>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="relative group flex-shrink-0">
                        <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50">
                            {user.logo ? (
                                <img src={user.logo} alt="Logo" className="w-full h-full object-contain p-1" />
                            ) : (
                                <div className="text-center p-2">
                                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                                    <span className="text-xs text-slate-500">Subir Logo</span>
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            title="Cambiar logo"
                        />
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 leading-tight">{user.name}</h3>
                            <p className="text-slate-500 text-sm">{user.email}</p>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                            {user.rfc && (
                                <div className="flex items-center">
                                    <FileText className="w-4 h-4 mr-1.5 text-slate-400" />
                                    <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs">{user.rfc}</span>
                                </div>
                            )}
                            {user.phone_number && (
                                <div className="flex items-center">
                                    <Phone className="w-4 h-4 mr-1.5 text-slate-400" />
                                    {user.phone_number}
                                </div>
                            )}
                            {user.location && (
                                <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-1.5 text-slate-400" />
                                    {user.location}
                                </div>
                            )}
                        </div>

                        {user.address && (
                            <p className="text-xs text-slate-400 mt-1 max-w-xl truncate">
                                {user.address}
                            </p>
                        )}
                    </div>
                </div>

                {isEditingProfile && (
                    <EditCompanyProfileModal
                        user={user}
                        onClose={() => setIsEditingProfile(false)}
                        onSave={handleSaveProfile}
                    />
                )}
            </div>

            {/* EXECUTIVE METRICS OVERVIEW */}
            <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Vacantes Activas
                    </span>
                    <span className="text-3xl font-extrabold text-slate-900">
                        {myJobs.filter(j => j.active).length}
                    </span>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Total Postulados
                    </span>
                    <span className="text-3xl font-extrabold text-slate-900">
                        {applications.filter(a => myJobs.some(j => j.id === a.job_id)).length}
                    </span>
                </div>
            </div>

            {/* ACTION HEADER & JOB LISTING */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Mis Vacantes</h1>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Link to="/post-job" className="bg-secondary-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-secondary-700 flex items-center justify-center shadow-2xs">
                        <Plus className="w-4 h-4 mr-2" /> Nueva Vacante
                    </Link>
                    {(user.can_search_candidates || user.canSearchCandidates) && (
                        <Link to="/company/candidates" className="bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 flex items-center justify-center shadow-2xs">
                            <Users className="w-4 h-4 mr-2" /> Buscar Candidatos
                        </Link>
                    )}
                </div>
            </div>

            {/* VACANCY CARDS LIST */}
            <div className="grid gap-6">
                {myJobs.map(job => {
                    const jobApps = applications.filter(a => a.job_id === job.id);
                    const totalPostulados = jobApps.length;
                    const nuevosCount = jobApps.filter(a => a.status === 'applied' || !a.status).length;
                    const revisionCount = jobApps.filter(a => a.status === 'reviewing').length;
                    const entrevistaCount = jobApps.filter(a => a.status === 'interviewing').length;
                    const ofertaCount = jobApps.filter(a => a.status === 'offer').length;
                    const contratadoCount = jobApps.filter(a => a.status === 'hired').length;
                    const descartadoCount = jobApps.filter(a => a.status === 'rejected').length;

                    return (
                        <div key={job.id} className={`bg-white p-6 rounded-2xl shadow-xs border ${!job.active ? 'border-slate-200 bg-slate-50/70' : 'border-slate-200'}`}>
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-extrabold text-slate-900">{job.title}</h3>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${job.active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                            {job.active ? 'Activa' : 'Pausada'}
                                        </span>
                                        {job.is_confidential && (
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                Confidencial
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-2">
                                        <span className="flex items-center gap-1 font-bold text-slate-700">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                            {job.location || 'Ubicación no especificada'}
                                        </span>
                                        <span className="text-slate-300">•</span>
                                        <span>Modalidad: <strong className="text-slate-700 font-semibold">{job.type || 'Presencial'}</strong></span>
                                        <span className="text-slate-300">•</span>
                                        <span>Publicado: {new Date(job.created_at).toLocaleDateString()} • Expira: {new Date(job.expires_at).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-1.5 self-end sm:self-auto">
                                    <button
                                        onClick={() => {
                                            const url = `${window.location.origin}/jobs/${job.id}`;
                                            const text = `¡Hola! Estamos buscando ${job.title} en ${user.name}. Postúlate aquí: ${url}`;
                                            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                        }}
                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                                        title="Compartir en WhatsApp"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={() => {
                                            const url = `${window.location.origin}/jobs/${job.id}`;
                                            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                                        }}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                        title="Compartir en Facebook"
                                    >
                                        <Facebook className="w-4 h-4" />
                                    </button>

                                    <div className="w-px h-5 bg-slate-200 mx-1 self-center"></div>

                                    <button
                                        onClick={() => toggleJobStatus(job.id, job.active)}
                                        className={`p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer ${job.active ? 'text-slate-600' : 'text-slate-400'}`}
                                        title={job.active ? "Ocultar vacante (Pausar)" : "Mostrar vacante (Activar)"}
                                    >
                                        {job.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>

                                    {new Date(job.expires_at) > new Date() ? (
                                        <button
                                            onClick={() => {
                                                if (window.confirm('¿Estás seguro de que quieres CERRAR esta vacante? Esto la marcará como expirada y dejará de recibir postulaciones.')) {
                                                    closeJob(job.id);
                                                }
                                            }}
                                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                                            title="Cerrar vacante (Finalizar)"
                                        >
                                            <XCircle className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                if (window.confirm('¿Quieres REACTIVAR esta vacante? Se publicará nuevamente por 30 días.')) {
                                                    republishJob(job.id);
                                                }
                                            }}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                                            title="Reactivar vacante"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </button>
                                    )}

                                    <button
                                        onClick={() => navigate(`/post-job?duplicate=${job.id}`)}
                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                        title="Duplicar vacante"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={() => navigate(`/post-job?id=${job.id}`)}
                                        className="p-2 text-slate-400 hover:text-secondary-600 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                                        title="Editar vacante"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>

                                    <button onClick={() => deleteJob(job.id)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* FOOTER EN LA PARTE INFERIOR DE LA TARJETA DE VACANTE */}
                            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold">
                                    {/* 1. SIEMPRE PRIMERO: CANDIDATOS NUEVOS */}
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 shadow-2xs font-extrabold">
                                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                                        Nuevos: {nuevosCount}
                                    </span>

                                    {/* 2. TOTAL POSTULADOS */}
                                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                                        Total Postulados: {totalPostulados}
                                    </span>
                                </div>

                                <Link
                                    to={`/job/${job.id}/applicants`}
                                    className="inline-flex items-center justify-center gap-1 bg-secondary-50 hover:bg-secondary-100 text-secondary-700 border border-secondary-200/80 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs shrink-0 cursor-pointer"
                                >
                                    Ver postulados →
                                </Link>
                            </div>
                        </div>
                    );
                })}

                {myJobs.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-6">
                        <p className="text-slate-500 font-medium">No tienes vacantes registradas aún.</p>
                        <Link to="/post-job" className="mt-3 inline-block bg-secondary-600 text-white px-4 py-2 rounded-xl text-xs font-bold">
                            Publicar tu primera vacante
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompanyDashboard;
