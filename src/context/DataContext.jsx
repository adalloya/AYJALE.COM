import { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
        let query = supabase
            .from('jobs')
            .select('*, profiles:company_id(name, logo)')
            .order('created_at', { ascending: false });

        // If not a company viewing their own jobs AND not an admin, filter out inactive/expired
        const isCompany = user?.role === 'company';
        const isAdmin = user?.role === 'admin';

        if (!user || (!isCompany && !isAdmin)) {
            query = query
                .eq('active', true)
                .gt('expires_at', new Date().toISOString());
        }

        const { data, error } = await query;

        if (error) console.error('Error fetching jobs:', error);
        else setJobs(data || []);
    };

    const fetchApplications = async () => {
        if (!user) return;

        let query = supabase.from('applications').select('*, jobs(*), profiles:candidate_id(*)');

        // If candidate, get own applications
        if (user.role === 'candidate') {
            query = query.eq('candidate_id', user.id);
        }
        // If company, get applications for their jobs (RLS handles this, but good to be explicit or just fetch all allowed)

        const { data, error } = await query;
        if (error) console.error('Error fetching applications:', error);
        else setApplications(data || []);
    };

    // Job CRUD
    const addJob = async (jobData) => {
        if (!user) return;

        const { data, error } = await supabase
            .from('jobs')
            .insert([{
                ...jobData,
                company_id: user.id,
                active: true
            }])
            .select();

        if (error) {
            console.error('Error adding job:', error);
            throw error;
        }

        setJobs(prev => [data[0], ...prev]);
        return data[0];
    };

    const updateJob = async (id, updatedData) => {
        const { error } = await supabase
            .from('jobs')
            .update(updatedData)
            .eq('id', id);

        if (error) {
            console.error('Error updating job:', error);
            throw error;
        }

        setJobs(prev => prev.map(job => job.id === id ? { ...job, ...updatedData } : job));
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
        // This is now redundant with AuthContext's updateUser, but kept for compatibility with existing calls
        const { error } = await supabase
            .from('profiles')
            .update(data)
            .eq('id', userId);

        if (error) throw error;
    }

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
        const loadData = async () => {
            // Only show loading spinner on initial load
            if (jobs.length === 0 && applications.length === 0) {
                setLoading(true);
            }
            await Promise.all([fetchJobs(), fetchApplications()]);
            setLoading(false);
        };

        loadData();

        // Poll for updates every 1 second
        const intervalId = setInterval(() => {
            if (user) {
                fetchJobs();
                fetchApplications();
            }
        }, 1000);

        return () => clearInterval(intervalId);
    }, [user]); // Re-fetch when user changes (e.g. login/logout)

    // Fetch unlocks on load/user change
    useEffect(() => {
        if (user) {
            fetchContactUnlocks();
        }
    }, [user, fetchContactUnlocks]);

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


    return (
        <DataContext.Provider value={{
            jobs,
            applications,
            users,
            loading,
            notifications,
            contactUnlocks,
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
            unlockCandidateContact
        }}>
            {!loading && children}
        </DataContext.Provider>
    );
};
