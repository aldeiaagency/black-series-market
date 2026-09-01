# Datos legales pendientes — Black Label Market

Empresa titular: KAZAWEB, S.L.U. (NIF: B42761254)

---

## Datos pendientes de definir

> **Revisado 2026-09-01 contra el código real** (`app/(public)/legal/[slug]/page.tsx`, `components/legal/`).
> Varias filas de esta tabla ya estaban resueltas y seguían marcadas PENDIENTE — corregido abajo. El resto
> no tiene evidencia directa en código y se mantiene como estaba.

| Dato | Estado | Nota |
|---|---|---|
| Dominio definitivo | **RESUELTO** | `blacklabelmarket.es`, citado literalmente en el aviso legal |
| Email legal | **RESUELTO** | `hola@blacklabelmarket.es` |
| Email privacidad / RGPD | **RESUELTO** | `privacidad@blacklabelmarket.es` |
| Email de contacto | **RESUELTO** | `hola@blacklabelmarket.es` |
| Email marketing | **RESUELTO** | Brevo, sender `hola@blacklabelmarket.es` (ver `reference_black_series_market_credentials` en memoria del CEO) |
| Banner de cookies | **RESUELTO** | `components/legal/CookieConsentBanner.tsx` + `ConsentManagedGtm.tsx` (carga GTM condicionada al consentimiento) |
| Analytics | **RESUELTO** | GTM cargado vía `gtm_id` (dinámico, no env var) detrás de `ConsentManagedGtm.tsx` |
| Herramienta de formularios | PENDIENTE | `[PENDIENTE_HERRAMIENTA_FORMULARIOS]` — sin evidencia de resolución en código |
| CRM / webhook | PENDIENTE | `[PENDIENTE_CRM]` — sin evidencia de resolución en código |
| Pixel de publicidad | PENDIENTE | `[PENDIENTE_PIXEL]` — sin evidencia de resolución en código |
| Datos técnicos de navegación | PENDIENTE | `[PENDIENTE_DEFINIR_ANALYTICS_COOKIES]` — sin evidencia de resolución en código |
| Jurisdicción específica | **Decisión ya tomada, no pendiente** | El aviso legal usa cláusula genérica ("juzgados y tribunales que resulten competentes conforme a la normativa aplicable"), sin fijar ciudad concreta — es una elección de redacción válida, no un dato que falte. Contradecía la fila "Jurisdicción: España" de la tabla de abajo; corregido |
| Revisión legal profesional | PENDIENTE | Sigue sin validación por abogado — ver sección de revisión preparatoria más abajo |
| Política de cookies definitiva | **RESUELTO en lo técnico** | `/legal/cookies` + banner de consentimiento ya implementados |

---

## Datos ya definidos

| Dato | Valor |
|---|---|
| Razón social | KAZAWEB, S.L.U. |
| NIF | B42761254 |
| Domicilio fiscal | Lugar Rebordelo nº 35, Planta 2, 15930 Boiro, A Coruña |
| Actividad AEAT | Epígrafe IAE 631 — Intermediarios del comercio |
| Fecha alta de actividad | 18/01/2021 |
| Nombre comercial | Black Label Market |
| Marca matriz | Black Series |
| Jurisdicción | España |
| Pasarela de pago | Stripe |

---

## Estado de páginas legales

| Página | Ruta | Estado |
|---|---|---|
| Aviso legal | `/legal/aviso-legal` | Creado — pendientes marcados |
| Política de privacidad | `/legal/privacidad` | Creada — pendientes marcados |
| Política de cookies | `/legal/cookies` | Creada — pendiente configuración técnica |
| Términos de uso | `/legal/terminos` | Creados |
| Criterios de publicación | `/legal/criterios-publicacion` | Creado |

---

## Microcopy legal implementado

| Ubicación | Texto | Estado |
|---|---|---|
| Ficha de vehículo — disclaimer inferior | "Información proporcionada por el vendedor profesional..." | Implementado |
| Formulario de solicitud (QualifiedLeadForm) — pie | "Tu solicitud se enviará al vendedor profesional..." | Implementado |
| Formulario de solicitud — estado éxito | "Tu solicitud se enviará al vendedor profesional..." | Implementado |
| Búsqueda privada (PrivateSearchForm) — pie | "La búsqueda privada registra tu interés..." | Implementado |
| Registro profesional — paso 2 | "El envío de esta solicitud no implica aceptación automática..." | Implementado |

---

## Acciones requeridas antes de publicación pública

1. ~~Definir y registrar el dominio definitivo~~ — hecho (`blacklabelmarket.es`)
2. ~~Activar y verificar buzones de email (legal, privacidad, contacto)~~ — hecho
3. ~~Configurar SPF, DKIM y DMARC para el dominio~~ — hecho (ver `reference_hostinger_api` en memoria del CEO)
4. Definir herramientas de formularios y CRM — reemplazar placeholders (sigue pendiente)
5. ~~Configurar analytics si procede — actualizar política de cookies~~ — hecho (GTM + banner de consentimiento)
6. ~~Implementar banner de consentimiento de cookies si se activan cookies no técnicas~~ — hecho
7. Revisar toda la documentación legal con asesor especializado en RGPD y LSSI (sigue pendiente)
8. Reemplazar los `[PENDIENTE_HERRAMIENTA_FORMULARIOS]` / `[PENDIENTE_CRM]` / `[PENDIENTE_PIXEL]` restantes con datos reales antes del lanzamiento público
9. Actualizar `NEXT_PUBLIC_SITE_URL` en Vercel con el dominio definitivo (verificar que sigue apuntando al apex)

---

## Revisión preparatoria — alta de profesionales (borrador para validación por abogado)

**Fecha:** 2026-07-20. **Estado: BORRADOR — investigación de apoyo hecha por Claude Code, pendiente de validación por un abogado especializado en RGPD/LSSI/DSA antes de darla por buena.** No sustituye asesoramiento legal profesional; es el trabajo preparatorio para que el abogado no empiece de cero.

### 1. Mecanismo de aceptación: pasar de browsewrap a clickwrap

**Hallazgo:** hoy `condiciones-profesionales` es un documento publicado sin checkbox de aceptación ni registro de quién aceptó qué versión y cuándo (browsewrap).

**Base legal:** la reforma que la Ley 34/2002 (LSSI-CE) hizo sobre el art. 1262 del Código Civil y el art. 54 del Código de Comercio establece que el acto de "clicar" constituye manifestación de consentimiento necesaria y suficiente para un contrato de adhesión con condiciones generales. Los acuerdos browsewrap (aceptación implícita por el mero uso) tienen, según la doctrina revisada, "mayores dudas sobre su validez". ([E&J — click-wrap y browse-wrap en Derecho español](https://www.economistjurist.es/articulos-juridicos-destacados/la-ejecucion-de-los-contratos-click-wrap-y-browse-wrap-en-derecho-espanol/))

**Práctica del sector:** marketplaces B2B españoles reales (Correos Market, Wadios, ConsolidaTMx) formalizan la relación con el vendedor profesional mediante aceptación explícita de condiciones generales, no solo publicación.

**Recomendación preparatoria:** checkbox obligatorio en el alta + registro persistente de versión del documento aceptada, fecha y hora. Implementación técnica: ver más abajo, ya ejecutada en este mismo paso.

### 2. DSA art. 30 (Reglamento UE 2022/2065) — trazabilidad de comerciantes (KYBC)

`condiciones-profesionales` ya cita el art. 30 y recopila: nombre/razón social, dirección postal, NIF/CIF, email y teléfono. El artículo exige además, y **hoy no está explícito ni en el texto ni en el proceso de alta**:

- Copia de documento de identidad u otra identificación electrónica del representante del profesional.
- Extracto o número del registro mercantil (o registro público equivalente), cuando aplique.
- **Autocertificación** del profesional comprometiéndose a ofrecer únicamente productos/servicios conformes con el derecho de la UE.
- Además, el art. 30 exige **mostrar a los compradores** (no solo recopilar internamente) los datos de contacto del profesional, el extracto del registro mercantil y esa autocertificación — esto es un requisito de cara al **perfil público del showroom**, no solo del alta, y no he verificado si ya está implementado en las fichas públicas (queda como tarea aparte, no resuelta en este cambio).

Fuente: análisis del art. 30 DSA y guía de Adigital/Observatorio de Comercio Electrónico para marketplaces; el propio Reglamento (UE) 2022/2065.

**Recomendación preparatoria:** añadir cláusula de autocertificación al texto (borrador incluido en el cambio de este mismo paso) y decidir con el abogado si la revisión manual actual del admin al aprobar una alta constituye "esfuerzo razonable de verificación" suficiente bajo el art. 30, o si hace falta pedir copia de documento/registro mercantil de forma más formal.

### 3. RGPD — naturaleza de la relación respecto a los datos de leads (comprador → profesional)

**Marco usado:** criterio jurídico de la AEPD (2026, "Delimitación funcional entre responsable y encargado del tratamiento en ecosistemas logísticos y tecnológicos complejos") — el análisis es **funcional**, "finalidad por finalidad y, dentro de cada una, operación por operación"; no depende de lo que diga el contrato, sino de quién determina realmente los fines y medios de cada operación concreta. ([AEPD — criterio jurídico](https://www.aepd.es/informes-y-resoluciones/criterios-juridicos-aepd/delimitacion-funcional-entre-responsable-y-encargado-tratamiento-ecosistemas-logisticos-y-tecnologicos))

**Análisis aplicado:**
- Operación "captar la solicitud del comprador": Black Label Market decide fines y medios (formulario, campos, almacenamiento) → responsable de esa operación.
- Operación "qué hace el profesional con el contacto una vez recibido" (su propio seguimiento comercial): el profesional decide sus propios fines y medios — no actúa "por cuenta y bajo instrucciones" del market, tiene fin propio (cerrar una venta) → esto no encaja como encargo de tratamiento (art. 28 RGPD).
- **Conclusión preliminar:** la relación se parece más a **responsables independientes** con una comunicación/cesión de datos a terceros entre ellos (art. 6.1 RGPD), no a un encargo de tratamiento ni a responsables conjuntos (art. 26).
- **Ya existe la base de legitimación para esa comunicación:** la Política de Privacidad actual ya dice *"Cuando el usuario solicita información sobre un vehículo, Black Label Market podrá comunicar los datos necesarios al vendedor profesional responsable de dicha unidad para que pueda responder a la solicitud"* (`app/(public)/legal/[slug]/page.tsx:172`) — el comprador ya está informado de la cesión antes de que ocurra.

**Aviso:** esta clasificación (responsables independientes, no encargo) es razonable con la información disponible, pero depende de detalles operativos que solo el abogado puede confirmar del todo — por ejemplo, si el market retiene o reutiliza el dato del lead más allá de transferirlo, o si en algún momento se dan instrucciones concretas al profesional sobre CÓMO tratar esos datos (más allá de "cumple la ley"), lo que cambiaría el análisis. **No dar esto por definitivo sin que el abogado lo confirme.**

### 4. Cambios de contenido propuestos para `condiciones-profesionales` (borrador, no texto final)

- Cláusula de autocertificación DSA (ver punto 2).
- Referencia a la casilla de aceptación y al registro de versión/fecha (ver punto 1) — coherencia entre el texto legal y el mecanismo técnico.

Aplicado como borrador en el propio fichero de condiciones — **pendiente de que el abogado revise la redacción exacta antes de considerarla definitiva.**

---

Última actualización: 2026-09-01 (revisión de duplicados/incoherencias — tabla de datos pendientes y lista de
acciones reconciliadas contra el código real; sección de revisión preparatoria de 2026-07-20 sin tocar, sigue
vigente y pendiente de abogado).
