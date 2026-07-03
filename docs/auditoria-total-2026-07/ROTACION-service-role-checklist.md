# Rotación de la service_role — checklist (tarea manual, baja urgencia)

Contexto: la `service_role` legacy quedó en el historial de git (scripts `*.mjs` eliminados). El repo es
privado (solo aldeiaagency) → riesgo real ≈ nulo, pero conviene rotar por higiene cuando haya ocasión.

## Por qué es manual (no automatizable limpio desde aquí)
- Las **API keys nuevas** (`sb_secret_...`) dan 401 en REST en este proyecto → NO son reemplazo directo (el sistema nuevo no está activo para PostgREST). Se descartó ese camino.
- La rotación real = **rodar el JWT secret** en Supabase, que **invalida también la anon key** (cierra sesiones — hoy inocuo, ~0 usuarios) y obliga a actualizar anon+service en 3 sitios.
- Uno de los sitios es **n8n** (`$env.SUPABASE_SERVICE_KEY`), variable del contenedor en EasyPanel/VPS → requiere EasyPanel o SSH (no accesible de forma automatizada limpia desde el entorno de trabajo).

## Momento ideal
Ahora (o cualquier momento con ~0 usuarios reales): el cierre de sesiones es indoloro.

## Pasos (5-10 min)
1. **Supabase** → Project Settings → API → JWT Settings → **Generate new JWT secret** (rota anon + service_role).
   - Copia las nuevas `anon` y `service_role`.
2. **Vercel** (proyecto black-series-market) → Settings → Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = nueva anon.
   - `SUPABASE_SERVICE_ROLE_KEY` = nueva service_role.
   - Redeploy (`vercel --prod --yes` o botón).
3. **n8n** (EasyPanel → servicio n8n → Environment):
   - `SUPABASE_SERVICE_KEY` = nueva service_role. (Si n8n usa anon en algún sitio, también.)
   - Deploy/restart del servicio. ⚠️ Recuerda: si algún día se pulsa Deploy en EasyPanel, re-fijar env (nota de durabilidad de PENDIENTES).
4. **`.env.local`** (local): actualizar `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY`.
5. **Verificar**:
   - Web: home 200, login OK.
   - n8n: disparar un WF (p. ej. alta de prueba) y confirmar que escribe en Supabase (250/200).
   - La clave vieja: cualquier request con la anon/service antiguas debe dar 401.

## Ayuda de Claude
Al retomar: "vamos a rotar la service_role" → Claude actualiza `.env.local` + Vercel y verifica la web y n8n tras el cambio; el paso del dashboard de Supabase y el env de n8n en EasyPanel los haces tú (o juntos por pantalla).
