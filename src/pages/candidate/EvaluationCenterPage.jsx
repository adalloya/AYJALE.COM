import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';
import { Brain, MessageSquare, Activity, Lock, CheckCircle, Play, Clock } from 'lucide-react';

const EvaluationCenterPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tests, setTests] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTestsAndResults();
    }, [user]);

    const fetchTestsAndResults = async () => {
        try {
            setLoading(true);
            // 1. Fetch Tests
            const { data: testsData, error: testsError } = await supabase
                .from('evaluation_tests')
                .select('*')
                .order('id');

            if (testsError) throw testsError;

            // 2. Fetch User Results
            const { data: resultsData, error: resultsError } = await supabase
                .from('candidate_results')
                .select('*')
                .eq('candidate_id', user.id);

            if (resultsError) throw resultsError;

            setTests(testsData || []);
            setResults(resultsData || []);
        } catch (error) {
            console.error('Error fetching evaluation data:', error);
            // Fallback for dev if tables don't exist yet
            setTests([
                { id: 1, title: 'Perfil Conductual (Big 5)', type: 'psychometric', description: 'Descubre tus fortalezas laborales y estilo de trabajo.', time_limit_minutes: 15 },
                { id: 2, title: 'Habilidades Cognitivas', type: 'cognitive', description: 'Evalúa tu razonamiento lógico y resolución de problemas.', time_limit_minutes: 20 },
                { id: 3, title: 'Evaluación de Idiomas', type: 'language', description: 'Certifica tu nivel de inglés para negocios.', time_limit_minutes: 15 }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const getTestStatus = (testId) => {
        const result = results.find(r => r.test_id === testId);
        if (!result) return 'pending';
        return result.status; // 'started', 'completed'
    };

    const handleStartTest = (testId) => {
        // For the demo, we redirect all tests to the new unified TestRunner
        navigate(`/assessment/test`);
    };

    const TestCard = ({ test }) => {
        const status = getTestStatus(test.id);
        const isLocked = false; // Unlocked for demo

        let Icon = Activity;
        if (test.type === 'cognitive') Icon = Brain;
        if (test.type === 'language') Icon = MessageSquare;

        return (
            <div className={`bg-white rounded-xl shadow-sm border ${status === 'completed' ? 'border-green-200 bg-green-50' : 'border-slate-200'} p-6 flex flex-col h-full transition-all hover:shadow-md`}>
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-lg ${status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-indigo-50 text-indigo-600'}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    {status === 'completed' && (
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" /> Completado
                        </span>
                    )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">{test.title}</h3>
                <p className="text-slate-600 text-sm mb-4 flex-grow">{test.description}</p>

                <div className="flex items-center text-xs text-slate-500 mb-6">
                    <Clock className="w-4 h-4 mr-1" />
                    {test.time_limit_minutes} min aprox.
                </div>

                <button
                    onClick={() => handleStartTest(test.id)}
                    disabled={isLocked || status === 'completed'}
                    className={`w-full py-2.5 rounded-lg font-bold flex items-center justify-center transition-colors
                        ${status === 'completed'
                            ? 'bg-green-600 text-white cursor-default'
                            : isLocked
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow'
                        }`}
                >
                    {status === 'completed' ? (
                        'Resultados Listos'
                    ) : isLocked ? (
                        <><Lock className="w-4 h-4 mr-2" /> Próximamente</>
                    ) : (
                        <><Play className="w-4 h-4 mr-2" /> Iniciar Test</>
                    )}
                </button>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Centro de Evaluaciones</h1>
                <p className="text-slate-600 mt-2">Completa estas evaluaciones para potenciar tu perfil y aumentar tu compatibilidad con las vacantes.</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {tests.map(test => (
                        <TestCard key={test.id} test={test} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default EvaluationCenterPage;
