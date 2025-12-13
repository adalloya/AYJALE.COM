import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, image, url, keywords, structuredData }) => {
    const siteTitle = 'AyJale - Encuentra tu próximo empleo';
    const defaultDescription = 'La mejor plataforma para encontrar empleo en México. Conecta con empresas líderes y postúlate a las mejores vacantes.';
    const defaultImage = 'https://ayjale.com/og-image.jpg'; // Placeholder, should be replaced with real image
    const siteUrl = 'https://ayjale.com';

    const fullTitle = title ? `${title} | AyJale` : siteTitle;

    return (
        {/* Keywords for SEO & AI */ }
        < meta name = "keywords" content = { keywords || "empleo, trabajo, vacantes, méxico, reclutamiento, bolsa de trabajo, buscar trabajo, candidatos, empresas, contratación, inteligencia artificial"
} />

{/* Standard Metadata */ }
            <title>{fullTitle}</title>
            <meta name="description" content={description || defaultDescription} />
            <link rel="canonical" href={url || siteUrl} />

{/* Open Graph / Facebook */ }
            <meta property="og:type" content="website" />
            <meta property="og:url" content={url || siteUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description || defaultDescription} />
            <meta property="og:image" content={image || defaultImage} />

{/* Twitter */ }
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={url || siteUrl} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={description || defaultDescription} />
            <meta property="twitter:image" content={image || defaultImage} />

{/* Structured Data (JSON-LD) for Google Jobs & Semantic understanding */ }
{
    structuredData && (
        <script type="application/ld+json">
            {JSON.stringify(structuredData)}
        </script>
    )
}
        </Helmet >
    );
};

export default SEO;
