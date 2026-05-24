# Black Label Market — Backlog futuro y roadmap producto

> Documento de referencia operativa para las próximas iteraciones de Black Label Market.
> Última actualización: 2026-05-24. Versión: 2.0

---

## Contexto

Black Label Market es un marketplace curado de coches y motos premium, deportivos, clásicos, enthusiast y unidades especiales. Se desarrolla de forma progresiva siguiendo un principio claro:

**No construir complejidad antes de validar inventario, profesionales, compradores y flujo de contacto.**

La plataforma evolucionará en etapas:

1. Marketplace visual y funcional
2. Captación y cualificación de demanda
3. Paneles y cuentas reales
4. Operación profesional y reporting
5. Marketplace transaccional
6. Ecosistema avanzado Black Series / Black Label

---

## 1. Principios de roadmap

- El marketplace crece por **validación**, no por acumulación de funcionalidades.
- El MVP debe demostrar que hay interés real de compradores y profesionales antes de construir paneles.
- No se construyen pagos, reservas, escrow o paneles complejos sin inventario suficiente y demanda probada.
- No se automatiza un proceso que todavía no esté claro manualmente.
- La **confianza es prioritaria** frente a la velocidad de publicación.
- La calidad del stock importa más que el volumen inicial.
- La captación de demanda mediante búsqueda privada y alertas es tan importante como el inventario visible.
- La conexión con Black Series debe aparecer cuando aporte valor operativo, no como reclamo artificial.
- Toda funcionalidad futura debe mejorar una de estas áreas:
  - **confianza**
  - **inventario**
  - **conversión**
  - **cualificación**
  - **reporting**
  - **retención**
  - **monetización**

---

## 2. Qué pertenece al MVP

Las siguientes funcionalidades pertenecen al MVP actual o cercano. Pueden estar en modo local/mock si no hay backend real todavía.

| Funcionalidad | Estado |
|---|---|
| Home premium con posicionamiento diferencial | ✅ Implementado |
| Navegación header/footer coherente | ✅ Implementado |
| Listado de coches con filtros | ✅ Implementado |
| Listado de motos con filtros | ✅ Implementado |
| Cards de vehículo | ✅ Implementado |
| Ficha de vehículo completa | ✅ Implementado |
| Perfil de profesional / showroom | ✅ Implementado |
| Favoritos locales (localStorage) | ✅ Implementado |
| Comparador básico | ✅ Implementado |
| Alertas mock / preparadas | ✅ Preparado |
| Búsqueda privada preparada | ✅ Preparado |
| Filtros básicos (marca, precio, año, km, CV) | ✅ Implementado |
| Filtros avanzados (garantía, financiación, destacados, búsqueda inline) | ✅ Implementado |
| ActiveFiltersBar con chips removibles | ✅ Implementado |
| Estados de vehículo (activo, reservado, vendido) | ✅ Implementado |
| Formulario de solicitud cualificada | ✅ Implementado |
| Páginas de confianza (cómo funciona) | ✅ Implementado |
| Páginas legales base | ✅ Implementado |
| Footer y navegación coherentes | ✅ Implementado |
| Capa diferencial Black Label (terminología, secciones) | ✅ Implementado |
| Diseño responsive | ✅ Implementado |
| Datos mock/seed para demo | ✅ Implementado |
| Estructura preparada para backend futuro | ✅ Implementado |
| SEO básico (metadata, OG, JSON-LD) | ✅ Implementado |
| Build estable sin errores | ✅ Implementado |

---

## 3. Qué queda fuera del MVP

Las siguientes funcionalidades están explícitamente **fuera del MVP actual**. No deben construirse hasta cumplir los criterios de fase correspondiente.

| Funcionalidad | Fase objetivo |
|---|---|
| Login real comprador | Fase 3 |
| Login real profesional | Fase 3 |
| Panel profesional completo | Fase 3 |
| Panel admin completo | Fase 3 |
| Publicación real de vehículos desde formulario | Fase 3 |
| Aprobación editorial real | Fase 3 |
| Lead scoring real | Fase 4 |
| Integración GHL / n8n real | Fase 2 |
| Notificaciones reales email / WhatsApp | Fase 2 |
| CRM interno | Fase 4 |
| Pagos | Fase 5 |
| Reservas online | Fase 5 |
| Escrow | Fase 5 |
| Transporte integrado | Fase 5 |
| Financiación integrada | Fase 5 |
| Inspección mecánica integrada | Fase 5 |
| Verificación documental avanzada | Fase 5 |
| Contratos y firma digital | Fase 5 |
| Histórico de precios | Fase 4–5 |
| Tasaciones | Fase 5 |
| Reviews verificadas de compradores | Fase 5 |
| Reputación pública de profesionales | Fase 5 |
| App móvil nativa | Fase 6 |
| Subastas | Fase 5 |
| Pujas privadas | Fase 5 |
| API pública | Fase 6 |
| Analítica avanzada por unidad | Fase 4 |
| Marketplace internacional | Fase 6 |

---

## 4. Fase 1 — Marketplace curado

**Objetivo:** tener una plataforma pública creíble y usable que pueda mostrarse a profesionales y compradores sin parecer incompleta.

### Incluye

- Diseño final Black Label Market aplicado
- Inventario mock o inicial real (mínimo 10–20 vehículos)
- Coches y motos con fichas completas
- Profesionales visibles con perfil coherente
- Búsqueda básica y filtros MVP
- Búsqueda privada (aunque sea mock)
- Favoritos locales
- Comparador básico
- Formularios preparados (aunque no conectados a email real)
- Páginas legales base
- SEO básico
- Responsive correcto en móvil y escritorio
- Build estable sin errores

### Criterio de salida

> La web puede enseñarse a profesionales y compradores potenciales sin parecer incompleta o improvisada. Un profesional puede ver su inventario publicado y un comprador puede explorar, filtrar y hacer una solicitud.

---

## 5. Fase 2 — Captación y cualificación

**Objetivo:** convertir tráfico en demanda útil y trazable.

### Incluye

- Conexión de formularios a email o webhook (n8n / Make / GHL)
- Integración inicial con n8n, Make o GoHighLevel
- Registro real de búsqueda privada con datos estructurados
- Alertas reales por email cuando aparece vehículo compatible
- Lead capture estructurado por tipo de vehículo
- Formularios con campos de intención (plazo, financiación, entrega)
- Etiquetado de origen de solicitud (vehículo, búsqueda privada, contacto directo)
- Base inicial de compradores interesados
- Segmentación por tipo de vehículo (coche / moto / tipo / marca)
- Captación de profesionales interesados (formulario de solicitud de acceso)
- Dashboard manual de leads en Airtable, Notion, GHL o equivalente

### Criterio de salida

> Cada solicitud queda registrada, trazada y utilizable por Black Label / Black Series. El equipo puede actuar sobre cualquier lead en menos de 24h.

---

## 6. Fase 3 — Cuentas y paneles

**Objetivo:** permitir operación básica autónoma de compradores, profesionales y admin interno.

### Comprador

- Cuenta de usuario (email + contraseña)
- Favoritos persistentes vinculados a cuenta
- Búsquedas guardadas
- Alertas reales configuradas por el comprador
- Historial de solicitudes enviadas
- Preferencias de tipo de vehículo
- Lista privada de vehículos deseados

### Profesional

- Login profesional
- Perfil de showroom editable
- Alta de vehículos desde panel
- Edición de vehículos publicados
- Subida de imágenes propia
- Gestión de disponibilidad por unidad
- Recepción de solicitudes entrantes
- Estados básicos de oportunidad (nuevo, en gestión, cerrado)
- Métricas básicas por unidad (vistas, solicitudes)

### Admin

- Gestión de usuarios registrados
- Gestión de profesionales (alta, baja, validación)
- Gestión de vehículos (lista completa, estados)
- Revisión de fichas publicadas
- Aprobación / rechazo de publicaciones
- Moderación de imágenes
- Control de estados del inventario
- Gestión de categorías y marcas

### Criterio de salida

> La plataforma deja de depender de edición manual de datos en base de datos. Los profesionales pueden publicar y los compradores pueden gestionar su actividad sin intervención del equipo.

---

## 7. Fase 4 — Operación profesional y reporting

**Objetivo:** conectar Black Label con la tesis operativa de Black Series y producir datos accionables.

### Incluye

- Reporting de solicitudes por vehículo
- Tiempo de respuesta del profesional
- Oportunidades no atendidas (alertas de silencio)
- Seguimiento de estados de oportunidad
- Alertas de solicitudes sin respuesta
- Lead aging (tiempo desde solicitud sin acción)
- Conversión por unidad y por profesional
- Rendimiento por categoría de vehículo
- Stock con baja activación o vistas sin solicitud
- Recomendaciones básicas de publicación
- Conexión con Black Series Agency para identificar profesionales con fuga comercial
- Oferta de Black Audit / servicio comercial para showrooms con bajo rendimiento detectado

### Criterio de salida

> Black Label empieza a producir datos accionables para profesionales. El equipo de Black Series puede identificar oportunidades B2B desde los datos del marketplace.

---

## 8. Fase 5 — Marketplace transaccional

**Objetivo:** añadir capas de operación avanzada solo si existe tracción probada.

### Incluye

- Reserva online
- Pago de señal o depósito
- Escrow para operaciones de importe elevado
- Contratos estandarizados
- Firma digital
- Financiación integrada con entidades partner
- Transporte coordinado
- Inspección mecánica previa
- Verificación documental
- Gestión de garantías postventa
- Soporte estructurado comprador-vendedor
- Flujo de compraventa asistido paso a paso
- Subastas para unidades especiales
- Pujas privadas
- Ofertas vinculantes con plazo

### ⚠️ Advertencia

**No construir esta fase hasta validar:**

- Volumen de inventario suficiente (mínimo 100+ vehículos activos)
- Demanda real medible (solicitudes recurrentes)
- Confianza de profesionales en la plataforma
- Marco legal asesorado por especialista en compraventa de vehículos
- Operación manual previa validada durante al menos 2–3 meses
- Modelo de monetización definido y aprobado

---

## 9. Fase 6 — Ecosistema avanzado Black Series / Black Label

**Objetivo:** convertir Black Label en una capa estratégica del ecosistema Black Series.

### Incluye

- Integración profunda con CRM (GHL u equivalente)
- Scoring avanzado de compradores y profesionales
- Buyer intent (señales de intención de compra)
- Reporting profesional personalizado por showroom
- Dashboard multi-showroom para grupos con varios puntos de venta
- Recomendaciones de stock basadas en demanda registrada
- Pricing intelligence (referencia de mercado por modelo)
- Histórico de precios por vehículo y categoría
- Contenido editorial conectado a vehículos específicos
- Newsletter segmentada por tipo de vehículo e intención
- Marketplace + media (artículos, pruebas, análisis integrados)
- Integración con marca personal de Black Series
- Captación B2B desde datos del marketplace
- Sistema Anti-Fuga para profesionales con solicitudes no gestionadas
- Automatización de seguimiento de oportunidades
- Revenue intelligence (estimación de potencial por showroom)
- API pública para integraciones externas
- App móvil comprador

### Criterio de salida

> Black Label deja de ser solo marketplace y se convierte en motor de datos, demanda y relación B2B para el ecosistema Black Series.

---

## 10. Backlog por áreas

### Producto comprador

- [ ] Favoritos persistentes (cuenta, no localStorage)
- [ ] Alertas reales por email de nuevo vehículo
- [ ] Comparador avanzado con más criterios y guardado
- [ ] Búsqueda privada real con seguimiento de estado
- [ ] Cuenta de comprador (registro, login)
- [ ] Historial de solicitudes enviadas
- [ ] Recomendaciones personalizadas basadas en comportamiento
- [ ] Vehículos similares inteligentes (más allá del tipo)
- [ ] Notificaciones en plataforma
- [ ] Listas privadas de vehículos deseados
- [ ] Newsletter segmentada opt-in

### Producto profesional

- [ ] Formulario de solicitud de acceso con campos estructurados
- [ ] Onboarding profesional guiado paso a paso
- [ ] Panel profesional (login, panel, estadísticas)
- [ ] Alta de vehículos desde interfaz sin tocar base de datos
- [ ] Edición de fichas publicadas
- [ ] Subida de imágenes propia con gestión de galería
- [ ] Gestión de disponibilidad por unidad (activo/pausado/vendido)
- [ ] Recepción y gestión de solicitudes entrantes
- [ ] Métricas básicas por unidad y por mes
- [ ] Scoring de calidad de ficha (completitud, imágenes, descripción)
- [ ] Sugerencias editoriales por unidad para mejorar conversión

### Admin interno

- [ ] Panel admin con listados completos
- [ ] Aprobación y rechazo de profesionales
- [ ] Aprobación y revisión de vehículos antes de publicar
- [ ] Revisión de imágenes subidas
- [ ] Control de categorías y normalización de marcas
- [ ] Moderación de contenido
- [ ] Trazabilidad de cambios por vehículo (historial)
- [ ] Gestión de leads y solicitudes entrantes
- [ ] Exportaciones CSV / Excel de datos
- [ ] Auditoría interna de actividad

### Datos y búsqueda

- [ ] Base de datos real con profesionales y vehículos reales
- [ ] Buscador avanzado con relevancia semántica
- [ ] Filtros dinámicos por disponibilidad real
- [ ] Normalización de marcas y modelos (catálogo controlado)
- [ ] Taxonomía de categorías de coches
- [ ] Taxonomía de categorías de motos
- [ ] Histórico de precios por vehículo
- [ ] Scoring de vehículos (calidad de ficha + actividad)
- [ ] Detección de duplicados

### Confianza y legal

- [ ] Términos de uso específicos para profesionales
- [ ] Términos de uso para compradores
- [ ] Política de publicación pública y detallada
- [ ] Criterios de admisión de profesionales documentados y publicados
- [ ] Política de verificación (qué revisamos, qué no, con qué límites)
- [ ] Disclaimers revisados en fichas y formularios
- [ ] Documentación de operación interna
- [ ] Revisión legal completa con asesor especializado
- [ ] Protección de datos RGPD auditada externamente
- [ ] Gestión de cookies conforme (banner, preferencias)

### Monetización

- [ ] Planes profesionales (definición + pricing + contratación)
- [ ] Destacados de unidades como producto de pago
- [ ] Black Label Selection como capa de curación premium
- [ ] Campañas de inventario (posicionamiento adicional temporal)
- [ ] Leads cualificados como producto premium para profesionales
- [ ] Suscripción profesional mensual / anual
- [ ] Fee por operación cerrada (si hay transaccional)
- [ ] Servicios Black Series integrados (Black Audit, consultoría comercial)
- [ ] Contenido patrocinado editorial
- [ ] Marketplace transaccional con comisión

### Integraciones

- [ ] GHL (GoHighLevel) — CRM y automatización de leads
- [ ] n8n — automatización de flujos internos
- [ ] Make — alternativa a n8n para algunos flujos
- [ ] Email transaccional (Resend, Postmark o SendGrid)
- [ ] WhatsApp Business API
- [ ] Analytics (GA4, Plausible o Mixpanel)
- [ ] CRM profesional (HubSpot, Pipedrive o GHL)
- [ ] Almacenamiento de imágenes (Cloudinary o Supabase Storage)
- [ ] CDN para imágenes y assets
- [ ] Pagos (Stripe u equivalente)
- [ ] Firma digital (DocuSign, Signaturit o equivalente)
- [ ] Financiación (partner bancario o fintech)
- [ ] Transporte (proveedor logístico)

### Contenido y media

- [ ] Guías de compra por categoría de vehículo
- [ ] Entrevistas con profesionales del sector
- [ ] Pruebas de vehículos publicadas editorialmente
- [ ] Análisis de mercado por segmento
- [ ] Vehículos destacados editorialmente (Black Label Icon)
- [ ] Contenido de marca personal Black Series
- [ ] Newsletter curada por tipo de vehículo
- [ ] Vídeos de presentación de showrooms
- [ ] Fichas editoriales complementarias a la ficha técnica

---

## 11. Prioridad MoSCoW

### Must have *(sin esto el MVP no funciona)*

- Formularios de solicitud funcionando correctamente y llegando a alguien
- Búsqueda básica con filtros esenciales
- Fichas de vehículo completas y sin datos incompletos visibles
- Profesionales visibles con perfil coherente
- Páginas legales base publicadas
- Diseño responsive correcto en móvil y escritorio
- Datos trazables desde cualquier formulario

### Should have *(importante, no bloquea el MVP pero es necesario pronto)*

- Alertas reales de vehículo nuevo por email
- Búsqueda privada real conectada a CRM o email
- Favoritos persistentes con cuenta de comprador
- Panel profesional básico (al menos edición de perfil y vehículos)
- Panel admin básico (al menos revisión y aprobación de vehículos)
- Aprobación editorial antes de publicación real

### Could have *(añade valor, pero no es urgente en primeras semanas)*

- Comparador avanzado con más criterios y guardado
- Recomendaciones de vehículos similares inteligentes
- Newsletter segmentada
- Scoring de calidad de ficha
- Analytics avanzado por unidad
- Contenido editorial conectado a vehículos

### Won't have now *(explícitamente descartado para las próximas fases)*

- Pagos de cualquier tipo
- Escrow o transacción asistida
- Subastas o pujas
- App móvil nativa
- Financiación integrada con entidades
- Inspección mecánica online
- Internacionalización compleja (fuera de España)
- API pública

---

## 12. Riesgos de construir demasiado pronto

| Riesgo | Descripción | Severidad |
|---|---|---|
| **Sobreingeniería** | Construir arquitectura para 100.000 usuarios antes de tener 100 | Alta |
| **Dispersión de producto** | Añadir funcionalidades por presión sin validar las anteriores | Alta |
| **Paneles sin usuarios** | Construir panel profesional completo sin profesionales activos | Alta |
| **Pagos sin operaciones** | Implementar Stripe antes de cerrar ninguna operación manualmente | Alta |
| **Confianza legal asumida** | Prometer verificación o garantías que no se han implementado realmente | Alta |
| **Verificación falsa** | Mostrar badges "verificado" sin proceso real que los respalde | Alta |
| **Automatización sin proceso manual** | Automatizar con n8n un proceso que no se ha validado a mano primero | Media |
| **Generalismo involuntario** | Abrir el marketplace a stock genérico por presión de volumen | Alta |
| **Pérdida de posicionamiento premium** | Publicar inventario de baja calidad para parecer grande | Alta |
| **Confusión Black Series / Black Label** | No dejar claro qué es el marketplace y qué es la agencia | Media |
| **Falta de separación de roles** | No separar claramente el producto para comprador, profesional y admin | Media |

---

## 13. Dependencias técnicas

Decisiones técnicas que deben tomarse antes de cada fase. Lo marcado como pendiente requiere decisión antes de implementar.

| Componente | Decisión actual | Estado |
|---|---|---|
| Framework frontend | Next.js 14 App Router | ✅ Decidido |
| Base de datos | Supabase (PostgreSQL) | ✅ Decidido |
| Autenticación | Supabase Auth (preparado) | ⚠️ Pendiente de roles y permisos |
| Almacenamiento de imágenes | Supabase Storage | ⚠️ Pendiente de CDN |
| CDN | Sin definir | ❌ Pendiente de decisión |
| Búsqueda full-text | Supabase + ILIKE (actual) | ⚠️ Escalar a Algolia si hay volumen |
| Roles y permisos (RLS) | Row Level Security Supabase | ⚠️ Pendiente de implementación |
| Formularios | Supabase directo | ⚠️ Conectar a webhook/email en Fase 2 |
| CRM | Sin definir | ❌ Pendiente: GHL, HubSpot o Notion |
| Webhooks / automatización | Sin definir | ❌ Pendiente: n8n o Make |
| Email transaccional | Sin definir | ❌ Pendiente: Resend, Postmark o SendGrid |
| Analytics | Sin definir | ❌ Pendiente: GA4, Plausible o Mixpanel |
| Hosting | Vercel | ✅ Decidido |
| Backups de base de datos | Sin activar | ❌ Pendiente: activar en Supabase |
| Seguridad básica | Sin auditar | ❌ Pendiente: revisión OWASP básica |
| Pagos | Sin definir | ⛔ No decidir hasta Fase 5 |
| Firma digital | Sin definir | ⛔ No decidir hasta Fase 5 |

---

## 14. Dependencias de negocio

Antes de avanzar a fases complejas, se requieren estas decisiones de negocio. No construir sistemas para decisiones que todavía no están tomadas.

| Decisión | Necesaria para | Estado |
|---|---|---|
| Definir modelo de monetización | Fase 2–3 | ❌ Pendiente |
| Definir criterios formales de publicación | Fase 2 | ❌ Pendiente |
| Captar primeros 5–10 profesionales | Fase 1–2 | ❌ Pendiente |
| Validar inventario inicial real | Fase 1 | ❌ Pendiente |
| Validar demanda de compradores | Fase 2 | ❌ Pendiente |
| Definir proceso de alta profesional | Fase 2 | ❌ Pendiente |
| Definir proceso de aprobación de vehículos | Fase 2 | ❌ Pendiente |
| Definir términos legales con asesor especializado | Fase 2 | ❌ Pendiente |
| Definir SLA esperado de respuesta a solicitudes | Fase 3 | ❌ Pendiente |
| Definir relación Black Label / Black Series Agency | Fase 4 | ❌ Pendiente |
| Definir si Black Label intermedia o solo conecta | Fase 1–2 | ❌ Pendiente |
| Definir si habrá comisión por operación | Fase 5 | ❌ Pendiente |

---

## 15. Criterios para pasar de fase

### De Fase 1 a Fase 2

- [ ] Web estable en producción sin errores críticos
- [ ] Formularios técnicamente funcionales (aunque no conectados a email real)
- [ ] Al menos 1 profesional interesado en publicar
- [ ] Inventario inicial de al menos 10 vehículos
- [ ] Búsqueda privada generando señales (al menos 5 solicitudes recibidas)
- [ ] Criterios de publicación definidos internamente

### De Fase 2 a Fase 3

- [ ] Solicitudes reales recurrentes (mínimo 10–20 por mes)
- [ ] Necesidad manifiesta de no gestionar todo manualmente
- [ ] Al menos 3–5 profesionales publicando con regularidad
- [ ] Volumen de vehículos suficiente (mínimo 30–50 activos)
- [ ] CRM manual en funcionamiento y saturándose por volumen

### De Fase 3 a Fase 4

- [ ] Datos suficientes para reporting (mínimo 3 meses de actividad)
- [ ] Profesionales con actividad mensual regular
- [ ] Necesidad real de control operativo más fino
- [ ] Profesionales expresando necesidad de métricas propias

### De Fase 4 a Fase 5

- [ ] Confianza de profesionales demostrada (renovaciones)
- [ ] Tracción de compradores demostrada (demanda recurrente)
- [ ] Asesoramiento legal específico para transacciones
- [ ] Operaciones manuales de compraventa asistida validadas
- [ ] Modelo económico de transaccional definido y aprobado
- [ ] Al menos 1 operación piloto completada manualmente

---

## 16. Decisiones explícitas de no implementación actual

Las siguientes decisiones están tomadas explícitamente para la fase actual del producto. No deben cuestionarse sin revisar si los criterios de paso de fase se han cumplido.

| Decisión | Justificación |
|---|---|
| **No implementamos pagos** | Sin operaciones validadas manualmente primero |
| **No implementamos escrow** | Sin marco legal y sin tracción probada |
| **No implementamos reserva online real** | Sin proceso manual validado previo |
| **No prometemos compradores verificados** | No existe proceso real de verificación de compradores |
| **No prometemos ausencia de fraude** | Black Label actúa como plataforma de contacto, no como garante |
| **No publicamos stock sin criterio editorial** | El posicionamiento premium depende de la selección |
| **No abrimos publicación libre** | Acceso por solicitud y revisión, no autoservicio |
| **No construimos panel profesional completo ahora** | Validar flujo manual antes de construir automatización |
| **No conectamos CRM antes de tener formularios y datos claros** | Evitar configurar automatización sobre proceso indefinido |
| **No activamos automatización sin control humano** | Toda automatización debe tener supervisión manual en Fase 2 |
| **No prometemos velocidad de respuesta específica** | Sin SLA definido no hay compromiso que cumplir |
| **No construimos app móvil** | Validar web primero; app nativa solo si hay volumen |
| **No internacionalizamos** | Mercado español primero; expandir solo si hay tracción |

---

## 17. Próximos pasos recomendados

### Acciones inmediatas (antes de mostrar la plataforma al primer profesional)

1. **Cerrar QA final** — revisar todas las páginas en dispositivos reales, detectar bugs visuales y funcionales
2. **Revisar textos legales y de confianza** — asegurarse de que disclaimers y promesas son correctos y no prometemos nada que no hayamos implementado
3. **Definir criterios definitivos de publicación** — qué tipo de vehículo publicamos, calidad mínima de imágenes, qué información es obligatoria
4. **Conectar formularios a email o webhook** — al menos el formulario de solicitud de información y el de búsqueda privada deben llegar a una bandeja de entrada real
5. **Preparar lista de profesionales objetivo** — identificar 10–20 concesionarios o compraventas que encajen con el perfil de Black Label

### Acciones Fase 2 (captación inicial)

6. **Preparar proceso manual de alta de vehículos** — definir cómo se sube un vehículo mientras no hay panel: plantilla de datos, proceso de imágenes, quién lo introduce
7. **Preparar plantilla de ficha editorial** — documento estándar que rellena el profesional con toda la información necesaria para una ficha completa
8. **Preparar dashboard manual inicial** — Airtable, Notion o GHL para registrar leads, solicitudes y profesionales interesados
9. **Probar con 5–10 vehículos reales** — conseguir fichas reales de profesionales dispuestos a participar en el piloto
10. **Recoger feedback antes de paneles avanzados** — hablar con los primeros profesionales y compradores antes de construir panel profesional completo

---

## Glosario

| Término | Definición en este documento |
|---|---|
| **Profesional** | Concesionario, compraventa o especialista seleccionado por Black Label |
| **Comprador** | Usuario que explora y solicita información sobre vehículos |
| **Admin** | Equipo interno de Black Label / Black Series |
| **Ficha** | Página de detalle de un vehículo publicado |
| **Solicitud** | Mensaje de contacto enviado por un comprador al profesional a través de la plataforma |
| **Búsqueda privada** | Demanda registrada de un comprador que no encuentra el vehículo que busca |
| **Alerta** | Notificación automática cuando aparece un vehículo compatible con criterios guardados |
| **Lead** | Solicitud de información o búsqueda privada recibida, trazable y accionable |
| **Black Label Selection** | Curación editorial de vehículos de máxima calidad dentro del marketplace |
| **Black Audit** | Servicio de Black Series para analizar y mejorar el rendimiento comercial de un showroom |

---

*Documento mantenido por el equipo de producto de Black Label Market / Black Series.*
*Versión: 2.0 — 2026-05-24*
