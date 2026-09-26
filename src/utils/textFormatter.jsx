import React from 'react';
import { ClipboardCheck, Clock, ListChecks, Gift, MessageSquare, ChevronRight, FileText } from 'lucide-react';

/**
 * Renders job description text formatted into structured cards
 * inspired by the SNE scraper preview layout (Requisitos, Horarios, Funciones, Prestaciones, Proceso).
 */
export const FormattedDescription = ({ text, isMobileDeck = false }) => {
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

    const renderFormattedText = (str) => {
        if (!str) return null;
        const parts = str.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                const inner = part.slice(2, -2);
                return <strong key={i} className="font-extrabold text-slate-900">{inner}</strong>;
            }
            return part;
        });
    };

    lines.forEach((line) => {
        // Detect markdown bold headings like **Contacto / Postulación:** or **Requisitos:** or standard headings
        const isBoldHeading = /^\*\*(.*?)\*\*:?$/.test(line);
        const isStandardHeading = /^(requisitos|funciones|ofrecemos|beneficios|actividades|contacto|perfil|horarios|horario|jornada|sueldo|ubicación|proceso):/i.test(line) ||
            (line.endsWith(':') && line.length < 50);

        const isHeading = isBoldHeading || isStandardHeading;

        if (isHeading) {
            if (currentSection.items.length > 0) {
                sections.push(currentSection);
            }
            const cleanHeading = line.replace(/^\*\*/, '').replace(/\*\*:?$/, '').replace(/:$/, '').trim();
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

    const cardBgClass = isMobileDeck
        ? 'bg-transparent border-0 p-0 sm:p-5 shadow-none'
        : 'bg-slate-50/90 border border-slate-200/90 rounded-2xl p-5 shadow-2xs';

    // If no explicit section headers were found, render as single structured block!
    if (sections.length <= 1) {
        return (
            <div className={`space-y-3 text-slate-700 text-sm leading-relaxed ${cardBgClass}`}>
                <div className="pb-2.5 mb-3.5 border-b border-slate-200/70">
                    <h4 className="font-extrabold text-orange-600 text-sm sm:text-base tracking-tight">
                        Descripción de la Vacante
                    </h4>
                </div>
                {lines.map((line, idx) => {
                    const isBullet = /^[•\-\*\d+\.]\s+/.test(line);
                    const cleanText = line.replace(/^[•\-\*\d+\.]\s+/, '');
                    return isBullet ? (
                        <div key={idx} className="flex items-start gap-2.5 my-1">
                            <span className="text-orange-600 font-bold text-base leading-none select-none">•</span>
                            <span className="flex-1 font-medium">{renderFormattedText(cleanText)}</span>
                        </div>
                    ) : (
                        <p key={idx} className="my-1 font-medium">{renderFormattedText(line)}</p>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 w-full">
            {sections.map((sec, idx) => {
                return (
                    <div
                        key={idx}
                        className={`transition-all w-full ${cardBgClass}`}
                    >
                        <div className="pb-2.5 mb-3.5 border-b border-slate-200/70">
                            <h4 className="font-extrabold text-orange-600 text-sm sm:text-base tracking-tight">
                                {sec.rawTitle || sec.title}
                            </h4>
                        </div>

                        <div className="space-y-2 text-slate-700 text-xs sm:text-sm">
                            {sec.items.map((item, itemIdx) => (
                                <div key={itemIdx} className="flex items-start gap-2">
                                    <span className="text-orange-500 font-bold text-xs select-none mt-0.5">•</span>
                                    <span className="flex-1 font-medium leading-relaxed">{renderFormattedText(item)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default FormattedDescription;
