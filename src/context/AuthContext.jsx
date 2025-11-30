import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            setUser(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
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
    };

    const loginWithApple = async () => {
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
    };

    const register = async (userData, password, role = 'candidate') => {
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
                        terms_accepted_at: new Date().toISOString()
                    }
                }
            });

            if (authError) throw authError;

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
        try {
            const { error } = await supabase
                .from('profiles')
                .update(updatedData)
                .eq('id', user.id);

            if (error) throw error;

            // Update local state
            setUser(prev => ({ ...prev, ...updatedData }));
        } catch (error) {
            console.error("Error updating user:", error);
            throw error;
        }
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, updateUser, register, resetPassword, loginWithGoogle, loginWithApple }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
