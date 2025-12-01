import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, User, MapPin, Briefcase, FileText, CheckCircle, ArrowRight, Star, Rocket } from 'lucide-react';

const OnboardingPage = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        location: '',
        bio: '',
        skills: '', // For candidate
    });

    useEffect(() => {
        console.log('OnboardingPage: user changed:', user);
        if (user) {
            console.log('OnboardingPage: user role:', user.role);
            setFormData(prev => ({
                ...prev,
                location: user.location || '',
                bio: user.bio || '',
                title: user.title || '',
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
            };

            if (user.role === 'candidate') {
                updates.title = formData.title;
                updates.skills = formData.skills.split(',').map(s => s.trim()).filter(Boolean); // Send as array
            }

            await updateUser(updates);
            navigate('/dashboard');
        } catch (error) {
            console.error("Onboarding error:", error);
            alert("Error al guardar tu perfil. Intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    // COMPANY WELCOME VIEW
    if (user.role === 'company') {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-secondary-600 px-8 py-12 text-center">
                        <div className="mx-auto h-20 w-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-lg">
                            <Building2 className="h-10 w-10 text-secondary-600" />
                        </div>
                        <h1 className="text-4xl font-extrabold text-white mb-4">
                            ¡Bienvenido a Ayjale!
                        </h1>
                        <p className="text-secondary-100 text-lg max-w-2xl mx-auto">
                            Gracias por confiar en nosotros.
                        </p>
                    </div>

                    <div className="px-8 py-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Siguientes pasos</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="flex flex-col items-center p-6 bg-slate-50 rounded-xl border-2 border-slate-200 hover:border-secondary-500 hover:bg-white transition-all group"
                            >
                                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                                    <Building2 className="h-6 w-6 text-blue-600 group-hover:text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Completar Perfil</h3>
                                <p className="text-sm text-slate-500 text-center">
                                    Configura la información de tu empresa
                                </p>
                            </button>

                            <button
                                onClick={() => navigate('/post-job')}
                                className="flex flex-col items-center p-6 bg-slate-50 rounded-xl border-2 border-slate-200 hover:border-secondary-500 hover:bg-white transition-all group"
                            >
                                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-600 transition-colors">
                                    <Briefcase className="h-6 w-6 text-green-600 group-hover:text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Publicar Vacante</h3>
                                <p className="text-sm text-slate-500 text-center">
                                    Crea tu primera oferta de empleo
                                </p>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // CANDIDATE ONBOARDING FORM (Unchanged logic, just simplified render)
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="mx-auto h-12 w-12 bg-secondary-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-secondary-600" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
                    Completa tu perfil
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    Ayúdanos a encontrar las mejores vacantes para ti.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-slate-700">
                                Estado de Residencia
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">

                                <select
                                    name="location"
                                    id="location"
                                    required
                                    className="focus:ring-secondary-500 focus:border-secondary-500 block w-full sm:text-sm border-slate-300 rounded-md bg-white py-2 px-3"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                >
                                    <option value="">Selecciona un estado</option>
                                    <option value="Aguascalientes">Aguascalientes</option>
                                    <option value="Baja California">Baja California</option>
                                    <option value="Baja California Sur">Baja California Sur</option>
                                    <option value="Campeche">Campeche</option>
                                    <option value="Chiapas">Chiapas</option>
                                    <option value="Chihuahua">Chihuahua</option>
                                    <option value="Ciudad de México">Ciudad de México</option>
                                    <option value="Coahuila">Coahuila</option>
                                    <option value="Colima">Colima</option>
                                    <option value="Durango">Durango</option>
                                    <option value="Estado de México">Estado de México</option>
                                    <option value="Guanajuato">Guanajuato</option>
                                    <option value="Guerrero">Guerrero</option>
                                    <option value="Hidalgo">Hidalgo</option>
                                    <option value="Jalisco">Jalisco</option>
                                    <option value="Michoacán">Michoacán</option>
                                    <option value="Morelos">Morelos</option>
                                    <option value="Nayarit">Nayarit</option>
                                    <option value="Nuevo León">Nuevo León</option>
                                    <option value="Oaxaca">Oaxaca</option>
                                    <option value="Puebla">Puebla</option>
                                    <option value="Querétaro">Querétaro</option>
                                    <option value="Quintana Roo">Quintana Roo</option>
                                    <option value="San Luis Potosí">San Luis Potosí</option>
                                    <option value="Sinaloa">Sinaloa</option>
                                    <option value="Sonora">Sonora</option>
                                    <option value="Tabasco">Tabasco</option>
                                    <option value="Tamaulipas">Tamaulipas</option>
                                    <option value="Tlaxcala">Tlaxcala</option>
                                    <option value="Veracruz">Veracruz</option>
                                    <option value="Yucatán">Yucatán</option>
                                    <option value="Zacatecas">Zacatecas</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="bio" className="block text-sm font-medium text-slate-700">
                                Sobre ti (Bio)
                            </label>
                            <div className="mt-1">
                                <textarea
                                    id="bio"
                                    name="bio"
                                    rows={3}
                                    className="shadow-sm focus:ring-secondary-500 focus:border-secondary-500 block w-full sm:text-sm border-slate-300 rounded-md"
                                    placeholder="Soy un profesional apasionado por..."
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                />
                            </div>
                        </div>

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
