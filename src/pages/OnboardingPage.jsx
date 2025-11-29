import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, User, MapPin, Briefcase, FileText, CheckCircle } from 'lucide-react';

const OnboardingPage = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        location: '',
        bio: '',
        skills: '', // For candidate
        industry: '', // For company
        website: '' // For company
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                location: user.location || '',
                bio: user.bio || '',
                title: user.title || '',
                industry: user.industry || '',
                website: user.website || ''
            }));
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const updates = {
                location: formData.location,
                bio: formData.bio,
                onboarding_completed: true // Flag to mark completion
            };

            if (user.role === 'candidate') {
                updates.title = formData.title;
                updates.skills = formData.skills.split(',').map(s => s.trim()).filter(Boolean);
            } else if (user.role === 'company') {
                updates.industry = formData.industry;
                updates.website = formData.website;
            }

            await updateUser(updates);

            if (user.role === 'company') {
                navigate('/post-job');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            console.error("Onboarding error:", error);
            alert("Error al guardar tu perfil. Intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="mx-auto h-12 w-12 bg-secondary-100 rounded-full flex items-center justify-center">
                    {user.role === 'company' ? (
                        <Building2 className="h-6 w-6 text-secondary-600" />
                    ) : (
                        <User className="h-6 w-6 text-secondary-600" />
                    )}
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
                    Completa tu perfil
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    {user.role === 'company'
                        ? 'Cuéntanos más sobre tu empresa para encontrar el mejor talento.'
                        : 'Ayúdanos a encontrar las mejores vacantes para ti.'}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>

                        {/* Common Fields */}
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-slate-700">
                                Ubicación (Ciudad, Estado)
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MapPin className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    name="location"
                                    id="location"
                                    required
                                    className="focus:ring-secondary-500 focus:border-secondary-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md"
                                    placeholder="Ej. Ciudad de México"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="bio" className="block text-sm font-medium text-slate-700">
                                {user.role === 'company' ? 'Descripción de la Empresa' : 'Sobre ti (Bio)'}
                            </label>
                            <div className="mt-1">
                                <textarea
                                    id="bio"
                                    name="bio"
                                    rows={3}
                                    className="shadow-sm focus:ring-secondary-500 focus:border-secondary-500 block w-full sm:text-sm border-slate-300 rounded-md"
                                    placeholder={user.role === 'company' ? 'Somos una empresa líder en...' : 'Soy un profesional apasionado por...'}
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Candidate Specific */}
                        {user.role === 'candidate' && (
                            <>
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-slate-700">
                                        Título Profesional
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Briefcase className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="title"
                                            id="title"
                                            required
                                            className="focus:ring-secondary-500 focus:border-secondary-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md"
                                            placeholder="Ej. Desarrollador Web, Contador"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="skills" className="block text-sm font-medium text-slate-700">
                                        Habilidades (separadas por comas)
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FileText className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="skills"
                                            id="skills"
                                            className="focus:ring-secondary-500 focus:border-secondary-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md"
                                            placeholder="Ej. React, Excel, Ventas"
                                            value={formData.skills}
                                            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Company Specific */}
                        {user.role === 'company' && (
                            <>
                                <div>
                                    <label htmlFor="industry" className="block text-sm font-medium text-slate-700">
                                        Industria / Sector
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Briefcase className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="industry"
                                            id="industry"
                                            required
                                            className="focus:ring-secondary-500 focus:border-secondary-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md"
                                            placeholder="Ej. Tecnología, Construcción"
                                            value={formData.industry}
                                            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="website" className="block text-sm font-medium text-slate-700">
                                        Sitio Web (Opcional)
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-slate-400 sm:text-sm">https://</span>
                                        </div>
                                        <input
                                            type="text"
                                            name="website"
                                            id="website"
                                            className="focus:ring-secondary-500 focus:border-secondary-500 block w-full pl-16 sm:text-sm border-slate-300 rounded-md"
                                            placeholder="tuempresa.com"
                                            value={formData.website}
                                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary-600 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 disabled:opacity-50"
                            >
                                {loading ? 'Guardando...' : 'Completar Registro'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OnboardingPage;
