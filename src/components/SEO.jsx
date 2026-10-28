import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, image, url, keywords, structuredData }) => {
    const siteTitle = 'AyJale.com | Bolsa de trabajo';
    const defaultDescription = 'La mejor plataforma para encontrar empleo en México. Conecta con empresas líderes y postúlate a las mejores vacantes.';
    const defaultImage = 'https://ayjale.com/logo-icon.png';
    const siteUrl = 'https://ayjale.com';

    const fullTitle = (title && title !== 'Inicio' && title !== 'AyJale.com | Bolsa de trabajo') ? `${title} | AyJale.com` : siteTitle;

    return (
        <Helmet>
            {/* Keywords for SEO & AI */}
            <meta name="keywords" content={keywords || "empleo, trabajo, vacantes, méxico, reclutamiento, bolsa de trabajo, buscar trabajo, candidatos, empresas, contratación, inteligencia artificial"} />

            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description || defaultDescription} />
            <link rel="canonical" href={url || siteUrl} />

            <link rel="icon" type="image/x-icon" href="/favicon.ico" />
            <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
            <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={url || siteUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description || defaultDescription} />
            <meta property="og:image" content={image || defaultImage} />
            <meta property="og:image:secure_url" content={image || defaultImage} />
            <meta property="og:image:type" content="image/png" />
            <meta property="og:image:width" content="500" />
            <meta property="og:image:height" content="500" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary" />
            <meta property="twitter:card" content="summary" />
            <meta property="twitter:url" content={url || siteUrl} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={description || defaultDescription} />
            <meta property="twitter:image" content={image || defaultImage} />

            {/* Structured Data (JSON-LD) for Google Jobs & Semantic understanding */}
            {structuredData && (
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            )}
        </Helmet>
    );
};

export default SEO;
