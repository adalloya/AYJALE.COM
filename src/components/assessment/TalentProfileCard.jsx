import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Brain, MessageSquare, Zap } from 'lucide-react';

const TalentProfileCard = ({ profile }) => {
    if (!profile || !profile.scores) return null;

    const { scores } = profile;

    // Big 5 Data for Radar Chart
    const psychData = [
        { subject: 'Apertura', A: scores.Openness || 0, fullMark: 100 },
        { subject: 'Responsabilidad', A: scores.Conscientiousness || 0, fullMark: 100 },
        { subject: 'Extroversión', A: scores.Extraversion || 0, fullMark: 100 },
        { subject: 'Amabilidad', A: scores.Agreeableness || 0, fullMark: 100 },
        { subject: 'Neuroticismo', A: scores.Neuroticism || 0, fullMark: 100 },
    ];

    // Cognitive & Language Data
    const cognitiveScore = scores.Logic_Reasoning || 0;
    const englishLevel = scores.English_Level || 'N/A';

    const getEnglishColor = (level) => {
        if (['C1', 'C2'].includes(level)) return 'text-green-600 bg-green-100';
        if (['B1', 'B2'].includes(level)) return 'text-blue-600 bg-blue-100';
        return 'text-yellow-600 bg-yellow-100';
    };

    const generateAnalysis = () => {
        const traits = [];
        if (scores.Openness > 60) traits.push("alta apertura a nuevas experiencias, sugiriendo creatividad y curiosidad");
        else if (scores.Openness < 40) traits.push("enfoque pragmático y preferencia por lo familiar");

        if (scores.Conscientiousness > 60) traits.push("fuerte sentido de responsabilidad y organización");
        else if (scores.Conscientiousness < 40) traits.push("flexibilidad y espontaneidad en su método de trabajo");

        if (scores.Extraversion > 60) traits.push("tendencia a ser sociable y energético en grupos");
        else if (scores.Extraversion < 40) traits.push("perfil reservado, ideal para trabajo concentrado e individual");

        if (scores.Agreeableness > 60) traits.push("gran disposición a la colaboración y empatía");
        else if (scores.Agreeableness < 40) traits.push("estilo directo y competitivo, enfocado en resultados");

        if (scores.Neuroticism > 60) traits.push("sensibilidad emocional que puede requerir un entorno de apoyo");
        else if (scores.Neuroticism < 40) traits.push("alta estabilidad emocional y resistencia al estrés");

        const personalitySummary = traits.length > 0
            ? `El candidato muestra ${traits.join(", además de ")}.`
            : "El candidato presenta un perfil balanceado en sus rasgos de personalidad.";

        let logicSummary = "";
        if (cognitiveScore >= 80) logicSummary = "Sobresaliente capacidad de razonamiento lógico y resolución de problemas complejos.";
        else if (cognitiveScore >= 60) logicSummary = "Buena capacidad para identificar patrones y resolver problemas lógicos.";
        else if (cognitiveScore >= 40) logicSummary = "Habilidad promedio para el razonamiento lógico, adecuado para tareas estándar.";
        else logicSummary = "Puede requerir apoyo en tareas que involucren lógica abstracta compleja.";

        let englishSummary = "";
        if (['C1', 'C2'].includes(englishLevel)) englishSummary = "Dominio avanzado del inglés, capaz de desenvolverse fluidamente en entornos profesionales exigentes.";
        else if (['B1', 'B2'].includes(englishLevel)) englishSummary = "Nivel intermedio de inglés, adecuado para comunicación funcional y técnica.";
        else englishSummary = "Nivel básico de inglés, en proceso de desarrollo.";

        return { personalitySummary, logicSummary, englishSummary };
    };

    const analysis = generateAnalysis();

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Zap className="text-yellow-500" size={20} />
                Perfil de Talento IA
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Personality Radar */}
                <div className="h-64 relative">
                    <h4 className="text-sm font-semibold text-slate-500 mb-2 text-center">Personalidad (Big 5)</h4>
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="60%" data={psychData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#64748b' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                            <Radar
                                name="Candidato"
                                dataKey="A"
                                stroke="#2563eb"
                                fill="#3b82f6"
                                fillOpacity={0.6}
                            />
                            <Tooltip />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                {/* Cognitive & Language Stats */}
                <div className="flex flex-col justify-center space-y-8">
                    {/* Cognitive Score */}
                    <div className="bg-slate-50 p-8 rounded-xl border border-slate-100">
                        <div className="flex flex-col items-center gap-3 mb-6">
                            <div className="flex items-center gap-2 text-slate-700 font-medium">
                                <Brain size={20} />
                                <span className="text-lg">Razonamiento Lógico</span>
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide ${cognitiveScore >= 80 ? 'bg-indigo-100 text-indigo-700' :
                                cognitiveScore >= 60 ? 'bg-blue-100 text-blue-700' :
                                    cognitiveScore >= 40 ? 'bg-slate-100 text-slate-700' :
                                        'bg-slate-100 text-slate-500'
                                }`}>
                                {cognitiveScore >= 80 ? 'Avanzado' :
                                    cognitiveScore >= 60 ? 'Intermedio' :
                                        cognitiveScore >= 40 ? 'Básico' : 'Inicial'}
                            </span>
                        </div>

                        {/* Segmented Bar */}
                        <div className="flex gap-2 h-3 w-full">
                            {[20, 40, 60, 80, 100].map((threshold) => (
                                <div
                                    key={threshold}
                                    className={`flex-1 rounded-full transition-all duration-500 ${cognitiveScore >= threshold
                                        ? (cognitiveScore >= 80 ? 'bg-indigo-500' :
                                            cognitiveScore >= 60 ? 'bg-blue-500' : 'bg-slate-400')
                                        : 'bg-slate-200'
                                        }`}
                                ></div>
                            ))}
                        </div>
                        <p className="text-sm text-slate-400 mt-3 text-right">
                            Nivel de competencia
                        </p>
                    </div>

                    {/* Language Level */}
                    <div className="bg-slate-50 p-8 rounded-xl border border-slate-100">
                        <div className="flex flex-col items-center gap-3 mb-6">
                            <div className="flex items-center gap-2 text-slate-700 font-medium">
                                <MessageSquare size={20} />
                                <span className="text-lg">Nivel de Inglés</span>
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${getEnglishColor(englishLevel)}`}>
                                {englishLevel}
                            </span>
                        </div>

                        {/* English Segmented Bar */}
                        <div className="flex gap-2 h-3 w-full">
                            {['A1', 'A2', 'B1', 'B2', 'C1'].map((lvl, index) => {
                                // Simple mapping for bar visualization
                                const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
                                const currentIdx = levels.indexOf(englishLevel);
                                const thresholdIdx = index;
                                const isActive = currentIdx >= thresholdIdx;

                                let activeColor = 'bg-slate-400';
                                if (['C1', 'C2'].includes(englishLevel)) activeColor = 'bg-green-500';
                                else if (['B1', 'B2'].includes(englishLevel)) activeColor = 'bg-blue-500';
                                else activeColor = 'bg-yellow-500';

                                return (
                                    <div
                                        key={lvl}
                                        className={`flex-1 rounded-full transition-all duration-500 ${isActive ? activeColor : 'bg-slate-200'}`}
                                    ></div>
                                );
                            })}
                        </div>
                        <p className="text-sm text-slate-500 mt-3 text-right">
                            Estimado basado en análisis de voz y texto.
                        </p>
                    </div>
                </div>
            </div>

            {/* AI Analysis Section */}
            <div className="border-t border-slate-100 pt-6">
                <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    Interpretación de Resultados
                </h4>
                <div className="space-y-4 text-sm text-slate-600">
                    <p><strong className="text-slate-700">Personalidad:</strong> {analysis.personalitySummary}</p>
                    <p><strong className="text-slate-700">Cognitivo:</strong> {analysis.logicSummary}</p>
                    <p><strong className="text-slate-700">Idiomas:</strong> {analysis.englishSummary}</p>
                </div>
            </div>
        </div>
    );
};

export default TalentProfileCard;
