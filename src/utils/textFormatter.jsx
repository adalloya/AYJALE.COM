import React from 'react';

/**
 * Renders job description text formatted with Markdown-style bullets,
 * headings, and clear line breaks.
 */
export const FormattedDescription = ({ text }) => {
    if (!text) return null;

    const lines = text.split(/\r?\n/);

    return (
        <div className="space-y-2 text-slate-700 text-sm leading-relaxed">
            {lines.map((line, idx) => {
                const trimmed = line.trim();
                if (!trimmed) {
                    return <div key={idx} className="h-1.5" />;
                }

                // Check for Section Headings (e.g., "Requisitos:", "Beneficios:", "Ofrecemos:")
                const isHeading = /^(requisitos|funciones|ofrecemos|beneficios|actividades|contacto|perfil|horario|sueldo|ubicación):/i.test(trimmed) ||
                    (trimmed.endsWith(':') && trimmed.length < 40);

                // Check for Bullet points (e.g., "-", "*", "•", "1.", "2.")
                const isBullet = /^[•\-\*\d+\.]\s+/.test(trimmed);

                if (isHeading) {
                    return (
                        <h4 key={idx} className="font-bold text-slate-900 text-sm mt-4 mb-1">
                            {trimmed}
                        </h4>
                    );
                }

                if (isBullet) {
                    const cleanBullet = trimmed.replace(/^[•\-\*\d+\.]\s+/, '');
                    return (
                        <div key={idx} className="flex items-start gap-2.5 pl-1 my-1">
                            <span className="text-secondary-600 font-bold text-base leading-tight select-none">•</span>
                            <span className="flex-1">{cleanBullet}</span>
                        </div>
                    );
                }

                return (
                    <p key={idx} className="my-1">
                        {trimmed}
                    </p>
                );
            })}
        </div>
    );
};
