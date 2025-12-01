import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Users, Upload, Briefcase, Share2, Facebook, MessageCircle, Eye, EyeOff, XCircle, Copy, RefreshCw, FileText, MapPin, Phone } from 'lucide-react';
import EditCompanyProfileModal from '../../components/company/EditCompanyProfileModal';
import Toast from '../../components/Toast';

const CompanyDashboard = () => {
    const { user, updateUser } = useAuth();
    const { jobs, deleteJob, applications, toggleJobStatus, closeJob, republishJob } = useData();
    const navigate = useNavigate();

    const myJobs = jobs.filter(job => job.company_id === user.id);

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [toast, setToast] = useState(null);

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
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                setToast({ message: "La imagen es muy pesada. Por favor sube una imagen menor a 2MB.", type: 'error' });
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                console.log("Image converted to Base64, updating user profile...");
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
            {/* Company Profile Section */}
            {/* Company Profile Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 relative">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-slate-900">Perfil de Empresa</h2>
                    <button
                        onClick={() => setIsEditingProfile(true)}
                        className="text-secondary-600 hover:text-secondary-700 text-sm font-medium flex items-center bg-secondary-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar Información
                    </button>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="relative group flex-shrink-0">
                        <div className="w-24 h-24 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50">
                            {user.logo ? (
                                <img src={user.logo} alt="Logo" className="w-full h-full object-contain" />
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

            <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Briefcase className="h-6 w-6 text-slate-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-slate-500">Vacantes Activas</dt>
                                    <dd>
                                        <div className="text-lg font-medium text-slate-900">{myJobs.filter(j => j.active).length}</div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Eye className="h-6 w-6 text-slate-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-slate-500">Total Vacantes Vistas</dt>
                                    <dd>
                                        <div className="text-lg font-medium text-slate-900">
                                            {myJobs.reduce((acc, job) => acc + (job.views || 0), 0)}
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Users className="h-6 w-6 text-slate-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-slate-500">Total Postulados</dt>
                                    <dd>
                                        <div className="text-lg font-medium text-slate-900">{applications.length}</div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Mis Vacantes</h1>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Link to="/post-job" className="bg-secondary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-secondary-700 flex items-center justify-center">
                        <Plus className="w-4 h-4 mr-2" /> Nueva Vacante
                    </Link>
                    <Link to="/company/candidates" className="bg-white text-slate-600 border border-slate-200 px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-50 flex items-center justify-center">
                        <Users className="w-4 h-4 mr-2" /> Buscar Candidatos
                    </Link>
                </div>
            </div>

            <div className="grid gap-6">
                {myJobs.map(job => {
                    const applicantCount = applications.filter(a => a.job_id === job.id).length;
                    return (
                        <div key={job.id} className={`bg-white p-6 rounded-lg shadow-sm border ${!job.active ? 'border-slate-200 bg-slate-50' : 'border-slate-200'}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-medium text-slate-900">
                                        {job.title.charAt(0).toUpperCase() + job.title.slice(1).toLowerCase()}
                                    </h3>
                                    <div className="mt-1 flex items-center text-sm text-slate-500">
                                        <span className="truncate">{job.location}</span>
                                        <span className="mx-2">•</span>
                                        <span>{job.type}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${!job.active
                                            ? 'bg-slate-100 text-slate-800'
                                            : new Date(job.expires_at) < new Date()
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-green-100 text-green-800'
                                            }`}>
                                            {!job.active
                                                ? 'Inactiva'
                                                : new Date(job.expires_at) < new Date()
                                                    ? 'Expirada'
                                                    : 'Activa'}
                                        </span>
                                        {job.is_confidential && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                                Confidencial
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-500 mt-2">
                                        Publicado: {new Date(job.created_at).toLocaleDateString()} • Expira: {new Date(job.expires_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => {
                                            const url = `${window.location.origin}/jobs/${job.id}`;
                                            const text = `¡Hola! Estamos buscando ${job.title} en ${user.name}. Postúlate aquí: ${url}`;
                                            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                        }}
                                        className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                                        title="Compartir en WhatsApp"
                                    >
                                        <MessageCircle className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            const url = `${window.location.origin}/jobs/${job.id}`;
                                            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                                        }}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                                        title="Compartir en Facebook"
                                    >
                                        <Facebook className="w-5 h-5" />
                                    </button>
                                    <div className="w-px h-6 bg-slate-200 mx-1 self-center"></div>
                                    <button
                                        onClick={() => toggleJobStatus(job.id, job.active)}
                                        className={`p-2 rounded-full hover:bg-slate-100 ${job.active ? 'text-slate-600' : 'text-slate-400'}`}
                                        title={job.active ? "Ocultar vacante (Pausar)" : "Mostrar vacante (Activar)"}
                                    >
                                        {job.active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                    </button>

                                    {/* Close / Reactivate Logic */}
                                    {new Date(job.expires_at) > new Date() ? (
                                        <button
                                            onClick={() => {
                                                if (window.confirm('¿Estás seguro de que quieres CERRAR esta vacante? Esto la marcará como expirada y dejará de recibir postulaciones.')) {
                                                    closeJob(job.id);
                                                }
                                            }}
                                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-full"
                                            title="Cerrar vacante (Finalizar)"
                                        >
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                if (window.confirm('¿Quieres REACTIVAR esta vacante? Se publicará nuevamente por 30 días.')) {
                                                    republishJob(job.id);
                                                }
                                            }}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                                            title="Reactivar vacante"
                                        >
                                            <RefreshCw className="w-5 h-5" />
                                        </button>
                                    )}

                                    <button
                                        onClick={() => navigate(`/post-job?duplicate=${job.id}`)}
                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-full"
                                        title="Duplicar vacante"
                                    >
                                        <Copy className="w-5 h-5" />
                                    </button>

                                    <button
                                        onClick={() => navigate(`/post-job?id=${job.id}`)}
                                        className="p-2 text-slate-400 hover:text-primary-600 rounded-full hover:bg-slate-50"
                                        title="Editar vacante"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => deleteJob(job.id)} className="p-2 text-slate-400 hover:text-red-600 rounded-full hover:bg-slate-50">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center text-sm text-slate-600">
                                    <Users className="w-4 h-4 mr-2" />
                                    {applicantCount} Candidatos
                                </div>
                                <Link to={`/job/${job.id}/applicants`} className="text-primary-600 text-sm font-medium hover:underline">
                                    Ver Candidatos
                                </Link>
                            </div>
                        </div>
                    );
                })}
                {myJobs.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg border border-dashed border-slate-300">
                        <p className="text-slate-500">No tienes vacantes activas.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompanyDashboard;
