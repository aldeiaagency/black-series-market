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

  'condiciones-profesionales': {
    title: 'Condiciones para profesionales',
    content: `
**Objeto**

Estas Condiciones para Profesionales regulan el acceso y uso de Black Label Market por parte de concesionarios, compraventas, showrooms, especialistas y otros profesionales del sector que soliciten publicar vehículos o utilizar servicios profesionales de la plataforma.

Black Label Market es una plataforma especializada en la presentación de coches y motos premium, deportivos, clásicos, de colección y unidades especiales publicados por profesionales verificados.

El uso de la plataforma como profesional implica la aceptación de estas Condiciones, así como del Aviso Legal, la Política de Privacidad, la Política de Cookies, los Términos y Condiciones de Uso y los Criterios de Publicación vigentes en cada momento.

**Titular de la plataforma**

Black Label Market es gestionado por KAZAWEB, S.L.U., con NIF B42761254 y domicilio fiscal en Lugar Rebordelo nº 35, Planta 2, 15930 Boiro, A Coruña.

**Acceso profesional**

El acceso profesional a Black Label Market no es automático. La plataforma podrá revisar cada solicitud de alta antes de activar una cuenta profesional o permitir la publicación de vehículos.

Black Label Market podrá valorar, entre otros aspectos, la identidad profesional del solicitante, su actividad, reputación, tipo de stock, calidad de presentación, ubicación, especialización y adecuación al posicionamiento de la plataforma.

Black Label Market se reserva el derecho de aceptar, rechazar, suspender o cancelar solicitudes de acceso profesional cuando considere que no encajan con los criterios comerciales, legales o de calidad de la plataforma.

**Obligaciones del profesional**

El profesional se compromete a:

- Facilitar información veraz, actualizada y completa sobre su identidad, empresa, actividad y datos de contacto.
- Utilizar la plataforma de forma lícita, diligente y conforme a la buena fe.
- Publicar únicamente vehículos reales, disponibles y sobre los que tenga autorización suficiente para comercializar.
- Mantener actualizada la disponibilidad de los vehículos publicados.
- Retirar, pausar o marcar correctamente vehículos vendidos, reservados o no disponibles.
- Facilitar información veraz y completa sobre marca, modelo, versión, año, kilometraje, estado, historial, documentación, garantías, financiación, precio, ubicación y demás condiciones relevantes.
- No ocultar defectos, incidencias, cargas, limitaciones documentales o cualquier circunstancia relevante que pueda afectar a la decisión de compra.
- No utilizar imágenes falsas, de archivo, manipuladas de forma engañosa o correspondientes a otra unidad.
- Atender las solicitudes de compradores de forma profesional y diligente.
- Cumplir la normativa aplicable en materia de venta de vehículos, consumo, garantías, publicidad, protección de datos, comercio electrónico, fiscalidad y cualquier otra que resulte aplicable a su actividad.

**Responsabilidad sobre los anuncios**

El profesional es el único responsable de la información, imágenes, precios, disponibilidad, características, garantías, condiciones comerciales y demás contenidos incluidos en sus anuncios.

Black Label Market podrá revisar, editar, suspender, limitar la visibilidad o retirar cualquier anuncio cuando detecte información incompleta, desactualizada, inexacta, engañosa, ilícita, contraria a estas Condiciones o no alineada con los criterios de publicación de la plataforma.

La revisión o validación de un anuncio por parte de Black Label Market no implica garantía sobre el vehículo ni exime al profesional de su responsabilidad frente a compradores, usuarios, autoridades o terceros.

**Relación con compradores**

Black Label Market actúa como plataforma de publicación, presentación y contacto entre compradores interesados y profesionales.

La operación comercial, negociación, reserva, pago, financiación, garantía, documentación, entrega, transporte y cualquier acuerdo posterior se realiza directamente entre el comprador y el profesional responsable del vehículo.

Black Label Market no interviene como parte compradora ni vendedora en la compraventa de los vehículos publicados, salvo que se indique expresamente lo contrario.

**Solicitudes y contactos recibidos**

El profesional podrá recibir solicitudes de información, contactos o leads generados a través de la plataforma.

El profesional deberá utilizar dichos datos únicamente para gestionar la solicitud concreta del usuario y conforme a la normativa de protección de datos aplicable.

Queda prohibido utilizar los datos recibidos para finalidades no relacionadas con la solicitud, cesiones no autorizadas, comunicaciones abusivas, spam o acciones comerciales no permitidas.

**Planes de suscripción y servicios profesionales**

Black Label Market podrá ofrecer planes de suscripción o servicios de pago para profesionales, incluyendo publicación de vehículos, funcionalidades de visibilidad, gestión de showroom, analíticas, soporte u otros servicios asociados.

Las condiciones económicas, duración, renovación, cancelación, impuestos, facturación y servicios incluidos se indicarán en cada plan o comunicación comercial correspondiente.

Salvo que se indique otra cosa, la cancelación de un plan de suscripción tendrá efecto al finalizar el periodo ya facturado.

El impago, uso indebido o incumplimiento de estas Condiciones podrá dar lugar a la suspensión del servicio, retirada de publicaciones o cancelación del acceso profesional.

**Criterios de publicación**

La publicación de vehículos está sujeta a los criterios de publicación vigentes en Black Label Market.

Black Label Market podrá modificar sus criterios de publicación para mantener la calidad, coherencia y posicionamiento de la plataforma.

El cumplimiento de los criterios mínimos no garantiza necesariamente la publicación o mantenimiento de un vehículo si Black Label Market considera que no encaja con el perfil del marketplace.

**Propiedad intelectual e imágenes**

El profesional garantiza que dispone de derechos, licencias o autorización suficiente para publicar las imágenes, textos, logotipos, marcas, información comercial y demás contenidos que aporte a la plataforma.

Al facilitar contenidos a Black Label Market, el profesional autoriza su uso, reproducción, adaptación técnica, comunicación pública y publicación dentro de la plataforma, canales asociados y materiales necesarios para la promoción del vehículo o del showroom, mientras el contenido permanezca activo o exista relación profesional con la plataforma.

El profesional responderá frente a cualquier reclamación de terceros derivada del uso de contenidos aportados por él.

**Suspensión o cancelación de cuenta profesional**

Black Label Market podrá suspender, limitar o cancelar una cuenta profesional cuando detecte:

- Información falsa, incompleta o engañosa.
- Publicación de vehículos no disponibles o no autorizados.
- Incumplimiento de criterios de publicación.
- Falta de respuesta reiterada a solicitudes.
- Uso indebido de datos de usuarios.
- Impagos.
- Reclamaciones graves o reiteradas.
- Conductas contrarias a la buena fe, a estas Condiciones o a la normativa aplicable.
- Riesgos para usuarios, terceros o para la reputación de la plataforma.

Cuando resulte razonable, Black Label Market podrá comunicar al profesional los motivos principales de la medida adoptada.

**Limitación de responsabilidad**

Black Label Market no será responsable de incumplimientos del profesional frente a compradores, usuarios, autoridades o terceros.

El profesional mantendrá indemne a Black Label Market frente a reclamaciones, daños, sanciones, costes o responsabilidades derivados de la información publicada, la comercialización de vehículos, el uso de datos personales, el incumplimiento de garantías, la falta de disponibilidad, defectos ocultos, documentación irregular o cualquier incumplimiento legal o contractual imputable al profesional.

**Modificación de estas Condiciones**

Black Label Market podrá actualizar estas Condiciones para Profesionales por cambios legales, técnicos, comerciales, operativos o de funcionamiento de la plataforma.

La versión vigente será la publicada en la plataforma en cada momento. Cuando los cambios sean relevantes para profesionales registrados, se procurará informar por medios razonables.

**Legislación aplicable y jurisdicción**

Estas Condiciones se rigen por la legislación española y, cuando resulte aplicable, por la normativa de la Unión Europea.

Para cualquier controversia relacionada con estas Condiciones, las partes se someterán a los juzgados y tribunales que resulten competentes conforme a la normativa aplicable.
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
