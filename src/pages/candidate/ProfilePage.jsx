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
        lastName: '',
        title: '',
        bio: '',
        location: '',
        municipality: '',
        zipCode: '',
        skills: '',
        birthDate: '',
        civilStatus: 'Soltero/a',
        education: 'Secundaria',
        lastJob: '',
        lastPosition: '',
        lastDuration: '',
        lastActivities: '',
        photo: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                lastName: user.lastName || user.last_name || '',
                title: user.title || '',
                bio: user.bio || '',
                location: user.location || '',
                municipality: user.municipality || user.municipio || '',
                zipCode: user.zipCode || user.postal_code || user.codigo_postal || '',
                skills: Array.isArray(user.skills) ? user.skills.join(', ') : (user.skills || ''),
                birthDate: user.birthDate || user.birth_date || '',
                civilStatus: user.civilStatus || 'Soltero/a',
                education: user.education || 'Secundaria',
                lastJob: user.lastJob || '',
                lastPosition: user.lastPosition || '',
                lastDuration: user.lastDuration || '',
                lastActivities: user.lastActivities || user.last_activities || '',
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

        const updatedData = {
            ...formData,
            last_name: formData.lastName,
            birth_date: formData.birthDate,
            municipio: formData.municipality,
            postal_code: formData.zipCode,
            last_activities: formData.lastActivities,
            skills: skillsArray.join(', ')
        };

        try {
            await updateUser(updatedData);

            if (jobToApply) {
                await applyToJob(jobToApply.id, user.id, { comments });
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
                <div className="flex flex-col items-center mb-6">
                    <p className="text-sm font-medium text-slate-600 mb-3">
                        Sube una foto clara de tu rostro.
                    </p>
                    <PhotoCapture
                        initialImage={formData.photo}
                        onCapture={(photoData) => {
                            const newFormData = { ...formData, photo: photoData };
                            setFormData(newFormData);

                            const dataToSave = {
                                ...newFormData,
                                last_name: newFormData.lastName,
                                birth_date: newFormData.birthDate,
                                municipio: newFormData.municipality,
                                postal_code: newFormData.zipCode,
                                last_activities: newFormData.lastActivities,
                                skills: newFormData.skills
                                    ? newFormData.skills.split(',').map(s => s.trim()).filter(Boolean)
                                    : []
                            };
                            updateUser(dataToSave);

                            setToast({ message: 'Foto guardada correctamente', type: 'success' });
                        }}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Nombre</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Apellidos</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                            value={formData.lastName}
                            onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Último puesto</label>
                    <input
                        type="text"
                        placeholder="Ej. Chofer de reparto, Almacenista, Vendedor, Guardia"
                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <label className="block text-sm font-medium text-slate-700">Municipio / Alcaldía</label>
                        <input
                            type="text"
                            placeholder="Ej. Naucalpan, Guadalajara"
                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                            value={formData.municipality}
                            onChange={e => setFormData({ ...formData, municipality: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Código Postal</label>
                        <input
                            type="text"
                            placeholder="Ej. 53100"
                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                            value={formData.zipCode}
                            onChange={e => setFormData({ ...formData, zipCode: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Cuéntanos tu experiencia</label>
                    <textarea
                        rows={4}
                        placeholder="Ej. Tengo 5 años de experiencia manejando camionetas de 3.5 toneladas, carga y descarga en almacén y atención a clientes."
                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                        value={formData.bio}
                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700">Habilidades principales</label>
                    <input
                        type="text"
                        placeholder="Ej. Carga y Descarga, Licencia Federal, Atención al cliente, Manejo de efectivo"
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
                            <label className="block text-sm font-medium text-slate-700">Fecha de Nacimiento</label>
                            <input
                                type="date"
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 bg-white"
                                value={formData.birthDate}
                                onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
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
                            <label className="block text-sm font-medium text-slate-700">Último grado de estudios</label>
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
                                <option value="Maestría">Maestría</option>
                            </select>
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-4">Tu último jale</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700">Empresa</label>
                            <input
                                type="text"
                                placeholder="Ej. Logística Mexicana S.A. de C.V."
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                                value={formData.lastJob}
                                onChange={e => setFormData({ ...formData, lastJob: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Puesto</label>
                            <input
                                type="text"
                                placeholder="Ej. Chofer repartidor"
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                                value={formData.lastPosition}
                                onChange={e => setFormData({ ...formData, lastPosition: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Duración</label>
                            <select
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 bg-white"
                                value={formData.lastDuration}
                                onChange={e => setFormData({ ...formData, lastDuration: e.target.value })}
                            >
                                <option value="">Selecciona duración</option>
                                <option value="Menos de 6 meses">Menos de 6 meses</option>
                                <option value="De 6 meses a 1 año">De 6 meses a 1 año</option>
                                <option value="1 a 3 años">1 a 3 años</option>
                                <option value="Más de 3 años">Más de 3 años</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700">Actividades realizadas</label>
                            <textarea
                                rows={3}
                                placeholder="Ej. Manejo de inventarios, surtido de pedidos, atención a clientes, manejo de caja."
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                                value={formData.lastActivities}
                                onChange={e => setFormData({ ...formData, lastActivities: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {
                    jobToApply && (
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
                    )
                }

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
