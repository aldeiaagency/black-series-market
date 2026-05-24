-- =============================================================================
-- FIX: Corrupción de caracteres en datos de vehículos
-- Causa: CSV importado desde Excel (Windows-1252) leído como UTF-8.
-- Los bytes de á é í ó ú ñ ü se convirtieron en U+FFFD (carácter de reemplazo).
--
-- Instrucciones:
--   1. Abre Supabase Dashboard → SQL Editor
--   2. Ejecuta primero el BLOQUE 1 para ver qué registros están afectados.
--   3. Ejecuta el BLOQUE 2 para corregir los valores conocidos.
--   4. Para registros con datos únicos/irreconocibles, corrígelos manualmente
--      desde la tabla vehicles en el panel Table Editor de Supabase.
-- =============================================================================


-- ─── BLOQUE 1: Detectar registros con carácter de reemplazo (U+FFFD = chr(65533)) ───

SELECT
  id,
  brand_name,
  model_name,
  version,
  description,
  color_exterior,
  color_interior,
  body_type
FROM vehicles
WHERE
  brand_name      LIKE '%' || chr(65533) || '%'
  OR model_name   LIKE '%' || chr(65533) || '%'
  OR version      LIKE '%' || chr(65533) || '%'
  OR description  LIKE '%' || chr(65533) || '%'
  OR color_exterior LIKE '%' || chr(65533) || '%'
  OR color_interior LIKE '%' || chr(65533) || '%'
  OR body_type    LIKE '%' || chr(65533) || '%'
ORDER BY created_at DESC;


-- ─── BLOQUE 2: Correcciones automáticas de modelos frecuentes ─────────────────
-- Cubre los modelos españoles más comunes con acentos.
-- Ajusta o amplía según lo que devuelva el BLOQUE 1.

-- Lamborghini Huracán
UPDATE vehicles SET model_name = 'Huracán'
WHERE model_name ILIKE 'Hurac' || chr(65533) || 'n';

-- Lamborghini Murciélago
UPDATE vehicles SET model_name = 'Murciélago'
WHERE model_name ILIKE 'Murci' || chr(65533) || 'lago';

-- Alfa Romeo Giuliá / Stelvio (sin acento, pero por si acaso)
-- Maserati Ghiblí
UPDATE vehicles SET model_name = 'Ghiblí'
WHERE model_name ILIKE 'Ghibl' || chr(65533);

-- Porsche (sin acentos — no afectado)
-- Ferrari (sin acentos — no afectado)

-- ─── Correcciones en campo version ───────────────────────────────────────────

-- "Edición" / "edicion"
UPDATE vehicles SET version = REPLACE(version, 'Edici' || chr(65533) || 'n', 'Edición')
WHERE version LIKE '%Edici' || chr(65533) || 'n%';

-- "Eléctrico" en version
UPDATE vehicles SET version = REPLACE(version, 'El' || chr(65533) || 'ctrico', 'Eléctrico')
WHERE version LIKE '%El' || chr(65533) || 'ctrico%';

-- ─── Correcciones en descripción ──────────────────────────────────────────────
-- Para descripciones largas con múltiples acentos corruptos,
-- usa REPLACE encadenado. Las posiciones son siempre las mismas porque
-- TODOS los acentos (á é í ó ú ñ ü) se mapean al mismo U+FFFD.
-- Solo es posible la corrección automática cuando el contexto de la palabra
-- es inequívoco (ej. "h?brido" → siempre "híbrido").

UPDATE vehicles
SET description = REPLACE(description, 'h' || chr(65533) || 'brido',     'híbrido')
WHERE description LIKE '%h' || chr(65533) || 'brido%';

UPDATE vehicles
SET description = REPLACE(description, 'el' || chr(65533) || 'ctrico',   'eléctrico')
WHERE description LIKE '%el' || chr(65533) || 'ctrico%';

UPDATE vehicles
SET description = REPLACE(description, 'autom' || chr(65533) || 'tico',  'automático')
WHERE description LIKE '%autom' || chr(65533) || 'tico%';

UPDATE vehicles
SET description = REPLACE(description, 'configuraci' || chr(65533) || 'n', 'configuración')
WHERE description LIKE '%configuraci' || chr(65533) || 'n%';

UPDATE vehicles
SET description = REPLACE(description, 'informaci' || chr(65533) || 'n', 'información')
WHERE description LIKE '%informaci' || chr(65533) || 'n%';

UPDATE vehicles
SET description = REPLACE(description, 'versi' || chr(65533) || 'n',     'versión')
WHERE description LIKE '%versi' || chr(65533) || 'n%';

UPDATE vehicles
SET description = REPLACE(description, 'edici' || chr(65533) || 'n',     'edición')
WHERE description LIKE '%edici' || chr(65533) || 'n%';

UPDATE vehicles
SET description = REPLACE(description, 'selecci' || chr(65533) || 'n',   'selección')
WHERE description LIKE '%selecci' || chr(65533) || 'n%';

UPDATE vehicles
SET description = REPLACE(description, 'transmisi' || chr(65533) || 'n', 'transmisión')
WHERE description LIKE '%transmisi' || chr(65533) || 'n%';

UPDATE vehicles
SET description = REPLACE(description, 'suspensi' || chr(65533) || 'n',  'suspensión')
WHERE description LIKE '%suspensi' || chr(65533) || 'n%';

UPDATE vehicles
SET description = REPLACE(description, 'inyecci' || chr(65533) || 'n',   'inyección')
WHERE description LIKE '%inyecci' || chr(65533) || 'n%';

UPDATE vehicles
SET description = REPLACE(description, 'direcci' || chr(65533) || 'n',   'dirección')
WHERE description LIKE '%direcci' || chr(65533) || 'n%';

UPDATE vehicles
SET description = REPLACE(description, 'condici' || chr(65533) || 'n',   'condición')
WHERE description LIKE '%condici' || chr(65533) || 'n%';

UPDATE vehicles
SET description = REPLACE(description, 'km' || chr(65533) || 'metros',   'kilómetros')
WHERE description LIKE '%km' || chr(65533) || 'metros%';

UPDATE vehicles
SET description = REPLACE(description, 'kil' || chr(65533) || 'metros',  'kilómetros')
WHERE description LIKE '%kil' || chr(65533) || 'metros%';

UPDATE vehicles
SET description = REPLACE(description, 'tel' || chr(65533) || 'fono',    'teléfono')
WHERE description LIKE '%tel' || chr(65533) || 'fono%';

UPDATE vehicles
SET description = REPLACE(description, 'veh' || chr(65533) || 'culo',    'vehículo')
WHERE description LIKE '%veh' || chr(65533) || 'culo%';

UPDATE vehicles
SET description = REPLACE(description, 'Reci' || chr(65533) || 'n',      'Recién')
WHERE description LIKE '%Reci' || chr(65533) || 'n%';

UPDATE vehicles
SET description = REPLACE(description, 'garant' || chr(65533) || 'a',    'garantía')
WHERE description LIKE '%garant' || chr(65533) || 'a%';

UPDATE vehicles
SET description = REPLACE(description, 'tambi' || chr(65533) || 'n',     'también')
WHERE description LIKE '%tambi' || chr(65533) || 'n%';

UPDATE vehicles
SET description = REPLACE(description, 'est' || chr(65533) || 'tica',    'estética')
WHERE description LIKE '%est' || chr(65533) || 'tica%';


-- ─── BLOQUE 3: Verificar tras la corrección ───────────────────────────────────
-- Vuelve a ejecutar el BLOQUE 1 para comprobar que ya no quedan registros afectados.
-- Los que queden son palabras con acentos ambiguos (ej. "M?naco" podría ser Mónaco o Ménaco)
-- y deben corregirse manualmente en el Table Editor.


-- ─── BLOQUE 4: Dealers (si también hay datos corruptos en perfiles) ───────────

SELECT id, name, description, location_city
FROM dealers
WHERE
  name          LIKE '%' || chr(65533) || '%'
  OR description LIKE '%' || chr(65533) || '%'
  OR location_city LIKE '%' || chr(65533) || '%';

-- Ejemplo de corrección de ciudad:
-- UPDATE dealers SET location_city = 'Málaga'  WHERE location_city = 'M' || chr(65533) || 'laga';
-- UPDATE dealers SET location_city = 'A Coruña' WHERE location_city = 'A Coru' || chr(65533) || 'a';
-- UPDATE dealers SET location_city = 'Mónaco'   WHERE location_city = 'M' || chr(65533) || 'naco';
-- UPDATE dealers SET location_city = 'Cataluña'  WHERE location_city = 'Catalu' || chr(65533) || 'a';
