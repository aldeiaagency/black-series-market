-- Diagnóstico RLS — ejecutar en el SQL Editor de Supabase (solo lectura).
-- Punto 7 del GATE: barrer TODAS las tablas para detectar políticas permisivas del tipo
-- "own sin guardia de columna" (el mismo defecto de profiles/dealers) en organizations,
-- subscriptions, boosts, addons, plans, etc. NO modifica nada; sirve para decidir 058+.

-- 1) Tablas con RLS activado (y las que NO lo tienen → riesgo alto).
SELECT n.nspname AS schema, c.relname AS tabla, c.relrowsecurity AS rls_activado
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY c.relrowsecurity, c.relname;

-- 2) Todas las políticas, con su expresión USING y WITH CHECK.
--    Buscar UPDATE/ALL con qual pero sin with_check (permite cambiar columnas sensibles),
--    y SELECT con qual = 'true' (exposición pública).
SELECT tablename, policyname, cmd, roles, qual AS using_expr, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;

-- 3) Column privileges de UPDATE por rol (para confirmar los REVOKE de 057 y detectar
--    columnas comerciales editables por authenticated/anon en otras tablas).
SELECT table_name, grantee, column_name
FROM information_schema.column_privileges
WHERE table_schema = 'public'
  AND privilege_type = 'UPDATE'
  AND grantee IN ('authenticated', 'anon')
ORDER BY table_name, grantee, column_name;

-- Criterio de revisión:
--  · Cualquier tabla con datos de negocio y rls_activado=false → añadir RLS.
--  · Política UPDATE/ALL con roles {authenticated} y with_check NULL sobre tablas de plan,
--    facturación, capacidad o boosts → candidata a REVOKE de columnas o WITH CHECK, como en 057.
--  · Política SELECT con using_expr='true' sobre tablas con datos personales → restringir.
