# 05 · Auditoría UX y Accesibilidad (WCAG 2.1 / 2.2 AA)

**Producto:** Black Label Market — marketplace B2B de vehículos premium
**Stack real auditado:** Next.js 14 (App Router) + Tailwind + CSS keyframes. *(Nota: `framer-motion` figura en el stack documentado pero **no se usa en ningún componente** `.tsx`; todas las animaciones son keyframes CSS de Tailwind.)*
**Estándar:** WCAG 2.2 nivel AA (se anota alguna referencia AAA relevante)
**Fecha:** 2026-07-02 · **Auditor:** AccessibilityAuditor
**Método:** revisión del código real (rol visitante, showroom y admin por código) + cálculo de ratios de contraste sobre los tokens y literales reales. Auditoría **desde cero**, sin apoyarse en informes previos.

> Alcance verificado en código: `tailwind.config.ts`, `app/globals.css`, `components/layout/Header.tsx`, modales/popovers (`SearchAlertModal`, `VehicleGallery`, `KanbanBoard`/`LeadModal`, `VehicleFilters` drawer, `CookieConsentBanner`), formularios (`ContactForm`, `QualifiedLeadForm`, `SearchAlertModal`, `login`, `registro-comprador`, `publicar`), `AssistantWidget`, `VehicleCard`, `SortSelector`, `PasswordInput`, layouts públicos.

---

## Resumen ejecutivo

El producto tiene una **base semántica decente** (uso de `<article>`, `<main>`, jerarquía `h1→h2→h3` correcta en las páginas muestreadas, `html lang="es"`, algunos `aria-label` bien puestos, chat del asistente con `role="log"` + `aria-live`), pero **falla en los fundamentos que más impactan a usuarios reales de teclado, lector de pantalla y control por voz**, y precisamente en los flujos que generan dinero (leads, alta de vehículo, gestión de oportunidades).

Cuatro problemas transversales y graves:

1. **Etiquetas de formulario no asociadas** en prácticamente **todos** los formularios. El patrón `.label-base` se usa como `<label>` suelto **sin `htmlFor` ni `id`** en el input, y los dos formularios de captación de lead de la ficha (`ContactForm`, `QualifiedLeadForm`) van **solo con `placeholder`**. Afecta al camino de conversión completo. El único input correctamente etiquetado de todo el código es `PasswordInput` (usa `htmlFor`/`id`).
2. **Gestión de foco inexistente en los modales.** Ninguno atrapa el foco, casi ninguno cierra con `Escape` ni devuelve el foco al disparador. Varios ni siquiera se exponen como diálogo (`LeadModal` y el drawer de filtros carecen de `role="dialog"`).
3. **Componentes operables solo con ratón.** La imagen principal de la galería y las tarjetas del Kanban son `<div onClick>` sin rol ni teclado; las flechas de la galería solo aparecen en `hover`. Un usuario de teclado no puede abrir la ficha de una oportunidad ni ampliar la galería.
4. **Contraste insuficiente del gris de navegación y de cuerpo.** `#757575` (token `silver.dark`, estado de reposo de todo el menú superior) y `#737373` (ubicación en tarjeta, avisos legales) rinden **3.8–4.3:1**, por debajo del mínimo AA de 4.5:1 para texto normal. Confirmado el uso incoherente de **tres dorados** como color primario (`#C6A64B`, `#C9A84C`, `#BFA14A`).

Además hay **fricción de UX por rol** relevante: el asistente de publicación es un wizard de 5 pasos con ~40+ campos y un mínimo declarado de **10 fotos** ("Sube entre 10 y 60 fotografías"), y el orden de resultados (`SortSelector`) está **oculto en móvil**.

**Conformidad WCAG 2.2 AA: NO CONFORMA.**
**Compatibilidad con tecnología asistiva: FALLA** (formularios y flujos clave no operables/identificables con lector de pantalla y teclado).

---

## Conteo por severidad

| Severidad | Nº |
|-----------|----|
| Crítica   | 3  |
| Seria     | 7  |
| Moderada  | 8  |
| Menor     | 6  |
| **Total** | **24** |

Criterio: *Crítica* = bloquea una tarea esencial para un grupo de usuarios · *Seria* = barrera importante con workaround costoso · *Moderada* = dificultad con alternativa · *Menor* = molestia / higiene.

---

## Tabla de hallazgos

| # | Sev. | Archivo:línea / Pantalla | Criterio WCAG | Descripción | Fix |
|---|------|--------------------------|---------------|-------------|-----|
| 1 | **Crítica** | `components/marketplace/ContactForm.tsx:66-99` · `QualifiedLeadForm.tsx:133-166` | 1.3.1, 3.3.2, 4.1.2, 2.5.3 | Los dos formularios de captación de lead de la ficha usan **solo `placeholder`** (sin `<label>`). Al escribir desaparece el contexto; el lector de pantalla anuncia solo el placeholder; control por voz no puede fijar el campo. Es el camino de conversión principal. | Añadir `<label htmlFor>` visible por campo, o como mínimo `aria-label`. No usar placeholder como etiqueta. |
| 2 | **Crítica** | Todos los formularios con `.label-base` (`app/globals.css:137`) — p. ej. `SearchAlertModal.tsx:124-203`, `login/page.tsx:56`, `registro-comprador/page.tsx:118-136`, `publicar/page.tsx:334,353,389,548-696` | 1.3.1, 3.3.2, 4.1.2 | El patrón `<label className="label-base">Texto</label>` seguido de `<input>`/`<select>` **no asocia** etiqueta e input (ni `htmlFor`/`id`, ni el label envuelve al control). Sistémico en alta, alertas, login, registro y todo el wizard de publicación. Hacer clic en la etiqueta no enfoca el campo. | Convertir `label-base` en `<label htmlFor={id}>` con `id` en cada control (patrón ya resuelto en `PasswordInput.tsx:51-54`). |
| 3 | **Crítica** | `components/dashboard/KanbanBoard.tsx:402-405` (`LeadCard` `div onClick`) · modal `KanbanBoard.tsx:198-202` | 2.1.1, 4.1.2 | La tarjeta de oportunidad es un `<div onClick>` sin `role`/`tabIndex`/teclado: **un showroom que use teclado o lector no puede abrir la ficha del lead** (ver contacto, cualificación IA, borrar). Además `LeadModal` **no lleva `role="dialog"`/`aria-modal`**, no se anuncia como diálogo. Es el flujo central del panel de pago. | Convertir la tarjeta en `<button>` (o `role="button"` + `tabIndex=0` + `onKeyDown` Enter/Espacio). Añadir `role="dialog"` `aria-modal="true"` `aria-labelledby` al modal + foco inicial y trampa de foco. |
| 4 | Seria | `SearchAlertModal.tsx:75-102` · `VehicleGallery.tsx:318-377,382-415` · `VehicleFilters.tsx:1242-1263` · `CookieConsentBanner.tsx:132-151` · `KanbanBoard.tsx:198` | 2.1.2, 2.4.3, 4.1.2 | **Gestión de foco ausente en todos los modales/drawer**: no se traslada el foco al abrir, no se atrapa (se puede tabular al fondo), no se devuelve al disparador al cerrar. Solo `LeadModal` cierra con `Escape`; el resto no. El drawer de filtros (`VehicleFilters:1242`) ni siquiera tiene `role="dialog"`. | Implementar patrón APG *dialog*: mover foco al abrir, `focus-trap`, cerrar con `Escape`, restaurar foco, e `inert`/`aria-hidden` en el fondo. Centralizar en un componente `<Modal>` reutilizable. |
| 5 | Seria | `components/marketplace/VehicleGallery.tsx:175-181` (visor) y `:228-245` (flechas) | 2.1.1, 2.4.7, 4.1.2 | El visor principal es `<div onClick>` (abre lightbox/vídeo) **sin teclado ni rol**. Las flechas Anterior/Siguiente están en un contenedor `opacity-0 group-hover:opacity-100`: existen para teclado pero **invisibles hasta el hover de ratón**, así que el foco no se ve. | Visor → `<button>`. Flechas visibles también en `:focus-visible` (p. ej. `focus-within:opacity-100`). |
| 6 | Seria | Nav superior: token `tailwind.config.ts:29` (`silver.dark #757575`) usado en `Header.tsx:154`, `SortSelector.tsx:32` | 1.4.3 | El **estado de reposo de todo el menú** y varias etiquetas usan `#757575` → contraste **4.30:1 sobre `#0A0A0A`** (y baja a **3.93** sobre superficies elevadas). Texto normal necesita 4.5:1. El menú entero queda por debajo hasta el hover. | Subir el gris de navegación a ≥ `#8A8A8A` (5.7:1) para estado normal. |
| 7 | Seria | `VehicleCard.tsx:237` (ubicación) · `VehicleDetailContent.tsx:461` (aviso) · usos de `#737373` | 1.4.3 | `#737373` como texto de cuerpo pequeño (ubicación en tarjeta a 11px, disclaimers) → **4.18:1 sobre body, 3.98:1 sobre surface**. Falla AA para texto normal. `#555555` (`publicar.tsx:456,492` "Ej:", `KanbanBoard.tsx:37`) rinde **2.6:1** (falla de largo). | Reservar `#737373`/`#555555` solo para elementos decorativos no informativos; texto informativo ≥ `#8A8A8A`. |
| 8 | Seria | Controles segmentados con `input.sr-only`: `SearchAlertModal.tsx:132-138` · `QualifiedLeadForm.tsx:202-254` | 2.4.7, 1.4.1 | Los radios "Tipo/Financiación/Contacto" ocultan el input con `sr-only` y muestran la selección con `has-[:checked]` (color dorado). **No hay estilo `:focus-visible`**: al tabular no se ve qué opción está enfocada, y el estado se comunica solo por color. | Añadir `has-[:focus-visible]:ring-1 ring-gold` al `<label>` y un indicador no cromático del checked (borde + check). |
| 9 | Seria | Errores de formulario no vinculados: `ContactForm.tsx:71-102` · `QualifiedLeadForm.tsx:138-149` · `SearchAlertModal.tsx:195` | 3.3.1, 3.3.3, 4.1.2 | Los mensajes de error (`<p class="text-red-400">`) no están asociados al campo (`aria-describedby`) ni el input marcado `aria-invalid`. Un lector de pantalla no relaciona el error con el campo. En login/registro el error general tampoco es `role="alert"` (`login/page.tsx:80`, `registro-comprador/page.tsx:148`) → no se anuncia el fallo de acceso. | `aria-invalid` + `aria-describedby={errorId}` en cada campo; `role="alert"` en el contenedor de error general. |
| 10 | Seria | `KanbanBoard.tsx:83-95` (`ScoreBadge`) | 1.1.1, 1.4.1 | La temperatura del lead (hot/warm/cold) se transmite **solo con emoji (🔥🟡⚪) y color**, sin texto ni `aria-label`. El lector anuncia "emoji fuego"; daltónicos no distinguen. Es un dato de priorización comercial clave. | Añadir texto/`aria-label` ("Lead caliente/templado/frío") además del emoji. |
| 11 | Moderada | `components/layout/Header.tsx:282-288` | 4.1.2 | El botón hamburguesa tiene `aria-label="Abrir menú"` **fijo** (no cambia a "Cerrar") y **carece de `aria-expanded` y `aria-controls`**. El lector no informa si el menú está abierto. | `aria-expanded={mobileOpen}`, `aria-controls="mobile-nav"`, y label dinámico Abrir/Cerrar. |
| 12 | Moderada | `Header.tsx:141-179` (dropdown "Marcas") | 2.1.1, 4.1.2 | El submenú de "Marcas" se abre **solo con `onMouseEnter`/`onMouseLeave`**. No abre con foco de teclado, no tiene `aria-haspopup`/`aria-expanded`; los enlaces del submenú no son alcanzables por teclado desde el menú. | Abrir también en `focus`/`click`, añadir `aria-haspopup="menu"` + `aria-expanded`, y navegación con flechas (patrón APG *menubar* o *disclosure*). |
| 13 | Moderada | `app/globals.css` (todo el fichero; `:17-21`, `:52-76`, `:182-191`) · keyframes en `tailwind.config.ts:51-74` | 2.3.3, 2.2.2 (AAA/AA) | **No existe ningún `@media (prefers-reduced-motion: reduce)`**. `scroll-behavior: smooth` siempre activo, `animate-fade-in/slide-up/slide-in-right` y `shimmer` (`infinite`) sin excepción para usuarios con sensibilidad vestibular. | Añadir bloque `@media (prefers-reduced-motion: reduce){ *{animation:none!important;transition:none!important;scroll-behavior:auto!important} }`. |
| 14 | Moderada | `app/(public)/layout.tsx:4-12` | 2.4.1, 1.3.6 | No hay **enlace "Saltar al contenido"**; con un menú largo, el usuario de teclado tabula toda la navegación en cada página. Hay `<main>` (bien) pero sin `id`/`tabindex`, y múltiples `<nav>` sin `aria-label` que los distinga. | Añadir skip-link visible al enfocar que apunte a `<main id="main">`, y `aria-label` a cada `<nav>`. |
| 15 | Moderada | `app/globals.css:118-122` (`.btn-ghost` `focus:outline-none`) · `PasswordInput.tsx:67` | 2.4.7 | `.btn-ghost` aplica `focus:outline-none` **sin sustituto** → los botones fantasma no muestran foco. El toggle de contraseña también hace `focus:outline-none`. | Sustituir por `focus-visible:ring-2 focus-visible:ring-gold/50`. Nunca `outline-none` sin reemplazo. |
| 16 | Moderada | `app/(auth)/login/page.tsx:57-64` · `registro-comprador/page.tsx:119-136` | 1.3.5 | Los inputs de email/nombre **no declaran `autocomplete`** (`email`, `name`, `username`). Dificulta el autorrelleno accesible. (El `PasswordInput` sí lo hace bien.) | Añadir `autoComplete="email"` / `"name"`. |
| 17 | Moderada | `components/marketplace/SortSelector.tsx:31` (`hidden lg:flex`) | 1.3.4 / UX | El **ordenado de resultados está oculto en móvil** (`hidden lg:flex`). En 390px el comprador no puede ordenar por precio/km/año. Funcionalidad esencial no disponible en el viewport mayoritario. | Exponer el orden en móvil (dentro del drawer de filtros o como select compacto). |
| 18 | Moderada | Wizard `app/(dashboard)/dashboard/publicar/page.tsx:17,292-949` + copy `:772` | Usabilidad / 3.3 | **Fricción de alta**: 5 pasos, ~40+ campos y mínimo declarado **10 fotos** ("Sube entre 10 y 60 fotografías"). Sin autoguardado por campo (solo "guardar borrador" manual). Riesgo de abandono de showrooms. Los indicadores de paso (`:307`) no exponen `aria-current`. | Reducir campos obligatorios al mínimo (marca/modelo/año/precio/fotos), diferir el resto a "completar ficha", bajar el mínimo de fotos, autoguardar, y `aria-current="step"` en el paso activo. |
| 19 | Menor | `Header.tsx:186-198,204,262` | 4.1.2 | Los enlaces de icono (Buscar/Alertas/Guardados) se apoyan en `title` como nombre accesible. `title` es poco fiable en lectores y no aparece en móvil. | Añadir `aria-label` explícito además de (o en vez de) `title`. |
| 20 | Menor | `components/marketplace/VehicleCard.tsx:247-257,128-131` · badges 9-11px en toda la UI | 1.4.4 / Legibilidad | Uso extendido de tipografías muy pequeñas: badges `text-[9px]`, meta `text-[10px]`, avisos `text-[11px]`. Para un producto premium con público adulto, el cuerpo secundario es difícil de leer y estresa el reflow al 200%. | Elevar el mínimo de cuerpo a 12-13px; reservar 10px solo para etiquetas decorativas en mayúsculas. Verificar reflow a 200%/400%. |
| 21 | Menor | `publicar/page.tsx:443,481` (toggles "i") · `QualifiedLeadForm.tsx:170-177` (colapsable) | 4.1.2 | Botones que muestran/ocultan paneles (info de carrocería/categoría, "Datos adicionales") **sin `aria-expanded`**. El "i" sí tiene `aria-label`, pero no comunica estado abierto/cerrado. | Añadir `aria-expanded` y `aria-controls` a los disparadores de disclosure. |
| 22 | Menor | `app/(admin)/admin/vehiculos/page.tsx:98-99` (y demás tablas admin) | 1.4.10 / UX | Las tablas de admin usan `overflow-x-auto` sin alternativa responsive: en 390px hay scroll horizontal de tablas anchas. Impacto acotado (uso interno), pero incómodo. | Aceptable con scroll; idealmente vista de tarjetas en móvil. Confirmar cabeceras `scope`/`<caption>`. |
| 23 | Menor | `tailwind.config.ts:19-24,49` · `app/globals.css:30,49,90` · `KanbanBoard.tsx:35-37` | 1.4.3 (higiene de tokens) | **Tres dorados como "primario" usados sin criterio**: `#C6A64B` (token, 189 usos), `#C9A84C` (globals: `::selection`, scrollbar, `gold-line`, sombras, inicio de `gradient-gold`) y `#BFA14A` (Kanban, 28 usos); además `#DEC070`/`#E8C97D` (claro) y `#A88935`/`#A88A3A` (oscuro). Todos pasan contraste, pero rompen consistencia de marca. Ya señalado en `CLAUDE.md`. | Unificar en un único dorado semántico (`gold.DEFAULT`) y derivar el resto por escala; eliminar literales sueltos. |
| 24 | Menor | `SearchAlertModal.tsx:81` (`onClick={onClose}` en backdrop) · galería/kanban backdrops | 3.3.4 / UX | El clic en el fondo cierra el modal **descartando datos ya escritos** en el formulario de alerta (email, filtros) sin confirmación. Riesgo de pérdida de trabajo. | No cerrar formularios con datos al clicar fuera, o pedir confirmación; mantener el cierre solo por botón/`Escape`. |

---

## Lo que funciona bien (preservar)

- **Semántica base correcta:** `<main>` en el layout público, `<article>` en `VehicleCard`, jerarquía `h1→h2→h3` limpia en home, ficha de vehículo y páginas muestreadas; `html lang="es"`.
- **Asistente IA accesible:** `AssistantWidget` usa `role="log"` + `aria-live="polite"` + `aria-label` en el log, e `aria-label` en input y botón enviar. Buen patrón, replicarlo.
- **`PasswordInput`** es el ejemplo correcto de etiquetado (`htmlFor`/`id`), toggle con `aria-label` dinámico y `autoComplete`. **Usarlo como plantilla** para arreglar el resto de formularios.
- **Alt text de imágenes de vehículo** bien construido y descriptivo (`VehicleCard.tsx:57-63`); placeholders con `aria-hidden` correcto.
- **`FavoriteButton`** cambia su `aria-label` según el estado guardado/no guardado (aunque convendría `aria-pressed`).
- **`role="dialog"`/`aria-modal`** ya presentes en `SearchAlertModal`, galería y banner de cookies (falta solo la gestión de foco y homogeneizarlo en Kanban y drawer).
- Los golds y textos claros (`#F4F1EA`, `#C9C9C9`, `#9A9A9A`, `#8A8A8A`) **sí cumplen** contraste AA sobre los fondos oscuros.

---

## Prioridad de remediación

### Inmediato (antes de abrir al público / recibir compradores y showrooms reales)
1. **#1, #2** — Asociar todas las etiquetas de formulario (`htmlFor`/`id`) y sustituir placeholders-como-label en los formularios de lead. Es el camino del dinero.
2. **#3** — Hacer operables por teclado las tarjetas del Kanban y exponer `LeadModal` como diálogo. Es el panel que paga el showroom.
3. **#4, #5** — Gestión de foco en modales (trampa + `Escape` + retorno) y visor/flechas de galería operables por teclado. Centralizar en un `<Modal>` común.
4. **#6, #7** — Subir el gris de navegación y de cuerpo por encima de 4.5:1.

### Corto plazo (siguiente sprint)
5. **#8, #9, #10** — Foco visible en radios segmentados; vincular errores (`aria-describedby`/`aria-invalid`/`role="alert"`); texto alternativo en `ScoreBadge`.
6. **#11, #12** — `aria-expanded`/`aria-controls` en hamburguesa y submenú "Marcas" operable por teclado.
7. **#13, #14, #15** — `prefers-reduced-motion`, skip-link + `aria-label` en `<nav>`, y restaurar foco visible en `.btn-ghost`.
8. **#17, #18** — Exponer orden en móvil y reducir la fricción del wizard de alta (campos + mínimo de fotos + autoguardado).

### Mantenimiento
9. **#16, #19, #20, #21, #22, #23, #24** — `autocomplete`, `aria-label` en iconos, tamaños tipográficos mínimos, `aria-expanded` en disclosures, tablas admin, **unificación del dorado** y cierre seguro de modales con datos.

---

## Próximos pasos recomendados

- **Verificación real pendiente** (esta auditoría es sobre código): probar con **NVDA + Firefox** y **VoiceOver + Safari** los flujos de *buscar → ficha → enviar lead*, *login/registro*, *publicar vehículo* y *Kanban de oportunidades*; y recorrer todo **solo con teclado**. Comprobar reflow a **200%/400%** y modo de **contraste forzado**.
- Crear un **componente `<Modal>` accesible** único (foco, trampa, `Escape`, retorno, `role`/`aria-modal`) y migrar `SearchAlertModal`, `VehicleGallery`, `LeadModal`, drawer de filtros y `CookieConsentBanner`.
- Crear un **`<Field>`** que emita `label htmlFor`, `id`, `aria-invalid` y `aria-describedby` de forma consistente (react-hook-form ya está en uso).
- Integrar **axe-core** en CI y añadir criterios de aceptación de accesibilidad a las historias.
- **Re-auditar** tras el bloque "Inmediato".

*Referencias: WCAG 2.2, WAI-ARIA Authoring Practices 1.2 (patrones Dialog, Disclosure, Menu). Los ratios de contraste se calcularon sobre los hex reales de `tailwind.config.ts`, `globals.css` y literales de componentes.*
