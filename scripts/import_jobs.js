import { createClient } from '@supabase/supabase-js';

// Configuration
const supabaseUrl = 'https://lewrbktctepsiiqcrbtu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxld3Jia3RjdGVwc2lpcWNyYnR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MDMxNDIsImV4cCI6MjA3OTk3OTE0Mn0.s2yCBRkR4l6M-2J5-9UsQhGwk6WFVqIJWWDYgnTa9UM';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Mock External Job Source (Replace with real API or scraping logic)
const fetchExternalJobs = async () => {
    // Simulating fetching from an API like Adzuna, Indeed (via API), or scraping
    return [
        {
            title: 'Desarrollador React Senior',
            company: 'TechGlobal Inc.',
            location: 'Ciudad de México (Remoto)',
            salary: 75000,
            description: 'Buscamos un experto en React para unirse a nuestro equipo global. Experiencia en Next.js es un plus.',
            category: 'Tecnología',
            url: 'https://www.linkedin.com/jobs/view/example-1',
            source: 'LinkedIn'
        },
        {
            title: 'Gerente de Ventas Regional',
            company: 'Comercializadora Norte',
            location: 'Monterrey, NL',
            salary: 45000,
            description: 'Liderar equipo de ventas en la región norte. Vehículo propio indispensable.',
            category: 'Ventas',
            url: 'https://www.indeed.com/viewjob?jk=example-2',
            source: 'Indeed'
        },
        {
            title: 'Analista de Datos',
            company: 'Finanzas Seguras',
            location: 'Guadalajara, Jal',
            salary: 35000,
            description: 'Análisis de riesgos y modelos predictivos. SQL y Python requeridos.',
            category: 'Finanzas',
            url: 'https://www.glassdoor.com/job/example-3',
            source: 'Glassdoor'
        }
    ];
};

async function importJobs() {
    console.log('Starting job import...');

    // 1. Create a "System" company profile if it doesn't exist to own these jobs
    // In a real scenario, we might want a specific "Aggregator" profile.
    // For now, we'll try to find or create a generic "TalentoMX Bot" user.
    // Note: Creating a user via API requires admin rights usually, or we can just use an existing company ID if we have one.
    // For this demo, we will use the first available company or fail if none.

    // Ideally, we should have a dedicated account. Let's assume we use the first company found for now.
    const { data: companies } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'company')
        .limit(1);

    if (!companies || companies.length === 0) {
        console.error('No company profiles found to assign jobs to. Please create a company account first.');
        return;
    }

    const ownerId = companies[0].id;
    console.log(`Assigning jobs to company ID: ${ownerId}`);

    // 2. Fetch jobs
    const externalJobs = await fetchExternalJobs();

    // 3. Insert jobs
    for (const job of externalJobs) {
        // Check if job already exists (simple check by title + company)
        const { data: existing } = await supabase
            .from('jobs')
            .select('id')
            .eq('title', job.title)
            .eq('company_id', ownerId) // In reality, we'd check against source URL if unique
            .single();

        if (existing) {
            console.log(`Skipping existing job: ${job.title}`);
            continue;
        }

        // We need to use the authenticated client of the company to insert (RLS), 
        // OR we need a Service Role key to bypass RLS.
        // Since we only have Anon key in frontend code, this script technically needs to run 
        // with a logged-in session OR the user needs to provide the Service Role Key for backend scripts.

        // CRITICAL: For this to work with ANON key, we need to sign in as that company.
        // This is tricky without their password.

        // ALTERNATIVE: We can insert using the `service_role` key if the user provides it.
        // Since I don't have it, I will simulate the login if I have credentials, or I will fail.

        // WORKAROUND for Demo: I will use the credentials of the user I created in `test_job_posting.js` if possible,
        // or just warn the user.

        // Let's try to sign in with the admin/test account we created earlier if we know it.
        // If not, I'll just log the SQL to run.

        console.log(`[WOULD INSERT] ${job.title} - ${job.url}`);

        // Attempt insert (will likely fail RLS without auth)
        const { error } = await supabase.from('jobs').insert([{
            title: job.title,
            description: job.description + `\n\n(Fuente: ${job.source})`,
            company_id: ownerId,
            location: job.location,
            salary: job.salary,
            category: job.category,
            type: 'Presencial', // Default
            is_external: true,
            external_url: job.url,
            source: job.source,
            active: true
        }]);

        if (error) {
            console.error(`Failed to insert ${job.title}:`, error.message);
            console.log("NOTE: This script requires an authenticated session or Service Role key to bypass RLS.");
        } else {
            console.log(`Inserted: ${job.title}`);
        }
    }
    console.log('Import finished.');
}

importJobs();
