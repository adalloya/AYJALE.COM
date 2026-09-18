import { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../supabaseClient';

const translateAuthError = (message) => {
    if (!message) return 'Error en la autenticación. Intenta de nuevo.';
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('invalid login credentials')) {
        return 'Correo o contraseña incorrectos.';
    }
    if (lowerMessage.includes('email not confirmed')) {
        return 'Por favor confirma tu correo electrónico antes de ingresar.';
    }
    if (lowerMessage.includes('user already exists') || lowerMessage.includes('already registered')) {
        return 'Este correo electrónico ya está registrado.';
    }
    if (lowerMessage.includes('password should be at least')) {
        return 'La contraseña debe tener al menos 6 caracteres.';
    }
    if (lowerMessage.includes('invalid email')) {
        return 'Por favor ingresa un correo electrónico válido.';
    }
    if (lowerMessage.includes('email rate limit exceeded')) {
        return 'Límite de solicitudes de correo excedido. Por favor, intenta de nuevo en unos minutos.';
    }
    return message;
};

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

            const metaData = session?.user?.user_metadata || {};
            let finalUser = {
                ...metaData,
                ...data,
                role: data?.role || metaData.role,
                name: data?.name || metaData.name || '',
                first_last_name: data?.first_last_name || data?.lastName || data?.last_name || metaData.first_last_name || metaData.lastName || metaData.last_name || '',
                second_last_name: data?.second_last_name || metaData.second_last_name || '',
                lastName: data?.first_last_name || data?.lastName || data?.last_name || metaData.lastName || '',
                last_name: data?.first_last_name || data?.last_name || data?.lastName || metaData.last_name || '',
                curp: data?.curp || metaData.curp || '',
                nss: data?.nss || metaData.nss || '',
                rfc: data?.rfc || metaData.rfc || '',
                birthDate: data?.birthDate || data?.birth_date || metaData.birthDate || metaData.birth_date || '',
                birth_date: data?.birth_date || data?.birthDate || metaData.birth_date || metaData.birthDate || '',
                address_street: data?.address_street || metaData.address_street || '',
                colonia: data?.colonia || metaData.colonia || '',
                institution_name: data?.institution_name || metaData.institution_name || '',
                english_level: data?.english_level || metaData.english_level || 'Ninguno',
                certifications: Array.isArray(data?.certifications) ? data.certifications : (metaData.certifications || []),
                municipality: data?.municipality || data?.municipio || metaData.municipality || metaData.municipio || '',
                municipio: data?.municipio || data?.municipality || metaData.municipio || metaData.municipality || '',
                zipCode: data?.zipCode || data?.postal_code || metaData.zipCode || metaData.postal_code || '',
                postal_code: data?.postal_code || data?.zipCode || metaData.postal_code || metaData.zipCode || '',
                title: data?.title || metaData.title || '',
                experience_years: data?.experience_years || metaData.experience_years || '',
                driver_license: data?.driver_license || metaData.driver_license || 'No tengo',
                languages_tools: data?.languages_tools || metaData.languages_tools || '',
                education: data?.education || metaData.education || 'Secundaria',
                education_status: data?.education_status || metaData.education_status || 'Concluido',
                work_history: Array.isArray(data?.work_history) ? data.work_history : (metaData.work_history || []),
                ref_name: data?.ref_name || metaData.ref_name || '',
                ref_phone: data?.ref_phone || metaData.ref_phone || '',
                ref_position_company: data?.ref_position_company || metaData.ref_position_company || '',
                ref_recommendation_pdf: data?.ref_recommendation_pdf || metaData.ref_recommendation_pdf || '',
                expected_salary: data?.expected_salary || metaData.expected_salary || '',
                start_availability: data?.start_availability || metaData.start_availability || 'Inmediata',
                shift_availability: data?.shift_availability || metaData.shift_availability || 'Tiempo completo',
                travel_availability: data?.travel_availability || metaData.travel_availability || 'No',
                lastActivities: data?.lastActivities || data?.last_activities || metaData.lastActivities || metaData.last_activities || '',
                last_activities: data?.last_activities || data?.lastActivities || metaData.last_activities || metaData.lastActivities || '',
                lastJob: data?.lastJob || data?.last_job || metaData.lastJob || metaData.last_job || '',
                last_job: data?.last_job || data?.lastJob || metaData.last_job || metaData.lastJob || '',
                lastPosition: data?.lastPosition || data?.last_position || metaData.lastPosition || metaData.last_position || '',
                last_position: data?.last_position || data?.lastPosition || metaData.last_position || metaData.lastPosition || '',
                lastDuration: data?.lastDuration || data?.last_duration || metaData.lastDuration || metaData.last_duration || '',
                last_duration: data?.last_duration || data?.lastDuration || metaData.last_duration || metaData.lastDuration || '',
                civilStatus: data?.civilStatus || data?.civil_status || metaData.civilStatus || metaData.civil_status || 'Soltero/a',
                civil_status: data?.civil_status || data?.civilStatus || metaData.civil_status || metaData.civilStatus || 'Soltero/a',
            };

            console.log('[AuthContext] Setting user:', finalUser?.id, finalUser);
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
            if (error.message) {
                error.message = translateAuthError(error.message);
            }
            throw error;
        }
        // On success, leave loading=true. onAuthStateChange will handle it.
    };

    const loginWithGoogle = async () => {
        alert('El inicio de sesión con Google está temporalmente deshabilitado. Por favor usa tu correo y contraseña.');
        return;
    };

    const loginWithApple = async () => {
        alert('El inicio de sesión con Apple está temporalmente deshabilitado. Por favor usa tu correo y contraseña.');
        return;
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
                        last_name: userData.lastName || userData.last_name || '',
                        lastName: userData.lastName || userData.last_name || '',
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

            // 2. If session exists (auto-confirm enabled), set user immediately
            if (data?.session?.user) {
                const phoneToSave = userData.phone || userData.phone_number;
                const lastNameToSave = userData.lastName || userData.last_name || '';

                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({
                        name: userData.name,
                        last_name: lastNameToSave,
                        phone: phoneToSave,
                        phone_number: phoneToSave,
                        rfc: userData.rfc,
                        industry: userData.industry,
                        location: userData.location,
                        address: userData.address,
                        recruiter_name: userData.recruiter_name,
                        logo: userData.logo,
                        logo_url: userData.logo
                    })
                    .eq('id', data.user.id);

                if (profileError) {
                    console.error('Error saving profile details:', profileError);
                }

                const userProfile = {
                    id: data.user.id,
                    email: data.user.email,
                    role: role,
                    name: userData.name,
                    lastName: lastNameToSave,
                    last_name: lastNameToSave,
                };
                console.log('register setting initial user:', userProfile);
                setUser(userProfile);
            }

            return true;
        } catch (error) {
            console.error("Error in register function:", error);
            if (error.message) {
                error.message = translateAuthError(error.message);
            }
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
        if (error) {
            if (error.message) {
                error.message = translateAuthError(error.message);
            }
            throw error;
        }
    };

    const updateUser = async (updatedData) => {
        console.log('updateUser called with:', updatedData);
        if (!user) {
            console.error('updateUser: No user logged in');
            return;
        }

        // Map frontend camelCase properties to valid Supabase PostgreSQL snake_case columns
        const dbPayload = {};

        // 1. Direct matching columns
        if (updatedData.name !== undefined) dbPayload.name = updatedData.name;
        if (updatedData.title !== undefined) dbPayload.title = updatedData.title;
        if (updatedData.bio !== undefined) dbPayload.bio = updatedData.bio;
        if (updatedData.location !== undefined) dbPayload.location = updatedData.location;
        if (updatedData.skills !== undefined) dbPayload.skills = updatedData.skills;
        if (updatedData.education !== undefined) dbPayload.education = updatedData.education;
        if (updatedData.photo !== undefined) dbPayload.photo = updatedData.photo;
        if (updatedData.phone !== undefined) dbPayload.phone = updatedData.phone;
        if (updatedData.phone_number !== undefined) dbPayload.phone_number = updatedData.phone_number;
        if (updatedData.address !== undefined) dbPayload.address = updatedData.address;

        // 2. Snake_case Mappings
        if (updatedData.first_last_name !== undefined || updatedData.lastName !== undefined || updatedData.last_name !== undefined) {
            dbPayload.first_last_name = updatedData.first_last_name || updatedData.lastName || updatedData.last_name || '';
            dbPayload.last_name = dbPayload.first_last_name;
        }
        if (updatedData.second_last_name !== undefined) {
            dbPayload.second_last_name = updatedData.second_last_name || '';
        }
        if (updatedData.address_street !== undefined) dbPayload.address_street = updatedData.address_street || '';
        if (updatedData.colonia !== undefined) dbPayload.colonia = updatedData.colonia || '';
        if (updatedData.institution_name !== undefined) dbPayload.institution_name = updatedData.institution_name || '';
        if (updatedData.english_level !== undefined) dbPayload.english_level = updatedData.english_level || '';
        if (updatedData.certifications !== undefined) dbPayload.certifications = updatedData.certifications || [];
        if (updatedData.curp !== undefined) dbPayload.curp = updatedData.curp || '';
        if (updatedData.nss !== undefined) dbPayload.nss = updatedData.nss || '';
        if (updatedData.rfc !== undefined) dbPayload.rfc = updatedData.rfc || '';
        if (updatedData.experience_years !== undefined) dbPayload.experience_years = updatedData.experience_years || '';
        if (updatedData.driver_license !== undefined) dbPayload.driver_license = updatedData.driver_license || '';
        if (updatedData.languages_tools !== undefined) dbPayload.languages_tools = updatedData.languages_tools || '';
        if (updatedData.education_status !== undefined) dbPayload.education_status = updatedData.education_status || '';
        if (updatedData.work_history !== undefined) dbPayload.work_history = updatedData.work_history || [];
        if (updatedData.ref_name !== undefined) dbPayload.ref_name = updatedData.ref_name || '';
        if (updatedData.ref_phone !== undefined) dbPayload.ref_phone = updatedData.ref_phone || '';
        if (updatedData.ref_position_company !== undefined) dbPayload.ref_position_company = updatedData.ref_position_company || '';
        if (updatedData.ref_recommendation_pdf !== undefined) dbPayload.ref_recommendation_pdf = updatedData.ref_recommendation_pdf || '';
        if (updatedData.expected_salary !== undefined) {
            dbPayload.expected_salary = updatedData.expected_salary ? parseFloat(updatedData.expected_salary) : null;
        }
        if (updatedData.start_availability !== undefined) dbPayload.start_availability = updatedData.start_availability || '';
        if (updatedData.shift_availability !== undefined) dbPayload.shift_availability = updatedData.shift_availability || '';
        if (updatedData.travel_availability !== undefined) dbPayload.travel_availability = updatedData.travel_availability || '';
        if (updatedData.birthDate !== undefined || updatedData.birth_date !== undefined) {
            dbPayload.birth_date = updatedData.birthDate || updatedData.birth_date || null;
            if (dbPayload.birth_date === '') dbPayload.birth_date = null;
        }
        if (updatedData.municipality !== undefined || updatedData.municipio !== undefined) {
            dbPayload.municipio = updatedData.municipality || updatedData.municipio || '';
        }
        if (updatedData.zipCode !== undefined || updatedData.postal_code !== undefined) {
            dbPayload.postal_code = updatedData.zipCode || updatedData.postal_code || '';
        }
        if (updatedData.lastActivities !== undefined || updatedData.last_activities !== undefined) {
            dbPayload.last_activities = updatedData.lastActivities || updatedData.last_activities || '';
        }
        if (updatedData.civilStatus !== undefined || updatedData.civil_status !== undefined) {
            dbPayload.civil_status = updatedData.civilStatus || updatedData.civil_status || '';
        }
        if (updatedData.lastJob !== undefined || updatedData.last_job !== undefined) {
            dbPayload.last_job = updatedData.lastJob || updatedData.last_job || '';
        }
        if (updatedData.lastPosition !== undefined || updatedData.last_position !== undefined) {
            dbPayload.last_position = updatedData.lastPosition || updatedData.last_position || '';
        }
        if (updatedData.lastDuration !== undefined || updatedData.last_duration !== undefined) {
            dbPayload.last_duration = updatedData.lastDuration || updatedData.last_duration || '';
        }

        try {
            let { error } = await supabase
                .from('profiles')
                .update(dbPayload)
                .eq('id', user.id);

            // If Supabase reports a missing column in SQL schema (PGRST204), strip missing column and retry automatically
            if (error && error.code === 'PGRST204') {
                console.warn('Supabase missing column detected:', error.message);
                const safePayload = { ...dbPayload };
                let currentError = error;
                
                // Retry loop stripping any missing columns reported by PostgREST
                for (let i = 0; i < 5 && currentError && currentError.code === 'PGRST204'; i++) {
                    const match = currentError.message.match(/Could not find the '(.*?)' column/);
                    if (match && match[1]) {
                        const missingCol = match[1];
                        console.warn(`Stripping missing column '${missingCol}' and retrying profile update...`);
                        delete safePayload[missingCol];
                        const retryRes = await supabase
                            .from('profiles')
                            .update(safePayload)
                            .eq('id', user.id);
                        currentError = retryRes.error;
                    } else {
                        break;
                    }
                }
                error = currentError;
            }

            if (error) {
                console.error('updateUser Supabase non-fatal error:', error);
            } else {
                console.log('updateUser DB update successful');
            }
        } catch (err) {
            console.warn("Caught exception in updateUser:", err);
        }

        // Always update local React state with user inputs so UI and application flow proceed smoothly
        setUser(prev => ({
            ...prev,
            ...updatedData,
            lastName: dbPayload.last_name || updatedData.lastName,
            last_name: dbPayload.last_name || updatedData.last_name,
            birthDate: dbPayload.birth_date || updatedData.birthDate,
            birth_date: dbPayload.birth_date || updatedData.birth_date,
            municipality: dbPayload.municipio || updatedData.municipality,
            municipio: dbPayload.municipio || updatedData.municipio,
            zipCode: dbPayload.postal_code || updatedData.zipCode,
            postal_code: dbPayload.postal_code || updatedData.postal_code,
            lastActivities: dbPayload.last_activities || updatedData.lastActivities,
            last_activities: dbPayload.last_activities || updatedData.last_activities
        }));
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
