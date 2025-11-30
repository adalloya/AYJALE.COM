import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, MapPin, Briefcase, User, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import AvatarPlaceholder from '../../components/AvatarPlaceholder';

const JobApplicantsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { jobs, applications, users, updateApplicationStatus } = useData();
    const { user: currentUser } = useAuth();
    const [selectedCandidate, setSelectedCandidate] = useState(null);

    const handleStatusChange = (newStatus) => {
        if (selectedCandidate) {
            updateApplicationStatus(selectedCandidate.id, newStatus);
            // Update local state to reflect change immediately in UI
            setSelectedCandidate(prev => ({ ...prev, status: newStatus }));
        }
    };

    const job = jobs.find(j => j.id === Number(id));

    // Security check: Ensure the job belongs to the current company
    if (!job || (currentUser.role === 'company' && job.company_id !== currentUser.id)) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-bold text-slate-900">Acceso Denegado</h2>
                <button onClick={() => navigate('/dashboard')} className="mt-4 text-primary-600 hover:underline">
                    Volver al Dashboard
                </button>
            </div>
        );
    }

    const jobApplications = applications.filter(a => a.job_id === Number(id));

    // Enrich applications with user data
    const candidates = jobApplications.map(app => {
        const candidateUser = users.find(u => u.id === app.candidate_id);
        return {
            ...app,
            user: candidateUser
        };
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-full">
                    <ArrowLeft className="w-6 h-6 text-slate-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Candidatos: {job.title}</h1>
                    <p className="text-slate-500">{candidates.length} postulaciones recibidas</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* List of Candidates */}
                <div className="lg:col-span-1 space-y-4">
                    {candidates.map(candidate => (
                        <div
                            key={candidate.id}
                            onClick={() => setSelectedCandidate(candidate)}
                            className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedCandidate?.id === candidate.id ? 'bg-primary-50 border-primary-500 ring-1 ring-primary-500' : 'bg-white border-slate-200 hover:border-primary-300'}`}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 flex-shrink-0">
                                    {candidate.user?.photo ? (
                                        <img
                                            src={candidate.user.photo}
                                            alt={candidate.user.name}
                                            className="w-full h-full rounded-full object-cover border border-slate-200"
                                        />
                                    ) : (
                                        <AvatarPlaceholder className="w-full h-full" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">{candidate.user?.name || 'Usuario Desconocido'}</h3>
                                    <p className="text-sm text-slate-500">{candidate.user?.title || 'Sin título'}</p>
                                </div>
                            </div>
                            <div className="mt-3 text-xs text-slate-400">
                                Postulado: {new Date(candidate.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                    {candidates.length === 0 && (
                        <div className="text-center py-8 bg-white rounded-lg border border-dashed border-slate-300">
                            <p className="text-slate-500">Aún no hay candidatos.</p>
                        </div>
                    )}
                </div>

                {/* Candidate Details */}
                <div className="lg:col-span-2">
                    {selectedCandidate ? (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-start space-x-4">
                                    <div className="w-20 h-20 flex-shrink-0">
                                        {selectedCandidate.user?.photo ? (
                                            <img
                                                src={selectedCandidate.user.photo}
                                                alt={selectedCandidate.user.name}
                                                className="w-full h-full rounded-full object-cover border-2 border-slate-100 shadow-sm"
                                            />
                                        ) : (
                                            <AvatarPlaceholder className="w-full h-full" />
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900">{selectedCandidate.user?.name}</h2>
                                        <p className="text-lg text-primary-600">{selectedCandidate.user?.title}</p>
                                        <div className="flex items-center mt-2 text-slate-500 text-sm">
                                            <MapPin className="w-4 h-4 mr-1" />
                                            {selectedCandidate.user?.location || 'Ubicación no especificada'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <select
                                        value={selectedCandidate.status}
                                        onChange={(e) => handleStatusChange(e.target.value)}
                                        className={`text-sm font-medium rounded-full px-3 py-1 border-0 cursor-pointer focus:ring-2 focus:ring-offset-1 focus:ring-primary-500
                                            ${selectedCandidate.status === 'applied' ? 'bg-blue-100 text-blue-800' : ''}
                                            ${selectedCandidate.status === 'reviewing' ? 'bg-yellow-100 text-yellow-800' : ''}
                                            ${selectedCandidate.status === 'interviewing' ? 'bg-purple-100 text-purple-800' : ''}
                                            ${selectedCandidate.status === 'offer' ? 'bg-orange-100 text-orange-800' : ''}
                                            ${selectedCandidate.status === 'hired' ? 'bg-green-100 text-green-800' : ''}
                                            ${selectedCandidate.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                                        `}
                                    >
                                        <option value="applied">Postulado</option>
                                        <option value="reviewing">En Revisión</option>
                                        <option value="interviewing">Entrevista</option>
                                        <option value="offer">Oferta</option>
                                        <option value="hired">Contratado</option>
                                        <option value="rejected">Rechazado</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-2">Información de Contacto</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-slate-500 block">Email:</span>
                                            <span className="text-slate-900">{selectedCandidate.user?.email}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 block">Teléfono:</span>
                                            <span className="text-slate-900">{selectedCandidate.user?.phone || 'No disponible'}</span>
                                        </div>
                                    </div>
                                </div>

                                {selectedCandidate.user?.bio && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-2">Perfil Profesional</h3>
                                        <p className="text-slate-600 text-sm leading-relaxed">{selectedCandidate.user.bio}</p>
                                    </div>
                                )}

                                {selectedCandidate.user?.skills && selectedCandidate.user.skills.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-2">Habilidades</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedCandidate.user.skills.map((skill, index) => (
                                                <span key={index} className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-2">Experiencia Reciente</h3>
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                        <div className="flex items-center mb-2">
                                            <Briefcase className="w-4 h-4 text-slate-400 mr-2" />
                                            <span className="font-medium text-slate-900">{selectedCandidate.user?.lastJob || 'No especificado'}</span>
                                        </div>
                                        <div className="text-sm text-slate-600 ml-6">
                                            <p>{selectedCandidate.user?.lastPosition}</p>
                                            <p className="text-slate-400 text-xs mt-1">{selectedCandidate.user?.lastDuration}</p>
                                        </div>
                                    </div>
                                </div>

                                {selectedCandidate.comments && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-2">Mensaje del Candidato</h3>
                                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm text-slate-700 italic">
                                            "{selectedCandidate.comments}"
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-50 rounded-xl border border-dashed border-slate-300 h-full flex items-center justify-center p-12 text-center">
                            <div>
                                <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-slate-900">Selecciona un candidato</h3>
                                <p className="text-slate-500 mt-1">Haz clic en la lista de la izquierda para ver los detalles completos.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JobApplicantsPage;
