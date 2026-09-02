import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

const LAST_UPDATED = '20 de julio de 2026'

const LEGAL_CONTENT: Record<string, { title: string; content: string }> = {
  'aviso-legal': {
    title: 'Aviso Legal',
    content: `
**Identificación del titular**

En cumplimiento de lo dispuesto en la Ley 34/2002, de 11 de julio, de servicios de la sociedad de la información y de comercio electrónico, se informa de que el sitio web Black Label Market, accesible desde blacklabelmarket.es, es titularidad de:

Titular: KAZAWEB, S.L.U.
NIF: B42761254
Domicilio fiscal: Lugar Rebordelo nº 35, Planta 2, 15930 Boiro, A Coruña
Nombre comercial: Black Label Market
Dominio: blacklabelmarket.es
Email de contacto: hola@blacklabelmarket.es
Email legal: hola@blacklabelmarket.es
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

hola@blacklabelmarket.es

Este canal también podrá utilizarse para comunicar incidencias legales, anuncios incorrectos, contenidos presuntamente ilícitos o cualquier información que pueda vulnerar los Términos y Condiciones de Uso o la normativa aplicable.

Black Label Market revisará las comunicaciones recibidas y podrá adoptar las medidas que considere oportunas, incluyendo la corrección, suspensión o retirada de contenidos.

**Notificación de contenido presuntamente ilícito**

Cualquier persona o entidad puede notificar contenido que considere ilícito escribiendo a hola@blacklabelmarket.es. La notificación deberá incluir: una explicación suficientemente motivada de la ilicitud; la URL exacta del anuncio o contenido; el nombre y email del notificante, salvo las excepciones previstas legalmente; una declaración de buena fe confirmando que la información y alegaciones son precisas y completas.

Black Label Market acusará recibo sin dilación indebida cuando disponga de un email de contacto. La notificación será tratada de forma diligente, objetiva, no arbitraria y en tiempo oportuno. El notificante recibirá la decisión adoptada y las vías de recurso disponibles. Si se emplean medios automatizados para tramitar o decidir, se informará de ello.

**Puntos de contacto DSA**

Punto de contacto para autoridades de los Estados miembros, Comisión Europea y Junta Europea de Servicios Digitales: hola@blacklabelmarket.es. Se aceptan comunicaciones en castellano e inglés.

Punto de contacto para usuarios, profesionales y demás destinatarios del servicio: hola@blacklabelmarket.es. Las comunicaciones podrán ser revisadas por una persona y no se tramitarán exclusivamente mediante herramientas automatizadas.

**Protección de datos y cookies**

El tratamiento de datos personales realizado a través de Black Label Market se regula en la Política de Privacidad.

El uso de cookies y tecnologías similares se regula en la Política de Cookies. El usuario puede configurar sus preferencias de cookies a través del panel habilitado en la web.

**Resolución alternativa de reclamaciones de consumo**

Si una reclamación presentada por un consumidor a KAZAWEB, S.L.U. no pudiera resolverse directamente, Black Label Market informará al consumidor, en soporte duradero y dentro del plazo legal, de la entidad de resolución alternativa competente y de si participará en el procedimiento correspondiente, conforme al artículo 40 de la Ley 7/2017.

Lo anterior se refiere exclusivamente a controversias entre el consumidor y KAZAWEB, S.L.U. relativas a servicios propios de Black Label Market. Las reclamaciones derivadas de la compraventa del vehículo deberán dirigirse al vendedor profesional.

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
Email de privacidad: privacidad@blacklabelmarket.es
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
**Fuentes públicas de showrooms**

Para verificar solicitudes profesionales, Black Label Market puede consultar datos empresariales y de contacto disponibles en la web del showroom, Google Business, perfiles profesionales en redes sociales y registros públicos. La finalidad es verificar la identidad, actividad, reputación comercial y adecuación del solicitante, sobre la base de medidas precontractuales y del interés legítimo en prevenir fraude y mantener la calidad del marketplace.

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
Respecto del formulario y entrega inicial del contacto, KAZAWEB, S.L.U. y el vendedor profesional actuarán como responsables independientes de los tratamientos cuyos fines y medios determinen respectivamente. El profesional deberá facilitar su propia información de privacidad cuando trate el contacto para su seguimiento comercial.

También podrán acceder a datos personales proveedores que prestan servicios a Black Label Market como encargados del tratamiento, por ejemplo proveedores de hosting, infraestructura, base de datos, email transaccional, gestión de formularios, analítica, soporte técnico, pagos o herramientas de gestión interna, siempre que sean necesarios para prestar el servicio.

Black Label Market también podrá comunicar datos cuando exista obligación legal, requerimiento de autoridad competente o necesidad de proteger derechos, seguridad o intereses legítimos.

No se venderán datos personales de usuarios a terceros.

**Encargados del tratamiento principales**

Entre los proveedores que pueden acceder a datos personales como encargados del tratamiento para prestar servicios a Black Label Market se encuentran:

- Supabase Inc. (EE.UU./UE): base de datos, autenticación y almacenamiento. Transferencias cubiertas por cláusulas contractuales tipo (SCCs).
- Vercel Inc. (EE.UU./UE): hosting e infraestructura web. Transferencias cubiertas por cláusulas contractuales tipo (SCCs).
- Stripe Inc. (EE.UU./UE): procesamiento de pagos y suscripciones profesionales. Transferencias cubiertas por cláusulas contractuales tipo (SCCs).
- Google LLC (EE.UU.): analítica web mediante Google Analytics 4 y Google Tag Manager, únicamente cuando estén activos y el usuario haya prestado su consentimiento previo. Transferencias cubiertas por el Marco EU-EE.UU. de Privacidad de Datos (DPF).

Esta lista puede actualizarse cuando se incorporen o modifiquen proveedores relevantes.

**Transferencias internacionales**

Algunos proveedores tecnológicos utilizados por Black Label Market pueden estar ubicados fuera del Espacio Económico Europeo o prestar servicios mediante infraestructuras internacionales.

Cuando se produzcan transferencias internacionales de datos, Black Label Market procurará que se realicen conforme a las garantías previstas por la normativa aplicable, incluyendo decisiones de adecuación, cláusulas contractuales tipo u otros mecanismos reconocidos por el RGPD. Cuando se utilicen cláusulas contractuales tipo u otras garantías del artículo 46 RGPD, el interesado podrá solicitar información adicional o una copia de las garantías aplicables escribiendo a privacidad@blacklabelmarket.es.

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

privacidad@blacklabelmarket.es

La solicitud deberá indicar el derecho que se desea ejercer y permitir identificar razonablemente al solicitante.

Black Label Market responderá a las solicitudes de ejercicio de derechos en el plazo de un mes desde su recepción. Cuando resulte necesario por la complejidad o el número de solicitudes, el plazo podrá prorrogarse otros dos meses. La prórroga y sus motivos se comunicarán al interesado dentro del primer mes.

El usuario también tiene derecho a presentar una reclamación ante la Agencia Española de Protección de Datos a través de www.aepd.es si considera que el tratamiento de sus datos no se ajusta a la normativa aplicable.

**Comunicaciones comerciales**

Black Label Market solo enviará comunicaciones comerciales electrónicas cuando exista una base jurídica válida para ello, especialmente consentimiento del usuario o una relación previa que permita comunicaciones relacionadas con servicios similares.

El usuario podrá solicitar la baja o retirar su consentimiento en cualquier momento a través de los mecanismos habilitados en cada comunicación o escribiendo a privacidad@blacklabelmarket.es.

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

- black_label_cookie_consent: guarda las categorías aceptadas o rechazadas, la fecha y hora del consentimiento y la versión del panel de consentimiento. Finalidad: recordar y acreditar las preferencias de cookies. Duración: hasta que se actualice la versión del consentimiento o el usuario borre los datos del navegador.
- blm_compare: guarda los vehículos añadidos al comparador. Finalidad: mantener la selección activa durante la navegación. Duración: hasta que se vacía el comparador o se borran los datos del navegador.
- blm_private_searches: guarda localmente una copia de las solicitudes de vehículos a la carta completadas. Finalidad: conservar los detalles de búsquedas enviadas como comodidad para el usuario. Duración: persiste hasta que el usuario borra los datos del navegador.
- blm_publish_draft: guarda el borrador de publicación del profesional mientras completa un alta de vehículo. Finalidad: evitar la pérdida del formulario si el profesional recarga o navega antes de guardar. Duración: hasta que se publica, se guarda o se borran los datos del navegador.
Análisis

Black Label Market utiliza las siguientes herramientas de análisis, condicionadas al consentimiento previo del usuario. Sin dicho consentimiento estas herramientas no se activan y no se depositan cookies de análisis.

**Google Tag Manager (GTM)**
- Proveedor: Google Ireland Limited / Google LLC (EE. UU.)
- Finalidad: gestión y carga condicional de etiquetas de analítica; solo se carga cuando el usuario ha aceptado la categoría analítica
- Base de legitimación: consentimiento del usuario para la categoría analítica
- No genera cookies propias

**Google Analytics 4 (GA4)**
- Proveedor: Google Ireland Limited / Google LLC (EE. UU.)
- Finalidad: análisis estadístico del uso de la web (páginas vistas, sesiones, eventos, dispositivo, ubicación aproximada)
- Base de legitimación: consentimiento del usuario (categoría analítica)
- Transferencia internacional: servidores de Google en la UE y EE. UU. bajo el marco EU-US Data Privacy Framework
- Retención: 14 meses
- Cookies: _ga (2 años), _ga_419RRDTX12 (2 años), _gid (24 horas)
- Más información: https://policies.google.com/privacy

Marketing y publicidad

Actualmente Black Label Market no utiliza cookies de marketing, publicidad comportamental ni remarketing. Si en el futuro se incorporan herramientas de este tipo, se informará en esta política y solo se activarán cuando el usuario haya prestado su consentimiento.

**Gestión y configuración de cookies**

Black Label Market dispone de un panel de configuración de cookies accesible desde el aviso que aparece al visitar la web por primera vez y desde el enlace habilitado en el pie de página.

A través de dicho panel el usuario puede:
- Aceptar todas las cookies
- Rechazar las cookies no técnicas
- Configurar sus preferencias por categoría (técnicas necesarias, analítica, marketing)

La elección del usuario se almacena en el navegador y se respeta en sucesivas visitas. Las herramientas de analítica solo se activan cuando el usuario ha prestado su consentimiento para dicha categoría. La retirada del consentimiento no afectará a la licitud del tratamiento realizado con anterioridad.

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
**Vehículos y contenidos prohibidos**

No podrán publicarse vehículos robados, apropiados sin autorización, sujetos a embargo o reserva de dominio no declarada, con número de bastidor manipulado, documentación falsa, origen ilícito, características cuya comercialización esté prohibida o que no puedan venderse legalmente en España.

Tampoco podrán publicarse anuncios engañosos, ofertas señuelo, precios falsos, fotografías de otra unidad, información que infrinja derechos de terceros o contenidos discriminatorios, violentos, fraudulentos o contrarios a la normativa aplicable.

Las cargas, limitaciones administrativas, daños estructurales, siniestros relevantes, modificaciones no homologadas y cualquier circunstancia que afecte a la seguridad, documentación, valor o posibilidad de transmisión deberán declararse de forma clara.

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

**Garantías legales aplicables**

Cuando el vendedor sea un profesional y el comprador un consumidor, la compraventa estará sujeta al régimen de conformidad del texto refundido de la Ley General para la Defensa de los Consumidores y Usuarios. En vehículos de segunda mano, el plazo legal general de responsabilidad es de tres años desde la entrega, aunque vendedor y consumidor pueden pactar un plazo inferior que nunca podrá ser menor de un año. El vendedor deberá informar claramente del plazo aplicable antes de contratar. Black Label Market no otorga garantía propia sobre los vehículos publicados ni asume en ningún caso la posición de vendedor.

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

Cuando resulte razonable y posible, Black Label Market comunicará al afectado los motivos principales de la medida adoptada, conforme a lo previsto en el Reglamento (UE) 2022/2065, de Servicios Digitales, sin perjuicio de aquellas situaciones en las que deba proteger la seguridad, confidencialidad, investigación de fraudes o cumplimiento legal.

El afectado podrá impugnar la decisión enviando una reclamación motivada a hola@blacklabelmarket.es. Black Label Market tramitará la reclamación y comunicará al interesado el resultado en un plazo razonable, sin perjuicio de los cauces legales o judiciales que correspondan.

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
**Black Label Market no es un clasificado. Es una selección.**

Cada unidad que aparece en el catálogo ha pasado por un proceso de revisión. No publicamos todo lo que llega: publicamos lo que encaja. La selección es nuestro estándar, y es lo que distingue esta plataforma de cualquier clasificado abierto.

No existe un único criterio automático por precio, kilometraje o antigüedad. Cada solicitud se valora dentro del contexto de la unidad concreta.

**Compradores cualificados, no curiosos.**

Los compradores de Black Label Market buscan una unidad específica con criterio e intención real. No vienen a comparar precios: vienen a encontrar lo correcto. Tu stock compite en relevancia y presentación, no en coste por clic.

**Qué determina el encaje de una unidad**

Revisamos cada solicitud en su conjunto. Los factores que valoramos incluyen:

- Marca, modelo y versión.
- Configuración concreta de la unidad.
- Estado general.
- Kilometraje en relación con el tipo de vehículo.
- Historial documental y de mantenimiento.
- Rareza, edición limitada o valor de colección.
- Demanda y relevancia en el mercado.
- Calidad de la presentación fotográfica.
- Coherencia del precio con la unidad.
- Disponibilidad real.
- Vendedor profesional identificado y verificado.

**Marcas premium y marcas generalistas**

Algunas marcas encajan de forma natural en Black Label por su posicionamiento premium, deportivo o de lujo.

Otras marcas más generalistas también pueden formar parte del catálogo cuando la unidad lo justifique por modelo, versión, preparación, historia, estado, rareza o atractivo especial.

No todos los vehículos de una marca generalista encajan en Black Label, pero sí pueden hacerlo versiones deportivas, ediciones limitadas, unidades de colección, modelos icónicos, configuraciones especiales o vehículos con una demanda clara entre entusiastas.

**Ejemplos de encaje**

- Deportivos y altas prestaciones.
- Supercars e hypercars.
- Luxury, executive y gran turismo.
- Clásicos y youngtimers con interés real.
- Ediciones especiales o series limitadas.
- Modelos icónicos o con comunidad activa.
- Motos deportivas, touring premium, custom y cruiser premium, clásicas, adventure de gama alta y unidades especiales.

**Requisitos mínimos para publicar**

Estas son las condiciones que toda publicación debe cumplir. Sin excepciones.

- Vendedor profesional identificado y aprobado por Black Label Market.
- Vehículo real y disponible.
- Fotografías reales de la unidad concreta, no de archivo ni de otra unidad.
- Información técnica completa y verificable.
- Estado declarado con honestidad.
- Ubicación clara.
- Precio indicado o condición de consulta clara.
- Garantía o condiciones de venta indicadas cuando aplique.
- Ausencia de incidencias relevantes ocultas.

**Por qué una unidad puede no pasar el filtro**

- Información incompleta, inexacta o engañosa.
- Fotografías de archivo o de otra unidad.
- Vehículo no disponible.
- Estado, kilometraje, historial o documentación con dudas relevantes.
- Precio sin coherencia con la unidad.
- Daños o incidencias importantes no declarados.
- Vendedor no profesional o no aprobado.
- Unidad sin encaje suficiente con el perfil de Black Label Market.

**Derecho de publicación**

Black Label Market se reserva el derecho de aceptar, rechazar, editar, pausar o retirar publicaciones en función de sus criterios de calidad y criterios comerciales.

**Clasificación de vehículos y showrooms**

En el catálogo de vehículos, el orden predeterminado sitúa primero los anuncios que tienen activo un Boost o destacado contratado separadamente o incluido en el plan del profesional. Dentro de cada grupo, los anuncios se ordenan por fecha de publicación, de más reciente a más antigua. El destacado remunerado es, por tanto, el parámetro de mayor importancia relativa en el orden predeterminado.

La completitud, calidad de las fotografías, exactitud de los datos y adecuación a los Criterios de Publicación se utilizan para decidir si un anuncio puede publicarse o mantenerse activo, pero no constituyen actualmente un parámetro directo del orden predeterminado.

El usuario puede cambiar el orden mediante las opciones de fecha, precio y kilometraje disponibles en el catálogo.

En el directorio de showrooms se muestran primero los perfiles marcados como destacados; a continuación se tiene en cuenta el plan y, finalmente, el nombre del showroom. Determinados planes de pago pueden incluir tratamiento destacado y, por tanto, influir en la posición.

Black Label Market podrá aplicar selecciones editoriales en espacios específicamente identificados como 'Selección editorial'. Estas selecciones se diferenciarán de los destacados remunerados.
    `.trim(),
  },

  'condiciones-profesionales': {
    title: 'Condiciones para profesionales',
    content: `
Versión: 2 de septiembre de 2026

**Objeto**

Estas Condiciones para Profesionales regulan el acceso y uso de Black Label Market por parte de concesionarios, compraventas, showrooms, especialistas y otros profesionales del sector que soliciten publicar vehículos o utilizar servicios profesionales de la plataforma.

Black Label Market es una plataforma especializada en la presentación de coches y motos premium, deportivos, clásicos, de colección y unidades especiales publicados por profesionales verificados.

El uso de la plataforma como profesional implica la aceptación de estas Condiciones, así como del Aviso Legal, la Política de Privacidad, la Política de Cookies, los Términos y Condiciones de Uso y los Criterios de Publicación vigentes en cada momento.
**Perfección del contrato y capacidad de representación**

Estas Condiciones, junto con la ficha u orden del plan contratado, los Términos y Condiciones de Uso y los Criterios de Publicación expresamente incorporados, constituyen el contrato entre KAZAWEB, S.L.U. y el profesional. La persona que acepta estas Condiciones declara que es mayor de edad, que dispone de capacidad legal suficiente y que cuenta con poder o autorización vigente para obligar al profesional en cuyo nombre actúa. KAZAWEB, S.L.U. podrá solicitar documentación que acredite dicha representación.

La solicitud de acceso constituye una solicitud de contratación y no obliga a KAZAWEB, S.L.U. hasta que esta comunique la aprobación y activación de la cuenta profesional. La comunicación de activación perfeccionará el contrato, salvo que la ficha u orden del plan establezca expresamente otro momento. En caso de contradicción, prevalecerán, por este orden: (i) la ficha u orden particular del plan; (ii) estas Condiciones para Profesionales; (iii) los Términos y Condiciones de Uso; y (iv) los Criterios de Publicación.

**Contratación electrónica**

El procedimiento de contratación comprende: solicitud de valoración por el profesional, revisión por Black Label Market, llamada de admisión en la que se acuerdan el plan y las condiciones económicas aplicables, aceptación de los documentos contractuales y comunicación de activación. Antes de enviar la aceptación, el profesional podrá solicitar aclaraciones o corregir los datos facilitados.

El contrato se formaliza en castellano. KAZAWEB, S.L.U. archivará la versión aceptada y remitirá al profesional una confirmación en soporte duradero que incluirá la versión de las Condiciones y la información económica del plan. El profesional podrá solicitar posteriormente una copia escribiendo a hola@blacklabelmarket.es.

**Titular de la plataforma**

Black Label Market es gestionado por KAZAWEB, S.L.U., con NIF B42761254 y domicilio fiscal en Lugar Rebordelo nº 35, Planta 2, 15930 Boiro, A Coruña.

**Acceso profesional**

El acceso profesional a Black Label Market no es automático. La plataforma podrá revisar cada solicitud de alta antes de activar una cuenta profesional o permitir la publicación de vehículos.

Black Label Market podrá valorar, entre otros aspectos, la identidad profesional del solicitante, su actividad, reputación, tipo de stock, calidad de presentación, ubicación, especialización y adecuación al posicionamiento de la plataforma.

Black Label Market podrá aceptar, rechazar o solicitar información adicional sobre una solicitud de acceso profesional cuando sea necesario para verificar la actividad, prevenir fraude, mantener la calidad del marketplace o cumplir obligaciones legales o contractuales.

**Verificación de profesionales**

Antes de permitir la publicación, Black Label Market podrá solicitar y verificar la razón social, domicilio, teléfono, email, identificación fiscal, datos del Registro Mercantil o registro equivalente, identidad y poderes del representante y demás documentación razonablemente necesaria para acreditar la actividad profesional y prevenir fraude.

El profesional deberá mantener la información actualizada y comunicar sin demora cualquier cambio. La falta de entrega, inexactitud o falta de actualización podrá dar lugar a la suspensión hasta su subsanación. El profesional certifica que ofrecerá exclusivamente vehículos y servicios conformes con el Derecho aplicable.

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

**Vehículos y contenidos prohibidos**

No podrán publicarse vehículos robados, apropiados sin autorización, sujetos a embargo o reserva de dominio no declarada, con número de bastidor manipulado, documentación falsa, origen ilícito, características cuya comercialización esté prohibida o que no puedan venderse legalmente en España.

Tampoco podrán publicarse anuncios engañosos, ofertas señuelo, precios falsos, fotografías de otra unidad, información que infrinja derechos de terceros o contenidos discriminatorios, violentos, fraudulentos o contrarios a la normativa aplicable.

Las cargas, limitaciones administrativas, daños estructurales, siniestros relevantes, modificaciones no homologadas y cualquier circunstancia que afecte a la seguridad, documentación, valor o posibilidad de transmisión deberán declararse de forma clara.

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
**Acceso y utilización de datos**

KAZAWEB, S.L.U. accede a los datos identificativos y contractuales del profesional, los anuncios y contenidos publicados, los contactos generados, las métricas de visualización e interacción, los datos técnicos y de seguridad y la información necesaria para facturación, soporte, prevención del fraude y mejora del servicio.

Durante la vigencia del contrato, el profesional podrá acceder desde su panel a los datos de su perfil, inventario, contactos recibidos y métricas que el plan contratado ponga a su disposición. No tendrá acceso a datos identificativos, inventario privado o métricas individuales de otros profesionales.

Los datos podrán facilitarse a proveedores tecnológicos que actúen como encargados del tratamiento y a autoridades cuando exista obligación legal. No se facilitarán a terceros para fines propios incompatibles con la solicitud del usuario sin una base jurídica válida.

Tras finalizar el contrato, el profesional podrá solicitar una copia de los datos y contenidos de su cuenta en un formato de uso común escribiendo a hola@blacklabelmarket.es. // TODO LEGAL — decisión pendiente de H: validar y construir el mecanismo operativo de exportación en 30 días antes de afirmar este plazo como funcional.

**Planes, facturación y renovación**

Los servicios incluidos, límites, precio, periodicidad de facturación y fecha de inicio son los acordados con el profesional durante el proceso de admisión —incluida la llamada previa a la activación— y constarán en la confirmación de contratación remitida antes de efectuar cualquier cobro. Los precios dirigidos a profesionales se expresan sin IVA, que se añadirá al tipo legal aplicable.

Salvo indicación expresa en la orden del plan, la cuota se factura por anticipado al comienzo de cada período. El pago se gestiona mediante Stripe y está sujeto a los medios de pago disponibles en su interfaz.

La suscripción se renovará automáticamente por períodos de igual duración al inicialmente contratado hasta que el profesional solicite su cancelación. La cancelación podrá solicitarse en cualquier momento desde el portal de facturación o escribiendo a hola@blacklabelmarket.es y surtirá efecto al finalizar el período ya pagado. No se cobrarán períodos posteriores.

Salvo error de facturación, incumplimiento imputable a KAZAWEB, S.L.U. o norma imperativa aplicable, la cancelación no genera devolución proporcional del período ya iniciado. Hasta su vencimiento, el profesional conservará el acceso a los servicios contratados.

Al finalizar la suscripción, el perfil dejará de ser público y el inventario quedará archivado, no eliminado. La reactivación posterior estará sujeta a la disponibilidad y condiciones comerciales vigentes.

Si se produce un impago, KAZAWEB, S.L.U. notificará la incidencia y concederá un plazo razonable para subsanarla antes de suspender el servicio, salvo fraude, riesgo de seguridad o reiteración. El profesional seguirá obligado al pago de los importes vencidos.

Los cambios de precio se comunicarán en soporte duradero con al menos treinta días de antelación. El profesional podrá cancelar sin penalización antes de su entrada en vigor.

**Criterios de publicación**

La publicación de vehículos está sujeta a los criterios de publicación vigentes en Black Label Market.

Black Label Market podrá modificar sus criterios de publicación para mantener la calidad, coherencia y posicionamiento de la plataforma.

El cumplimiento de los criterios mínimos no garantiza necesariamente la publicación o mantenimiento de un vehículo si Black Label Market considera que no encaja con el perfil del marketplace.

**Propiedad intelectual e imágenes**

El profesional garantiza que dispone de derechos, licencias o autorización suficiente para publicar las imágenes, textos, logotipos, marcas, información comercial y demás contenidos que aporte a la plataforma, incluido cuando dichos contenidos hayan sido producidos por un tercero (fotógrafo, agencia, fabricante u otro proveedor). En ese caso, el profesional declara haber obtenido de ese tercero la autorización necesaria para cederlos a Black Label Market en los términos de esta cláusula antes de publicarlos.

Al facilitar contenidos a Black Label Market, el profesional autoriza su uso, reproducción, adaptación y publicación en: el sitio web y aplicaciones de la plataforma, los perfiles oficiales de Black Label Market en redes sociales, las comunicaciones por email a compradores registrados, y los materiales publicitarios —incluida publicidad de pago— que promocionen el vehículo, el showroom o la plataforma. La adaptación autorizada incluye recorte, reencuadre, aplicación de marcos, marcas de agua o elementos de identidad visual editorial, y ajustes técnicos de color o exposición necesarios para mantener el estándar visual de la plataforma; en ningún caso incluye alterar el vehículo representado ni presentar características que no correspondan a la unidad real.

Esta autorización es aplicable a todo contenido aportado por el profesional, incluido el aportado antes de la aceptación de la versión vigente de estas Condiciones; el uso continuado de la plataforma tras cada actualización implica su aceptación también para el contenido ya publicado.

La autorización de uso en materiales publicitarios y de captación activos (redes, email, publicidad de pago) se mantiene mientras el vehículo permanezca publicado como disponible o exista relación profesional activa. Cuando la unidad se venda, se retire o la relación finalice, Black Label Market suspenderá su uso en materiales publicitarios y de captación activos, pero podrá conservar el contenido ya publicado con carácter editorial o de archivo (por ejemplo, una pieza ya publicada sobre una unidad concreta) salvo solicitud expresa de retirada por parte del profesional, que se atenderá en un plazo razonable.

El profesional responderá frente a cualquier reclamación de terceros derivada del uso de contenidos aportados por él, incluida la falta de autorización de terceros productores del contenido.

**Restricción, suspensión y terminación**

Black Label Market podrá restringir, suspender, limitar o cancelar anuncios, funcionalidades o una cuenta profesional cuando detecte:

- Información falsa, incompleta o engañosa.
- Publicación de vehículos no disponibles o no autorizados.
- Incumplimiento de criterios de publicación.
- Falta de respuesta reiterada a solicitudes.
- Uso indebido de datos de usuarios.
- Impagos.
- Reclamaciones graves o reiteradas.
- Conductas contrarias a la buena fe, a estas Condiciones o a la normativa aplicable.
- Riesgos para usuarios, terceros o para la reputación de la plataforma.

Antes o en el momento de aplicar la medida, KAZAWEB, S.L.U. remitirá al profesional, en soporte duradero, una motivación que identifique los hechos concretos, la cláusula contractual o norma aplicable, el alcance y duración de la medida, si se emplearon medios automatizados y las vías de reclamación disponibles.

Cuando KAZAWEB, S.L.U. decida terminar por completo la relación contractual, lo comunicará con al menos treinta días de antelación y expresará los motivos en soporte duradero. El preaviso de treinta días no se aplicará cuando una obligación legal exija la terminación inmediata, exista una razón imperiosa reconocida por el Derecho aplicable o el profesional haya infringido reiteradamente estas Condiciones. En dichos casos, la motivación se comunicará sin dilación indebida, salvo prohibición legal.

El profesional podrá presentar alegaciones y solicitar revisión humana escribiendo a hola@blacklabelmarket.es. Las reclamaciones se tramitarán gratuitamente, de forma diligente, objetiva, proporcional y no discriminatoria. Si la decisión se revoca, KAZAWEB, S.L.U. restablecerá sin demora el servicio y el acceso a los datos afectados.

El profesional podrá terminar la relación contractual mediante la cancelación de su suscripción. La finalización no afectará a las obligaciones de pago vencidas, responsabilidades previas, deberes de confidencialidad ni derechos que por su naturaleza deban subsistir.

**Limitación de responsabilidad**

Black Label Market no será responsable de incumplimientos del profesional frente a compradores, usuarios, autoridades o terceros.

El profesional mantendrá indemne a Black Label Market frente a reclamaciones, daños, sanciones, costes o responsabilidades derivados de la información publicada, la comercialización de vehículos, el uso de datos personales, el incumplimiento de garantías, la falta de disponibilidad, defectos ocultos, documentación irregular o cualquier incumplimiento legal o contractual imputable al profesional.

**Aceptación**

El acceso profesional a Black Label Market requiere la aceptación expresa de estas Condiciones (mediante casilla de confirmación en el alta, o en el primer acceso al panel profesional si el alta se gestionó de otra forma). Se conserva un registro de la versión aceptada y la fecha de aceptación.

**Modificación de estas Condiciones**

KAZAWEB, S.L.U. notificará en soporte duradero cualquier modificación propuesta de estas Condiciones. La modificación no se aplicará antes de que transcurra un plazo mínimo de quince días desde la notificación. Se concederá un plazo superior cuando el cambio exija al profesional realizar ajustes técnicos o comerciales significativos.

El profesional podrá resolver el contrato antes de que finalice el plazo de notificación. La resolución surtirá efecto dentro de los quince días siguientes a su recepción, salvo que se acuerde un plazo inferior. El profesional podrá renunciar al plazo mediante declaración escrita o acción afirmativa inequívoca posterior a la notificación.

No se aplicarán cambios retroactivos, salvo que sean exigidos por una norma o resulten beneficiosos para los profesionales. El plazo anterior no será exigible cuando KAZAWEB, S.L.U. deba realizar el cambio para cumplir una obligación legal que impida respetarlo o para responder de forma excepcional a un peligro imprevisto e inminente relacionado con fraude, malware, spam, seguridad de los datos o ciberseguridad.

La versión vigente será la publicada en la plataforma en cada momento.

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
          Última actualización: {LAST_UPDATED}
        </p>
      </div>

      <div className="bg-surface border border-bsm-border p-8">
        {renderContent(page.content)}
      </div>

      {slug === 'criterios-publicacion' && (
        <div className="mt-8 space-y-4">
          {/* Primary CTA */}
          <div className="border border-gold/30 bg-surface p-8">
            <p className="font-display text-xl font-light text-bsm-text-primary mb-2">
              Tu stock más exclusivo, donde merece estar.
            </p>
            <p className="text-sm text-bsm-text-secondary leading-relaxed mb-6 max-w-xl">
              Si trabajas con vehículos premium, deportivos, clásicos o especiales y crees que tu selección encaja con Black Label Market, solicita acceso profesional. Cada solicitud se revisa de forma individual.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/profesionales/solicitar-acceso" className="btn-gold px-6 whitespace-nowrap">
                Solicitar valoración
              </Link>
              <Link href="/para-profesionales" className="btn-outline px-6 whitespace-nowrap">
                Ver qué incluye →
              </Link>
            </div>
          </div>

          {/* Secondary nudge */}
          <div className="border border-bsm-border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gold tracking-widest uppercase mb-1">¿Tienes dudas?</p>
              <p className="text-sm text-bsm-text-secondary">
                Escríbenos antes de solicitar. Te decimos si tu perfil encaja.
              </p>
            </div>
            <Link
              href="mailto:hola@blacklabelmarket.es"
              className="text-sm text-gold hover:text-gold-light transition-colors whitespace-nowrap flex-shrink-0"
            >
              hola@blacklabelmarket.es →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
