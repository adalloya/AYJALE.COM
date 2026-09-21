import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Plus, Trash2, FileText, ArrowLeft, Eye, Briefcase } from 'lucide-react';

import Toast from '../../components/Toast';
import PhotoCapture from '../../components/PhotoCapture';

const ProfileEditPage = () => {
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
        address_street: '',
        colonia: '',
        titles: [''],
        title: '',
        experience_years: '1 a 3 años',
        skills: '',
        driver_license: 'No tengo',
        languages_tools: '',
        education: 'Secundaria',
        education_status: 'Concluido',
        institution_name: '',
        english_level: 'Ninguno',
        certifications: [
            { type: 'Certificación', title_detail: '' }
        ],
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
        references: [
            {
                ref_name: '',
                ref_phone: '',
                ref_position_company: '',
                ref_recommendation_pdf: ''
            }
        ],
        expected_salary: '',
        start_availability: 'Inmediata',
        shift_availability: 'Tiempo completo',
        travel_availability: 'No'
    });

    const [initialFormData, setInitialFormData] = useState(null);

    const [expandedSections, setExpandedSections] = useState({
        s1: false,
        s2: false,
        s3: false,
        s4: false,
        s5: false,
        s6: false,
        s7: false
    });

    const capitalizeWords = (str) => {
        if (!str || typeof str !== 'string') return str || '';
        const hasTrailingSpace = str.endsWith(' ');
        const formatted = str
            .toLowerCase()
            .split(' ')
            .map(word => word ? word.charAt(0).toUpperCase() + word.slice(1) : '')
            .join(' ');

        return (hasTrailingSpace && !formatted.endsWith(' ')) ? formatted + ' ' : formatted;
    };

    const capitalizeCompanyName = (str) => {
        if (!str || typeof str !== 'string') return str || '';
        const trimmed = str.trim();
        if (!trimmed) return str;

        // If user typed ALL UPPERCASE (e.g. OXXO, CFE, PEMEX, IBM, BBVA), preserve ALL UPPERCASE!
        if (trimmed === trimmed.toUpperCase() && trimmed !== trimmed.toLowerCase() && trimmed.length > 1) {
            return str;
        }

        // If user typed ALL LOWERCASE (e.g. oxxo, bimbo), capitalize first letter of each word!
        if (trimmed === trimmed.toLowerCase()) {
            return str
                .split(' ')
                .map(word => word ? word.charAt(0).toUpperCase() + word.slice(1) : '')
                .join(' ');
        }

        // Otherwise (user typed mixed case like Grupo Bimbo), preserve user's exact casing!
        return str;
    };

    const capitalizeSentence = (str) => {
        if (!str || typeof str !== 'string') return str || '';
        const lower = str.toLowerCase();
        return lower.replace(/(^\s*|[.!?]\s+)([a-záéíóúñ])/g, (m, p1, p2) => p1 + p2.toUpperCase());
    };

    const formatPhoneNumber = (val) => {
        if (!val) return '';
        const digits = val.replace(/\D/g, '');
        if (digits.length === 0) return '';
        if (digits.length <= 3) return `(${digits}`;
        if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    };

    useEffect(() => {
        if (user) {
            let initialWorkHistory = user.work_history;
            if (!Array.isArray(initialWorkHistory) || initialWorkHistory.length === 0) {
                if (user.lastJob || user.last_job) {
                    initialWorkHistory = [{
                        company: capitalizeCompanyName(user.lastJob || user.last_job || ''),
                        position: capitalizeWords(user.lastPosition || user.last_position || ''),
                        duration: user.lastDuration || user.last_duration || '',
                        activities: capitalizeSentence(user.lastActivities || user.last_activities || ''),
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
            } else {
                initialWorkHistory = initialWorkHistory.map(w => ({
                    ...w,
                    company: capitalizeCompanyName(w.company),
                    position: capitalizeWords(w.position),
                    activities: capitalizeSentence(w.activities)
                }));
            }

            let initialCertifications = user.certifications;
            if (!Array.isArray(initialCertifications) || initialCertifications.length === 0) {
                initialCertifications = [{ type: 'Certificación', title_detail: '' }];
            } else {
                initialCertifications = initialCertifications.map(c => ({
                    ...c,
                    title_detail: capitalizeWords(c.title_detail)
                }));
            }

            let initialReferences = user.references;
            if (!Array.isArray(initialReferences) || initialReferences.length === 0) {
                if (user.ref_name || user.ref_phone) {
                    initialReferences = [{
                        ref_name: capitalizeWords(user.ref_name || ''),
                        ref_phone: formatPhoneNumber(user.ref_phone || ''),
                        ref_position_company: capitalizeCompanyName(user.ref_position_company || ''),
                        ref_recommendation_pdf: user.ref_recommendation_pdf || ''
                    }];
                } else {
                    initialReferences = [{
                        ref_name: '',
                        ref_phone: '',
                        ref_position_company: '',
                        ref_recommendation_pdf: ''
                    }];
                }
            } else {
                initialReferences = initialReferences.map(r => ({
                    ...r,
                    ref_name: capitalizeWords(r.ref_name),
                    ref_phone: formatPhoneNumber(r.ref_phone),
                    ref_position_company: capitalizeCompanyName(r.ref_position_company)
                }));
            }

            let initialTitles = user.title
                ? String(user.title).split(',').map(t => capitalizeWords(t.trim())).filter(Boolean)
                : [''];

            if (initialTitles.length === 0) initialTitles = [''];

            const loadedData = {
                name: capitalizeWords(user.name || ''),
                first_last_name: capitalizeWords(user.first_last_name || user.lastName || user.last_name || ''),
                second_last_name: capitalizeWords(user.second_last_name || ''),
                photo: user.photo || '',
                phone: formatPhoneNumber(user.phone || user.phone_number || ''),
                email: user.email || '',
                curp: String(user.curp || '').toUpperCase(),
                rfc: String(user.rfc || '').toUpperCase(),
                nss: user.nss || '',
                location: user.location || '',
                municipality: capitalizeWords(user.municipality || user.municipio || ''),
                zipCode: user.zipCode || user.postal_code || '',
                address_street: capitalizeWords(user.address_street || ''),
                colonia: capitalizeWords(user.colonia || ''),
                titles: initialTitles,
                title: initialTitles.filter(Boolean).join(', '),
                experience_years: user.experience_years || '1 a 3 años',
                skills: Array.isArray(user.skills) ? capitalizeWords(user.skills.join(', ')) : capitalizeWords(user.skills || ''),
                driver_license: user.driver_license || 'No tengo',
                languages_tools: capitalizeWords(user.languages_tools || ''),
                education: user.education || 'Secundaria',
                education_status: user.education_status || 'Concluido',
                institution_name: capitalizeWords(user.institution_name || ''),
                english_level: user.english_level || 'Ninguno',
                certifications: initialCertifications,
                work_history: initialWorkHistory,
                references: initialReferences,
                expected_salary: user.expected_salary || '',
                start_availability: user.start_availability || 'Inmediata',
                shift_availability: user.shift_availability || 'Tiempo completo',
                travel_availability: user.travel_availability || 'No'
            };

            setFormData(loadedData);
            setInitialFormData(JSON.parse(JSON.stringify(loadedData)));
        }
    }, [user]);

    const [searchParams] = useSearchParams();
    const applyingToId = searchParams.get('applyingTo');

    const jobToApply = applyingToId ? jobs.find(j => j.id === Number(applyingToId)) : null;
    const [comments, setComments] = useState('');

    const updateFormField = (field, value) => {
        let formattedValue = value;

        if (field === 'phone') {
            formattedValue = formatPhoneNumber(value);
        } else if (['name', 'first_last_name', 'second_last_name', 'municipality', 'address_street', 'colonia', 'institution_name'].includes(field)) {
            formattedValue = capitalizeWords(value);
        } else if (field === 'curp' || field === 'rfc') {
            formattedValue = String(value).toUpperCase();
        }

        setFormData(prev => ({ ...prev, [field]: formattedValue }));
    };

    const handleTitleChange = (index, value) => {
        setFormData(prev => {
            const updatedTitles = [...prev.titles];
            updatedTitles[index] = capitalizeWords(value);
            const joinedTitle = updatedTitles.map(t => t.trim()).filter(Boolean).join(', ');
            return { ...prev, titles: updatedTitles, title: joinedTitle };
        });
    };

    const handleTitleBlur = (index) => {
        setFormData(prev => {
            const updatedTitles = [...prev.titles];
            const val = updatedTitles[index];
            if (typeof val === 'string' && val) {
                updatedTitles[index] = capitalizeWords(val.trim());
            }
            const joinedTitle = updatedTitles.map(t => t.trim()).filter(Boolean).join(', ');
            return { ...prev, titles: updatedTitles, title: joinedTitle };
        });
    };

    const addTitleField = () => {
        setFormData(prev => ({
            ...prev,
            titles: [...prev.titles, '']
        }));
    };

    const removeTitleField = (index) => {
        if (formData.titles.length === 1) return;
        setFormData(prev => {
            const updatedTitles = prev.titles.filter((_, i) => i !== index);
            const joinedTitle = updatedTitles.map(t => t.trim()).filter(Boolean).join(', ');
            return { ...prev, titles: updatedTitles, title: joinedTitle };
        });
    };

    const handleInputBlur = (field, isSentence = false) => {
        setFormData(prev => {
            const currentVal = prev[field];
            if (typeof currentVal !== 'string' || !currentVal) return prev;
            const formatted = isSentence ? capitalizeSentence(currentVal) : capitalizeWords(currentVal.trim());
            return { ...prev, [field]: formatted };
        });
    };

    const handleWorkHistoryBlur = (index, field, isSentence = false) => {
        setFormData(prev => {
            const updatedWork = [...prev.work_history];
            const val = updatedWork[index][field];
            if (typeof val === 'string' && val) {
                const formatted = field === 'company'
                    ? capitalizeCompanyName(val)
                    : (isSentence ? capitalizeSentence(val) : capitalizeWords(val.trim()));

                updatedWork[index] = {
                    ...updatedWork[index],
                    [field]: formatted
                };
            }
            return { ...prev, work_history: updatedWork };
        });
    };

    const handleCertificationBlur = (index, field) => {
        setFormData(prev => {
            const updatedCerts = [...prev.certifications];
            const val = updatedCerts[index][field];
            if (typeof val === 'string' && val) {
                updatedCerts[index] = { ...updatedCerts[index], [field]: capitalizeWords(val.trim()) };
            }
            return { ...prev, certifications: updatedCerts };
        });
    };

    const handleReferenceBlur = (index, field) => {
        setFormData(prev => {
            const updatedRefs = [...prev.references];
            const val = updatedRefs[index][field];
            if (typeof val === 'string' && val) {
                const formatted = field === 'ref_position_company'
                    ? capitalizeCompanyName(val)
                    : capitalizeWords(val.trim());

                updatedRefs[index] = { ...updatedRefs[index], [field]: formatted };
            }
            return { ...prev, references: updatedRefs };
        });
    };

    const handleSalaryBlur = (field) => {
        setFormData(prev => {
            const val = prev[field];
            if (!val) return prev;
            const digits = String(val).replace(/[^0-9]/g, '');
            if (!digits) return prev;
            const num = parseInt(digits, 10);
            return { ...prev, [field]: num.toLocaleString('es-MX') };
        });
    };

    const handleWorkSalaryBlur = (index) => {
        setFormData(prev => {
            const updatedWork = [...prev.work_history];
            const val = updatedWork[index].salary;
            if (!val) return prev;
            const digits = String(val).replace(/[^0-9]/g, '');
            if (!digits) return prev;
            const num = parseInt(digits, 10);
            updatedWork[index] = { ...updatedWork[index], salary: num.toLocaleString('es-MX') };
            return { ...prev, work_history: updatedWork };
        });
    };

    const sanitizeFormData = (data) => {
        const cleanTitles = (data.titles || []).map(t => capitalizeWords(t.trim())).filter(Boolean);
        const joinedTitle = cleanTitles.length > 0 ? cleanTitles.join(', ') : capitalizeWords((data.title || '').trim());

        return {
            ...data,
            titles: cleanTitles.length > 0 ? cleanTitles : [joinedTitle],
            title: joinedTitle,
            name: capitalizeWords(data.name.trim()),
            first_last_name: capitalizeWords(data.first_last_name.trim()),
            second_last_name: capitalizeWords(data.second_last_name.trim()),
            municipality: capitalizeWords(data.municipality.trim()),
            address_street: capitalizeWords(data.address_street.trim()),
            colonia: capitalizeWords(data.colonia.trim()),
            institution_name: capitalizeWords(data.institution_name.trim()),
            certifications: (data.certifications || []).map(c => ({
                ...c,
                title_detail: capitalizeWords(c.title_detail.trim())
            })),
            work_history: (data.work_history || []).map(w => ({
                ...w,
                company: capitalizeWords(w.company.trim()),
                position: capitalizeWords(w.position.trim()),
                activities: capitalizeSentence(w.activities.trim())
            })),
            references: (data.references || []).map(r => ({
                ...r,
                ref_name: capitalizeWords(r.ref_name.trim()),
                ref_position_company: capitalizeWords(r.ref_position_company.trim())
            }))
        };
    };

    const isSectionDirty = (sectionNum) => {
        if (!initialFormData) return false;
        const isEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

        switch (sectionNum) {
            case 1:
                return (
                    formData.name !== initialFormData.name ||
                    formData.first_last_name !== initialFormData.first_last_name ||
                    formData.second_last_name !== initialFormData.second_last_name ||
                    formData.photo !== initialFormData.photo ||
                    formData.phone !== initialFormData.phone ||
                    formData.curp !== initialFormData.curp ||
                    formData.rfc !== initialFormData.rfc ||
                    formData.nss !== initialFormData.nss
                );
            case 2:
                return (
                    formData.location !== initialFormData.location ||
                    formData.municipality !== initialFormData.municipality ||
                    formData.zipCode !== initialFormData.zipCode ||
                    formData.address_street !== initialFormData.address_street ||
                    formData.colonia !== initialFormData.colonia
                );
            case 3:
                return (
                    formData.education !== initialFormData.education ||
                    formData.education_status !== initialFormData.education_status ||
                    formData.institution_name !== initialFormData.institution_name ||
                    formData.english_level !== initialFormData.english_level ||
                    !isEqual(formData.certifications, initialFormData.certifications)
                );
            case 4:
                return (
                    !isEqual(formData.titles, initialFormData.titles) ||
                    formData.experience_years !== initialFormData.experience_years ||
                    formData.driver_license !== initialFormData.driver_license
                );
            case 5:
                return !isEqual(formData.work_history, initialFormData.work_history);
            case 6:
                return !isEqual(formData.references, initialFormData.references);
            case 7:
                return (
                    formData.expected_salary !== initialFormData.expected_salary ||
                    formData.start_availability !== initialFormData.start_availability ||
                    formData.shift_availability !== initialFormData.shift_availability ||
                    formData.travel_availability !== initialFormData.travel_availability
                );
            default:
                return false;
        }
    };

    const isAnySectionDirty = () => {
        for (let i = 1; i <= 7; i++) {
            if (isSectionDirty(i)) return true;
        }
        return false;
    };

    const getSectionStatus = (sectionNum, data = formData) => {
        let total = 0;
        let filled = 0;

        const checkVal = (v) => {
            total++;
            if (v !== undefined && v !== null && String(v).trim() !== '') {
                filled++;
            }
        };

        switch (sectionNum) {
            case 1:
                checkVal(data.name);
                checkVal(data.first_last_name);
                checkVal(data.phone);
                checkVal(data.email);
                checkVal(data.curp);
                break;
            case 2:
                checkVal(data.location);
                checkVal(data.municipality);
                checkVal(data.zipCode);
                checkVal(data.address_street);
                checkVal(data.colonia);
                break;
            case 3:
                checkVal(data.education);
                checkVal(data.education_status);
                checkVal(data.institution_name);
                checkVal(data.english_level);
                break;
            case 4:
                if (data.titles && data.titles.length > 0) {
                    checkVal(data.titles[0]);
                } else {
                    checkVal(data.title);
                }
                checkVal(data.experience_years);
                checkVal(data.driver_license);
                break;
            case 5:
                if (data.work_history && data.work_history.length > 0) {
                    checkVal(data.work_history[0].company);
                    checkVal(data.work_history[0].position);
                    checkVal(data.work_history[0].duration);
                } else {
                    total += 3;
                }
                break;
            case 6:
                if (data.references && data.references.length > 0) {
                    checkVal(data.references[0].ref_name);
                    checkVal(data.references[0].ref_phone);
                } else {
                    total += 2;
                }
                break;
            case 7:
                checkVal(data.expected_salary);
                checkVal(data.start_availability);
                checkVal(data.shift_availability);
                checkVal(data.travel_availability);
                break;
            default:
                break;
        }

        if (filled === 0) return 'unstarted';
        if (filled === total) return 'complete';
        return 'incomplete';
    };

    const toggleSection = (sectionKey) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionKey]: !prev[sectionKey]
        }));
    };

    const saveProfileData = async (dataToSave, sectionName) => {
        const cleanData = sanitizeFormData(dataToSave);
        setFormData(cleanData);

        const updatedData = {
            ...cleanData,
            title: cleanData.title,
            last_name: cleanData.first_last_name,
            birth_date: cleanData.birthDate,
            municipio: cleanData.municipality,
            postal_code: cleanData.zipCode,
            last_activities: cleanData.work_history[0]?.activities || '',
            last_job: cleanData.work_history[0]?.company || '',
            last_position: cleanData.work_history[0]?.position || '',
            last_duration: cleanData.work_history[0]?.duration || '',
            ref_name: cleanData.references[0]?.ref_name || '',
            ref_phone: cleanData.references[0]?.ref_phone || '',
            ref_position_company: cleanData.references[0]?.ref_position_company || '',
            ref_recommendation_pdf: cleanData.references[0]?.ref_recommendation_pdf || ''
        };

        try {
            await updateUser(updatedData);
            setInitialFormData(JSON.parse(JSON.stringify(cleanData)));
            if (sectionName) {
                setToast({ message: `✓ ${sectionName} guardada correctamente`, type: 'success' });
            }
        } catch (error) {
            console.error("Error saving section:", error);
            setToast({ message: 'Error al guardar la sección. Intenta de nuevo.', type: 'error' });
        }
    };

    const handleWorkHistoryChange = (index, field, value) => {
        setFormData(prev => {
            const updatedWork = [...prev.work_history];
            let val = value;
            if (field === 'company' || field === 'position') {
                val = capitalizeWords(value);
            } else if (field === 'activities') {
                val = capitalizeSentence(value);
            }
            updatedWork[index] = { ...updatedWork[index], [field]: val };
            return { ...prev, work_history: updatedWork };
        });
    };

    const addWorkExperience = () => {
        setFormData(prev => ({
            ...prev,
            work_history: [
                ...prev.work_history,
                { company: '', position: '', duration: '', activities: '', reason_for_leaving: '', salary: '' }
            ]
        }));
    };

    const removeWorkExperience = (index) => {
        if (formData.work_history.length === 1) return;
        setFormData(prev => ({
            ...prev,
            work_history: prev.work_history.filter((_, i) => i !== index)
        }));
    };

    const handleCertificationChange = (index, field, value) => {
        setFormData(prev => {
            const updatedCerts = [...prev.certifications];
            let val = value;
            if (field === 'title_detail') {
                val = capitalizeWords(value);
            }
            updatedCerts[index] = { ...updatedCerts[index], [field]: val };
            return { ...prev, certifications: updatedCerts };
        });
    };

    const addCertification = () => {
        setFormData(prev => ({
            ...prev,
            certifications: [
                ...prev.certifications,
                { type: 'Certificación', title_detail: '' }
            ]
        }));
    };

    const removeCertification = (index) => {
        if (formData.certifications.length === 1) return;
        setFormData(prev => ({
            ...prev,
            certifications: prev.certifications.filter((_, i) => i !== index)
        }));
    };

    const handleReferenceChange = (index, field, value) => {
        setFormData(prev => {
            const updated = [...prev.references];
            let val = value;
            if (field === 'ref_name' || field === 'ref_position_company') {
                val = capitalizeWords(value);
            } else if (field === 'ref_phone') {
                val = formatPhoneNumber(value);
            }
            updated[index] = { ...updated[index], [field]: val };
            return { ...prev, references: updated };
        });
    };

    const addReference = () => {
        setFormData(prev => ({
            ...prev,
            references: [
                ...prev.references,
                { ref_name: '', ref_phone: '', ref_position_company: '', ref_recommendation_pdf: '' }
            ]
        }));
    };

    const removeReference = (index) => {
        if (formData.references.length === 1) return;
        setFormData(prev => ({
            ...prev,
            references: prev.references.filter((_, i) => i !== index)
        }));
    };

    const handleReferenceFileUpload = (index, e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            setToast({ message: 'Por favor selecciona un archivo PDF', type: 'error' });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setToast({ message: 'El archivo excede el tamaño máximo permitido de 5 MB.', type: 'error' });
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => {
                const updated = [...prev.references];
                updated[index] = { ...updated[index], ref_recommendation_pdf: reader.result };
                return { ...prev, references: updated };
            });
            setToast({ message: 'Carta de recomendación cargada.', type: 'success' });
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (isAnySectionDirty()) {
                await saveProfileData(formData);
            }

            if (jobToApply) {
                await applyToJob(jobToApply.id, user.id, { comments });
                setToast({ message: '¡Solicitud enviada con éxito!', type: 'success' });
                setTimeout(() => {
                    navigate(`/jobs/${jobToApply.id}`);
                }, 1500);
            } else {
                setToast({ message: 'Perfil guardado correctamente', type: 'success' });
                setTimeout(() => {
                    navigate('/profile');
                }, 800);
            }
        } catch (error) {
            console.error("Error submitting profile:", error);
            setToast({ message: 'Error al completar. Intenta de nuevo.', type: 'error' });
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
                    <p className="text-slate-600 mt-1">
                        Estás a un paso de postularte como <span className="font-semibold text-primary-900">{jobToApply.title}</span>.
                        Revisa y completa tu información antes de enviar.
                    </p>
                </div>
            ) : (
                <div className="mb-8 border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Link to="/profile" className="text-slate-500 hover:text-slate-800 transition-colors p-1 rounded-lg hover:bg-slate-100">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <h1 className="text-3xl font-extrabold text-slate-900">Editar Mi Perfil</h1>
                        </div>
                        <p className="text-slate-500 text-sm pl-8">
                            Actualiza los datos de cada sección para mantener tu perfil vigente ante reclutadores.
                        </p>
                    </div>

                    <Link
                        to="/profile"
                        className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-colors shrink-0"
                    >
                        <Eye className="w-4 h-4" /> Ver mi perfil oficial
                    </Link>
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
                            {getSectionStatus(1) === 'complete' && (
                                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-200">
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Completo
                                </span>
                            )}
                            {getSectionStatus(1) === 'incomplete' && (
                                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                    <AlertCircle className="w-3.5 h-3.5 mr-1" /> En progreso
                                </span>
                            )}
                            {getSectionStatus(1) === 'unstarted' && (
                                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                    Sin comenzar
                                </span>
                            )}
                        </div>
                        {expandedSections.s1 ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                    </button>

                    {expandedSections.s1 && (
                        <div className="p-5 sm:p-6 space-y-6 border-t border-slate-200 bg-white">
                            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-xs font-semibold text-slate-500 mb-3">Fotografía clara del rostro</p>
                                <PhotoCapture
                                    initialImage={formData.photo}
                                    onCapture={(photoData) => {
                                        updateFormField('photo', photoData);
                                        setToast({ message: 'Foto cargada. Recuerda guardar la sección.', type: 'success' });
                                    }}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Nombre</label>
                                    <input
                                        type="text"
                                        autoCapitalize="words"
                                        placeholder="Ej. Juan"
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs focus:border-secondary-500 focus:ring-secondary-500 text-sm border p-2.5 capitalize"
                                        value={formData.name}
                                        onChange={e => updateFormField('name', e.target.value)}
                                        onBlur={() => handleInputBlur('name')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Primer Apellido</label>
                                    <input
                                        type="text"
                                        autoCapitalize="words"
                                        placeholder="Ej. Pérez"
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs focus:border-secondary-500 focus:ring-secondary-500 text-sm border p-2.5 capitalize"
                                        value={formData.first_last_name}
                                        onChange={e => updateFormField('first_last_name', e.target.value)}
                                        onBlur={() => handleInputBlur('first_last_name')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Segundo Apellido</label>
                                    <input
                                        type="text"
                                        autoCapitalize="words"
                                        placeholder="Ej. López"
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs focus:border-secondary-500 focus:ring-secondary-500 text-sm border p-2.5 capitalize"
                                        value={formData.second_last_name}
                                        onChange={e => updateFormField('second_last_name', e.target.value)}
                                        onBlur={() => handleInputBlur('second_last_name')}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Teléfono o WhatsApp de contacto</label>
                                    <input
                                        type="tel"
                                        placeholder="Ej. (999) 123-4567"
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs focus:border-secondary-500 focus:ring-secondary-500 text-sm border p-2.5"
                                        value={formData.phone}
                                        onChange={e => updateFormField('phone', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Correo electrónico</label>
                                    <input
                                        type="email"
                                        disabled
                                        readOnly
                                        placeholder="Ej. correo@ejemplo.com"
                                        className="mt-1 block w-full rounded-lg border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed shadow-2xs text-sm border p-2.5"
                                        value={formData.email}
                                    />
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        🔒 El correo no se puede editar porque es tu identificador de acceso.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">CURP</label>
                                    <input
                                        type="text"
                                        autoCapitalize="characters"
                                        placeholder="Ej. ABCD901234HDFXYZ01"
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs focus:border-secondary-500 focus:ring-secondary-500 text-sm border p-2.5 uppercase"
                                        value={formData.curp}
                                        onChange={e => updateFormField('curp', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">RFC con homoclave</label>
                                    <input
                                        type="text"
                                        autoCapitalize="characters"
                                        placeholder="Ej. ABCD901234XYZ"
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs focus:border-secondary-500 focus:ring-secondary-500 text-sm border p-2.5 uppercase"
                                        value={formData.rfc}
                                        onChange={e => updateFormField('rfc', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Número de Seguridad Social (NSS)</label>
                                    <input
                                        type="text"
                                        placeholder="Ej. 12345678901"
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs focus:border-secondary-500 focus:ring-secondary-500 text-sm border p-2.5"
                                        value={formData.nss}
                                        onChange={e => updateFormField('nss', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-center pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    disabled={!isSectionDirty(1)}
                                    onClick={() => saveProfileData(formData, 'Identificación y Contacto')}
                                    className={`px-6 py-2 rounded-lg text-xs font-bold transition-all shadow-2xs ${
                                        isSectionDirty(1)
                                            ? 'bg-secondary-600 hover:bg-secondary-700 text-white cursor-pointer shadow-md'
                                            : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                                    }`}
                                >
                                    Guardar Identificación y Contacto
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ACCORDION 2: UBICACIÓN */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <button
                        type="button"
                        onClick={() => toggleSection('s2')}
                        className="w-full bg-slate-50/80 p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-100/80 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-900 text-base sm:text-lg">2. Ubicación</span>
                            {getSectionStatus(2) === 'complete' && (
                                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-200">
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Completo
                                </span>
                            )}
                            {getSectionStatus(2) === 'incomplete' && (
                                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                    <AlertCircle className="w-3.5 h-3.5 mr-1" /> En progreso
                                </span>
                            )}
                            {getSectionStatus(2) === 'unstarted' && (
                                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                    Sin comenzar
                                </span>
                            )}
                        </div>
                        {expandedSections.s2 ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                    </button>

                    {expandedSections.s2 && (
                        <div className="p-5 sm:p-6 space-y-4 border-t border-slate-200 bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Estado de residencia</label>
                                    <select
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs focus:border-secondary-500 focus:ring-secondary-500 text-sm border p-2.5 bg-white"
                                        value={formData.location}
                                        onChange={e => updateFormField('location', e.target.value)}
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
                                    <label className="block text-sm font-medium text-slate-700">Municipio o alcaldía</label>
                                    <input
                                        type="text"
                                        autoCapitalize="words"
                                        placeholder="Ej. Mérida"
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs focus:border-secondary-500 focus:ring-secondary-500 text-sm border p-2.5 capitalize"
                                        value={formData.municipality}
                                        onChange={e => updateFormField('municipality', e.target.value)}
                                        onBlur={() => handleInputBlur('municipality')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Código postal</label>
                                    <input
                                        type="text"
                                        placeholder="Ej. 97100"
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs focus:border-secondary-500 focus:ring-secondary-500 text-sm border p-2.5"
                                        value={formData.zipCode}
                                        onChange={e => updateFormField('zipCode', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Calle y Número</label>
                                    <input
                                        type="text"
                                        autoCapitalize="words"
                                        placeholder="Ej. Av. Reforma 123"
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs focus:border-secondary-500 focus:ring-secondary-500 text-sm border p-2.5 capitalize"
                                        value={formData.address_street}
                                        onChange={e => updateFormField('address_street', e.target.value)}
                                        onBlur={() => handleInputBlur('address_street')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Colonia</label>
                                    <input
                                        type="text"
                                        autoCapitalize="words"
                                        placeholder="Ej. Centro"
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs focus:border-secondary-500 focus:ring-secondary-500 text-sm border p-2.5 capitalize"
                                        value={formData.colonia}
                                        onChange={e => updateFormField('colonia', e.target.value)}
                                        onBlur={() => handleInputBlur('colonia')}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-center pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    disabled={!isSectionDirty(2)}
                                    onClick={() => saveProfileData(formData, 'Ubicación')}
                                    className={`px-6 py-2 rounded-lg text-xs font-bold transition-all shadow-2xs ${
                                        isSectionDirty(2)
                                            ? 'bg-secondary-600 hover:bg-secondary-700 text-white cursor-pointer shadow-md'
                                            : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                                    }`}
                                >
                                    Guardar Ubicación
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ACCORDION 3: ESTUDIOS */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <button
                        type="button"
                        onClick={() => toggleSection('s3')}
                        className="w-full bg-slate-50/80 p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-100/80 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-900 text-base sm:text-lg">3. Estudios</span>
                            {getSectionStatus(3) === 'complete' && (
                                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-200">
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Completo
                                </span>
                            )}
                            {getSectionStatus(3) === 'incomplete' && (
                                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                    <AlertCircle className="w-3.5 h-3.5 mr-1" /> En progreso
                                </span>
                            )}
                            {getSectionStatus(3) === 'unstarted' && (
                                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                    Sin comenzar
                                </span>
                            )}
                        </div>
                        {expandedSections.s3 ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                    </button>

                    {expandedSections.s3 && (
                        <div className="p-5 sm:p-6 space-y-6 border-t border-slate-200 bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Último grado escolar alcanzado</label>
                                    <select
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs focus:border-secondary-500 focus:ring-secondary-500 text-sm border p-2.5 bg-white"
                                        value={formData.education}
                                        onChange={e => updateFormField('education', e.target.value)}
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
                                    <label className="block text-sm font-medium text-slate-700">Estatus</label>
                                    <select
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs focus:border-secondary-500 focus:ring-secondary-500 text-sm border p-2.5 bg-white"
                                        value={formData.education_status}
                                        onChange={e => updateFormField('education_status', e.target.value)}
                                    >
                                        <option value="Concluido">Concluido</option>
                                        <option value="Trunco">Trunco</option>
                                        <option value="En curso">En curso</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Nombre de la institución</label>
                                    <input
                                        type="text"
                                        autoCapitalize="words"
                                        placeholder="Ej. Instituto Tecnológico de Mérida"
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs focus:border-secondary-500 focus:ring-secondary-500 text-sm border p-2.5 capitalize"
                                        value={formData.institution_name}
                                        onChange={e => updateFormField('institution_name', e.target.value)}
                                        onBlur={() => handleInputBlur('institution_name')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Nivel de Inglés</label>
                                    <select
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs focus:border-secondary-500 focus:ring-secondary-500 text-sm border p-2.5 bg-white"
                                        value={formData.english_level}
                                        onChange={e => updateFormField('english_level', e.target.value)}
                                    >
                                        <option value="Ninguno">Ninguno</option>
                                        <option value="Básico">Básico</option>
                                        <option value="Intermedio">Intermedio</option>
                                        <option value="Avanzado">Avanzado</option>
                                        <option value="Nativo">Nativo</option>
                                    </select>
                                </div>
                            </div>

                            {/* DINÁMICO DE ACREDITACIONES Y CURSOS */}
                            <div className="pt-4 border-t border-slate-100 space-y-4">
                                <label className="block text-sm font-bold text-slate-900">Acreditaciones, Certificaciones o Cursos</label>
                                {formData.certifications.map((cert, idx) => (
                                    <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-slate-600">Acreditación #{idx + 1}</span>
                                            {formData.certifications.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeCertification(idx)}
                                                    className="text-red-600 hover:text-red-800 text-xs font-semibold flex items-center gap-1"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" /> Eliminar
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-700">Tipo</label>
                                                <select
                                                    className="mt-1 block w-full rounded-lg border-slate-300 text-sm border p-2 bg-white"
                                                    value={cert.type}
                                                    onChange={e => handleCertificationChange(idx, 'type', e.target.value)}
                                                >
                                                    <option value="Certificación">Certificación</option>
                                                    <option value="Curso">Curso</option>
                                                    <option value="Diplomado">Diplomado</option>
                                                    <option value="Capacitación">Capacitación</option>
                                                    <option value="Taller">Taller</option>
                                                    <option value="Otro">Otro</option>
                                                </select>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-medium text-slate-700">Nombre / Detalle del curso o certificación</label>
                                                <input
                                                    type="text"
                                                    autoCapitalize="words"
                                                    placeholder="Ej. Certificación en Manejo Seguro de Montacargas - 40h"
                                                    className="mt-1 block w-full rounded-lg border-slate-300 text-sm border p-2 capitalize"
                                                    value={cert.title_detail}
                                                    onChange={e => handleCertificationChange(idx, 'title_detail', e.target.value)}
                                                    onBlur={() => handleCertificationBlur(idx, 'title_detail')}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={addCertification}
                                    className="w-full border border-dashed border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold p-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-xs"
                                >
                                    <Plus className="w-4 h-4 text-slate-500" /> Agregar otra acreditación
                                </button>
                            </div>

                            <div className="flex justify-center pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    disabled={!isSectionDirty(3)}
                                    onClick={() => saveProfileData(formData, 'Estudios')}
                                    className={`px-6 py-2 rounded-lg text-xs font-bold transition-all shadow-2xs ${
                                        isSectionDirty(3)
                                            ? 'bg-secondary-600 hover:bg-secondary-700 text-white cursor-pointer shadow-md'
                                            : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                                    }`}
                                >
                                    Guardar Estudios
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ACCORDION 4: OFICIOS Y LICENCIAS */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <button
                        type="button"
                        onClick={() => toggleSection('s4')}
                        className="w-full bg-slate-50/80 p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-100/80 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-900 text-base sm:text-lg">4. Oficios y Licencias</span>
                            {getSectionStatus(4) === 'complete' && (
                                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-200">
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Completo
                                </span>
                            )}
                            {getSectionStatus(4) === 'incomplete' && (
                                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                    <AlertCircle className="w-3.5 h-3.5 mr-1" /> En progreso
                                </span>
                            )}
                            {getSectionStatus(4) === 'unstarted' && (
                                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                    Sin comenzar
                                </span>
                            )}
                        </div>
                        {expandedSections.s4 ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                    </button>

                    {expandedSections.s4 && (
                        <div className="p-5 sm:p-6 space-y-6 border-t border-slate-200 bg-white">
                            
                            {/* MULTI OFICIOS */}
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-slate-900">
                                    Oficios o Puestos Deseados (Puedes agregar varios)
                                </label>
                                {formData.titles.map((titleVal, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                autoCapitalize="words"
                                                placeholder={idx === 0 ? "Ej. Chofer de reparto" : "Ej. Ayudante General"}
                                                className="block w-full rounded-lg border-slate-300 shadow-2xs focus:border-secondary-500 focus:ring-secondary-500 text-sm border p-2.5 capitalize"
                                                value={titleVal}
                                                onChange={e => handleTitleChange(idx, e.target.value)}
                                                onBlur={() => handleTitleBlur(idx)}
                                            />
                                        </div>
                                        {formData.titles.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeTitleField(idx)}
                                                className="p-2.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                                                title="Eliminar este oficio"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={addTitleField}
                                    className="w-full border border-dashed border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold p-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-xs"
                                >
                                    <Plus className="w-4 h-4 text-slate-500" /> Agregar otro oficio o puesto
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Años de experiencia general</label>
                                    <select
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs focus:border-secondary-500 focus:ring-secondary-500 text-sm border p-2.5 bg-white"
                                        value={formData.experience_years}
                                        onChange={e => updateFormField('experience_years', e.target.value)}
                                    >
                                        <option value="Sin experiencia">Sin experiencia</option>
                                        <option value="Menos de 1 año">Menos de 1 año</option>
                                        <option value="1 a 3 años">1 a 3 años</option>
                                        <option value="3 a 5 años">3 a 5 años</option>
                                        <option value="Más de 5 años">Más de 5 años</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Licencias de manejo vigentes</label>
                                    <select
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs focus:border-secondary-500 focus:ring-secondary-500 text-sm border p-2.5 bg-white"
                                        value={formData.driver_license}
                                        onChange={e => updateFormField('driver_license', e.target.value)}
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
                            </div>

                            <div className="flex justify-center pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    disabled={!isSectionDirty(4)}
                                    onClick={() => saveProfileData(formData, 'Oficios y Licencias')}
                                    className={`px-6 py-2 rounded-lg text-xs font-bold transition-all shadow-2xs ${
                                        isSectionDirty(4)
                                            ? 'bg-secondary-600 hover:bg-secondary-700 text-white cursor-pointer shadow-md'
                                            : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                                    }`}
                                >
                                    Guardar Oficios y Licencias
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ACCORDION 5: EXPERIENCIA LABORAL */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <button
                        type="button"
                        onClick={() => toggleSection('s5')}
                        className="w-full bg-slate-50/80 p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-100/80 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-900 text-base sm:text-lg">5. Experiencia Laboral</span>
                            {getSectionStatus(5) === 'complete' && (
                                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-200">
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Completo
                                </span>
                            )}
                            {getSectionStatus(5) === 'incomplete' && (
                                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                    <AlertCircle className="w-3.5 h-3.5 mr-1" /> En progreso
                                </span>
                            )}
                            {getSectionStatus(5) === 'unstarted' && (
                                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                    Sin comenzar
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
                                            {index === 0 ? 'Último empleo o empleo actual' : `Empleo #${index + 1}`}
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
                                            <label className="block text-xs font-medium text-slate-700">Nombre de la empresa</label>
                                            <input
                                                type="text"
                                                autoCapitalize="words"
                                                placeholder="Ej. Transportes del Norte, OXXO, CFE"
                                                className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs text-sm border p-2.5"
                                                value={exp.company}
                                                onChange={e => handleWorkHistoryChange(index, 'company', e.target.value)}
                                                onBlur={() => handleWorkHistoryBlur(index, 'company')}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700">Puesto desempeñado</label>
                                            <input
                                                type="text"
                                                autoCapitalize="words"
                                                placeholder="Ej. Ayudante General"
                                                className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs text-sm border p-2.5 capitalize"
                                                value={exp.position}
                                                onChange={e => handleWorkHistoryChange(index, 'position', e.target.value)}
                                                onBlur={() => handleWorkHistoryBlur(index, 'position')}
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
                                            <label className="block text-xs font-medium text-slate-700">Sueldo aproximado ($ MXN)</label>
                                            <div className="relative mt-1">
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 text-xs font-bold">$</span>
                                                <input
                                                    type="text"
                                                    placeholder="Ej. 10,000"
                                                    className="block w-full rounded-lg border-slate-300 pl-7 pr-12 shadow-2xs text-sm border p-2.5"
                                                    value={exp.salary}
                                                    onChange={e => handleWorkHistoryChange(index, 'salary', e.target.value)}
                                                    onBlur={() => handleWorkSalaryBlur(index)}
                                                />
                                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 text-xs font-semibold">MXN</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700">Actividades realizadas o responsabilidades principales</label>
                                        <textarea
                                            rows={2}
                                            autoCapitalize="sentences"
                                            placeholder="Ej. Carga y descarga de mercancía, entrega a clientes"
                                            className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs text-sm border p-2.5"
                                            value={exp.activities}
                                            onChange={e => handleWorkHistoryChange(index, 'activities', e.target.value)}
                                            onBlur={() => handleWorkHistoryBlur(index, 'activities', true)}
                                        />
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addWorkExperience}
                                className="w-full border-2 border-dashed border-secondary-300 text-secondary-700 hover:bg-secondary-50 font-bold p-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
                            >
                                <Plus className="w-4 h-4" /> Agregar otro empleo
                            </button>

                            <div className="flex justify-center pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    disabled={!isSectionDirty(5)}
                                    onClick={() => saveProfileData(formData, 'Experiencia Laboral')}
                                    className={`px-6 py-2 rounded-lg text-xs font-bold transition-all shadow-2xs ${
                                        isSectionDirty(5)
                                            ? 'bg-secondary-600 hover:bg-secondary-700 text-white cursor-pointer shadow-md'
                                            : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                                    }`}
                                >
                                    Guardar Experiencia Laboral
                                </button>
                            </div>
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
                            {getSectionStatus(6) === 'complete' && (
                                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-200">
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Completo
                                </span>
                            )}
                            {getSectionStatus(6) === 'incomplete' && (
                                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                    <AlertCircle className="w-3.5 h-3.5 mr-1" /> En progreso
                                </span>
                            )}
                            {getSectionStatus(6) === 'unstarted' && (
                                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                    Sin comenzar
                                </span>
                            )}
                        </div>
                        {expandedSections.s6 ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                    </button>

                    {expandedSections.s6 && (
                        <div className="p-5 sm:p-6 space-y-6 border-t border-slate-200 bg-white">
                            {formData.references.map((ref, idx) => (
                                <div key={idx} className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/40 relative space-y-4">
                                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                                        <h4 className="font-bold text-slate-800 text-sm">
                                            Referencia #{idx + 1}
                                        </h4>
                                        {formData.references.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeReference(idx)}
                                                className="text-red-600 hover:text-red-800 text-xs font-semibold flex items-center gap-1"
                                            >
                                                <Trash2 className="w-4 h-4" /> Eliminar
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Nombre completo de la referencia</label>
                                            <input
                                                type="text"
                                                autoCapitalize="words"
                                                placeholder="Ej. Juan Pérez"
                                                className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs text-sm border p-2.5 capitalize"
                                                value={ref.ref_name}
                                                onChange={e => handleReferenceChange(idx, 'ref_name', e.target.value)}
                                                onBlur={() => handleReferenceBlur(idx, 'ref_name')}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Teléfono de contacto</label>
                                            <input
                                                type="tel"
                                                placeholder="Ej. (999) 123-4567"
                                                className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs text-sm border p-2.5"
                                                value={ref.ref_phone}
                                                onChange={e => handleReferenceChange(idx, 'ref_phone', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700">Puesto y empresa donde colaboraron</label>
                                            <input
                                                type="text"
                                                autoCapitalize="words"
                                                placeholder="Ej. Gerente de Operaciones"
                                                className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs text-sm border p-2.5 capitalize"
                                                value={ref.ref_position_company}
                                                onChange={e => handleReferenceChange(idx, 'ref_position_company', e.target.value)}
                                                onBlur={() => handleReferenceBlur(idx, 'ref_position_company')}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Cargar PDF con carta de recomendación (Opcional)</label>
                                        <p className="text-xs text-slate-500 mb-2">Formatos permitidos: PDF. Tamaño máximo admitido: 5 MB.</p>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="file"
                                                accept="application/pdf"
                                                id={`pdf-upload-${idx}`}
                                                className="hidden"
                                                onChange={e => handleReferenceFileUpload(idx, e)}
                                            />
                                            <label
                                                htmlFor={`pdf-upload-${idx}`}
                                                className="cursor-pointer bg-slate-50 border border-slate-300 hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors"
                                            >
                                                <FileText className="w-4 h-4 text-slate-500" />
                                                {ref.ref_recommendation_pdf ? 'Cambiar PDF' : 'Sube tu archivo PDF'}
                                            </label>
                                            {ref.ref_recommendation_pdf && (
                                                <span className="text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-md border border-green-200">
                                                    ✓ Carta cargada correctamente
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addReference}
                                className="w-full border-2 border-dashed border-secondary-300 text-secondary-700 hover:bg-secondary-50 font-bold p-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
                            >
                                <Plus className="w-4 h-4" /> Agregar otra referencia
                            </button>

                            <div className="flex justify-center pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    disabled={!isSectionDirty(6)}
                                    onClick={() => saveProfileData(formData, 'Referencias de Confianza')}
                                    className={`px-6 py-2 rounded-lg text-xs font-bold transition-all shadow-2xs ${
                                        isSectionDirty(6)
                                            ? 'bg-secondary-600 hover:bg-secondary-700 text-white cursor-pointer shadow-md'
                                            : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                                    }`}
                                >
                                    Guardar Referencias
                                </button>
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
                            {getSectionStatus(7) === 'complete' && (
                                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-200">
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Completo
                                </span>
                            )}
                            {getSectionStatus(7) === 'incomplete' && (
                                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                    <AlertCircle className="w-3.5 h-3.5 mr-1" /> En progreso
                                </span>
                            )}
                            {getSectionStatus(7) === 'unstarted' && (
                                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                    Sin comenzar
                                </span>
                            )}
                        </div>
                        {expandedSections.s7 ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                    </button>

                    {expandedSections.s7 && (
                        <div className="p-5 sm:p-6 space-y-4 border-t border-slate-200 bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Expectativa de sueldo mensual deseado ($ MXN)</label>
                                    <div className="relative mt-1">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 text-xs font-bold">$</span>
                                        <input
                                            type="text"
                                            placeholder="Ej. 10,000"
                                            className="block w-full rounded-lg border-slate-300 pl-7 pr-20 shadow-2xs text-sm border p-2.5"
                                            value={formData.expected_salary}
                                            onChange={e => updateFormField('expected_salary', e.target.value)}
                                            onBlur={() => handleSalaryBlur('expected_salary')}
                                        />
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 text-xs font-semibold">MXN / mes</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Fecha o tiempo en que podría iniciar a laborar</label>
                                    <select
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs text-sm border p-2.5 bg-white"
                                        value={formData.start_availability}
                                        onChange={e => updateFormField('start_availability', e.target.value)}
                                    >
                                        <option value="Inmediata">Inmediata</option>
                                        <option value="En 1 semana">En 1 semana</option>
                                        <option value="En 2 semanas">En 2 semanas</option>
                                        <option value="En 1 mes">En 1 mes</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Disponibilidad de horario o turnos</label>
                                    <select
                                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-2xs text-sm border p-2.5 bg-white"
                                        value={formData.shift_availability}
                                        onChange={e => updateFormField('shift_availability', e.target.value)}
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
                                        onChange={e => updateFormField('travel_availability', e.target.value)}
                                    >
                                        <option value="Sí">Sí</option>
                                        <option value="No">No</option>
                                        <option value="Solo para viajar">Solo para viajar</option>
                                        <option value="Solo cambio de residencia">Solo cambio de residencia</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-center pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    disabled={!isSectionDirty(7)}
                                    onClick={() => saveProfileData(formData, 'Disponibilidad y Expectativas')}
                                    className={`px-6 py-2 rounded-lg text-xs font-bold transition-all shadow-2xs ${
                                        isSectionDirty(7)
                                            ? 'bg-secondary-600 hover:bg-secondary-700 text-white cursor-pointer shadow-md'
                                            : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                                    }`}
                                >
                                    Guardar Disponibilidad
                                </button>
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
                            autoCapitalize="sentences"
                            className="w-full rounded-lg border-slate-300 shadow-2xs text-sm border p-2.5"
                            value={comments}
                            onChange={e => setComments(e.target.value)}
                            onBlur={() => setComments(prev => capitalizeSentence(prev))}
                            placeholder="Cuéntanos brevemente..."
                        />
                    </div>
                )}

                {/* BOTONES PRINCIPALES DE ACCIÓN */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={() => navigate(jobToApply ? `/jobs/${jobToApply.id}` : '/profile')}
                        className="w-full sm:w-auto bg-white text-slate-700 px-5 py-2.5 rounded-xl text-sm font-medium border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        className="w-full sm:w-auto bg-secondary-600 hover:bg-secondary-700 text-white px-8 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-md cursor-pointer"
                    >
                        {jobToApply ? 'Enviar Postulación' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfileEditPage;
