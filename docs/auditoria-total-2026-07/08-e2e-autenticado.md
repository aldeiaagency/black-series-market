# 08 — E2E autenticado por rol (validación en vivo)

Fecha: 2026-07-03 · Método: Playwright contra producción (blacklabelmarket.es) con cuentas de prueba
creadas y borradas para el test (buyer/dealer/admin). Objetivo doble: (a) validar que los fixes de
seguridad 057/058/059 no rompieron flujos legítimos; (b) recorrer los 3 roles de verdad (lo que la
capa 07 solo trazó por código).

## Resultado: los fixes de seguridad NO rompieron nada

| Rol | Login | Flujos verificados | Veredicto |
|-----|-------|--------------------|-----------|
| Comprador logueado | ✅ | home, /coches (48 tarjetas), ficha (911 GT3 RS), /cuenta, /cuenta/favoritos, /cuenta/alertas | OK — lecturas de catálogo intactas tras la RLS de 059 |
| Showroom (dealer) | ✅ /dashboard | dashboard, **guardado de perfil (persistido en BD)**, oportunidades, inventario, publicar, solicitudes, citas | OK — el trigger 058 permite editar el perfil; no bloquea lo legítimo |
| Admin | ✅ /admin-login y /login | panel, altas-showroom, vehículos, dealers, solicitudes, configuración | OK — assertAdmin + RLS no bloquean al admin real |

Prueba definitiva del trigger 058: se editó la descripción del showroom por la UI y **persistió** en
`dealers.description` ("Showroom QA — prueba E2E …"). Es decir, el guardado legítimo pasa; el intento
de tocar columnas comerciales (plan/verificación) se bloqueó en el test SQL previo. Comportamiento correcto.

## Hallazgos de la sesión (menores, preexistentes)

| Sev | Qué | Nota |
|-----|-----|------|
| Bajo | `406` en `dealers?select=id&profile_id=eq.<uid>` en cada página | El `Header` (checkDealer) usa `.single()`; para no-dealers devuelve 0 filas → 406. Ruido de consola, no rompe. Cambiar a `.maybeSingle()`. |
| Bajo | `404` de imágenes de Unsplash | Datos demo con URLs que 404. Cosmético; desaparece con stock real. |

`/admin-login` funciona (200); un primer intento falló por carrera de tiempos del propio test, no por un bug.

## Límite del test
No se ejercieron acciones destructivas ni el wizard de publicar completo (40+ campos); se validó carga,
sesión, guardado de perfil y navegación. El E2E funcional profundo (publicar un vehículo real, mover
kanban, moderar en admin) queda para una pasada dedicada si se quiere cobertura total de flujos de escritura.
