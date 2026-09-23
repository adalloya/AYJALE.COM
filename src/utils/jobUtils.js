/**
 * Resolves the company display name and logo for a job card/view.
 * Priority:
 * 1. empresa_override / logo_override (Scraped/Government/Custom jobs)
 * 2. company?.name / company?.logo_url or company_name / company_logo
 * 3. Relational profiles table via company_id (Organic registered companies)
 */
export const getJobCompany = (job) => {
    if (!job) return { name: 'Confidencial', logo: null };

    if (job.is_confidential) {
        return { name: 'Empresa Confidencial', logo: null };
    }

    // Exact requested fallback chain:
    // Nombre de la Empresa: job.empresa_override || job.company_name || job.company?.name || 'Confidencial'
    // Logotipo de la Empresa: job.logo_override || job.company_logo || job.company?.logo_url || null

    const profileName = (job.profiles?.role === 'admin' || job.profiles?.name?.toLowerCase().includes('admin') || job.profiles?.name?.toLowerCase().includes('adal'))
        ? null
        : job.profiles?.name;

    const resolvedName = (
        job.empresa_override ||
        job.company_name ||
        job.companyProfile?.name ||
        job.company?.name ||
        profileName ||
        'Confidencial'
    ).trim();

    const resolvedLogo = (
        job.logo_override ||
        job.company_logo ||
        job.companyProfile?.logo ||
        job.companyProfile?.logo_url ||
        job.company?.logo_url ||
        job.company?.logo ||
        job.profiles?.logo ||
        job.profiles?.logo_url ||
        null
    );

    return {
        name: resolvedName,
        logo: resolvedLogo
    };
};
