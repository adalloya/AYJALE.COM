import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Link, useNavigate } from 'react-router-dom';
import {
    User, Mail, Phone, MapPin, Briefcase, GraduationCap, Award, ShieldCheck,
    Calendar, DollarSign, Clock, CheckCircle2, Edit3, FileText, Download,
    ExternalLink, Sparkles, Building2, ChevronRight, AlertCircle
} from 'lucide-react';

const ProfilePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    if (!user) return null;

    const formatPhoneNumber = (val) => {
        if (!val) return 'No especificado';
        const digits = val.replace(/\D/g, '');
        if (digits.length === 0) return val;
        if (digits.length <= 3) return `(${digits}`;
        if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    };

    const calculateCompletion = (u) => {
        if (!u) return 0;
        let score = 0;
        if (u.name && (u.first_last_name || u.lastName || u.last_name) && (u.phone || u.phone_number) && u.email && u.curp) score++;
        if (u.location && (u.municipality || u.municipio) && (u.zipCode || u.postal_code)) score++;
        if (u.title) score++;
        if (u.education && u.education_status) score++;
        if ((u.work_history && u.work_history.length > 0 && u.work_history[0].company) || u.lastJob || u.last_job) score++;
        if (u.ref_name && u.ref_phone) score++;
        if (u.expected_salary && u.start_availability) score++;
        return Math.round((score / 7) * 100);
    };

    const completionPercentage = calculateCompletion(user);

    const fullName = [
        user.name,
        user.first_last_name || user.lastName || user.last_name,
        user.second_last_name
    ].filter(Boolean).join(' ');

    const workHistoryList = Array.isArray(user.work_history) && user.work_history.length > 0
        ? user.work_history
        : (user.lastJob || user.last_job) ? [{
            company: user.lastJob || user.last_job,
            position: user.lastPosition || user.last_position,
            duration: user.lastDuration || user.last_duration,
            activities: user.lastActivities || user.last_activities,
            reason_for_leaving: '',
            salary: ''
        }] : [];

    const certificationsList = Array.isArray(user.certifications) ? user.certifications : [];

    const referencesList = Array.isArray(user.references) && user.references.length > 0
        ? user.references
        : (user.ref_name || user.ref_phone) ? [{
            ref_name: user.ref_name,
            ref_phone: user.ref_phone,
            ref_position_company: user.ref_position_company,
            ref_recommendation_pdf: user.ref_recommendation_pdf
        }] : [];

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12">

            {/* EXECUTIVE PROFILE HEADER - UNIFIED LOOK & FEEL */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200 relative overflow-hidden">

                <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">

                    {/* AVATAR & MAIN INFO */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
                        <div className="relative group shrink-0">
                            {user.photo ? (
                                <img
                                    src={user.photo}
                                    alt={fullName}
                                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-slate-200 shadow-sm bg-slate-50"
                                />
                            ) : (
                                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-100 border-2 border-slate-200 shadow-sm flex items-center justify-center text-slate-500 font-extrabold text-3xl sm:text-4xl uppercase tracking-wider">
                                    {user.name ? user.name.slice(0, 2) : 'CV'}
                                </div>
                            )}
                            <span className="absolute -bottom-1 -right-1 bg-green-500 border-2 border-white w-4 h-4 rounded-full" title="Perfil Activo" />
                        </div>

                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                                    {fullName || 'Perfil de Candidato'}
                                </h1>
                            </div>

                            {user.title && (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-50 text-secondary-700 border border-secondary-200/80 text-xs sm:text-sm font-bold">
                                    <Briefcase className="w-3.5 h-3.5 text-secondary-600" />
                                    {user.title}
                                </div>
                            )}

                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-y-1.5 gap-x-5 text-xs sm:text-sm text-slate-600 pt-1">
                                <span className="flex items-center gap-1.5 font-medium">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    {user.municipality || user.municipio || 'Municipio'}, {user.location || 'Estado'}
                                </span>
                                <span className="flex items-center gap-1.5 font-medium">
                                    <Phone className="w-4 h-4 text-slate-400" />
                                    {formatPhoneNumber(user.phone || user.phone_number)}
                                </span>
                                <span className="flex items-center gap-1.5 font-medium">
                                    <Mail className="w-4 h-4 text-slate-400" />
                                    {user.email}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* TOP ACTION BUTTON */}
                    <div className="w-full md:w-auto flex flex-col items-center md:items-end gap-3 shrink-0">
                        <Link
                            to="/profile/edit"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-secondary-600 hover:bg-secondary-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-sm active:scale-98 cursor-pointer"
                        >
                            <Edit3 className="w-4 h-4" /> Editar Mi Perfil
                        </Link>

                        <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Vista previa oficial para reclutadores
                        </span>
                    </div>

                </div>

                {/* BARRA DE COMPLETITUD DENTRO DEL HEADER */}
                <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                        <span className="font-bold text-slate-700">Completitud del Perfil:</span>
                        <span className="font-extrabold text-secondary-600">{completionPercentage}%</span>
                        <div className="w-36 sm:w-48 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                            <div
                                className="bg-secondary-600 h-full rounded-full transition-all duration-500"
                                style={{ width: `${completionPercentage}%` }}
                            />
                        </div>
                    </div>
                    {completionPercentage < 100 && (
                        <Link to="/profile/edit" className="text-secondary-600 hover:text-secondary-700 font-bold underline">
                            Completa los datos faltantes →
                        </Link>
                    )}
                </div>
            </div>

            {/* MAIN DASHBOARD CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT COLUMN (1 col on desktop) */}
                <div className="space-y-6">

                    {/* CARD 1: IDENTIFICACIÓN Y CONTACTO */}
                    <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
                        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
                            <ShieldCheck className="w-5 h-5 text-secondary-600" />
                            <h2 className="font-bold text-slate-900 text-base">Identificación Oficial</h2>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Nombre Completo</span>
                                <span className="font-medium text-slate-800">{fullName || 'No especificado'}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Teléfono / WhatsApp</span>
                                <span className="font-medium text-slate-800">{formatPhoneNumber(user.phone || user.phone_number)}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Correo Electrónico</span>
                                <span className="font-medium text-slate-800">{user.email}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                                <div>
                                    <span className="block text-[11px] font-semibold text-slate-400 uppercase">CURP</span>
                                    <span className="font-mono text-xs font-bold text-slate-700">{user.curp || 'Pendiente'}</span>
                                </div>
                                <div>
                                    <span className="block text-[11px] font-semibold text-slate-400 uppercase">RFC</span>
                                    <span className="font-mono text-xs font-bold text-slate-700">{user.rfc || 'Pendiente'}</span>
                                </div>
                            </div>
                            {user.nss && (
                                <div className="pt-1">
                                    <span className="block text-[11px] font-semibold text-slate-400 uppercase">NSS (Seguro Social)</span>
                                    <span className="font-mono text-xs font-bold text-slate-700">{user.nss}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CARD 2: UBICACIÓN RESIDENCIAL */}
                    <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
                        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
                            <MapPin className="w-5 h-5 text-secondary-600" />
                            <h2 className="font-bold text-slate-900 text-base">Ubicación Residencial</h2>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Municipio / Alcaldía</span>
                                <span className="font-medium text-slate-800">{user.municipality || user.municipio || 'No especificado'}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Estado</span>
                                <span className="font-medium text-slate-800">{user.location || 'No especificado'}</span>
                            </div>
                            {user.address_street && (
                                <div>
                                    <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Calle y Número</span>
                                    <span className="font-medium text-slate-800">{user.address_street}</span>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                                <div>
                                    <span className="block text-[11px] font-semibold text-slate-400 uppercase">Colonia</span>
                                    <span className="font-medium text-xs text-slate-700">{user.colonia || '-'}</span>
                                </div>
                                <div>
                                    <span className="block text-[11px] font-semibold text-slate-400 uppercase">C.P.</span>
                                    <span className="font-mono text-xs font-bold text-slate-700">{user.zipCode || user.postal_code || '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CARD 3: DISPONIBILIDAD Y EXPECTATIVAS */}
                    <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
                        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
                            <Calendar className="w-5 h-5 text-secondary-600" />
                            <h2 className="font-bold text-slate-900 text-base">Disponibilidad Laboral</h2>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Sueldo Deseado</span>
                                <span className="text-base font-extrabold text-secondary-600">
                                    {user.expected_salary ? `$ ${user.expected_salary} MXN / mes` : 'A convenir'}
                                </span>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Inicio Disponibilidad</span>
                                <span className="font-medium text-slate-800">{user.start_availability || 'Inmediata'}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Jornada / Horario</span>
                                <span className="font-medium text-slate-800">{user.shift_availability || 'Tiempo completo'}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Disponibilidad Viajar / Mudanza</span>
                                <span className="font-medium text-slate-800">{user.travel_availability || 'No'}</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN (2 cols on desktop) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* CARD 4: OFICIO Y EXPERIENCIA */}
                    <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
                        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-secondary-600" />
                                <h2 className="font-bold text-slate-900 text-base">Oficio y Experiencia General</h2>
                            </div>
                            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                                Exp: {user.experience_years || '1 a 3 años'}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Puesto Deseado</span>
                                <p className="text-base font-bold text-slate-900 mt-0.5">{user.title || 'Candidato General'}</p>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Años de Experiencia</span>
                                <p className="text-base font-semibold text-slate-800 mt-0.5">{user.experience_years || '1 a 3 años'}</p>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Licencia de Manejo</span>
                                <p className="text-base font-semibold text-slate-800 mt-0.5">{user.driver_license || 'No tengo'}</p>
                            </div>
                        </div>
                    </div>

                    {/* CARD 5: HISTORIAL DE EXPERIENCIA LABORAL */}
                    <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
                        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
                            <Clock className="w-5 h-5 text-secondary-600" />
                            <h2 className="font-bold text-slate-900 text-base">Experiencia Laboral</h2>
                        </div>

                        {workHistoryList.length > 0 && workHistoryList[0].company ? (
                            <div className="space-y-6 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200">
                                {workHistoryList.map((job, idx) => (
                                    <div key={idx} className="relative pl-8 space-y-1">
                                        <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-secondary-600 border-2 border-white" />
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                            <h3 className="font-bold text-slate-900 text-base">
                                                {job.position || 'Puesto Desempeñado'}
                                            </h3>
                                            {job.duration && (
                                                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full self-start sm:self-auto border border-slate-200">
                                                    {job.duration}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-sm font-semibold text-secondary-700">
                                            {job.company}
                                        </p>

                                        {job.salary && (
                                            <p className="text-xs text-slate-500 font-medium">
                                                Sueldo aprox: <span className="font-bold text-slate-700">${job.salary} MXN</span>
                                            </p>
                                        )}

                                        {job.activities && (
                                            <p className="text-xs text-slate-600 pt-1 leading-relaxed">
                                                {job.activities}
                                            </p>
                                        )}

                                        {job.reason_for_leaving && (
                                            <p className="text-[11px] text-slate-400 pt-1">
                                                Motivo de separación: {job.reason_for_leaving}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-slate-400 text-sm">
                                No has agregado historial de empleos anteriores.
                            </div>
                        )}
                    </div>

                    {/* CARD 6: ESTUDIOS Y CERTIFICACIONES */}
                    <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
                        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
                            <GraduationCap className="w-5 h-5 text-secondary-600" />
                            <h2 className="font-bold text-slate-900 text-base">Formación Académica y Cursos</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Último Grado de Estudios</span>
                                    <span className="font-bold text-slate-900">{user.education || 'Secundaria'}</span>
                                    <span className="ml-2 text-xs font-medium text-slate-500">({user.education_status || 'Concluido'})</span>
                                </div>
                                <div>
                                    <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Institución Educativa</span>
                                    <span className="font-medium text-slate-800">{user.institution_name || 'No especificada'}</span>
                                </div>
                                <div>
                                    <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Nivel de Inglés</span>
                                    <span className="font-medium text-slate-800">{user.english_level || 'Ninguno'}</span>
                                </div>
                            </div>

                            {/* CERTIFICACIONES LIST */}
                            {certificationsList.length > 0 && certificationsList[0].title_detail && (
                                <div className="pt-3 border-t border-slate-100">
                                    <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Acreditaciones y Cursos</span>
                                    <div className="space-y-2">
                                        {certificationsList.map((cert, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                                                <Award className="w-4 h-4 text-secondary-600 shrink-0" />
                                                <span className="font-bold text-slate-900">{cert.type || 'Certificación'}:</span>
                                                <span>{cert.title_detail}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CARD 7: REFERENCIAS DE CONFIANZA */}
                    <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
                        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
                            <Award className="w-5 h-5 text-secondary-600" />
                            <h2 className="font-bold text-slate-900 text-base">Referencias de Confianza</h2>
                        </div>

                        {referencesList.length > 0 && referencesList[0].ref_name ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {referencesList.map((ref, idx) => (
                                    <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                                        <p className="font-bold text-slate-900 text-sm">{ref.ref_name}</p>
                                        <p className="text-slate-600 font-medium">📞 {formatPhoneNumber(ref.ref_phone)}</p>
                                        {ref.ref_position_company && (
                                            <p className="text-slate-500">🏢 {ref.ref_position_company}</p>
                                        )}
                                        {ref.ref_recommendation_pdf && (
                                            <div className="pt-2">
                                                <a
                                                    href={ref.ref_recommendation_pdf}
                                                    download={`Carta_Recomendacion_${ref.ref_name.replace(/\s+/g, '_')}.pdf`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary-700 hover:text-secondary-800 bg-white border border-secondary-200 px-3 py-1.5 rounded-lg transition-colors shadow-2xs"
                                                >
                                                    <FileText className="w-3.5 h-3.5 text-secondary-600" />
                                                    Descargar Carta PDF
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-slate-400 text-sm">
                                No has ingresado referencias de confianza aún.
                            </div>
                        )}
                    </div>

                </div>

            </div>

            {/* FLOATING MOBILE EDIT BUTTON */}
            <div className="fixed bottom-6 right-6 z-40 md:hidden">
                <Link
                    to="/profile/edit"
                    className="flex items-center gap-2 bg-secondary-600 hover:bg-secondary-700 text-white font-bold px-5 py-3 rounded-full shadow-2xl transition-all active:scale-95"
                >
                    <Edit3 className="w-5 h-5" /> Editar Perfil
                </Link>
            </div>

        </div>
    );
};

export default ProfilePage;
