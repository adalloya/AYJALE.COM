import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import TestRunner from '../../components/evaluations/TestRunner';
import { ArrowLeft } from 'lucide-react';

const TestExecutionPage = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const [test, setTest] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTestDetails();
    }, [testId]);

    const fetchTestDetails = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('evaluation_tests')
                .select('*')
                .eq('id', testId)
                .single();

            if (error) throw error;
            setTest(data);
        } catch (error) {
            console.error('Error fetching test:', error);
            // Mock for dev
            if (testId === '1') {
                setTest({
                    id: 1,
                    title: 'Perfil Conductual (Big 5)',
                    description: 'Evaluación de personalidad.',
                    type: 'psychometric',
                    time_limit_minutes: 15
                });
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen">Cargando...</div>;
    if (!test) return <div className="text-center p-8">Test no encontrado.</div>;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
                <button
                    onClick={() => navigate('/evaluation-center')}
                    className="flex items-center text-slate-500 hover:text-slate-700"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Salir
                </button>
                <h1 className="font-bold text-slate-800">{test.title}</h1>
                <div className="w-20"></div> {/* Spacer for center alignment */}
            </div>

            {/* Content */}
            <div className="flex-1 max-w-3xl mx-auto w-full p-4 md:p-8">
                <TestRunner test={test} onComplete={() => navigate('/evaluation-center')} />
            </div>
        </div>
    );
};

export default TestExecutionPage;
