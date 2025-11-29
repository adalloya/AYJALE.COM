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

    // Fetch initial data
    useEffect(() => {
        fetchJobs();
        fetchApplications();
    }, [user]); // Re-fetch when user changes (e.g. login/logout)

    const fetchJobs = async () => {
        let query = supabase
            .from('jobs')
            .select('*')
            .order('created_at', { ascending: false });

        // If not a company viewing their own jobs, filter out inactive/expired
        if (!user || user.role !== 'company') {
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

        let query = supabase.from('applications').select('*, jobs(*)');

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
            fetchJobs,
            applyToJob,
            postJob,
            fetchCompanyApplications,
            toggleJobStatus,
            adminRepublishJob,
            adminGetUsers
        }}>
            {children}
        </DataContext.Provider>
    );
};
