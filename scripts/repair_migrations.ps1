param(
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

$PAT         = $env:SUPABASE_ACCESS_TOKEN
$PROJECT_REF = "iylppoaitwnmbwjaubuy"
$API_URL     = "https://api.supabase.com/v1/projects/$PROJECT_REF/database/query"
$MIGRATIONS  = Join-Path $PSScriptRoot "..\supabase\migrations"

function Invoke-SQL {
    param([string]$Label, [string]$Sql)
    Write-Host "`n[$Label]" -ForegroundColor Cyan
    if ($DryRun) {
        Write-Host "  DRY-RUN ($($Sql.Length) chars)" -ForegroundColor Yellow
        return $null
    }
    $body = @{ query = $Sql } | ConvertTo-Json -Compress
    try {
        $response = Invoke-RestMethod `
            -Uri $API_URL `
            -Method POST `
            -Headers @{ "Authorization" = "Bearer $PAT"; "Content-Type" = "application/json" } `
            -Body $body
        return $response
    } catch {
        $msg = $_.ErrorDetails.Message
        if (-not $msg) { $msg = $_.Exception.Message }
        Write-Host "  ERROR: $msg" -ForegroundColor Red
        throw
    }
}

function Apply-Migration {
    param([string]$FileName)
    $path = Join-Path $MIGRATIONS $FileName
    if (-not (Test-Path $path)) {
        Write-Host "  ARCHIVO NO ENCONTRADO: $path" -ForegroundColor Red
        throw "Missing: $path"
    }
    $sql = Get-Content $path -Raw -Encoding UTF8
    $result = Invoke-SQL -Label "MIGRATION: $FileName" -Sql $sql
    Write-Host "  OK" -ForegroundColor Green
    return $result
}

function Assert-Table {
    param([string]$TableName)
    $sql = "SELECT COUNT(*) AS cnt FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '$TableName'"
    $result = Invoke-SQL -Label "VERIFY: $TableName" -Sql $sql
    if ($DryRun) { return }
    if ($result[0].cnt -eq 0) {
        Write-Host "  FAIL: tabla '$TableName' no existe" -ForegroundColor Red
        throw "Verification failed: $TableName"
    }
    Write-Host "  OK: $TableName existe" -ForegroundColor Green
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor White
Write-Host " BLACK LABEL MARKET - Repair Migrations" -ForegroundColor White
if ($DryRun) {
    Write-Host " MODO: DRY-RUN (sin cambios en produccion)" -ForegroundColor Yellow
} else {
    Write-Host " MODO: PRODUCCION - base de datos real" -ForegroundColor Red
}
Write-Host "=============================================" -ForegroundColor White

# FASE 1: Arquitectura de planes
Write-Host "`n-- FASE 1: Arquitectura de planes (023-028) --" -ForegroundColor Magenta

Apply-Migration "023_plans.sql"
Assert-Table "plans"
Assert-Table "plan_limits"
Assert-Table "plan_features"

Apply-Migration "024_organizations.sql"
Assert-Table "organizations"
Assert-Table "locations"
Assert-Table "organization_members"
Assert-Table "audit_log"

Apply-Migration "025_subscriptions_v2.sql"
Assert-Table "subscriptions"
Assert-Table "founding_memberships"

Apply-Migration "026_addons.sql"
Assert-Table "addons"
Assert-Table "addon_plan_compatibility"
Assert-Table "subscription_addons"

Apply-Migration "027_elite_capacity.sql"
Assert-Table "elite_capacity_rules"
Assert-Table "elite_waitlist"

Apply-Migration "028_boosts_v2.sql"
Assert-Table "boost_credits"
Assert-Table "boost_activations"

# FASE 2: Seeds
Write-Host "`n-- FASE 2: Seeds de planes (029) --" -ForegroundColor Magenta

Apply-Migration "029_seeds_v2.sql"

$r = Invoke-SQL -Label "VERIFY: seed planes" -Sql "SELECT COUNT(*) AS cnt FROM plans"
if (-not $DryRun) {
    Write-Host "  Planes en BD: $($r[0].cnt) (esperados: 4)" -ForegroundColor Green
}

# FASE 3: Features dependientes
Write-Host "`n-- FASE 3: Features y actualizaciones (033, 034-fix, 036-038) --" -ForegroundColor Magenta

Apply-Migration "033_assistant_feature_flags.sql"

$fix034 = @'
UPDATE plan_features
SET availability_status = 'operative'
WHERE feature_key IN ('analytics_advanced', 'analytics_extended_compare')
  AND availability_status = 'partial';
'@
$r = Invoke-SQL -Label "034-FIX: plan_features operative" -Sql $fix034
if (-not $DryRun) { Write-Host "  OK" -ForegroundColor Green }

Apply-Migration "036_remove_founding.sql"
Apply-Migration "037_essential_price_correction.sql"

$r = Invoke-SQL -Label "VERIFY: precio Essential" -Sql "SELECT monthly_price FROM plans WHERE slug = 'essential'"
if (-not $DryRun) {
    Write-Host "  Precio Essential: $($r[0].monthly_price) EUR (esperado: 197)" -ForegroundColor Green
}

Apply-Migration "038_feature_classification.sql"

# FASE 4: Trigger limite vehiculos
Write-Host "`n-- FASE 4: Trigger limite de vehiculos (040) --" -ForegroundColor Magenta

Apply-Migration "040_enforce_active_vehicle_limit.sql"

$r = Invoke-SQL -Label "VERIFY: trigger" -Sql "SELECT COUNT(*) AS cnt FROM information_schema.triggers WHERE trigger_name = 'trg_enforce_active_vehicle_limit'"
if (-not $DryRun) {
    if ($r[0].cnt -eq 1) {
        Write-Host "  OK: trigger existe" -ForegroundColor Green
    } else {
        Write-Host "  FAIL: trigger no encontrado" -ForegroundColor Red
    }
}

# FASE 5: Migration tracking CLI
Write-Host "`n-- FASE 5: Configurar tracking CLI --" -ForegroundColor Magenta

$trackingSQL = @'
CREATE SCHEMA IF NOT EXISTS supabase_migrations;

CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
    version TEXT NOT NULL PRIMARY KEY
);

INSERT INTO supabase_migrations.schema_migrations (version) VALUES
  ('001_initial'),
  ('002_platform_config'),
  ('003_boost_featured_until'),
  ('004_new_vehicle_fields'),
  ('005_analytics_metadata'),
  ('006_social_fields'),
  ('007_seed_social_links'),
  ('008_expanded_brand_catalog'),
  ('009_add_cadillac_ds'),
  ('010_dealer_contact_fields'),
  ('011_vehicle_extended_fields'),
  ('012_vehicle_equipment_extra'),
  ('013_vehicle_category_text'),
  ('014_fix_zero_to_hundred_precision'),
  ('015_expand_lead_status'),
  ('016_elite_dealer'),
  ('017_search_alerts'),
  ('018_national_delivery'),
  ('019_custom_requests_and_integration_events'),
  ('020_search_alerts_source'),
  ('021_analytics_events_rls'),
  ('022_brand_identity_site_name'),
  ('023_plans'),
  ('024_organizations'),
  ('025_subscriptions_v2'),
  ('026_addons'),
  ('027_elite_capacity'),
  ('028_boosts_v2'),
  ('029_seeds_v2'),
  ('030_dealer_gallery'),
  ('031_dealer_services'),
  ('032_lead_qualification'),
  ('033_assistant_feature_flags'),
  ('034_analytics_rollup'),
  ('035_seed_models_catalog'),
  ('036_remove_founding'),
  ('037_essential_price_correction'),
  ('038_feature_classification'),
  ('039_showroom_applications'),
  ('040_enforce_active_vehicle_limit')
ON CONFLICT (version) DO NOTHING;
'@

$r = Invoke-SQL -Label "TRACKING: schema_migrations" -Sql $trackingSQL
if (-not $DryRun) { Write-Host "  OK - tracking configurado (40 versiones)" -ForegroundColor Green }

Write-Host ""
Write-Host "=============================================" -ForegroundColor White
Write-Host " MIGRACIONES COMPLETADAS" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor White
Write-Host ""
Write-Host "Siguiente paso: desplegar a Vercel" -ForegroundColor Cyan
Write-Host "  cd c:\Users\34636\agencias\black-series-market" -ForegroundColor Gray
Write-Host "  vercel --prod --yes" -ForegroundColor Gray
