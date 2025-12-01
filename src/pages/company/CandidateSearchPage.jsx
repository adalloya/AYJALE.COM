import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Search, MapPin, Briefcase, User, ChevronRight, Unlock } from 'lucide-react';
import UnlockContactModal from '../../components/company/UnlockContactModal';
import CandidateDetailView from '../../components/company/CandidateDetailView';
import MobileCandidateDeck from '../../components/company/MobileCandidateDeck';

const CandidateSearchPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { users, contactUnlocks, unlockCandidateContact, adminGetUsers } = useData();
    const { user } = useAuth();
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [unlocking, setUnlocking] = useState(false);

    // Modal State
    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [candidateToUnlock, setCandidateToUnlock] = useState(null);

    // Mobile State
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
            setLoading(true);
            try {
                const allProfiles = await adminGetUsers();
                const candidateProfiles = allProfiles.filter(p => p.role === 'candidate');
                setCandidates(candidateProfiles);

                if (candidateProfiles.length > 0 && window.innerWidth >= 1024) {
                    setSelectedCandidate(candidateProfiles[0]);
                }
            } catch (error) {
                console.error("Error loading candidates:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.role === 'company') {
            loadCandidates();
        }
    }, [user, adminGetUsers]);

    const filteredCandidates = candidates.filter(c => {
        const term = searchTerm.toLowerCase();
        return (
            (c.name && c.name.toLowerCase().includes(term)) ||
            (c.title && c.title.toLowerCase().includes(term)) ||
            (c.location && c.location.toLowerCase().includes(term)) ||
            (c.bio && c.bio.toLowerCase().includes(term)) ||
            (c.skills && Array.isArray(c.skills) && c.skills.some(s => s.toLowerCase().includes(term))) ||
            (c.skills && typeof c.skills === 'string' && c.skills.toLowerCase().includes(term))
        );
    });

    const isUnlocked = (candidateId) => {
        return contactUnlocks.some(u => u.candidate_id === candidateId);
    };

    const handleUnlockClick = (candidateId) => {
        const candidate = candidates.find(c => c.id === candidateId);
        if (candidate) {
            setCandidateToUnlock(candidate);
            setShowUnlockModal(true);
        }
    };

    const confirmUnlock = async () => {
        if (!candidateToUnlock || unlocking) return;

        setUnlocking(true);
        try {
            await unlockCandidateContact(candidateToUnlock.id);
            // alert("Datos de contacto desbloqueados exitosamente."); // Removed alert as requested, modal closes and UI updates
            setShowUnlockModal(false);
            setCandidateToUnlock(null);
        } catch (error) {
            alert("Error al desbloquear datos.");
        } finally {
            setUnlocking(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Cargando candidatos...</div>;
    }

    // Mobile View: Show Deck
    if (isMobile) {
        // Filter candidates for the deck based on search
        const deckCandidates = filteredCandidates.length > 0 ? filteredCandidates : candidates;

        return (
            <>
                <MobileCandidateDeck
                    candidates={deckCandidates}
                    initialCandidateId={selectedCandidate?.id}
                    onBack={() => navigate('/dashboard')}
                    onUnlock={handleUnlockClick}
                    isUnlocked={isUnlocked}
                    unlocking={unlocking}
                    onCandidateChange={setSelectedCandidate}
                />
                <UnlockContactModal
                    isOpen={showUnlockModal}
                    onClose={() => setShowUnlockModal(false)}
                    onConfirm={confirmUnlock}
                    candidateName={candidateToUnlock?.name}
                    companyName={user?.name || 'Tu Empresa'}
                    loading={unlocking}
                />
            </>
        );
    }

    // Desktop View
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-64px)] flex flex-col">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Base de Datos de Candidatos</h1>
                    <p className="text-slate-500">Explora y conecta con talento para tus vacantes.</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, puesto, ubicación, experiencia o habilidades..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                {/* List */}
                <div className="lg:col-span-4 overflow-y-auto custom-scrollbar pr-2 pb-20">
                    {filteredCandidates.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200">
                            No se encontraron candidatos.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredCandidates.map(candidate => {
                                const active = selectedCandidate?.id === candidate.id;
                                const unlocked = isUnlocked(candidate.id);
                                return (
                                    <div
                                        key={candidate.id}
                                        onClick={() => setSelectedCandidate(candidate)}
                                        className={`bg-white p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${active ? 'border-orange-500 ring-1 ring-orange-500' : 'border-slate-200 hover:border-orange-300'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                {candidate.photo ? (
                                                    <img src={candidate.photo} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-6 h-6 text-slate-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <h3 className={`font-bold text-sm truncate ${active ? 'text-secondary-700' : 'text-slate-900'}`}>
                                                        {unlocked ? candidate.name : `${candidate.name.split(' ')[0]} ***`}
                                                    </h3>
                                                    {unlocked && <Unlock className="w-3 h-3 text-green-500" />}
                                                </div>
                                                <p className="text-xs text-slate-500 truncate mb-1">{candidate.title || 'Sin título'}</p>
                                                <div className="flex items-center text-xs text-slate-400">
                                                    <MapPin className="w-3 h-3 mr-1" />
                                                    {candidate.location || 'Ubicación no especificada'}
                                                </div>
                                            </div>
                                            <ChevronRight className={`w-4 h-4 self-center ${active ? 'text-orange-500' : 'text-slate-300'}`} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Detail */}
                <div className="hidden lg:block lg:col-span-8 h-full overflow-hidden">
                    {selectedCandidate ? (
                        <CandidateDetailView
                            candidate={selectedCandidate}
                            isUnlocked={isUnlocked(selectedCandidate.id)}
                            onUnlock={handleUnlockClick}
                            unlocking={unlocking}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-400 bg-white rounded-xl border border-slate-200">
                            Selecciona un candidato para ver su perfil.
                        </div>
                    )}
                </div>
            </div>

            <UnlockContactModal
                isOpen={showUnlockModal}
                onClose={() => setShowUnlockModal(false)}
                onConfirm={confirmUnlock}
                candidateName={candidateToUnlock?.name}
                companyName={user?.name || 'Tu Empresa'}
                loading={unlocking}
            />
        </div>
    );
};

export default CandidateSearchPage;
