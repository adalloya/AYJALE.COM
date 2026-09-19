import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
    Search, MapPin, Briefcase, User, Phone, Mail, ShieldCheck, Clock,
    GraduationCap, Award, FileText, Lock, ArrowLeft, LockKeyhole
} from 'lucide-react';

const CandidateSearchPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { adminGetUsers } = useData();
    const { user } = useAuth();
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCandidate, setSelectedCandidate] = useState(null);

    // Permission check
    const hasSearchAccess = user?.role === 'admin' || Boolean(user?.can_search_candidates || user?.canSearchCandidates);

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

    // Sync search term with URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const keyword = params.get('keyword');
        if (keyword) {
            setSearchTerm(keyword);
        }
    }, [location.search]);

    useEffect(() => {
        const loadCandidates = async () => {
            if (!hasSearchAccess) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const allProfiles = await adminGetUsers();
                const candidateProfiles = (allProfiles || []).filter(p => p.role === 'candidate');
                setCandidates(candidateProfiles);

                if (candidateProfiles.length > 0) {
                    setSelectedCandidate(candidateProfiles[0]);
                }
            } catch (error) {
                console.error("Error loading candidates:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            loadCandidates();
        }
    }, [user, hasSearchAccess, adminGetUsers]);

    const filteredCandidates = candidates.filter(c => {
        const term = searchTerm.toLowerCase();
        const fullName = getFullName(c).toLowerCase();
        const title = (c.title || '').toLowerCase();
        const locationStr = (c.location || '').toLowerCase();
        const municipality = (c.municipality || c.municipio || '').toLowerCase();

        let skills = '';
        if (Array.isArray(c.skills)) {
            skills = c.skills.join(' ').toLowerCase();
        } else if (typeof c.skills === 'string') {
            skills = c.skills.toLowerCase();
        }

        return fullName.includes(term) || title.includes(term) || locationStr.includes(term) || municipality.includes(term) || skills.includes(term);
    });

    // Auto update selection if current selection is filtered out
    useEffect(() => {
        if (filteredCandidates.length === 0) {
            setSelectedCandidate(null);
        } else if (!selectedCandidate || !filteredCandidates.some(c => c.id === selectedCandidate.id)) {
            setSelectedCandidate(filteredCandidates[0]);
        }
    }, [filteredCandidates]);

    // ACCESS RESTRICTED VIEW (IF COMPANY DOES NOT HAVE ACCESS)
    if (!hasSearchAccess) {
        return (
            <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-6">
                    <div className="w-16 h-16 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
                        <LockKeyhole className="w-8 h-8" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-extrabold text-slate-900">Buscar Candidatos - Acceso Restringido</h1>
                        <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                            La herramienta de búsqueda directa en la base de datos de candidatos es un módulo avanzado asignado por el equipo de administración de AyJale.
                        </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 max-w-md mx-auto">
                        💡 Si deseas contratar este acceso para tu cuenta de empresa, ponte en contacto con nuestro equipo de atención.
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                        <a
                            href="mailto:soporte@ayjale.com?subject=Solicitud de Acceso a Búsqueda de Candidatos"
                            className="w-full sm:w-auto bg-secondary-600 hover:bg-secondary-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md active:scale-98"
                        >
                            📞 Solicitar Acceso a Soporte
                        </a>

                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-3 rounded-xl text-sm transition-colors"
                        >
                            Volver al Panel
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return <div className="p-12 text-center text-slate-500">Cargando base de datos de candidatos...</div>;
    }

    const selectedUser = selectedCandidate || {};
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

            {/* HEADER CON TÍTULO HOMOLOGADO */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center space-x-3">
                    <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900">Buscar Candidatos</h1>
                        <p className="text-xs text-slate-500">{filteredCandidates.length} perfiles disponibles en la plataforma</p>
                    </div>
                </div>

                <div className="w-full md:w-80">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-3 text-slate-400 w-4 h-4 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, oficio o ciudad..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
                        />
                    </div>
                </div>
            </div>

            {/* CONTENIDO EN 2 COLUMNAS (HOMOLOGADO CON ADMINISTRADOR DE POSTULADOS) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* IZQUIERDA: MINIATURAS DE CANDIDATOS */}
                <div className="lg:col-span-1 space-y-3">
                    {filteredCandidates.map(candidate => {
                        const candidateName = getFullName(candidate);
                        const trades = parseTrades(candidate.title);
                        const isSelected = selectedCandidate?.id === candidate.id;

                        return (
                            <div
                                key={candidate.id}
                                onClick={() => setSelectedCandidate(candidate)}
                                className={`p-4 rounded-2xl border cursor-pointer transition-all shadow-2xs ${isSelected ? 'bg-secondary-50/60 border-secondary-500 ring-2 ring-secondary-500/20 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                            >
                                <div className="flex items-start space-x-3">
                                    <div className="w-14 h-14 flex-shrink-0 relative">
                                        {candidate.photo ? (
                                            <img
                                                src={candidate.photo}
                                                alt={candidateName}
                                                className="w-full h-full rounded-xl object-cover border border-slate-200 bg-slate-100"
                                            />
                                        ) : (
                                            <div className="w-full h-full rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-extrabold text-lg uppercase">
                                                {candidate.name ? candidate.name.slice(0, 2) : 'CV'}
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
                                            <span className="truncate">{candidate.municipality || candidate.municipio || 'Municipio'}, {candidate.location || 'Estado'}</span>
                                        </div>

                                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                            <span>{formatPhoneNumber(candidate.phone || candidate.phone_number)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {filteredCandidates.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-6">
                            <User className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm font-bold text-slate-700">Sin coincidencias</p>
                            <p className="text-xs text-slate-400 mt-1">Intenta con otros términos de búsqueda.</p>
                        </div>
                    )}
                </div>

                {/* DERECHA: VISOR COMPLETO DEL CANDIDATO ADAPTADO PARA RECLUTADOR */}
                <div className="lg:col-span-2">
                    {selectedCandidate ? (
                        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-8 space-y-6">

                            {/* HEADER DE CANDIDATO */}
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
                            </div>

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
                                    <Clock className="w-4 h-4 text-secondary-600" />
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

                        </div>
                    ) : (
                        <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 h-full flex items-center justify-center p-12 text-center min-h-[400px]">
                            <div>
                                <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-slate-900">Selecciona un candidato</h3>
                                <p className="text-slate-500 text-xs mt-1">Haz clic en la lista de la izquierda para ver el perfil completo del candidato.</p>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default CandidateSearchPage;
