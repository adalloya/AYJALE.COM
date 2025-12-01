import { MapPin, Briefcase, User, Mail, Phone, Lock, Unlock } from 'lucide-react';

const CandidateDetailView = ({ candidate, isUnlocked, onUnlock, unlocking, isMobileDeck = false }) => {
    if (!candidate) return null;

    return (
        <div className={`h-full flex flex-col bg-white ${isMobileDeck ? '' : 'rounded-xl shadow-sm border border-slate-200'}`}>
            {/* Header */}
            <div className={`p-8 border-b border-slate-100 bg-slate-50/50 ${isMobileDeck ? 'pb-6' : ''}`}>
                <div className="flex items-start gap-6">
                    <div className="w-24 h-24 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {candidate.photo ? (
                            <img src={candidate.photo} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-10 h-10 text-slate-300" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold text-slate-900 mb-1 truncate">
                            {isUnlocked ? candidate.name : `${candidate.name.split(' ')[0]} ***`}
                        </h2>
                        <p className="text-lg text-slate-600 font-medium mb-2 truncate">{candidate.title || 'Sin título profesional'}</p>

                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                            <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
                                <span className="truncate">{candidate.location || 'N/A'}</span>
                            </div>
                            <div className="flex items-center">
                                <Briefcase className="w-4 h-4 mr-1.5 flex-shrink-0" />
                                <span className="truncate">{candidate.experience_years ? `${candidate.experience_years} años exp.` : 'Sin experiencia'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Unlock Action - Mobile Deck puts this at bottom usually, but let's keep it consistent for now or move it */}
                <div className="mt-6 flex justify-end">
                    {isUnlocked ? (
                        <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center border border-green-100 w-full justify-center sm:w-auto">
                            <Unlock className="w-4 h-4 mr-2" />
                            Contacto Desbloqueado
                        </div>
                    ) : (
                        <button
                            onClick={() => onUnlock(candidate.id)}
                            disabled={unlocking}
                            className="bg-secondary-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-secondary-700 transition-colors shadow-md flex items-center justify-center w-full sm:w-auto"
                        >
                            {unlocking ? 'Desbloqueando...' : (
                                <>
                                    <Lock className="w-4 h-4 mr-2" />
                                    Desbloquear Contacto
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {/* Contact Info Section */}
                <section className="mb-8">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Información de Contacto</h3>
                    {isUnlocked ? (
                        <div className="grid grid-cols-1 gap-4">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3 shadow-sm flex-shrink-0">
                                    <Mail className="w-5 h-5 text-slate-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-slate-400 font-medium uppercase">Correo Electrónico</p>
                                    <p className="text-sm text-slate-900 font-medium truncate">{candidate.email}</p>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3 shadow-sm flex-shrink-0">
                                    <Phone className="w-5 h-5 text-slate-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-slate-400 font-medium uppercase">Teléfono</p>
                                    <p className="text-sm text-slate-900 font-medium truncate">{candidate.phone || 'No registrado'}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center">
                            <Lock className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                            <h4 className="text-slate-900 font-bold mb-1">Información Protegida</h4>
                            <p className="text-slate-500 text-sm mb-4">Desbloquea el perfil para ver el correo y teléfono del candidato.</p>
                            <button
                                onClick={() => onUnlock(candidate.id)}
                                className="text-secondary-600 font-bold text-sm hover:underline"
                            >
                                Desbloquear ahora
                            </button>
                        </div>
                    )}
                </section>

                <div className="space-y-8">
                    <section>
                        <h3 className="text-lg font-bold text-slate-900 mb-3">Sobre mí</h3>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                            {candidate.bio || 'El candidato no ha agregado una descripción.'}
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-slate-900 mb-3">Experiencia</h3>
                        {/* Display experience if available, otherwise show placeholder or bio if it contains experience info */}
                        {candidate.experience ? (
                            <p className="text-slate-600 leading-relaxed whitespace-pre-line">{candidate.experience}</p>
                        ) : (
                            <p className="text-slate-500 italic">No se ha detallado la experiencia específica en el perfil.</p>
                        )}
                    </section>

                    <section>
                        <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">Habilidades</h3>
                        <div className="flex flex-wrap gap-2">
                            {candidate.skills && Array.isArray(candidate.skills) ? (
                                candidate.skills.map((skill, i) => (
                                    <span key={i} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-medium">
                                        {skill}
                                    </span>
                                ))
                            ) : candidate.skills ? (
                                candidate.skills.split(',').map((skill, i) => (
                                    <span key={i} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-medium">
                                        {skill.trim()}
                                    </span>
                                ))
                            ) : (
                                <span className="text-slate-400 text-sm">No especificadas</span>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default CandidateDetailView;
