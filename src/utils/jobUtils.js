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

/**
 * Resolves required education level for job cards and badges.
 */
export const getEducationLevel = (job) => {
    if (!job) return null;
    const rawEdu = job.education_level || job.escolaridad || job.education || job.academic_level || job.nivel_estudios || job.nivel_academico;
    if (rawEdu && typeof rawEdu === 'string' && rawEdu.trim() !== '' && rawEdu !== 'N/A' && rawEdu !== 'null') {
        const lowerRaw = rawEdu.toLowerCase().trim();
        if (lowerRaw.includes('prepa') || lowerRaw.includes('vocacional') || lowerRaw.includes('bachillerato') || lowerRaw.includes('medio superior')) {
            return 'Preparatoria / Bachillerato';
        }
        if (lowerRaw.includes('licenciatura') || lowerRaw.includes('profesional') || lowerRaw.includes('grado')) {
            return 'Licenciatura';
        }
        if (lowerRaw.includes('ingenier')) {
            return 'Ingeniería';
        }
        if (lowerRaw.includes('tecnic') || lowerRaw.includes('técnic')) {
            return 'Carrera Técnica';
        }
        if (lowerRaw.includes('secundar')) {
            return 'Secundaria';
        }
        if (lowerRaw.includes('primar')) {
            return 'Primaria';
        }
        return rawEdu.trim();
    }

    // Check text for common education level keywords
    const fullText = `${job.description || ''} ${job.requirements || ''} ${job.title || ''}`.toLowerCase();
    if (fullText.includes('prepa') || fullText.includes('vocacional') || fullText.includes('bachillerato') || fullText.includes('medio superior')) {
        return 'Preparatoria / Bachillerato';
    }
    if (fullText.includes('licenciatura') || fullText.includes('profesional')) return 'Licenciatura';
    if (fullText.includes('ingeniería') || fullText.includes('ingenieria')) return 'Ingeniería';
    if (fullText.includes('carrera técnica') || fullText.includes('tecnico') || fullText.includes('técnica') || fullText.includes('técnico')) return 'Carrera Técnica';
    return null;
};

/**
 * Resolves required experience level for job cards and badges.
 */
export const getExperienceLevel = (job) => {
    if (!job) return null;
    const rawExp = job.experience_level || job.experiencia || job.experience || job.experiencia_requerida;
    if (rawExp && typeof rawExp === 'string' && rawExp.trim() !== '' && rawExp !== 'N/A' && rawExp !== 'null') {
        return rawExp.trim();
    }

    // Check text for common experience keywords
    const fullText = `${job.description || ''} ${job.requirements || ''} ${job.title || ''}`.toLowerCase();
    if (fullText.includes('sin experiencia') || fullText.includes('no requiere experiencia') || fullText.includes('no necesaria')) {
        return 'Sin experiencia';
    }
    if (fullText.includes('6 meses') || fullText.includes('medio año')) {
        return '6 meses de exp.';
    }
    if (fullText.includes('1 a 2 años') || fullText.includes('1 - 2 años') || fullText.includes('1 año')) {
        return '1 - 2 años de exp.';
    }
    if (fullText.includes('2 a 3 años') || fullText.includes('2 - 3 años') || fullText.includes('2 años')) {
        return '2 - 3 años de exp.';
    }
    if (fullText.includes('3 a 5 años') || fullText.includes('3 - 5 años') || fullText.includes('3 años')) {
        return '3+ años de exp.';
    }
    if (fullText.includes('5 años') || fullText.includes('experiencia previa')) {
        return 'Experiencia requerida';
    }

    return null;
};

export const normalizeText = (text = '') => {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
};

export const STATE_IDENTIFIERS = {
    "Aguascalientes": ["aguascalientes", "ags", "ags."],
    "Baja California": ["baja california", "b.c.", " b c "],
    "Baja California Sur": ["baja california sur", "b.c.s.", " b c s "],
    "Campeche": ["campeche", "camp."],
    "Chiapas": ["chiapas", "chis.", "chis"],
    "Chihuahua": ["chihuahua", "chih", "chih."],
    "Coahuila": ["coahuila", "coah", "coah."],
    "Colima": ["colima", "col.", "col"],
    "Ciudad de México": ["ciudad de mexico", "cdmx", "c.d.m.x.", "distrito federal", "mexico df", "d.f."],
    "Durango": ["durango", "dgo", "dgo."],
    "Guanajuato": ["guanajuato", "gto", "gto."],
    "Guerrero": ["guerrero", "gro", "gro."],
    "Hidalgo": ["hidalgo", "hgo", "hgo."],
    "Jalisco": ["jalisco", "jal", "jal."],
    "México": ["estado de mexico", "edomex", "edo. de mex.", "edo mex"],
    "Michoacán": ["michoacan", "mich", "mich."],
    "Morelos": ["morelos", "mor", "mor."],
    "Nayarit": ["nayarit", "nay", "nay."],
    "Nuevo León": ["nuevo leon", "n.l.", " n l "],
    "Oaxaca": ["oaxaca", "oax", "oax."],
    "Puebla": ["puebla", "pue", "pue."],
    "Querétaro": ["queretaro", "qro", "qro."],
    "Quintana Roo": ["quintana roo", "q. roo", "q roo", "qroo"],
    "San Luis Potosí": ["san luis potosi", "slp", "s.l.p."],
    "Sinaloa": ["sinaloa", "sin", "sin."],
    "Sonora": ["sonora", "son", "son."],
    "Tabasco": ["tabasco", "tab", "tab."],
    "Tamaulipas": ["tamaulipas", "tamps", "tamps."],
    "Tlaxcala": ["tlaxcala", "tlax", "tlax."],
    "Veracruz": ["veracruz", "ver", "ver."],
    "Yucatán": ["yucatan", "yuc", "yuc."],
    "Zacatecas": ["zacatecas", "zac", "zac."]
};

export const STATE_ALIASES = {
    "Ciudad de México": [
        "ciudad de mexico", "cdmx", "c.d.m.x.", "df", "distrito federal", "mexico df",
        "cuauhtemoc", "miguel hidalgo", "iztapalapa", "coyoacan", "benito juarez",
        "alvaro obregon", "gustavo a madero", "gustavo a. madero", "venustiano carranza",
        "tlalpan", "azcapotzalco", "magdalena contreras", "cuajimalpa", "milpa alta", "tlahuac", "xochimilco"
    ],
    "México": [
        "estado de mexico", "edomex", "edo. de mex.", "edo mex",
        "toluca", "naucalpan", "ecatepec", "tlalnepantla", "nezahualcoyotl",
        "cuautitlan", "huixquilucan", "atizapan", "chimalhuacan", "chalco",
        "tecamac", "metepec", "coacalco", "ixtapaluca", "texcoco", "tultitlan", "los reyes la paz"
    ],
    "Nuevo León": [
        "nuevo leon", "nl", "n.l.", "monterrey", "apodaca", "san pedro garza garcia", "san pedro", "guadalupe",
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
        "chihuahua", "chih", "chih.", "ciudad juarez", "delicias", "parral"
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

const checkWordMatch = (text = '', searchStr = '') => {
    if (!text || !searchStr) return false;
    const escaped = searchStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, 'i');
    return regex.test(text);
};

export const matchesStateFilter = (jobLocation = '', selectedState = '') => {
    if (!selectedState) return true;
    if (!jobLocation) return false;

    const normLoc = normalizeText(jobLocation);
    const normSelected = normalizeText(selectedState);

    // 1. Direct state name match in location
    if (normLoc.includes(normSelected)) return true;

    // 2. Disambiguation: Check if job location explicitly specifies a DIFFERENT state than selectedState
    for (const [stateName, identifiers] of Object.entries(STATE_IDENTIFIERS)) {
        if (stateName === selectedState) continue;

        const hasOtherState = identifiers.some(id => {
            const normId = normalizeText(id);
            if (normId.length <= 3) {
                return checkWordMatch(normLoc, normId);
            }
            return normLoc.includes(normId);
        });

        if (hasOtherState) {
            // Check if selectedState is ALSO explicitly mentioned
            const selIdentifiers = STATE_IDENTIFIERS[selectedState] || [normSelected];
            const hasSelectedState = selIdentifiers.some(id => {
                const normId = normalizeText(id);
                if (normId.length <= 3) {
                    return checkWordMatch(normLoc, normId);
                }
                return normLoc.includes(normId);
            });

            // If it explicitly belongs to another state and NOT the selected state, exclude it!
            if (!hasSelectedState) {
                return false;
            }
        }
    }

    // 3. Check selectedState identifiers
    const selIdentifiers = STATE_IDENTIFIERS[selectedState];
    if (selIdentifiers) {
        const hasIdMatch = selIdentifiers.some(id => {
            const normId = normalizeText(id);
            if (normId.length <= 3) {
                return checkWordMatch(normLoc, normId);
            }
            return normLoc.includes(normId);
        });
        if (hasIdMatch) return true;
    }

    // 4. Check municipality aliases for selectedState
    const aliases = STATE_ALIASES[selectedState];
    if (aliases) {
        return aliases.some(alias => {
            const normAlias = normalizeText(alias);
            if (normAlias.length <= 3) {
                return checkWordMatch(normLoc, normAlias);
            }
            return normLoc.includes(normAlias);
        });
    }

    return false;
};
