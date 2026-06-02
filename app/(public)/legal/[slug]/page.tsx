import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

const LEGAL_CONTENT: Record<string, { title: string; content: string }> = {
  'aviso-legal': {
    title: 'Aviso Legal',
    content: `
**Identificación del titular**

Titular: KAZAWEB, S.L.U.
NIF: B42761254
Domicilio fiscal: Lugar Rebordelo nº 35, Planta 2, 15930 Boiro, A Coruña
Nombre comercial: Black Label Market
Dominio: [PENDIENTE_DEFINIR_DOMINIO]
Email de contacto: [PENDIENTE_EMAIL_CONTACTO]
Email legal: [PENDIENTE_EMAIL_LEGAL]
Actividad: Intermediarios del comercio — Epígrafe IAE 631

**Objeto del sitio web**

Black Label Market es una plataforma digital orientada a la presentación de coches y motos premium, deportivos, clásicos, de colección, enthusiast y unidades especiales publicados por vendedores profesionales seleccionados.

**Naturaleza de la plataforma**

Black Label Market actúa como plataforma de publicación y contacto. La operación comercial, negociación, documentación, garantía, pago, entrega y cualquier acuerdo posterior se realiza directamente entre el comprador interesado y el vendedor profesional responsable del vehículo.

- Black Label Market no vende directamente los vehículos.
- La información de cada anuncio es proporcionada por el vendedor profesional responsable.
- La disponibilidad debe confirmarse directamente con el vendedor antes de cualquier operación.
- Las condiciones de venta, garantía, financiación, entrega, reserva o prueba dependen del vendedor profesional.
- Black Label Market puede revisar, editar, suspender o retirar anuncios que no cumplan criterios editoriales, comerciales o legales.

**Propiedad intelectual**

El diseño, textos, marca, logotipos, imágenes propias, contenidos editoriales y la estructura de la plataforma son propiedad de KAZAWEB, S.L.U. o de sus licenciantes, y están protegidos por la legislación sobre propiedad intelectual e industrial vigente.

Las marcas, modelos y logotipos de terceros pertenecen a sus respectivos titulares y se utilizan únicamente con finalidad identificativa cuando proceda.

**Limitación de responsabilidad**

- Black Label Market no garantiza la disponibilidad continua del servicio.
- Black Label Market no garantiza la exactitud absoluta de la información facilitada por los vendedores profesionales.
- Black Label Market no es responsable de las negociaciones, acuerdos o transacciones realizadas directamente entre comprador y vendedor.
- Black Label Market no sustituye la revisión técnica, documental o legal que el comprador deba realizar antes de cualquier operación.
- Las decisiones de compra son responsabilidad exclusiva de las partes implicadas.

**Legislación aplicable**

Este aviso legal se rige por la legislación española. Los conflictos se someterán a los juzgados y tribunales que resulten competentes conforme a la normativa aplicable.
    `.trim(),
  },

  'privacidad': {
    title: 'Política de Privacidad',
    content: `
**Responsable del tratamiento**

KAZAWEB, S.L.U.
NIF: B42761254
Domicilio: Lugar Rebordelo nº 35, Planta 2, 15930 Boiro, A Coruña
Email privacidad: [PENDIENTE_EMAIL_PRIVACIDAD]

De conformidad con el Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD).

**Datos que recogemos**

Formulario de solicitud de información sobre vehículos: nombre, email, teléfono (opcional), vehículo de interés, plazo de compra, financiación, entrega de vehículo, preferencia de contacto y mensaje.

Formulario de búsqueda privada: nombre, email, teléfono (opcional), tipo de vehículo, marca y modelo buscados, presupuesto, ubicación, plazo de compra y comentarios.

Formulario de acceso profesional: nombre, empresa, email, teléfono, tipo de negocio, ubicación, stock aproximado y mensaje.

Datos técnicos de navegación: [PENDIENTE_DEFINIR_ANALYTICS_COOKIES]

**Finalidades del tratamiento**

- Gestionar solicitudes de información sobre vehículos.
- Contactar con usuarios que han enviado un formulario.
- Registrar y tramitar búsquedas privadas.
- Valorar solicitudes de acceso profesional.
- Mejorar la plataforma y prevenir usos indebidos o fraude.
- Cumplir las obligaciones legales aplicables.
- Enviar comunicaciones si el usuario lo acepta expresamente.

**Base jurídica**

- Consentimiento del usuario para el envío de formularios y comunicaciones opcionales.
- Interés legítimo para seguridad, prevención de abuso y mejora del servicio.
- Ejecución de medidas precontractuales cuando el usuario solicita información sobre un vehículo.
- Cumplimiento de obligaciones legales.

**Comunicación de datos a terceros**

Cuando el usuario solicita información sobre un vehículo, Black Label Market podrá comunicar los datos necesarios al vendedor profesional responsable de dicha unidad para que pueda responder a la solicitud.

Herramientas de gestión previstas pendientes de configuración: [PENDIENTE_HERRAMIENTA_FORMULARIOS] · [PENDIENTE_CRM] · [PENDIENTE_EMAIL_MARKETING] · [PENDIENTE_ANALYTICS]

**Conservación de datos**

Los datos se conservarán durante el tiempo necesario para gestionar la solicitud y, posteriormente, durante los plazos legalmente exigibles o mientras puedan derivarse responsabilidades.

**Tus derechos**

Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad de datos, así como retirar el consentimiento en cualquier momento, escribiendo a: [PENDIENTE_EMAIL_PRIVACIDAD]

Puedes presentar una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).

**Menores de edad**

Este servicio no está dirigido a menores de edad. Black Label Market no recaba datos de personas menores de edad de forma consciente.
    `.trim(),
  },

  'cookies': {
    title: 'Política de Cookies',
    content: `
**¿Qué son las cookies?**

Las cookies son pequeños archivos que se almacenan en el dispositivo del usuario cuando visita una página web. También existen tecnologías similares, como el almacenamiento local del navegador, que pueden utilizarse para recordar información, permitir el funcionamiento de la web o mejorar la experiencia del usuario.

En esta Política de Cookies usamos el término "cookies" para referirnos de forma general a cookies y tecnologías similares de almacenamiento o acceso a información en el dispositivo del usuario.

**Responsable**

El responsable del uso de cookies en Black Label Market es:

KAZAWEB, S.L.U.
NIF: B42761254
Domicilio: Lugar Rebordelo nº 35, Planta 2, 15930 Boiro, A Coruña
Nombre comercial: Black Label Market

Para cuestiones relacionadas con privacidad o cookies, el usuario puede contactar a través del email indicado en la Política de Privacidad.

**Tipos de cookies según su finalidad**

Black Label Market puede utilizar las siguientes categorías:

- Cookies técnicas o necesarias: permiten el funcionamiento básico de la web, la navegación, la seguridad, la gestión de sesión y el acceso a áreas privadas. No requieren consentimiento cuando son estrictamente necesarias para prestar el servicio solicitado por el usuario.
- Cookies de preferencias: permiten recordar opciones elegidas por el usuario, como configuración de cookies u otras preferencias de navegación.
- Cookies de análisis: permiten medir de forma agregada cómo se utiliza la web. Solo se utilizarán cuando el usuario haya dado su consentimiento, si están activas.
- Cookies de marketing o publicidad: permiten medir campañas, crear audiencias o mostrar contenido personalizado. Solo se utilizarán cuando el usuario haya dado su consentimiento, si están activas.
- Cookies de terceros: gestionadas por proveedores externos que prestan servicios integrados en la web, como analítica, infraestructura u otras funcionalidades, si se utilizan.

**Cookies y tecnologías utilizadas actualmente**

Técnicas necesarias — Cookies de sesión de autenticación

Black Label Market utiliza Supabase como proveedor de infraestructura y autenticación. Cuando un usuario inicia sesión o accede a áreas privadas, Supabase establece cookies de sesión en el navegador.

- Nombre o identificador: cookies de sesión de Supabase (patrón: sb-[referencia-proyecto]-auth-token)
- Responsable: Supabase Inc., como proveedor de infraestructura de autenticación
- Finalidad: gestionar la sesión autenticada del usuario cuando accede a áreas privadas (cuenta, panel de profesional)
- Duración: duración de la sesión activa o hasta que el usuario cierre sesión
- Base de legitimación: necesarias para la prestación del servicio de autenticación solicitado por el usuario

Estas cookies solo están presentes para usuarios que acceden con cuenta propia. Los usuarios que navegan sin autenticación no generan estas cookies.

Tecnologías similares — Almacenamiento local del navegador (localStorage)

Black Label Market utiliza el almacenamiento local del navegador para guardar preferencias y datos funcionales directamente en el dispositivo del usuario, sin transmitirlos a servidores externos ni utilizarlos con fines de seguimiento o publicidad.

- blm_favorites: guarda los vehículos marcados como favoritos por usuarios no autenticados. Finalidad: conservar la selección de favoritos entre sesiones sin necesidad de cuenta. Duración: persiste en el dispositivo hasta que el usuario borra los datos del navegador o elimina los favoritos.
- blm_compare: guarda los vehículos añadidos al comparador. Finalidad: mantener la selección activa durante la navegación. Duración: sesión de navegación activa o hasta que se vacía el comparador.
- blacklabel_alerts: guarda las alertas de vehículos configuradas localmente. Finalidad: conservar las alertas seleccionadas sin necesidad de cuenta. Duración: persiste hasta que el usuario borra los datos del navegador.
- blm_private_searches: guarda localmente los datos de solicitudes de vehículos a la carta completadas. Finalidad: conservar los detalles de búsquedas enviadas. Duración: persiste hasta que el usuario borra los datos del navegador.

Análisis

Actualmente Black Label Market no carga cookies de análisis ni herramientas de medición de terceros. Si en el futuro se incorporan herramientas de analítica, se informará en esta política y solo se activarán cuando el usuario haya prestado su consentimiento, cuando este sea exigible.

Marketing y publicidad

Actualmente Black Label Market no utiliza cookies de marketing, publicidad comportamental ni remarketing. Si en el futuro se incorporan herramientas de este tipo, se informará en esta política y solo se activarán cuando el usuario haya prestado su consentimiento.

**Gestión y configuración de cookies**

Actualmente Black Label Market no carga cookies no técnicas ni herramientas de seguimiento de terceros que requieran consentimiento activo del usuario.

Si en el futuro se incorporan cookies o tecnologías similares no técnicas, se habilitará un panel de configuración de cookies donde el usuario podrá aceptar, rechazar o configurar sus preferencias. La retirada del consentimiento no afectará a la licitud del tratamiento realizado antes de su retirada.

**Cookies técnicas y almacenamiento funcional**

Las cookies técnicas y el almacenamiento local de carácter funcional no pueden desactivarse desde un panel de configuración cuando son imprescindibles para el funcionamiento de la web, la seguridad, la gestión de sesión, el acceso a áreas privadas o la conservación de preferencias solicitadas por el usuario.

El usuario puede bloquearlas o eliminarlas desde la configuración de su navegador, aunque en ese caso algunas funcionalidades de la web podrían no estar disponibles.

**Configuración desde el navegador**

El usuario puede permitir, bloquear o eliminar cookies y el almacenamiento local del navegador desde la configuración de su navegador.

La configuración depende del navegador utilizado. El usuario puede consultar las instrucciones correspondientes en la ayuda oficial de su navegador.

**Actualización de esta Política de Cookies**

Black Label Market podrá actualizar esta Política de Cookies cuando cambien las cookies utilizadas, se incorporen nuevos proveedores, se modifique la configuración técnica de la web o resulte necesario por cambios normativos.

La versión vigente será la publicada en la plataforma en cada momento.
    `.trim(),
  },

  'terminos': {
    title: 'Términos de Uso',
    content: `
**Uso de la plataforma**

Black Label Market es un marketplace de vehículos premium de navegación pública. Cualquier persona puede explorar los vehículos publicados sin necesidad de registro. Para enviar solicitudes de información, búsquedas privadas o acceder como profesional, el usuario debe facilitar datos de contacto veraces.

**Obligaciones del usuario comprador**

- Facilitar datos de contacto veraces al utilizar los formularios de la plataforma.
- No usar la plataforma para fines fraudulentos, ilegales o contrarios a la buena fe.
- No suplantar la identidad de terceros.
- No intentar acceder a áreas restringidas o sistemas de la plataforma.
- Confirmar disponibilidad, condiciones y documentación directamente con el vendedor antes de formalizar cualquier operación.

**Obligaciones del vendedor profesional**

- Publicar información veraz y actualizada sobre los vehículos.
- Mantener la disponibilidad actualizada y retirar unidades vendidas o no disponibles.
- Declarar el estado, kilometraje, documentación y condiciones relevantes del vehículo.
- No publicar imágenes falsas ni correspondientes a otra unidad.
- No ocultar defectos o incidencias relevantes que afecten al valor o estado del vehículo.
- Atender solicitudes de interesados de forma diligente.
- Respetar la normativa aplicable en la comercialización de vehículos.

**Operaciones entre comprador y vendedor**

Black Label Market no interviene como parte compradora ni vendedora en la compraventa del vehículo. Cualquier acuerdo, pago, reserva, financiación, garantía, transporte o entrega se realiza directamente entre las partes implicadas.

Black Label Market actúa exclusivamente como plataforma de publicación y contacto. La operación comercial, negociación, documentación y cualquier acuerdo posterior son responsabilidad de las partes.

**Suscripciones y pagos profesionales**

Los planes de publicación se facturan mensualmente mediante pago automático a través de Stripe. La cancelación es posible en cualquier momento con efecto al final del periodo facturado.

**Limitaciones del servicio**

- Black Label Market puede modificar, pausar o retirar contenido que no cumpla sus criterios editoriales, comerciales o legales.
- Black Label Market puede suspender o cancelar el acceso de un profesional que incumpla estos términos.
- Black Label Market puede rechazar solicitudes de publicación o acceso sin necesidad de justificación adicional.
- Black Label Market puede modificar los criterios de publicación, planes y funcionamiento del servicio.
- La disponibilidad continua del servicio no está garantizada.

**Modificaciones**

Black Label Market puede actualizar estos términos en cualquier momento. Los cambios relevantes serán comunicados a los usuarios registrados con la antelación razonable.

**Legislación aplicable**

Estos términos se rigen por la legislación española. Los conflictos se someterán a los juzgados y tribunales que resulten competentes conforme a la normativa aplicable.
    `.trim(),
  },

  'criterios-publicacion': {
    title: 'Criterios de Publicación',
    content: `
**Black Label Market no es un clasificado abierto**

La publicación de vehículos en Black Label Market está sujeta a criterios editoriales, comerciales y de calidad. Cada solicitud de publicación es revisada por el equipo antes de activarse.

**Tipos de vehículos que encajan**

Coches: premium modernos y de altas prestaciones, deportivos, supercars, hypercars, luxury y executive, clásicos de colección, youngtimers de interés enthusiast, ediciones especiales y series limitadas.

Motos: deportivas premium de altas prestaciones, touring y adventure de gama alta, custom y cruiser premium, scooters premium de segmento alto, clásicas de colección y unidades especiales.

También se consideran vehículos con historia documentada, comunidad activa o valor diferencial claro.

**Criterios que valoramos**

- Marca, modelo y versión.
- Estado general y configuración de la unidad.
- Historial documental y de mantenimiento.
- Demanda y relevancia en el mercado actual.
- Rareza, edición limitada o valor de colección.
- Comunidad y valor cultural del modelo.
- Calidad de la presentación fotográfica.
- Documentación disponible.
- Coherencia del precio con el mercado.
- Vendedor profesional responsable e identificado.

**Requisitos mínimos para publicar**

- Vendedor profesional identificado y aprobado por Black Label Market.
- Disponibilidad real confirmada en el momento de la publicación.
- Fotografías reales de la unidad concreta, no de archivo ni de otra unidad.
- Datos técnicos completos y verificables.
- Precio indicado o condición de consulta clara.
- Ubicación del vehículo.
- Estado declarado con honestidad.
- Garantía o condiciones de venta indicadas.
- Sin incidencias o defectos relevantes ocultos.

**Motivos habituales de rechazo**

- Stock sin criterio editorial o comercial.
- Fotografías de archivo o no correspondientes a la unidad concreta.
- Unidad no disponible en el momento de solicitar la publicación.
- Información incompleta o engañosa.
- Precio sin justificación coherente.
- Documentación con dudas sin resolver.
- Daños o incidencias relevantes no declarados.
- Vendedor no profesional o no aprobado por Black Label Market.
- Vehículos sin encaje con el perfil del marketplace.

**Derecho editorial**

Black Label Market se reserva el derecho de aceptar, rechazar, editar, pausar o retirar publicaciones conforme a sus criterios editoriales, comerciales y de calidad, sin necesidad de justificación adicional.

**¿Quieres publicar en Black Label Market?**

Si eres un profesional del sector y quieres solicitar acceso para publicar vehículos, puedes hacerlo a través del formulario de registro profesional. Tu perfil será revisado antes de habilitar la publicación de vehículos.
    `.trim(),
  },
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const page = LEGAL_CONTENT[slug]
  return { title: page?.title ? `${page.title} — Black Label Market` : 'Legal' }
}

export default async function LegalPage({ params }: PageProps) {
  const { slug } = await params
  const page = LEGAL_CONTENT[slug]
  if (!page) notFound()

  function renderContent(text: string) {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**') && !line.slice(2, -2).includes('**')) {
        return <h2 key={i} className="font-display text-xl font-light text-bsm-text-primary mt-8 mb-3">{line.slice(2, -2)}</h2>
      }
      if (line.match(/^\d+\./)) {
        return <li key={i} className="text-bsm-text-secondary text-sm leading-relaxed mb-2 ml-4">{line.replace(/^\d+\. /, '')}</li>
      }
      if (line.startsWith('- ')) {
        return <li key={i} className="text-bsm-text-secondary text-sm leading-relaxed mb-2 ml-4">{line.slice(2)}</li>
      }
      if (line.trim() === '') {
        return <div key={i} className="h-2" />
      }
      return <p key={i} className="text-bsm-text-secondary text-sm leading-relaxed mb-2">{line}</p>
    })
  }

  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-12 pt-28 pb-20">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-8 bg-gold" />
          <span className="text-xs text-gold tracking-widest uppercase">Legal</span>
        </div>
        <h1 className="section-title">{page.title}</h1>
        <p className="text-xs text-bsm-text-muted mt-3">
          Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}
        </p>
      </div>

      <div className="bg-surface border border-bsm-border p-8">
        {renderContent(page.content)}
      </div>
    </div>
  )
}
