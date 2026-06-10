# Analytics & Tracking — Configuración completa
# Black Label Market · blacklabelmarket.es

> Documento de referencia operativa. Actualizar cuando cambie cualquier ID, tag o configuración.
> Última actualización: 10 jun 2026

---

## IDs y credenciales de herramientas

| Herramienta | ID / Referencia | Estado |
|-------------|----------------|--------|
| Google Tag Manager | `GTM-PDZJ56X5` | ✅ Activo |
| Google Analytics 4 | `G-419RRDTX12` | ✅ Activo vía GTM |
| GA4 Stream ID | `15047337368` | ✅ |
| GA4 Stream URL | `https://blacklabelmarket.es` | ✅ |
| Microsoft Clarity | `x4syjlgbx7` | ✅ Activo vía GTM |
| Google Search Console | `blacklabelmarket.es` | ✅ Verificado |
| Bing Webmaster Tools | `blacklabelmarket.es` | ✅ Verificado |
| Supabase `platform_config` key=`seo` | `ga_id`, `gtm_id`, `clarity_id` | ✅ Configurado |

---

## Supabase — `platform_config` key=`seo`

```json
{
  "ga_id":      "G-419RRDTX12",
  "gtm_id":     "GTM-PDZJ56X5",
  "clarity_id": "x4syjlgbx7",
  "tagline":    "El marketplace de vehículos premium",
  "og_image":   "",
  "site_name":  "Black Series Market"
}
```

> `ga_id` ya no se usa en el código (GA4 carga vía GTM). Se mantiene como referencia.

---

## Arquitectura del stack

```
Usuario
  └─ app/layout.tsx (server component)
       ├─ <script> inline síncrono — Consent Mode v2 defaults (denied)
       │    └─ Restaura consentimiento previo desde localStorage
       └─ <Script> afterInteractive — GTM (GTM-PDZJ56X5)
              ├─ Tag: GA4 Configuration → G-419RRDTX12
              ├─ Tag: Microsoft Clarity → x4syjlgbx7
              ├─ Tag: GA4 dealer_contact_click
              ├─ Tag: GA4 vehiculo_carta_submit
              ├─ Tag: GA4 vehicle_detail_view
              └─ Tag: GA4 dealer_profile_view
```

**Flujo de consentimiento:**
1. Script inline establece `analytics_storage: denied` antes de que GTM cargue
2. Si el usuario ya consintió → restaura desde `localStorage` (`black_label_cookie_consent`)
3. Banner de cookies → usuario decide → `saveConsent()` → `gtag('consent','update',{...})`
4. GTM y GA4 respetan las señales de Consent Mode v2 automáticamente

---

## Consent Mode v2 — Archivo: `app/layout.tsx`

Script inline síncrono (antes de GTM):
```javascript
gtag('consent', 'default', {
  analytics_storage:      'denied',
  ad_storage:             'denied',
  ad_personalization:     'denied',
  personalization_storage:'denied',
  functionality_storage:  'granted',
  security_storage:       'granted',
  wait_for_update: 500
})
gtag('set', 'ads_data_redaction', true)
gtag('set', 'url_passthrough', true)
// + restauración desde localStorage si existe consentimiento previo
```

Actualización en tiempo real: `lib/cookies/consent.ts` → `saveConsent()` llama a `gtag('consent','update',{...})`.

localStorage key: `black_label_cookie_consent` · versión: `1.0`

---

## GTM — Contenedor GTM-PDZJ56X5

### Variables creadas

| Nombre GTM | Tipo | Nombre en dataLayer |
|------------|------|---------------------|
| `DLV - contact_method` | Variable de capa de datos | `contact_method` |
| `DLV - vehicle_id` | Variable de capa de datos | `vehicle_id` |
| `DLV - dealer_id` | Variable de capa de datos | `dealer_id` |
| `DLV - vehicle_type` | Variable de capa de datos | `vehicle_type` |
| `DLV - timeline` | Variable de capa de datos | `timeline` |

### Tags configurados

| Nombre | Tipo | Evento GA4 | Activador | Consent |
|--------|------|-----------|-----------|---------|
| `GA4 — Configuration` | GA4 Configuration | — | All Pages | Consent Mode nativo |
| `Microsoft Clarity - Oficial` | Microsoft Clarity | — | All Pages | `analytics_storage` requerido |
| `GA4 — dealer_contact_click` | GA4 Event | `dealer_contact_click` | Custom Event: `dealer_contact_click` | Heredado de GA4 Config |
| `GA4 — vehiculo_carta_submit` | GA4 Event | `vehiculo_carta_submit` | Custom Event: `vehiculo_carta_submit` | Heredado de GA4 Config |
| `GA4 — vehicle_detail_view` | GA4 Event | `vehicle_detail_view` | Pageview → Page Path contiene `/coches/` OR `/motos/` | Heredado |
| `GA4 — dealer_profile_view` | GA4 Event | `dealer_profile_view` | Pageview → Page Path contiene `/dealers/` | Heredado |

### Parámetros de eventos

| Evento | Parámetro | Variable GTM | Origen |
|--------|-----------|-------------|--------|
| `dealer_contact_click` | `contact_method` | `{{DLV - contact_method}}` | `whatsapp` / `phone` / `form` |
| `dealer_contact_click` | `vehicle_id` | `{{DLV - vehicle_id}}` | UUID del vehículo |
| `dealer_contact_click` | `dealer_id` | `{{DLV - dealer_id}}` | UUID del dealer |
| `vehiculo_carta_submit` | `vehicle_type` | `{{DLV - vehicle_type}}` | `car` / `motorcycle` / `any` |
| `vehiculo_carta_submit` | `timeline` | `{{DLV - timeline}}` | `immediate` / `1_3_months` / ... |

---

## GA4 — Configuración interna

| Ajuste | Valor |
|--------|-------|
| Enhanced Measurement | ✅ Activo (scroll, outbound clicks, site search, video, file downloads) |
| Data retention | 14 meses |
| Search Console | ✅ Enlazado a `blacklabelmarket.es` |
| Conversiones | ⬜ Pendiente marcar (AN12) |

### Audiencias creadas

| Nombre | Condición | Membership |
|--------|-----------|------------|
| `Visitantes fichas vehículo` | Page path contains `/coches/` OR `/motos/` | 30 días |
| `Interés profesional` | Page path contains `/para-profesionales` OR `/precios` | 30 días |
| `Alta intención compra` | Page path contains `/vehiculos-a-la-carta` | 30 días |
| `Visitantes dealers` | Page path contains `/dealers/` | 30 días |

### Conversiones pendientes de marcar (AN12)
- `dealer_contact_click` → macro-conversión B2C principal
- `vehiculo_carta_submit` → macro-conversión B2C secundaria

---

## Código modificado — dataLayer pushes

### `components/marketplace/TrackLink.tsx`
Dispara `dealer_contact_click` al hacer clic en WhatsApp o teléfono desde ficha de vehículo.
```typescript
dataLayer.push({
  event:          'dealer_contact_click',
  contact_method: eventType === 'vehicle_whatsapp_click' ? 'whatsapp' : 'phone',
  vehicle_id,
  dealer_id,
})
```

### `components/marketplace/QualifiedLeadForm.tsx`
Dispara `dealer_contact_click` al enviar formulario de contacto desde ficha de vehículo.
```typescript
dataLayer.push({
  event:          'dealer_contact_click',
  contact_method: 'form',
  vehicle_id,
  dealer_id,
})
```

### `components/marketplace/PrivateSearchForm.tsx`
Dispara `vehiculo_carta_submit` al enviar formulario de búsqueda a la carta.
```typescript
dataLayer.push({
  event:        'vehiculo_carta_submit',
  vehicle_type: data.vehicle_type,
  timeline:     data.timeline,
})
```

---

## Google Search Console

- Propiedad: `https://blacklabelmarket.es` (dominio verificado)
- Sitemap: `https://blacklabelmarket.es/sitemap.xml` — **pendiente enviar tras G01**
- Enlazado a GA4: ✅

## Bing Webmaster Tools

- Dominio verificado vía `BingSiteAuth.xml` en `/public`
- Sitemap enviado: `https://blacklabelmarket.es/sitemap.xml`
- GSC conectado: ✅
- Relevancia GEO: Bing indexa ChatGPT (Copilot) y Perplexity

---

## Pixels de paid media — Pendientes

> No instalar hasta activar el canal correspondiente.

| Canal | Tag GTM | Requiere |
|-------|---------|---------|
| Meta (Facebook/Instagram) | Facebook Pixel template | Pixel ID de Meta Events Manager |
| LinkedIn | Custom HTML (Insight Tag) | Partner ID de LinkedIn Campaign Manager |
| TikTok | Custom HTML | Pixel ID de TikTok Ads Manager |
| Google Ads | Google Ads Conversion Tracking | Conversion ID + Label |

---

## Checklist de estado

- ✅ Consent Mode v2 activo (defaults denied, restauración localStorage)
- ✅ GTM activo en producción
- ✅ GA4 activo vía GTM (Enhanced Measurement ON)
- ✅ GA4 retención 14 meses
- ✅ GA4 + Search Console enlazados
- ✅ GA4 audiencias creadas (4)
- ✅ Clarity activo vía GTM
- ✅ Bing Webmaster Tools verificado + sitemap
- ✅ dataLayer pushes en TrackLink, QualifiedLeadForm, PrivateSearchForm
- ✅ GTM tags: GA4 Config + Clarity + 4 eventos
- ✅ GTM v2 publicado (`v2 — GA4 events`)
- ⬜ GA4 key events marcados (AN12) — `dealer_contact_click` disparado, esperando 24h para aparecer en GA4
- ⬜ Search Console sitemap enviado (tras G01)
- ⬜ Pixels paid media (cuando se activen canales)
