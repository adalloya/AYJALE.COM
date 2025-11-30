
export const generateJobDescription = (title) => {
    const lowerTitle = title.toLowerCase();
    let template = defaultTemplate;

    if (lowerTitle.includes('desarrollador') || lowerTitle.includes('developer') || lowerTitle.includes('programador') || lowerTitle.includes('ingeniero de software')) {
        template = developerTemplate;
    } else if (lowerTitle.includes('ventas') || lowerTitle.includes('sales') || lowerTitle.includes('vendedor') || lowerTitle.includes('ejecutivo')) {
        template = salesTemplate;
    } else if (lowerTitle.includes('diseñador') || lowerTitle.includes('designer') || lowerTitle.includes('creativo')) {
        template = designerTemplate;
    } else if (lowerTitle.includes('marketing') || lowerTitle.includes('mercadotecnia') || lowerTitle.includes('redes sociales')) {
        template = marketingTemplate;
    } else if (lowerTitle.includes('gerente') || lowerTitle.includes('manager') || lowerTitle.includes('director') || lowerTitle.includes('líder')) {
        template = managerTemplate;
    } else if (lowerTitle.includes('asistente') || lowerTitle.includes('administrativo') || lowerTitle.includes('recepcionista')) {
        template = adminTemplate;
    }

    return template.replace(/\[TITULO\]/g, title);
};

const defaultTemplate = `
**[TITULO]**

**Sobre Nosotros:**
Somos una empresa líder en nuestro sector, comprometida con la innovación y el crecimiento de nuestro talento. Buscamos un [TITULO] apasionado y proactivo para unirse a nuestro equipo dinámico.

**Responsabilidades Principales:**
*   Ejecutar tareas clave relacionadas con el rol de [TITULO].
*   Colaborar con el equipo para alcanzar los objetivos del departamento.
*   Identificar oportunidades de mejora y proponer soluciones eficientes.
*   Mantener altos estándares de calidad en todas las actividades asignadas.

**Requisitos:**
*   Experiencia previa relevante en puestos similares.
*   Excelentes habilidades de comunicación y trabajo en equipo.
*   Capacidad para resolver problemas y trabajar bajo objetivos.
*   Actitud positiva y ganas de aprender.

**Ofrecemos:**
*   Sueldo competitivo y prestaciones de ley.
*   Oportunidades de crecimiento y desarrollo profesional.
*   Excelente ambiente laboral.

¡Si cumples con el perfil, postúlate hoy mismo y forma parte de nuestro éxito!
`;

const developerTemplate = `
**[TITULO]**

**¿Eres un apasionado de la tecnología?**
Estamos buscando un [TITULO] talentoso para unirse a nuestro equipo de desarrollo. Si te encanta escribir código limpio, resolver problemas complejos y trabajar con tecnologías modernas, ¡te queremos conocer!

**Lo que harás:**
*   Diseñar, desarrollar y mantener aplicaciones de software de alta calidad.
*   Colaborar con diseñadores y product managers para definir nuevas funcionalidades.
*   Optimizar el rendimiento y la escalabilidad de nuestras soluciones.
*   Participar en revisiones de código y asegurar las mejores prácticas de ingeniería.

**Lo que buscamos:**
*   Experiencia sólida en desarrollo de software.
*   Conocimiento de lenguajes y frameworks modernos (ej. JavaScript, React, Python, etc.).
*   Familiaridad con bases de datos y control de versiones (Git).
*   Capacidad para trabajar en un entorno ágil y colaborativo.

**Beneficios:**
*   Salario competitivo acorde a experiencia.
*   Horario flexible y/o modalidad remota/híbrida.
*   Equipo de última generación.
*   Capacitación continua y oportunidades de carrera.
`;

const salesTemplate = `
**[TITULO]**

**¡Únete a nuestro equipo comercial de alto rendimiento!**
Buscamos un [TITULO] con gran habilidad para la negociación y pasión por las ventas. Si eres orientado a resultados y te gusta superar metas, esta es tu oportunidad.

**Tus funciones:**
*   Prospectar y cerrar nuevas oportunidades de negocio.
*   Gestionar y fidelizar la cartera de clientes existente.
*   Presentar nuestros productos/servicios de manera efectiva.
*   Alcanzar y superar los objetivos de ventas mensuales y trimestrales.

**Perfil ideal:**
*   Experiencia comprobable en ventas o atención al cliente.
*   Excelentes habilidades de comunicación y persuasión.
*   Ambición, proactividad y enfoque en resultados.
*   Disponibilidad para viajar (si aplica).

**Te ofrecemos:**
*   Sueldo base + atractivo esquema de comisiones sin tope.
*   Bonos por desempeño y concursos de ventas.
*   Capacitación constante y herramientas de trabajo.
*   Estabilidad laboral y crecimiento dentro de la empresa.
`;

const designerTemplate = `
**[TITULO]**

**¡Buscamos tu creatividad!**
Estamos en la búsqueda de un [TITULO] con un ojo excepcional para el detalle y pasión por el diseño visual. Ayúdanos a crear experiencias visuales impactantes que conecten con nuestra audiencia.

**Responsabilidades:**
*   Crear conceptos visuales atractivos para diversos medios (digital, impreso, web).
*   Colaborar con el equipo de marketing para desarrollar campañas creativas.
*   Asegurar la consistencia de la identidad de marca en todos los diseños.
*   Mantenerse actualizado con las últimas tendencias de diseño y herramientas.

**Requisitos:**
*   Portafolio demostrable con trabajos de diseño de alta calidad.
*   Dominio de herramientas como Adobe Creative Suite (Photoshop, Illustrator, etc.) o Figma.
*   Creatividad, originalidad y atención al detalle.
*   Capacidad para recibir feedback y trabajar en equipo.

**Ofrecemos:**
*   Ambiente de trabajo creativo y dinámico.
*   Oportunidad de trabajar en proyectos retadores y variados.
*   Sueldo competitivo y beneficios.
`;

const marketingTemplate = `
**[TITULO]**

**¡Impulsa nuestra marca al siguiente nivel!**
Estamos buscando un [TITULO] estratégico y creativo para liderar nuestras iniciativas de marketing. Si entiendes el mercado y sabes cómo conectar con los clientes, ¡te estamos buscando!

**Responsabilidades:**
*   Desarrollar e implementar estrategias de marketing efectivas.
*   Gestionar campañas en redes sociales y medios digitales.
*   Analizar métricas y resultados para optimizar el ROI.
*   Crear contenido atractivo y relevante para nuestra audiencia.

**Requisitos:**
*   Experiencia en marketing digital, gestión de redes sociales o roles similares.
*   Conocimiento de herramientas de análisis y publicidad digital.
*   Excelentes habilidades de redacción y comunicación.
*   Creatividad y pensamiento analítico.

**Ofrecemos:**
*   Sueldo competitivo y prestaciones superiores.
*   Oportunidad de liderar proyectos de alto impacto.
*   Ambiente de trabajo colaborativo y flexible.
`;

const managerTemplate = `
**[TITULO]**

**Liderazgo y Estrategia**
Buscamos un [TITULO] experimentado para guiar a nuestro equipo hacia el éxito. Si tienes habilidades de liderazgo probadas y visión estratégica, queremos que formes parte de nuestra dirección.

**Tus retos:**
*   Liderar, motivar y desarrollar al equipo a tu cargo.
*   Definir estrategias y planes de acción para alcanzar los objetivos del área.
*   Supervisar la operación diaria y asegurar la eficiencia de los procesos.
*   Reportar resultados a la dirección y proponer mejoras continuas.

**Perfil:**
*   Experiencia previa en gestión de equipos y liderazgo.
*   Fuertes habilidades de toma de decisiones y resolución de problemas.
*   Visión estratégica y orientación a resultados.
*   Excelentes habilidades interpersonales y de comunicación.

**Ofrecemos:**
*   Paquete de compensación ejecutivo.
*   Oportunidades de desarrollo de carrera a nivel directivo.
*   Participación en la toma de decisiones estratégicas de la empresa.
`;

const adminTemplate = `
**[TITULO]**

**Organización y Eficiencia**
Estamos buscando un [TITULO] organizado y detallista para asegurar el buen funcionamiento de nuestras operaciones administrativas. Tu apoyo será fundamental para nuestro equipo.

**Funciones:**
*   Gestionar tareas administrativas y de oficina diarias.
*   Atender llamadas, correos y recibir visitantes de manera profesional.
*   Mantener archivos y registros organizados y actualizados.
*   Apoyar en la coordinación de reuniones y eventos internos.

**Requisitos:**
*   Experiencia en roles administrativos o de asistencia.
*   Manejo de paquetería Office y herramientas de oficina.
*   Excelente organización, puntualidad y atención al detalle.
*   Actitud de servicio y proactividad.

**Ofrecemos:**
*   Estabilidad laboral y contrato directo.
*   Sueldo competitivo y prestaciones de ley.
*   Horario estable y buen ambiente de trabajo.
`;
