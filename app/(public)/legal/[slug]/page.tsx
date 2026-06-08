import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

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

privacidad@blacklabelmarket.es

La solicitud deberá indicar el derecho que se desea ejercer y permitir identificar razonablemente al solicitante.

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

La publicación de vehículos en Black Label Market está sujeta a criterios de calidad y criterios comerciales. Cada solicitud de publicación es revisada por el equipo antes de activarse.

**Criterio general**

Black Label Market no funciona como un clasificado abierto. La publicación de vehículos se revisa caso por caso para mantener una selección coherente con el posicionamiento premium, deportivo, clásico o especial de la plataforma.

No existe un único criterio automático por precio, kilometraje o antigüedad. Estos factores se tienen en cuenta, pero siempre dentro del contexto de cada unidad.

**Qué valoramos en un coche o moto**

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

- Vendedor profesional identificado y aprobado por Black Label Market.
- Vehículo real y disponible.
- Fotografías reales de la unidad concreta, no de archivo ni de otra unidad.
- Información técnica completa y verificable.
- Estado declarado con honestidad.
- Ubicación clara.
- Precio indicado o condición de consulta clara.
- Garantía o condiciones de venta indicadas cuando aplique.
- Ausencia de incidencias relevantes ocultas.

**Motivos habituales de rechazo**

- Información incompleta, inexacta o engañosa.
- Fotografías de archivo o de otra unidad.
- Vehículo no disponible.
- Estado, kilometraje, historial o documentación con dudas relevantes.
- Precio sin coherencia con la unidad.
- Daños o incidencias importantes no declarados.
- Vendedor no profesional o no aprobado.
- Unidad sin encaje suficiente con el perfil de Black Label Market.

**Derecho de publicación**

Black Label Market se reserva el derecho de aceptar, rechazar, editar, pausar o retirar publicaciones conforme a sus criterios de calidad y criterios comerciales, sin necesidad de justificación adicional.

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
