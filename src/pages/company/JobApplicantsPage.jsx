import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
    ArrowLeft, MapPin, Briefcase, User, CheckCircle, XCircle, Clock, AlertCircle,
    RefreshCw, ShieldCheck, Calendar, GraduationCap, Award, FileText, Phone, Mail,
    Building2, Download, ExternalLink, Sparkles
} from 'lucide-react';
import AvatarPlaceholder from '../../components/AvatarPlaceholder';
import TalentProfileCard from '../../components/assessment/TalentProfileCard';
import KanbanBoard from '../../components/kanban/KanbanBoard';

const JobApplicantsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { jobs, applications, updateApplicationStatus, fetchMessages, sendMessage, siteSettings } = useData();
    const { user: currentUser } = useAuth();
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'board'
    const [statusFilter, setStatusFilter] = useState('all');

    const job = jobs.find(j => j.id === Number(id));

    // Security check: Ensure the job belongs to the current company or user is admin
    const isAccessDenied = !job || (currentUser.role !== 'admin' && job.company_id !== currentUser.id);

    const jobApplications = applications.filter(a => a.job_id === Number(id));

    const formatPhoneNumber = (val) => {
        if (!val) return 'No disponible';
        const digits = String(val).replace(/\D/g, '');
        if (digits.length === 0) return val;
        if (digits.length <= 3) return `(${digits}`;
        if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    };

    const getFullName = (u) => {
        if (!u) return 'Candidato AyJale';
        const parts = [
            u.name,
            u.first_last_name || u.lastName || u.last_name,
            u.second_last_name
        ].filter(Boolean);
        return parts.length > 0 ? parts.join(' ') : 'Candidato AyJale';
    };

    const parseTrades = (titleStr) => {
        if (!titleStr) return [];
        return String(titleStr).split(',').map(t => t.trim()).filter(Boolean);
    };

    // Enrich applications with user data
    const allCandidates = jobApplications.map(app => {
        const candidateUser = app.profiles || {};
        return {
            ...app,
            user: candidateUser
        };
    });

    // Filter candidates
    const candidates = allCandidates.filter(candidate => {
        const term = searchTerm.toLowerCase();
        const u = candidate.user || {};
        const name = getFullName(u).toLowerCase();
        const title = (u.title || '').toLowerCase();
        const location = (u.location || '').toLowerCase();
        const municipality = (u.municipality || u.municipio || '').toLowerCase();

        let skills = '';
        if (Array.isArray(u.skills)) {
            skills = u.skills.join(' ').toLowerCase();
        } else if (typeof u.skills === 'string') {
            skills = u.skills.toLowerCase();
        }

        const matchesSearch = name.includes(term) || title.includes(term) || location.includes(term) || municipality.includes(term) || skills.includes(term);
        const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Calculate status counts
    const statusCounts = allCandidates.reduce((acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
    }, {});

    const statusOptions = [
        { id: 'all', label: 'Todos', count: allCandidates.length, color: 'bg-slate-100 text-slate-800 border-slate-200' },
        { id: 'applied', label: 'Nuevos', count: statusCounts['applied'] || 0, color: 'bg-blue-50 text-blue-700 border-blue-200' },
        { id: 'reviewing', label: 'En Revisión', count: statusCounts['reviewing'] || 0, color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
        { id: 'interviewing', label: 'Entrevista', count: statusCounts['interviewing'] || 0, color: 'bg-purple-50 text-purple-700 border-purple-200' },
        { id: 'offer', label: 'Oferta', count: statusCounts['offer'] || 0, color: 'bg-orange-50 text-orange-700 border-orange-200' },
        { id: 'hired', label: 'Contratado', count: statusCounts['hired'] || 0, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
        { id: 'rejected', label: 'Descartado', count: statusCounts['rejected'] || 0, color: 'bg-red-50 text-red-700 border-red-200' },
    ];

    // Auto-select candidate or clear selection if list is empty/filtered out
    useEffect(() => {
        if (candidates.length === 0) {
            setSelectedCandidate(null);
        } else if (!selectedCandidate || !candidates.some(c => c.id === selectedCandidate.id)) {
            setSelectedCandidate(candidates[0]);
        }
    }, [candidates, statusFilter]);

    const handleStatusChange = (newStatus) => {
        if (selectedCandidate) {
            updateApplicationStatus(selectedCandidate.id, newStatus);
            setSelectedCandidate(prev => ({ ...prev, status: newStatus }));
        }
    };

    if (isAccessDenied) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-bold text-slate-900">Acceso Denegado</h2>
                <button onClick={() => navigate('/dashboard')} className="mt-4 text-secondary-600 hover:underline">
                    Volver al Dashboard
                </button>
            </div>
        );
    }

    const selectedUser = selectedCandidate?.user || {};
    const selectedFullName = getFullName(selectedUser);
    const selectedTrades = parseTrades(selectedUser.title);

    const workHistoryList = Array.isArray(selectedUser.work_history) && selectedUser.work_history.length > 0
        ? selectedUser.work_history
        : (selectedUser.lastJob || selectedUser.last_job) ? [{
            company: selectedUser.lastJob || selectedUser.last_job,
            position: selectedUser.lastPosition || selectedUser.last_position,
            duration: selectedUser.lastDuration || selectedUser.last_duration,
            activities: selectedUser.lastActivities || selectedUser.last_activities,
            reason_for_leaving: '',
            salary: ''
        }] : [];

    const certificationsList = Array.isArray(selectedUser.certifications) ? selectedUser.certifications : [];

    const referencesList = Array.isArray(selectedUser.references) && selectedUser.references.length > 0
        ? selectedUser.references
        : (selectedUser.ref_name || selectedUser.ref_phone) ? [{
            ref_name: selectedUser.ref_name,
            ref_phone: selectedUser.ref_phone,
            ref_position_company: selectedUser.ref_position_company,
            ref_recommendation_pdf: selectedUser.ref_recommendation_pdf
        }] : [];

    return (
        <div className="space-y-6">

            {/* HEADER CON TÍTULO DE LA VACANTE */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center space-x-3">
                    <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900">Candidatos: {job.title}</h1>
                        <p className="text-xs text-slate-500">{candidates.length} postulaciones registradas</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="bg-slate-100 p-1 rounded-xl flex items-center shrink-0">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Lista
                        </button>
                        <button
                            onClick={() => setViewMode('board')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${viewMode === 'board' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Tablero
                        </button>
                    </div>

                    <div className="w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Buscar por nombre, puesto o lugar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
                        />
                    </div>
                </div>
            </div>

            {/* STATUS FILTERS BAR - SHOW ONLY IN LIST VIEW MODE */}
            {viewMode === 'list' && (
                <div className="flex flex-wrap gap-2">
                    {statusOptions.map(opt => {
                        const isDisabled = opt.count === 0 && opt.id !== 'all';
                        const isSelected = statusFilter === opt.id;

                        return (
                            <button
                                key={opt.id}
                                disabled={isDisabled}
                                onClick={() => setStatusFilter(opt.id)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                                    isDisabled
                                        ? 'bg-slate-100 text-slate-400 border-slate-200 opacity-50 cursor-not-allowed'
                                        : isSelected
                                            ? 'bg-secondary-600 text-white border-secondary-600 shadow-2xs cursor-pointer'
                                            : `${opt.color} hover:bg-slate-200/60 cursor-pointer`
                                }`}
                            >
                                {opt.label} ({opt.count})
                            </button>
                        );
                    })}
                </div>
            )}

            {viewMode === 'board' ? (
                <>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-blue-900 text-sm">Gestiona tu flujo de contratación</h3>
                            <p className="text-xs text-blue-700 mt-0.5">
                                Arrastra las tarjetas de los candidatos entre las columnas para actualizar su estatus automáticamente.
                            </p>
                        </div>
                    </div>
                    <KanbanBoard
                        applications={candidates}
                        onStatusChange={updateApplicationStatus}
                    />
                </>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* IZQUIERDA: MINIATURA DEL CANDIDATO (LISTA) */}
                    <div className="lg:col-span-1 space-y-3">
                        {candidates.map(candidate => {
                            const u = candidate.user || {};
                            const candidateName = getFullName(u);
                            const trades = parseTrades(u.title);
                            const isSelected = selectedCandidate?.id === candidate.id;

                            return (
                                <div
                                    key={candidate.id}
                                    onClick={() => setSelectedCandidate(candidate)}
                                    className={`p-4 rounded-2xl border cursor-pointer transition-all shadow-2xs ${isSelected ? 'bg-secondary-50/60 border-secondary-500 ring-2 ring-secondary-500/20 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="w-14 h-14 flex-shrink-0 relative">
                                            {u.photo ? (
                                                <img
                                                    src={u.photo}
                                                    alt={candidateName}
                                                    className="w-full h-full rounded-xl object-cover border border-slate-200 bg-slate-100"
                                                />
                                            ) : (
                                                <div className="w-full h-full rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-extrabold text-lg uppercase">
                                                    {u.name ? u.name.slice(0, 2) : 'CV'}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0 space-y-1">
                                            <h3 className="font-bold text-slate-900 text-sm truncate">
                                                {candidateName}
                                            </h3>

                                            {trades.length > 0 ? (
                                                <span className="inline-block bg-slate-100 text-slate-800 text-[11px] font-semibold px-2 py-0.5 rounded-md truncate max-w-full">
                                                    {trades[0]} {trades.length > 1 ? `(+${trades.length - 1})` : ''}
                                                </span>
                                            ) : (
                                                <p className="text-xs text-slate-400 italic">Oficio sin especificar</p>
                                            )}

                                            <div className="text-[11px] text-slate-500 flex items-center gap-1">
                                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                                <span className="truncate">{u.municipality || u.municipio || 'Municipio'}, {u.location || 'Estado'}</span>
                                            </div>

                                            <div className="text-[11px] text-slate-500 flex items-center gap-1">
                                                <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                                <span>{formatPhoneNumber(u.phone || u.phone_number)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                                        <span className="text-slate-400">
                                            Postulado: {candidate.created_at ? new Date(candidate.created_at).toLocaleDateString() : 'Fecha previa'}
                                        </span>

                                        <span className={`px-2 py-0.5 font-bold rounded-full text-[10px] uppercase
                                            ${candidate.status === 'applied' ? 'bg-blue-100 text-blue-800' : ''}
                                            ${candidate.status === 'reviewing' ? 'bg-yellow-100 text-yellow-800' : ''}
                                            ${candidate.status === 'interviewing' ? 'bg-purple-100 text-purple-800' : ''}
                                            ${candidate.status === 'offer' ? 'bg-orange-100 text-orange-800' : ''}
                                            ${candidate.status === 'hired' ? 'bg-green-100 text-green-800' : ''}
                                            ${candidate.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                                        `}>
                                            {{
                                                'applied': 'Nuevo',
                                                'reviewing': 'En Revisión',
                                                'interviewing': 'Entrevista',
                                                'offer': 'Oferta',
                                                'hired': 'Contratado',
                                                'rejected': 'Descartado'
                                            }[candidate.status] || candidate.status}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}

                        {candidates.length === 0 && (
                            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-6">
                                <User className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                <p className="text-sm font-bold text-slate-700">Aún no hay postulantes</p>
                                <p className="text-xs text-slate-400 mt-1">Las solicitudes enviadas aparecerán aquí.</p>
                            </div>
                        )}
                    </div>

                    {/* DERECHA: DETALLE COMPLETO DEL CANDIDATO (ADAPTADO A UX RECLUTADOR) */}
                    <div className="lg:col-span-2">
                        {selectedCandidate ? (
                            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-8 space-y-6">

                                {/* HEADER DE CANDIDATO Y CAMBIO DE ESTATUS */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-20 h-20 flex-shrink-0 relative">
                                            {selectedUser.photo ? (
                                                <img
                                                    src={selectedUser.photo}
                                                    alt={selectedFullName}
                                                    className="w-full h-full rounded-2xl object-cover border-2 border-slate-200 shadow-2xs"
                                                />
                                            ) : (
                                                <div className="w-full h-full rounded-2xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-slate-600 font-extrabold text-2xl uppercase">
                                                    {selectedUser.name ? selectedUser.name.slice(0, 2) : 'CV'}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            <h2 className="text-2xl font-extrabold text-slate-900">{selectedFullName}</h2>

                                            {selectedTrades.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 pt-0.5">
                                                    {selectedTrades.map((t, idx) => (
                                                        <span key={idx} className="bg-secondary-50 text-secondary-800 border border-secondary-200/80 font-bold px-2.5 py-0.5 rounded-lg text-xs">
                                                            ✓ {t}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                                                <span className="flex items-center gap-1 font-medium">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                    {selectedUser.municipality || selectedUser.municipio || 'Municipio'}, {selectedUser.location || 'Estado'}
                                                </span>
                                                <span className="flex items-center gap-1 font-medium">
                                                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                                                    {formatPhoneNumber(selectedUser.phone || selectedUser.phone_number)}
                                                </span>
                                                <span className="flex items-center gap-1 font-medium">
                                                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                                                    {selectedUser.email}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-1.5 self-stretch sm:self-auto">
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Estatus del Candidato</span>
                                        <select
                                            value={selectedCandidate.status}
                                            onChange={(e) => handleStatusChange(e.target.value)}
                                            className={`text-xs font-bold rounded-xl px-4 py-2 border border-slate-300 cursor-pointer focus:ring-2 focus:ring-secondary-500 shadow-2xs transition-all
                                                ${selectedCandidate.status === 'applied' ? 'bg-blue-50 text-blue-800 border-blue-200' : ''}
                                                ${selectedCandidate.status === 'reviewing' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' : ''}
                                                ${selectedCandidate.status === 'interviewing' ? 'bg-purple-50 text-purple-800 border-purple-200' : ''}
                                                ${selectedCandidate.status === 'offer' ? 'bg-orange-50 text-orange-800 border-orange-200' : ''}
                                                ${selectedCandidate.status === 'hired' ? 'bg-green-50 text-green-800 border-green-200' : ''}
                                                ${selectedCandidate.status === 'rejected' ? 'bg-red-50 text-red-800 border-red-200' : ''}
                                            `}
                                        >
                                            <option value="applied">Nuevo Postulante</option>
                                            <option value="reviewing">En Revisión</option>
                                            <option value="interviewing">Entrevista</option>
                                            <option value="offer">Oferta</option>
                                            <option value="hired">Contratado</option>
                                            <option value="rejected">Descartado</option>
                                        </select>
                                    </div>
                                </div>

                                {/* MENSAJE DE POSTULACIÓN DEL CANDIDATO */}
                                {selectedCandidate.comments && (
                                    <div className="bg-amber-50/80 p-4 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                                        <p className="font-bold text-amber-800 flex items-center gap-1.5">
                                            💬 ¿Por qué eres el candidato ideal para esta vacante?
                                        </p>
                                        <p className="text-slate-800 text-xs italic leading-relaxed pt-1">
                                            "{selectedCandidate.comments}"
                                        </p>
                                    </div>
                                )}

                                {/* CARD 1: IDENTIFICACIÓN Y CONTACTO OFICIAL */}
                                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                                    <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                                        <ShieldCheck className="w-4 h-4 text-secondary-600" />
                                        <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Identificación y Contacto Oficial</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                        <div>
                                            <span className="block font-semibold text-slate-400">Nombre Completo:</span>
                                            <span className="font-bold text-slate-800">{selectedFullName}</span>
                                        </div>
                                        <div>
                                            <span className="block font-semibold text-slate-400">Teléfono / WhatsApp:</span>
                                            <span className="font-bold text-slate-800">{formatPhoneNumber(selectedUser.phone || selectedUser.phone_number)}</span>
                                        </div>
                                        <div>
                                            <span className="block font-semibold text-slate-400">Correo Electrónico:</span>
                                            <span className="font-bold text-slate-800">{selectedUser.email}</span>
                                        </div>
                                        <div>
                                            <span className="block font-semibold text-slate-400">CURP:</span>
                                            <span className="font-mono font-bold text-slate-700">{selectedUser.curp || 'No especificado'}</span>
                                        </div>
                                        <div>
                                            <span className="block font-semibold text-slate-400">RFC:</span>
                                            <span className="font-mono font-bold text-slate-700">{selectedUser.rfc || 'No especificado'}</span>
                                        </div>
                                        <div>
                                            <span className="block font-semibold text-slate-400">NSS:</span>
                                            <span className="font-mono font-bold text-slate-700">{selectedUser.nss || 'No especificado'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* CARD 2: UBICACIÓN RESIDENCIAL */}
                                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                                    <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                                        <MapPin className="w-4 h-4 text-secondary-600" />
                                        <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Ubicación Residencial</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                        <div>
                                            <span className="block font-semibold text-slate-400">Municipio / Alcaldía:</span>
                                            <span className="font-bold text-slate-800">{selectedUser.municipality || selectedUser.municipio || 'No especificado'}</span>
                                        </div>
                                        <div>
                                            <span className="block font-semibold text-slate-400">Estado:</span>
                                            <span className="font-bold text-slate-800">{selectedUser.location || 'No especificado'}</span>
                                        </div>
                                        <div>
                                            <span className="block font-semibold text-slate-400">Código Postal:</span>
                                            <span className="font-mono font-bold text-slate-700">{selectedUser.zipCode || selectedUser.postal_code || '-'}</span>
                                        </div>
                                        {selectedUser.address_street && (
                                            <div className="sm:col-span-2">
                                                <span className="block font-semibold text-slate-400">Calle y Número:</span>
                                                <span className="font-medium text-slate-800">{selectedUser.address_street}</span>
                                            </div>
                                        )}
                                        {selectedUser.colonia && (
                                            <div>
                                                <span className="block font-semibold text-slate-400">Colonia:</span>
                                                <span className="font-medium text-slate-800">{selectedUser.colonia}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* CARD 3: OFICIO Y EXPERIENCIA */}
                                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                                    <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                                        <Briefcase className="w-4 h-4 text-secondary-600" />
                                        <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Oficio y Experiencia</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                        <div>
                                            <span className="block font-semibold text-slate-400">Puestos / Oficios Deseados:</span>
                                            <span className="font-bold text-slate-900">{selectedUser.title || 'Candidato General'}</span>
                                        </div>
                                        <div>
                                            <span className="block font-semibold text-slate-400">Años de Experiencia:</span>
                                            <span className="font-bold text-slate-800">{selectedUser.experience_years || '1 a 3 años'}</span>
                                        </div>
                                        <div>
                                            <span className="block font-semibold text-slate-400">Licencia de Manejo:</span>
                                            <span className="font-bold text-slate-800">{selectedUser.driver_license || 'No tengo'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* CARD 4: HISTORIAL DE EXPERIENCIA LABORAL */}
                                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                                    <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                                        <Clock className="w-4 h-4 text-secondary-600" />
                                        <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Historial de Experiencia Laboral</h3>
                                    </div>

                                    {workHistoryList.length > 0 && workHistoryList[0].company ? (
                                        <div className="space-y-4 pt-1">
                                            {workHistoryList.map((w, idx) => (
                                                <div key={idx} className="bg-white p-3.5 rounded-lg border border-slate-200/80 space-y-1 text-xs">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-bold text-slate-900 text-sm">{w.position || 'Puesto Desempeñado'}</h4>
                                                        {w.duration && (
                                                            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                                                {w.duration}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="font-bold text-secondary-700">{w.company}</p>
                                                    {w.salary && <p className="text-slate-500 font-medium">Sueldo: ${w.salary} MXN</p>}
                                                    {w.activities && <p className="text-slate-600 pt-1 leading-relaxed">{w.activities}</p>}
                                                    {w.reason_for_leaving && <p className="text-[11px] text-slate-400">Motivo separación: {w.reason_for_leaving}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-400 italic">No ha registrado empleos anteriores.</p>
                                    )}
                                </div>

                                {/* CARD 5: FORMACIÓN ACADÉMICA Y CURSOS */}
                                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                                    <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                                        <GraduationCap className="w-4 h-4 text-secondary-600" />
                                        <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Estudios y Certificaciones</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                        <div>
                                            <span className="block font-semibold text-slate-400">Último Grado:</span>
                                            <span className="font-bold text-slate-800">{selectedUser.education || 'Secundaria'} ({selectedUser.education_status || 'Concluido'})</span>
                                        </div>
                                        <div>
                                            <span className="block font-semibold text-slate-400">Institución:</span>
                                            <span className="font-bold text-slate-800">{selectedUser.institution_name || 'No especificada'}</span>
                                        </div>
                                        <div>
                                            <span className="block font-semibold text-slate-400">Nivel de Inglés:</span>
                                            <span className="font-bold text-slate-800">{selectedUser.english_level || 'Ninguno'}</span>
                                        </div>
                                    </div>

                                    {certificationsList.length > 0 && certificationsList[0].title_detail && (
                                        <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
                                            <span className="block text-[11px] font-semibold text-slate-400 uppercase">Acreditaciones y Cursos:</span>
                                            <div className="space-y-1">
                                                {certificationsList.map((cert, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 text-xs bg-white p-2 rounded border border-slate-200">
                                                        <Award className="w-3.5 h-3.5 text-secondary-600 shrink-0" />
                                                        <span className="font-bold text-slate-800">{cert.type || 'Certificación'}:</span>
                                                        <span className="text-slate-700">{cert.title_detail}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* CARD 6: REFERENCIAS DE CONFIANZA */}
                                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                                    <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                                        <Award className="w-4 h-4 text-secondary-600" />
                                        <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Referencias de Confianza</h3>
                                    </div>

                                    {referencesList.length > 0 && referencesList[0].ref_name ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                            {referencesList.map((ref, idx) => (
                                                <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                                                    <p className="font-bold text-slate-900">{ref.ref_name}</p>
                                                    <p className="text-slate-600 font-medium">📞 {formatPhoneNumber(ref.ref_phone)}</p>
                                                    {ref.ref_position_company && <p className="text-slate-500">🏢 {ref.ref_position_company}</p>}
                                                    {ref.ref_recommendation_pdf && (
                                                        <div className="pt-1.5">
                                                            <a
                                                                href={ref.ref_recommendation_pdf}
                                                                download={`Carta_Recomendacion_${ref.ref_name.replace(/\s+/g, '_')}.pdf`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1 text-[11px] font-bold text-secondary-700 bg-secondary-50 border border-secondary-200 px-2.5 py-1 rounded transition-colors"
                                                            >
                                                                <FileText className="w-3.5 h-3.5" />
                                                                Descargar Carta PDF
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-400 italic">No ha registrado referencias de confianza.</p>
                                    )}
                                </div>

                                {/* CARD 7: DISPONIBILIDAD Y EXPECTATIVAS */}
                                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                                    <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                                        <Calendar className="w-4 h-4 text-secondary-600" />
                                        <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Disponibilidad y Expectativas</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                        <div>
                                            <span className="block font-semibold text-slate-400">Expectativa Salarial:</span>
                                            <span className="font-extrabold text-secondary-600 text-sm">
                                                {selectedUser.expected_salary ? `$ ${selectedUser.expected_salary} MXN / mes` : 'A convenir'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="block font-semibold text-slate-400">Inicio Laboral:</span>
                                            <span className="font-bold text-slate-800">{selectedUser.start_availability || 'Inmediata'}</span>
                                        </div>
                                        <div>
                                            <span className="block font-semibold text-slate-400">Jornada / Horario:</span>
                                            <span className="font-bold text-slate-800">{selectedUser.shift_availability || 'Tiempo completo'}</span>
                                        </div>
                                        <div>
                                            <span className="block font-semibold text-slate-400">Viaje / Mudanza:</span>
                                            <span className="font-bold text-slate-800">{selectedUser.travel_availability || 'No'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* CARD 8: CHAT EN VIVO CON EL CANDIDATO */}
                                {siteSettings?.showChatSystem && (
                                    <div className="border-t border-slate-200 pt-6">
                                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Chat con el Candidato</h3>
                                        <ChatBox applicationId={selectedCandidate.id} />
                                    </div>
                                )}

                            </div>
                        ) : (
                            <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 h-full flex items-center justify-center p-12 text-center">
                                <div>
                                    <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-slate-900">Selecciona un candidato</h3>
                                    <p className="text-slate-500 text-xs mt-1">Haz clic en la lista de la izquierda para ver los detalles del postulante.</p>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            )}
        </div>
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
        <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-white">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Historial de Mensajes</span>
                <button
                    onClick={loadMessages}
                    className="p-1 hover:bg-slate-100 rounded-full text-slate-500 hover:text-secondary-600 transition-colors cursor-pointer"
                    title="Actualizar mensajes"
                >
                    <RefreshCw size={14} />
                </button>
            </div>
            <div className="h-64 overflow-y-auto p-4 space-y-3">
                {loading ? (
                    <p className="text-center text-slate-400 text-xs">Cargando mensajes...</p>
                ) : messages.length === 0 ? (
                    <p className="text-center text-slate-400 text-xs">No hay mensajes aún. Inicia la conversación.</p>
                ) : (
                    messages.map(msg => {
                        const isMe = msg.sender_id === user.id;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-xl px-3.5 py-2 text-xs ${isMe ? 'bg-secondary-600 text-white shadow-2xs' : 'bg-white border border-slate-200 text-slate-800 shadow-2xs'}`}>
                                    <p className="leading-relaxed">{msg.content}</p>
                                    <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-secondary-200' : 'text-slate-400'}`}>
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
                    placeholder="Escribe un mensaje al candidato..."
                    className="flex-1 rounded-lg border-slate-300 text-xs border p-2.5 focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-xs font-bold rounded-lg text-white bg-secondary-600 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 disabled:opacity-50 cursor-pointer shadow-2xs"
                >
                    Enviar
                </button>
            </form>
        </div>
    );
};

export default JobApplicantsPage;
