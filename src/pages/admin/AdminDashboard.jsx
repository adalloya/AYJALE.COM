import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Users, Building2, Briefcase, Search, RefreshCw, Power, Lock, Eye, Settings, Sliders, Trash2, Plus } from 'lucide-react';

const AdminDashboard = () => {
    const { jobs, adminGetUsers, adminRepublishJob, toggleJobStatus, adminGetApplications, updateUserProfile, adminGetContactUnlocks, adminDeleteUser, siteSettings, updateSiteSettings } = useData();
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

    const handleDeleteUser = async (userId, userEmail, userName, role) => {
        const roleLabel = role === 'company' ? 'a la empresa' : 'al candidato';
        const confirmMessage = `⚠️ ¿Estás seguro de que deseas ELIMINAR permanentemente ${roleLabel} "${userName || userEmail}" de la base de datos?\n\nEsta acción eliminará su perfil y sus datos de forma irreversible.`;

        if (window.confirm(confirmMessage)) {
            try {
                await adminDeleteUser(userId);
                alert(`Usuario eliminado correctamente de la base de datos.`);
                setAllUsers(prev => prev.filter(u => u.id !== userId));
            } catch (error) {
                console.error("Error deleting user:", error);
                alert('Error al eliminar usuario: ' + error.message);
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
        const actionText = currentStatus ? 'desactivar' : 'activar';
        if (window.confirm(`¿Estás seguro de que deseas ${actionText} esta vacante?`)) {
            try {
                await toggleJobStatus(jobId, currentStatus);
            } catch (error) {
                console.error("Error toggling job status:", error);
                alert("Error al cambiar estatus de la vacante: " + error.message);
            }
        }
    };

    const handleToggleSearchAccess = async (companyId, currentVal) => {
        const newVal = !currentVal;
        try {
            await updateUserProfile(companyId, { can_search_candidates: newVal });
            setAllUsers(prev => prev.map(u => u.id === companyId ? { ...u, can_search_candidates: newVal } : u));
        } catch (error) {
            console.error("Error updating search access:", error);
            alert("Error al actualizar permiso de búsqueda: " + error.message);
        }
    };

    const handleToggleHideSalaryAccess = async (companyId, currentVal) => {
        const newVal = !currentVal;
        try {
            await updateUserProfile(companyId, { can_hide_salary: newVal });
            setAllUsers(prev => prev.map(u => u.id === companyId ? { ...u, can_hide_salary: newVal } : u));
        } catch (error) {
            console.error("Error updating hide salary access:", error);
            alert("Error al actualizar permiso de ocultar salario: " + error.message);
        }
    };

    const handleToggleConfidentialAccess = async (companyId, currentVal) => {
        const newVal = !currentVal;
        try {
            await updateUserProfile(companyId, { can_post_confidential: newVal });
            setAllUsers(prev => prev.map(u => u.id === companyId ? { ...u, can_post_confidential: newVal } : u));
        } catch (error) {
            console.error("Error updating confidential access:", error);
            alert("Error al actualizar permiso de empresa confidencial: " + error.message);
        }
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Panel de Administración</h1>
                <Link
                    to="/post-job"
                    className="inline-flex items-center justify-center gap-2 bg-secondary-600 hover:bg-secondary-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md active:scale-98 shrink-0 cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    Publicar Vacantes
                </Link>
            </div>

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
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'settings' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            <Settings className="w-4 h-4" />
                            Configuración
                        </button>
                    </div>
                    {activeTab !== 'settings' && (
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
                    )}
                </div>

                {/* Content */}
                {activeTab === 'settings' ? (
                    <div className="p-6 sm:p-8 max-w-4xl">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
                            <div className="p-3 bg-slate-100 rounded-xl text-slate-800">
                                <Sliders className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Configuración General de la Plataforma</h2>
                                <p className="text-sm text-slate-500">Gestiona la visibilidad de secciones y opciones globales del sitio.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Setting Item 1: Company Carousel */}
                            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-slate-900">Carrusel de Empresas</span>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${siteSettings?.showCompanyCarousel ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-700'}`}>
                                            {siteSettings?.showCompanyCarousel ? 'Visible' : 'Oculto'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600">
                                        Muestra u oculta la sección "Empresas que confían en nosotros" en la página de inicio.
                                    </p>
                                </div>
                                <button
                                    onClick={() => updateSiteSettings({ showCompanyCarousel: !siteSettings?.showCompanyCarousel })}
                                    className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${siteSettings?.showCompanyCarousel ? 'bg-secondary-600' : 'bg-slate-300'}`}
                                    role="switch"
                                    aria-checked={siteSettings?.showCompanyCarousel}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${siteSettings?.showCompanyCarousel ? 'translate-x-7' : 'translate-x-0'}`}
                                    />
                                </button>
                            </div>

                            {/* Setting Item 2: Mexico Map */}
                            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-slate-900">Vacantes por Región (Mapa)</span>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${siteSettings?.showMexicoMap ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-700'}`}>
                                            {siteSettings?.showMexicoMap ? 'Visible' : 'Oculto'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600">
                                        Muestra u oculta la sección interactiva "Explora vacantes por región" en la página de inicio.
                                    </p>
                                </div>
                                <button
                                    onClick={() => updateSiteSettings({ showMexicoMap: !siteSettings?.showMexicoMap })}
                                    className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${siteSettings?.showMexicoMap ? 'bg-secondary-600' : 'bg-slate-300'}`}
                                    role="switch"
                                    aria-checked={siteSettings?.showMexicoMap}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${siteSettings?.showMexicoMap ? 'translate-x-7' : 'translate-x-0'}`}
                                    />
                                </button>
                            </div>

                            {/* Setting Item 3: What's New */}
                            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-slate-900">Sección de Novedades</span>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${siteSettings?.showWhatsNew ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-700'}`}>
                                            {siteSettings?.showWhatsNew ? 'Visible' : 'Oculto'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600">
                                        Muestra u oculta la sección de tarjetas "Novedades" en la página de inicio.
                                    </p>
                                </div>
                                <button
                                    onClick={() => updateSiteSettings({ showWhatsNew: !siteSettings?.showWhatsNew })}
                                    className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${siteSettings?.showWhatsNew ? 'bg-secondary-600' : 'bg-slate-300'}`}
                                    role="switch"
                                    aria-checked={siteSettings?.showWhatsNew}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${siteSettings?.showWhatsNew ? 'translate-x-7' : 'translate-x-0'}`}
                                    />
                                </button>
                            </div>

                            {/* Setting Item 4: AI Talent Profile */}
                            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-slate-900">Perfil de Talento IA y Evaluaciones</span>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${siteSettings?.showAiTalentProfile ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-700'}`}>
                                            {siteSettings?.showAiTalentProfile ? 'Visible' : 'Oculto'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600">
                                        Muestra u oculta la sección "Perfil de Talento IA" y el botón "Centro de Evaluaciones" en el panel de candidatos.
                                    </p>
                                </div>
                                <button
                                    onClick={() => updateSiteSettings({ showAiTalentProfile: !siteSettings?.showAiTalentProfile })}
                                    className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${siteSettings?.showAiTalentProfile ? 'bg-secondary-600' : 'bg-slate-300'}`}
                                    role="switch"
                                    aria-checked={siteSettings?.showAiTalentProfile}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${siteSettings?.showAiTalentProfile ? 'translate-x-7' : 'translate-x-0'}`}
                                    />
                                </button>
                            </div>

                            {/* Setting Item 5: Chat System */}
                            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-slate-900">Sistema de Chat en Postulaciones</span>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${siteSettings?.showChatSystem ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-700'}`}>
                                            {siteSettings?.showChatSystem ? 'Visible' : 'Oculto'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600">
                                        Muestra u oculta la opción de chat en vivo entre candidatos y reclutadores dentro del panel de postulaciones.
                                    </p>
                                </div>
                                <button
                                    onClick={() => updateSiteSettings({ showChatSystem: !siteSettings?.showChatSystem })}
                                    className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${siteSettings?.showChatSystem ? 'bg-secondary-600' : 'bg-slate-300'}`}
                                    role="switch"
                                    aria-checked={siteSettings?.showChatSystem}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${siteSettings?.showChatSystem ? 'translate-x-7' : 'translate-x-0'}`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
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
                                        <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Buscar Candidatos</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Ocultar Salario</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Empresa Confidencial</th>
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
                                            <button
                                                onClick={() => handleDeleteUser(user.id, user.email, user.name, 'candidate')}
                                                className="text-red-600 hover:text-red-900 flex items-center"
                                                title="Eliminar Candidato"
                                            >
                                                <Trash2 className="w-4 h-4 mr-1" /> Eliminar
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
                                     <td className="px-6 py-4 whitespace-nowrap text-center">
                                         <button
                                             onClick={() => handleToggleSearchAccess(user.id, user.can_search_candidates || user.canSearchCandidates)}
                                             className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${user.can_search_candidates || user.canSearchCandidates ? 'bg-secondary-600' : 'bg-slate-300'}`}
                                             role="switch"
                                             title="Activar / Desactivar Búsqueda de Candidatos"
                                         >
                                             <span
                                                 className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${(user.can_search_candidates || user.canSearchCandidates) ? 'translate-x-5' : 'translate-x-0'}`}
                                             />
                                         </button>
                                         <span className="block text-[11px] font-bold mt-1 text-slate-600">
                                             {(user.can_search_candidates || user.canSearchCandidates) ? 'Permitido' : 'Desactivado'}
                                         </span>
                                     </td>
                                     <td className="px-6 py-4 whitespace-nowrap text-center">
                                         <button
                                             onClick={() => handleToggleHideSalaryAccess(user.id, user.can_hide_salary || user.canHideSalary)}
                                             className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${user.can_hide_salary || user.canHideSalary ? 'bg-secondary-600' : 'bg-slate-300'}`}
                                             role="switch"
                                             title="Activar / Desactivar Ocultar Salario"
                                         >
                                             <span
                                                 className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${(user.can_hide_salary || user.canHideSalary) ? 'translate-x-5' : 'translate-x-0'}`}
                                             />
                                         </button>
                                         <span className="block text-[11px] font-bold mt-1 text-slate-600">
                                             {(user.can_hide_salary || user.canHideSalary) ? 'Permitido' : 'Desactivado'}
                                         </span>
                                     </td>
                                     <td className="px-6 py-4 whitespace-nowrap text-center">
                                         <button
                                             onClick={() => handleToggleConfidentialAccess(user.id, user.can_post_confidential || user.canPostConfidential)}
                                             className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${user.can_post_confidential || user.canPostConfidential ? 'bg-secondary-600' : 'bg-slate-300'}`}
                                             role="switch"
                                             title="Activar / Desactivar Empresa Confidencial"
                                         >
                                             <span
                                                 className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${(user.can_post_confidential || user.canPostConfidential) ? 'translate-x-5' : 'translate-x-0'}`}
                                             />
                                         </button>
                                         <span className="block text-[11px] font-bold mt-1 text-slate-600">
                                             {(user.can_post_confidential || user.canPostConfidential) ? 'Permitido' : 'Desactivado'}
                                         </span>
                                     </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-3">
                                            <button
                                                onClick={() => handleResetPassword(user.email)}
                                                className="text-blue-600 hover:text-blue-900 flex items-center"
                                                title="Reset Password"
                                            >
                                                <Lock className="w-4 h-4 mr-1" /> Reset
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id, user.email, user.name, 'company')}
                                                className="text-red-600 hover:text-red-900 flex items-center"
                                                title="Eliminar Empresa"
                                            >
                                                <Trash2 className="w-4 h-4 mr-1" /> Eliminar
                                            </button>
                                        </div>
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
                                        <div className="flex justify-end items-center space-x-3">
                                            <Link
                                                to={`/job/${job.id}/applicants`}
                                                className="text-secondary-600 hover:text-secondary-900 flex items-center font-bold text-xs bg-secondary-50 border border-secondary-200 px-2.5 py-1 rounded-lg"
                                                title="Ver Candidatos Postulados"
                                            >
                                                <Users className="w-3.5 h-3.5 mr-1" />
                                                Postulados ({allApplications.filter(a => a.job_id === job.id).length})
                                            </Link>

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
            )}
        </div>
    </div>
);
};

export default AdminDashboard;
