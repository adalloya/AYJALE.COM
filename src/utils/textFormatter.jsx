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
            return { title: 'Requisitos del Puesto', icon: ClipboardCheck, color: 'text-orange-600 bg-orange-50 border-orange-100' };
        }
        if (titleLower.includes('horario') || titleLower.includes('jornada') || titleLower.includes('días')) {
            return { title: 'Horarios y Jornada', icon: Clock, color: 'text-orange-600 bg-orange-50 border-orange-100' };
        }
        if (titleLower.includes('funcion') || titleLower.includes('actividad') || titleLower.includes('tarea') || titleLower.includes('responsabil')) {
            return { title: 'Funciones y Actividades', icon: ListChecks, color: 'text-orange-600 bg-orange-50 border-orange-100' };
        }
        if (titleLower.includes('prestacion') || titleLower.includes('beneficio') || titleLower.includes('ofrecemos')) {
            return { title: 'Prestaciones y Beneficios', icon: Gift, color: 'text-orange-600 bg-orange-50 border-orange-100' };
        }
        if (titleLower.includes('proceso') || titleLower.includes('contacto') || titleLower.includes('reclutamiento')) {
            return { title: 'Proceso de Reclutamiento', icon: MessageSquare, color: 'text-orange-600 bg-orange-50 border-orange-100' };
        }
        return { title: 'Detalles Adicionales', icon: ChevronRight, color: 'text-orange-600 bg-orange-50 border-orange-100' };
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

    // If no explicit section headers were found, render as single structured card
    if (sections.length <= 1) {
        return (
            <div className="space-y-3 text-slate-700 text-sm leading-relaxed bg-slate-50/90 border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
                {lines.map((line, idx) => {
                    const isBullet = /^[•\-\*\d+\.]\s+/.test(line);
                    const cleanText = line.replace(/^[•\-\*\d+\.]\s+/, '');
                    return isBullet ? (
                        <div key={idx} className="flex items-start gap-2.5 my-1">
                            <span className="text-orange-600 font-bold text-base leading-none select-none">•</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
            {sections.map((sec, idx) => {
                const Icon = sec.icon || ChevronRight;
                // If odd number of sections (e.g. 5 sections), the 5th section spans full 2 columns as a wide rectangle!
                const isFullWidth = sec.title === 'Proceso de Reclutamiento' || (sections.length % 2 !== 0 && idx === sections.length - 1);

                return (
                    <div
                        key={idx}
                        className={`bg-slate-50/90 border border-slate-200/90 rounded-2xl p-5 shadow-2xs transition-all ${isFullWidth ? 'md:col-span-2' : ''}`}
                    >
                        <div className="flex items-center gap-2.5 mb-3.5 pb-2.5 border-b border-slate-200/70">
                            <div className={`p-2 rounded-xl border ${sec.color || 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                                <Icon className="w-4.5 h-4.5" />
                            </div>
                            <h4 className="font-extrabold text-orange-600 text-sm sm:text-base tracking-tight">
                                {sec.rawTitle || sec.title}
                            </h4>
                        </div>

                        <div className="space-y-2 text-slate-700 text-xs sm:text-sm">
                            {sec.items.map((item, itemIdx) => (
                                <div key={itemIdx} className="flex items-start gap-2">
                                    <span className="text-orange-500 font-bold text-xs select-none mt-0.5">•</span>
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
