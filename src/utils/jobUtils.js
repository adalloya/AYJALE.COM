/**
 * Resolves the company display name and logo for a job card/view.
 * Guarantees that Admin personal names are never shown as the hiring company.
 */
export const getJobCompany = (job) => {
    if (!job) return { name: 'Empresa', logo: null };

    if (job.is_confidential) {
        return { name: 'Empresa Confidencial', logo: null };
    }

    // 1. Explicit company_name stored on the job
    if (job.company_name && typeof job.company_name === 'string' && job.company_name.trim()) {
        return {
            name: job.company_name.trim(),
            logo: job.company_logo || job.profiles?.logo || null
        };
    }

    // 2. Custom companyProfile attached to the job
    if (job.companyProfile?.name) {
        return {
            name: job.companyProfile.name,
            logo: job.companyProfile.logo || job.companyProfile.logo_url || null
        };
    }

    // 3. Profiles joined from DB
    const profile = job.profiles;
    if (profile) {
        // If profile is Admin, do NOT display personal Admin name as the company
        if (profile.role === 'admin' || (profile.name && (profile.name.toLowerCase().includes('admin') || profile.name.toLowerCase().includes('adal')))) {
            return {
                name: job.company_name || 'Empresa Registrada',
                logo: job.company_logo || profile.logo || null
            };
        }

        return {
            name: profile.name || 'Empresa',
            logo: profile.logo || profile.logo_url || null
        };
    }

    return { name: 'Empresa', logo: null };
};
