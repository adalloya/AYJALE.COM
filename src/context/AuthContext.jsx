import { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const loadedUserId = useRef(null); // Ref to track loaded user ID to avoid stale closures

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                fetchProfile(session.user.id, session);
            } else {
                setLoading(false);
            }
        }).catch(err => {
            console.error("Error getting session:", err);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (_event === 'PASSWORD_RECOVERY') {
                // Force redirect to reset password page
                window.location.href = '/reset-password';
            } else if (session?.user) {
                fetchProfile(session.user.id, session);
            } else {
                setUser(null);
                loadedUserId.current = null; // Reset ref on logout
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId, session = null) => {
        // Check ref instead of state to avoid stale closure issues
        if (loadedUserId.current === userId) {
            // console.log('[AuthContext] Profile already loaded for:', userId);
            setLoading(false);
            return;
        }

        console.log('[AuthContext] Fetching profile for:', userId);
        loadedUserId.current = userId; // Mark as processing/loaded

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('fetchProfile DB error:', error);
                // If error, maybe reset ref so we can try again? 
                // But for now, let's keep it to prevent loop on error too.
                throw error;
            }



            // Prioritize DB profile role if available, otherwise use session metadata
            let finalUser = data;
            if (data?.role) {
                // Role found in DB
            } else if (session?.user?.user_metadata?.role) {
                finalUser = {
                    ...data,
                    role: session.user.user_metadata.role
                };
            }

            console.log('[AuthContext] Setting user:', finalUser?.id);
            setUser(finalUser);
        } catch (error) {
            console.error('Error fetching profile:', error);
            loadedUserId.current = null; // Reset on error to allow retry
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            return true;
        } catch (error) {
            setLoading(false); // Only stop loading on error
            throw error;
        }
        // On success, leave loading=true. onAuthStateChange will handle it.
    };

    const loginWithGoogle = async () => {
        alert('El inicio de sesión con Google está temporalmente deshabilitado. Por favor usa tu correo y contraseña.');
        return;
        /*
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin + '/dashboard'
                }
            });
            if (error) throw error;
        } catch (error) {
            console.error("Google login error:", error);
            throw error;
        } finally {
            setLoading(false);
        }
        */
    };

    const loginWithApple = async () => {
        alert('El inicio de sesión con Apple está temporalmente deshabilitado. Por favor usa tu correo y contraseña.');
        return;
        /*
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'apple',
                options: {
                    redirectTo: window.location.origin + '/dashboard'
                }
            });
            if (error) throw error;
        } catch (error) {
            console.error("Apple login error:", error);
            throw error;
        } finally {
            setLoading(false);
        }
        */
    };

    const register = async (userData, password, role = 'candidate') => {
        console.log('register called with role:', role);
        setLoading(true);
        try {
            // 1. Sign up with Supabase Auth
            const { data, error: authError } = await supabase.auth.signUp({
                email: userData.email,
                password: password,
                options: {
                    data: {
                        role: role,
                        name: userData.name,
                        terms_accepted: userData.termsAccepted,
                        terms_accepted_at: new Date().toISOString(),
                        rfc: userData.rfc,
                        industry: userData.industry,
                        location: userData.location,
                        address: userData.address,
                        recruiter_name: userData.recruiter_name,
                        phone_number: userData.phone_number
                    }
                }
            });

            if (authError) throw authError;

            console.log('register successful, data:', data);

            // 2. If session exists (auto-confirm enabled), set user immediately to avoid ProtectedRoute redirect
            if (data?.session?.user) {
                // Manually construct user object temporarily or fetch profile
                // Since trigger creates profile, we might need to wait a bit or just set basic info
                // For now, let's rely on onAuthStateChange but keep loading true for a moment?
                // Actually, setting user here is safer.
                const userProfile = {
                    id: data.user.id,
                    email: data.user.email,
                    role: role,
                    name: userData.name,
                    // other fields will be null initially
                };
                console.log('register setting initial user:', userProfile);
                setUser(userProfile);
            }

            return true;
        } catch (error) {
            console.error("Error in register function:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    const resetPassword = async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password',
        });
        if (error) throw error;
    };

    const updateUser = async (updatedData) => {
        console.log('updateUser called with:', updatedData);
        if (!user) {
            console.error('updateUser: No user logged in');
            return;
        }
        try {
            const { error } = await supabase
                .from('profiles')
                .update(updatedData)
                .eq('id', user.id);

            if (error) {
                console.error('updateUser Supabase error:', error);
                throw error;
            }

            console.log('updateUser success, updating local state');
            // Update local state
            setUser(prev => ({ ...prev, ...updatedData }));
        } catch (error) {
            console.error("Error updating user:", error);
            throw error;
        }
    }

    const value = useMemo(() => ({
        user, login, logout, loading, updateUser, register, resetPassword, loginWithGoogle, loginWithApple
    }), [user, loading]);

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};
