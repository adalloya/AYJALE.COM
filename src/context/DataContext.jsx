import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [totalJobCount, setTotalJobCount] = useState(0);
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

    const getJobCompanyCache = () => {
        try {
            return JSON.parse(localStorage.getItem('ayjale_admin_job_companies') || '{}');
        } catch (e) {
            return {};
        }
    };

    const saveJobCompanyCache = (jobId, companyData) => {
        if (!jobId || !companyData) return;
        try {
            const cache = getJobCompanyCache();
            const nameToSave = companyData.name || companyData.company_name;
            const logoToSave = companyData.logo || companyData.company_logo || companyData.logo_url;
            if (nameToSave) {
                cache[String(jobId)] = { name: nameToSave, logo: logoToSave };
                localStorage.setItem('ayjale_admin_job_companies', JSON.stringify(cache));
            }
        } catch (e) {}
    };

    const fetchJobs = async () => {
        console.log('[DataContext] Starting fetchJobs...');
        const startTime = Date.now();
        try {
            const isCompany = user?.role === 'company';
            const isAdmin = user?.role === 'admin';

            // 1. Separate HEAD query to get the TRUE total count in DB (bypasses 1000 row max limit)
            let countQuery = supabase
                .from('jobs')
                .select('*', { count: 'exact', head: true });

            if (!user || (!isCompany && !isAdmin)) {
                countQuery = countQuery.neq('active', false);
            }

            countQuery.then(({ count: exactTotal }) => {
                if (typeof exactTotal === 'number' && exactTotal > 0) {
                    setTotalJobCount(exactTotal);
                }
            }).catch(err => console.error('[DataContext] Count query error:', err));

            // 2. Step 1: Fast initial batch (200 items for instant render & deep facet coverage)
            let initialQuery = supabase
                .from('jobs')
                .select('*, profiles:company_id(id, name, logo, logo_url, role, recruiter_name)', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(0, 199);

            if (!user || (!isCompany && !isAdmin)) {
                initialQuery = initialQuery.neq('active', false);
            }

            const { data: firstData, count: totalCount, error: firstErr } = await initialQuery;
            if (firstErr) throw firstErr;

            if (typeof totalCount === 'number' && totalCount > 0) {
                setTotalJobCount(totalCount);
            }

            const companyCache = getJobCompanyCache();

            const enrichBatch = (rawList) => {
                return (rawList || []).map(job => {
                    const cached = companyCache[String(job.id)];
                    const isConfidential = job.is_confidential;
                    const profile = job.profiles;

                    let compName = job.empresa_override || job.company_name || cached?.name || job.company?.name || null;
                    let compLogo = job.logo_override || job.company_logo || cached?.logo || job.company?.logo_url || null;

                    if (!compName && profile) {
                        if (profile.role !== 'admin' && profile.name && !profile.name.toLowerCase().includes('admin') && !profile.name.toLowerCase().includes('adal')) {
                            compName = profile.name;
                        }
                        compLogo = compLogo || profile.logo || profile.logo_url || null;
                    }

                    if (isConfidential) {
                        compName = 'Empresa Confidencial';
                        compLogo = null;
                    }

                    const resolvedName = compName || 'Confidencial';
                    const resolvedLogo = compLogo || profile?.logo || null;

                    return {
                        ...job,
                        empresa_override: job.empresa_override || null,
                        logo_override: job.logo_override || null,
                        company_name: resolvedName,
                        company_logo: resolvedLogo,
                        companyProfile: { name: resolvedName, logo: resolvedLogo },
                        profiles: {
                            ...profile,
                            name: resolvedName,
                            logo: resolvedLogo
                        }
                    };
                });
            };

            // INSTANT RENDER TO CANDIDATE (<200ms)!
            if (firstData && firstData.length > 0) {
                const firstEnriched = enrichBatch(firstData);
                setJobs(firstEnriched);
                console.log(`[DataContext] Instant initial render in ${Date.now() - startTime}ms. Items: ${firstEnriched.length}`);
            }

            // Step 2: Non-blocking Background Progressive Hydration
            setTimeout(async () => {
                try {
                    const chunkPromises = [
                        supabase.from('jobs').select('*, profiles:company_id(id, name, logo, logo_url, role, recruiter_name)').order('created_at', { ascending: false }).range(200, 2999),
                        supabase.from('jobs').select('*, profiles:company_id(id, name, logo, logo_url, role, recruiter_name)').order('created_at', { ascending: false }).range(3000, 5999),
                        supabase.from('jobs').select('*, profiles:company_id(id, name, logo, logo_url, role, recruiter_name)').order('created_at', { ascending: false }).range(6000, 9999)
                    ];

                    const chunkResults = await Promise.all(chunkPromises);
                    let fullRaw = [...(firstData || [])];
                    chunkResults.forEach(res => {
                        if (res.data && Array.isArray(res.data)) {
                            fullRaw = fullRaw.concat(res.data);
                        }
                    });

                    // Deduplicate by job ID
                    const seenIds = new Set();
                    const dedupedRaw = fullRaw.filter(j => {
                        if (seenIds.has(j.id)) return false;
                        seenIds.add(j.id);
                        return true;
                    });

                    const fullEnriched = enrichBatch(dedupedRaw);
                    setJobs(fullEnriched);
                    console.log(`[DataContext] Full background hydration finished in ${Date.now() - startTime}ms. Total: ${fullEnriched.length}`);
                } catch (bgErr) {
                    console.error('[DataContext] Background hydration error:', bgErr);
                }
            }, 50);

        } catch (error) {
            console.error(`[DataContext] Error fetching jobs (${Date.now() - startTime}ms):`, error);
            setJobs([]);
        }
    };

    const fetchMoreJobs = async (offset) => {
        try {
            let query = supabase
                .from('jobs')
                .select('*, profiles:company_id(id, name, logo, logo_url, role, recruiter_name)')
                .order('created_at', { ascending: false })
                .range(offset, offset + 199);

            const isCompany = user?.role === 'company';
            const isAdmin = user?.role === 'admin';

            if (!user || (!isCompany && !isAdmin)) {
                query = query.neq('active', false);
            }

            const { data, error } = await query;
            if (error) throw error;

            const companyCache = getJobCompanyCache();
            const enrichedData = (data || []).map(job => {
                const cached = companyCache[String(job.id)];
                const isConfidential = job.is_confidential;
                const profile = job.profiles;

                let compName = job.empresa_override || job.company_name || cached?.name || job.company?.name || null;
                let compLogo = job.logo_override || job.company_logo || cached?.logo || job.company?.logo_url || null;

                if (!compName && profile) {
                    if (profile.role !== 'admin' && profile.name && !profile.name.toLowerCase().includes('admin') && !profile.name.toLowerCase().includes('adal')) {
                        compName = profile.name;
                    }
                    compLogo = compLogo || profile.logo || profile.logo_url || null;
                }

                if (isConfidential) {
                    compName = 'Empresa Confidencial';
                    compLogo = null;
                }

                const resolvedName = compName || 'Confidencial';
                const resolvedLogo = compLogo || profile?.logo || null;

                return {
                    ...job,
                    empresa_override: job.empresa_override || null,
                    logo_override: job.logo_override || null,
                    company_name: resolvedName,
                    company_logo: resolvedLogo,
                    companyProfile: { name: resolvedName, logo: resolvedLogo },
                    profiles: {
                        ...profile,
                        name: resolvedName,
                        logo: resolvedLogo
                    }
                };
            });

            setJobs(prev => {
                const existingIds = new Set(prev.map(j => j.id));
                const newJobs = enrichedData.filter(j => !existingIds.has(j.id));
                return [...prev, ...newJobs];
            });
        } catch (error) {
            console.error('[DataContext] Error fetching more jobs:', error);
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

        // Extract non-DB metadata properties before inserting into Supabase
        const customProfile = jobData.companyProfile || null;
        const customCompanyName = jobData.empresa_override || jobData.company_name || customProfile?.name || null;
        const customCompanyLogo = jobData.logo_override || jobData.company_logo || customProfile?.logo || null;

        const jobPayloadData = { ...jobData };
        delete jobPayloadData.companyProfile; // Remove non-DB column properties
        delete jobPayloadData.company_name;
        delete jobPayloadData.company_logo;

        const targetCompanyId = jobPayloadData.company_id || user.id;

        let payload = {
            ...jobPayloadData,
            empresa_override: customCompanyName,
            logo_override: customCompanyLogo,
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

            // Loop to handle ANY missing column errors dynamically (e.g. hide_salary)
            let maxRetries = 5;
            while (error && error.message?.includes('column of \'jobs\' in the schema cache') && maxRetries > 0) {
                maxRetries--;
                const match = error.message.match(/Could not find the '([^']+)' column/);
                const missingCol = match ? match[1] : null;

                if (missingCol && payload.hasOwnProperty(missingCol)) {
                    console.warn(`[DataContext] Column '${missingCol}' missing in jobs table. Stripping and retrying insert...`);
                    delete payload[missingCol];
                    payload.company_id = user.id;
                    const res = await executeInsert(payload);
                    data = res.data;
                    error = res.error;
                } else {
                    break;
                }
            }

            if (error) throw error;

            const resolvedComp = customProfile || { name: customCompanyName, logo: customCompanyLogo } || data[0].profiles;

            const finalJob = {
                ...data[0],
                company_name: customCompanyName || resolvedComp?.name || data[0].profiles?.name,
                company_logo: customCompanyLogo || resolvedComp?.logo || data[0].profiles?.logo,
                companyProfile: resolvedComp,
                profiles: {
                    ...data[0].profiles,
                    name: customCompanyName || resolvedComp?.name || data[0].profiles?.name,
                    logo: customCompanyLogo || resolvedComp?.logo || data[0].profiles?.logo
                }
            };

            saveJobCompanyCache(finalJob.id, { name: customCompanyName || resolvedComp?.name, logo: customCompanyLogo || resolvedComp?.logo });

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
            const nextStatus = !currentStatus;
            const { error } = await supabase
                .from('jobs')
                .update({ active: nextStatus })
                .eq('id', jobId);

            if (error) throw error;
            setJobs(prev => prev.map(j => j.id === jobId ? { ...j, active: nextStatus } : j));
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

    const adminBulkDisableScraperJobs = async () => {
        try {
            const { error } = await supabase
                .from('jobs')
                .update({ active: false })
                .eq('source', 'scraper_sne');

            if (error) throw error;
            setJobs(prev => prev.map(j => j.source === 'scraper_sne' ? { ...j, active: false } : j));
            fetchJobs();
        } catch (error) {
            console.error("Error bulk disabling scraper jobs:", error);
            throw error;
        }
    };

    const adminBulkDeleteScraperJobs = async () => {
        try {
            const { error } = await supabase
                .from('jobs')
                .delete()
                .eq('source', 'scraper_sne');

            if (error) throw error;
            setJobs(prev => prev.filter(j => j.source !== 'scraper_sne'));
            fetchJobs();
        } catch (error) {
            console.error("Error bulk deleting scraper jobs:", error);
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

    // Candidate Job Reporting & Automatic Deactivation
    const reportJob = async (jobId, reportData) => {
        const reportObj = {
            id: 'rep_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            job_id: jobId,
            reason: reportData.reason,
            comments: reportData.comments || '',
            reported_by: user?.email || 'Candidato Anónimo',
            created_at: new Date().toISOString(),
            status: 'pending'
        };

        try {
            await supabase.from('job_reports').insert([reportObj]);
        } catch (err) {
            console.warn('[DataContext] job_reports table fallback:', err);
        }

        try {
            const localReports = JSON.parse(localStorage.getItem('ayjale_job_reports') || '[]');
            localReports.unshift(reportObj);
            localStorage.setItem('ayjale_job_reports', JSON.stringify(localReports));
        } catch (e) {}

        // AUTOMATICALLY DEACTIVATE JOB IN SUPABASE & LOCAL STATE
        try {
            await supabase.from('jobs').update({ active: false, status: 'reported' }).eq('id', jobId);
        } catch (e) {
            console.warn('Error deactivating reported job in DB:', e);
        }

        setJobs(prev => prev.map(j => j.id === jobId ? { ...j, active: false, status: 'reported' } : j));
        return { success: true };
    };

    // Admin Reported Jobs Queries & Actions
    const adminGetReportedJobs = async () => {
        let reports = [];
        try {
            const { data, error } = await supabase
                .from('job_reports')
                .select('*, job:job_id(*)')
                .order('created_at', { ascending: false });
            if (!error && data) reports = data;
        } catch (e) {}

        try {
            const local = JSON.parse(localStorage.getItem('ayjale_job_reports') || '[]');
            if (local.length > 0) {
                const ids = new Set(reports.map(r => r.id));
                local.forEach(r => {
                    if (!ids.has(r.id)) reports.push(r);
                });
            }
        } catch (e) {}

        return reports;
    };

    const adminApproveReportedJob = async (reportId, jobId) => {
        try {
            await supabase.from('job_reports').update({ status: 'approved' }).eq('id', reportId);
            await supabase.from('jobs').update({ active: true, status: 'active' }).eq('id', jobId);
        } catch (e) {}

        try {
            const local = JSON.parse(localStorage.getItem('ayjale_job_reports') || '[]');
            const updated = local.filter(r => r.id !== reportId);
            localStorage.setItem('ayjale_job_reports', JSON.stringify(updated));
        } catch (e) {}

        setJobs(prev => prev.map(j => j.id === jobId ? { ...j, active: true, status: 'active' } : j));
    };

    const adminDeleteReportedJob = async (reportId, jobId) => {
        try {
            await supabase.from('job_reports').delete().eq('id', reportId);
            await supabase.from('jobs').delete().eq('id', jobId);
        } catch (e) {}

        try {
            const local = JSON.parse(localStorage.getItem('ayjale_job_reports') || '[]');
            const updated = local.filter(r => r.id !== reportId);
            localStorage.setItem('ayjale_job_reports', JSON.stringify(updated));
        } catch (e) {}

        setJobs(prev => prev.filter(j => j.id !== jobId));
    };

    const adminBlockCompanyFromReport = async (companyId, jobId) => {
        if (!companyId) return;
        try {
            await supabase.from('profiles').update({ role: 'blocked', active: false }).eq('id', companyId);
            await supabase.from('jobs').update({ active: false, status: 'blocked' }).eq('company_id', companyId);
        } catch (e) {}

        setJobs(prev => prev.map(j => String(j.company_id) === String(companyId) ? { ...j, active: false, status: 'blocked' } : j));
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
        totalJobCount,
        fetchMoreJobs,
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
        adminBulkDisableScraperJobs,
        adminBulkDeleteScraperJobs,
        incrementJobView,
        unlockCandidateContact,
        fetchCandidateProfile,
        adminGetContactUnlocks,
        reportJob,
        adminGetReportedJobs,
        adminApproveReportedJob,
        adminDeleteReportedJob,
        adminBlockCompanyFromReport
    }), [
        jobs, applications, users, loading, notifications, contactUnlocks, siteSettings, updateSiteSettings, user,
        adminGetUsers, adminGetApplications, adminGetContactUnlocks, fetchContactUnlocks, reportJob, adminGetReportedJobs, adminApproveReportedJob, adminDeleteReportedJob, adminBlockCompanyFromReport
    ]);

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};
