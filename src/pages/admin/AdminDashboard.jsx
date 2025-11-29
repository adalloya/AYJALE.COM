import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Users, Building2, Briefcase, Search, RefreshCw, Power, Lock, Eye } from 'lucide-react';

const AdminDashboard = () => {
    const { jobs, adminGetUsers, adminRepublishJob, toggleJobStatus } = useData();
    const { resetPassword } = useAuth();
    const [activeTab, setActiveTab] = useState('candidates');
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const data = await adminGetUsers();
                setAllUsers(data || []);
            } catch (error) {
                console.error("Failed to load users", error);
            } finally {
                setLoading(false);
            }
        };
        loadUsers();
    }, [adminGetUsers]);

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

    const handleRepublish = async (jobId) => {
        if (window.confirm('¿Republicar vacante? Esto reiniciará su vigencia de 30 días.')) {
            await adminRepublishJob(jobId);
        }
    };

    const handleToggleStatus = async (jobId, currentStatus) => {
        await toggleJobStatus(jobId, currentStatus);
    };

    const filteredCandidates = candidates.filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredCompanies = companies.filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredJobs = jobs.filter(j =>
        j.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Panel de Administración</h1>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                        <Users className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Candidatos Registrados</p>
                        <p className="text-2xl font-bold text-slate-900">{candidates.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center">
                    <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                        <Building2 className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Empresas Registradas</p>
                        <p className="text-2xl font-bold text-slate-900">{companies.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center">
                    <div className="p-3 rounded-full bg-orange-100 text-orange-600 mr-4">
                        <Briefcase className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Vacantes Totales</p>
                        <p className="text-2xl font-bold text-slate-900">{jobs.length}</p>
                    </div>
                </div>
            </div>

            {/* Tabs & Search */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-200 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex space-x-4">
                        <button
                            onClick={() => setActiveTab('candidates')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'candidates' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            Candidatos
                        </button>
                        <button
                            onClick={() => setActiveTab('companies')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'companies' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            Empresas
                        </button>
                        <button
                            onClick={() => setActiveTab('jobs')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'jobs' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            Vacantes
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Industria</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ubicación</th>
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
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {activeTab === 'candidates' && filteredCandidates.map(user => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(user.created_at).toLocaleDateString()}</td>
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
                            {activeTab === 'companies' && filteredCompanies.map(user => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.industry || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.location || '-'}</td>
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(job.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-3">
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
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
