# Backlog Marketplace — Black Label Market

> Este documento recoge funcionalidades pendientes de implementar, separadas del MVP actual.
> No mezclar mocks con producción. Implementar de forma progresiva y controlada.

---

## Estado actual (MVP implementado)

- Marketplace de coches y motos con filtros URL-driven
- Favoritos en localStorage (sin cuenta)
- Comparador de hasta 3 vehículos (localStorage + URL)
- Búsqueda privada (formulario local, pendiente de backend)
- Ficha de vehículo premium (resumen, historial, condiciones, formulario cualificado)
- Perfil dealer showroom con inventario y bloque de confianza
- Página "Cómo funciona"
- Leads cualificados con contexto (plazo, financiación, parte de pago)
- Dashboard dealer (inventario, mensajes, analítica básica)
- Suscripciones Stripe
- Boost puntual Stripe (featured_until)
- Admin: moderación de vehículos, gestión de dealers, configuración plataforma

---

## Backlog futuro — no implementar sin planificación previa

### 1. Cuentas de comprador
- Registro y login de compradores
- Favoritos sincronizados en cuenta (no solo localStorage)
- Historial de búsquedas
- Alertas de precio y disponibilidad reales

### 2. Alertas de búsqueda reales
- Backend para guardar criterios de alerta por usuario
- Integración email (Resend / SendGrid) o WhatsApp
- Trigger automático cuando se publica vehículo compatible
- Gestión y cancelación de alertas

### 3. Backend búsqueda privada
- Tabla `search_requests` en Supabase
- API route para guardar solicitudes
- Integración con n8n para routing automático a dealers
- Dashboard de solicitudes en admin
- Notificación automática al equipo

### 4. Notificaciones email / WhatsApp
- Email transaccional al dealer cuando llega un lead
- Email de confirmación al comprador
- Webhook n8n para routing a GHL o CRM
- Templates de email (Resend)

### 5. Reservas
- Estado "Reservado" en vehículo desde el marketplace
- Depósito de reserva (Stripe)
- Gestión de reserva desde dashboard dealer
- Cancelación y devolución

### 6. Pagos y escrow
- Depósito de señal (Stripe)
- Escrow para operaciones completas
- Integración con sistema de verificación documental
- Historial de transacciones

### 7. Inspección independiente
- Integración con servicio de inspección (RACE, etc.)
- Solicitud de inspección desde ficha
- Informe adjunto al vehículo

### 8. Transporte nacional
- Solicitud de transporte desde ficha
- Integración con operador logístico
- Seguimiento de entrega

### 9. Financiación
- Calculadora de cuotas en ficha
- Solicitud de financiación integrada
- Integración con entidad financiera o broker

### 10. Lead scoring
- Scoring automático de leads por contexto (plazo, financiación, historial)
- Priorización de leads en dashboard dealer
- Alertas para leads de alta intención

### 11. Integración CRM / GHL
- Webhook desde leads a GHL
- Sincronización de contactos
- Pipelines de seguimiento
- Automatizaciones n8n → GHL

### 12. Comentarios y reseñas
- Reseñas de dealers por compradores verificados
- Rating promedio en perfil dealer
- Moderación de reseñas en admin
- Respuesta del dealer a reseñas

### 13. Histórico de precios
- Gráfica de evolución de precio en ficha
- Alerta de bajada de precio (comprador)
- Comparativa con precio de mercado

### 14. Newsletter y alertas de mercado
- Suscripción a newsletter del marketplace
- Digest semanal de nuevas unidades
- Alertas de segmento (coches deportivos, motos clásicas, etc.)

### 15. Favoritos compartibles
- URL pública de lista de favoritos
- Compartir selección de vehículos por link

### 16. Dashboard dealer avanzado
- Métricas de conversión lead → venta
- Comparativa de rendimiento entre unidades
- Sugerencias de optimización de ficha
- Recomendaciones de precio basadas en mercado

### 17. Aprobación editorial mejorada
- Checklist de calidad por unidad en admin
- Score de calidad de ficha (imágenes, descripción, specs)
- Rechazo automático por criterios mínimos no cumplidos
- Feedback estructurado al dealer

### 18. Búsqueda semántica
- Full-text search con PostgreSQL (pg_trgm)
- Búsqueda por descripción libre ("911 manual carrocería targa")
- Autocompletado con sugerencias de marca/modelo

### 19. Mapa de dealers
- Vista de mapa en /dealers
- Geolocalización de concesionarios
- Filtro por radio de distancia

### 20. API pública
- API REST para dealers con sistemas propios
- Sincronización automática de inventario
- Webhooks de eventos (nuevo lead, vista, favorito)

---

## Priorización recomendada (próximas fases)

**Fase MVP+1 (impacto inmediato):**
1. Backend búsqueda privada (tabla + API)
2. Notificaciones email transaccional (leads)
3. Alertas de búsqueda reales (email)
4. Integración n8n → GHL para leads

**Fase MVP+2 (crecimiento):**
5. Cuentas de comprador
6. Reseñas de dealers
7. Histórico de precios
8. Lead scoring

**Fase MVP+3 (monetización):**
9. Reservas con depósito Stripe
10. Financiación integrada
11. Inspección independiente

---

_Última actualización: 2026-05-23_
_Maintainer: Black Series Agency_
