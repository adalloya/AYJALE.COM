import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';
import { CheckCircle, AlertCircle } from 'lucide-react';

const TestRunner = ({ test, onComplete }) => {
    const { user } = useAuth();
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({}); // { questionId: value }
    const [currentStep, setCurrentStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuestions();
    }, [test.id]);

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('evaluation_questions')
                .select('*')
                .eq('test_id', test.id)
                .order('order_index');

            if (error) throw error;

            if (data && data.length > 0) {
                setQuestions(data);
            } else {
                // Mock Questions for Big 5 (Psychometric) if DB is empty
                if (test.type === 'psychometric') {
                    setQuestions([
                        { id: 101, question_text: "Soy el alma de la fiesta.", question_type: 'likert', trait_category: 'extraversion', is_reverse_scored: false },
                        { id: 102, question_text: "Me preocupo poco por los demás.", question_type: 'likert', trait_category: 'agreeableness', is_reverse_scored: true },
                        { id: 103, question_text: "Siempre estoy preparado.", question_type: 'likert', trait_category: 'conscientiousness', is_reverse_scored: false },
                        { id: 104, question_text: "Me estreso fácilmente.", question_type: 'likert', trait_category: 'neuroticism', is_reverse_scored: false },
                        { id: 105, question_text: "Tengo un vocabulario rico.", question_type: 'likert', trait_category: 'openness', is_reverse_scored: false },
                        // Add more mock questions as needed for demo
                    ]);
                }
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (questionId, value) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const calculateProgress = () => {
        if (questions.length === 0) return 0;
        const answeredCount = Object.keys(answers).length;
        return Math.round((answeredCount / questions.length) * 100);
    };

    const handleSubmit = async () => {
        if (Object.keys(answers).length < questions.length) {
            alert('Por favor responde todas las preguntas antes de finalizar.');
            return;
        }

        setSubmitting(true);
        try {
            // 1. Calculate Scores (Basic Logic for Big 5)
            let scores = {};
            if (test.type === 'psychometric') {
                // Group by trait and sum
                questions.forEach(q => {
                    const trait = q.trait_category || 'general';
                    if (!scores[trait]) scores[trait] = 0;

                    let val = parseInt(answers[q.id]);
                    if (q.is_reverse_scored) {
                        val = 6 - val; // Reverse 1-5 scale
                    }
                    scores[trait] += val;
                });
            }

            // 2. Save Result to Supabase
            const { error } = await supabase
                .from('candidate_results')
                .insert({
                    candidate_id: user.id,
                    test_id: test.id,
                    status: 'completed',
                    score_data: scores,
                    completed_at: new Date()
                });

            if (error) throw error;

            // 3. Save Detailed Responses (Optional, batch insert)
            const responseRows = Object.entries(answers).map(([qId, val]) => ({
                // We need the result_id first if we want to link it, but for simplicity in v1 we might skip or do a second query.
                // For now, let's assume we just save the result.
                // To do it properly: insert result -> get ID -> insert responses.
            }));

            alert('¡Evaluación completada con éxito!');
            onComplete();

        } catch (error) {
            console.error('Error submitting test:', error);
            alert('Error al guardar resultados. Intenta de nuevo.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div>Cargando preguntas...</div>;

    return (
        <div className="space-y-8">
            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${calculateProgress()}%` }}
                ></div>
            </div>
            <div className="text-right text-xs text-slate-500">
                {calculateProgress()}% Completado
            </div>

            {/* Questions List */}
            <div className="space-y-6">
                {questions.map((q, index) => (
                    <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <div className="mb-4">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Pregunta {index + 1}</span>
                            <h3 className="text-lg font-medium text-slate-900 mt-1">{q.question_text}</h3>
                        </div>

                        {q.question_type === 'likert' && (
                            <div className="grid grid-cols-5 gap-2 sm:gap-4">
                                {[1, 2, 3, 4, 5].map((val) => (
                                    <button
                                        key={val}
                                        onClick={() => handleAnswer(q.id, val)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all
                                            ${answers[q.id] === val
                                                ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500'
                                                : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                            }`}
                                    >
                                        <span className={`text-xl font-bold mb-1 ${answers[q.id] === val ? 'text-indigo-700' : 'text-slate-500'}`}>
                                            {val}
                                        </span>
                                        <span className="text-[10px] text-center text-slate-400 hidden sm:block">
                                            {val === 1 ? 'Muy en desacuerdo' : val === 5 ? 'Muy de acuerdo' : ''}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Add other question types here later */}
                    </div>
                ))}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 pb-12">
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg disabled:opacity-50 flex items-center"
                >
                    {submitting ? 'Guardando...' : 'Finalizar Evaluación'}
                    {!submitting && <CheckCircle className="w-5 h-5 ml-2" />}
                </button>
            </div>
        </div>
    );
};

export default TestRunner;
