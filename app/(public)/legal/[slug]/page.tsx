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
Datos registrales: Inscrita en el Registro Mercantil de Santiago de Compostela, Tomo 395, Libro 0, Folio 51, Sección 8, Hoja SC-51053, Inscripción 1ª

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

El responsable del tratamiento de los datos personales tratados a través de Black Label Market es:

Responsable: KAZAWEB, S.L.U.
NIF: B42761254
Domicilio: Lugar Rebordelo nº 35, Planta 2, 15930 Boiro, A Coruña
Nombre comercial: Black Label Market
Email de privacidad: privacidad@blackseriesmarket.com
Datos registrales: Inscrita en el Registro Mercantil de Santiago de Compostela, Tomo 395, Libro 0, Folio 51, Sección 8, Hoja SC-51053, Inscripción 1ª

Esta Política de Privacidad se aplica a los tratamientos de datos personales realizados a través de Black Label Market, de conformidad con el Reglamento (UE) 2016/679, General de Protección de Datos, y la Ley Orgánica 3/2018, de Protección de Datos Personales y garantía de los derechos digitales.

**Datos personales que tratamos**

Black Label Market puede tratar distintas categorías de datos personales en función del uso que realice el usuario de la plataforma:

- Datos identificativos y de contacto: nombre, apellidos si se facilitan, email, teléfono y datos de comunicación.
- Datos relativos a solicitudes sobre vehículos: vehículo de interés, mensaje enviado, plazo aproximado de compra, preferencias de contacto, financiación, entrega de vehículo usado u otros datos que el usuario decida incluir.
- Datos relativos a vehículos a la carta: tipo de vehículo buscado, marca, modelo, versión, presupuesto aproximado, ubicación preferida, plazo de compra, preferencias y comentarios.
- Datos de cuenta de usuario: identificador de usuario, email, fecha de registro, accesos, preferencias, vehículos guardados y actividad asociada a la cuenta.
- Datos de profesionales o showrooms: nombre de contacto, empresa, email, teléfono, tipo de negocio, ubicación, stock aproximado, información profesional y datos necesarios para valorar o gestionar el acceso profesional.
- Datos de publicación profesional: vehículos publicados, imágenes, características del stock, estado de anuncios, contactos recibidos y métricas agregadas de rendimiento.
- Datos técnicos y de navegación: dirección IP, identificadores técnicos, dispositivo, navegador, logs de seguridad, preferencias de cookies y eventos de uso de la plataforma cuando proceda.
- Datos de analítica interna: vistas de vehículos, clics, contactos, vehículos guardados, filtros utilizados y otros eventos de uso, tratados de forma agregada o limitada para mejorar la plataforma.

Black Label Market no solicita categorías especiales de datos personales. El usuario debe evitar incluir datos especialmente protegidos en campos libres o mensajes.

**Finalidades del tratamiento**

Los datos personales podrán tratarse para las siguientes finalidades:

- Gestionar solicitudes de información sobre vehículos.
- Poner en contacto al usuario interesado con el vendedor profesional responsable del vehículo.
- Gestionar solicitudes de vehículos a la carta.
- Gestionar alertas, favoritos y vehículos guardados.
- Crear y mantener cuentas de usuario.
- Valorar solicitudes de acceso profesional.
- Gestionar perfiles de concesionarios, compraventas, especialistas y showrooms.
- Gestionar la publicación profesional de vehículos.
- Prestar soporte al usuario o al profesional.
- Gestionar planes de suscripción, facturación y relación contractual con profesionales, cuando proceda.
- Mejorar la plataforma, analizar su uso y entender la demanda de vehículos.
- Prevenir abusos, fraude, accesos no autorizados o usos indebidos.
- Cumplir obligaciones legales aplicables.
- Enviar comunicaciones comerciales o informativas cuando el usuario lo haya autorizado o exista otra base jurídica válida.

**Base jurídica del tratamiento**

La base jurídica depende de cada tratamiento:

- Consentimiento del usuario: para el envío voluntario de formularios, solicitudes, comunicaciones comerciales opcionales, aceptación de cookies no necesarias y otras acciones basadas en autorización expresa.
- Ejecución de medidas precontractuales o contractuales: cuando el usuario solicita información sobre un vehículo, pide un vehículo a la carta, crea una cuenta, solicita acceso profesional o contrata un plan de suscripción.
- Interés legítimo: para mantener la seguridad de la plataforma, prevenir abusos, mejorar el servicio, elaborar analítica interna no invasiva, proteger derechos e intereses de Black Label Market y gestionar comunicaciones operativas relacionadas con solicitudes previas.
- Cumplimiento de obligaciones legales: para atender obligaciones fiscales, contables, mercantiles, de protección de datos, consumidores, servicios digitales o requerimientos de autoridades competentes.

Cuando el tratamiento se base en el consentimiento, el usuario podrá retirarlo en cualquier momento sin que ello afecte a la licitud del tratamiento realizado antes de su retirada.

**Comunicación de datos a terceros**

Cuando el usuario solicita información sobre un vehículo, Black Label Market podrá comunicar los datos necesarios al vendedor profesional responsable de dicha unidad para que pueda responder a la solicitud.

También podrán acceder a datos personales proveedores que prestan servicios a Black Label Market como encargados del tratamiento, por ejemplo proveedores de hosting, infraestructura, base de datos, email transaccional, gestión de formularios, analítica, soporte técnico, pagos o herramientas de gestión interna, siempre que sean necesarios para prestar el servicio.

Black Label Market también podrá comunicar datos cuando exista obligación legal, requerimiento de autoridad competente o necesidad de proteger derechos, seguridad o intereses legítimos.

No se venderán datos personales de usuarios a terceros.

**Transferencias internacionales**

Algunos proveedores tecnológicos utilizados por Black Label Market pueden estar ubicados fuera del Espacio Económico Europeo o prestar servicios mediante infraestructuras internacionales.

Cuando se produzcan transferencias internacionales de datos, Black Label Market procurará que se realicen conforme a las garantías previstas por la normativa aplicable, incluyendo decisiones de adecuación, cláusulas contractuales tipo u otros mecanismos reconocidos por el RGPD.

**Conservación de los datos**

Los datos se conservarán durante el tiempo necesario para cumplir la finalidad para la que fueron recogidos y, posteriormente, durante los plazos en los que puedan derivarse responsabilidades legales, contractuales o administrativas.

Con carácter general:

- Las solicitudes de información se conservarán durante el tiempo necesario para gestionarlas y atender posibles responsabilidades.
- Las solicitudes de vehículos a la carta se conservarán mientras resulten útiles para gestionar la búsqueda o hasta que el usuario solicite su eliminación, salvo obligación legal de conservación.
- Los datos de cuenta se conservarán mientras la cuenta permanezca activa y, después, durante los plazos legalmente exigibles.
- Los datos de profesionales se conservarán mientras exista relación profesional, contractual o precontractual con Black Label Market y durante los plazos legales aplicables.
- Los datos de facturación o contratación se conservarán durante los plazos fiscales, contables y mercantiles exigibles.
- Los datos técnicos y de seguridad se conservarán durante el tiempo necesario para proteger la plataforma y prevenir usos indebidos.
- Las preferencias de cookies se conservarán conforme a lo indicado en la Política de Cookies.

**Derechos de los usuarios**

El usuario puede ejercer los siguientes derechos en materia de protección de datos:

- Acceso.
- Rectificación.
- Supresión.
- Oposición.
- Limitación del tratamiento.
- Portabilidad.
- Retirada del consentimiento cuando el tratamiento se base en consentimiento.

Para ejercer estos derechos, el usuario puede escribir a:

privacidad@blackseriesmarket.com

La solicitud deberá indicar el derecho que se desea ejercer y permitir identificar razonablemente al solicitante.

El usuario también tiene derecho a presentar una reclamación ante la Agencia Española de Protección de Datos a través de www.aepd.es si considera que el tratamiento de sus datos no se ajusta a la normativa aplicable.

**Comunicaciones comerciales**

Black Label Market solo enviará comunicaciones comerciales electrónicas cuando exista una base jurídica válida para ello, especialmente consentimiento del usuario o una relación previa que permita comunicaciones relacionadas con servicios similares.

El usuario podrá solicitar la baja o retirar su consentimiento en cualquier momento a través de los mecanismos habilitados en cada comunicación o escribiendo a privacidad@blackseriesmarket.com.

**Cookies y tecnologías similares**

El uso de cookies y tecnologías similares se regula en la Política de Cookies.

Las cookies técnicas necesarias pueden utilizarse para el funcionamiento básico de la web. Las cookies de análisis, publicidad o similares solo se utilizarán cuando exista consentimiento válido del usuario, cuando resulte exigible.

El usuario puede configurar o modificar sus preferencias de cookies desde el panel habilitado en la web.

**Seguridad de los datos**

Black Label Market aplica medidas técnicas y organizativas orientadas a proteger los datos personales frente a accesos no autorizados, pérdida, alteración, divulgación o destrucción.

No obstante, ningún sistema conectado a internet puede garantizar una seguridad absoluta. El usuario debe utilizar la plataforma de forma diligente y evitar enviar información innecesaria o sensible a través de campos libres.

**Decisiones automatizadas y elaboración de perfiles**

Black Label Market no adopta decisiones automatizadas con efectos jurídicos o significativamente similares sobre los usuarios.

La plataforma puede utilizar métricas internas y datos agregados para entender el uso del servicio, mejorar la experiencia, analizar demanda o mostrar información de rendimiento a profesionales sobre sus propios vehículos, sin que ello implique decisiones automatizadas individuales con efectos jurídicos para el usuario.

**Menores de edad**

Black Label Market no está dirigido a menores de edad.

El usuario declara ser mayor de edad y contar con capacidad suficiente para utilizar la plataforma. Black Label Market no recaba datos de menores de forma consciente. Si se detecta que se han recogido datos de un menor sin autorización válida, se adoptarán las medidas oportunas para su eliminación.

**Actualización de esta Política de Privacidad**

Black Label Market podrá actualizar esta Política de Privacidad cuando sea necesario por cambios normativos, técnicos, operativos o de tratamiento de datos.

Cuando los cambios sean relevantes, se informará a los usuarios por medios razonables. La versión vigente será la publicada en la plataforma en cada momento.
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
