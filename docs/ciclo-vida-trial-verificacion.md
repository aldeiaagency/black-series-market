# Ciclo de vida trial → conversión — checklist de verificación

> Documento de repaso: para cuando H haga una prueba real (alta de un showroom de verdad) y quiera
> ir verificando cada pieza del ciclo trial→conversión antes de darla por buena. Construido y
> probado con datos reales (dealer de prueba Iconic Motor Gallery) el 2026-07-14.
>
> Este documento **no sustituye** a `docs/PENDIENTES.md` (estado técnico canónico) ni a
> `black-series-core/agency/05_simulacro_e2e.md` (el funnel completo agencia+market) — es el
> complemento de repaso específico de esta pieza: qué se construyó, qué dice cada email
> exactamente, y cómo forzar cada etapa para probarlo sin esperar días reales.

---

## 1. Qué se construyó (resumen técnico)

| Pieza | Dónde | Estado |
|---|---|---|
| Perfil/listado/vehículos visibles durante el trial (no solo cuando hay stock) | Migración `067_trial_dealers_public_visibility.sql` (RLS) + `app/(public)/dealers/[slug]/page.tsx`, `app/(public)/dealers/page.tsx`, `app/(public)/coches/[slug]/page.tsx`, `app/(public)/motos/[slug]/page.tsx` | ✅ desplegado y verificado en producción |
| Reloj de trial (`trial_ends_at`, 30 días desde la aprobación) | Migración `068_trial_lifecycle_fields.sql` + `app/(admin)/admin/altas-showroom/actions.ts` | ✅ desplegado |
| Banner "Prueba activa hasta [fecha]" en el dashboard | `app/(dashboard)/dashboard/page.tsx` | ✅ desplegado y verificado visualmente |
| Fix: "Activa tu plan de suscripción" del checklist de primeros pasos aparecía siempre como hecho (comparaba un valor que nunca existe en esa columna) | `app/(dashboard)/dashboard/page.tsx` (`hasPlan`) | ✅ corregido |
| Función `trial_dealer_stats(dealer_id)` — vistas/leads/vehículos activos durante el trial | Migración `069_trial_dealer_stats_rpc.sql` | ✅ desplegado |
| Secuencia de 4 emails de trial (día 3/10/21/28) | n8n **`BLM - 8. Trial drip y conversión`** | ✅ activo, probado E2E las 4 etapas |
| Cierre de un hueco de seguridad encontrado de paso: un dealer `suspended` seguía teniendo sus vehículos públicamente visibles (RLS nunca comprobaba el dealer) | Misma migración 067 | ✅ cerrado |

---

## 2. Checklist de verificación con un caso real

Marcar cada punto según se vaya confirmando con el primer showroom real que pase por el programa fundador.

### 2.1 Visibilidad inmediata tras la aprobación
- [ ] Nada más aprobar la solicitud (`status='trial'`), el perfil público `/dealers/[slug]` carga (no 404).
- [ ] El showroom aparece en el listado `/dealers` aunque tenga 0 vehículos.
- [ ] Si se publica un vehículo antes de tener plan pagado, su ficha (`/coches/[slug]` o `/motos/[slug]`) es visible.

### 2.2 Dashboard del showroom
- [ ] El banner de trial aparece con la fecha correcta ("Prueba activa hasta el [fecha]").
- [ ] El enlace "Ver planes →" lleva a `/dashboard/suscripcion`.
- [ ] El checklist "Primeros pasos" NO marca "Activa tu plan de suscripción" como hecho hasta que el dealer pague de verdad (`status='active'`).

### 2.3 Secuencia de emails (revisar contenido — ver §3 más abajo para el texto exacto)
- [ ] Día 3 — check-in. Revisar tono y que el enlace al perfil sea correcto.
- [ ] Día 10 — aprovechar el plan. Revisar que mencione el plan correcto (`essential`/`professional`/`elite`).
- [ ] Día 21 — recordatorio con días restantes + primeras cifras reales (vistas/contactos).
- [ ] Día 28 — resumen final (vistas/contactos/vehículos) + CTA a elegir plan. Es el más importante de revisar: las cifras deben ser reales, no genéricas.
- [ ] Confirmar que, tras enviar la etapa 4, el sistema no vuelve a enviar nada (fin de la secuencia).

### 2.4 Black Audit / Diagnóstico Anti-Fuga (Elite: incluido de serie, 1/semestre)
- [ ] Revisar el mecanismo y el formato en `black-series-core/outputs/diagnostics/SIMULACRO_IconicMotorGallery_BlackAudit_v1.md` (simulacro, no un audit real).
- [ ] **Pendiente de construir**: disparo automático del recordatorio semestral para dealers Elite (hoy no existe ningún mecanismo que lo dispare — ver `black-series-core/agency/05_simulacro_e2e.md` bloque 3 del análisis de rama market).

---

## 3. Contenido exacto de cada email (para revisar copy sin tener que disparar nada)

Remitente en los 4: `Black Label Market <hola@blacklabelmarket.es>`. SMTP: credencial "Hostinger SMTP BLM".

### Día 3 — check-in
**Asunto:** `[Nombre showroom], ¿qué tal las primeras impresiones de Black Label Market?`
```
Buenas,

Llevas unos días con vuestro perfil ya publicado ([enlace al perfil]). Si os falta
terminar de completar el perfil o subir stock, es el momento — cuanto antes esté todo,
antes empiezan a llegar contactos.

Cualquier duda sobre cómo funciona el panel, respondednos a este correo.

Un saludo,
Black Label Market
```

### Día 10 — aprovechar el plan
**Asunto:** `Sacadle partido a vuestro plan [plan] en Black Label Market`
```
Buenas,

Con stock publicado, dos cosas que suelen marcar la diferencia: mantener las fichas con
fotos y precio actualizados, y usar los boosts para destacar el vehículo que más queréis
mover esta semana.

Vuestro panel: blacklabelmarket.es/dashboard

Un saludo,
Black Label Market
```

### Día 21 — recordatorio con cifras
**Asunto:** `Vuestra prueba en Black Label Market termina en [N] días`
```
Buenas,

Quedan [N] días de prueba. Hasta ahora, vuestro perfil ha tenido [X] visitas y habéis
recibido [Y] contactos a través del market.

Para que el perfil siga activo sin interrupción, podéis elegir vuestro plan cuando
queráis, sin esperar al último día: blacklabelmarket.es/dashboard/suscripcion

Un saludo,
Black Label Market
```

### Día 28 — resumen final + conversión
**Asunto:** `Vuestra prueba en Black Label Market termina en [N] días`
```
Buenas,

Resumen de vuestro periodo de prueba: [X] visitas al perfil, [Y] contactos recibidos,
[Z] vehículos activos publicados.

Para que vuestro perfil y stock sigan visibles sin interrupción, elegid vuestro plan
aquí: blacklabelmarket.es/dashboard/suscripcion

Si necesitáis más tiempo o tenéis dudas sobre qué plan os encaja, respondednos a este
correo — lo hablamos.

Un saludo,
Black Label Market
```

**Nota de copy pendiente de revisión de H:** los 4 textos son un primer borrador funcional, no una versión de copy final revisada — es lo primero que valdría la pena pulir con un caso real delante.

---

## 4. Cómo forzar cada etapa para probar sin esperar días reales

El workflow tiene un webhook de disparo manual además del cron diario (09:00):

```
POST https://aldeia-n8n.giuxk6.easypanel.host/webhook/bsa/trial-drip-run-now
```

Para forzar una etapa concreta en un dealer de prueba, actualizar su `trial_ends_at` antes de llamar al webhook (vía Supabase, tabla `dealers`):

| Etapa que se quiere probar | `trial_ends_at` a fijar |
|---|---|
| Día 3 | `now() + 27 días` |
| Día 10 | `now() + 20 días` |
| Día 21 | `now() + 9 días` |
| Día 28 | `now() + 2 días` |

Después de cada prueba, resetear `trial_email_stage = 0` si se quiere repetir la secuencia completa desde cero.

---

## 5. Fuera de alcance de este cierre (pendiente aparte)

- **Checkout de Stripe real integrado en el flujo** (`/precios` con precios reales + botón de pago) — sigue sin construir, es la pieza que falta para que "Ver planes →" termine en un pago real, no solo en una página informativa.
- **Plan Grupo** — sin cerrar ni construir.
- **Disparo semestral del Black Audit para dealers Elite** — sin mecanismo automático todavía.
- **Reporting** (WF-P4/WF-P5) — siguiente bloque a construir tras cerrar este.
