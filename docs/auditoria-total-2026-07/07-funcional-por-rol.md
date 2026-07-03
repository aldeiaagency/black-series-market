# 07 — Funcional por rol — Black Label Market

> Auditoría DESDE CERO por trazado de código (2026-07-03), hilo principal. No se apoya en QA previo.
> Roles showroom/admin analizados por código (requieren login); rol visitante verificable en vivo.
> Cruza con `01-seguridad.md` / `03-api.md` donde un flujo "funciona pero es inseguro".
> Árbol real: ~85 rutas (public 40+, dashboard 15, admin 16, cuenta 3, auth 6).

## Rol VISITANTE (comprador)

| Paso | Ruta / acción | Estado | Nota |
|------|---------------|--------|------|
| Home | `(public)/page.tsx` | OK | Ver rendimiento (04): sin cache, hero pesado |
| Explorar catálogo | `/coches`, `/motos` + 6+9 categorías | OK | Silo amplio y coherente |
| Buscar por marca/modelo | filtros estructurados (`vehicle-query.ts`) | OK | Filtros por marca/modelo/versión/precio/etc. funcionan |
| **Buscar texto libre** | `?search=` → `vehicle-query.ts:84-85` | **ROTO (valor)** | Ver hallazgo 1 |
| Ficha de vehículo | `/coches/[slug]` | OK | Escribe analytics en el render (ver 04) |
| Enviar consulta (lead) | `ContactForm`/`QualifiedLeadForm` → `/api/leads` | OK pero inseguro | Se inserta; sin rate limit ni validación de pertenencia (ver 01/03) |
| Crear alerta | `SearchAlertModal` → `/api/search-alerts` | OK pero inseguro | Público sin rate limit/saneo (ver 03) |
| Comparador | `/comparar` + `comparator-context` | A verificar en vivo | Desincronización barra vs tabla reportada; no re-verificada en código esta pasada |
| Favoritos | `/cuenta/favoritos` **y** `/mis-favoritos` | Duplicado | Ver hallazgo 2 |
| Cuenta / alertas | `/cuenta`, `/cuenta/alertas` | Parcial | Alertas: solo eliminar, no pausar (reportado); a verificar |
| Registro/login | `(auth)/registro-comprador`, `/login` | OK | (Nota seguridad: un comprador puede auto-promoverse a admin, ver 01 CRÍTICO 1) |

### Hallazgos visitante
| Sev | Ubicación | Descripción | Fix |
|-----|-----------|-------------|-----|
| **Alto** | `lib/vehicle-query.ts:85` | El buscador de texto libre solo hace `ilike` sobre `brand_name` y `model_name`. **No indexa `version` ni `title`.** Búsquedas típicas del comprador premium — "GT3", "Weissach", "Pista", "Black Series", "Competizione" — viven en `version`/`title` → **devuelven 0 resultados**. Es el fallo funcional que más daña la experiencia de compra. | Añadir `version` y `title` al `.or()` (saneando el input por la inyección PostgREST del hallazgo de 01/03; idealmente `textSearch`/RPC). |
| Medio | `(public)/mis-favoritos` + `(cuenta)/cuenta/favoritos` | Dos rutas de favoritos coexisten. Riesgo de estados divergentes y confusión de navegación. | Unificar en una canónica; redirigir la otra. |
| Bajo | `next.config.js:10-14` vs `(public)/precios` y `(public)/busqueda-privada` | Redirects permanentes `/precios→/profesionales/precios` y `/busqueda-privada→/vehiculos-a-la-carta` **sombrean** páginas `page.tsx` que existen → código muerto inalcanzable; si el sitemap/enlaces internos apuntan a ellas, cadena de redirect. | Borrar las páginas sombreadas o quitar el redirect; alinear con sitemap (ver 06). |

## Rol SHOWROOM (dealer)

| Paso | Ruta / acción | Estado | Nota |
|------|---------------|--------|------|
| Solicitar acceso | `/profesionales/solicitar-acceso` → `/api/showroom-applications` | OK | WF1 (Firecrawl+Claude) genera informe |
| Aprobación → alta | `approveApplication` (admin) | OK parcial | Crea profile(dealer)+dealer+organization+membership(owner). Ver hallazgo 1 |
| Entrar al panel | `/dashboard` | **Panel vacío** | Sin perfil completo, sin stock, sin asistente → primera impresión pobre |
| Publicar vehículo | `/dashboard/publicar` (wizard) → `/api/vehicles` | OK pero con fricción e inseguro | ~40 campos, 10 fotos mín (ver 05); auto-active/featured posible (ver 01/03) |
| Inventario | `/dashboard/inventario` | OK | |
| Oportunidades / Kanban | `/dashboard/oportunidades` | OK pero no accesible | No operable por teclado/lector (ver 05 CRÍTICO) |
| Solicitudes a-la-carta | `/dashboard/solicitudes` | OK | |
| Citas | `/dashboard/citas` | Depende de OAuth | Google Calendar (Fase A) pendiente; provider manual en 056 |
| Asistente IA | (config por showroom) | **INACTIVO** | Ver hallazgo 2 |
| Equipo / Facturación / Suscripción | `/dashboard/{equipo,facturacion,suscripcion}` | Parcial | Facturación/suscripción atadas a la cadena Stripe rota (ver 02/03) |

### Hallazgos showroom
| Sev | Ubicación | Descripción | Fix |
|-----|-----------|-------------|-----|
| **Alto** | `approveApplication` (`actions.ts:95`) + `/dashboard` | Tras aprobar, el showroom entra a un **panel vacío**: no hay paso que cree su perfil público completo ni cargue stock. Choca con la estrategia white-glove ("publicamos por ti en <72h"). | Onboarding automático (F4 del roadmap): completar ficha del showroom desde el informe WF1 + provisión inicial. |
| **Alto** | `showroom_assistant_config` (solo se escribe en `stripe/webhooks:169`) | El asistente IA (venta Pro/Elite) **solo se aprovisiona vía webhook de suscripción Stripe**, que está en test y con la cadena rota (ver 02/03). **No hay paso de onboarding ni UI** para activarlo. Resultado: ningún showroom real tiene asistente; todas las fichas usan el form clásico. | Crear la fila `showroom_assistant_config` (enabled + webhook_url WF7) en el onboarding del showroom Pro/Elite, con UI en el dashboard para editarla. |
| Medio | `/dashboard/publicar` | Wizard de ~40 campos en 5 pasos con mínimo de 10 fotos y sin autoguardado por paso → abandono probable en autoservicio. | Autoguardado por paso; reducir campos obligatorios; mínimo de fotos más bajo para borrador. |

## Rol ADMIN

| Paso | Ruta / acción | Estado | Nota |
|------|---------------|--------|------|
| Login admin | `(auth)/admin-login` + `AdminLayout` | OK (guard de página) | El guard NO protege las server actions (ver 01 CRÍTICO 3) |
| Moderar altas | `/admin/altas-showroom[/id]` → actions | Funciona / **inseguro** | Aprobar/rechazar sin `requireAdmin` (ver 01) |
| Moderar vehículos | `/admin/vehiculos[/id]` | OK | Reject vía API con check admin (ver 03) |
| Solicitudes / Contactos | `/admin/{solicitudes,contactos}` | OK | |
| Configuración | `/admin/configuracion` → `/api/admin/config` | OK | Check admin presente en la API |
| Panel comercial | `/admin/{dealers,plans,subscriptions,boosts,elite-capacity,analiticas,alertas}` | **A verificar** | 16 secciones; no verificado en detalle cuáles son funcionales vs andamiaje |

### Hallazgos admin
| Sev | Ubicación | Descripción | Fix |
|-----|-----------|-------------|-----|
| **Crítico** (ya en 01) | `app/(admin)/**/actions.ts` | Server actions sin `requireAdmin()`. | Ver 01 CRÍTICO 3. |
| Medio | `/admin/{plans,subscriptions,boosts,elite-capacity}` | Amplitud del panel (16 secciones) sin verificar funcionalmente; riesgo de secciones a medio construir que confundan la operación. | Barrido funcional de cada sección admin (siguiente pasada, requiere login). |

## Veredicto: ¿puede operar un showroom real de principio a fin?

**Parcialmente.** El núcleo alta → aprobación → publicar → recibir leads/alertas **funciona**. Pero:

- **Para el modelo white-glove del plan** (nosotros publicamos su stock por ellos): **operable ya**, una vez corregidos los CRÍTICOS de seguridad. Es el camino recomendado para los primeros fundadores.
- **Para autoservicio pleno del showroom: todavía no.** Faltan: onboarding que deje el panel "vivo" (perfil+stock), activación del asistente IA, y el pulido de fricción del wizard. Además hay agujeros de seguridad que un dealer podría explotar (ver 01).
- **Comprador**: el flujo funciona, pero el **buscador de texto libre roto** (no encuentra por versión/acabado) es un fallo de valor directo que hay que cerrar antes de traer tráfico real.

## Conteo por severidad (esta capa)
| Severidad | Nº |
|-----------|----|
| Bloqueante | 0 |
| Alto | 4 |
| Medio | 3 |
| Bajo | 1 |
| **Total** | **8** |

(Los verdaderos bloqueantes de go-live son de seguridad — capa 01 — no funcionales.)

## No cubierto (honestidad)
- E2E autenticado en vivo (showroom/admin) pendiente de sesión/entorno de prueba.
- Comparador/favoritos/alertas: desincronización reportada no re-verificada en código en esta pasada.
- Funcionalidad real de las 16 secciones del panel admin: barrido pendiente.
