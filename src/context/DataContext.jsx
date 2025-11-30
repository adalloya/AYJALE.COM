import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [users, setUsers] = useState([]); // Kept for compatibility, but mainly fetched via Supabase now

    const [notifications, setNotifications] = useState([]);

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

    // Calculate notifications whenever applications or user changes
    useEffect(() => {
        if (!user || !applications.length) {
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
            // Ideally we'd track "last viewed", but for now show recent non-pending updates
            const updates = applications.filter(app => app.status !== 'applied' && app.status !== 'pending');
            updates.forEach(app => {
                // Map status to readable text
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
                    date: app.updated_at
                });
            });
        }

        // 2. Unread Messages (Mock logic for now as we don't fetch all messages globally yet)
        // In a real app, we'd have a separate 'unread_messages' count from DB.
        // For this demo, we'll assume the 'fetchApplications' query might eventually include message counts.
        // Since we can't easily fetch ALL messages for ALL apps every second without a heavy query,
        // we will skip message notifications in this specific polling loop to avoid performance issues,
        // OR we can implement a lightweight "unread_count" RPC in Supabase later.
        // For now, let's focus on the critical "New Applicant" and "Status Update" notifications which are derived from existing data.

        // Sort by date desc
        newNotifications.sort((a, b) => new Date(b.date) - new Date(a.date));

        setNotifications(newNotifications);

    }, [applications, user]);

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

    const adminGetUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error("Error fetching users:", error);
            throw error;
        }
    };

    const adminGetApplications = async () => {
        try {
            const { data, error } = await supabase
                .from('applications')
                .select('*, jobs(title, company_id), profiles:candidate_id(name, email)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error("Error fetching admin applications:", error);
            throw error;
        }
    };

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

    // Register user is now handled in AuthContext directly via supabase.auth.signUp

    return (
        <DataContext.Provider value={{
            jobs,
            users,
            applications,
            loading,
            notifications,
            fetchJobs,
            applyToJob,
            postJob: addJob,
            fetchCompanyApplications: fetchApplications,
            toggleJobStatus,
            adminRepublishJob,
            adminGetUsers,
            adminRepublishJob,
            adminGetUsers,
            adminGetApplications,
            updateUserProfile,
            updateJob,
            updateApplicationStatus,
            fetchMessages,
            sendMessage
        }}>
            {children}
        </DataContext.Provider>
    );
};
