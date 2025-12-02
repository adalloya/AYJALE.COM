import { useState, useEffect } from 'react';
import { X, Save, Building2, Phone, MapPin, FileText, User } from 'lucide-react';
import { MEXICAN_STATES } from '../../data/mockData';
import { MEXICO_DATA } from '../../data/mexicoData';

const EditCompanyProfileModal = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: user.name || '',
        rfc: user.rfc || '',
        recruiter_name: user.recruiter_name || '',
        phone_number: user.phone_number || '',
        industry: user.industry || '',
        location: user.location || '', // State
        city: user.city || '',         // City
        address: user.address || ''
    });

    // Parse existing location if it's "City, State"
    useEffect(() => {
        if (user.location && user.location.includes(',')) {
            const parts = user.location.split(',').map(p => p.trim());
            if (parts.length >= 2) {
                const possibleState = parts[parts.length - 1];
                if (MEXICAN_STATES.includes(possibleState)) {
                    setFormData(prev => ({
                        ...prev,
                        location: possibleState,
                        city: parts.slice(0, parts.length - 1).join(', ')
                    }));
                }
            }
        } else if (MEXICAN_STATES.includes(user.location)) {
            setFormData(prev => ({ ...prev, location: user.location }));
        }
    }, [user.location]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Combine City and State
        const fullLocation = formData.city
            ? `${formData.city}, ${formData.location}`
            : formData.location;

        onSave({
            ...formData,
            location: fullLocation
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900">Editar Perfil de Empresa</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Company Name */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de la Empresa</label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
                                <input
                                    type="text"
                                    required
                                    className="pl-10 w-full border border-slate-300 rounded-lg py-2 focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* RFC */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">R.F.C. <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
                                <input
                                    type="text"
                                    required
                                    className="pl-10 w-full border border-slate-300 rounded-lg py-2 focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
                                    value={formData.rfc}
                                    onChange={e => setFormData({ ...formData, rfc: e.target.value })}
                                    placeholder="R.F.C."
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
                                <input
                                    type="tel"
                                    required
                                    className="pl-10 w-full border border-slate-300 rounded-lg py-2 focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
                                    value={formData.phone_number}
                                    onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                                    placeholder="Requerido"
                                />
                            </div>
                        </div>

                        {/* Recruiter Name */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Reclutador / Contacto</label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
                                <input
                                    type="text"
                                    className="pl-10 w-full border border-slate-300 rounded-lg py-2 focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
                                    value={formData.recruiter_name}
                                    onChange={e => setFormData({ ...formData, recruiter_name: e.target.value })}
                                    placeholder="¿Quién gestiona esta cuenta?"
                                />
                            </div>
                        </div>

                        {/* Industry */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Industria / Sector</label>
                            <select
                                className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 bg-white"
                                value={formData.industry}
                                onChange={e => setFormData({ ...formData, industry: e.target.value })}
                            >
                                <option value="">Seleccionar...</option>
                                <option value="Tecnología">Tecnología</option>
                                <option value="Salud">Salud</option>
                                <option value="Educación">Educación</option>
                                <option value="Finanzas">Finanzas</option>
                                <option value="Manufactura">Manufactura</option>
                                <option value="Comercio">Comercio</option>
                                <option value="Servicios">Servicios</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>

                        {/* Location: State */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                            <div className="relative">
                                <select
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none appearance-none bg-white text-sm"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value, city: '' })}
                                >
                                    <option value="">Seleccionar Estado...</option>
                                    {MEXICAN_STATES.map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Location: City */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Ciudad / Municipio</label>
                            <select
                                disabled={!formData.location}
                                className={`w-full border border-slate-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 bg-white ${!formData.location ? 'bg-slate-100 text-slate-400' : ''}`}
                                value={formData.city}
                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                            >
                                <option value="">Seleccionar Ciudad...</option>
                                {formData.location && MEXICO_DATA[formData.location]?.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        {/* Address */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Dirección Completa (Opcional)</label>
                            <textarea
                                rows={2}
                                className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Calle, Número, Colonia, CP..."
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-700 font-medium hover:bg-slate-50 rounded-lg mr-2"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-secondary-600 text-white font-bold rounded-lg hover:bg-secondary-700 flex items-center shadow-md"
                        >
                            <Save className="w-5 h-5 mr-2" />
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCompanyProfileModal;
