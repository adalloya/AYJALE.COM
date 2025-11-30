import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Users, Upload, Briefcase } from 'lucide-react';

const CompanyDashboard = () => {
    const { user, updateUser } = useAuth();
    const { jobs, deleteJob, applications, toggleJobStatus } = useData();
    const navigate = useNavigate();

    const myJobs = jobs.filter(job => job.company_id === user.id);

    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState(user.name);

    const handleSaveName = () => {
        if (tempName.trim()) {
            updateUser({ name: tempName });
            setIsEditingName(false);
        }
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                alert("La imagen es muy pesada. Por favor sube una imagen menor a 2MB.");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                console.log("Image converted to Base64, updating user profile...");
                updateUser({ logo: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-8">
            {/* Company Profile Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Perfil de Empresa</h2>
                <div className="flex items-center space-x-6">
                    <div className="relative group">
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
                    <div>
                        {isEditingName ? (
                            <div className="flex items-center space-x-2 mb-1">
                                <input
                                    type="text"
                                    value={tempName}
                                    onChange={(e) => setTempName(e.target.value)}
                                    className="border border-slate-300 rounded px-2 py-1 text-lg font-semibold text-slate-900 focus:ring-2 focus:ring-secondary-500 outline-none"
                                />
                                <button onClick={handleSaveName} className="text-green-600 hover:text-green-700 font-medium text-sm">Guardar</button>
                                <button onClick={() => { setIsEditingName(false); setTempName(user.name); }} className="text-slate-400 hover:text-slate-600 text-sm">Cancelar</button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <h3 className="text-lg font-semibold text-slate-900">{user.name}</h3>
                                <button onClick={() => setIsEditingName(true)} className="text-slate-400 hover:text-secondary-600">
                                    <Edit className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        <p className="text-slate-500">{user.email}</p>
                        <div className="mt-2">
                            <label className="cursor-pointer bg-white border border-slate-300 text-slate-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-slate-50 inline-flex items-center">
                                <Upload className="w-4 h-4 mr-2" />
                                Cambiar Logo
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                />
                            </label>
                            <p className="text-xs text-slate-400 mt-1">Máximo 2MB.</p>
                        </div>
                    </div>
                </div>
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
                                    <dt className="text-sm font-medium text-slate-500 truncate">Vacantes Activas</dt>
                                    <dd>
                                        <div className="text-lg font-medium text-slate-900">{jobs.filter(j => j.active).length}</div>
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
                                    <dt className="text-sm font-medium text-slate-500 truncate">Total Postulados</dt>
                                    <dd>
                                        <div className="text-lg font-medium text-slate-900">{applications.length}</div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Mis Vacantes</h1>
                <Link to="/post-job" className="bg-secondary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-secondary-700 flex items-center">
                    <Plus className="w-4 h-4 mr-2" /> Nueva Vacante
                </Link>
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
                                        onClick={() => toggleJobStatus(job.id, job.active)}
                                        className={`p-2 rounded-full hover:bg-slate-100 ${job.active ? 'text-green-600' : 'text-slate-400'}`}
                                        title={job.active ? "Desactivar vacante" : "Activar vacante"}
                                    >
                                        <div className={`w-3 h-3 rounded-full ${job.active ? 'bg-green-500' : 'bg-slate-300'}`}></div>
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
