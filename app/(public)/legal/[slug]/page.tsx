import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

const LEGAL_CONTENT: Record<string, { title: string; content: string }> = {
  'aviso-legal': {
    title: 'Aviso Legal',
    content: `
**Identificación del titular**

En cumplimiento de lo dispuesto en la Ley 34/2002, de 11 de julio, de servicios de la sociedad de la información y de comercio electrónico, se informa de que el sitio web Black Label Market, accesible desde blackseriesmarket.com, es titularidad de:

Titular: KAZAWEB, S.L.U.
NIF: B42761254
Domicilio fiscal: Lugar Rebordelo nº 35, Planta 2, 15930 Boiro, A Coruña
Nombre comercial: Black Label Market
Dominio: blackseriesmarket.com
Email de contacto: hola@blackseriesmarket.com
Email legal: hola@blackseriesmarket.com
Actividad: Intermediarios del comercio — Epígrafe IAE 631

**Objeto del sitio web**

Black Label Market es una plataforma digital especializada en la presentación de coches y motos premium, deportivos, clásicos, de colección y unidades especiales publicados por concesionarios, compraventas y especialistas verificados.

El sitio web permite a los usuarios consultar vehículos publicados, contactar con los vendedores profesionales responsables, guardar vehículos, crear solicitudes de vehículos a la carta y acceder a servicios relacionados con la publicación profesional de stock.

**Naturaleza de la plataforma**

Black Label Market actúa como plataforma de publicación, presentación y contacto entre compradores interesados y vendedores profesionales.

Salvo que se indique expresamente lo contrario, Black Label Market no vende directamente los vehículos publicados, no interviene como parte compradora o vendedora en la compraventa y no garantiza por sí misma la disponibilidad, estado, precio final, historial, documentación, garantía o características concretas de los vehículos anunciados.

La operación comercial, negociación, documentación, garantía, pago, reserva, financiación, entrega y cualquier acuerdo posterior se realiza directamente entre el comprador interesado y el vendedor profesional responsable del vehículo.

La información de cada anuncio es facilitada por el vendedor profesional responsable, sin perjuicio de los procesos internos de revisión, verificación o control de calidad que Black Label Market pueda aplicar antes o después de la publicación.

**Uso del sitio web**

El acceso y uso de este sitio web atribuye la condición de usuario e implica la aceptación de este Aviso Legal, así como del resto de textos legales aplicables, incluyendo la Política de Privacidad, la Política de Cookies, los Términos y Condiciones de Uso y, en su caso, las condiciones aplicables a profesionales.

El usuario se compromete a utilizar el sitio web de forma lícita, diligente y conforme a la buena fe, absteniéndose de realizar cualquier uso que pueda dañar, inutilizar, sobrecargar o deteriorar el funcionamiento de la plataforma, sus contenidos o los derechos de terceros.

Queda prohibido utilizar el sitio web para fines ilícitos, fraudulentos, contrarios a la buena fe, al orden público o que puedan perjudicar los intereses de Black Label Market, de otros usuarios, de los profesionales anunciantes o de terceros.

**Responsabilidad sobre la información publicada**

Black Label Market procura que la información publicada sea clara, actualizada y coherente con el posicionamiento de la plataforma. No obstante, los datos relativos a vehículos, precios, disponibilidad, características técnicas, kilometraje, historial, imágenes, financiación, garantías u otras condiciones comerciales son responsabilidad del vendedor profesional que los facilita.

El usuario deberá verificar directamente con el vendedor profesional cualquier información relevante antes de tomar una decisión de compra, reserva, desplazamiento, contratación, entrega de señal o formalización de cualquier operación.

Black Label Market podrá corregir, editar, suspender, limitar la visibilidad o retirar anuncios, perfiles profesionales o contenidos cuando detecte información inexacta, incompleta, desactualizada, engañosa, ilícita o contraria a sus criterios de publicación o a la normativa aplicable.

**Propiedad intelectual e industrial**

Todos los contenidos del sitio web, incluyendo textos, fotografías, vídeos, diseño gráfico, logotipos, marcas, iconos, estructura, código, interfaz, selección de contenidos y demás elementos que formen parte de Black Label Market, están protegidos por derechos de propiedad intelectual e industrial propios o de terceros autorizados.

Queda prohibida la reproducción, distribución, comunicación pública, transformación, extracción, reutilización o explotación de dichos contenidos sin autorización previa y expresa del titular correspondiente, salvo en los casos permitidos por la ley.

Las marcas, nombres comerciales, logotipos, modelos o referencias de fabricantes, concesionarios, compraventas, especialistas o terceros que puedan aparecer en la plataforma pertenecen a sus respectivos titulares y se muestran únicamente con finalidad informativa o identificativa.

**Enlaces a terceros**

El sitio web puede incluir enlaces a páginas, servicios o contenidos de terceros, incluyendo sitios web de profesionales anunciantes, proveedores de informes, financiación, seguros, transporte u otros servicios relacionados.

Black Label Market no controla necesariamente dichos sitios externos y no asume responsabilidad por sus contenidos, políticas, funcionamiento, disponibilidad o prácticas. El acceso a páginas de terceros se realizará bajo la exclusiva responsabilidad del usuario.

**Comunicaciones legales e incidencias**

Para cualquier cuestión relacionada con este Aviso Legal, el usuario puede contactar con Black Label Market a través del siguiente correo electrónico:

hola@blackseriesmarket.com

Este canal también podrá utilizarse para comunicar incidencias legales, anuncios incorrectos, contenidos presuntamente ilícitos o cualquier información que pueda vulnerar los Términos y Condiciones de Uso o la normativa aplicable.

Black Label Market revisará las comunicaciones recibidas y podrá adoptar las medidas que considere oportunas, incluyendo la corrección, suspensión o retirada de contenidos.

**Protección de datos y cookies**

El tratamiento de datos personales realizado a través de Black Label Market se regula en la Política de Privacidad.

El uso de cookies y tecnologías similares se regula en la Política de Cookies. El usuario puede configurar sus preferencias de cookies a través del panel habilitado en la web.

**Legislación aplicable y jurisdicción**

Este Aviso Legal se rige por la legislación española y, cuando resulte aplicable, por la normativa de la Unión Europea.

Para cualquier controversia relacionada con el acceso o uso del sitio web, las partes se someterán a los juzgados y tribunales que resulten competentes conforme a la normativa aplicable.

Cuando el usuario tenga la condición de consumidor, serán competentes los juzgados y tribunales que correspondan conforme a la legislación de consumidores y usuarios.
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

Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Permiten al sitio recordar información sobre tu visita y mejorar tu experiencia.

**Tipos de cookies**

- Técnicas: necesarias para el funcionamiento básico del sitio. Sin ellas, el servicio no puede prestarse correctamente.
- Preferencias: permiten recordar configuraciones seleccionadas por el usuario.
- Analíticas: recogen información estadística sobre el uso del sitio, de forma agregada y anonimizada.
- Publicidad: utilizadas para mostrar contenidos relevantes según el perfil del usuario.
- Terceros: instaladas por servicios externos integrados en la plataforma.

**Cookies utilizadas actualmente**

Actualmente la configuración definitiva de cookies está pendiente de validación técnica.

- Técnicas — Funcionamiento básico de la plataforma — Black Label Market — Duración: [PENDIENTE]
- Analítica — Medición del uso del sitio — Proveedor: [PENDIENTE_ANALYTICS] — Duración: [PENDIENTE]
- Publicidad — Remarketing y audiencias — Proveedor: [PENDIENTE_PIXEL] — Duración: [PENDIENTE]

**Gestión de cookies**

Puedes configurar tu navegador para rechazar o eliminar cookies en cualquier momento. Ten en cuenta que algunas funcionalidades del sitio pueden no estar disponibles si rechazas las cookies técnicas.

Cuando se activen cookies no estrictamente técnicas, la plataforma incorporará un sistema de consentimiento adecuado conforme a la normativa aplicable.

**Actualización de esta política**

Esta política puede actualizarse cuando se modifique la configuración técnica del sitio o cuando la normativa lo requiera. La fecha de última actualización aparece al inicio de esta página.
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
