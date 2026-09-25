import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert, CheckCircle2 } from 'lucide-react';

const REPORT_REASONS = [
    { id: 'fraude', label: 'Fraude o Estafa', desc: 'Piden dinero, cobros por exámenes o esquemas sospechosos' },
    { id: 'discriminacion', label: 'Discriminación', desc: 'Discriminación por edad, género, origen, discapacidad o religión' },
    { id: 'falsa', label: 'Información Falsa o Engañosa', desc: 'El sueldo, puesto u horario difieren totalmente de la oferta' },
    { id: 'ilegal', label: 'Condiciones Ilegales', desc: 'Oferta violatoria de la Ley Federal del Trabajo' },
    { id: 'spam', label: 'Spam o Vacante Duplicada', desc: 'Publicación repetida o contenido no relacionado a un empleo' },
    { id: 'otro', label: 'Otro motivo', desc: 'Describe la situación con tus propias palabras' },
];

const ReportJobModal = ({ isOpen, onClose, onSubmit, jobTitle, loading }) => {
    const [selectedReason, setSelectedReason] = useState('fraude');
    const [comments, setComments] = useState('');
    const [submitted, setSubmitted] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedReason === 'otro' && !comments.trim()) {
            alert('Por favor especifica los detalles en el campo de texto.');
            return;
        }

        const reasonObj = REPORT_REASONS.find(r => r.id === selectedReason);
        const reasonLabel = reasonObj ? reasonObj.label : selectedReason;

        await onSubmit({
            reason: reasonLabel,
            comments: comments.trim()
        });

        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            onClose();
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header Icon */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-50 text-red-600 rounded-2xl border border-red-100">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 leading-snug">Reportar Vacante</h3>
                            <p className="text-xs text-slate-500 font-medium truncate max-w-[260px] sm:max-w-xs">{jobTitle}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {submitted ? (
                    <div className="py-8 text-center space-y-3">
                        <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto border border-green-100">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h4 className="text-lg font-black text-slate-900">¡Vacante Desactivada y Reportada!</h4>
                        <p className="text-sm text-slate-600 max-w-xs mx-auto">
                            Gracias por tu reporte. La vacante ha sido desactivada automáticamente y nuestro equipo de seguridad la revisará.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                            Selecciona el motivo del reporte:
                        </p>

                        <div className="space-y-2.5 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                            {REPORT_REASONS.map(reason => (
                                <label
                                    key={reason.id}
                                    className={`flex items-start p-3 rounded-2xl border cursor-pointer transition-all ${selectedReason === reason.id ? 'border-red-500 bg-red-50/50 shadow-2xs' : 'border-slate-200/80 hover:bg-slate-50'}`}
                                >
                                    <input
                                        type="radio"
                                        name="report_reason"
                                        value={reason.id}
                                        checked={selectedReason === reason.id}
                                        onChange={() => setSelectedReason(reason.id)}
                                        className="mt-1 text-red-600 focus:ring-red-500 accent-red-600"
                                    />
                                    <div className="ml-3">
                                        <div className="text-xs sm:text-sm font-extrabold text-slate-900">{reason.label}</div>
                                        <div className="text-xs text-slate-500 font-medium">{reason.desc}</div>
                                    </div>
                                </label>
                            ))}
                        </div>

                        {selectedReason === 'otro' && (
                            <div className="pt-2">
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Detalles del reporte (campo abierto):
                                </label>
                                <textarea
                                    rows={3}
                                    required
                                    placeholder="Describe la situación sospechosa o inapropiada..."
                                    className="w-full p-3 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs sm:text-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2"
                            >
                                <AlertTriangle className="w-4 h-4" />
                                {loading ? 'Enviando...' : 'Enviar Reporte y Desactivar'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ReportJobModal;
