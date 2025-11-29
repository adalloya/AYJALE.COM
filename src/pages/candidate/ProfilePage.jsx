import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

import Toast from '../../components/Toast';
import PhotoCapture from '../../components/PhotoCapture';

const ProfilePage = () => {
    const { user, updateUser } = useAuth();
    const { updateUserProfile, jobs, applyToJob } = useData();
    const navigate = useNavigate();
    const [toast, setToast] = useState(null); // { message, type }

    // Defensive check: If user is not loaded yet (should be handled by ProtectedRoute, but just in case)
    if (!user) return null;

    const [formData, setFormData] = useState({
        name: '',
        title: '',
        bio: '',
        location: '',
        skills: '',
        address: '',
        age: '',
        civilStatus: 'Soltero/a',
        education: 'Secundaria',
        lastJob: '',
        lastPosition: '',
        lastDuration: '',
        photo: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                title: user.title || '',
                bio: user.bio || '',
                location: user.location || '',
                skills: Array.isArray(user.skills) ? user.skills.join(', ') : (user.skills || ''),
                // Application Fields
                address: user.address || '',
                age: user.age || '',
                civilStatus: user.civilStatus || 'Soltero/a',
                education: user.education || 'Secundaria',
                lastJob: user.lastJob || '',
                lastPosition: user.lastPosition || '',
                lastDuration: user.lastDuration || '',
                photo: user.photo || ''
            });
        }
    }, [user]);

    const [searchParams] = useSearchParams();
    const returnUrl = searchParams.get('returnUrl');
    const applyingToId = searchParams.get('applyingTo');

    const jobToApply = applyingToId ? jobs.find(j => j.id === Number(applyingToId)) : null;

    const [comments, setComments] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s);

        // Exclude address as it doesn't exist in DB schema
        // eslint-disable-next-line no-unused-vars
        const { address, ...rest } = formData;

        const updatedData = {
            ...rest,
            skills: skillsArray
        };

        try {
            // 1. Update profile
            await updateUser(updatedData);
            // Removed redundant updateUserProfile call

            // 2. If applying, submit application
            if (jobToApply) {
                await applyToJob(jobToApply.id, user.id, { ...updatedData, comments });
                setToast({ message: '¡Solicitud enviada con éxito!', type: 'success' });
                setTimeout(() => {
                    navigate(`/jobs/${jobToApply.id}`);
                }, 2000);
            } else {
                setToast({ message: 'Perfil actualizado correctamente', type: 'success' });
                if (returnUrl) {
                    setTimeout(() => {
                        navigate(returnUrl);
                    }, 1500);
                }
            }
        } catch (error) {
            console.error("Error saving profile:", error);
            setToast({ message: 'Error al guardar. Intenta de nuevo.', type: 'error' });
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200 relative">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            {jobToApply ? (
                <div className="mb-6 bg-primary-50 p-4 rounded-lg border border-primary-100">
                    <h1 className="text-2xl font-bold text-primary-800">Finalizar Postulación</h1>
                    <p className="text-primary-600">
                        Revisa tu información y completa tu solicitud para: <span className="font-semibold">{jobToApply.title}</span>
                    </p>
                </div>
            ) : (
                <h1 className="text-2xl font-bold text-slate-900 mb-6">Mi Perfil</h1>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center mb-6">
                    <PhotoCapture
                        initialImage={formData.photo}
                        onCapture={(photoData) => {
                            const newFormData = { ...formData, photo: photoData };
                            setFormData(newFormData);

                            // Auto-save photo to persistence (excluding address)
                            // eslint-disable-next-line no-unused-vars
                            const { address, ...dataToSave } = newFormData;
                            updateUser(dataToSave);
                            // Removed redundant updateUserProfile call
                            setToast({ message: 'Foto guardada correctamente', type: 'success' });
                        }}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Nombre Completo</label>
                    <input
                        type="text"
                        required
                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Título Profesional</label>
                    <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Estado de Residencia</label>
                    <select
                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 bg-white"
                        value={formData.location}
                        onChange={e => setFormData({ ...formData, location: e.target.value })}
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

                <div>
                    <label className="block text-sm font-medium text-slate-700">Bio / Resumen</label>
                    <textarea
                        rows={4}
                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                        value={formData.bio}
                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Habilidades (separadas por coma)</label>
                    <input
                        type="text"
                        placeholder="React, CSS, Diseño..."
                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                        value={formData.skills}
                        onChange={e => setFormData({ ...formData, skills: e.target.value })}
                    />
                </div>

                <div className="border-t pt-8">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Solicitud de empleo</h2>
                    <p className="text-sm text-slate-500 mb-6">
                        Estos datos se guardarán en tu perfil y se usarán para pre-llenar tus futuras solicitudes de empleo.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Edad</label>
                            <input
                                type="number"
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                                value={formData.age}
                                onChange={e => setFormData({ ...formData, age: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Estado Civil</label>
                            <select
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 bg-white"
                                value={formData.civilStatus}
                                onChange={e => setFormData({ ...formData, civilStatus: e.target.value })}
                            >
                                <option value="Soltero/a">Soltero/a</option>
                                <option value="Casado/a">Casado/a</option>
                                <option value="Unión Libre">Unión Libre</option>
                                <option value="Divorciado/a">Divorciado/a</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700">Dirección / Colonia</label>
                            <input
                                type="text"
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700">Nivel de Estudios</label>
                            <select
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 bg-white"
                                value={formData.education}
                                onChange={e => setFormData({ ...formData, education: e.target.value })}
                            >
                                <option value="Primaria">Primaria</option>
                                <option value="Secundaria">Secundaria</option>
                                <option value="Preparatoria / Bachillerato">Preparatoria / Bachillerato</option>
                                <option value="Técnico Superior">Técnico Superior</option>
                                <option value="Licenciatura / Ingeniería">Licenciatura / Ingeniería</option>
                            </select>
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-4">Último Empleo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700">Empresa</label>
                            <input
                                type="text"
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                                value={formData.lastJob}
                                onChange={e => setFormData({ ...formData, lastJob: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Puesto</label>
                            <input
                                type="text"
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                                value={formData.lastPosition}
                                onChange={e => setFormData({ ...formData, lastPosition: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Duración</label>
                            <input
                                type="text"
                                placeholder="Ej. 2 años"
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                                value={formData.lastDuration}
                                onChange={e => setFormData({ ...formData, lastDuration: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {jobToApply && (
                    <div className="border-t pt-6 mt-6">
                        <label className="block text-sm font-medium text-slate-700 mb-2">¿Por qué te interesa este puesto?</label>
                        <textarea
                            rows={3}
                            className="w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                            value={comments}
                            onChange={e => setComments(e.target.value)}
                            placeholder="Cuéntanos brevemente..."
                        />
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    <button
                        type="button"
                        onClick={() => navigate(jobToApply ? `/jobs/${jobToApply.id}` : '/dashboard')}
                        className="bg-white text-slate-700 px-4 py-2 rounded-md text-sm font-medium border border-slate-300 hover:bg-slate-50 mr-3"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="bg-secondary-600 text-white px-6 py-2 rounded-md text-sm font-bold hover:bg-secondary-700 shadow-sm"
                    >
                        {jobToApply ? 'Enviar Solicitud' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfilePage;
