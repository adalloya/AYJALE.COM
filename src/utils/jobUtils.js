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

export const normalizeText = (text = '') => {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
};

export const STATE_ALIASES = {
    "Nuevo León": ["nuevo leon", "nl", "n.l.", "monterrey"],
    "Ciudad de México": ["ciudad de mexico", "cdmx", "df", "distrito federal"],
    "México": ["estado de mexico", "edomex", "edo. de mex.", "edo mex", "mexico"],
    "Coahuila": ["coahuila", "coahuila de zaragoza", "saltillo", "torreon"],
    "Michoacán": ["michoacan", "michoacan de ocampo"],
    "Veracruz": ["veracruz", "veracruz de ignacio de la llave"],
    "Querétaro": ["queretaro", "qro", "qro."],
    "San Luis Potosí": ["san luis potosi", "slp", "s.l.p."],
    "Yucatán": ["yucatan", "merida"],
    "Jalisco": ["jalisco", "guadalajara", "gdl"],
    "Baja California": ["baja california", "bc", "b.c.", "tijuana", "mexicali"],
    "Baja California Sur": ["baja california sur", "bcs", "b.c.s."],
    "Quintana Roo": ["quintana roo", "cancun", "playa del carmen", "q. roo"],
    "Tamaulipas": ["tamaulipas", "tamps"],
    "Guanajuato": ["guanajuato", "gto"],
    "Chihuahua": ["chihuahua", "chih"],
    "Chiapas": ["chiapas", "chis"],
    "Guerrero": ["guerrero", "gro"],
    "Hidalgo": ["hidalgo", "hgo"],
    "Puebla": ["puebla", "pue"],
    "Sonora": ["sonora", "son"],
    "Sinaloa": ["sinaloa", "sin"],
    "Tabasco": ["tabasco", "tab"],
    "Tlaxcala": ["tlaxcala", "tlax"],
    "Zacatecas": ["zacatecas", "zac"]
};

export const matchesStateFilter = (jobLocation = '', selectedState = '') => {
    if (!selectedState) return true;
    if (!jobLocation) return false;

    const normLoc = normalizeText(jobLocation);
    const normSelected = normalizeText(selectedState);

    // Direct accent-free substring match
    if (normLoc.includes(normSelected)) return true;

    // Check aliases if defined for this state
    const aliases = STATE_ALIASES[selectedState];
    if (aliases) {
        return aliases.some(alias => normLoc.includes(normalizeText(alias)));
    }

    return false;
};
