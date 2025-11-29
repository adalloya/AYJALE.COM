import React from 'react';
import SEO from '../components/SEO';

const TermsPage = () => {
    return (
        <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <SEO
                title="Términos y Condiciones"
                description="Términos y Condiciones de Uso de la Plataforma Ayjale.com"
            />
            <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-slate-200">
                <h1 className="text-3xl font-bold text-slate-900 mb-8 text-center">TÉRMINOS Y CONDICIONES DE USO DE LA PLATAFORMA AYJALE.COM</h1>

                <div className="space-y-8 text-slate-700 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">1. ACEPTACIÓN Y PARTES</h2>
                        <p>
                            Los presentes Términos y Condiciones regulan el uso del software accesible en <a href="https://www.ayjale.com" className="text-secondary-600 hover:underline">www.ayjale.com</a> (la "PLATAFORMA"), propiedad de <strong>AYJALE.COM S.A.P.I. DE C.V.</strong> ("AYJALE"). Al crear una cuenta, usted adquiere la calidad de "USUARIO" (ya sea como "CANDIDATO" o "EMPRESA") y acepta obligarse a lo aquí estipulado.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">2. OBJETO DEL SERVICIO</h2>
                        <p>
                            AYJALE otorga al USUARIO una licencia de uso limitada, no exclusiva, intransferible y revocable para utilizar la PLATAFORMA como una herramienta de intermediación digital para la publicación y búsqueda de ofertas de empleo.
                        </p>
                        <div className="mt-2 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
                            <strong>Aclaración Fundamental:</strong> AYJALE NO es una agencia de colocación, ni patrón, ni headhunter, ni subcontratista (outsourcing). AYJALE únicamente provee la infraestructura tecnológica.
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">3. DESLINDE DE RELACIÓN LABORAL (CLÁUSULA CRÍTICA)</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Inexistencia de relación laboral con AYJALE:</strong> El CANDIDATO reconoce que AYJALE no es su patrón y que el uso de la PLATAFORMA no garantiza su contratación.</li>
                            <li><strong>Relación entre EMPRESA y CANDIDATO:</strong> Cualquier proceso de contratación, entrevista o relación laboral que surja, es única y exclusivamente entre la EMPRESA y el CANDIDATO.</li>
                            <li><strong>Indemnización:</strong> La EMPRESA libera a AYJALE.COM S.A.P.I. DE C.V., a sus accionistas, directores y empleados de cualquier reclamación, demanda o responsabilidad de carácter laboral, civil o administrativo derivada de los procesos de contratación gestionados a través de la PLATAFORMA.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">4. OBLIGACIONES DE LA EMPRESA (CLIENTE)</h2>
                        <p className="mb-2">La EMPRESA se obliga a:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Publicar vacantes reales, lícitas y que cumplan con la Ley Federal del Trabajo (no discriminatorias, salario digno, etc.).</li>
                            <li>No utilizar la PLATAFORMA para fines distintos al reclutamiento (ej. venta de productos, esquemas piramidales).</li>
                            <li>Pagar las tarifas correspondientes por los servicios Premium o de publicación, según las tarifas vigentes.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">5. PAGOS Y FACTURACIÓN</h2>
                        <p>
                            Los pagos realizados a AYJALE.COM S.A.P.I. DE C.V. por concepto de membresías, créditos o destaques de vacantes no son reembolsables una vez que el servicio ha sido activado. AYJALE emitirá la factura fiscal correspondiente bajo las leyes mexicanas vigentes al momento del pago.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">6. PROPIEDAD INTELECTUAL</h2>
                        <p>
                            Todo el código fuente, bases de datos, diseño, UI/UX, y la marca "AYJALE" son propiedad exclusiva de AYJALE.COM S.A.P.I. DE C.V. Queda prohibida la ingeniería inversa, el scraping (extracción automatizada de datos) o la reventa del servicio sin autorización escrita.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">7. VIGENCIA Y TERMINACIÓN</h2>
                        <p>
                            AYJALE se reserva el derecho de suspender o cancelar, sin previo aviso y sin responsabilidad, la cuenta de cualquier USUARIO que viole estos términos, reporte conductas sospechosas o intente cometer fraude.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">8. JURISDICCIÓN</h2>
                        <p>
                            Para la interpretación y cumplimiento de este contrato, las partes se someten a las leyes federales de México y a los tribunales competentes de la ciudad de <strong>HIDALGO DEL PARRAL, CHIHUAHUA</strong>, renunciando a cualquier otro fuero por razón de sus domicilios presentes o futuros.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
