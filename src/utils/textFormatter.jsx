import React from 'react';
import { ClipboardCheck, Clock, ListChecks, Gift, MessageSquare, ChevronRight } from 'lucide-react';

/**
 * Renders job description text formatted into structured cards
 * inspired by the SNE scraper preview layout (Requisitos, Horarios, Funciones, Prestaciones, Proceso).
 */
export const FormattedDescription = ({ text }) => {
    if (!text) return null;

    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    // Group lines into sections if section headings exist
    const sections = [];
    let currentSection = { title: 'Descripción de la Vacante', icon: 'default', items: [] };

    const getSectionMeta = (titleLower) => {
        if (titleLower.includes('requisito') || titleLower.includes('perfil') || titleLower.includes('escolaridad')) {
            return { title: 'Requisitos del Puesto', icon: ClipboardCheck, color: 'text-sky-600 bg-sky-50 border-sky-100' };
        }
        if (titleLower.includes('horario') || titleLower.includes('jornada') || titleLower.includes('días')) {
            return { title: 'Horarios y Jornada', icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-100' };
        }
        if (titleLower.includes('funcion') || titleLower.includes('actividad') || titleLower.includes('tarea') || titleLower.includes('responsabil')) {
            return { title: 'Funciones y Actividades', icon: ListChecks, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' };
        }
        if (titleLower.includes('prestacion') || titleLower.includes('beneficio') || titleLower.includes('ofrecemos')) {
            return { title: 'Prestaciones y Beneficios', icon: Gift, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' };
        }
        if (titleLower.includes('proceso') || titleLower.includes('contacto') || titleLower.includes('reclutamiento')) {
            return { title: 'Proceso de Reclutamiento', icon: MessageSquare, color: 'text-purple-600 bg-purple-50 border-purple-100' };
        }
        return { title: 'Detalles Adicionales', icon: ChevronRight, color: 'text-slate-600 bg-slate-50 border-slate-200' };
    };

    lines.forEach((line) => {
        const isHeading = /^(requisitos|funciones|ofrecemos|beneficios|actividades|contacto|perfil|horarios|horario|jornada|sueldo|ubicación|proceso):/i.test(line) ||
            (line.endsWith(':') && line.length < 40);

        if (isHeading) {
            if (currentSection.items.length > 0) {
                sections.push(currentSection);
            }
            const cleanHeading = line.replace(/:$/, '').trim();
            const meta = getSectionMeta(cleanHeading.toLowerCase());
            currentSection = { ...meta, rawTitle: cleanHeading, items: [] };
        } else {
            const cleanBullet = line.replace(/^[•\-\*\d+\.]\s+/, '');
            currentSection.items.push(cleanBullet);
        }
    });

    if (currentSection.items.length > 0) {
        sections.push(currentSection);
    }

    // If no explicit section headers were found, render as clean bullet/paragraph list
    if (sections.length <= 1) {
        return (
            <div className="space-y-3 text-slate-700 text-sm leading-relaxed bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5">
                {lines.map((line, idx) => {
                    const isBullet = /^[•\-\*\d+\.]\s+/.test(line);
                    const cleanText = line.replace(/^[•\-\*\d+\.]\s+/, '');
                    return isBullet ? (
                        <div key={idx} className="flex items-start gap-2.5 my-1">
                            <span className="text-secondary-600 font-bold text-base leading-none select-none">•</span>
                            <span className="flex-1 font-medium">{cleanText}</span>
                        </div>
                    ) : (
                        <p key={idx} className="my-1 font-medium">{line}</p>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections.map((sec, idx) => {
                const Icon = sec.icon || ChevronRight;
                const isFullWidth = sec.title === 'Proceso de Reclutamiento' || (sections.length % 2 !== 0 && idx === sections.length - 1);

                return (
                    <div
                        key={idx}
                        className={`bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4.5 transition-all ${isFullWidth ? 'md:col-span-2' : ''}`}
                    >
                        <div className="flex items-center gap-2.5 mb-3">
                            <div className={`p-2 rounded-xl border ${sec.color || 'bg-slate-100 text-slate-600'}`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <h4 className="font-extrabold text-slate-900 text-sm tracking-tight">
                                {sec.rawTitle || sec.title}
                            </h4>
                        </div>

                        <div className="space-y-2 text-slate-700 text-xs sm:text-sm">
                            {sec.items.map((item, itemIdx) => (
                                <div key={itemIdx} className="flex items-start gap-2">
                                    <span className="text-secondary-500 font-bold text-xs select-none mt-0.5">•</span>
                                    <span className="flex-1 font-medium leading-relaxed">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
