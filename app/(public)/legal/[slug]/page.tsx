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
    title: 'Términos y Condiciones de Uso',
    content: `
**Objeto de los Términos**

Estos Términos y Condiciones regulan el acceso, navegación y uso de Black Label Market, plataforma digital gestionada por KAZAWEB, S.L.U. bajo el nombre comercial Black Label Market.

Black Label Market está orientada a la presentación de coches y motos premium, deportivos, clásicos, de colección y unidades especiales publicados por concesionarios, compraventas, showrooms y especialistas verificados.

El acceso y uso de la plataforma atribuye la condición de usuario e implica la aceptación de estos Términos, sin perjuicio de las condiciones particulares que puedan aplicarse a determinados servicios, cuentas profesionales, planes de suscripción o publicaciones.

**Naturaleza de la plataforma**

Black Label Market actúa como plataforma de publicación, presentación y contacto entre compradores interesados y vendedores profesionales.

Salvo que se indique expresamente lo contrario, Black Label Market no vende directamente los vehículos publicados, no interviene como parte compradora o vendedora en la compraventa y no garantiza por sí misma la disponibilidad, estado, precio final, historial, documentación, garantía o características concretas de los vehículos anunciados.

La operación comercial, negociación, documentación, garantía, pago, reserva, financiación, transporte, entrega y cualquier acuerdo posterior se realiza directamente entre el comprador interesado y el vendedor profesional responsable del vehículo.

**Uso de la plataforma**

Cualquier usuario puede explorar los vehículos publicados sin necesidad de registro, salvo en aquellas funcionalidades que requieran cuenta de usuario o identificación.

Para enviar solicitudes de información, guardar vehículos, crear alertas, solicitar vehículos a la carta o acceder como profesional, el usuario deberá facilitar datos veraces, actualizados y suficientes para gestionar correctamente la solicitud.

El usuario se compromete a utilizar Black Label Market de forma lícita, diligente y conforme a la buena fe, evitando cualquier uso fraudulento, abusivo, automatizado, ilícito o contrario a estos Términos.

**Obligaciones del usuario comprador**

El usuario comprador o interesado se compromete a:

- Facilitar datos de contacto veraces al utilizar formularios o funcionalidades de la plataforma.
- No suplantar la identidad de terceros.
- No utilizar la plataforma para fines fraudulentos, ilícitos, abusivos o contrarios a la buena fe.
- No intentar acceder a áreas restringidas, sistemas internos, cuentas de terceros o funcionalidades no autorizadas.
- Confirmar directamente con el vendedor profesional la disponibilidad, precio, estado, kilometraje, documentación, garantía, financiación y cualquier condición relevante antes de formalizar una operación.
- Realizar las comprobaciones técnicas, documentales, administrativas o legales que considere necesarias antes de comprar, reservar, financiar, entregar señal o desplazarse para ver un vehículo.
- No remitir mensajes ofensivos, falsos, comerciales no solicitados, automatizados o ajenos al interés legítimo en un vehículo o servicio.

**Cuentas de usuario, favoritos y alertas**

Black Label Market puede permitir la creación de cuentas de usuario para acceder a funcionalidades como vehículos guardados, favoritos, alertas, solicitudes o historial de actividad.

El usuario será responsable de mantener la confidencialidad de sus credenciales y de utilizar su cuenta de forma adecuada.

La funcionalidad de vehículos guardados, favoritos o alertas tiene carácter informativo y no implica reserva, bloqueo, disponibilidad garantizada ni derecho preferente sobre ningún vehículo.

Black Label Market podrá modificar, suspender o eliminar funcionalidades de cuenta, favoritos o alertas por motivos técnicos, legales, de seguridad o de evolución del servicio.

**Vehículos a la carta**

La funcionalidad de vehículos a la carta permite al usuario indicar qué tipo de coche o moto está buscando para que Black Label Market pueda revisar posibles opciones compatibles entre profesionales verificados.

El envío de una solicitud de vehículo a la carta no garantiza la localización de una unidad concreta, la disponibilidad de stock, un precio determinado, ni la formalización de operación alguna.

Black Label Market podrá contactar con el usuario para ampliar información o comunicar opciones disponibles, siempre conforme a la Política de Privacidad.

**Obligaciones del vendedor profesional**

El vendedor profesional, concesionario, compraventa, showroom o especialista que solicite acceso o publique vehículos en Black Label Market se compromete a:

- Facilitar información veraz, actualizada y completa sobre su identidad profesional.
- Publicar información veraz, completa y actualizada sobre los vehículos.
- Mantener la disponibilidad actualizada y retirar o marcar correctamente unidades vendidas, reservadas o no disponibles.
- Declarar de forma clara el estado, kilometraje, historial, documentación, garantías, condiciones comerciales y cualquier circunstancia relevante del vehículo.
- No publicar imágenes falsas, de archivo, manipuladas de forma engañosa o correspondientes a otra unidad.
- No ocultar defectos, incidencias, cargas, limitaciones documentales o información relevante que pueda afectar al valor, estado o decisión de compra.
- Atender las solicitudes de interesados de forma diligente y profesional.
- Respetar la normativa aplicable en materia de venta de vehículos, garantías, consumo, publicidad, protección de datos, comercio electrónico y cualquier otra que resulte aplicable.
- Cumplir los criterios de publicación y, en su caso, las condiciones específicas para profesionales.

Estas obligaciones se entienden sin perjuicio de los Criterios de Publicación, las condiciones específicas para profesionales y las condiciones particulares de los planes de suscripción que puedan resultar aplicables.

**Publicación, revisión y retirada de contenidos**

Black Label Market no es un clasificado abierto. La publicación de vehículos, perfiles profesionales o contenidos puede estar sujeta a revisión previa o posterior.

Black Label Market podrá aceptar, rechazar, editar, pausar, limitar la visibilidad o retirar anuncios, perfiles, imágenes, textos o contenidos cuando considere que incumplen estos Términos, los criterios de publicación, las condiciones profesionales, la normativa aplicable o los estándares de calidad de la plataforma.

También podrá adoptar medidas cuando detecte información incompleta, inexacta, desactualizada, engañosa, ilícita, fraudulenta, ofensiva, no autorizada o que pueda perjudicar a usuarios, profesionales, terceros o a la propia plataforma.

**Notificación de contenidos incorrectos o ilícitos**

Los usuarios, profesionales o terceros pueden comunicar a Black Label Market la existencia de anuncios incorrectos, contenidos presuntamente ilícitos, información engañosa, uso indebido de marcas, imágenes no autorizadas, suplantación, fraude o cualquier vulneración de estos Términos.

Las comunicaciones deberán enviarse a través del canal legal o de contacto indicado en el Aviso Legal, incluyendo información suficiente para identificar el contenido afectado y explicar el motivo de la comunicación.

Black Label Market revisará las comunicaciones recibidas y podrá adoptar las medidas que considere oportunas, incluyendo la solicitud de información adicional, corrección, suspensión, limitación de visibilidad, retirada del contenido o suspensión de la cuenta afectada.

**Operaciones entre comprador y vendedor**

Black Label Market no interviene como parte compradora ni vendedora en las operaciones sobre vehículos publicados por terceros.

Cualquier acuerdo, reserva, señal, pago, financiación, garantía, transporte, entrega, revisión técnica, documentación, contrato de compraventa o reclamación derivada de la operación será responsabilidad de las partes implicadas.

Black Label Market no se responsabiliza de incumplimientos, desacuerdos, daños, pérdidas, reclamaciones, defectos, retrasos, cancelaciones o controversias surgidas entre comprador y vendedor, sin perjuicio de las medidas que pueda adoptar sobre el uso de la plataforma cuando corresponda.

**Planes de suscripción y pagos profesionales**

Black Label Market puede ofrecer planes de suscripción o servicios de pago dirigidos a profesionales para publicar vehículos, acceder a funcionalidades, destacar stock o gestionar su presencia en la plataforma.

Las condiciones económicas, duración, renovación, cancelación, impuestos, facturación y servicios incluidos se indicarán en cada plan o en las condiciones específicas aplicables a profesionales.

Si el pago se gestiona mediante un proveedor externo, el profesional deberá aceptar, cuando corresponda, las condiciones de dicho proveedor.

Salvo que se indique otra cosa, la cancelación de un plan de suscripción tendrá efecto al final del periodo ya facturado, sin perjuicio de las condiciones particulares aplicables.

**Disponibilidad y funcionamiento del servicio**

Black Label Market trabaja para mantener la plataforma disponible y operativa, pero no garantiza la disponibilidad continua, ausencia de errores, interrupciones, fallos técnicos, pérdida de información o compatibilidad permanente con todos los dispositivos, navegadores o sistemas.

La plataforma podrá ser suspendida, modificada o interrumpida por mantenimiento, mejoras, incidencias técnicas, motivos de seguridad, fuerza mayor o causas ajenas al control de Black Label Market.

**Limitación de responsabilidad**

Black Label Market no será responsable de:

- La exactitud absoluta de la información facilitada por vendedores profesionales.
- La disponibilidad real de los vehículos anunciados.
- Las decisiones de compra adoptadas por los usuarios.
- Las negociaciones, acuerdos o transacciones realizadas directamente entre comprador y vendedor.
- La revisión técnica, documental, administrativa o legal que las partes deban realizar.
- Los contenidos, servicios o páginas de terceros enlazados desde la plataforma.
- El uso indebido de la plataforma por usuarios o profesionales.
- Daños derivados de interrupciones, errores técnicos o incidencias ajenas a su control, dentro de los límites permitidos por la normativa aplicable.

Nada en estos Términos limitará los derechos que la normativa imperativa reconozca a los consumidores y usuarios cuando resulte aplicable.

**Propiedad intelectual e industrial**

El diseño, textos, logotipos, marca, estructura, código, interfaz, contenidos propios y elementos distintivos de Black Label Market son titularidad de KAZAWEB, S.L.U. o de sus licenciantes.

Queda prohibida la reproducción, distribución, comunicación pública, transformación, extracción, reutilización o explotación de dichos elementos sin autorización previa y expresa, salvo en los casos permitidos por la ley.

Las marcas, nombres comerciales, modelos, logotipos o referencias de fabricantes, concesionarios, compraventas, showrooms, especialistas o terceros pertenecen a sus respectivos titulares y se utilizan con finalidad informativa o identificativa.

**Suspensión o cancelación de acceso**

Black Label Market podrá suspender, limitar o cancelar el acceso de un usuario o profesional cuando detecte incumplimientos de estos Términos, usos fraudulentos, riesgos de seguridad, información falsa, actividad abusiva, contenidos ilícitos, impagos, infracción de derechos de terceros o cualquier conducta contraria a la buena fe o a la normativa aplicable.

Cuando resulte razonable y posible, Black Label Market podrá comunicar los motivos principales de la medida adoptada, sin perjuicio de aquellas situaciones en las que deba proteger la seguridad, confidencialidad, investigación de fraudes o cumplimiento legal.

**Modificaciones de los Términos**

Black Label Market podrá actualizar estos Términos cuando sea necesario por cambios legales, técnicos, operativos, comerciales o de funcionamiento de la plataforma.

La versión vigente será la publicada en la plataforma en cada momento. Cuando los cambios sean relevantes para usuarios registrados o profesionales, se procurará informar por medios razonables.

El uso continuado de la plataforma tras la publicación de cambios supondrá la aceptación de la versión actualizada, sin perjuicio de los derechos que correspondan al usuario conforme a la normativa aplicable.

**Protección de datos y cookies**

El tratamiento de datos personales se regula en la Política de Privacidad.

El uso de cookies y tecnologías similares se regula en la Política de Cookies. El usuario puede configurar sus preferencias mediante el panel habilitado en la web cuando resulte aplicable.

**Legislación aplicable y jurisdicción**

Estos Términos se rigen por la legislación española y, cuando resulte aplicable, por la normativa de la Unión Europea.

Para cualquier controversia relacionada con el acceso o uso de la plataforma, las partes se someterán a los juzgados y tribunales que resulten competentes conforme a la normativa aplicable.

Cuando el usuario tenga la condición de consumidor, serán competentes los juzgados y tribunales que correspondan conforme a la normativa de consumidores y usuarios.
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
