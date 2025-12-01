
export const generateJobDescription = (title, companyName = 'nuestra empresa', location = 'nuestra ubicación') => {
    const templates = [
        professionalTemplate,
        dynamicTemplate,
        corporateTemplate,
        minimalistTemplate,
        engagingTemplate,
        detailOrientedTemplate,
        growthFocusedTemplate,
        innovationTemplate,
        customerCentricTemplate,
        collaborativeTemplate
    ];

    // Select a random template
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];

    let description = randomTemplate
        .replace(/\[TITULO\]/g, title)
        .replace(/\[EMPRESA\]/g, companyName)
        .replace(/\[UBICACION\]/g, location);

    return description;
};

const professionalTemplate = `
[TITULO]

Sobre [EMPRESA]:
En [EMPRESA], ubicada en [UBICACION], nos dedicamos a la excelencia. Buscamos un [TITULO] altamente calificado para unirse a nuestro equipo profesional.

Responsabilidades:
- Desempeñar funciones clave inherentes al puesto de [TITULO].
- Garantizar el cumplimiento de los objetivos establecidos por la dirección.
- Colaborar con otros departamentos para optimizar procesos.
- Mantener un alto nivel de calidad en todas las entregas.

Requisitos:
- Experiencia comprobable en un rol similar.
- Fuertes habilidades de comunicación verbal y escrita.
- Capacidad de organización y gestión del tiempo.
- Compromiso con los valores de la empresa.

Ofrecemos:
- Salario competitivo.
- Prestaciones de ley y superiores.
- Oportunidades de desarrollo continuo.
- Un entorno de trabajo respetuoso y profesional.
`;

const dynamicTemplate = `
¡Buscamos un [TITULO]!

¿Te apasionan los retos?
[EMPRESA] está creciendo en [UBICACION] y necesitamos a alguien como tú. Si eres proactivo y te gusta moverte rápido, este es tu lugar.

Tu misión:
- Tomar la iniciativa en proyectos de [TITULO].
- Aportar ideas frescas y soluciones creativas.
- Trabajar codo a codo con un equipo lleno de energía.
- Superar las expectativas y dejar tu huella.

Lo que necesitas:
- Pasión por lo que haces.
- Experiencia relevante (o muchas ganas de aprender rápido).
- Actitud de "sí se puede".
- Habilidad para adaptarte a cambios.

Lo que te llevas:
- Un ambiente de trabajo increíble.
- Aprendizaje constante.
- Sueldo atractivo.
- La oportunidad de crecer con nosotros.
`;

const corporateTemplate = `
Posición: [TITULO]
Empresa: [EMPRESA]
Ubicación: [UBICACION]

Descripción del Puesto:
[EMPRESA] solicita un [TITULO] para integrar a su estructura organizacional. El candidato ideal deberá demostrar competencia técnica y alineación con nuestra visión corporativa.

Funciones Principales:
- Ejecutar las actividades operativas y estratégicas del área.
- Reportar avances y métricas de desempeño.
- Asegurar el cumplimiento de normativas y políticas internas.
- Contribuir al logro de las metas anuales de la compañía.

Perfil del Candidato:
- Título profesional o experiencia equivalente.
- Historial de desempeño sólido en puestos anteriores.
- Habilidades analíticas y de resolución de problemas.
- Ética profesional intachable.

Beneficios:
- Compensación acorde al mercado.
- Estabilidad laboral.
- Plan de carrera estructurado.
- Beneficios corporativos adicionales.
`;

const minimalistTemplate = `
[TITULO] en [EMPRESA] ([UBICACION])

Buscamos:
Un [TITULO] eficiente y enfocado.

Tus tareas:
- Gestión de actividades de [TITULO].
- Apoyo al equipo en tareas diarias.
- Resolución de incidencias.
- Mejora de procesos actuales.

Requisitos:
- Experiencia en el área.
- Responsabilidad y puntualidad.
- Trabajo en equipo.

Ofrecemos:
- Buen sueldo.
- Buen ambiente.
- Crecimiento.

¡Aplica ahora!
`;

const engagingTemplate = `
¿Eres el [TITULO] que estamos buscando?

En [EMPRESA] ([UBICACION]), creemos que el trabajo debe ser algo que disfrutes. Estamos buscando a alguien especial para ocupar el puesto de [TITULO].

¿Qué harás?
Serás la pieza clave para [TITULO]. Tu día a día incluirá resolver desafíos, colaborar con gente talentosa y hacer que las cosas sucedan.

¿A quién buscamos?
A alguien con chispa, que sepa de lo que habla y que quiera formar parte de una gran historia. La experiencia es importante, pero la actitud lo es todo.

¿Por qué nosotros?
Porque en [EMPRESA] cuidamos a nuestra gente. Ofrecemos un paquete de compensación genial y un lugar donde realmente te escucharán.
`;

const detailOrientedTemplate = `
Vacante: [TITULO]

Atención al Detalle y Precisión
[EMPRESA] en [UBICACION] requiere un [TITULO] meticuloso y ordenado. Si te gusta que todo salga perfecto, te estamos buscando.

Responsabilidades Específicas:
- Supervisar y ejecutar tareas de [TITULO] con precisión.
- Revisar y validar la calidad del trabajo realizado.
- Documentar procesos y mantener registros actualizados.
- Identificar y corregir errores proactivamente.

Requisitos Indispensables:
- Alta capacidad de concentración.
- Experiencia previa demostrable.
- Excelencia en la ejecución.
- Dominio de herramientas relacionadas al puesto.

Propuesta Laboral:
- Sueldo base atractivo.
- Estabilidad y contrato directo.
- Ambiente tranquilo y enfocado.
`;

const growthFocusedTemplate = `
[TITULO] - Oportunidad de Crecimiento

Únete a [EMPRESA] en [UBICACION]
¿Buscas una carrera, no solo un trabajo? Como [TITULO], tendrás la oportunidad de desarrollarte profesionalmente con nosotros.

Tu Rol:
- Aprender y dominar las funciones de [TITULO].
- Asumir responsabilidades progresivas.
- Participar en programas de capacitación.
- Contribuir al éxito a largo plazo de la empresa.

Buscamos:
- Ambición y deseo de superación.
- Experiencia básica o intermedia en el campo.
- Compromiso a largo plazo.
- Habilidades de liderazgo potencial.

Te Ofrecemos:
- Plan de carrera claro.
- Mentoría y capacitación constante.
- Sueldo con revisiones periódicas.
- Prestaciones superiores a la ley.
`;

const innovationTemplate = `
Innovación en [EMPRESA]: Buscamos [TITULO]

Ubicación: [UBICACION]
En [EMPRESA], estamos redefiniendo el futuro. Necesitamos un [TITULO] que piense fuera de la caja y nos ayude a innovar.

Desafíos:
- Implementar nuevas metodologías en el rol de [TITULO].
- Proponer ideas disruptivas para mejorar resultados.
- Utilizar tecnología de vanguardia.
- Colaborar en proyectos de transformación.

Perfil Innovador:
- Mentalidad abierta y creativa.
- Experiencia con herramientas modernas.
- Capacidad para trabajar en entornos cambiantes.
- Pasión por la tecnología y la mejora continua.

Recompensas:
- Ambiente de trabajo estimulante.
- Libertad para crear y proponer.
- Remuneración competitiva.
- Participación en proyectos emocionantes.
`;

const customerCentricTemplate = `
[TITULO] - Enfoque al Cliente

[EMPRESA] - [UBICACION]
Nuestros clientes son lo primero. Buscamos un [TITULO] que comparta nuestra pasión por el servicio y la satisfacción del cliente.

Lo que harás:
- Asegurar una experiencia excepcional desde tu rol de [TITULO].
- Atender y resolver necesidades de manera eficiente.
- Construir relaciones de confianza.
- Representar los valores de [EMPRESA] en cada interacción.

Lo que necesitas:
- Vocación de servicio innegable.
- Excelentes habilidades interpersonales.
- Empatía y paciencia.
- Experiencia en roles de cara al cliente o soporte.

Beneficios:
- Capacitación en servicio al cliente.
- Bonos por satisfacción/desempeño.
- Excelente clima laboral.
- Oportunidades de ascenso.
`;

const collaborativeTemplate = `
Se busca: [TITULO] para Trabajo en Equipo

Empresa: [EMPRESA]
Lugar: [UBICACION]

En [EMPRESA], el éxito es compartido. Buscamos un [TITULO] que sea un excelente jugador de equipo y quiera sumar esfuerzos.

Tus Funciones:
- Apoyar al departamento en las tareas de [TITULO].
- Comunicarte fluidamente con tus compañeros.
- Participar activamente en reuniones y lluvias de ideas.
- Ayudar a crear un ambiente de trabajo positivo.

Requisitos:
- Gran capacidad para trabajar con otros.
- Comunicación asertiva.
- Solidaridad y compañerismo.
- Experiencia previa en el puesto.

Ofrecemos:
- Un equipo que te respalda.
- Actividades de integración.
- Sueldo justo y prestaciones.
- Un lugar donde tu voz cuenta.
`;
