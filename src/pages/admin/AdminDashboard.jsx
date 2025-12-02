import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Users, Building2, Briefcase, Search, RefreshCw, Power, Lock, Eye } from 'lucide-react';

const AdminDashboard = () => {
    const { jobs, adminGetUsers, adminRepublishJob, toggleJobStatus, adminGetApplications, updateUserProfile, adminGetContactUnlocks } = useData();
    const { resetPassword } = useAuth();
    const [activeTab, setActiveTab] = useState('candidates');
    const [allUsers, setAllUsers] = useState([]);
    const [allApplications, setAllApplications] = useState([]);
    const [allUnlocks, setAllUnlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const [usersData, appsData, unlocksData] = await Promise.all([
                    adminGetUsers(),
                    adminGetApplications(),
                    adminGetContactUnlocks()
                ]);
                setAllUsers(usersData || []);
                setAllApplications(appsData || []);
                setAllUnlocks(unlocksData || []);
            } catch (error) {
                console.error("Failed to load admin data", error);
                setLoading(false);
                // We can add a visible error state here if needed
                alert("Error cargando datos: " + error.message);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [adminGetUsers, adminGetApplications, adminGetContactUnlocks]);

    const candidates = allUsers.filter(u => u.role === 'candidate');
    const companies = allUsers.filter(u => u.role === 'company');

    const handleResetPassword = async (email) => {
        if (window.confirm(`¿Enviar correo de restablecimiento de contraseña a ${email}?`)) {
            try {
                await resetPassword(email);
                alert('Correo enviado exitosamente.');
            } catch (error) {
                alert('Error al enviar correo: ' + error.message);
            }
        }
    };

    const handleMigrateRole = async (userId, email) => {
        if (window.confirm(`¿Estás seguro de que deseas cambiar el rol de ${email} de Candidato a Empresa? Esto es irreversible.`)) {
            try {
                await updateUserProfile(userId, { role: 'company' });
                alert('Rol actualizado correctamente.');

                // Update local state immediately to reflect change without waiting for re-fetch
                setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, role: 'company' } : u));

                // Optional: Re-fetch to be sure, but local update handles the UI
                // const usersData = await adminGetUsers();
                // setAllUsers(usersData || []);
            } catch (error) {
                console.error("Error migrating role:", error);
                alert('Error al migrar rol: ' + error.message);
            }
        }
    };

    const handleRepublish = async (jobId) => {
        if (window.confirm('¿Republicar vacante? Esto reiniciará su vigencia de 30 días.')) {
            await adminRepublishJob(jobId);
        }
    };

    const handleToggleStatus = async (jobId, currentStatus) => {
        await toggleJobStatus(jobId, currentStatus);
    };

    const filteredCandidates = candidates.filter(c =>
        (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredCompanies = companies.filter(c =>
        (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredJobs = jobs.filter(j =>
        (j.title || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredApplications = allApplications.filter(a =>
        (a.profiles?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.jobs?.title || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredUnlocks = allUnlocks.filter(u =>
        (u.company?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.candidate?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? '-' : date.toLocaleDateString();
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Panel de Administración</h1>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                        <Users className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Candidatos</p>
                        <p className="text-2xl font-bold text-slate-900">{candidates.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center">
                    <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                        <Building2 className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Empresas</p>
                        <p className="text-2xl font-bold text-slate-900">{companies.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center">
                    <div className="p-3 rounded-full bg-orange-100 text-orange-600 mr-4">
                        <Briefcase className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Vacantes</p>
                        <p className="text-2xl font-bold text-slate-900">{jobs.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center">
                    <div className="p-3 rounded-full bg-teal-100 text-teal-600 mr-4">
                        <Eye className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Vistas Totales</p>
                        <p className="text-2xl font-bold text-slate-900">
                            {jobs.reduce((acc, job) => acc + (job.view_count || 0), 0)}
                        </p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center">
                    <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                        <Eye className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Postulaciones</p>
                        <p className="text-2xl font-bold text-slate-900">{allApplications.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center">
                    <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
                        <Lock className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Candidatos Desbloqueados</p>
                        <p className="text-2xl font-bold text-slate-900">{allUnlocks.length}</p>
                    </div>
                </div>
            </div>

            {/* Tabs & Search */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-200 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex space-x-4 overflow-x-auto pb-2 sm:pb-0">
                        <button
                            onClick={() => setActiveTab('candidates')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'candidates' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            Candidatos
                        </button>
                        <button
                            onClick={() => setActiveTab('companies')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'companies' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            Empresas
                        </button>
                        <button
                            onClick={() => setActiveTab('jobs')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'jobs' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            Vacantes
                        </button>
                        <button
                            onClick={() => setActiveTab('applications')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'applications' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            Postulaciones
                        </button>
                        <button
                            onClick={() => setActiveTab('unlocks')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'unlocks' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            Desbloqueos
                        </button>
                    </div>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                {activeTab === 'candidates' && (
                                    <>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nombre</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Registro</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
                                    </>
                                )}
                                {activeTab === 'companies' && (
                                    <>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Empresa</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">RFC</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contacto</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Industria/Ubicación</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
                                    </>
                                )}
                                {activeTab === 'jobs' && (
                                    <>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Título</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Empresa</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Publicada</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
                                    </>
                                )}
                                {activeTab === 'applications' && (
                                    <>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Candidato</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Vacante</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Empresa</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fecha</th>
                                    </>
                                )}
                                {activeTab === 'unlocks' && (
                                    <>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Empresa</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Candidato Desbloqueado</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fecha</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {activeTab === 'candidates' && filteredCandidates.map(user => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatDate(user.created_at || user.terms_accepted_at)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-3">
                                            <button
                                                onClick={() => handleMigrateRole(user.id, user.email)}
                                                className="text-purple-600 hover:text-purple-900 flex items-center"
                                                title="Migrar a Empresa"
                                            >
                                                <Building2 className="w-4 h-4 mr-1" /> Migrar
                                            </button>
                                            <button
                                                onClick={() => handleResetPassword(user.email)}
                                                className="text-blue-600 hover:text-blue-900 flex items-center"
                                                title="Reset Password"
                                            >
                                                <Lock className="w-4 h-4 mr-1" /> Reset
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {activeTab === 'companies' && filteredCompanies.map(user => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 mr-4">
                                                {user.logo ? (
                                                    <img className="h-10 w-10 rounded-full object-cover border border-slate-200" src={user.logo} alt="" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                        <Building2 className="w-5 h-5" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-900">{user.name}</div>
                                                <div className="text-sm text-slate-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.rfc || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-900">{user.recruiter_name || '-'}</div>
                                        <div className="text-sm text-slate-500">{user.phone_number || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-900">{user.industry || '-'}</div>
                                        <div className="text-sm text-slate-500">{user.location || '-'}</div>
                                        <div className="text-xs text-slate-400">{user.address || ''}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleResetPassword(user.email)}
                                            className="text-blue-600 hover:text-blue-900 flex items-center justify-end ml-auto"
                                        >
                                            <Lock className="w-4 h-4 mr-1" /> Reset Password
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {activeTab === 'jobs' && filteredJobs.map(job => (
                                <tr key={job.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{job.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {allUsers.find(u => u.id === job.company_id)?.name || 'Desconocido'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${job.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {job.active ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatDate(job.created_at)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-3">
                                            <button
                                                onClick={() => window.location.href = `/post-job?id=${job.id}`}
                                                className="text-indigo-600 hover:text-indigo-900"
                                                title="Editar"
                                            >
                                                <Briefcase className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleRepublish(job.id)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="Republicar"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(job.id, job.active)}
                                                className={`${job.active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                                                title={job.active ? "Desactivar" : "Activar"}
                                            >
                                                <Power className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {activeTab === 'applications' && filteredApplications.map(app => (
                                <tr key={app.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                        {app.profiles?.name || 'Usuario Eliminado'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {app.jobs?.title || 'Vacante Eliminada'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {allUsers.find(u => u.id === app.jobs?.company_id)?.name || 'Desconocido'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {formatDate(app.created_at)}
                                    </td>
                                </tr>
                            ))}
                            {activeTab === 'unlocks' && filteredUnlocks.map(unlock => (
                                <tr key={unlock.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                        {unlock.company?.name || 'Empresa Eliminada'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {unlock.candidate?.name || 'Candidato Eliminado'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {formatDate(unlock.created_at)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
