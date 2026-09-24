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

/**
 * Formats salary display smartly:
 * - If range exists and min !== max -> "$10,000 - $12,000 / mes"
 * - If single monthly amount or min === max -> "$11,140 / mes"
 * - If hidden -> "Salario no publicado"
 */
export const formatSalaryDisplay = (job) => {
    if (!job) return { formatted: 'Salario no publicado', rawText: 'No publicado', period: '', isSingle: true };

    if (job.hide_salary) {
        return { formatted: 'Salario no publicado', rawText: 'Salario no publicado', period: '', isSingle: true };
    }

    const fmt = (n) => {
        const num = Number(n);
        if (isNaN(num) || num <= 0) return null;
        return num.toLocaleString('es-MX', {
            minimumFractionDigits: num % 1 === 0 ? 0 : 2,
            maximumFractionDigits: 2
        });
    };

    const minVal = Number(job.salary_min);
    const maxVal = Number(job.salary_max);
    const singleVal = Number(job.salary);

    const minFormatted = fmt(minVal);
    const maxFormatted = fmt(maxVal);
    const singleFormatted = fmt(singleVal);

    // Period translation
    let periodText = '';
    if (job.salary_period && typeof job.salary_period === 'string') {
        const periodMap = {
            'monthly': 'mes',
            'mensual': 'mes',
            'mensuales': 'mes',
            'yearly': 'año',
            'anual': 'año',
            'anuales': 'año',
            'weekly': 'semana',
            'semanal': 'semana',
            'semanales': 'semana',
            'hourly': 'hora',
            'por hora': 'hora',
            'daily': 'día',
            'diario': 'día',
            'diarios': 'día'
        };
        const p = job.salary_period.toLowerCase().trim();
        periodText = periodMap[p] || p;
    } else {
        periodText = 'mes'; // Default to monthly in Mexico
    }

    const periodSuffix = periodText ? `/${periodText}` : '';

    // Rule 1: Range format ONLY if both min & max exist AND min !== max
    if (minFormatted && maxFormatted && minVal !== maxVal) {
        return {
            formatted: `$${minFormatted} - $${maxFormatted}`,
            rawText: `$${minFormatted} - $${maxFormatted} ${periodSuffix}`,
            period: periodSuffix,
            isRange: true
        };
    }

    // Rule 2: Single amount format (minVal, maxVal, or singleVal)
    const activeAmount = minFormatted || maxFormatted || singleFormatted;
    if (activeAmount) {
        return {
            formatted: `$${activeAmount}`,
            rawText: `$${activeAmount} ${periodSuffix}`,
            period: periodSuffix,
            isSingle: true
        };
    }

    return { formatted: 'Salario no publicado', rawText: 'Salario no publicado', period: '', isSingle: true };
};

export const normalizeText = (text = '') => {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
};

export const STATE_ALIASES = {
    "Ciudad de México": [
        "ciudad de mexico", "cdmx", "c.d.m.x.", "df", "distrito federal", "mexico df",
        "cuauhtemoc", "miguel hidalgo", "iztapalapa", "coyoacan", "benito juarez",
        "alvaro obregon", "gustavo a madero", "gustavo a. madero", "venustiano carranza",
        "tlalpan", "azcapotzalco", "magdalena contreras", "cuajimalpa", "milpa alta", "tlahuac", "xochimilco"
    ],
    "México": [
        "estado de mexico", "edomex", "edo. de mex.", "edo mex", "mexico",
        "toluca", "naucalpan", "ecatepec", "tlalnepantla", "nezahualcoyotl",
        "cuautitlan", "huixquilucan", "atizapan", "chimalhuacan", "chalco",
        "tecamac", "metepec", "coacalco", "ixtapaluca", "texcoco", "tultitlan", "los reyes la paz"
    ],
    "Nuevo León": [
        "nuevo leon", "nl", "n.l.", "monterrey", "apodaca", "san pedro", "guadalupe",
        "escobedo", "san nicolas", "santa catarina", "juarez", "pesqueria", "cadereyta", "garcia"
    ],
    "Querétaro": [
        "queretaro", "qro", "qro.", "santiago de queretaro", "el marques", "corregidora", "san juan del rio", "tequisquiapan"
    ],
    "Jalisco": [
        "jalisco", "gdl", "guadalajara", "zapopan", "tlaquepaque", "tonala", "tlajomulco", "puerto vallarta", "el salto"
    ],
    "Guanajuato": [
        "guanajuato", "gto", "gto.", "leon", "irapuato", "celaya", "silao", "san miguel de allende", "salamanca"
    ],
    "Coahuila": [
        "coahuila", "coahuila de zaragoza", "saltillo", "torreon", "ramos arizpe", "monclova", "piedras negras"
    ],
    "Chihuahua": [
        "chihuahua", "chih", "chih.", "juarez", "ciudad juarez", "delicias", "parral"
    ],
    "Puebla": [
        "puebla", "pue", "pue.", "san andres cholula", "tehuacan", "san pedro cholula"
    ],
    "Veracruz": [
        "veracruz", "veracruz de ignacio de la llave", "xalapa", "coatzacoalcos", "poza rica", "cordoba", "orizaba"
    ],
    "Sonora": [
        "sonora", "son", "son.", "hermosillo", "ciudad obregon", "nogales", "guaymas"
    ],
    "Sinaloa": [
        "sinaloa", "sin", "sin.", "culiacan", "mazatlan", "los mochis"
    ],
    "Baja California": [
        "baja california", "bc", "b.c.", "tijuana", "mexicali", "ensenada", "rosarito", "tecate"
    ],
    "Baja California Sur": [
        "baja california sur", "bcs", "b.c.s.", "la paz", "los cabos", "cabo san lucas", "san jose del cabo"
    ],
    "Quintana Roo": [
        "quintana roo", "cancun", "playa del carmen", "q. roo", "chetumal", "cozumel", "tulum"
    ],
    "San Luis Potosí": [
        "san luis potosi", "slp", "s.l.p.", "soledad de graciano sanchez"
    ],
    "Yucatán": [
        "yucatan", "merida", "kanasin", "uman"
    ],
    "Michoacán": [
        "michoacan", "michoacan de ocampo", "morelia", "uruapan", "zamora"
    ],
    "Tamaulipas": [
        "tamaulipas", "tamps", "tamps.", "reynosa", "matamoros", "nuevo laredo", "tampico", "ciudad victoria"
    ],
    "Aguascalientes": ["aguascalientes", "ags", "ags."],
    "Durango": ["durango", "dgo", "gomez palacio"],
    "Zacatecas": ["zacatecas", "zac", "fresnillo"],
    "Morelos": ["morelos", "cuernavaca", "jiutepec", "cuautla"],
    "Nayarit": ["nayarit", "tepic", "bahia de banderas"],
    "Oaxaca": ["oaxaca", "oaxaca de juarez", "salina cruz", "tuxtepec"],
    "Tabasco": ["tabasco", "tab", "villahermosa"],
    "Campeche": ["campeche", "ciudad del carmen"],
    "Colima": ["colima", "manzanillo", "tecoman"],
    "Guerrero": ["guerrero", "gro", "acapulco", "chilpancingo"],
    "Hidalgo": ["hidalgo", "hgo", "pachuca", "tula"],
    "Tlaxcala": ["tlaxcala", "tlax", "apizaco"]
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
