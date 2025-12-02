
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, MessageSquare, Mic, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';
import ChatInterface from '../../components/assessment/ChatInterface';
import AudioRecorder from '../../components/assessment/AudioRecorder';
import PuzzleCanvas from '../../components/assessment/PuzzleCanvas';
import { supabase } from '../../supabaseClient';

// Mock Data for Demo (In real app, fetch from API)
const MOCK_COGNITIVE_PUZZLES = [
    {
        type: 'abstract',
        matrix: [
            [{ shape: 'square', angle: 0 }, { shape: 'square', angle: 45 }, { shape: 'square', angle: 90 }],
            [{ shape: 'square', angle: 45 }, { shape: 'square', angle: 90 }, { shape: 'square', angle: 135 }],
            [{ shape: 'square', angle: 90 }, { shape: 'square', angle: 135 }, null]
        ],
        options: [
            { shape: 'square', angle: 180 },
            { shape: 'circle', angle: 0 },
            { shape: 'square', angle: 45 },
            { shape: 'triangle', angle: 90 }
        ]
    },
    {
        type: 'numerical',
        series: [2, 4, 8, 16, '?'],
        options: [32, 24, 18, 20]
    },
    {
        type: 'verbal',
        text: "Todos los Gerentes son Líderes. Algunos Empleados son Gerentes. Por lo tanto...",
        options: [
            "Algunos Empleados son Líderes.",
            "Todos los Empleados son Líderes.",
            "Ningún Empleado es Líder.",
            "Ninguna de las anteriores."
        ]
    }
];



const MOCK_PSYCH_QUESTIONS = [
    "Suelo tomar la iniciativa en situaciones grupales.",
    "Me siento cómodo siendo el centro de atención.",
    "Presto atención a los detalles más pequeños.",
    "Me estreso con facilidad ante cambios repentinos.",
    "Tengo una imaginación muy viva.",
    "Me intereso por los problemas de los demás."
];

const TestRunner = () => {
    const navigate = useNavigate();
    const [currentModule, setCurrentModule] = useState('psychometric'); // psychometric, cognitive, language
    const [progress, setProgress] = useState(0);
    const [questionIndex, setQuestionIndex] = useState(0);

    // Psychometric State
    const [psychAnswers, setPsychAnswers] = useState({});
    const [psychQuestions, setPsychQuestions] = useState([]);
    const [sessionId, setSessionId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [startTime, setStartTime] = useState(Date.now()); // Track start time for each question

    useEffect(() => {
        const initSession = async () => {
            try {
                // 1. Fetch Psychometric Questions
                const { data: questions, error: qError } = await supabase
                    .from('psych_items')
                    .select('*')
                    .order('id');

                if (qError) throw qError;
                setPsychQuestions(questions || []);

                // 2. Create or Restore Test Session
                const storedSessionId = localStorage.getItem('talentomx_session_id');
                if (storedSessionId) {
                    setSessionId(parseInt(storedSessionId));
                    return;
                }

                const { data: sessionData, error: sError } = await supabase.auth.getUser();
                if (sessionData?.user) {
                    const { data: session, error: sessionError } = await supabase
                        .from('test_sessions')
                        .insert([{
                            candidate_id: sessionData.user.id,
                            status: 'in_progress'
                        }])
                        .select()
                        .single();

                    if (sessionError) throw sessionError;
                    setSessionId(session.id);
                    localStorage.setItem('talentomx_session_id', session.id);
                }
            } catch (error) {
                console.error('Error initializing test:', error);
            } finally {
                setLoading(false);
            }
        };

        if (currentModule === 'psychometric') {
            initSession();
        }
    }, []);

    // Reset timer when question changes
    useEffect(() => {
        setStartTime(Date.now());
    }, [questionIndex]);

    const handlePsychAnswer = async (value) => {
        const timeTaken = Date.now() - startTime;

        // Save answer locally
        setPsychAnswers({ ...psychAnswers, [questionIndex]: value });

        // Save to Supabase
        if (sessionId && psychQuestions[questionIndex]) {
            const { error } = await supabase
                .from('item_responses')
                .insert([{
                    session_id: sessionId,
                    item_id: psychQuestions[questionIndex].id,
                    response_value: value,
                    response_time_ms: timeTaken
                }]);

            if (error) console.error('Error saving response:', error);
        }

        // Advance
        if (questionIndex < psychQuestions.length - 1) {
            setQuestionIndex(questionIndex + 1);
            // Calculate progress based on total items across all modules (approx)
            setProgress(prev => Math.min(prev + 5, 30));
        } else {
            setCurrentModule('cognitive');
            setQuestionIndex(0);
            setProgress(30);
        }
    };

    // Cognitive State
    const [cognitivePuzzle, setCognitivePuzzle] = useState(null);
    const [cognitiveScore, setCognitiveScore] = useState(0);

    // SIMULATION: Use Mock Data directly (No API)
    setLoading(true);
    setTimeout(() => {
        const mockType = ['abstract', 'numerical', 'verbal'][questionIndex % 3];
        const mockPuzzle = MOCK_COGNITIVE_PUZZLES.find(p => p.type === mockType) || MOCK_COGNITIVE_PUZZLES[0];
        setCognitivePuzzle(mockPuzzle);
        setLoading(false);
    }, 500);

    // Trigger fetch when entering cognitive module or changing question
    useEffect(() => {
        if (currentModule === 'cognitive') {
            fetchNextPuzzle();
        }
    }, [currentModule, questionIndex]);

    const handleCognitiveAnswer = async (answer) => {
        // In a real app, verify answer with backend
        // For now, we just assume if they clicked, they answered.
        // Ideally, the backend should validate the answer index.

        console.log('Cognitive Answer:', answer);

        if (questionIndex < 5) { // Limit to 6 puzzles for demo
            setQuestionIndex(prev => prev + 1);
            setProgress(prev => prev + 10);
        } else {
            setCurrentModule('language');
            setQuestionIndex(0);
            setProgress(60);
        }
    };

    // Language State
    const [sjtScenario, setSjtScenario] = useState(null);
    const [audioAnalysis, setAudioAnalysis] = useState(null);

    const fetchSJT = async () => {
        setLoading(true);
        // SIMULATION: Use Mock Data directly
        setTimeout(() => {
            setSjtScenario({
                text: "You are leading a project team that is behind schedule. One key member is underperforming due to personal issues. The client is demanding an update. What do you do?",
                options: [
                    "Discuss the situation privately with the member and reassign tasks temporarily.",
                    "Report the delay to the client immediately and ask for an extension.",
                    "Push the team to work overtime to catch up.",
                    "Ignore the personal issues and demand performance."
                ]
            });
            setLoading(false);
        }, 500);
    };

    useEffect(() => {
        if (currentModule === 'language') {
            fetchSJT();
        }
    }, [currentModule]);

    const handleLanguageAnswer = async (type, answer) => {
        console.log(`Language Answer(${type}): `, answer);

        if (type === 'audio') {
            // Upload audio for analysis
            const formData = new FormData();
            formData.append('file', answer, 'recording.webm');

            try {
                const response = await fetch('/api/v1/language/analyze/audio', {
                    method: 'POST',
                    body: formData
                });
                if (!response.ok) throw new Error('API Error');
                const data = await response.json();
                console.log('Audio Analysis:', data);
                setAudioAnalysis(data);
            } catch (error) {
                console.warn('API unavailable, using mock analysis:', error);
                setAudioAnalysis({
                    transcription: "Mock transcription of the user's answer.",
                    fluency_score: 85,
                    vocabulary_score: 80,
                    grammar_score: 90,
                    cefr_level: "B2"
                });
            }
        }
    };

    const handleNextLanguageQuestion = () => {
        // For demo, just finish after one question
        handleModuleComplete();
    };

    const handleModuleComplete = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/v1/results/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: sessionId,
                    cognitive_score: cognitiveScore, // TODO: Track actual score
                    language_analysis: audioAnalysis || {}
                })
            });
            if (!response.ok) throw new Error('API Error');
            const data = await response.json();
            console.log('Profile Generated:', data);
        } catch (error) {
            console.warn('API unavailable, generating mock profile:', error);
            // Generate mock profile locally if API fails
            if (sessionId) {
                await supabase.from('candidate_profiles').insert({
                    candidate_id: (await supabase.auth.getUser()).data.user.id,
                    session_id: sessionId,
                    scores: {
                        Openness: 75,
                        Conscientiousness: 80,
                        Extraversion: 60,
                        Agreeableness: 70,
                        Neuroticism: 40,
                        Logic_Reasoning: 85,
                        English_Level: "B2"
                    }
                });
            }
        } finally {
            setLoading(false);
            setCurrentModule('completed');
            setProgress(100);
        }
    };

    const renderModuleIndicator = () => (
        <div className="flex justify-between mb-8 px-4">
            <div className={`flex flex-col items-center gap-2 ${currentModule === 'psychometric' ? 'text-blue-600' : 'text-slate-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentModule === 'psychometric' ? 'border-blue-600 bg-blue-50' : 'border-slate-200'}`}>
                    <Brain size={20} />
                </div>
                <span className="text-xs font-medium">Personalidad</span>
            </div>
            <div className="h-[2px] bg-slate-200 flex-1 mt-5 mx-2" />
            <div className={`flex flex-col items-center gap-2 ${currentModule === 'cognitive' ? 'text-blue-600' : 'text-slate-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentModule === 'cognitive' ? 'border-blue-600 bg-blue-50' : 'border-slate-200'}`}>
                    <AlertCircle size={20} />
                </div>
                <span className="text-xs font-medium">Lógica</span>
            </div>
            <div className="h-[2px] bg-slate-200 flex-1 mt-5 mx-2" />
            <div className={`flex flex-col items-center gap-2 ${currentModule === 'language' ? 'text-blue-600' : 'text-slate-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentModule === 'language' ? 'border-blue-600 bg-blue-50' : 'border-slate-200'}`}>
                    <Mic size={20} />
                </div>
                <span className="text-xs font-medium">Idiomas</span>
            </div>
        </div>
    );

    if (currentModule === 'completed') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">¡Evaluación Completada!</h2>
                    <p className="text-slate-500 mb-6">
                        Nuestra IA está analizando tus resultados. Recibirás tu Perfil de Talento en breve.
                    </p>
                    <button
                        onClick={() => navigate('/evaluation-center')}
                        className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
                    >
                        Volver al Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[100dvh] bg-slate-50 flex flex-col overflow-hidden font-sans">
            <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col p-4 md:p-6 h-full">
                {/* Header */}
                <header className="mb-4 flex-shrink-0">
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Evaluación de Talento</h1>
                            <p className="text-slate-500 text-xs">ID Sesión: #8X92-L</p>
                        </div>
                        <div className="text-right">
                            <span className="text-xl font-bold text-blue-600">{progress}%</span>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Completado</p>
                        </div>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-600 transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </header>

                {renderModuleIndicator()}

                {/* Main Content Card */}
                <main className="bg-white rounded-2xl shadow-sm border border-slate-200 flex-1 overflow-hidden relative flex flex-col">
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-24">

                        {currentModule === 'psychometric' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-xl font-semibold text-slate-800 mb-6">
                                    ¿En qué medida estás de acuerdo con esta afirmación?
                                </h2>
                                <div className="h-48 p-6 bg-blue-50 rounded-xl border border-blue-100 mb-8 flex items-center justify-center text-center">
                                    {loading ? (
                                        <div className="animate-pulse w-full flex justify-center">
                                            <div className="h-8 w-3/4 bg-blue-200 rounded"></div>
                                        </div>
                                    ) : (
                                        <p className="text-xl md:text-2xl font-medium text-blue-900 leading-relaxed max-w-2xl">
                                            "{psychQuestions[questionIndex]?.text}"
                                        </p>
                                    )}
                                </div>
                                <div className="grid grid-cols-5 gap-2 md:gap-4">
                                    {[1, 2, 3, 4, 5].map((val) => (
                                        <button
                                            key={val}
                                            onClick={() => handlePsychAnswer(val)}
                                            className="aspect-square rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 flex flex-col items-center justify-center transition-all group"
                                        >
                                            <span className="text-xl font-bold text-slate-400 group-hover:text-blue-600">{val}</span>
                                            <span className="text-[10px] uppercase font-bold text-slate-300 mt-1 group-hover:text-blue-400">
                                                {val === 1 ? 'Desacuerdo' : val === 5 ? 'De Acuerdo' : ''}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {currentModule === 'cognitive' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-xl font-semibold text-slate-800 mb-6">
                                    {cognitivePuzzle?.type === 'numerical' ? 'Completa la serie' :
                                        cognitivePuzzle?.type === 'verbal' ? 'Lógica Verbal' :
                                            'Selecciona la pieza faltante'}
                                </h2>

                                {loading ? (
                                    <div className="flex justify-center items-center h-64">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                    </div>
                                ) : (
                                    <PuzzleCanvas puzzle={cognitivePuzzle} onAnswer={handleCognitiveAnswer} />
                                )}
                            </div>
                        )}

                        {currentModule === 'language' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-slate-800 mb-2">
                                        Juicio Situacional y Comunicación (English)
                                    </h2>
                                    <p className="text-slate-500">
                                        Lee el escenario y graba tu respuesta verbal en inglés, o elige la mejor acción.
                                    </p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4 md:gap-6 items-start mb-6">
                                    {loading || !sjtScenario ? (
                                        <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-lg border border-slate-200">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        </div>
                                    ) : (
                                        <ChatInterface
                                            scenario={sjtScenario}
                                            onAnswer={(val) => handleLanguageAnswer('text', val)}
                                        />
                                    )}
                                    <div className="flex flex-col justify-center h-full">
                                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 mb-4">
                                            <h4 className="font-semibold text-orange-800 mb-1">Reto Verbal</h4>
                                            <p className="text-sm text-orange-700">
                                                Alternativamente, explica tu razonamiento verbalmente para demostrar tus habilidades de comunicación.
                                            </p>
                                        </div>
                                        <AudioRecorder
                                            key={questionIndex}
                                            onRecordingComplete={(val) => handleLanguageAnswer('audio', val)}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        onClick={handleNextLanguageQuestion}
                                        className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg flex items-center gap-2"
                                    >
                                        Siguiente Pregunta <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default TestRunner;
