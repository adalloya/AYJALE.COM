import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [users, setUsers] = useState([]); // Kept for compatibility, but mainly fetched via Supabase now

    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [contactUnlocks, setContactUnlocks] = useState([]);

    const [siteSettings, setSiteSettings] = useState(() => {
        const defaults = { showCompanyCarousel: false, showMexicoMap: false, showWhatsNew: false, showAiTalentProfile: false, showChatSystem: false };
        try {
            const saved = localStorage.getItem('ayjale_site_settings');
            return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
        } catch (e) {
            return defaults;
        }
    });

    const updateSiteSettings = useCallback(async (newSettings) => {
        setSiteSettings(prev => {
            const updated = { ...prev, ...newSettings };
            try {
                localStorage.setItem('ayjale_site_settings', JSON.stringify(updated));
            } catch (e) {
                console.error('Error saving site settings to localStorage:', e);
            }
            return updated;
        });

        try {
            await supabase.from('site_settings').upsert({
                id: 'global',
                settings: newSettings,
                updated_at: new Date().toISOString()
            });
        } catch (err) {
            // Optional DB table fallback
        }
    }, []);

    const fetchContactUnlocks = useCallback(async () => {
        if (!user) return;

        // If company, get only their unlocks (who they unlocked)
        // If candidate, get who unlocked them
        let query = supabase.from('contact_unlocks').select('*, company:company_id(name, logo), candidate:candidate_id(name)');

        if (user.role === 'company') {
            query = query.eq('company_id', user.id);
        } else if (user.role === 'candidate') {
            query = query.eq('candidate_id', user.id);
        }

        const { data, error } = await query;
        if (error) console.error('Error fetching contact unlocks:', error);
        else setContactUnlocks(data || []);
    }, [user]);

    const fetchJobs = async () => {
        console.log('[DataContext] Starting fetchJobs...');
        const startTime = Date.now();
        try {
            // SIMPLIFIED QUERY TO REDUCE CPU LOAD
            let query = supabase
                .from('jobs')
                .select('id, title, company_id, location, salary, salary_min, salary_max, salary_period, type, created_at, active, expires_at, description, profiles:company_id(name, logo)')
                .order('created_at', { ascending: false })
                .limit(50);

            const isCompany = user?.role === 'company';
            const isAdmin = user?.role === 'admin';

            if (!user || (!isCompany && !isAdmin)) {
                query = query
                    .eq('active', true)
                    .gt('expires_at', new Date().toISOString());
            }

            // 15 Second Timeout Race for resilient network queries
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Database Request Timed Out (15s)')), 15000)
            );

            const { data, error } = await Promise.race([
                query,
                timeoutPromise
            ]);

            if (error) throw error;

            console.log(`[DataContext] fetchJobs success in ${Date.now() - startTime}ms. Items: ${data?.length}`);
            setJobs(data || []);
        } catch (error) {
            console.error(`[DataContext] Error fetching jobs (${Date.now() - startTime}ms):`, error);
            // Optional: Set empty jobs or error state here so UI stops loading
            setJobs([]);
        }
    };

    const fetchApplications = async () => {
        if (!user) return;

        let query = supabase.from('applications').select(`
            *,
            jobs(*),
            profiles:candidate_id(*),
            candidate_profiles:candidate_id(*)
        `);

        // If candidate, get own applications
        if (user.role === 'candidate') {
            query = query.eq('candidate_id', user.id);
        }
        // If company, get applications for their jobs (RLS handles this, but good to be explicit or just fetch all allowed)

        const { data, error } = await query;
        if (error) console.error('Error fetching applications:', error);
        else {
            // Transform data to include the latest profile if multiple exist (though usually 1:1 or 1:many ordered)
            // candidate_profiles returns an array. We want the latest one.
            const enrichedData = data.map(app => ({
                ...app,
                talentProfile: Array.isArray(app.candidate_profiles)
                    ? app.candidate_profiles.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
                    : app.candidate_profiles
            }));
            setApplications(enrichedData || []);
        }
    };

    const fetchCandidateProfile = async (candidateId) => {
        const { data, error } = await supabase
            .from('candidate_profiles')
            .select('*')
            .eq('candidate_id', candidateId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error && error.code !== 'PGRST116') { // Ignore "Row not found"
            console.error('Error fetching candidate profile:', error);
        }
        return data;
    };

    // Job CRUD
    const addJob = async (jobData) => {
        if (!user) return;

        // Extract custom companyProfile if provided (Admin multi-company publishing)
        const customProfile = jobData.companyProfile || null;
        const jobPayloadData = { ...jobData };
        delete jobPayloadData.companyProfile; // Remove non-DB column property

        const targetCompanyId = jobPayloadData.company_id || user.id;

        let payload = {
            ...jobPayloadData,
            company_id: targetCompanyId,
            active: true
        };

        const executeInsert = async (currentPayload) => {
            const { data, error } = await supabase
                .from('jobs')
                .insert([currentPayload])
                .select('*, profiles:company_id(name, logo)');
            return { data, error };
        };

        try {
            let { data, error } = await executeInsert(payload);

            // If RLS policy or FK constraint blocks custom company_id, insert under user.id (Admin ID)
            if (error && (
                error.message?.includes('row-level security') ||
                error.message?.includes('foreign key constraint') ||
                error.code === '42501' ||
                error.code === '23503'
            )) {
                console.warn('[DataContext] RLS/FK constraint on company_id. Inserting under user.id with custom company profile...');
                payload.company_id = user.id;
                const res = await executeInsert(payload);
                data = res.data;
                error = res.error;
            }

            // If missing column error occurs in DB schema (e.g. hide_salary)
            if (error && error.message?.includes('column of \'jobs\' in the schema cache')) {
                const match = error.message.match(/Could not find the '([^']+)' column/);
                const missingCol = match ? match[1] : null;

                if (missingCol && payload.hasOwnProperty(missingCol)) {
                    console.warn(`[DataContext] Column '${missingCol}' missing in jobs table. Stripping and retrying...`);
                    delete payload[missingCol];
                    payload.company_id = user.id;
                    const res = await executeInsert(payload);
                    data = res.data;
                    error = res.error;
                }
            }

            if (error) throw error;

            const finalJob = {
                ...data[0],
                profiles: customProfile || data[0].profiles
            };

            setJobs(prev => [finalJob, ...prev]);
            return finalJob;
        } catch (error) {
            console.error('Error adding job:', error);
            throw error;
        }
    };

    const updateJob = async (id, updatedData) => {
        try {
            const { error } = await supabase
                .from('jobs')
                .update(updatedData)
                .eq('id', id);

            if (error) throw error;
            setJobs(prev => prev.map(job => job.id === id ? { ...job, ...updatedData } : job));
        } catch (error) {
            if (error?.message && error.message.includes('column of \'jobs\' in the schema cache')) {
                const match = error.message.match(/Could not find the '([^']+)' column/);
                const missingCol = match ? match[1] : null;

                if (missingCol && updatedData.hasOwnProperty(missingCol)) {
                    console.warn(`[DataContext] Column '${missingCol}' missing in jobs table. Retrying update without it...`);
                    const fallbackData = { ...updatedData };
                    delete fallbackData[missingCol];

                    const { error: retryError } = await supabase
                        .from('jobs')
                        .update(fallbackData)
                        .eq('id', id);

                    if (retryError) throw retryError;
                    setJobs(prev => prev.map(job => job.id === id ? { ...job, ...updatedData } : job));
                    return;
                }
            }
            console.error('Error updating job:', error);
            throw error;
        }
    };

    const toggleJobStatus = async (jobId, currentStatus) => {
        try {
            const { error } = await supabase
                .from('jobs')
                .update({ active: !currentStatus })
                .eq('id', jobId);

            if (error) throw error;
            fetchJobs(); // Refresh list
        } catch (error) {
            console.error("Error toggling job status:", error);
            throw error;
        }
    };

    const adminRepublishJob = async (jobId) => {
        try {
            const { error } = await supabase
                .from('jobs')
                .update({
                    created_at: new Date().toISOString(),
                    active: true
                })
                .eq('id', jobId);

            if (error) throw error;
            fetchJobs();
        } catch (error) {
            console.error("Error republishing job:", error);
            throw error;
        }
    };

    const closeJob = async (jobId) => {
        try {
            const { error } = await supabase
                .from('jobs')
                .update({
                    active: false,
                    expires_at: new Date().toISOString()
                })
                .eq('id', jobId);

            if (error) throw error;
            fetchJobs();
        } catch (error) {
            console.error("Error closing job:", error);
            throw error;
        }
    };

    const republishJob = async (jobId) => {
        try {
            // Set created_at to now (bumps to top) and expires_at to +30 days
            const newExpiresAt = new Date();
            newExpiresAt.setDate(newExpiresAt.getDate() + 30);

            const { error } = await supabase
                .from('jobs')
                .update({
                    active: true,
                    created_at: new Date().toISOString(),
                    expires_at: newExpiresAt.toISOString()
                })
                .eq('id', jobId);

            if (error) throw error;
            fetchJobs();
        } catch (error) {
            console.error("Error republishing job:", error);
            throw error;
        }
    };

    const adminGetUsers = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*');

            if (error) throw error;
            return data;
        } catch (error) {
            console.error("Error fetching users:", error);
            throw error;
        }
    }, []);

    const adminGetApplications = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('applications')
                .select('*, jobs(title, company_id), profiles:candidate_id(name, email)');

            if (error) throw error;
            return data;
        } catch (error) {
            console.error("Error fetching admin applications:", error);
            throw error;
        }
    }, []);

    const adminGetContactUnlocks = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('contact_unlocks')
                .select('*, company:company_id(name), candidate:candidate_id(name)');

            if (error) throw error;
            return data;
        } catch (error) {
            console.error("Error fetching admin unlocks:", error);
            throw error;
        }
    }, []);

    const adminDeleteUser = useCallback(async (userId) => {
        try {
            await supabase.from('applications').delete().eq('candidate_id', userId);
            await supabase.from('contact_unlocks').delete().or(`company_id.eq.${userId},candidate_id.eq.${userId}`);
            await supabase.from('jobs').delete().eq('company_id', userId);

            const { error: profileError } = await supabase
                .from('profiles')
                .delete()
                .eq('id', userId);

            if (profileError) {
                console.error("Error deleting user profile from DB:", profileError);
                throw profileError;
            }

            return true;
        } catch (error) {
            console.error("Error deleting user:", error);
            throw error;
        }
    }, []);

    const adminCreateCompanyProfile = useCallback(async (companyData) => {
        const newId = crypto.randomUUID();
        let payload = {
            id: newId,
            role: 'company',
            name: companyData.name,
            logo: companyData.logo || null,
            logo_url: companyData.logo || null,
            rfc: companyData.rfc || null,
            industry: companyData.industry || null,
            location: companyData.location || null,
            address: companyData.address || null,
            recruiter_name: companyData.recruiter_name || null,
            phone: companyData.phone || companyData.phone_number || null,
            phone_number: companyData.phone_number || companyData.phone || null,
            can_search_candidates: true,
            can_hide_salary: true,
            can_post_confidential: true
        };

        for (let attempt = 0; attempt < 5; attempt++) {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .insert([payload])
                    .select('*');

                if (error) throw error;
                return data[0];
            } catch (error) {
                // Handle missing columns in DB schema
                if (error?.message && error.message.includes('column of \'profiles\' in the schema cache')) {
                    const match = error.message.match(/Could not find the '([^']+)' column/);
                    const missingCol = match ? match[1] : null;

                    if (missingCol && payload.hasOwnProperty(missingCol)) {
                        console.warn(`[DataContext] Column '${missingCol}' missing in profiles table. Stripping and retrying insert...`);
                        delete payload[missingCol];
                        continue;
                    }
                }

                // Handle Foreign Key constraint (profiles.id -> auth.users.id) or Row-Level Security (RLS)
                if (error?.message && (
                    error.message.includes('foreign key constraint') ||
                    error.message.includes('row-level security') ||
                    error.code === '23503' ||
                    error.code === '42501'
                )) {
                    console.warn('[DataContext] FK/RLS constraint on profiles.id. Returning local company profile for smooth job posting...');
                    return {
                        id: newId,
                        ...payload
                    };
                }

                console.error("Error creating company profile:", error);
                throw error;
            }
        }
    }, []);

    const deleteJob = async (id) => {
        const { error } = await supabase
            .from('jobs')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting job:', error);
            throw error;
        }

        setJobs(prev => prev.filter(job => job.id !== id));
    };

    // Application CRUD
    const applyToJob = async (jobId, candidateId, applicationData = {}) => {
        // Existing implementation
        const { data, error } = await supabase
            .from('applications')
            .insert([{
                job_id: jobId,
                candidate_id: candidateId,
                status: 'applied',
                ...applicationData
            }])
            .select();

        if (error) {
            console.error('Error applying to job:', error);
            throw error;
        }

        setApplications(prev => [...prev, data[0]]);
    };

    // Increment job view count when a job is viewed
    const incrementJobView = useCallback(async (jobId) => {
        try {
            // Optimistically update local state first
            setJobs(prev => {
                return prev.map(j => {
                    if (j.id === Number(jobId)) {
                        return { ...j, view_count: (j.view_count || 0) + 1 };
                    }
                    return j;
                });
            });

            // Call the secure RPC function to increment in DB (bypasses RLS)
            // TEMPORARILY DISABLED TO PREVENT 400 ERRORS
            /*
            const { error } = await supabase.rpc('increment_job_view', { job_id: Number(jobId) });

            if (error) {
                console.error('Error incrementing job view via RPC:', error);
                // Revert optimistic update if needed, but usually fine to leave it for UX
            }
            */
        } catch (e) {
            console.error('Exception in incrementJobView:', e);
        }
    }, []);


    const updateApplicationStatus = async (appId, status) => {
        const { error } = await supabase
            .from('applications')
            .update({ status })
            .eq('id', appId);

        if (error) {
            console.error('Error updating application status:', error);
            throw error;
        }

        setApplications(prev => prev.map(app => app.id === appId ? { ...app, status } : app));
    };

    // Chat / Messages
    const fetchMessages = async (applicationId) => {
        const { data, error } = await supabase
            .from('messages')
            .select('*, sender:sender_id(name, photo)')
            .eq('application_id', applicationId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching messages:', error);
            return [];
        }
        return data;
    };

    const sendMessage = async (applicationId, content) => {
        if (!user) return;

        const { data, error } = await supabase
            .from('messages')
            .insert([{
                application_id: applicationId,
                sender_id: user.id,
                content
            }])
            .select('*, sender:sender_id(name, photo)')
            .single();

        if (error) {
            console.error('Error sending message:', error);
            throw error;
        }
        return data;
    };

    // User CRUD (Profile updates are handled in AuthContext mostly, but keeping for compatibility if needed)
    const updateUserProfile = async (userId, data) => {
        let payload = { ...data };
        for (let attempt = 0; attempt < 5; attempt++) {
            try {
                const { error } = await supabase
                    .from('profiles')
                    .update(payload)
                    .eq('id', userId);

                if (error) throw error;
                return;
            } catch (error) {
                if (error?.message && error.message.includes('column of \'profiles\' in the schema cache')) {
                    const match = error.message.match(/Could not find the '([^']+)' column/);
                    const missingCol = match ? match[1] : null;

                    if (missingCol && payload.hasOwnProperty(missingCol)) {
                        console.warn(`[DataContext] Column '${missingCol}' missing in profiles table. Stripping and retrying update...`);
                        delete payload[missingCol];
                        continue;
                    }
                }
                console.error("Error updating user profile:", error);
                throw error;
            }
        }
    };

    const unlockCandidateContact = async (candidateId) => {
        if (!user) return;

        const { data, error } = await supabase
            .from('contact_unlocks')
            .insert([{
                company_id: user.id,
                candidate_id: candidateId
            }])
            .select('*, company:company_id(name, logo), candidate:candidate_id(name)')
            .single();

        if (error) {
            console.error('Error unlocking contact:', error);
            throw error;
        }

        setContactUnlocks(prev => [...prev, data]);
        return data;
    };

    // Fetch initial data and set up polling
    useEffect(() => {
        console.log('[DataContext] Initial Load Effect Triggered', { user: user?.id });
        const loadData = async () => {
            // Only show loading spinner on initial load
            if (jobs.length === 0 && applications.length === 0) {
                setLoading(true);
            }
            try {
                await Promise.all([fetchJobs(), fetchApplications()]);
            } catch (error) {
                console.error("Error loading initial data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user?.id]); // Re-fetch only when user ID changes (e.g. login/logout)

    // Fetch unlocks on load/user change
    useEffect(() => {
        if (user?.id) {
            fetchContactUnlocks();
        }
    }, [user?.id, fetchContactUnlocks]);

    // Calculate notifications whenever applications, user, or contactUnlocks changes
    useEffect(() => {
        if (!user) {
            setNotifications([]);
            return;
        }

        const newNotifications = [];

        if (user.role === 'company') {
            // 1. New Applicants (status 'applied')
            const newApplicants = applications.filter(app => app.status === 'applied');
            newApplicants.forEach(app => {
                newNotifications.push({
                    id: `app-${app.id}`,
                    type: 'new_applicant',
                    title: 'Nuevo Postulado',
                    message: `${app.profiles?.name || 'Candidato'} se postuló a ${app.jobs?.title}`,
                    link: `/job/${app.job_id}/applicants`,
                    date: app.created_at
                });
            });
        } else if (user.role === 'candidate') {
            // 1. Status Updates (anything not 'applied' or 'pending')
            const updates = applications.filter(app => app.status !== 'applied' && app.status !== 'pending');
            updates.forEach(app => {
                const statusMap = {
                    'reviewed': 'En Revisión',
                    'interviewing': 'Entrevista',
                    'offer': 'Oferta',
                    'hired': 'Contratado',
                    'rejected': 'Descartado'
                };
                newNotifications.push({
                    id: `status-${app.id}`,
                    type: 'status_update',
                    title: 'Actualización de Estatus',
                    message: `Tu postulación a ${app.jobs?.title} está: ${statusMap[app.status] || app.status}`,
                    link: '/dashboard',
                    date: app.updated_at || app.created_at || new Date().toISOString()
                });
            });

            // 2. Contact Unlocks
            contactUnlocks.forEach(unlock => {
                // Ensure we have company info (fetched via select query)
                const companyName = unlock.company?.name || 'Una empresa';
                newNotifications.push({
                    id: `unlock-${unlock.id}`,
                    type: 'contact_unlock',
                    title: 'Perfil Visto',
                    message: `${companyName} ha desbloqueado tus datos de contacto.`,
                    link: '/dashboard', // Or maybe to a "Profile Views" section if we had one
                    date: unlock.created_at
                });
            });
        }

        // Sort by date desc
        newNotifications.sort((a, b) => new Date(b.date) - new Date(a.date));

        setNotifications(newNotifications);

    }, [applications, user, contactUnlocks]); // Added contactUnlocks dependency


    const value = useMemo(() => ({
        jobs,
        applications,
        users,
        loading,
        notifications,
        contactUnlocks,
        siteSettings,
        updateSiteSettings,
        addJob,
        updateJob,
        deleteJob,
        toggleJobStatus,
        closeJob,
        republishJob,
        applyToJob,
        updateApplicationStatus,
        fetchMessages,
        sendMessage,
        updateUserProfile,
        adminGetUsers,
        adminGetApplications,
        adminRepublishJob,
        adminDeleteUser,
        adminCreateCompanyProfile,
        incrementJobView,
        unlockCandidateContact,
        fetchCandidateProfile,
        adminGetContactUnlocks
    }), [
        jobs, applications, users, loading, notifications, contactUnlocks, siteSettings, updateSiteSettings, user,
        adminGetUsers, adminGetApplications, adminGetContactUnlocks, fetchContactUnlocks
    ]);

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};
