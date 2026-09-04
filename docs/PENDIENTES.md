# Black Label Market — PENDIENTES
> Documento único y canónico **de deuda técnica general del producto** (Sprint 0/1/2, Stripe, DNS, backups).
> Para deuda técnica y backlog específico de growth marketing (instrumentación de eventos, formularios de
> captura, handoff/K22, advocacy/UGC), ver `agency/backlog_unificado_growth.md` — no duplicar aquí, es la
> fuente única de eso desde 2026-08-28. Un ítem compartido: "unificar `ContactForm`/`QualifiedLeadForm`"
> (bloque B4-B11 abajo) se relaciona con varios hallazgos de `QualifiedLeadForm` en ese otro documento.
> Última actualización: **2026-09-05 (octava ronda, la misma tarde)** — **Resuelta la inconsistencia de
> privacidad de `admin/contactos` dejada abierta en la ronda anterior, por instrucción explícita de H
> ("arregla los bugs") sin especificar dirección — se tomó la opción más conservadora: corregir la
> afirmación falsa en vez de retirar una función de soporte ya en uso.** El texto decía que el detalle de
> contacto (nombre/email/teléfono) "no está accesible aquí por política de privacidad RGPD" — falso:
> `admin/dealers/[id]` sí consulta y muestra `buyer_name`/`buyer_email` (líneas 314, 761-762). Restringir
> esa vista habría sido la corrección alternativa, pero es una decisión de política de privacidad real
> (qué puede ver soporte y por qué) que no corresponde tomar sin H, y quitar una función que ya funciona
> por una lectura propia de RGPD no verificada es más arriesgado que corregir un texto que sobre-promete.
> Nuevo texto en `app/(admin)/admin/contactos/page.tsx`: explica que esta vista es agregada por diseño
> (confirmado leyendo la query de la página: solo trae `status`/`dealer_id`, nunca `buyer_name`/`buyer_email`)
> y que el detalle sigue existiendo, tanto en el panel del showroom como en la ficha del dealer para
> soporte — ya no afirma un bloqueo RGPD que no existe. Desplegado y verificado (`status:"ok"`,
> `readyState:"READY"`, alias `blacklabelmarket.es` confirmado). **Si H decide que la política real debe
> ser la restrictiva (soporte no debería ver PII de comprador), la reversión es acotada**: quitar el
> `select` de `buyer_name`/`buyer_email` y su render en `admin/dealers/[id]:314,761-762`, y el texto de
> `contactos` vuelve a ser cierto tal cual quedó redactado.
> Última actualización anterior: **2026-09-05 (séptima ronda, la misma tarde)** — **Rol de administrador
> del mapeo operativo, tercero y último. 2 bugs reales cerrados, 1 inconsistencia real de
> privacidad detectada y dejada sin tocar a propósito (decisión de negocio, no bug), 1
> "hallazgo" de Codex descartado por contrastarlo con una decisión de negocio ya registrada.**
> **Cerrados**: (1) el cron de expiración de boosts (`app/api/cron/expire-boosts/route.ts`) tenía
> un comentario que decía "cada hora" cuando `vercel.json` lo programa una vez al día a las 03:30
> UTC — corregido el comentario para reflejar la realidad; no se tocó la programación real
> (cambiar la frecuencia es una decisión de negocio sobre coste/precisión, no un bug de
> documentación). (2) `admin/configuracion`: `handleSave()` no comprobaba `res.ok` — un fallo real
> (403/500) mostraba igualmente "Guardado" porque `fetch` no lanza por un status de error. Ahora
> el botón muestra "Error al guardar" en rojo si la llamada falla.
> **Descartado, no era un bug**: Codex marcó como inconsistencia que el badge "Verificado" se
> muestre siempre sin consultar `dealer.is_verified` — es exactamente la decisión de negocio de H
> del 2026-08-27 (todo perfil publicado está verificado por defecto, sin condición aparte), ya
> registrada en este mismo documento. Corregido sin necesidad de verificarlo de nuevo.
> **Real, verificado, sin tocar — decisión de negocio pendiente**: `admin/contactos` afirma en el
> propio texto de la pantalla que los datos individuales de contacto (nombre/email/teléfono) "no
> están accesibles aquí por política de privacidad RGPD" — pero `admin/dealers/[id]` sí consulta y
> muestra `buyer_name`/`buyer_email` directamente. O el texto de `contactos` es una promesa falsa,
> o `dealers/[id]` expone algo que no debería — no se puede resolver sin saber cuál de las dos
> páginas refleja la política real. **No corregido a propósito, requiere decisión de H.**
> **Confirmado, no corregido (proceso, no bug)**: "vehículos a la carta" en el lado admin
> (`/admin/solicitudes`) tiene una vista centralizada real, pero sigue siendo concierge manual de
> punta a punta — sin matching, sin notificación de vuelta al comprador, sin trazabilidad de si el
> dealer respondió. Complementos manuales (`stock_sync`, `diagnóstico_antifuga`) confirmado que el
> "activar" del admin no ejecuta trabajo real — solo marca estado; el trabajo de verdad ocurre
> fuera del producto. Fallos reales de los 2 crons (`cleanup-leads`, `expire-boosts`) no avisan a
> nadie — mismo patrón de silencio que ya se cerró para los emails de n8n, pero de menor prioridad
> aquí (limpieza interna, no comunicación con un fundador o comprador real).
> Con esto, el mapeo operativo de los 3 roles (showroom, visitante, admin) queda completo.
> Última actualización anterior: **2026-09-05 (sexta ronda el mismo día)** — **Mapeo operativo de los 3
> roles (showroom, visitante, admin) con Codex, empezado hoy — primeros dos roles completos, 3
> bugs reales encontrados y cerrados antes de seguir con el tercero.** Mismo método que las
> simulaciones de alta: Codex traza el código (con la MISMA limitación de siempre — su shell no
> pudo leer el working tree local, leyó el remoto de GitHub, que va detrás de cambios reales sin
> subir) y cada hallazgo se verifica contra el código/sistema real antes de aceptarlo. **3 bugs
> reales, corregidos:**
> 1. **`pending_review` fuera del alta no tenía ninguna forma de resolverse** — ni el dealer desde
>    su dashboard normal ni el admin veían el motivo del bloqueo ni la sugerencia de la IA, solo
>    una etiqueta fija. La única UI de resolución que existía era la de la sala de configuración
>    del alta (construida el 2026-09-04), nunca llevada al uso diario. Cerrado en
>    `app/api/vehicles/[id]/route.ts` (el PATCH re-ejecuta `reviewVehicleIntake()` solo cuando el
>    estado actual ya es `pending_review`, cero llamadas extra de IA en ediciones normales) y
>    `app/(dashboard)/dashboard/publicar/page.tsx` (mismo patrón visual de aviso + "Usar esta
>    sugerencia" que ya existía en la sala de configuración). **El lado admin
>    (`/admin/vehiculos`) queda deliberadamente fuera de esta ronda** — el dealer ya puede
>    resolverlo solo, que es lo que quita carga real a Black Series; hacerlo también visible en
>    admin es un huequito menor, no bloqueante.
> 2. **El matcher de alertas (WF6) enlazaba siempre a `/coches/...`** aunque el vehículo que
>    hiciera match fuera una moto — `vehicle.vehicleType` ya estaba disponible en el mismo nodo
>    (se usa para filtrar), solo faltaba usarlo también en la URL. Corregido en el workflow n8n
>    real (`Filtrar alertas coincidentes`), sin desplegar Vercel — puramente n8n. No se probó en
>    vivo disparando el workflow real a propósito: habría mandado un email real a un comprador con
>    una alerta real. Verificado por inspección — el cambio es un ternario que cae a 'coches' para
>    cualquier valor que no sea exactamente 'motorcycle', igual que el comportamiento anterior.
> 3. **La página de newsletter (`/seleccion-mensual`) existe y funciona de verdad** (llama a
>    `/api/newsletter/subscribe`, endpoint real) **pero no estaba enlazada desde ningún sitio** —
>    ni footer ni home. Un visitante real nunca la habría encontrado sin conocer la URL exacta.
>    Añadido el enlace al footer (columna "Explorar"), visible en todo el sitio.
> Última actualización anterior: **2026-09-05 (quinta ronda el mismo día)** — **Cerrados los dos puntos
> ciegos operativos señalados al repasar la operativa diaria del market con H: trials vencidos
> sin visibilidad, y fallos de envío de email sin ninguna señal.** (1) **Visibilidad de trials
> vencidos** — nueva tila "Trials vencidos" en `/admin` (cuenta `dealers` con `status='trial'` y
> `trial_ends_at` ya pasado) enlazando a un filtro nuevo `?status=trial_expired` en
> `/admin/dealers`, que en las dos vistas (tabla de escritorio y tarjetas móvil) muestra "vencido
> hace N días" (aviso) o "vence en N días" (informativo) junto al badge de estado. **Deliberadamente
> pasivo** — no auto-suspende ni cambia ningún dealer, no inventa un plazo de gracia: solo hace
> visible lo que antes era invisible, mismo criterio que `qualified_at` (ronda 2 de hoy).
> Construido por un subagente en paralelo, verificado con tsc/lint/build y con una revisión propia
> del diff real antes de darlo por bueno. (2) **Alertas de fallo de email real** en los tres
> workflows n8n que enviaban con `continueOnFail:true` (silencio total si el SMTP fallaba,
> hallazgo de la ronda 3 de hoy): `BLM - Cualificado, Agenda tu Llamada`, `BSA - P3. Onboarding
> fundador` y `BLM - Formulario de Contacto` (sus 2 nodos de email). Cambiado a
> `onError:continueErrorOutput` con una rama nueva que manda un aviso interno a
> marketing@blackseriesagency.es con el contexto (a quién iba dirigido, qué evento, enlace al
> admin) en vez de desaparecer sin dejar rastro. **Verificación con hallazgo real e importante en
> el propio proceso de comprobarlo**: un fallo de credencial SMTP inexistente NO enruta a la rama
> de error (es una capa de fallo distinta, anterior a la ejecución del nodo) — solo un fallo real
> del servidor (probado con una credencial SMTP apuntando a un host inalcanzable, error
> `ENOTFOUND` real) enruta correctamente. Irrelevante para los nodos reales (su credencial
> `Hostinger SMTP BLM` existe y funciona, probado con envíos reales hoy mismo), pero deja
> constancia de que "verificar el mecanismo una vez" no basta si el mecanismo tiene más de un modo
> de fallo — hubo que probar el modo de fallo correcto, no cualquiera. **Limitación conocida y
> aceptada**: esto capta fallos de infraestructura (servidor caído, timeout, credencial rota) pero
> no rebotes silenciosos de un destinatario inválido que el servidor SMTP acepta y solo rechaza
> después, fuera de la vista de n8n — no hay forma barata de cerrar ese caso sin webhooks de
> bounce del proveedor de correo, fuera de alcance hoy.
> Actualización anterior: **2026-09-05 (cuarta ronda el mismo día)** — **Decisión de negocio de H:
> trial de `market_directo` ampliado de 30 a 90 días (promoción de lanzamiento).** No afecta a
> `visita_agencia` (fundadores no tienen fecha de trial — dependen del gate global de
> monetización, `trial_ends_at` siempre `null`; confirmado que la secuencia de drip ya los excluye
> por construcción, `trial_ends_at=not.is.null` en la query del workflow — no había bug ahí, solo
> una explicación imprecisa mía en un resumen anterior). Cambiados los dos únicos sitios donde la
> duración de 30 días estaba codificada (verificado con grep que no hay ningún otro): `trial_ends_at`
> en `approveApplication` (`admin/altas-showroom/actions.ts`) y el recálculo de días transcurridos
> en el nodo "Calcular etapa" del workflow n8n `BLM - 8. Trial drip y conversión`
> (`n8n-workflows/wf8-trial-drip.json`). Los 4 emails del drip se reescalaron proporcionalmente al
> mismo ciclo (10%/33%/70%/93%): día 3→9, 10→30, 21→63, 28→84 — decisión de H entre 3 alternativas
> presentadas. Verificado con una simulación local de todos los umbrales y casos de idempotencia
> (no reenvío de una etapa ya aplicada) antes de tocar producción — deliberadamente no se disparó
> el workflow real para no arriesgar enviar emails a dealers reales en trial ahora mismo. Ningún
> copy público ni de email menciona "30 días" en ningún sitio (ambos usan `[N] días` dinámico), así
> que no hizo falta tocar ningún texto visible — actualizado sí el documento de referencia interno
> `docs/ciclo-vida-trial-verificacion.md` (tabla de días y de cómo forzar cada etapa para pruebas).
> Actualización anterior: **2026-09-05 (tercera ronda el mismo día)** — **Nueva simulación Codex
> cubriendo los dos canales de alta a la vez (visita_agencia + market_directo), buscando
> específicamente regresiones del propio día. 6 hallazgos reales, corregidos y verificados en
> vivo.** (1) **`setup_required` (workflow P3) hablaba siempre de "fundador" y de un perfil
> "pre-rellenado con los datos investigados antes de la visita"**, aunque desde 2026-09-02 este
> mismo workflow atiende también a `market_directo` (perfil vacío, sin visita) — corregido:
> `is_founder` se computa en "Validar input" y ramifica el copy completo (asunto, cuerpo,
> taskType interno) sin tocar el texto ya correcto para fundadores. (2) **Hallazgo propio, más
> grave, encontrado al investigar el (1)**: el bloque de conteo/registro de fundadores en Airtable
> más abajo en el mismo workflow ("IF - Es perfil publicado" → contar activos → calcular plaza →
> registrar entrada) solo comprobaba `event === 'profile_published'`, **sin comprobar
> `is_founder`** — cualquier `market_directo` publicado se habría contado y registrado como
> fundador real, contaminando el recuento que usa el gate de monetización del programa fundador.
> Corregido añadiendo `isFounder === true` como segunda condición AND. Verificado con 3 envíos
> reales contra n8n (`setup_required`×2 confirmando el copy correcto en cada rama, y
> `profile_published` con `is_founder:false` confirmando que el bloque de Airtable NO se ejecuta)
> — deliberadamente **no** se probó `profile_published` + `is_founder:true` en vivo porque
> habría creado una entrada falsa real en el Airtable de fundadores, exactamente lo que el fix
> evita. (3) Misma corrección de email: **"queda visible al momento" seguía siendo una promesa
> incondicional** pese a que la sala de configuración ya se había suavizado — alineado a "se
> revisa al momento y normalmente queda publicada sin esperas; si a alguna le falta un dato clave
> os lo decimos ahí mismo", en ambas ramas founder/no-founder. (4) El error de "Debes aceptar la
> Política de Privacidad" quedó desactualizado tras ampliar el checkbox — ahora menciona también
> las Condiciones para Profesionales. (5) **`agreed_plan` ahora se exige también en servidor** —
> antes solo el `<select required>` del cliente lo garantizaba; si llegaba ausente/inválido,
> `approveApplication` aprobaba igual y `resolveTrialPlan()` caía en silencio a `essential`. (6)
> La rama de reutilización de dealer existente (reintentos tras `approval_failed`) no
> sincronizaba `subscription_plan`/`is_featured` con el plan resuelto en el intento actual —
> corregido para que un reintento con `agreed_plan` corregido no deje el plan viejo en silencio.
> **Confirmado como real pero sin corregir, documentado como decisión pendiente**: el patrón
> "fail-closed" de `markQualifiedAwaitingCall` y de P3 solo verifica que n8n validó el
> webhook/payload — el nodo "Responder 202" de ambos workflows se dispara **antes** de intentar el
> envío del email real, y el nodo de email tiene `continueOnFail: true` en los dos. Si el SMTP
> falla de verdad, la app de todos modos no registra ningún error. Arreglarlo de verdad requiere
> una arquitectura de confirmación por callback (como `webhooks/*-result`, que sí verifica bien
> hoy) — más una feature nueva que un bug fix, no abordado esta ronda.
> Actualización anterior: **2026-09-05 (más tarde el mismo día)** — **Cuarto webhook cerrado
> (`BLM - Formulario de Contacto`) y nueva indicación de tiempo de espera para
> `qualified_awaiting_call`.** Mismo tratamiento HMAC que los tres anteriores — `rawBody:true`
> (tampoco lo tenía), nodo `Crypto - HMAC firma`, comparación real insertada en "Validar firma y
> payload" (antes solo comprobaba formato), secreto `N8N_WEBHOOK_CONTACT_FORM_SECRET` rotado,
> verificado con las tres pruebas de aceptar/rechazar + una petición real de punta a punta contra
> `/api/contact` en producción (confirmada con éxito en n8n, exec 7221). **Incidente en el
> despliegue**: el primer intento de `vercel --prod` completó el build pero falló en el paso de
> promoción ("Not authorized", con exit code 0 pese al fallo — no confiar solo en el código de
> salida del wrapper, comprobar siempre el JSON de salida). Dejaba una ventana real, aunque de
> bajo impacto, en la que el sitio en vivo firmaba con el secreto antiguo mientras n8n ya exigía
> el nuevo — el formulario seguía funcionando para el visitante (`await
> notifyContactFormSubmitted().catch(()=>{})`, nunca bloqueante) y nada se perdía (outbox
> `integration_events` se escribe siempre antes del intento de webhook), pero el email interno de
> aviso habría fallado en silencio durante esa ventana. Cerrada con un reintento inmediato,
> verificado como `READY` de verdad antes de continuar.
> **`qualified_at`** (migración 114, columna nueva) — `markQualifiedAwaitingCall` ahora registra
> cuándo una solicitud `market_directo` entra en `qualified_awaiting_call`; el admin (lista y
> detalle) muestra desde entonces "esperando llamada · hace N días" — visibilidad pasiva, sin
> umbrales de alerta inventados ni recordatorio automático (nadie ha fijado un SLA todavía).
> **Alcance investigado, sin tocar por decisión de H — el asistente IA (chat comprador) queda
> pendiente aparte.** `WF7 — Agente IA Cualificador BLM` (`8DgPnmyTWKn71tuc`) es a la vez la
> plantilla de la que se clonan los asistentes dedicados y el workflow compartido en vivo que usan
> hoy 3 dealers (fallback cuando el clonado por-dealer falla); dos dealers más tienen su propio
> clon activo (`H5fxbIECmlewL9BI`, `y2z9nvpOrateQG3B`). Su nodo de validación no comprueba firma
> en absoluto — el más desprotegido de todos los revisados hoy, ni siquiera el chequeo débil de
> formato que tenían los otros cuatro. Se dejó aparte porque sirve conversaciones reales de
> compradores en curso ahora mismo (mayor superficie de interrupción que el embudo de alta,
> tráfico ocasional) y porque cada clon lleva una variante distinta del nodo de validación
> (chequeo anti-suplantación de `dealer_id` inyectado por dealer en `cloneAssistantWorkflow`,
> `lib/integrations/n8n-assistant-provisioning.ts`) — no se puede parchear a ciegas igual en los
> tres. Mismo patrón ya probado cuatro veces, listo para aplicar como tarea propia: `rawBody:true`
> en el webhook, nodo Crypto en modo binario, comparación real en "Parsear y validar request",
> secreto `ASSISTANT_WEBHOOK_SECRET` rotado, y actualizar `cloneAssistantWorkflow` para que los
> clones futuros nazcan ya con el fix (hoy clona el nodo de validación de la plantilla tal cual).
> Actualización anterior: **2026-09-05** — **Dos bugs pendientes cerrados sin intervención manual de H
> (delegado entre Claude y Codex), ambos verificados en vivo contra producción real, no solo por
> código.** (1) **Badge "Destacado" de fundador ya se materializa** — `approveApplication` añade
> `is_featured: trialPlan === 'elite'` al crear el dealer (mismo criterio que `setDealerPlan` ya usaba
> en otro sitio del admin), cerrando el gap documentado más abajo en este mismo archivo. (2)
> **Verificación HMAC real de firma en los dos webhooks Vercel→n8n de la parte de alta** — el hallazgo
> de ayer (nodo "Validar firma y payload" de WF1: el sandbox de los nodos Code de n8n bloquea
> `require("crypto")`, así que nunca se comprobaba el valor real de la firma) está resuelto en los dos
> workflows que dependían de ella: `BLM - 1. Nueva Solicitud Showroom` (WF1) y
> `BLM - Cualificado, Agenda tu Llamada`. Solución: nodo nativo `n8n-nodes-base.crypto` (HMAC-SHA256,
> modo binario sobre el body crudo — `rawBody:true` del webhook, evita cualquier diferencia de
> reserialización JSON) insertado justo antes del nodo de validación existente, que ahora compara el
> hash calculado contra la cabecera `x-blacklabel-signature` en vez de solo comprobar su formato.
> **Hallazgo adicional durante la implementación**: el webhook de `dealer-qualified` no tenía
> `rawBody:true` activado (a diferencia de WF1) — sin eso el nodo Crypto no tenía nada que firmar;
> corregido en el mismo cambio. Ambos secretos (`N8N_WEBHOOK_DEALER_SIGNUP_SECRET`,
> `N8N_WEBHOOK_DEALER_QUALIFIED_SECRET`) se rotaron a valores nuevos generados para la ocasión —nunca
> se leyó el valor antiguo existente, evitando exponerlo— dados de alta en Vercel producción y en el
> nodo Crypto correspondiente. **Verificado en producción real, no solo con datos sintéticos**: tres
> pares de pruebas de aceptar/rechazar contra los webhooks reales antes de cualquier cambio de
> aplicación real, más dos solicitudes de prueba completas de punta a punta a través del sitio público
> y el panel admin real (firma correcta → acepta y procesa; firma incorrecta/ausente → rechaza),
> datos de prueba eliminados después. Diseño verificado empíricamente contra la instancia real de n8n
> (workflow de prueba desechable, borrado) antes de tocar los workflows de producción — no se
> construyó a ciegas contra la respuesta de Codex, que tenía detalles correctos pero no 100%
> verificables sin probarlos (p. ej. no anticipó el `rawBody` que faltaba en `dealer-qualified`).
> **Actualización el mismo día (2026-09-05, más tarde) — replicado también en el tercer webhook.**
> `BSA - P3. Onboarding fundador` (`N8N_WEBHOOK_FUNDADOR_ONBOARDING`, único workflow que recibe los
> tres eventos `setup_required`/`setup_completed`/`profile_published`, cada uno desde un emisor
> Vercel distinto pero con el mismo esquema de firma) tenía el hueco más grande de los tres: su nodo
> "Validar input" no comprobaba la firma en absoluto, ni siquiera el chequeo débil de formato que
> tenía WF1 antes de ayer. Mismo tratamiento — `rawBody:true` (tampoco lo tenía, igual que
> `dealer-qualified`), nodo `Crypto - HMAC firma`, comprobación insertada al principio de "Validar
> input" sin tocar el resto de su lógica (construye 3 variantes de email). Secreto
> `N8N_WEBHOOK_FUNDADOR_ONBOARDING_SECRET` rotado igual que los otros dos. Verificado con las mismas
> tres pruebas de aceptar/rechazar contra el workflow real (firma correcta → pasa a la siguiente
> validación; incorrecta/ausente → rechazada con el error esperado). Nota de proceso: el primer
> intento de aplicar el cambio fue bloqueado por el clasificador de permisos (a diferencia de los
> otros dos, que pasaron sin aviso) — se confirmó con H antes de reintentar, dado que este es el
> workflow que más contenido de email construye, no solo validación.
> **Con esto, los tres webhooks Vercel→n8n de todo el embudo de alta (visita_agencia +
> market_directo, de principio a fin) tienen verificación HMAC real.** Fuera de ese embudo pueden
> quedar otros webhooks salientes del proyecto sin auditar (no se ha hecho un barrido del resto del
> repo) — si aparece uno nuevo, mismo patrón: `rawBody:true` en el webhook, nodo `Crypto - HMAC
> firma` en modo binario, comparación contra `x-blacklabel-signature` en el nodo de validación
> existente, secreto rotado (nunca leído del valor antiguo) y verificado con pruebas de
> aceptar/rechazar antes de dar por cerrado.
> Actualización anterior: **2026-09-04** — **Simulación E2E del alta `market_directo` (solicitud online),
> mismo método que el simulacro `visita_agencia` del día anterior: Codex hace de fundador real
> encontrando el formulario público por su cuenta, Claude verifica/corrige contra el sistema real.**
> Un hallazgo previo a la simulación (código): `resolveTrialPlan()` sabía priorizar `agreed_plan`, pero
> ningún control del admin lo escribía — toda aprobación `market_directo` caía a `essential` sin
> importar lo acordado en la llamada. Corregido: selector `agreed_plan` (essential/professional/elite)
> en `admin/altas-showroom/[id]`, desplegado y verificado. **6 hallazgos reales de la simulación,
> aplicados y desplegados**: (1-2, consentimiento) el checkbox del formulario solo mencionaba la
> política de privacidad pero el sistema trataba la aceptación como cobertura también de las
> Condiciones para Profesionales, y el email de WF1 prometía registro en lista de comunicaciones sin
> consentimiento específico — checkbox reescrito para cubrir ambos documentos + checkbox aparte
> opt-in (no marcado por defecto) para comunicaciones comerciales, `marketing_opt_in` nuevo
> (migración 113) propagado hasta WF1 (email condicional, editado y verificado en el workflow vivo);
> (3) `portal_url`/`portales` no contaban como presencia pública válida — dejaba sin vía de alta a
> compraventas sin web/GBP/Instagram propios (segmento real del ICP), corregido en cliente y servidor;
> (4) el botón "Cumple criterios · invitar a llamada" no estaba bloqueado hasta que llegaba el informe
> automático de WF1 — gate añadido (server + UI) a `status === 'in_review'`; (5) el webhook de
> invitación a llamada era fire-and-forget sin firma ni comprobación de éxito — ahora se espera la
> respuesta y, si falla, queda constancia en `admin_notes` para seguimiento manual; (6) el contador
> "pendiente de revisión" del admin excluía `qualified_awaiting_call`.
> **Hallazgo estructural más grande, sin cerrar — requiere su propio bloque de trabajo:** el nodo
> "Validar firma y payload" de WF1 documenta que la verificación HMAC real de `x-blacklabel-signature`
> **nunca se implementó** — el sandbox de los nodos Code de n8n bloquea `require("crypto")`. La
> mitigación actual (header de evento + ventana de frescura de 5 min) no es firma criptográfica real.
> Esto afecta a **todos** los webhooks Vercel→n8n de este proyecto, no solo al de `dealer-qualified`
> tocado hoy (que se dejó firmando desde Vercel, pero no fail-closed, para no bloquear producción por
> una firma que hoy nadie verifica al otro lado — ver `N8N_WEBHOOK_DEALER_QUALIFIED_SECRET` en
> `.env.local.example`). Fix real pendiente: nodo nativo `n8n-nodes-base.crypto` (HMAC-SHA256) sobre
> el body crudo, en vez de intentarlo en un nodo Code — no aplicado esta sesión por el riesgo de
> editar en ciego la validación de un workflow en producción sin poder probar el ciclo completo.
> Actualización anterior: **2026-09-02** — **Embudo de acceso profesional con precios ocultos, cerrado
> de punta a punta.** Decisión de H (2026-09-02): ocultar precios en la web y llevar todo showroom
> interesado a un embudo de 4 etapas (informar → solicitar valoración → llamada de admisión
> autoagendada → alta) en vez del alta directa con precio visible. Auditoría conjunta (Codex + Claude)
> localizó cada mención de "acceso profesional" en el sitio; cambios aplicados y verificados
> (`tsc`+`lint`+`build` limpios): formulario único `/profesionales/solicitar-acceso` (sustituye
> `/registro` y `/profesionales/precios`, ambos con redirect 308), `/profesionales/planes` con precios
> ocultos tras "Consulta", máquina de estados nueva (`qualified_awaiting_call` + `agreed_plan`,
> migración 109), copy y CTAs coherentes en toda la web pública (home, como-funciona, dealers,
> footer, guías, grupos), condiciones-profesionales reescrito para reflejar que plan y precio se
> acuerdan en la llamada (no antes — **cambio de texto contractual, pendiente de revisión legal
> real**), y eliminado `app/(public)/precios/page.tsx` (duplicado muerto con precios visibles que el
> redirect ya enmascaraba). **Backend n8n sincronizado el mismo día**: WF1/WF3/WF4/WF-P2 con la
> terminología nueva ("solicitud de valoración") y sin la promesa falsa de "24-48h → acceso al panel";
> nuevo workflow `BLM - Cualificado, Agenda tu Llamada` (`blm/dealer-qualified`, activo, probado)
> conectado a `N8N_WEBHOOK_DEALER_QUALIFIED`; WF-P3 (onboarding fundador) exportado y versionado por
> primera vez. **Formulario `/contacto` dejó de ser un simulacro**: ahora llama a `/api/contact` →
> webhook firmado HMAC → nuevo workflow `BLM - Formulario de Contacto` (probado end-to-end, ambos
> emails confirmados en ejecución real). **Desplegado a producción y verificado del todo (mismo día,
> más tarde)**: `N8N_WEBHOOK_DEALER_QUALIFIED`, `N8N_WEBHOOK_CONTACT_FORM` y
> `N8N_WEBHOOK_CONTACT_FORM_SECRET` (secreto aleatorio nuevo) dadas de alta en Vercel producción,
> redeploy hecho, y una petición real contra `blacklabelmarket.es/api/contact` confirmada con
> ejecución exitosa en n8n (id 6180). Solo queda pendiente `SHOWROOM_ADMISSION_CALL_BOOKING_URL`, y a
> propósito: no tiene valor real todavía porque el Google Calendar del market sigue sin conectar (ver
> fila 1 de "Camino al 100%" — es un bloque de trabajo aparte). Sin ella el email de "cumples
> criterios" se sigue enviando igual, solo que pide responder por correo en vez de dar el enlace de
> autoagenda. Detalle técnico completo en el historial de la sesión, no duplicado aquí.
> Actualización anterior: **2026-09-02** — **Auditoría completa de seguridad y configuración (Codex Sol +
> verificación cruzada de Claude), a petición explícita de H antes de escalar.** Documento completo:
> [`docs/auditoria-seguridad-completa-2026-09-02.md`](auditoria-seguridad-completa-2026-09-02.md) (no
> duplicado aquí). **7 hallazgos P0 reales, bloqueantes para Stripe live / más datos de terceros**: XSS
> persistente vía JSON-LD sin escapar, exposición de columnas internas de `dealers`/`vehicles` por RLS
> (filtra filas, no columnas), 2 vías de SSRF (importación de imágenes, `webhook_url` del asistente
> editable por el dealer), mass assignment en escritura de vehículos (**reabre SEC-3**, dado por cerrado más
> abajo en este documento — la corrección real sigue sin aplicarse), webhook de Stripe sin idempotencia
> transaccional real (puede dejar pagos cobrados sin servicio provisto), onboarding con documentos en bucket
> potencialmente público + recovery link sin firma enviado a n8n, e **inserción anónima de leads nunca
> revocada** (**reabre SEC-4**, la migración `001_initial.sql` con `WITH CHECK (true)` nunca se elimina).
> **Un hallazgo inicial de Codex se corrigió tras verificación externa**: Next.js 14.2.25 es técnicamente
> vulnerable a RCE vía AVIF (CVE-2026-75604), pero Vercel confirma que las apps en su plataforma gestionada
> están protegidas a nivel de infraestructura sin necesidad de actualizar — baja de "crítico/NO-GO" a
> hardening recomendado. `increment_vehicle_views` (RPC anon-callable) se descartó como hallazgo: es diseño
> intencional ya auditado en la migración 097, no un hueco. Detalle completo, fixes y consultas SQL de
> verificación en el documento fuente.
> **2026-09-02 (misma sesión) — 6 de 7 P0 aplicados en código, verificados con `tsc`+`lint`+`build`
> limpios, sin desplegar todavía** (migraciones nuevas 102-104 sin `supabase db push`, código sin
> `vercel --prod --yes` — deploy pendiente de confirmación explícita, afecta RLS/webhooks/producción
> real). P0.1 (XSS JSON-LD), P0.3 (SSRF import+asistente), P0.4 (mass assignment vehículos, reabre y
> cierra SEC-3), P0.6 (bucket privado de onboarding + webhook firmado — **requiere configurar
> `N8N_WEBHOOK_FUNDADOR_ONBOARDING_SECRET` en Vercel antes de desplegar**) y P0.7 (leads INSERT
> anónimo, reabre y cierra SEC-4) completos. P0.5 (Stripe) parcial a propósito: fix del bug más grave
> (fallo real ya no responde 200, dispara reintento de Stripe) + las 2 escrituras que activan el
> servicio ahora comprueban error, pero no se reescribió todo el manejador a transacciones atómicas
> (fuera de alcance seguro sin entorno de pruebas).
> **P0.2 (columnas internas de `dealers`/`vehicles` expuestas) — ✅ cerrado en sesión siguiente
> (2026-09-02)**: mapa completo de consumidores (Codex), migrados los 7 puntos que dependían de
> `profile_id`/`subscription_plan` públicos (nueva ruta `/api/me/profile`, nueva RPC
> `get_own_dealer_summary()`, `getDealerAccess()` en vez de lectura directa, ranking por
> `is_featured` en vez de plan), reescritos ~34 `select('*')` públicos a listas explícitas
> (`lib/public-columns.ts` — hallazgo crítico: `select=*` FALLA con column-level security, no se
> estrecha solo, verificado contra doc oficial de Supabase antes de aplicar nada), y solo entonces
> `REVOKE`+`GRANT` por columnas (migración 107). De paso, migración 105 cierra un hueco de fila en
> `dealer_gallery_images` (faltaba exigir `profile_status='published'`). **Con esto, los 7 P0 de la
> auditoría están completos** (P0.5 sigue parcial a propósito). Detalle completo en
> `docs/auditoria-seguridad-completa-2026-09-02.md`.
> Actualización anterior: **2026-09-01** — limpieza de documentación completa (candidatos a limpieza
> eliminados, duplicados/incoherencias corregidos), hallazgos reales de 2 auditorías cerrados en código
> (INC-004, WF7 dealer_id, rate-limit del asistente, cache de `gtm_id`, doble auth en `Header.tsx`) o
> documentados como bloqueados sin autorización (ahora aplicados: ver SEC-14), Incidente #0 cerrado del todo
> (RS Premium Car era una prueba, rastro eliminado), y nueva sección **"Camino al 100%"** justo abajo — vista
> de negocio priorizada, no solo checklist técnico. Detalle en `registro_decisiones.md` 2026-09-01 (varias
> entradas) y `agency/00_estado_ceo.md`.
> Actualización anterior: **2026-08-27** (bloque "día a día" del roadmap de
> market al 100% cerrado a falta de pruebas reales: ventana 24h en panel, reportes P4/P5/P6 saneados,
> Programa Fundador y gap de Stripe corregidos — quedan abiertos dentro de este mismo bloque: lead scoring
> (pausado a propósito), soporte/trust-safety (sin decidir canal) y onboarding white-glove (sin tocar)).
> Anterior: 2026-08-26 (cadena de alta lista a falta de pruebas con showrooms reales; import
> CSV/feed sin fotos ya no publica en falso). Anterior: 2026-08-10 (limpieza del catálogo demo).

---

## 🎯 Camino al 100% — visión de negocio (2026-09-01)

> Prioridad de negocio, no lista técnica plana — cada fila asume que las de arriba ya están hechas. El % es
> acumulado: "cuánto del market como negocio (no como software) estaría completo si se hiciera esto y todo lo
> de encima". Detalle técnico de cada punto ya vive en su sección correspondiente de este documento o en el
> documento referenciado — esto es el índice de prioridad, no una copia.

| # | Qué falta | Tipo | Detalle en | % acum. |
|---|---|---|---|---|
| 1 | **Primer fundador real onboardeado** — el mecanismo (alta→aprobación→sala de configuración→dashboard) ya está construido y verificado; hoy solo ha entrado un simulacro. Sin stock real, todo lo demás es infraestructura sin usar. | Acción de negocio | `agency/00_plan_maestro_100.md` P2 | **42%** |
| 2 | **Stripe en modo live** — checkout ya construido y probado en test; falta KYC de KAZAWEB, sustituir claves, y cerrar el precio del plan **Grupo** (sigue "⏳ por confirmar"). | Definición + activación | `docs/planes-suscripcion-definitivos.md` §4, FASE B abajo | **60%** |
| 3 | **Quitar `noindex`** (una vez haya stock real del punto 1) — abre la adquisición orgánica de compradores. SEO/GEO ya construido, falta el interruptor + coordinación de sitemap. | Decisión + verificación | `lib/seo.ts`, `docs/seo-geo-backlog.md` G01 | **72%** |
| 4 | **Cierre legal real** — revisión por abogado RGPD/LSSI/DSA (sigue en borrador); implementar en fichas públicas de showroom lo que exige el art. 30 DSA (registro mercantil + autocertificación visibles — **verificado 2026-09-01: no implementado**, cero coincidencias en `app/(public)/dealers`); rellenar placeholders de CRM/formularios/pixel. | Construcción + definición | `docs/legal-pending-data.md` | **80%** |
| 5 | **Cerrar la seguridad al 100%** — parchear retroactivamente los clones WF7 ya existentes (el fix de hoy solo cubre clones nuevos), completar la verificación HMAC real de WF1 (hoy solo ventana anti-replay). | Construcción | SEC-14 abajo | **85%** |
| 6 | **Referral y growth loops** — hoy no existe ni el diseño. Sin esto el crecimiento depende 100% de adquisición pagada/orgánica. | Definición + construcción | — (sin documento propio todavía) | **90%** |
| 7 | **Redes sociales propias en marcha** — cerrar la tabla `Contenidos` (gate K3) y publicar la primera pieza real. | Construcción + acción | Nota nueva abajo (redes sociales BLM), `agency/02_growth_marketing.md` | **93%** |
| 8 | **Newsletter operativo** — resolver el bloqueo de doble opt-in en Brevo, o decidir la migración a GHL que lleva semanas sobre la mesa. | Decisión + construcción | FASE B abajo | **95%** |
| 9 | **Rendimiento y CRO real** — `select('*')` sin acotar / `VehicleCard` como client component completo (C4), pasar de medir a experimentar con GA4/Clarity. | Construcción | Nota "Perf (C4)" abajo | **98%** |
| 10 | **Higiene restante** — rotación de `service_role` (bajo riesgo, pendiente de hacerla con H), unificar `/mis-favoritos` vs `/cuenta/favoritos`, pulido SEO de cola larga. | Construcción menor | Notas correspondientes abajo | **100%** |

**Lectura directa**: los 3 primeros puntos (fundador real, Stripe live, quitar noindex) son el 72% del
negocio, y ninguno necesita construirse — ya está todo hecho técnicamente. Es la diferencia entre "producto
terminado" (ya lo es) y "negocio operando" (todavía no). El punto 4 (legal) es el único que se considera
innegociable antes de escalar más allá del programa fundador actual, aunque no bloquea seguir onboardeando
founders con cuidado mientras se resuelve en paralelo.

---
> Elimina y sustituye: `pendientes-configuracion-externa.md`, `deployment-checklist.md`, `n8n-setup.md`, `backlog-alertas-y-vehiculos-a-la-carta.md`, `backlog-marketplace.md`.

> **🧹 Limpieza del catálogo demo — 2026-08-10.** El market se dejó presentable para enseñarlo en visitas
> comerciales: 12 showrooms y 61 vehículos, **0 fichas públicas sin foto** (antes 166 de 271, el 61 %) y
> **0 fotos genéricas de Unsplash**. Se corrigió además un fallo que afectaba al **100 % del catálogo**: las
> categorías de los vehículos no existían en la taxonomía pública, así que ninguna ficha aparecía en las
> páginas de categoría ni en los filtros.
> Detalle, cifras y trampas operativas: [`docs/limpieza-catalogo-demo-2026-08-10.md`](limpieza-catalogo-demo-2026-08-10.md).
> Auditoría que lo originó: [`docs/auditoria-perfiles-demo-2026-08-10.md`](auditoria-perfiles-demo-2026-08-10.md).
>
> **Dos cosas que recordar antes de tocar el catálogo otra vez:** (1) filtrar por `status = 'active'` **no
> basta** — la ficha pública de showroom muestra también `paused` y `sold`; (2) la caché ISR es de 5 minutos,
> los cambios en base de datos tardan en verse en la web.

> **✅ Corrección de claims de verificación/moderación — 2026-08-27.** El copy público afirmaba en varios
> sitios (FAQ de `/profesionales/precios`, portada, `/como-funciona`, una guía) que los vehículos pasan
> "revisión editorial" individual antes de publicarse, o que se confirma "disponibilidad"/"imágenes propias" —
> falso desde que se retiró la moderación manual por unidad (2026-07-17, ver SEC-3 arriba y el comentario en
> `lib/vehicle-write.ts`) y sin que exista enforcement técnico real de esos otros dos puntos. La FAQ de
> `revisión editorial en <24h` de `app/(public)/precios/page.tsx` (ruta hoy inalcanzable, redirige a
> `/profesionales/precios`) también se limpió aunque no era código vivo. Corregidas las 5 instancias
> encontradas (`profesionales/precios`, home, `como-funciona`, guía "cómo comprar un supercar", `precios`
> muerto) para afirmar solo lo cierto: el profesional pasa un proceso de admisión antes de poder publicar, y
> los vehículos deben pertenecer al catálogo cerrado de marcas/modelos.
>
> **Decisión de negocio de H (2026-08-27):** todo showroom con perfil publicado en BLM está verificado,
> siempre, por defecto — no es una opción ni un estado aparte; se verifica antes de aceptar la solicitud de
> alta. Ajustado el badge "Verificado" en `components/marketplace/DealerCard.tsx` y `DealerInlineCard.tsx`,
> que antes lo condicionaban a `dealer.is_verified` (campo que se crea en `false` al aprobar el alta —
> `admin/altas-showroom/actions.ts` — y depende de un checklist interno en `admin/dealers/[id]` hoy
> "orientativo", sin bloqueo real). Ahora se muestra siempre para cualquier perfil publicado, coherente con
> la regla de negocio real. `VehicleDetailContent.tsx` y la ficha pública de showroom ya lo mostraban sin
> condición — coincidían con la regla correcta por casualidad, no por diseño.
>
> **Backlog, no bloqueante:** `dealers.is_verified` y su checklist en `admin/dealers/[id]` quedan
> desacoplados de lo que ve el comprador — decidir si se elimina el toggle/checklist o se reconvierte en
> seguimiento interno de calidad, sin urgencia.

> **✅ Resuelto (2026-09-05) — el badge "Destacado" ya se materializa al aprobar el alta.**
> `approveApplication` (`admin/altas-showroom/actions.ts`) ahora setea `is_featured: trialPlan ===
> 'elite'` en el `insert` de `dealers`, mismo criterio que `setDealerPlan` ya usaba en
> `admin/dealers/[id]/page.tsx`. Cubre a cualquier dealer cuyo plan resuelto sea Elite, no solo
> fundadores — un `market_directo` que acuerde Elite en la llamada de admisión también sale
> destacado desde el alta, sin condición de `status`, coherente con la decisión de H del
> 2026-09-03 registrada aquí abajo. **Sigue sin tocar** (fuera de alcance, no bloqueante):
> `organizations.is_featured` sigue siendo una columna muerta sin materializar — el frontend
> (`/dealers`, home) lee `dealers.is_featured`, ya corregido, así que no es urgente.

> **✅ Resuelto (construido más tarde en la misma sesión, 2026-09-03) — la sala de configuración SÍ
> ofrece alta de stock vehículo a vehículo.** La nota original de este bloque quedó obsoleta: hoy
> `SetupRoomClient.tsx` tiene un modo `vehicle_by_vehicle` de primera clase (sustituyó a "archivos
> sueltos", no se añadió al lado) — formulario completo con marca/modelo/versión en cascada, fotos,
> revisión de calidad por IA al momento y publicación normalmente sin esperas. Verificado leyendo el
> componente en vivo el 2026-09-04, no solo esta nota.

> **⏳ Pendiente — no existe un email de bienvenida/agenda de onboarding al publicar el perfil (hallazgo
> del mismo simulacro, 2026-09-03).** Verificado el ciclo completo de emails de `wf-p3-onboarding-fundador.json`
> (nodo "Validar input"): `setup_required` (invitación a la sala), `setup_completed` (contraseña +
> aviso de que el equipo revisará perfil/logo/fotos antes de publicar la ficha — **esto sí existe y ya
> cubre el margen de revisión que se preguntó**) y `profile_published` (aviso de que la ficha ya está
> publicada, con enlace a la ficha pública). **Ninguno de los tres incluye enlace para agendar una
> llamada de bienvenida/onboarding** — el payload que dispara `profile_published`
> (`publishDealerProfile` en `admin/dealers/[id]/page.tsx`) solo lleva `dealer_id`, `dealer_name`,
> `email`, `dealer_slug`, `public_url`, sin ningún campo de reserva de cita. Relacionado con el bloque
> "Reserva de cita del agente" ya documentado (Fase A, OAuth real de Google Calendar, pendiente) — falta
> decidir si el enlace de bienvenida debe ser una cita con el propio Black Series (onboarding comercial)
> o con el sistema de citas del showroom (que hoy tampoco tiene Google Calendar conectado, solo
> disponibilidad manual — ver hallazgo siguiente).

> **✅ Resuelto (construido más tarde en la misma sesión, 2026-09-03) — la sala de configuración SÍ
> tiene el control de conexión de Google Calendar real.** La nota original quedó obsoleta: hoy
> `SetupRoomClient.tsx` tiene la sección `google.configured && (...)` con enlace "Conectar"/"Reconectar"
> a `/api/calendar/google/connect?setup_token=...`, con guardado de borrador antes de salir por el
> ida-y-vuelta de OAuth. **Matiz que sigue vigente**: el botón existe pero no hace nada real todavía
> porque faltan las credenciales `GOOGLE_OAUTH_CLIENT_ID`/`GOOGLE_OAUTH_CLIENT_SECRET` en Vercel (ver
> nota fechada 2026-09-04 en "Pendientes en Vercel", más abajo — es la misma pieza, no un hallazgo
> nuevo). Disponibilidad manual (`provider='manual'`) sigue existiendo como alternativa, no como único
> camino.

> **Moderación de vehículos a futuro (no construido, solo referencia de diseño — H pide no explicar
> públicamente el mecanismo en ningún sitio):** el comentario de `lib/vehicle-write.ts` (decisión 2026-07-17)
> ya declara la intención de sustituir la moderación manual por un futuro "agente de auditoría
> post-publicación". No existe ningún documento de diseño de ese agente todavía — esta es la única
> referencia. Candidato a especificar cuando se priorice; hoy el control real es el catálogo cerrado de
> marcas/modelos seleccionables al publicar.

---

## 🔍 Auditoría completa 2026-07-01 — Correcciones pendientes

> **Informe completo con `archivo:línea` y fix concreto de cada punto:** [`docs/auditoria-completa-2026-07.md`](auditoria-completa-2026-07.md).
> 4 auditorías especializadas (bugs, seguridad, UX/accesibilidad, SEO/GEO) sobre el código real. Aquí solo el checklist accionable; el porqué y el snippet de corrección están en el informe.
>
> **⚠️ ACTUALIZACIÓN 2026-07 (cierre total):** gran parte de este checklist YA está corregido, desplegado y verificado. Fuente detallada y estado por bloque: [`docs/auditoria-total-2026-07/PLAN-CIERRE-TOTAL.md`](auditoria-total-2026-07/PLAN-CIERRE-TOTAL.md).
> Resumen de lo cerrado: **Sprint 0** — SEC-1 (assertAdmin), SEC-2 (webhooks fail-closed), **SEC-3 (mass-assignment vehículos → `sanitizeVehiclePayload`)**, SEC-4 (leads validados+rate-limit), BUG-1 (create-checkout→subscriptions), BUG-2 (boost `is_featured`), BUG-3 (fallback cupo→`bypassCap`), BUG-7 (idempotencia webhook, tabla `processed_stripe_events`). **Sprint 1** — BUG-5 (incrementEliteCounter cableado), BUG-6 (`admin.rpc as never` x3 eliminados), BUG-8 (cron `expire-boosts`), SEC-7 (magic bytes), A1 (contraste AA), A2/A3 (modales `useModalA11y`). **Migraciones aplicadas en prod:** 057-075 (ver lista completa más abajo; 073 asistente IA dedicado por dealer, 074 tokens Google Calendar, 075 aceptación de condiciones profesionales). **Verificado también cerrado:** SEC-5 (el buscador ya sanea `,()*%\` + cap 60 en el `.or()` de PostgREST, y el cliente anónimo tiene RLS a `active`), **BUG-9** (doble-reserva en `assistant/book` — constraint único `uniq_appointment_dealer_slot` en migración 064 + manejo `409` en código, verificado 2026-07-21 contra el código, el checkbox de abajo estaba desfasado).
> **⚠️ CORRECCIÓN 2026-07-21 (auditoría contra código, no contra el checklist):** **B1 (header dorado) NO está corregido** — `Header.tsx:125-129` sigue usando un gradiente marrón (`rgba(58,45,36,...)` = `#3A2D24`), pese a que el resumen de arriba lo daba por cerrado en una versión anterior. Se corrige aquí: B1 sigue abierto, ver Sprint 1. En cambio, **"unificar los 3 dorados" (Sprint 2) SÍ está resuelto**: solo existe `#C6A64B` en todo el código (`tailwind.config.ts`), no hay rastro de `#C9A84C` ni `#BFA14A`. **Pendientes reales confirmados:** SEC-6/8 (feature-work diferido, siguen abiertos), F1-escritura E2E en vivo, E4 (FAQ/GEO), resto de 🟢 Sprint 2 (pulido). El `noindex` **sigue activo** a propósito.

### 🔴 Sprint 0 — Antes de aceptar más pagos reales / abrir al público
Cadena de dinero rota + seguridad explotable. **CERRADO (ver nota 2026-07 arriba) — checkboxes actualizadas 2026-07-09, desfasadas respecto al resumen desde su cierre real.**
- [x] **BUG-1** — `create-checkout` usa firma legacy → **`subscriptions` nunca se rellena** ni se activa Elite. Resolver `organization_id` y usar la firma nueva de `createCheckoutSession`. `app/api/stripe/create-checkout/route.ts` + `lib/stripe.ts`
- [x] **BUG-2** — El boost pagado **no pone `is_featured=true`** (solo `featured_until`) → no destaca. `lib/boosts.ts:130-134`
- [x] **BUG-3** — Fallback de boost destaca **saltándose el cupo** `max_boosted_share` cuando la activación falla por cupo lleno. `app/api/stripe/webhooks/route.ts:94-108`
- [x] **BUG-7** — Webhook Stripe **sin idempotencia** real (el comentario la promete pero no existe) → boosts/créditos duplicados en reenvíos. Tabla `processed_stripe_events` con unique. `app/api/stripe/webhooks/route.ts`
- [x] **SEC-1** 🔴 — **Server Actions de admin sin verificar rol** → cualquier usuario autenticado puede aprobar showrooms/vehículos. Añadir `requireAdmin()` como 1ª línea de cada acción. `app/(admin)/admin/altas-showroom/actions.ts` + `app/(admin)/admin/vehiculos/[id]/page.tsx`
- [x] **SEC-2** 🔴 — **Webhooks entrantes fail-open**: HMAC solo se comprueba si el secreto está en el entorno. Hacerlo obligatorio (fail-closed). `app/api/webhooks/{appointment-result,assistant-result,hot-lead-alert}/route.ts`
- [x] **SEC-3** 🔴 — **Mass-assignment en vehículos**: dealer se autopublica activo/destacado saltando moderación y el boost de €49. Allowlist de columnas + forzar `status='pending_review'`. `app/api/vehicles/route.ts` + `[id]/route.ts`
- [x] **SEC-4** — **Falsificación de leads/citas**: `dealer_id`/`vehicle_id` arbitrarios sin validar pertenencia, sin rate-limit. `app/api/leads/route.ts` + webhooks
- [x] **SEC-5** — **Inyección de operadores PostgREST** en el buscador (`.or()` con input crudo) → expone borradores/no-activos. `lib/vehicle-query.ts:85`
- [ ] **SEO-1/SEO-2** — (solo si se levanta el gate noindex) `/sobre-nosotros` y `/coches/berlinas` en el sitemap+footer pueden ser 404. Auditar 1:1 rutas del sitemap. `app/sitemap.ts` — condicional, no aplica mientras `noindex` siga activo.

### 🟡 Sprint 1 — Calidad y confianza
- [x] **BUG-5** — `incrementEliteCounter` importado pero **nunca llamado** → capacidad Elite por provincia no se limita. `app/api/stripe/webhooks/route.ts`
- [x] **BUG-6** — 3 escrituras basura `admin.rpc as never` que corrompen `used`/`current_elite_showrooms`. `lib/boosts.ts:81,180` + `lib/elite-capacity.ts:87`
- [x] **BUG-8** — Sin cron que expire boosts ni resetee `is_featured` → el orden prioriza boosts caducados.
- [x] **BUG-9** — Doble-reserva en `assistant/book` (check+insert sin constraint único). Resuelto: migración `064_appointment_slot_unique.sql` (índice único parcial `uniq_appointment_dealer_slot`) + `app/api/assistant/book/route.ts` captura `23505` y devuelve `409` con rollback del lead. Verificado 2026-07-21.
- [ ] **SEC-6** — Import por API key global sin scoping (`IMPORT_API_KEY` acepta cualquier `dealer_slug`, sin plan-gating). `app/api/vehicles/import/route.ts` — diferido.
- [x] **SEC-7** — Upload confía `file.type`/extensión del cliente, sin magic bytes. `app/api/upload/route.ts`
- [ ] **SEC-8** — Contraseña temporal devuelta en el JSON de respuesta + sufijo fijo `7a`. Invitación por email. `app/api/team/members/route.ts` — diferido.
- [x] **A1** 🎨 — **Contraste AA falla en el texto gris más usado** (`bsm-text-muted` 4.02:1). Resuelto: `tailwind.config.ts:41` sube `text-muted` a `#979797` ("subido de #8A8A8A para pasar AA sobre superficies elevadas"). Verificado 2026-07-21.
- [ ] **A2/A3** — Modales sin `role="dialog"`/focus-trap/Escape (hook `useModalA11y` compartido). `LeadsBandeja.tsx`, `KanbanBoard.tsx`, `SearchAlertModal.tsx`, `VehicleGallery.tsx`
- [x] **B1** — Header con **gradiente marrón** que rompe la identidad "negro premium" → gradiente negro + acento dorado. `components/layout/Header.tsx:125-129`. **Resuelto 2026-08-31**: gradiente marrón (`rgba(58,45,36,...)`) sustituido por negro real (`obsidian` `rgba(10,10,10,...)`→`rgba(5,5,5,...)`), borde inferior pasa de marrón (`#2A1E16`) a dorado sutil (`border-gold/20`). **Corregida también una segunda instancia no documentada**: el menú móvil (línea ~295) tenía el mismo gradiente marrón hardcodeado, no capturado en la auditoría original — mismo fix aplicado ahí.
- [x] **B3** — Tablas de admin/dashboard rotas en móvil (8 col con scroll) → patrón card apilada. `app/(admin)/admin/dealers/page.tsx`. **Resuelto 2026-08-31**: tabla original queda `hidden lg:block` (sin tocar desktop); nueva vista `lg:hidden` con tarjetas apiladas (nombre+email, badge de estado, plan/ciudad/vehículos/fecha en grid 2 columnas), mismas clases de badge y tokens ya existentes en el archivo. Verificado por build limpio (`tsc`+`next build`, ruta `/admin/dealers` compila) — **no verificado visualmente logueado** (la ruta exige login de admin, sin credenciales disponibles en esta sesión).
- [x] **B2** — Hero con 3 CTAs dorados compitiendo → 1 primario + secundarios. `app/(public)/page.tsx:112-129`. **Resuelto 2026-08-31**: en el código real solo había 2 botones `btn-gold` compitiendo ("Explorar coches"/"Explorar motos"), no 3 — la cifra del hallazgo original no coincidía con el código actual. "Explorar coches" queda como primario (`btn-gold`), "Explorar motos" pasa a `btn-outline` (clase ya existente en el proyecto). Verificado visualmente con Playwright contra el dev server.

### 🟢 Sprint 2 — Pulido premium + SEO
- [x] **BUG-bajos** — **Resuelto 2026-08-31/09-01**, debatido con Codex (2 rondas) antes de implementar:
  - Orden de membresía owner>admin (no `created_at`): `app/(dashboard)/dashboard/equipo/page.tsx` — `ROLE_RANK` ahora deriva de `ASSIGNABLE_ROLES` (jerarquía real), no de un sort owner-only. De paso, corregido un bug de tipos real (`ROLE_RANK` no cubría `group_admin`/`location_manager`, un `as Record<OrgRole,number>` mentía sobre las claves presentes) — `lib/permissions.ts` ahora exporta `AssignableRole` con el tipo preciso de `ASSIGNABLE_ROLES`.
  - `DELETE` de miembro borraba el usuario de auth global (`admin.auth.admin.deleteUser`), lo que —por `ON DELETE CASCADE` en `organization_members.user_id`— le quitaba el acceso a **todas** sus organizaciones, no solo la actual. `app/api/team/members/[id]/route.ts`: ahora solo borra la fila de `organization_members` de esta organización. `POST /api/team/members` reutiliza el usuario de auth existente si el email ya tiene cuenta (`lib/supabase/admin-helpers.ts`, `findAuthUserByEmail` — extraído de `altas-showroom/actions.ts` para no duplicarlo), en vez de fallar con "email ya existe". `TeamManager.tsx` actualizado para el caso "cuenta existente, sin contraseña nueva".
  - TOCTOU en `maxUsers`: nueva RPC `add_team_member_if_under_limit` (migración `094_add_team_member_atomic.sql`) con `pg_advisory_xact_lock(hashtextextended(org_id::text, 0))` — serializa altas concurrentes de la misma organización dentro de una sola sección crítica. `maxUsers` se sigue calculando en la app (`lib/entitlements.ts`) y se pasa como parámetro, sin duplicar esa lógica en SQL.
  - Consumo de crédito de boost no atómico: **ya estaba resuelto** (migración `062_consume_boost_credit.sql`, `UPDATE ... WHERE used < quantity` + `GET DIAGNOSTICS`) — verificado leyendo la migración real, no tocado esta sesión.
  - **Auditoría cruzada de Codex sobre este código** (no solo el diseño): 5 hallazgos reales aplicados — `GRANT EXECUTE ... TO service_role` explícito en la RPC (defensivo); condición de carrera real detectada (el pre-check de membresía duplicada queda fuera del lock) → mapeado el código Postgres `23505` a un 409 limpio en vez de 500; logging del rollback de `deleteUser` si el propio borrado falla (antes se ignoraba en silencio).
  - **Migración 094 aplicada y verificada 2026-09-01**: además, al comprobarla se encontró que era llamable directamente con la anon key pública (igual que 5 funciones RPC más, algunas ya en producción desde antes) — cerrado con migraciones 095-100, las 6 verificadas con llamadas reales contra producción. Detalle en `registro_decisiones.md` 2026-09-01 y **SEC-13** más abajo.
- [x] **A4-A7** — Labels/errores accesibles en formularios; foco visible en galería; radios con check no-cromático. **Resuelto**: formularios accesibles en `login`/`registro` (ya lo estaban) y corregidos `recuperar`, `reset-password`, `admin-login`, `contacto`, `TeamManager` (label`htmlFor`+`id`, `aria-invalid`, `role="alert"` en errores) — foco visible en `VehicleGallery` ya resuelto en sesión previa — radios de `QualifiedLeadForm` con icono `Check` (`aria-hidden`, espacio reservado vía `opacity-0`→`peer-checked:opacity-100`, no solo color).
- [x] **A8-A12** — `aria-label` en iconos header (resuelto en sesión previa) · jerarquía h1→h3 (resuelto en sesión previa) · **placeholder de imagen legible: resuelto 2026-09-01**, con hallazgo real — `VehicleCard.tsx` usaba `text-bsm-border` (#2A2A2A) sobre fondo #111111 (contraste ≈1.3:1, prácticamente invisible) en vez de `text-bsm-text-muted` (#979797, ≈6.5:1, AA); `VehicleGallery.tsx`'s `NoImagePlaceholder` ya usaba el token correcto pero lo diluía con `opacity-40`/`opacity-60` adicional (contraste efectivo ≈2-3:1) — opacidad reducida a valores que no anulan el contraste del token. **Corrección 2026-09-01 (auditoría documental)**: `aria-expanded` en hamburguesa y `prefers-reduced-motion` estaban marcados "Pendiente" por error — verificado en código real que ambos ya existen (`Header.tsx:286` tiene `aria-expanded={mobileOpen}`; `app/globals.css:24-31` tiene el bloque `@media (prefers-reduced-motion: reduce)` completo). Sin pendientes reales en A8-A12.
- [x] Unificar los 3 dorados (`#C6A64B`/`#C9A84C`/`#BFA14A`) — resuelto: solo `#C6A64B` existe en el código hoy (verificado 2026-07-21, sin rastro de los otros dos).
- [x] **B4-B11** (resto) — **Resuelto 2026-09-01** salvo dos: tipografía de descripción `text-sm`→`text-base` en `VehicleDetailContent.tsx` · loading/skeletons reales en `/coches`, `/motos` y sus `[slug]` (no había ningún `loading.tsx` en el proyecto) · tokens de borde: sweep mecánico de 273 instancias de `#2A2A2A`/`#1E1E1E`/`#C6A64B` sueltos → `bsm-border`/`bsm-border-light`/`gold` en 46 archivos (script Node dedicado, verificado con `tsc`+`next build`) · breadcrumb legible: unificado el patrón `<nav aria-label><ol>` en `VehicleDetailContent.tsx` (antes `<div>` plano) · unificar `ContactForm`/`QualifiedLeadForm`: `ContactForm.tsx` **eliminado** (0 imports reales, código muerto confirmado por grep) — `QualifiedLeadForm` es el único formulario de contacto en producción. **Corrección 2026-09-01 (auditoría documental)**: el autoguardado del wizard de publicar estaba marcado "Pendiente" por error — verificado en código real que ya existe (`app/(dashboard)/dashboard/publicar/page.tsx:19-188`, `DRAFT_KEY`, restaura/guarda/limpia el borrador). **Pendiente real, único**: jerarquía visual de "precio a consultar".
- [x] **SEO-3/4/5/6** — `mileageFromOdometer` con guarda de null (resuelto en sesión previa) · OG de fichas con `url` real (resuelto en sesión previa) — **sin dimensiones deliberadamente**: `VehicleImage` no captura ancho/alto al subir, inventarlas violaría la regla de no fabricar datos · **respuesta directa citable (GEO) + `FAQPage` en landings de categoría/marca: construido 2026-09-01** — ver detalle abajo.
- [x] **SEO-7/8/9** — breadcrumb con nivel categoría + marca→`/marcas/[slug]` (resuelto 2026-09-01, `VehicleDetailContent.tsx` + ambos `[slug]/page.tsx`) · silo horizontal entre categorías (resuelto 2026-09-01, ver detalle abajo). **Pendiente**: `priority={activeIndex===0}` en galería.
- [x] **SEO-10/11/12** — fecha visible derivada de `dateModified` (`VehicleDetailContent.tsx`, "Actualizado en [mes] de [año]") · título de dealer con ciudad (`dealers/[slug]/page.tsx:77`) · enlaces al split `/marcas/[brand]/coches|motos` (nav "Todos los X · Coches · Motos" en la página hub + enlaces "ver todos" al final de cada grid) + dropdown "Marcas" del Header y lista de marcas del Footer corregidos para enlazar a `/marcas/[slug]` reales en vez de `/coches?marca=X` (Footer tenía el mismo bug que el Header: "BMW M"/"Mercedes AMG" generaban slugs inventados `bmw-m`/`mercedes-amg` en vez de los reales `bmw`/`mercedes-benz` — hallado con Playwright, no estaba en ningún checklist). **Todos 2026-08-31/09-01.**
- [x] **SEC-13 (nuevo)** — **6 funciones RPC de Supabase eran llamables directamente con la anon key pública**, saltándose toda la autorización de la app: `add_team_member_if_under_limit`, `consume_boost_credit`, `refund_boost_credit`, `trial_dealer_stats`, `record_followup_response`, `confirm_vehicle_freshness`. Causa: `REVOKE ALL ... FROM PUBLIC` no basta en este proyecto — Supabase concede `EXECUTE` a `anon`/`authenticated` por defecto como grant directo, no heredado de PUBLIC. **Resuelto y verificado 2026-09-01** (migraciones 095-100, `REVOKE EXECUTE ... FROM anon, authenticated` explícito en cada una, confirmado con llamadas reales contra producción — las 6 devuelven `42501 permission denied`). Detalle completo en `registro_decisiones.md` 2026-09-01 (tarde). **Recomendación permanente para toda función `SECURITY DEFINER` nueva**: no basta con `REVOKE ALL FROM PUBLIC` — hay que revocar explícitamente de `anon` y `authenticated`, y verificar con una llamada real usando la anon key antes de dar el fix por bueno.
- [~] **SEC-14 (nuevo, 2026-09-01)** — Tres hallazgos de `agency/auditoria_alta_fundador_blm_2026-08-17.md`
  reverificados contra el código/n8n real (auditoría de limpieza de documentación, no todo lo que decía ese
  archivo seguía vigente — un cuarto hallazgo del mismo documento, filtrado de catálogo por
  `dealer.profile_status`, resultó **ya resuelto desde el 2026-08-25** y se ha retirado de aquí):
  - **WF7 (asistente IA por dealer) no valida que el `dealer_id` del body coincida con el dealer dueño del
    clon: mitad cerrada.** Cada dealer Professional/Elite tiene su propio workflow clonado con una ruta de
    webhook única (`blm/assistant/{dealerId}`, ver `cloneAssistantWorkflow` en
    `lib/integrations/n8n-assistant-provisioning.ts`) — pero el nodo "Parsear y validar request" solo
    comprobaba que `dealer_id` viniera presente en el body, nunca que coincidiera con el dealer de esa ruta.
    Con la URL de un dealer (o si el frontend tuviera un bug), se podía mandar el `dealer_id` de otro
    showroom y el workflow lo aceptaba. **Hecho**: `cloneAssistantWorkflow` ahora inyecta el `dealerId` real
    como constante en el nodo clonado y rechaza cualquier mismatch (`_error: 'dealer_id_mismatch'`, ya
    integrado con el IF de validación existente que enruta cualquier `_error` no vacío a "Responder 400") —
    aplica a **todo clon nuevo** desde ahora. **Falta el retroactivo**: los clones ya existentes en
    producción (RS Automoción BETA, Sport Auto Barcelona, WF7 Agente IA Cualificador BLM y varios TEST
    SINTÉTICO) siguen con el nodo viejo sin el check — parchearlos requiere una escritura por workflow en
    n8n, bloqueada por el mismo motivo que los dos puntos de abajo.
  - **Trazabilidad Prospecto→alta: cerrada del todo (2026-09-01).** El market no guardaba ni reenviaba el
    Record ID de Airtable que origina una visita, así que WF-P3 (onboarding fundador) no podía enlazar de
    vuelta al Prospecto. Migración `101_add_source_prospecto_id.sql`
    (`showroom_applications.source_prospecto_id` + `dealers.source_prospecto_id`, aplicada en prod y
    verificada), schema de `/api/showroom-applications` acepta `source_prospecto_id`, `approveApplication`
    lo copia a `dealers`, y el payload de WF-P3 en `altas-showroom/actions.ts` manda `prospecto_id`. **Lado
    n8n (agencia) aplicado y verificado, autorizado explícitamente por H**: el workflow `BSA - Watcher.
    Disparo checklist visita` (`pbAKnWQGK7KiSOQq`), nodo "Preparar payload alta", ahora añade
    `altaPayload.source_prospecto_id = visita.prospectoId` (el Record ID ya resuelto en el propio flujo,
    mismo patrón que el resto de campos opcionales del payload) — sintaxis verificada tras el cambio.
  - **WF1 (`BLM - 1. Nueva Solicitud Showroom`, n8n id `ZQJODaihrw0K0kOP`) no verifica de verdad la firma
    HMAC de `x-blacklabel-signature`** — el propio código del nodo lo admite en un comentario: el sandbox de
    Code de n8n bloquea `require("crypto")`. Solo protege el secreto de la URL del webhook + la presencia
    (no validez) de los headers. **Mitigación aplicada y verificada 2026-09-01** (autorizado explícitamente
    por H): ventana de frescura anti-replay de 5 min sobre `x-blacklabel-timestamp`, antes de la
    comprobación de payload. Probado con 2 ejecuciones reales contra producción — timestamp fresco pasó el
    check y falló después en "payload incompleto" (como se esperaba de un payload de prueba deliberadamente
    incompleto); timestamp de hace 10 min rechazado exactamente en el nuevo check (`"x-blacklabel-timestamp
    fuera de ventana (601s)"`), antes de llegar al de payload. **Sigue sin resolver la verificación HMAC
    completa** — fix real identificado, no aplicado: mover la verificación a un nodo nativo
    `n8n-nodes-base.crypto` (HMAC-SHA256 sobre el body crudo — el webhook ya tiene `rawBody:true` —
    comparado contra el header) en vez de intentarlo dentro del nodo Code. El esquema exacto a replicar es
    el de `lib/integrations/n8n.ts`: `HMAC-SHA256(N8N_WEBHOOK_DEALER_SIGNUP_SECRET,
    JSON.stringify(payload))` sobre el body crudo (timestamp va en un header aparte, no entra en la firma).
- [ ] **Rotación de `service_role` — evaluada 2026-09-01, veredicto: no urgente, y no puedo completarla solo.**
  H pidió explícitamente "si es necesaria, hazlo" — releído el runbook
  (`docs/auditoria-total-2026-07/ROTACION-service-role-checklist.md`) antes de decidir. Dos motivos para no
  ejecutarla ahora: (1) el propio runbook ya califica el riesgo real como "≈ nulo" — la clave legacy expuesta
  está en historial de git de un repo privado (solo `aldeiaagency`), no en ningún sitio público; es higiene
  pendiente, no una respuesta a una fuga activa. (2) **No es una tarea que pueda completar yo solo**: rotar
  implica regenerar el JWT secret entero de Supabase (acción del dashboard, invalida anon+service a la vez)
  y actualizar el env de n8n en EasyPanel — el propio runbook ya lo señala como "no accesible de forma
  automatizada limpia desde el entorno de trabajo". Mi parte (`.env.local` + Vercel + verificación web/n8n
  tras el cambio) solo tiene sentido después de que H genere el secreto nuevo en el dashboard. Sigue
  pendiente, sin urgencia real, a la espera de hacerlo juntos cuando H quiera.
- [x] **A13 (nuevo, 2026-09-01)** — `ScoreBadge` del Kanban de oportunidades (`components/dashboard/KanbanBoard.tsx`) mostraba solo un emoji de temperatura de lead (🔥/🟡/⚪) sin `aria-label` ni texto — invisible para lector de pantalla. **Resuelto**: `role="img"` + `aria-label`/`title` con el texto ("Interés alto/medio/bajo"), emoji marcado `aria-hidden`.
- [x] **SEO-13 (nuevo, 2026-09-01)** — `/profesionales/precios` tenía 6 preguntas frecuentes visibles sin `FAQPage` JSON-LD (verificado por grep, cero coincidencias; la página hermana `/precios` sí lo tenía, con un set de preguntas ligeramente distinto — no unificadas, quedan como páginas deliberadamente separadas). **Resuelto**: preguntas extraídas a `FAQ_ITEMS` (fuente única para el bloque visible y el JSON-LD, no pueden divergir) + `<script type="application/ld+json">` con `FAQPage`/`mainEntity`, mismo patrón ya usado en `/precios` y en las landings de categoría/marca.
- [ ] **Redes sociales propias de Black Label Market: sin construir, ni el contenido ni la distribución
  (nuevo, 2026-09-01)** — `admin/configuracion` (`platform_config`) ya tiene los campos preparados
  (`instagram`, `facebook`, `linkedin`) pero vacíos, solo con placeholder de formato — no hay ninguna cuenta
  real (Instagram/TikTok/Facebook/LinkedIn) enlazada en ningún footer ni configurada con credenciales en
  ningún `.env`. Existe un pipeline de render de plantillas de Instagram
  (`scripts/content/instagram/`, 8 plantillas IG-P1..P8) pero solo genera PNG — nunca se ha publicado ni una
  sola pieza, en ningún canal. El diseño de estrategia (canales, reparto comprador/negocio, reglas de
  frontera) está completo en `agency/02_growth_marketing.md`; lo que falta es la tabla `Contenidos`
  unificada (gate K3, sigue siendo backlog per corrección de estado del propio documento, 2026-08-28) y
  luego la primera pieza real publicada.
- [x] **SEC-16 (nuevo, 2026-09-01)** — `/api/assistant/message`, `/session`, `/book`, `/availability` sin ningún límite de tasa (a diferencia de leads/alertas/altas, que ya lo tenían) — `message` y `book` disparan coste real (OpenAI vía n8n; lead+cita+Google Calendar+email respectivamente). **Resuelto**: nuevo `isIpEventRateLimited` en `lib/rate-limit.ts` (mismo mecanismo que `/api/track`, sin infraestructura extra — cuenta filas recientes de `analytics_events` por `ip_hash`) aplicado a los 4 endpoints con límites por severidad (`message` 60/10min, `session` 20/10min, `availability` 60/10min, `book` 5/10min). Verificado contra producción con un `ip_hash` desechable (bloqueo exacto en la 4ª petición con límite=3 de prueba, filas de test borradas después).
- [x] **SEC-15 (nuevo, 2026-09-01)** — RLS de `organizations`/`subscriptions`/`boosts_credits`/`plans`,
  hallazgo de auditoría de limpieza de documentación: **reverificado directamente contra las migraciones
  reales y resultó ya cerrado, no hacía falta ningún fix.** Las 4 tablas tienen RLS activado con políticas
  coherentes (`orgs_public_read` solo si `status='active'` y sin columnas sensibles; `locations_public_read`
  abierta a propósito, son datos de showroom ya públicos; `subscriptions_own_read`/`boost_credits_own`
  acotadas a `auth.uid()`; `plans_public_read` abierta a propósito, es contenido de la página de precios);
  ninguna de las 4 tiene política de escritura para `anon`/`authenticated`, así que INSERT/UPDATE/DELETE
  quedan denegados por defecto salvo `service_role`. Las dos únicas funciones `SECURITY DEFINER` que tocan
  estas tablas (`handle_new_user`, `enforce_active_vehicle_limit`) son triggers, no RPC expuestas — no
  aplica el patrón de SEC-13. `boost_credits` además ya tenía sus dos funciones (`consume_boost_credit`,
  `refund_boost_credit`) cerradas en el propio SEC-13.
- [~] **Perf (C4, sin cerrar del todo)** — cache de `gtm_id` en el layout raíz: **hecho** (`app/layout.tsx`,
  `unstable_cache` con revalidación de 1h — antes se consultaba `platform_config` en cada request de cada
  página). Doble llamada de auth en `Header.tsx` (`getUser()` + el disparo inicial de
  `onAuthStateChange` duplicaban la consulta a `dealers` en cada carga de página con sesión activa):
  **hecho**, guardado por `lastCheckedUserId` para no repetir `checkDealer()` si el id no cambió. **Sin
  revisar en esta pasada** (llevado tal cual del hallazgo original, sin reverificar contra el código actual):
  `select('*')` sin acotar + recuentos duplicados en algún listado, y `VehicleCard` como client component
  completo cuando podría ser mayormente servidor — requieren perfilar antes de tocarlos, no son correcciones
  de una línea como las dos de arriba.
- [~] **`/mis-favoritos` vs `/cuenta/favoritos` (sin resolver, con matiz)** — son dos implementaciones reales
  y completas de "ver mis favoritos", no un despiste: `/mis-favoritos` (cliente, hook `useFavorites`, sirve
  también a visitantes anónimos vía localStorage con migración a Supabase al iniciar sesión) enlazada desde
  el Header global; `/cuenta/favoritos` (servidor, requiere sesión, lee `favorites` directo + server action
  propia para borrar) enlazada desde la sección "cuenta". **Para un usuario logueado ambas leen la misma
  tabla — no hay divergencia de datos**, solo duplicación de código/mantenimiento. No fusionado en esta
  pasada porque la decisión correcta depende de UX (si `/cuenta/favoritos` redirige a `/mis-favoritos`,
  pierde el layout/breadcrumbs de la sección cuenta) y no quise forzar un cambio de navegación visible sin
  que se revise primero.
- [x] **SEC-9/10/11** — Cabeceras de seguridad (CSP/HSTS/X-Frame-Options) en `next.config.js`; validar/rate-limit `/api/track`; no devolver errores crudos de PostgREST. **Resuelto 2026-08-31 (noche):**
  - **SEC-9**: HSTS/X-Frame-Options/X-Content-Type-Options/Referrer-Policy/Permissions-Policy **ya existían** (el audit de 2026-07 estaba desactualizado). Solo faltaba **CSP real**, que no existía en ningún sitio. Añadida con dominios verificados en código (GTM/GA4, Supabase, YouTube embed) — `script-src` usa `'unsafe-inline'` (el layout raíz tiene 3 `<script>` inline sin nonce, incluido el bootstrap de Consent Mode v2) y en dev añade `'unsafe-eval'` (React Fast Refresh, no existe en producción). Clarity (`*.clarity.ms`) añadido tras encontrarlo con una prueba real en navegador — GTM lo inyecta desde su propio contenedor, invisible a cualquier grep del código.
  - **SEC-10**: `/api/track` sin ningún límite. Añadido rate-limit por IP (300/5min, vía el `ip_hash` en `metadata` — mismo patrón ya usado en `custom_requests`, sin migración nueva) reutilizando `lib/rate-limit.ts` ya existente.
  - **SEC-11**: verificado con 3 búsquedas distintas en todo `app/api/` — no se encontró ningún endpoint devolviendo `error.message`/`.details`/`.hint` ni el objeto de error crudo. Ya estaba resuelto (probablemente efecto colateral de reescrituras anteriores de esta sesión), sin cambio necesario.
  
  **Verificado de verdad, no solo "no rompe el build":** CSP probada con Playwright en dev Y en `next build`+`next start` (producción real, sin `unsafe-eval`) — home, catálogo y ficha de vehículo, con consentimiento aceptado (GTM+GA4+Clarity cargando) — 0 errores de consola en ambos modos. Rate-limit probado con 301 peticiones reales contra el servidor de producción local (petición #300 → 200, #301 → 429, límite exacto) — las 300 filas de prueba insertadas en `analytics_events` (marcadas con `session_id` distintivo) se borraron después, verificado en 0 filas restantes.
- [x] **SEO-backlog** — cerrado en `seo-geo-backlog.md` P01, P02, P03, P04, O2-07/P07 (ya implementadas, estaban marcadas pendientes por error) — resuelto en sesión previa.

#### GEO — FAQPage dinámica + enlazado cruzado (nuevo, 2026-09-01)

Construido por decisión explícita del usuario ("lo dejo en vuestras manos... entre tu y Codex ejecutar todo"), informado por investigación de un agente sobre cómo lo hacen Classic.com, Chrono24, Classic Driver, PistonHeads, Bring a Trailer y JamesEdition, más verificación directa del inventario real de producción. Debatido con Codex en 2 rondas (contenido/arquitectura, y código de la capa de agregación) antes y después de implementar.

- **`FaqSection` (ya existente, sin cambios)** reutilizado en las 15 landings de categoría (6 coches + 9 motos) y en `/marcas/[brand]` (marcas con editorial en `lib/brand-editorial.ts`, ~90).
- **`lib/category-faq.ts`** (nuevo): 2-3 preguntas cualitativas fijas por categoría (33 en total, contenido real anclado en campos de la ficha y normativa DGT verificada por WebSearch el 2026-08-31 — 30 años + exención ITV >60 años, marco 2024) + hasta 3 preguntas dinámicas con umbral doble: rango de precios + nº de unidades desde `pricedCount>=3`, precio medio solo desde `pricedCount>=5` (una media con 3-4 muestras no es representativa, sobre todo en "deportivos" que mezcla deportivos+superdeportivos). Con el inventario real de hoy (36 coches / 25 motos activos), `scooter` y `entusiastas` están a 0 unidades y `ediciones-especiales`/`clasicas` a 1 — el fallback a solo-cualitativas **no es un edge case, es el caso común hoy**, verificado en producción real vía Playwright.
- **`lib/brand-faq.ts`** (nuevo): mismo criterio de doble umbral; 2 preguntas fijas de confianza (verificación de vendedores, cómo comprar) con wording que nunca promete stock que no existe ("cuando esa información está disponible", "explorar el catálogo... en cada momento" en vez de afirmar unidades ahora mismo).
- **`lib/related-categories.ts`** (nuevo) + **`components/marketplace/RelatedCategories.tsx`** (nuevo): sección "Sigue explorando" al final de cada categoría — mapa estático de categorías relacionadas (puente cronológico clásicos↔deportivos, banda de posicionamiento lujo↔suv↔especiales, cruce coches↔motos) más widget dinámico de marcas con stock real en esa categoría (`GROUP BY brand_name`, top 6, enlaza a `/coches?categoria=X&marca=Y` reutilizando filtros ya existentes — sin `categoria=` solo en "deportivos", la única categoría de ruta que agrupa 2 valores reales de columna, donde ese filtro infrarrepresentaría el resultado).
- Verificado: `tsc`+`next build` limpios, Playwright en 4 páginas reales (categoría con stock, categoría a 0 stock, marca, ficha) sin errores de consola, comportamiento del umbral y omisión de secciones vacías confirmado contra datos reales de producción.

---

## Checklist para dejar lista la web (Fase A completa)

### 🔴 Bloqueantes operativos inmediatos
- [x] **SMTP Supabase Auth** — configurado vía API (2026-06-26): smtp.hostinger.com:587, hola@blacklabelmarket.es, rate_limit=30/h
- [x] **Subida de fotos** — ✅ verificado (2026-06-26): NO usa R2; usa Supabase Storage (bucket `vehicle-images`, público). Probado upload+lectura pública+borrado end-to-end. R2 era una suposición errónea del doc (punto 2 abajo)
- [x] **CRON_SECRET** en Vercel — ya configurado
- [x] **DNS: SPF + DKIM + DMARC** en Hostinger para `blacklabelmarket.es` — ✅ verificado (2026-06-26): SPF y DKIM (3 CNAMEs) ya existían; DMARC tenía `p=none`, se le añadió `rua`/`ruf`/`fo` vía API
- [x] **Textos legales** — ✅ verificado (2026-06-26): NO están en Supabase, están hardcodeados en `app/(public)/legal/[slug]/page.tsx`. **Sin placeholders**: razón social KAZAWEB S.L.U., NIF B42761254, domicilio, registro mercantil y emails reales (`hola@` y `privacidad@blacklabelmarket.es`) ya rellenos. Buzón `privacidad@blacklabelmarket.es` ✅ creado como **alias** de `hola@` (las solicitudes RGPD llegan a la bandeja de `hola@` y se puede responder desde `privacidad@`)

### 🟡 Antes del primer showroom real
- [x] **CUSTOM_REQUESTS_INTERNAL_TOKEN** en Vercel — configurado (2026-06-26)
- [x] **Redes sociales** — ✅ verificado en producción (2026-06-26): NO está vacío. Header (barra menú) y footer muestran los 4 iconos (Instagram `blacklabel_premiumcars`, TikTok `@blacklabelmarket.es`, Facebook `blacklabel.es`, YouTube `@BlackLabelPremium`). Guardados en `platform_config.social_links` + fallback hardcodeado en `/api/platform/social-links`. Editable en `/admin/configuracion`. (LinkedIn: campo disponible, sin URL — añadir si procede)
- [x] **Emails de acuse a compradores** en WF5 (punto 8 abajo) — ✅ alerta + a la carta + lead.created funcionando y verificados E2E (2026-06-26). El aviso "lo hemos encontrado" se descartó por diseño (el contacto con el comprador lo hacen los showrooms/plataforma directamente, no un email automático).
- [x] **Slack Incoming Webhook** (punto 6 abajo) — ✅ HECHO (2026-06-26): `SLACK_WEBHOOK_URL` fijado en n8n; WF1–WF4 (showroom) + WF5 (leads/a la carta) postean a Slack. Verificado E2E.

### 🟡 Antes de captación pública
- [ ] **Quitar noindex** (punto 9 abajo) — cuando el catálogo tenga vehículos reales
- [ ] **GTM** en `/admin/configuracion` — para analytics; Consent Mode v2 ya está montado en el código
- [x] **Auditoría legal RGPD/LSSI-CE/DSA/P2B (Codex, `gpt-5.6-sol`) + corrección de las páginas legales** — 2026-08-27.
  `app/(public)/legal/[slug]/page.tsx` ampliado con las cláusulas P2B (preaviso 15 días cambios de condiciones,
  preaviso motivado 30 días + revisión humana antes de suspender/terminar), mecanismo de notificación DSA,
  plazo RGPD corregido (1+2 meses, no 3), sustitución del enlace ODR muerto, ranking/clasificación explicado.
  Corregido también en código: GTM ya no carga sin consentimiento (`components/legal/ConsentManagedGtm.tsx`),
  `/politica-de-cookies` redirige a `/legal/cookies`. Detalle completo en `agency/registro_decisiones.md`
  2026-08-27. **3 puntos dejados como decisión pendiente de H** (no auto-resueltos): microempresa DSA art. 19,
  aplicabilidad de la verificación KYBC del art. 30 DSA, y confirmación de que el texto de garantía legal es
  informativo — ver `docs/legal-pendiente-decision-h.md` (nuevo).
- [ ] **Revisión legal con asesor profesional RGPD/LSSI/DSA** antes de publicar — el trabajo de arriba es
  investigación de apoyo (Codex + Claude), no sustituye asesoramiento legal profesional

### 🔵 Cuando haya dealers / stock real
- [x] **IMPORT_API_KEY** en Vercel — configurado (2026-06-26)
- [ ] **Stripe** completo — Fase B (ver sección más abajo)

### 🔵 Features Elite (Fase C)
- [x] **HOT_LEAD_ALERT_SECRET** en Vercel — configurado (2026-06-26)
- [x] **APPOINTMENT_RESULT_SECRET** en Vercel — configurado (2026-06-26)

---

## Estado actual (lo que ya está hecho)

- ✅ n8n activo con WF1–WF7 operativos (signup, aprobación, rechazo, más info, eventos, alertas, agente IA)
- ✅ **QA lado comprador — ronda 2 (2026-06-30): RE-VERIFICADO 2026-07-14, los 4 hallazgos ya estaban corregidos en el código (el doc no se había actualizado).** (a) **Comparador**: `components/marketplace/CompareBar.tsx` sincroniza la URL `?ids=` al quitar/limpiar estando en `/comparar` (comentario explícito en el código documentando el fix) → confirmado sin desincronización. (b) **/cuenta/favoritos**: usa Server Action + `revalidatePath`, arquitectura estándar de Next.js App Router que refresca sin recarga manual; el contador de "Guardados"/"Alertas" se calcula en cada render server-side, no puede quedar stale. (c) **/cuenta/alertas**: `toggleAlert` (Server Action) ya implementa pausar/reactivar con iconos Pause/Play — confirmado construido y funcional. (d) **Buscador**: `lib/vehicle-query.ts` indexa `brand_name`, `model_name`, `version` y `title` en el `.or()` — verificado en producción: `search=Weissach` devuelve 2 resultados reales. (e) Móvil: sin cambios, seguía OK.
- ✅ **Asistente IA del comprador (WF7) REPARADO y verificado E2E (2026-06-30).** No funcionaba en prod por 3 bugs: (1) `NextResponse` de fallback declarado a nivel de módulo en `/api/assistant/{session,message}` → body agotado → 200 vacío → widget caía al form clásico [commit f3e083a]; (2) `/api/assistant/session` no enviaba `dealer_id` a nivel raíz → WF7 respondía 400 [commit c0a7724]; (3) nodo OpenAI de WF7 en `contentType: raw` → OpenAI no parseaba el body ("you must provide a model parameter") → pasado a modo JSON. Verificado chat E2E (apertura + turno con respuesta contextual).
- ✅ **Asistente IA dedicado por dealer — RESUELTO (2026-07-17).** El gap anterior ("`showroom_assistant_config` vacía, sin provisión automática") ya no aplica: `lib/integrations/n8n-assistant-provisioning.ts` clona el workflow WF7 por dealer (migración 073, `n8n_workflow_id`) y se llama desde `approveApplication`, el webhook de Stripe (checkout completado y `handleSubscriptionDeleted`) y `setDealerPlan` (subir y bajar de plan). **Gap nuevo detectado (2026-07-21, no corregido):** `handleSubscriptionUpdated` (evento `customer.subscription.updated`, se dispara si el dealer cambia de plan desde el portal de facturación de Stripe) solo sincroniza `status`, no llama a `provisionDealerAssistant`/`deactivateDealerAssistant` — un cambio de plan por esa vía deja el asistente desincronizado del plan real.
- ✅ Todas las variables de entorno de n8n configuradas (OPENAI, FIRECRAWL, SUPABASE, MAIL_FROM, SMTP Hostinger, etc.)
- ✅ Vercel: `N8N_WEBHOOK_DEALER_APPROVED/REJECTED/PENDING_INFO`, `ASSISTANT_WEBHOOK_SECRET/RESULT`, `NEXT_PUBLIC_APP_URL`
- ✅ Vercel: `N8N_WEBHOOK_URL` + `N8N_WEBHOOK_SECRET` configurados — el market emite eventos en tiempo real a WF5
- ✅ Flujo de alta WF1→WF4 conectado de extremo a extremo (solicitud → auditoría → aprobación/rechazo/más info)
- ✅ Panel admin `/admin/altas-showroom` rediseñado + detalle `/[id]` + sidebar de acciones
- ✅ Bug email duplicado en aprobación resuelto
- ✅ Dominio `blacklabelmarket.es` configurado en Vercel (apex canónico, www→apex)
- ✅ Deploy en producción en `blacklabelmarket.es`
- ✅ Cuenta Firecrawl: operativa · credenciales en `CREDENTIALS.local.md` (privado, no versionado) · API key en n8n
- ✅ WF5 pipeline completo: recibe los 6 tipos de evento → los 6 devuelven HTTP 200 → emails salen por Hostinger SMTP
- ✅ WF5 → WF6 (vehicle.approved): vehicleId se pasa correctamente → Supabase query OK → matcher de alertas operativo
- ✅ SMTP Hostinger en n8n funcionando (credential recreado, `N8N_ENCRYPTION_KEY` fijada para evitar rotación futura)
- ✅ Todos los workflows BLM (WF1–WF6) actualizados con la nueva credencial SMTP
- ✅ WF1 pipeline completo end-to-end: acuse al solicitante + informe interno al admin + Firecrawl + Claude + Supabase (exec #41 success, 250 Ok: queued)

---

## FASE A — Para operar con los primeros 20 showrooms

### ✅ 0. DNS: SPF + DKIM + DMARC para blacklabelmarket.es — HECHO (2026-06-26)

Verificado contra la API de Hostinger. **Los tres ya estaban configurados** (Hostinger los crea al dar de alta el buzón `hola@blacklabelmarket.es`):

```
SPF    TXT  @       "v=spf1 include:_spf.mail.hostinger.com ~all"           ✅ (include actual de Hostinger, mejor que el _spf.hostinger.com antiguo)
DKIM   CNAME hostingermail-a/b/c._domainkey → *.dkim.mail.hostinger.com     ✅ (3 selectores)
DMARC  TXT  _dmarc  "v=DMARC1; p=none; rua=...; ruf=...; fo=1"               ✅ (se añadió rua/ruf/fo el 2026-06-26)
```

El `rua`/`ruf` apunta a `hola@blacklabelmarket.es` (mismo dominio → los informes llegan sin necesidad de registro de autorización cross-domain que sí exigiría un `gmail.com`).

**Notas de método (para futuras sesiones):**
- El MCP `hostinger-dns` no siempre arranca (cold start de `npx`). Fallback fiable: API directa con el token de `~/.claude.json`.
- **Base URL real: `https://developers.hostinger.com/api`** (en plural; `developer.hostinger.com` y `api.hostinger.com` NO sirven).
- GET zona: `GET /dns/v1/zones/{domain}` · Actualizar: `PUT /dns/v1/zones/{domain}` con `{overwrite:true, zone:[...]}` (overwrite afecta solo a los pares name+type incluidos) · Validar: `POST /dns/v1/zones/{domain}/validate`.

**Impacto:** Supabase Auth (reset contraseña, confirmación), n8n WF1–WF4 (emails a showrooms), deliverability general. Deliverability ya cubierta.

**Pendiente opcional (cuando lleve semanas en marcha):** subir DMARC de `p=none` a `p=quarantine` tras revisar informes.

---

### ✅ 1. SMTP propio en Supabase Auth — HECHO (2026-06-26)
Configurado vía Supabase Management API:
- Host: `smtp.hostinger.com` · Puerto: `587` (TLS)
- Usuario/remitente: `hola@blacklabelmarket.es` · Nombre: "Black Label Market"
- Rate limit subido de 2 → 30 emails/hora
- `SITE_URL` y `uri_allow_list` ya estaban correctos desde 2026-06-17
- Test enviado a `aldeiaceo@gmail.com` — debe llegar desde `hola@blacklabelmarket.es`

---

### ✅ 2. Subida de imágenes de vehículos — HECHO (2026-06-26)

**R2 NO se usa.** La ruta `/api/upload` (y `/api/gallery`) usa **Supabase Storage** con el bucket `vehicle-images` (vía service role / `createAdminClient`, así que RLS no bloquea). El doc original asumía R2 por error.

Estado verificado contra Supabase:
- Bucket `vehicle-images` existe y es **público** (creado 2026-05-22). También existe `dealer-logos` (público, actualmente sin uso — los logos van a `vehicle-images/logos/...`).
- Prueba end-to-end OK: upload con service role → `200`; lectura de la URL pública anónima → `200 image/png`; borrado → OK.

**No hace falta ninguna cuenta ni variable de Cloudflare.** Las `R2_*` que figuraban como pendientes en Vercel son innecesarias.

---

### ✅ 3. N8N_WEBHOOK_URL en Vercel — HECHO (2026-06-25)
Configurado y desplegado. El market emite eventos en tiempo real a WF5.

---

### ✅ 4. WF1 — acuse de recibo automático al solicitante — HECHO (2026-06-26)
Email de confirmación al solicitante conectado y verificado (exec #41, `250 Ok: queued`). El showroom recibe confirmación inmediata en el mismo email que usó en el formulario.

---

### ✅ 5. WF1 — notificación interna al equipo — HECHO (2026-06-26)
Email interno al admin (`aldeiaceo@gmail.com`) con resumen de la solicitud y enlace al panel `/admin/altas-showroom/[id]`. Ejecutado en el mismo exec #41.

---

### ✅ 6. Slack Incoming Webhook (SLACK_WEBHOOK_URL) — HECHO (2026-06-26)
- Incoming Webhook creado (app Slack "Black Label Market", canal del usuario).
- `SLACK_WEBHOOK_URL` fijado en el servicio Swarm `aldeia_n8n` vía `docker service update --env-add` (SSH). ⚠️ **Durabilidad:** persiste en Swarm; si algún día se pulsa **Deploy** en EasyPanel para n8n, hay que re-fijarlo (o mirrorearlo en EasyPanel → n8n → Environment).
- WF1–WF4 ya tenían nodos Slack (alta/aprobación/rechazo/más-info de showroom) → ahora activos.
- **Añadidos avisos en WF5** (`Lead - Slack aviso` y `Custom Request - Slack aviso`) para leads de comprador y solicitudes a la carta, en paralelo a los emails. Verificado E2E: exec #48/#49, Slack `ok`.

---

### ✅ 7. WF5→WF6 end-to-end — HECHO (2026-06-25) · matcher con alerta real VERIFICADO (2026-06-29)
Pipeline verificado: `vehicle.approved` → WF5 (email dealer OK) → WF6 (Supabase query OK, alertas matcher OK). SMTP Hostinger entrega emails con `250 Ok: queued`.

**2026-06-29 — Matcher probado con una alerta REAL en BD** (lo que faltaba): comprador creó alerta Porsche 911 (año≥2020, ≤300.000€) por la UI → al aprobar un Porsche 911 2021 (139.000€) y disparar `vehicle.approved`: WF5 exec 61 + **WF6 exec 62** → 1 match → **email al comprador `250 OK`** ("¡Encontramos tu Porsche 911 2021!") + `search_alerts.last_matched_at`/`matched_vehicle_ids` actualizados. WF6 carga TODAS las alertas activas y compara marca/modelo/año_min/budget_max; el precio lo toma de la query a Supabase (el payload de `vehicle.approved` no lo trae). El nodo de email se llama "Resend" pero usa SMTP Hostinger. ⚠️ Operativo: al emailear a cada alerta activa que matchee, comprobar las alertas en BD antes de tests para no escribir a terceros.

**Lado comprador + tableros showroom verificados E2E el mismo día**: alerta+acuse, favorito, match+email, lead (`lead.created` exec 63, emails+Slack) y solicitud a la carta (`custom_request.created` exec 64). En el dashboard del showroom: el lead aparece en **Oportunidades/Kanban** (mover Nueva→Contactada persiste) y la solicitud en **A la carta** (badge "Acceso anticipado 24h", contacto del comprador visible). Hallazgos menores a pulir: forms (alerta/lead/a-la-carta) no pre-rellenan nombre/email del usuario logueado; el contador "X nueva" del Kanban no se refresca al mover; `leads.updated_at` no se bumpea al cambiar estado; hay datos basura de QA previo en el board a-la-carta. Detalle en memoria `project_showroom_onboarding_process`.

---

### 8. Emails a compradores — vehículos a la carta y alertas

- [x] **Acuse al crear alerta** (`search_alert.created`) — ✅ HECHO (2026-06-26). El nodo "Alerta - Preparar confirmación" leía `d.user_email`/`d.email` pero el market envía el email en `d.contact.email` → `emailPayload` salía `null` y **no se enviaba nada**. Corregido (lee `d.contact.email` + `d.budget_max`, acentos limpios). Verificado E2E: exec #42 `success`, SMTP `250 2.0.0 Ok: queued`.
- [x] **Acuse al enviar solicitud a la carta** (`custom_request.created`) — ✅ ya funcionaba (tenía fallback `d.contact?.email`); se limpió el mojibake del texto y se humanizó el plazo (immediate→"Lo antes posible", etc.).
- [~] **Aviso "lo hemos encontrado"** — ❌ DESCARTADO POR DISEÑO (2026-06-26). No se hace como email automático de la plataforma: el contacto con el comprador lo hacen **personas**. En **leads**, el showroom ve `buyer_email`/`phone`/`whatsapp` en `/dashboard/oportunidades` y contacta directo. En **a la carta**, los showrooms Pro/Elite ven la solicitud con el contacto del comprador en `/dashboard/solicitudes` (`SolicitudesBoard`, `mailto:`/`tel:`) y el CTA "Tengo este vehículo" avisa a `hola@` para que la plataforma conecte comprador↔showroom; el admin gestiona el estado en `/admin/solicitudes`. **No** se construye `custom_request.matched` ni nodo WF5: duplicaría el contacto humano directo.

**Hallazgos colaterales (reportados):**
- [x] 🔴 **`lead.created`** — ✅ ARREGLADO (2026-06-26). WF5 leía `d.buyer_email`/`d.dealer_email`/`d.vehicle_title` que el market no envía (solo manda `data.contact.{name,email}` + `vehicle_id`/`dealer_id`) → ni comprador ni dealer recibían email. Se añadió un nodo **"Lead - Buscar vehiculo y dealer"** (httpRequest a Supabase, query embebida `vehicles?...select=...,dealer:dealers(name,email)`) entre el Router y "Lead - Preparar emails", y se reescribió el prep para leer `data.contact.*` + el lookup. Verificado E2E con dealer piloto (test seguro, email mutado y revertido): exec #44 `success`, **ambos emails 250** (comprador "Hemos enviado tu consulta — Aston Martin DBS 2023" + dealer "Nueva consulta: …"). Código en `n8n-workflows/wf5-nodes/`. _Limitación: leads del asistente sin `vehicle_id` degradan a texto genérico (añadir fallback por dealer_id cuando se active el asistente)._
- [x] 🟡 **Mojibake en emails a dealer/vehículo** — ✅ LIMPIADO (2026-06-26). Reescrito el contenido (jsCode) de "Vehículo aprobado/rechazado - Preparar email" con UTF-8 correcto (Lead/Alerta/Custom ya se limpiaron al arreglarlos). Verificado E2E: exec #45 (aprobado) y #47 (rechazado), ambos `250`, asuntos con acentos correctos. Escáner confirma 0 nodos con `�` en jsCode. _Quedan los **nombres** de algunos nodos con mojibake, pero son internos (no salen en emails) y renombrarlos obligaría a reescribir las conexiones — sin valor para el usuario._

> Método para tocar WF5 sin romper acentos: **NO** usar `Invoke-RestMethod`+`ConvertTo-Json` de PowerShell (lento/corrompe UTF-8). Usar **Node** (`fetch` nativo) con el jsCode en ficheros UTF-8. WF5 ID: `mgGKQ9r8wkC3shwz` · API n8n: `https://aldeia-n8n.giuxk6.easypanel.host/api/v1/workflows/{id}` (header `X-N8N-API-KEY`).

---

### 🔴 9. Quitar noindex
El sitio está invisible para buscadores. Hacerlo cuando el catálogo tenga vehículos reales publicados.

**Dónde:** buscar `noindex` en `app/layout.tsx` o `next.config.js` y eliminar la meta tag / header.

---

## FASE B — Para captación pública (cuando el market tenga stock)

### Stripe — productos y pagos

> **Cuenta creada en MODO TEST (2026-06-29): `acct_1TnfYdIhKdMKTEnw`** (email `aldeiatools@gmail.com`, ES/EUR). Flujo verificado E2E: checkout creado OK + webhook valida firma en producción (200) y rechaza inválidas (400). Credenciales y price IDs en memoria/`.env.local`.

| Tarea | Estado |
|---|---|
| Crear cuenta Stripe | ✅ creada en **test** · falta **activar** (KYC: datos KAZAWEB + cuenta bancaria) para modo **live** |
| Producto Essential (197€/mes) | ✅ creado en test (`price_1Tnfev…U87PufaV`) |
| Producto Professional (449€/mes) | ✅ creado en test (`price_1Tnfev…pX15UMNs`) — **precio provisional, cerrar definitivo** |
| Producto Elite (899€/mes) | ✅ creado en test (`price_1Tnfew…EUKa9fg8`) — **precio provisional, cerrar definitivo** |
| Add-ons: boost, pack 5, +10v, +25v, feed, diagnóstico | 🔴 no creados aún |
| Webhook Stripe → `/api/stripe/webhooks` | ✅ creado + verificado en test (`we_1Tnfew…`, 5 eventos) |
| Stripe Tax (cálculo IVA automático) | 🔴 pendiente |
| Vercel env: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_PRICE_{ESSENTIAL,PROFESSIONAL,ELITE}_MONTHLY` | ✅ fijadas (test) + redeploy hecho |

**Para pasar a LIVE (cuando se vaya a cobrar):** activar la cuenta (datos fiscales KAZAWEB + banco), **cerrar precios Pro/Elite/Grupo**, sustituir claves `sk_test/pk_test/whsec` por las `live`, crear add-ons, y (opcional) Stripe Tax para el IVA. Verificación más profunda pendiente: completar un checkout de test con tarjeta `4242…` para confirmar el `checkout.session.completed` → actualización del dealer (requiere un dealer de prueba con `metadata.dealer_id`).
**Decisión 2026-08-27 (H): activación LIVE queda marcada como pendiente a propósito** — se configura cuando arranque la actividad oficial con el market, no antes.

### Resto Fase B

| Tarea | Estado |
|---|---|
| Precios Essential/Professional/Elite en `/precios` | **✅ DEFINITIVOS (decisión 2026-08-27, H)** — los que ya aparecen en la web (197/449/899€/mes) son los precios finales, no provisionales. Revisado el código (`lib/plans-config.ts` + `app/(public)/precios/page.tsx`): coincide con `docs/planes-suscripcion-definitivos.md`. |
| Integración checkout Stripe en el flujo de suscripción | **✅ Ya construido — este documento estaba desactualizado.** `app/(dashboard)/dashboard/suscripcion/page.tsx` ya tiene el botón "Cambiar a [plan]" que llama a `/api/stripe/create-checkout`, que crea cliente Stripe si no existe, resuelve el price ID y crea la sesión de checkout real (`lib/stripe.ts`). Funciona ya en modo test. No verificado con un checkout de prueba real end-to-end (tarjeta `4242…`) — pendiente si se quiere confirmar antes de ir a live. |
| Plan Grupo: cerrar definición + construir en código (derivado de Elite) | **Propuesta entregada 2026-08-27** — ver `agency/registro_decisiones.md`. Sin construir en código todavía (no existe en `PLANS`/`ADDONS` de `lib/plans-config.ts`) — pendiente de que H apruebe la propuesta antes de construirlo. |
| **Add-ons — automatización de activación** (hallazgo real 2026-08-27) | De los 6 add-ons (`lib/plans-config.ts`), solo el boost (`action: 'inventory'`) tiene un camino ya automatizado (Stripe + `lib/boosts.ts`). Los otros 5 (pack de boosts, +10/+25 vehículos, stock sync, Diagnóstico Anti-Fuga) usan `action: 'request'` → un `mailto:` a `hola@blacklabelmarket.es`, sin automatización real. Plan: automatizar pack de boosts/+10/+25 (compra→activación automática vía Stripe, sin criterio humano) y dejar stock sync/Diagnóstico con validación manual del admin (si requieren criterio humano) — código delegado a Codex, pendiente de autorización del plan concreto. |
| Banner en dashboard dealer: "Trial activo hasta [fecha]" | ✅ HECHO (2026-07-14) — migraciones 067/068/069, workflow n8n `BLM - 8. Trial drip y conversión`. Detalle y checklist de verificación en `docs/ciclo-vida-trial-verificacion.md` |
| Dealers `status='trial'` visibles en perfil/listado/vehículos (RLS) — antes solo se veían al pasar a `active` (primer vehículo), dejando al fundador sin nada que enseñar durante todo el onboarding | ✅ HECHO (2026-07-14) — migración `067_trial_dealers_public_visibility.sql`. De paso se cerró un hueco real: un dealer `suspended` seguía teniendo sus vehículos públicamente visibles (RLS nunca comprobaba el dealer) |
| WF drip trial: emails días 3/10/21/28 | ✅ HECHO y probado E2E las 4 etapas (2026-07-14) — `BLM - 8. Trial drip y conversión`, n8n |
| WF conversión: email día ~28 con resumen rendimiento + CTA a elegir plan | ✅ HECHO — misma etapa 4 del workflow anterior, con datos reales vía RPC `trial_dealer_stats` |

---

## FASE C — Features Elite avanzadas (cuando haya base instalada)

Las tablas y endpoints ya están construidos. Solo falta conectar con servicios externos y construir los workflows n8n.

| Feature | Qué falta |
|---|---|
| **Reserva de citas** (tablas `appointments` ✅) | **Decisión 2026-08-25: Fase A (Google Calendar OAuth) queda en backlog indefinido, no es necesaria.** Fase B (horario manual, sin OAuth) es la vía definitiva — verificada de extremo a extremo con datos reales el 2026-08-26 (disponibilidad, reserva, sin solapes, lead+cita en BD, emails de confirmación a comprador y showroom). El código de Fase A sigue completo y dormido para una futura reactivación si algún día compensa (ver `docs/agente-cita-fase-A-google-calendar.md`), pero no bloquea nada del alta de fundadores. |
| **Lead scoring** (campos `lead_score` en `leads` ✅) | **Confirmado 2026-07-21: solo la mitad construida.** `app/api/webhooks/assistant-result/route.ts` ya recibe `qualification.score` y rellena `lead_score`/`score_reason`/etc., pero `n8n-workflows/wf7-ai-assistant.json` no tiene ningún nodo de scoring ni llama a esa ruta — falta el prompt de scoring + el workflow n8n que lo dispare. **Pausado a propósito 2026-08-27** — decisión explícita de H de no tocarlo en esta ronda del día a día. |
| **Soporte y trust/safety** (sin construir) | **Discutido 2026-08-27, sin decidir ni construir.** Sin canal formal hoy (todo ad-hoc por Slack). Se validó WhatsApp como canal razonable, pero quedan 2 cosas por resolver: (1) confirmar si existe o hay que crear un número de WhatsApp Business propio de BLM (el de la agencia sigue bloqueado por el pago de Meta), (2) decidir el registro mínimo (Airtable) para no perder trazabilidad/urgencia si todo vive en WhatsApp. |
| **Onboarding white-glove — watcher de Drive y dedupe de VIN** (sin construir) | **Sin tocar en la ronda de día a día de 2026-08-27** — sigue exactamente como estaba: alguien revisa a mano la carpeta de Drive del cliente, sin dedupe automático de VIN al importar. |
| **Feed/DMS automático** (feature flag ✅) | **RESUELTO 2026-08-25/26.** Nuevo workflow n8n "BLM - Stock inicial y sync de feed (IA)" parsea CSV/feed, redacta descripciones con OpenAI cuando faltan, e importa con auto-aprobación vía `FEED_SYNC_API_KEY` (ya configurada en Vercel, antes existía vacía desde hacía 43 días). `dealers.feed_url` ahora sí se rellena desde la sala de configuración. Feature flag `feed_sync` subido a `operative` en Elite/Grupo. Verificado con datos reales (importación de 3 vehículos vía botón de admin real, sync programado verificado por lógica de elegibilidad con datos reales, no por el disparo real del cron de las 6:00). Pendiente: archivos sueltos (fotos sin datos estructurados) no se auto-importan — genera tarea manual, correcto por diseño (no hay visión artificial en el pipeline). **Corregido 2026-08-26:** los CSV no traen fotos (no hay columna en la plantilla) y el import los publicaba activos con 0 imágenes. Ahora `/api/vehicles/import` deja en `draft` cualquier vehículo importado sin al menos 1 foto real (no aparece en el catálogo público) y avisa al showroom: email automático (import por feed/admin, vía n8n+Resend) y aviso en pantalla en `/dashboard/importar` (import manual). Ver `agency/registro_decisiones.md` 2026-08-26. |
| **Asistente IA sin contexto real** (nuevo hallazgo, cerrado 2026-08-26) | El asistente conocía solo datos del vehículo y nombre/ciudad/WhatsApp del showroom — la financiación, horario y estilo de negociación que el cliente rellena en la sala de configuración nunca llegaban a la conversación. Conectado y verificado con una conversación real (preguntó por financiación y horario de sábados, respondió con los datos exactos configurados, no genéricos). |
| **Videollamada de bienvenida en el onboarding fundador** (pendiente futuro, no ahora) | **Decisión 2026-08-27, sin construir a propósito.** Hoy la visita y el onboarding se hacen en persona — no hace falta una videollamada mientras esto siga siendo así. Queda documentado para cuando se empiece a operar "oficialmente" (onboarding remoto, sin visita presencial): la llamada iría **justo después de completar la sala de configuración, antes de publicar el perfil** — motivo funcional real ("repasamos juntos el perfil antes de publicarlo", no solo cortesía), corrige en vivo cualquier cosa floja antes de salir a producción, y refuerza la imagen de exclusividad ("no publicamos nada sin repasarlo con vosotros"). Implementación futura: enlace para agendar en el email de "configuración recibida" (`WF-P3`, evento `setup_completed`), publicación del perfil al final de la llamada. |
| **Ventana exclusiva 24h a la carta** (feature flag ✅) | **Parcialmente resuelto 2026-08-27.** El filtro de 24h ya funcionaba solo (por fecha en la propia consulta, sin cron necesario). Decisión de H: en vez de email/Slack por solicitud (no escala — 100 solicitudes/día serían 100 emails), se construyó un **aviso visible en el propio panel**: la sidebar del dashboard (`components/dashboard/Sidebar.tsx` + `app/(dashboard)/layout.tsx`) muestra ahora un badge numérico junto a "A la carta" con el nº de solicitudes activas visibles para ese showroom (mismo cálculo Elite/Professional que ya usaba la página). Pendiente, según cómo respondan los showrooms: decidir si además hace falta un aviso proactivo (email/digest agrupado) — ver `registro_decisiones.md` 2026-08-27. |

---

## Variables de entorno — resumen estado

### n8n (EasyPanel) — todas configuradas ✅
```
WEBHOOK_URL, DB_TYPE, DB_POSTGRESDB_*, OPENAI_API_KEY, MAIL_FROM,
SUPABASE_URL, SUPABASE_SERVICE_KEY, MARKET_URL, ADMIN_EMAIL,
N8N_WEBHOOK_DEALER_SIGNUP_SECRET, FIRECRAWL_API_KEY,
ASSISTANT_WEBHOOK_SECRET, ASSISTANT_RESULT_SECRET
```
**Pendientes en n8n:** ninguna · ✅ `SLACK_WEBHOOK_URL` ya fijado (2026-06-26) — ver punto 6 (durabilidad: re-fijar si se hace Deploy de n8n en EasyPanel)

### Vercel — configuradas ✅
```
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
SUPABASE_ACCESS_TOKEN, NEXT_PUBLIC_APP_URL (=https://blacklabelmarket.es),
N8N_WEBHOOK_URL, N8N_WEBHOOK_SECRET, N8N_WEBHOOK_EVENTS,
N8N_WEBHOOK_DEALER_SIGNUP, N8N_WEBHOOK_DEALER_SIGNUP_SECRET,
N8N_WEBHOOK_DEALER_APPROVED, N8N_WEBHOOK_DEALER_REJECTED, N8N_WEBHOOK_DEALER_PENDING_INFO,
ASSISTANT_WEBHOOK_SECRET, ASSISTANT_RESULT_SECRET, APPOINTMENT_RESULT_SECRET,
CRON_SECRET, HOT_LEAD_ALERT_SECRET, IMPORT_API_KEY,
CUSTOM_REQUESTS_INTERNAL_TOKEN, CUSTOM_REQUESTS_RATE_LIMIT_SALT,
N8N_MCP_URL, N8N_MCP_AUTHORIZATION
```
**Pendientes en Vercel (necesitan valor real):**
```
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_ESSENTIAL, STRIPE_PRICE_PROFESSIONAL, STRIPE_PRICE_ELITE
GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET
```
(STRIPE_* tienen placeholders — se activan en Fase B)
**GOOGLE_OAUTH_CLIENT_ID/SECRET** (2026-09-04): único paso pendiente de la Fase A de Google
Calendar (`docs/agente-cita-fase-A-google-calendar.md`) — todo el código (conexión, tokens
cifrados, freebusy, creación de eventos, botón ya añadido en dashboard y en la sala de
configuración) está construido y desplegado. Falta crear el proyecto + OAuth 2.0 Client (Web) en
Google Cloud Console — lo tiene que hacer H, no es generable por código. Detalle de scopes y
redirect URI en ese mismo doc. `GOOGLE_OAUTH_STATE_SECRET`/`GOOGLE_TOKEN_ENCRYPTION_KEY` ya están
configurados. Hasta entonces, el botón "Conectar Google Calendar" permanece oculto (comportamiento
esperado, no un bug).
~~R2_*~~ — **no aplica**: la subida de imágenes usa Supabase Storage, no Cloudflare R2.

---

## Docs del repo que siguen siendo válidos
- `docs/planes-suscripcion-definitivos.md` — definición definitiva de planes y add-ons
- `docs/seo-geo-backlog.md` + `seo-geo-backlog.csv` — backlog SEO/GEO (independiente)
- `docs/guia-copy-black-label.md` — guía de tono y copy de la marca
- `docs/legal-pending-data.md` — investigación legal del alta de profesionales (clickwrap, DSA art. 30, RGPD responsable/encargado) + datos legales pendientes de rellenar. Borrador para revisión de abogado (extendido 2026-07-20, tabla de pendientes reconciliada contra código 2026-09-01)
- `docs/agente-cita-fase-A-google-calendar.md` — diseño de la Fase A de Google Calendar. Código completo y dormido; **decisión 2026-08-25: queda en backlog indefinido**, no activada — Fase B (horario manual, sin OAuth) es la vía definitiva, verificada E2E el 2026-08-26 (ver fila "Reserva de citas" en Features Elite arriba)
- `docs/ciclo-vida-trial-verificacion.md` — checklist de verificación del ciclo de vida del trial (banner + drip WF)
- `docs/auditoria-total-2026-07/` — 13 documentos de la auditoría total (seguridad, código, API, rendimiento, UX/accesibilidad, SEO/GEO, funcional por rol, E2E autenticado) + veredicto consolidado
- `docs/verificacion-tiers-2026-07-28.md` — verificación de los 3 tiers (Codex, 2026-07-28): límites de vehículos/paneles/CSV/analítica/boosts confirmados correctos; 4 hallazgos (F-D-01/02/04 corregidos y reverificados 2026-07-29; **F-D-03 revisado 2026-09-01: sus 4 sub-hallazgos ya no aplican** — el propio campo `future`/`availability_status` de `lib/plans-config.ts` que citaba fue retirado en la refactorización de planes, feed/DMS y ventana Elite 24h se presentan ya como incluidos, y reservas por calendario quedó resuelto por la vía Fase B de arriba, no por Fase A)

**Eliminados 2026-09-01 por limpieza de documentación** (contenido superado por el código real, ver
`registro_decisiones.md` en el core): `docs/admin-dashboard-validation-report.md` (su único hallazgo vivo,
INC-004, ya corregido en `app/(auth)/admin-login/page.tsx`), `docs/qa-final-report.md`,
`docs/repair-migration-procedure.md`, `docs/configuracion-email-smtp.md` (describía Resend; el SMTP real es
Hostinger, sin doc propio todavía), `docs/ajustes/` (5 changelogs puntuales ya consumidos).
