# Deployment Checklist — Black Label Market
**Plataforma objetivo:** Vercel / Easypanel  
**Entorno Supabase:** Proyecto propio (no compartido)

---

## 1. Variables de entorno (obligatorias)

Configurar en la plataforma de deploy **antes** del primer despliegue:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima pública de Supabase | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave service role (solo servidor) | `eyJ...` |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio en producción | `https://blacklabelmarket.com` |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Secret del webhook de Stripe | `whsec_...` |
| `STRIPE_PRICE_ID_STANDARD` | Price ID del plan Standard | `price_...` |
| `STRIPE_PRICE_ID_PREMIUM` | Price ID del plan Premium | `price_...` |
| `STRIPE_PRICE_ID_ELITE` | Price ID del plan Elite | `price_...` |

---

## 2. Supabase — antes de abrir registro

- [ ] Verificar que RLS está habilitado en todas las tablas (`vehicles`, `dealers`, `leads`, `profiles`)
- [ ] Verificar políticas de RLS: un dealer solo puede leer/escribir sus propios registros
- [ ] Verificar política de `leads`: solo el dealer propietario del vehículo puede leer el lead
- [ ] Activar confirmación de email en Auth (recomendado para evitar registros basura)
- [ ] Configurar URL de redirección tras confirmación de email → `https://blacklabelmarket.com/dashboard`
- [ ] Revisar límites del plan Supabase (requests, storage, ancho de banda)
- [ ] Activar backups automáticos

---

## 3. Stripe — antes de activar planes de pago

- [ ] Crear los 3 productos y precios en Stripe Dashboard (Standard 149€/mes, Premium 349€/mes, Elite 699€/mes)
- [ ] Configurar webhook en Stripe → URL: `https://blacklabelmarket.com/api/stripe/webhooks`
  - Eventos requeridos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- [ ] Verificar que `STRIPE_WEBHOOK_SECRET` coincide con el endpoint configurado
- [ ] Probar flujo completo de checkout en modo test antes de activar live

---

## 4. DNS y dominio

- [ ] Apuntar dominio a la plataforma de hosting (Vercel: añadir dominio personalizado)
- [ ] Verificar SSL/TLS activo (automático en Vercel; manual en VPS)
- [ ] Configurar redirects: `www.` → sin www (o al revés, consistente)
- [ ] Verificar que `NEXT_PUBLIC_SITE_URL` coincide exactamente con el dominio final

---

## 5. Email operacional

- [ ] Activar buzón `hola@blackseriesmarket.com` (contacto y soporte)
- [ ] Activar buzón `privacidad@blackseriesmarket.com` (RGPD/LOPDGDD)
- [ ] Configurar SPF, DKIM y DMARC para el dominio
- [ ] Si se usa Resend/Mailgun para formulario de contacto: añadir `RESEND_API_KEY` a env vars

---

## 6. Pre-deploy — verificaciones de código

- [ ] `npx tsc --noEmit` → 0 errores ✅ (verificado)
- [ ] `npm run lint` → 0 errores ✅ (verificado)
- [ ] `npm run build` → build limpio ✅ (verificado — 40 páginas)
- [ ] Confirmar que `.env.local` **no** está en el repositorio (verificar `.gitignore`)
- [ ] Confirmar que `SUPABASE_SERVICE_ROLE_KEY` solo se usa en rutas server-side (API routes, Server Components)

---

## 7. Deploy inicial

```bash
# Vercel (CLI)
vercel --prod

# O desde el dashboard de Vercel: conectar repositorio → desplegar rama main
```

- [ ] Confirmar que el build en CI/Vercel pasa sin errores
- [ ] Confirmar que todas las variables de entorno están disponibles en el entorno de producción

---

## 8. Post-deploy — smoke tests

Verificar manualmente tras cada deploy:

| Test | URL | Resultado esperado |
|---|---|---|
| Home carga | `/` | Secciones hero, diferencial, buyer block visibles |
| Listado coches | `/coches` | Grid de vehículos (o estado vacío limpio) |
| Ficha vehículo | `/coches/[slug]` | Imágenes, specs, formulario lead |
| Lead form | `/coches/[slug]` | Submit → registro en `leads` tabla Supabase |
| Dealers/Showrooms | `/dealers` | Listado de showrooms |
| Búsqueda privada | `/busqueda-privada` | Formulario, disclaimer |
| Comparador vacío | `/comparar` | Estado vacío con CTAs |
| Favoritos vacíos | `/mis-favoritos` | Estado vacío con CTAs |
| Cómo funciona | `/como-funciona` | Página completa, sin "dealer" |
| Precios | `/precios` | Planes con CTAs a /registro |
| Registro | `/registro` | Formulario 2 pasos, Logo correcto |
| Login | `/login` | Formulario, Logo correcto |
| Legal — aviso | `/legal/aviso-legal` | Contenido completo |
| Legal — privacidad | `/legal/privacidad` | Contenido completo |
| Legal — cookies | `/legal/cookies` | Lista de cookies visible (no tabla rota) |
| Legal — términos | `/legal/terminos` | Contenido completo |
| 404 | `/ruta-inexistente` | Página 404 con branding |
| robots.txt | `/robots.txt` | Reglas correctas, dominio en Sitemap |

---

## 9. Monitorización y alertas (recomendado)

- [ ] Configurar alertas de error en Vercel (crashes, 5xx)
- [ ] Activar Supabase monitoring para detectar picos de uso o errores de RLS
- [ ] Configurar alertas de Stripe para pagos fallidos
- [ ] Opcional: Sentry para tracking de errores de cliente/servidor

---

## 10. Apertura controlada (piloto)

Secuencia recomendada antes de abrir registro público:

1. Deploy inicial con acceso restringido (dominio activo, sin publicidad)
2. Invitar manualmente a 2-3 concesionarios piloto
3. Verificar flujo completo: registro → dashboard → publicar vehículo → lead de comprador
4. Revisar que los leads llegan a la tabla `leads` de Supabase con contexto correcto
5. Confirmar que el billing de Stripe funciona end-to-end
6. Abrir registro público

---

## Historial de versiones de este checklist

| Versión | Fecha | Cambios |
|---|---|---|
| 1.0 | Mayo 2026 | Versión inicial — post PUNTO 10 QA |
