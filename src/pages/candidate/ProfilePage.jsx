import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Plus, Trash2, FileText, Check } from 'lucide-react';

import Toast from '../../components/Toast';
import PhotoCapture from '../../components/PhotoCapture';

const ProfilePage = () => {
    const { user, updateUser } = useAuth();
    const { jobs, applyToJob } = useData();
    const navigate = useNavigate();
    const [toast, setToast] = useState(null);

    if (!user) return null;

    const [formData, setFormData] = useState({
        name: '',
        first_last_name: '',
        second_last_name: '',
        photo: '',
        phone: '',
        email: '',
        curp: '',
        rfc: '',
        nss: '',
        location: '',
        municipality: '',
        zipCode: '',
        title: '',
        experience_years: '1 a 3 años',
        skills: '',
        driver_license: 'No tengo',
        languages_tools: '',
        education: 'Secundaria',
        education_status: 'Concluido',
        work_history: [
            {
                company: '',
                position: '',
                duration: '',
                activities: '',
                reason_for_leaving: '',
                salary: ''
            }
        ],
        ref_name: '',
        ref_phone: '',
        ref_position_company: '',
        ref_recommendation_pdf: '',
        expected_salary: '',
        start_availability: 'Inmediata',
        shift_availability: 'Tiempo completo',
        travel_availability: 'No'
    });

    const [expandedSections, setExpandedSections] = useState({
        s1: true,
        s2: false,
        s3: false,
        s4: false,
        s5: false,
        s6: false,
        s7: false
    });

    useEffect(() => {
        if (user) {
            let initialWorkHistory = user.work_history;
            if (!Array.isArray(initialWorkHistory) || initialWorkHistory.length === 0) {
                if (user.lastJob || user.last_job) {
                    initialWorkHistory = [{
                        company: user.lastJob || user.last_job || '',
                        position: user.lastPosition || user.last_position || '',
                        duration: user.lastDuration || user.last_duration || '',
                        activities: user.lastActivities || user.last_activities || '',
                        reason_for_leaving: '',
                        salary: ''
                    }];
                } else {
                    initialWorkHistory = [{
                        company: '',
                        position: '',
                        duration: '',
                        activities: '',
                        reason_for_leaving: '',
                        salary: ''
                    }];
                }
            }

            setFormData({
                name: user.name || '',
                first_last_name: user.first_last_name || user.lastName || user.last_name || '',
                second_last_name: user.second_last_name || '',
                photo: user.photo || '',
                phone: user.phone || user.phone_number || '',
                email: user.email || '',
                curp: user.curp || '',
                rfc: user.rfc || '',
                nss: user.nss || '',
                location: user.location || '',
                municipality: user.municipality || user.municipio || '',
                zipCode: user.zipCode || user.postal_code || '',
                title: user.title || '',
                experience_years: user.experience_years || '1 a 3 años',
                skills: Array.isArray(user.skills) ? user.skills.join(', ') : (user.skills || ''),
                driver_license: user.driver_license || 'No tengo',
                languages_tools: user.languages_tools || '',
                education: user.education || 'Secundaria',
                education_status: user.education_status || 'Concluido',
                work_history: initialWorkHistory,
                ref_name: user.ref_name || '',
                ref_phone: user.ref_phone || '',
                ref_position_company: user.ref_position_company || '',
                ref_recommendation_pdf: user.ref_recommendation_pdf || '',
                expected_salary: user.expected_salary || '',
                start_availability: user.start_availability || 'Inmediata',
                shift_availability: user.shift_availability || 'Tiempo completo',
                travel_availability: user.travel_availability || 'No'
            });
        }
    }, [user]);

    const [searchParams] = useSearchParams();
    const returnUrl = searchParams.get('returnUrl');
    const applyingToId = searchParams.get('applyingTo');

    const jobToApply = applyingToId ? jobs.find(j => j.id === Number(applyingToId)) : null;
    const [comments, setComments] = useState('');

    const checkSectionStatus = (sectionNum, data = formData) => {
        switch (sectionNum) {
            case 1:
                return Boolean(data.name && data.first_last_name && data.phone && data.email && data.curp);
            case 2:
                return Boolean(data.location && data.municipality && data.zipCode);
            case 3:
                return Boolean(data.title && data.skills && data.experience_years);
            case 4:
                return Boolean(data.education && data.education_status);
            case 5:
                return Boolean(data.work_history && data.work_history.length > 0 && data.work_history[0].company && data.work_history[0].position);
            case 6:
                return Boolean(data.ref_name && data.ref_phone);
            case 7:
                return Boolean(data.expected_salary && data.start_availability && data.shift_availability);
            default:
                return false;
        }
    };

    const getCompletionPercentage = () => {
        let completedSections = 0;
        for (let i = 1; i <= 7; i++) {
            if (checkSectionStatus(i)) completedSections++;
        }
        return Math.round((completedSections / 7) * 100);
    };

    const completionPercentage = getCompletionPercentage();

    const toggleSection = (sectionKey) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionKey]: !prev[sectionKey]
        }));
    };

    const handleWorkHistoryChange = (index, field, value) => {
        const updated = [...formData.work_history];
        updated[index] = { ...updated[index], [field]: value };
        setFormData({ ...formData, work_history: updated });
    };

    const addWorkExperience = () => {
        setFormData({
            ...formData,
            work_history: [
                ...formData.work_history,
                { company: '', position: '', duration: '', activities: '', reason_for_leaving: '', salary: '' }
            ]
        });
    };

    const removeWorkExperience = (index) => {
        if (formData.work_history.length === 1) return;
        const updated = formData.work_history.filter((_, i) => i !== index);
        setFormData({ ...formData, work_history: updated });
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            setToast({ message: 'Por favor selecciona un archivo PDF', type: 'error' });
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData({ ...formData, ref_recommendation_pdf: reader.result });
            setToast({ message: 'Carta de recomendación cargada', type: 'success' });
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const skillsArray = typeof formData.skills === 'string'
            ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
            : formData.skills;

        const updatedData = {
            ...formData,
            last_name: formData.first_last_name,
            birth_date: formData.birthDate,
            municipio: formData.municipality,
            postal_code: formData.zipCode,
            last_activities: formData.work_history[0]?.activities || '',
            last_job: formData.work_history[0]?.company || '',
            last_position: formData.work_history[0]?.position || '',
            last_duration: formData.work_history[0]?.duration || '',
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
        <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200 relative">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {jobToApply ? (
                <div className="mb-8 bg-primary-50 p-4 sm:p-6 rounded-xl border border-primary-100">
                    <h1 className="text-2xl font-bold text-primary-800">Finalizar Postulación</h1>
                    <p className="text-primary-600 mt-1">
                        Revisa tu información y completa tu solicitud para: <span className="font-semibold">{jobToApply.title}</span>
                    </p>
                </div>
            ) : (
                <div className="mb-8 pb-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Mi Perfil de Candidato</h1>
                        <p className="text-slate-500 text-sm mt-1">Completa tu información para postularte a las mejores vacantes.</p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center gap-4 min-w-[260px]">
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-semibold text-slate-700">Completitud</span>
                                <span className="text-xs font-bold text-slate-900">{completionPercentage}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                <div
                                    className={`h-2 rounded-full transition-all duration-500 ${completionPercentage === 100 ? 'bg-green-500' : 'bg-secondary-600'
                                        }`}
                                    style={{ width: `${completionPercentage}%` }}
                                />
                            </div>
                        </div>
                        {completionPercentage === 100 ? (
                            <span className="inline-flex items-center text-xs font-bold text-green-700 bg-green-100 border border-green-200 px-2.5 py-1 rounded-full whitespace-nowrap">
                                <Check className="w-3.5 h-3.5 mr-1" /> Completo
                            </span>
                        ) : (
                            <span className="inline-flex items-center text-xs font-semibold text-amber-800 bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-full whitespace-nowrap">
                                En progreso
                            </span>
                        )}
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* ACCORDION 1: IDENTIFICACIÓN Y CONTACTO */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <button
                        type="button"
                        onClick={() => toggleSection('s1')}
                        className="w-full bg-slate-50/80 p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-100/80 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-900 text-base sm:text-lg">1. Identificación y Contacto</span>
                            {checkSectionStatus(1) ? (
                                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-200">
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Completo
                                </span>
                            ) : (
                                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                    <AlertCircle className="w-3.5 h-3.5 mr-1" /> Incompleto
                                </span>
                            )}
                        </div>
                        {expandedSections.s1 ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                    </button>

                    {expandedSections.s1 && (
                        <div className="p-5 sm:p-6 space-y-6 border-t border-slate-200 bg-white">
                            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-xs font-semibold text-slate-500 mb-3">Sube tu foto</p>
                                <PhotoCapture
                                    initialImage={formData.photo}
                                    onCapture={(photoData) => {
                                        setFormData(prev => ({ ...prev, photo: photoData }));
                                        updateUser({ photo: photoData });
                                        setToast({ message: 'Foto actualizada correctamente', type: 'success' });
                                    }}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Nombre *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej. Juan"
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs focus:border-secondary-500 focus:ring-secondary-500 text-sm border p-2.5"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Primer Apellido *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej. Pérez"
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs focus:border-secondary-500 focus:ring-secondary-500 text-sm border p-2.5"
                                        value={formData.first_last_name}
                                        onChange={e => setFormData({ ...formData, first_last_name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Segundo Apellido</label>
                                    <input
                                        type="text"
                                        placeholder="Ej. López"
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs focus:border-secondary-500 focus:ring-secondary-500 text-sm border p-2.5"
                                        value={formData.second_last_name}
                                        onChange={e => setFormData({ ...formData, second_last_name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Teléfono o WhatsApp de contacto *</label>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="Ej. 9991234567"
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs focus:border-secondary-500 focus:ring-secondary-500 text-sm border p-2.5"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Correo electrónico *</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="Ej. correo@ejemplo.com"
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs focus:border-secondary-500 focus:ring-secondary-500 text-sm border p-2.5"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">CURP *</label>
                                    <input
                                        type="text"
                                        placeholder="Ej. ABCD901234HDFXYZ01"
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs focus:border-secondary-500 focus:ring-secondary-500 text-sm border p-2.5 uppercase"
                                        value={formData.curp}
                                        onChange={e => setFormData({ ...formData, curp: e.target.value.toUpperCase() })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">RFC con homoclave</label>
                                    <input
                                        type="text"
                                        placeholder="Ej. ABCD901234XYZ"
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs focus:border-secondary-500 focus:ring-secondary-500 text-sm border p-2.5 uppercase"
                                        value={formData.rfc}
                                        onChange={e => setFormData({ ...formData, rfc: e.target.value.toUpperCase() })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Número de Seguridad Social (NSS)</label>
                                    <input
                                        type="text"
                                        placeholder="Ej. 12345678901"
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs focus:border-secondary-500 focus:ring-secondary-500 text-sm border p-2.5"
                                        value={formData.nss}
                                        onChange={e => setFormData({ ...formData, nss: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ACCORDION 2: ZONA DE RESIDENCIA */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <button
                        type="button"
                        onClick={() => toggleSection('s2')}
                        className="w-full bg-slate-50/80 p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-100/80 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-900 text-base sm:text-lg">2. Zona de Residencia</span>
                            {checkSectionStatus(2) ? (
                                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-200">
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Completo
                                </span>
                            ) : (
                                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                    <AlertCircle className="w-3.5 h-3.5 mr-1" /> Incompleto
                                </span>
                            )}
                        </div>
                        {expandedSections.s2 ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                    </button>

                    {expandedSections.s2 && (
                        <div className="p-5 sm:p-6 space-y-4 border-t border-slate-200 bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Estado de residencia *</label>
                                    <select
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs focus:border-secondary-500 focus:ring-secondary-500 text-sm border p-2.5 bg-white"
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    >
                                        <option value="">Selecciona un Estado...</option>
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
                                    <label className="block text-sm font-medium text-slate-700">Municipio o alcaldía *</label>
                                    <input
                                        type="text"
                                        placeholder="Ej. Mérida"
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs focus:border-secondary-500 focus:ring-secondary-500 text-sm border p-2.5"
                                        value={formData.municipality}
                                        onChange={e => setFormData({ ...formData, municipality: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Código postal *</label>
                                    <input
                                        type="text"
                                        placeholder="Ej. 97100"
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs focus:border-secondary-500 focus:ring-secondary-500 text-sm border p-2.5"
                                        value={formData.zipCode}
                                        onChange={e => setFormData({ ...formData, zipCode: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ACCORDION 3: TU OFICIO Y HABILIDADES */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <button
                        type="button"
                        onClick={() => toggleSection('s3')}
                        className="w-full bg-slate-50/80 p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-100/80 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-900 text-base sm:text-lg">3. Tu Oficio y Habilidades</span>
                            {checkSectionStatus(3) ? (
                                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-200">
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Completo
                                </span>
                            ) : (
                                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                    <AlertCircle className="w-3.5 h-3.5 mr-1" /> Incompleto
                                </span>
                            )}
                        </div>
                        {expandedSections.s3 ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                    </button>

                    {expandedSections.s3 && (
                        <div className="p-5 sm:p-6 space-y-4 border-t border-slate-200 bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Puesto o oficio principal deseado *</label>
                                    <input
                                        type="text"
                                        placeholder="Ej. Chofer de reparto"
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs focus:border-secondary-500 focus:ring-secondary-500 text-sm border p-2.5"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Años de experiencia general *</label>
                                    <select
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs focus:border-secondary-500 focus:ring-secondary-500 text-sm border p-2.5 bg-white"
                                        value={formData.experience_years}
                                        onChange={e => setFormData({ ...formData, experience_years: e.target.value })}
                                    >
                                        <option value="Sin experiencia">Sin experiencia</option>
                                        <option value="Menos de 1 año">Menos de 1 año</option>
                                        <option value="1 a 3 años">1 a 3 años</option>
                                        <option value="3 a 5 años">3 a 5 años</option>
                                        <option value="Más de 5 años">Más de 5 años</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">Habilidades técnicas o destrezas *</label>
                                <input
                                    type="text"
                                    placeholder="Ej. Manejo de montacargas, Control de inventarios"
                                    className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs focus:border-secondary-500 focus:ring-secondary-500 text-sm border p-2.5"
                                    value={formData.skills}
                                    onChange={e => setFormData({ ...formData, skills: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Licencias de manejo vigentes</label>
                                    <select
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs focus:border-secondary-500 focus:ring-secondary-500 text-sm border p-2.5 bg-white"
                                        value={formData.driver_license}
                                        onChange={e => setFormData({ ...formData, driver_license: e.target.value })}
                                    >
                                        <option value="No tengo">No tengo</option>
                                        <option value="Licencia A">Licencia A</option>
                                        <option value="Licencia B">Licencia B</option>
                                        <option value="Licencia C">Licencia C</option>
                                        <option value="Licencia D">Licencia D</option>
                                        <option value="Licencia E">Licencia E</option>
                                        <option value="Licencia Federal Tipo A">Licencia Federal Tipo A</option>
                                        <option value="Licencia Federal Tipo B">Licencia Federal Tipo B</option>
                                        <option value="Licencia Federal Tipo C">Licencia Federal Tipo C</option>
                                        <option value="Licencia Federal Tipo E">Licencia Federal Tipo E</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Idiomas o herramientas especializadas</label>
                                    <input
                                        type="text"
                                        placeholder="Ej. Excel básico, Inglés técnico"
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs focus:border-secondary-500 focus:ring-secondary-500 text-sm border p-2.5"
                                        value={formData.languages_tools}
                                        onChange={e => setFormData({ ...formData, languages_tools: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ACCORDION 4: NIVEL DE ESTUDIOS */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <button
                        type="button"
                        onClick={() => toggleSection('s4')}
                        className="w-full bg-slate-50/80 p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-100/80 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-900 text-base sm:text-lg">4. Nivel de Estudios</span>
                            {checkSectionStatus(4) ? (
                                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-200">
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Completo
                                </span>
                            ) : (
                                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                    <AlertCircle className="w-3.5 h-3.5 mr-1" /> Incompleto
                                </span>
                            )}
                        </div>
                        {expandedSections.s4 ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                    </button>

                    {expandedSections.s4 && (
                        <div className="p-5 sm:p-6 space-y-4 border-t border-slate-200 bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Último grado escolar alcanzado *</label>
                                    <select
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs focus:border-secondary-500 focus:ring-secondary-500 text-sm border p-2.5 bg-white"
                                        value={formData.education}
                                        onChange={e => setFormData({ ...formData, education: e.target.value })}
                                    >
                                        <option value="Primaria">Primaria</option>
                                        <option value="Secundaria">Secundaria</option>
                                        <option value="Preparatoria / Bachillerato">Preparatoria / Bachillerato</option>
                                        <option value="Carrera técnica">Carrera técnica</option>
                                        <option value="Licenciatura">Licenciatura</option>
                                        <option value="Posgrado">Posgrado</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Estatus *</label>
                                    <select
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs focus:border-secondary-500 focus:ring-secondary-500 text-sm border p-2.5 bg-white"
                                        value={formData.education_status}
                                        onChange={e => setFormData({ ...formData, education_status: e.target.value })}
                                    >
                                        <option value="Concluido">Concluido</option>
                                        <option value="Trunco">Trunco</option>
                                        <option value="En curso">En curso</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ACCORDION 5: TU EXPERIENCIA (DINÁMICA MULTI-EMPLEO) */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <button
                        type="button"
                        onClick={() => toggleSection('s5')}
                        className="w-full bg-slate-50/80 p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-100/80 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-900 text-base sm:text-lg">5. Tu Experiencia</span>
                            {checkSectionStatus(5) ? (
                                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-200">
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Completo
                                </span>
                            ) : (
                                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                    <AlertCircle className="w-3.5 h-3.5 mr-1" /> Incompleto
                                </span>
                            )}
                        </div>
                        {expandedSections.s5 ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                    </button>

                    {expandedSections.s5 && (
                        <div className="p-5 sm:p-6 space-y-6 border-t border-slate-200 bg-white">
                            {formData.work_history.map((exp, index) => (
                                <div key={index} className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/40 relative space-y-4">
                                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                                        <h4 className="font-bold text-slate-800 text-sm">
                                            {index === 0 ? 'Último empleo o empleo actual' : `Empleo anterior #${index + 1}`}
                                        </h4>
                                        {formData.work_history.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeWorkExperience(index)}
                                                className="text-red-600 hover:text-red-800 text-xs font-semibold flex items-center gap-1"
                                            >
                                                <Trash2 className="w-4 h-4" /> Eliminar
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700">Nombre de la empresa anterior o actual *</label>
                                            <input
                                                type="text"
                                                placeholder="Ej. Transportes del Norte"
                                                className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs text-sm border p-2.5"
                                                value={exp.company}
                                                onChange={e => handleWorkHistoryChange(index, 'company', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700">Puesto desempeñado *</label>
                                            <input
                                                type="text"
                                                placeholder="Ej. Ayudante General"
                                                className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs text-sm border p-2.5"
                                                value={exp.position}
                                                onChange={e => handleWorkHistoryChange(index, 'position', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700">Duración o tiempo laborado</label>
                                            <select
                                                className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs text-sm border p-2.5 bg-white"
                                                value={exp.duration}
                                                onChange={e => handleWorkHistoryChange(index, 'duration', e.target.value)}
                                            >
                                                <option value="">Selecciona duración</option>
                                                <option value="Menos de 6 meses">Menos de 6 meses</option>
                                                <option value="De 6 meses a 1 año">De 6 meses a 1 año</option>
                                                <option value="De 1 a 3 años">De 1 a 3 años</option>
                                                <option value="Más de 3 años">Más de 3 años</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700">Motivo de separación</label>
                                            <select
                                                className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs text-sm border p-2.5 bg-white"
                                                value={exp.reason_for_leaving}
                                                onChange={e => handleWorkHistoryChange(index, 'reason_for_leaving', e.target.value)}
                                            >
                                                <option value="">Selecciona motivo</option>
                                                <option value="Mejora laboral">Mejora laboral</option>
                                                <option value="Cuestiones personales">Cuestiones personales</option>
                                                <option value="Fin de contrato">Fin de contrato</option>
                                                <option value="Mudanza">Mudanza</option>
                                                <option value="Despidos por ajuste">Despidos por ajuste</option>
                                                <option value="Otro">Otro</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700">Sueldo inicial y final percibido</label>
                                            <input
                                                type="text"
                                                placeholder="Ej. 8000 a 12000"
                                                className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs text-sm border p-2.5"
                                                value={exp.salary}
                                                onChange={e => handleWorkHistoryChange(index, 'salary', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700">Actividades realizadas o responsabilidades principales</label>
                                        <textarea
                                            rows={2}
                                            placeholder="Ej. Carga y descarga de mercancía, entrega a clientes"
                                            className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs text-sm border p-2.5"
                                            value={exp.activities}
                                            onChange={e => handleWorkHistoryChange(index, 'activities', e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addWorkExperience}
                                className="w-full border-2 border-dashed border-secondary-300 text-secondary-700 hover:bg-secondary-50 font-bold p-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
                            >
                                <Plus className="w-4 h-4" /> Agregar otro empleo anterior
                            </button>
                        </div>
                    )}
                </div>

                {/* ACCORDION 6: REFERENCIAS DE CONFIANZA */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <button
                        type="button"
                        onClick={() => toggleSection('s6')}
                        className="w-full bg-slate-50/80 p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-100/80 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-900 text-base sm:text-lg">6. Referencias de Confianza</span>
                            {checkSectionStatus(6) ? (
                                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-200">
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Completo
                                </span>
                            ) : (
                                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                    <AlertCircle className="w-3.5 h-3.5 mr-1" /> Incompleto
                                </span>
                            )}
                        </div>
                        {expandedSections.s6 ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                    </button>

                    {expandedSections.s6 && (
                        <div className="p-5 sm:p-6 space-y-4 border-t border-slate-200 bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Nombre completo de la referencia *</label>
                                    <input
                                        type="text"
                                        placeholder="Ej. Juan Pérez"
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs text-sm border p-2.5"
                                        value={formData.ref_name}
                                        onChange={e => setFormData({ ...formData, ref_name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Teléfono de contacto *</label>
                                    <input
                                        type="tel"
                                        placeholder="Ej. 9991234567"
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs text-sm border p-2.5"
                                        value={formData.ref_phone}
                                        onChange={e => setFormData({ ...formData, ref_phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Puesto y empresa donde colaboraron</label>
                                    <input
                                        type="text"
                                        placeholder="Ej. Gerente de Operaciones"
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs text-sm border p-2.5"
                                        value={formData.ref_position_company}
                                        onChange={e => setFormData({ ...formData, ref_position_company: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Cargar PDF con carta de recomendación</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        id="pdf-upload"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                    />
                                    <label
                                        htmlFor="pdf-upload"
                                        className="cursor-pointer bg-slate-50 border border-slate-300 hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
                                    >
                                        <FileText className="w-4 h-4 text-slate-500" />
                                        {formData.ref_recommendation_pdf ? 'Cambiar PDF' : 'Sube tu archivo PDF'}
                                    </label>
                                    {formData.ref_recommendation_pdf && (
                                        <span className="text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-md border border-green-200">
                                            ✓ Carta cargada correctamente
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ACCORDION 7: DISPONIBILIDAD Y EXPECTATIVAS */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <button
                        type="button"
                        onClick={() => toggleSection('s7')}
                        className="w-full bg-slate-50/80 p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-100/80 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-900 text-base sm:text-lg">7. Disponibilidad y Expectativas</span>
                            {checkSectionStatus(7) ? (
                                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-200">
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Completo
                                </span>
                            ) : (
                                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                    <AlertCircle className="w-3.5 h-3.5 mr-1" /> Incompleto
                                </span>
                            )}
                        </div>
                        {expandedSections.s7 ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                    </button>

                    {expandedSections.s7 && (
                        <div className="p-5 sm:p-6 space-y-4 border-t border-slate-200 bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Expectativa de sueldo mensual deseado ($ MXN) *</label>
                                    <input
                                        type="number"
                                        placeholder="Ej. 10000"
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs text-sm border p-2.5"
                                        value={formData.expected_salary}
                                        onChange={e => setFormData({ ...formData, expected_salary: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Fecha o tiempo en que podría iniciar a laborar *</label>
                                    <select
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs text-sm border p-2.5 bg-white"
                                        value={formData.start_availability}
                                        onChange={e => setFormData({ ...formData, start_availability: e.target.value })}
                                    >
                                        <option value="Inmediata">Inmediata</option>
                                        <option value="En 1 semana">En 1 semana</option>
                                        <option value="En 2 semanas">En 2 semanas</option>
                                        <option value="En 1 mes">En 1 mes</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Disponibilidad de horario o turnos *</label>
                                    <select
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs text-sm border p-2.5 bg-white"
                                        value={formData.shift_availability}
                                        onChange={e => setFormData({ ...formData, shift_availability: e.target.value })}
                                    >
                                        <option value="Tiempo completo">Tiempo completo</option>
                                        <option value="Medio tiempo">Medio tiempo</option>
                                        <option value="Rolar turnos">Rolar turnos</option>
                                        <option value="Turno matutino">Turno matutino</option>
                                        <option value="Turno vespertino">Turno vespertino</option>
                                        <option value="Turno nocturno">Turno nocturno</option>
                                        <option value="Fines de semana">Fines de semana</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Disponibilidad para viajar o cambiar de residencia</label>
                                    <select
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs text-sm border p-2.5 bg-white"
                                        value={formData.travel_availability}
                                        onChange={e => setFormData({ ...formData, travel_availability: e.target.value })}
                                    >
                                        <option value="Sí">Sí</option>
                                        <option value="No">No</option>
                                        <option value="Solo para viajar">Solo para viajar</option>
                                        <option value="Solo cambio de residencia">Solo cambio de residencia</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* POSTULACIÓN ESPECÍFICA SI VIENE DE VACANTE */}
                {jobToApply && (
                    <div className="border-t border-slate-200 pt-6">
                        <label className="block text-sm font-medium text-slate-700 mb-2">¿Por qué te interesa este puesto?</label>
                        <textarea
                            rows={3}
                            className="w-full rounded-lg border-slate-300 shadow-2xs text-sm border p-2.5"
                            value={comments}
                            onChange={e => setComments(e.target.value)}
                            placeholder="Cuéntanos brevemente..."
                        />
                    </div>
                )}

                {/* BOTONES DE ACCIÓN */}
                <div className="flex justify-end pt-6 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={() => navigate(jobToApply ? `/jobs/${jobToApply.id}` : '/dashboard')}
                        className="bg-white text-slate-700 px-5 py-2.5 rounded-xl text-sm font-medium border border-slate-300 hover:bg-slate-50 mr-3 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="bg-secondary-600 text-white px-7 py-2.5 rounded-xl text-sm font-bold hover:bg-secondary-700 transition-colors shadow-sm"
                    >
                        {jobToApply ? 'Enviar Solicitud' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfilePage;
