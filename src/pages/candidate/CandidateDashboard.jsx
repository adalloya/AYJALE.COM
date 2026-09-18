import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Briefcase, User, ClipboardCheck, RefreshCw, CheckCircle2, Search } from 'lucide-react';
import TalentProfileCard from '../../components/assessment/TalentProfileCard';

const TalentProfileSection = ({ profile }) => {
    if (!profile) return null;

    return (
        <div className="mb-8">
            <TalentProfileCard profile={profile} />
        </div>
    );
};

const CandidateDashboard = () => {
    const { user } = useAuth();
    const { applications, jobs, fetchMessages, sendMessage, fetchCandidateProfile, siteSettings } = useData();
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const loadProfile = async () => {
            if (user?.id) {
                const data = await fetchCandidateProfile(user.id);
                setProfile(data);
            }
        };
        loadProfile();
    }, [user, fetchCandidateProfile]);

    const myApplications = applications.filter(app => app.candidate_id === user.id);

    const calculateCompletion = (u) => {
        if (!u) return 0;
        let score = 0;
        if (u.name && (u.first_last_name || u.lastName || u.last_name) && (u.phone || u.phone_number) && u.email && u.curp) score++;
        if (u.location && (u.municipality || u.municipio) && (u.zipCode || u.postal_code)) score++;
        if (u.title && u.skills) score++;
        if (u.education && u.education_status) score++;
        if ((u.work_history && u.work_history.length > 0 && u.work_history[0].company) || u.lastJob || u.last_job) score++;
        if (u.ref_name && u.ref_phone) score++;
        if (u.expected_salary && u.start_availability) score++;
        return Math.round((score / 7) * 100);
    };

    const completionPercent = calculateCompletion(user);

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Hola, {user.name}</h1>
                <p className="text-slate-600 mb-6">¿Qué te gustaría hacer hoy?</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link to="/jobs" className="flex items-center justify-center p-4 bg-secondary-50 border border-secondary-100 rounded-xl hover:bg-secondary-100 transition-colors group">
                        <Briefcase className="w-6 h-6 text-secondary-600 mr-3 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold text-secondary-700">Buscar Vacantes</span>
                    </Link>
                    <Link to="/profile" className="flex items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors group">
                        <User className="w-6 h-6 text-slate-600 mr-3 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold text-slate-700">Editar Mi Perfil</span>
                    </Link>

                    {siteSettings?.showAiTalentProfile && (
                        <Link to="/evaluation-center" className={`flex items-center justify-center p-4 border rounded-xl transition-colors group sm:col-span-2 ${profile
                            ? 'bg-green-50 border-green-200 hover:bg-green-100'
                            : 'bg-indigo-50 border-indigo-100 hover:bg-indigo-100'
                            }`}>
                            {profile ? (
                                <div className="flex items-center">
                                    <div className="bg-green-100 p-1 rounded-full mr-3">
                                        <ClipboardCheck className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div className="text-left">
                                        <span className="block font-bold text-green-800">Evaluación Completada</span>
                                        <span className="text-sm text-green-700">Resultados vigentes • Actualizar evaluación</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <ClipboardCheck className="w-6 h-6 text-indigo-600 mr-3 group-hover:scale-110 transition-transform" />
                                    <span className="font-semibold text-indigo-700">Centro de Evaluaciones (Pendiente)</span>
                                </div>
                            )}
                        </Link>
                    )}
                </div>
            </div>

            {/* BARRA Y CARD DE COMPLETITUD DE PERFIL */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-slate-900">Estado de tu Perfil</h3>
                            {completionPercent === 100 ? (
                                <span className="inline-flex items-center text-xs font-bold text-green-700 bg-green-100 border border-green-200 px-2.5 py-1 rounded-full">
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> 100% Completo
                                </span>
                            ) : (
                                <span className="inline-flex items-center text-xs font-semibold text-amber-800 bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-full">
                                    {completionPercent}% Completado
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-slate-600 mb-3">
                            {completionPercent === 100
                                ? '¡Felicidades! Tu perfil está 100% completo y optimizado para reclutadores.'
                                : 'Completa tu perfil para incrementar tus probabilidades de contratación.'}
                        </p>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                            <div
                                className={`h-2.5 rounded-full transition-all duration-500 ${completionPercent === 100 ? 'bg-green-500' : 'bg-secondary-600'}`}
                                style={{ width: `${completionPercent}%` }}
                            />
                        </div>
                    </div>

                    <Link
                        to="/profile"
                        className="bg-secondary-600 hover:bg-secondary-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors text-center shrink-0"
                    >
                        {completionPercent === 100 ? 'Ver Mi Perfil' : 'Completar Perfil'}
                    </Link>
                </div>
            </div>

            {/* Talent Profile Section */}
            {siteSettings?.showAiTalentProfile && (
                <TalentProfileSection profile={profile} />
            )}

            <h2 className="text-xl font-bold text-slate-900">Mis Postulaciones</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-slate-200">
                    {myApplications.map(app => {
                        const job = jobs.find(j => j.id === app.job_id);
                        return (
                            <ApplicationItem key={app.id} app={app} job={job} />
                        );
                    })}
                    {myApplications.length === 0 && (
                        <li className="px-4 py-12 text-center text-slate-500">No has realizado ninguna postulación aún.</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

const ApplicationItem = ({ app, job }) => {
    const [showChat, setShowChat] = useState(false);
    const navigate = useNavigate();
    const { siteSettings } = useData();

    const effectiveJob = job || app.jobs;

    // Handle case where job is closed or inactive
    if (!effectiveJob || effectiveJob.active === false) {
        const jobTitle = effectiveJob?.title || '';
        const jobLocation = effectiveJob?.location || '';
        const searchUrl = `/jobs?keyword=${encodeURIComponent(jobTitle)}` + (jobLocation ? `&state=${encodeURIComponent(jobLocation)}` : '');

        return (
            <li className="px-4 py-4 sm:px-6 bg-slate-50 opacity-90 border-l-4 border-amber-400">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-800">
                                {effectiveJob?.title || 'Vacante no disponible'}
                            </p>
                            <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-slate-200 text-slate-600">
                                Cerrada
                            </span>
                        </div>
                        <p className="text-xs text-amber-800 font-medium mt-1">
                            ⚠️ Esta vacante ya no está disponible o ha concluido su período de publicación.
                        </p>
                    </div>

                    <div className="text-xs text-slate-500 shrink-0">
                        Postulado el: {app.created_at ? new Date(app.created_at).toLocaleDateString() : 'Fecha previa'}
                    </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <p className="text-xs text-slate-600">
                        Te sugerimos explorar otras ofertas disponibles para <span className="font-semibold text-slate-800">{jobTitle || 'puestos similares'}</span>.
                    </p>
                    <button
                        onClick={() => navigate(searchUrl)}
                        className="bg-secondary-600 hover:bg-secondary-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 shrink-0 shadow-2xs"
                    >
                        <Search className="w-3.5 h-3.5" /> Ver vacantes similares
                    </button>
                </div>
            </li>
        );
    }

    return (
        <li className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-primary-600 truncate">{effectiveJob?.title || 'Vacante'}</p>
                <div className="ml-2 flex-shrink-0 flex">
                    <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${{
                            'applied': 'bg-blue-100 text-blue-800',
                            'reviewing': 'bg-yellow-100 text-yellow-800',
                            'interviewing': 'bg-purple-100 text-purple-800',
                            'offer': 'bg-orange-100 text-orange-800',
                            'hired': 'bg-green-100 text-green-800',
                            'rejected': 'bg-red-100 text-red-800'
                        }[app.status] || 'bg-slate-100 text-slate-800'
                        }`}>
                        {
                            {
                                'applied': 'Postulado',
                                'reviewing': 'En Revisión',
                                'interviewing': 'Entrevista',
                                'offer': 'Oferta',
                                'hired': 'Contratado',
                                'rejected': 'Rechazado'
                            }[app.status] || app.status
                        }
                    </p>
                </div>
            </div>
            <div className="mt-2 sm:flex sm:justify-between">
                <div className="sm:flex">
                    <p className="flex items-center text-sm text-slate-500">
                        Aplicado el: {app.created_at ? new Date(app.created_at).toLocaleDateString() : 'Fecha desconocida'}
                    </p>
                </div>
                {siteSettings?.showChatSystem && (
                    <div className="mt-2 flex items-center text-sm text-slate-500 sm:mt-0">
                        <button
                            onClick={() => setShowChat(!showChat)}
                            className="text-primary-600 hover:text-primary-900 font-medium"
                        >
                            {showChat ? 'Ocultar Chat' : 'Ver Chat'}
                        </button>
                    </div>
                )}
            </div>
            {siteSettings?.showChatSystem && showChat && (
                <div className="mt-4 border-t border-slate-200 pt-4">
                    <ChatBox applicationId={app.id} />
                </div>
            )}
        </li>
    );
};

const ChatBox = ({ applicationId }) => {
    const { fetchMessages, sendMessage } = useData();
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMessages();
    }, [applicationId]);

    const loadMessages = async () => {
        const msgs = await fetchMessages(applicationId);
        setMessages(msgs);
        setLoading(false);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await sendMessage(applicationId, newMessage);
            setNewMessage('');
            loadMessages();
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    return (
        <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
            <div className="p-2 border-b border-slate-200 flex justify-between items-center bg-white">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Historial</span>
                <button
                    onClick={loadMessages}
                    className="p-1 hover:bg-slate-100 rounded-full text-slate-500 hover:text-secondary-600 transition-colors"
                    title="Actualizar mensajes"
                >
                    <RefreshCw size={14} />
                </button>
            </div>
            <div className="h-64 overflow-y-auto p-4 space-y-3">
                {loading ? (
                    <p className="text-center text-slate-400 text-sm">Cargando mensajes...</p>
                ) : messages.length === 0 ? (
                    <p className="text-center text-slate-400 text-sm">No hay mensajes aún.</p>
                ) : (
                    messages.map(msg => {
                        const isMe = msg.sender_id === user.id;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${isMe ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-800'}`}>
                                    <p>{msg.content}</p>
                                    <p className={`text-xs mt-1 ${isMe ? 'text-primary-200' : 'text-slate-400'}`}>
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                    Enviar
                </button>
            </form>
        </div>
    );
};

export default CandidateDashboard;
