-- Limpia logo_url de todas las marcas
-- Ejecutar en Supabase SQL Editor después de eliminar los archivos de imagen
UPDATE brands SET logo_url = NULL WHERE logo_url IS NOT NULL;
