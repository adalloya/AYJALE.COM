import React from 'react';
import SEO from '../components/SEO';

const PrivacyPage = () => {
    return (
        <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <SEO
                title="Aviso de Privacidad"
                description="Aviso de Privacidad Integral de Ayjale.com S.A.P.I. de C.V."
            />
            <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-slate-200">
                <h1 className="text-3xl font-bold text-slate-900 mb-8 text-center">AVISO DE PRIVACIDAD INTEGRAL</h1>

                <div className="space-y-8 text-slate-700 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">1. IDENTIDAD Y DOMICILIO DEL RESPONSABLE</h2>
                        <p>
                            <strong>AYJALE.COM S.A.P.I. DE C.V.</strong> (en lo sucesivo, "AYJALE"), con domicilio fiscal ubicado en:
                            <strong> CARACOL 2, HIDALGO DEL PARRAL, CHIHUAHUA, MÉXICO</strong>, es el responsable del uso, tratamiento y protección de sus datos personales, observando los principios de licitud, consentimiento, información, calidad, finalidad, lealtad, proporcionalidad y responsabilidad previstos en la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">2. DATOS PERSONALES QUE RECABAMOS</h2>
                        <p className="mb-2">Para cumplir con las finalidades del servicio, AYJALE recabará las siguientes categorías de datos dependiendo del tipo de usuario:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>A) DE LOS CANDIDATOS:</strong> Nombre completo, fotografía, datos de contacto (teléfono, correo), historial académico, trayectoria laboral, pretensiones económicas, portafolio de trabajo y habilidades técnicas.</li>
                            <li><strong>B) DE LAS EMPRESAS/RECLUTADORES:</strong> Razón social, Constancia de Situación Fiscal (RFC), domicilio fiscal, datos bancarios (para cobro de suscripciones), nombre y cargo del representante o reclutador que administra la cuenta.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">3. FINALIDADES DEL TRATAMIENTO</h2>
                        <p className="mb-2">Los datos personales serán utilizados para:</p>
                        <div className="mb-4">
                            <h3 className="font-semibold text-slate-900 mb-1">Finalidades Primarias:</h3>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Registro, validación y gestión de cuentas de usuario en la plataforma ayjale.com.</li>
                                <li>Vinculación tecnológica entre la oferta (Empresas) y la demanda (Candidatos) de empleo.</li>
                                <li>Procesamiento de pagos y facturación (para Empresas).</li>
                                <li>Envío de notificaciones sobre el estado de vacantes o postulaciones.</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 mb-1">Finalidades Secundarias:</h3>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Envío de newsletter, publicidad de nuevos servicios de AYJALE y estudios estadísticos anonimizados sobre el mercado laboral.</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">4. TRANSFERENCIAS DE DATOS</h2>
                        <p>
                            Se hace de su conocimiento que AYJALE transfiere datos personales de los CANDIDATOS a las EMPRESAS registradas que han publicado vacantes compatibles con su perfil.
                        </p>
                        <p className="mt-2">
                            <strong>Fundamento:</strong> Esta transferencia es necesaria para el cumplimiento de la relación jurídica y prestación del servicio (Art. 37 Fracc. IV de la LFPDPPP). Al registrarse, el Candidato acepta esta transferencia para poder ser contactado para fines de reclutamiento.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">5. DERECHOS ARCO</h2>
                        <p>
                            Usted tiene derecho a conocer, rectificar, cancelar u oponerse al tratamiento de sus datos (Derechos ARCO). Para ejercerlos, deberá enviar una solicitud al correo electrónico: <strong>soporte@ayjale.com</strong>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">6. USO DE COOKIES</h2>
                        <p>
                            Utilizamos cookies propias y de terceros (Google Analytics, Stripe, etc.) para mejorar la experiencia de navegación y seguridad del sitio. Usted puede deshabilitarlas desde la configuración de su navegador.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">7. CAMBIOS AL AVISO</h2>
                        <p>
                            Cualquier modificación será publicada en <a href="https://www.ayjale.com" className="text-secondary-600 hover:underline">www.ayjale.com</a>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;
