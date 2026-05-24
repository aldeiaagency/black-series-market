# Datos legales pendientes — Black Label Market

Empresa titular: KAZAWEB, S.L.U. (NIF: B42761254)

---

## Datos pendientes de definir

| Dato | Estado | Placeholder en código |
|---|---|---|
| Dominio definitivo | PENDIENTE | `[PENDIENTE_DEFINIR_DOMINIO]` |
| Email legal | PENDIENTE | `[PENDIENTE_EMAIL_LEGAL]` |
| Email privacidad / RGPD | PENDIENTE | `[PENDIENTE_EMAIL_PRIVACIDAD]` |
| Email de contacto | PENDIENTE | `[PENDIENTE_EMAIL_CONTACTO]` |
| Herramienta de formularios | PENDIENTE | `[PENDIENTE_HERRAMIENTA_FORMULARIOS]` |
| CRM / webhook | PENDIENTE | `[PENDIENTE_CRM]` |
| Email marketing | PENDIENTE | `[PENDIENTE_EMAIL_MARKETING]` |
| Analytics | PENDIENTE | `[PENDIENTE_ANALYTICS]` |
| Pixel de publicidad | PENDIENTE | `[PENDIENTE_PIXEL]` |
| Datos técnicos de navegación | PENDIENTE | `[PENDIENTE_DEFINIR_ANALYTICS_COOKIES]` |
| Banner de cookies | PENDIENTE — no implementado | — |
| Jurisdicción específica | PENDIENTE | `[PENDIENTE_DEFINIR_JURISDICCION_ESPECIFICA]` |
| Revisión legal profesional | PENDIENTE | — |
| Política de cookies definitiva | PENDIENTE — configuración técnica | `/legal/cookies` |

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

1. Definir y registrar el dominio definitivo
2. Activar y verificar buzones de email (legal, privacidad, contacto)
3. Configurar SPF, DKIM y DMARC para el dominio
4. Definir herramientas de formularios y CRM — reemplazar placeholders
5. Configurar analytics si procede — actualizar política de cookies
6. Implementar banner de consentimiento de cookies si se activan cookies no técnicas
7. Revisar toda la documentación legal con asesor especializado en RGPD y LSSI
8. Reemplazar todos los `[PENDIENTE_...]` con datos reales antes del lanzamiento público
9. Actualizar `NEXT_PUBLIC_SITE_URL` en Vercel con el dominio definitivo

---

Última actualización: Mayo 2026
