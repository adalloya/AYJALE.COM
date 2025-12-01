import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Lock, Eye, EyeOff } from 'lucide-react';

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check if we have a session (hash fragment from email link)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                // If no session, maybe they just clicked the link and the hash is there but not processed yet?
                // Or maybe the link is invalid/expired.
                // Supabase usually handles the hash automatically and sets the session.
                // If not, we might need to rely on onAuthStateChange in AuthContext.
            }
        });
    }, []);

    const handleReset = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.updateUser({ password: password });
            if (error) throw error;
            setMessage('Contraseña actualizada correctamente. Redirigiendo...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            console.error('Error updating password:', error);
            setError(error.message || 'Error al actualizar la contraseña');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="bg-orange-100 p-3 rounded-full">
                        <Lock className="w-8 h-8 text-orange-600" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
                    Restablecer Contraseña
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    Ingresa tu nueva contraseña
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                    {message && (
                        <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
                            {message}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleReset}>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                Nueva Contraseña
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                                Confirmar Contraseña
                            </label>
                            <div className="mt-1">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                            >
                                {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
