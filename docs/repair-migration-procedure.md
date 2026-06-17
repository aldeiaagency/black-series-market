# Black Label Market — Procedimiento de reparación de migraciones

> Creado: 2026-06-17  
> Motivo: las migraciones 023–029 y dependientes nunca se aplicaron a producción a través del CLI. El sistema de planes (`plans`, `plan_limits`, `plan_features`) no existe en la BD real.

---

## Diagnóstico

### Estado verificado en producción (2026-06-17)

| Rango | Estado | Evidencia |
|---|---|---|
| 001–022 | ✅ APLICADAS | Tablas iniciales presentes (dealers, vehicles, subscription_plans, etc.) |
| 023–029 | ❌ NO APLICADAS | `plans`, `plan_limits`, `plan_features`, `organizations`, `subscriptions`, etc. no existen |
| 030–032 | ✅ APLICADAS | `dealer_gallery_images`, `dealers.services`, `lead_events`, `appointments`, `showroom_assistant_config` existen |
| 033 | ❌ FALLÓ | INSERT en `plan_features` — la tabla no existía |
| 034 | ⚠️ PARCIAL | `analytics_daily` + trigger OK; `UPDATE plan_features` falló silenciosamente |
| 035 | ✅ APLICADA | 785 modelos en tabla `models` |
| 036–038 | ❌ FALLARON | Dependían de `plans`/`subscriptions`/`plan_features` |
| 039 | ✅ APLICADA | `showroom_applications` existe |
| 040 | ❌ NO APLICADA | Trigger `trg_enforce_active_vehicle_limit` no existe |
| 041 | ⏸ OMITIDA | Demo seed — necesita `organizations` (aún no existe) |

### Por qué ocurrió esto

Las migraciones se aplicaron manualmente via el editor SQL de Supabase (no con el CLI). El CLI nunca se configuró, por lo que no existe tabla de tracking (`supabase_migrations.schema_migrations`). Las migraciones que referenciaban `plan_features` o `plans` (033, 034-update, 036-038) fallaron silenciosamente porque esas tablas no existían aún.

### Impacto actual

- **Bug de analíticas**: el código nuevo gatea por `plan_features.included` → la tabla no existe en prod → perfil Elite cae a básico.
- **Todo el sistema de planes**: planes, suscripciones, add-ons, organizaciones, boosts, límite de vehículos — ninguno está operativo en producción.
- El código nuevo de Vercel tampoco está desplegado (auto-deploy roto).

---

## Procedimiento de reparación

### Script

```
scripts/repair_migrations.ps1
```

Modo dry-run (verificar sin ejecutar):
```powershell
.\scripts\repair_migrations.ps1 -DryRun
```

Ejecución real:
```powershell
.\scripts\repair_migrations.ps1
```

### Qué hace el script (en orden)

#### Fase 1 — Arquitectura de planes (023–028)

| Migración | Crea |
|---|---|
| 023_plans | `plans`, `plan_limits`, `plan_features` |
| 024_organizations | `organizations`, `locations`, `organization_members`, `audit_log` |
| 025_subscriptions_v2 | `subscriptions`, `founding_memberships` |
| 026_addons | `addons`, `addon_plan_compatibility`, `subscription_addons` |
| 027_elite_capacity | `elite_capacity_rules`, `elite_waitlist` |
| 028_boosts_v2 | `boost_credits`, `boost_activations` |

Todas usan `CREATE TABLE IF NOT EXISTS` → **sin riesgo de conflicto** con tablas existentes.

#### Fase 2 — Seeds (029)

Inserta los datos de planes, límites, features y add-ons. Todas las inserciones usan `ON CONFLICT DO UPDATE/NOTHING` → **idempotente**.

#### Fase 3 — Features dependientes (033, 034-fix, 036, 037, 038)

| Paso | Qué hace |
|---|---|
| 033 | INSERT feature flags del agente de cualificación en `plan_features` |
| 034-fix | UPDATE que falló la primera vez: pone `analytics_advanced` y `analytics_extended_compare` a `operative` |
| 036 | DROP `founding_memberships` + elimina columnas founding de `subscriptions`/`plans` |
| 037 | Corrige precio Essential: 179 → 197 €/mes |
| 038 | Clasificación definitiva: `pipeline`, `analytics_advanced`, `analytics_extended_compare` → `operative`; Essential pierde `vehicles_on_request` |

#### Fase 4 — Trigger de límite de vehículos (040)

Crea `enforce_active_vehicle_limit()` y el trigger `trg_enforce_active_vehicle_limit` en `vehicles`. Diseño **fail-open**: si no puede resolver el plan, deja pasar.

#### Fase 5 — Tracking CLI

Crea `supabase_migrations.schema_migrations` y registra las 40 migraciones aplicadas (omite 041). A partir de aquí, `npx supabase db push` funcionará correctamente para futuras migraciones.

---

### Paso final — Deploy

Después de que el script termine correctamente:

```powershell
cd c:\Users\34636\agencias\black-series-market
vercel --prod --yes
```

El auto-deploy GitHub → Vercel sigue roto. Siempre usar este comando.

---

## Verificaciones post-deploy

1. Acceder a `/dashboard/analiticas` con el perfil Elite → debe mostrar los datos correctos (no caer a básico).
2. Entrar al panel admin `/admin/plans` → debe mostrar los 4 planes con sus límites y features.
3. Verificar en Supabase que las tablas `plans`, `organizations`, `subscriptions` existen y tienen datos.
4. Intentar activar un vehículo por encima del límite del plan → debe recibir el error `VEHICLE_LIMIT_REACHED` en lugar de un error crudo de BD.

---

## Si algo falla

Cada fase es independiente. Si una migración falla:

1. Leer el mensaje de error del script.
2. Ejecutar la migración problemática manualmente en el editor SQL de Supabase.
3. Continuar el script desde la siguiente fase.

Las fases 1–4 son **aditivas** (solo crean tablas/funciones nuevas). No modifican datos existentes de `dealers`, `vehicles`, `leads`, ni ninguna tabla del schema original. El riesgo de ruptura de lo que ya funciona es mínimo.

---

## Migraciones omitidas

### 041_seed_demo_showrooms

Crea 5 showrooms de demo con usuarios de auth, dealers, organizaciones, suscripciones, vehículos de demo, etc. Se omite del script principal porque:

- Requiere crear entradas en `auth.users` que el API de gestión no soporta directamente.
- El script es un `DO $$` complejo con namespace determinista.
- Los 21 dealers reales ya están en producción.

Para aplicarla si se desea: copiar el contenido de `supabase/migrations/041_seed_demo_showrooms.sql` y ejecutar en el editor SQL de Supabase como superadmin.
