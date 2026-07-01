# Propuesta de mejora de diseño — Black Label Market

**Fecha:** 2026-07-01 · **Método:** design system fundamentado con la skill `ui-ux-pro-max` (patrón, estilo, tipografía, motion) + lectura del código real (`tailwind.config.ts`, `globals.css`, componentes clave). Alineada con los hallazgos de diseño de [`auditoria-completa-2026-07.md`](auditoria-completa-2026-07.md) (B1-B11, A1-A12).

---

## Diagnóstico en una frase

El producto tiene **la identidad correcta** (negro obsidiana + dorado, serif editorial Cormorant + Inter) pero **está quieto**: casi todo el movimiento es CSS estático (`fade-in`, `slide-up`), y **`framer-motion` v11 está instalado en `package.json` pero prácticamente sin usar**. Un marketplace de lujo se percibe premium por cómo **respira y se mueve**, no solo por los colores. Esta propuesta convierte esa librería ya pagada en la capa de percepción de calidad que hoy falta.

## Qué dice el design system recomendado (skill)

| Dimensión | Recomendación | Estado actual |
|-----------|---------------|---------------|
| **Patrón** | Marketplace — la **búsqueda ES el CTA**, fricción mínima, categorías visuales | ✅ Ya lo tenéis; falta jerarquizar el hero (B2) |
| **Estilo** | Modern Dark "Cinema" — fondo no-negro-puro con degradado, luz ambiental sutil, blur en headers, glow tras el CTA primario | ◐ Negro plano sin atmósfera; header marrón (B1) |
| **Tipografía** | Serif editorial display + sans body (Playfair/Inter) | ✅ Cormorant + Inter — **equivalente, correcto** |
| **Motion** | Micro 150-300ms · transiciones premium 400-600ms · **spring physics** `cubic-bezier(0.16,1,0.3,1)` · reveals escalonados 30-50ms · shared-element entre listado↔ficha | ❌ Solo `ease-out` CSS, sin escalonado, sin shared-element |
| **Evitar** | "Cheap visuals", animaciones rápidas/bruscas, contraste bajo | ⚠️ Contraste bajo (A1), 3 dorados distintos (B7) |

---

## 1. Sistema de motion (la base — hacerlo primero)

Hoy cada animación elige su propia duración/easing. Se necesita **un lenguaje de movimiento único** (regla `motion-consistency` de la skill). Añadir a `tailwind.config.ts`:

```ts
transitionTimingFunction: {
  'premium': 'cubic-bezier(0.16, 1, 0.3, 1)',   // spring-like, entrada
  'exit':    'cubic-bezier(0.4, 0, 1, 1)',       // salida, más rápida
},
transitionDuration: {
  '250': '250ms',   // micro-interacción estándar
  '450': '450ms',   // transición premium
},
```

Y un helper compartido para framer-motion (`lib/motion.ts`, nuevo):

```ts
export const easePremium = [0.16, 1, 0.3, 1] as const

export const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: easePremium },
}

// Reveal escalonado para grids (30-50ms por item, regla stagger-sequence)
export const staggerGrid = {
  animate: { transition: { staggerChildren: 0.05 } },
}
export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easePremium } },
}
```

**Regla transversal (accesibilidad A11):** todo esto debe respetar `prefers-reduced-motion`. Envolver en un hook `useReducedMotion()` de framer-motion (lo trae de serie) que desactive `y`/`stagger` y deje solo el fade. Sin esto, la propuesta **empeora** la accesibilidad.

---

## 2. Microinteracciones (percepción de calidad, alto ROI / bajo coste)

### 2.1 Cards de vehículo — el elemento más repetido
Hoy: `hover:scale-1.03` en la imagen y cambio de borde (correcto pero plano). Propuesta (regla `scale-feedback` + `shared-element`):
- **Elevación al hover:** la card sube `y: -4px` con sombra `shadow-card-hover` y el borde vira a `gold/30` en 250ms premium.
- **Reveal de metadatos:** precio y specs con un `translateY` sutil + fade al entrar en viewport (no todo de golpe).
- **Overlay de acción:** el botón "Ver ficha" / corazón de favorito aparece con fade+scale desde 0.9, no de golpe.

```tsx
<motion.article
  whileHover={{ y: -4 }}
  transition={{ duration: 0.25, ease: easePremium }}
  className="vehicle-card"
>
```

### 2.2 Botones dorados
Hoy: `hover:opacity-90`. Propuesta: **scale de presión** `active:scale-[0.98]` + glow que crece (`shadow-gold` → `shadow-gold` más intenso) en hover. Un botón de lujo confirma el tacto (`press-feedback`).

### 2.3 Favorito / Comparar / Alerta
Micro-animación de confirmación (regla `success-feedback`): el corazón hace un `scale 1 → 1.3 → 1` con spring y vira a dorado; el "Comparar" muestra un check breve. Feedback en <100ms.

### 2.4 Header con blur y contracción al hacer scroll
Resuelve **B1** (header marrón) + añade cine:
- Fondo negro translúcido `rgba(10,10,10,0.85)` + `backdrop-blur-md` (glassmorphism del estilo Cinema), borde inferior `gold/10`.
- Al hacer scroll >40px, el header **reduce su padding** (de `py-5` a `py-3`) con transición 250ms → sensación de precisión.

### 2.5 Inputs y filtros
Focus con transición de borde a `gold/50` (ya existe) + label que sube (float label) en formularios de contacto. La barra de filtros desliza con `slide-in-right` (ya la tenéis) pero con easing premium.

---

## 3. Transiciones de página y scroll (el salto cualitativo)

### 3.1 Scroll-reveal escalonado en el home y listados
El home hoy aparece estático. Con framer-motion `whileInView` (regla `stagger-sequence` + `continuity`):
- Cada sección (categorías, destacados, trust, CTA) entra con `fadeUp` al 20% de visibilidad.
- Los grids de vehículos revelan sus cards **escalonadas 50ms** — el ojo percibe orden y cuidado.

```tsx
<motion.div variants={staggerGrid} initial="initial" whileInView="animate" viewport={{ once: true, amount: 0.2 }}>
  {vehicles.map(v => <motion.div key={v.id} variants={staggerItem}><VehicleCard .../></motion.div>)}
</motion.div>
```

### 3.2 Shared-element listado → ficha (lo más "wow")
Al hacer clic en una card, la **imagen del coche se expande** hacia la galería de la ficha en lugar de un corte seco (regla `shared-element-transition`). Con `layoutId` de framer-motion:

```tsx
// En la card:   <motion.img layoutId={`vehicle-${id}`} ... />
// En la ficha:  <motion.img layoutId={`vehicle-${id}`} ... />
```

Es la transición que separa un marketplace "normal" de uno premium tipo editorial. Requiere que card y galería compartan `layoutId`.

### 3.3 Hero con luz ambiental (estilo Cinema)
Fondo del hero: degradado `#0A0A0F → #050506` + 1-2 "blobs" de luz dorada muy tenues (`opacity 0.06`, blur alto) con oscilación lenta. Da profundidad atmosférica sin distraer. Respeta reduced-motion (se congelan).

### 3.4 Modales con origen espacial
Los 4 modales (leads, alertas, galería) hoy aparecen de golpe. Propuesta (regla `modal-motion`): entran con `scale 0.96 + fade` desde su trigger, scrim `bg-black/60` con `backdrop-blur-sm`, salida un 60-70% más rápida que la entrada (`exit-faster-than-enter`). Esto se combina con el fix de accesibilidad A2/A3 (focus-trap + Escape) en el **mismo componente** → un `<Modal>` premium reutilizable.

---

## 4. Consistencia visual (limpiar antes de decorar)

Antes de añadir movimiento conviene unificar, o el pulido resalta las inconsistencias:
- **Un solo dorado** (B7): consolidar `#C6A64B`/`#C9A84C`/`#BFA14A` en el token `gold.DEFAULT` (#C6A64B). Buscar y reemplazar los literales.
- **Tokens de borde** (B7): sustituir `#1A1A1A/#1E1E1E/#141414/#181818` por `bsm-border` / `bsm-border-light`.
- **Contraste** (A1): subir `bsm-text-muted` a `#A0A0A0` para pasar AA — el texto premium debe ser legible, no apagado.
- **Header** (B1): del marrón al negro translúcido con blur (§2.4).
- **Escala tipográfica**: reservar `text-[10-11px]` para overlines en mayúsculas; el cuerpo mínimo a `text-[13px]/text-sm` (regla `readable-font-size`).

---

## 5. Plan por fases

### Fase 1 — Fundamentos (1-2 días, sin riesgo visual)
1. Sistema de motion en `tailwind.config.ts` + `lib/motion.ts` + hook `useReducedMotion`.
2. Consolidar dorado y tokens de borde (B7) y contraste (A1).
3. `<Modal>` premium reutilizable (motion + focus-trap A2/A3) → sustituye los 4 modales.

### Fase 2 — Microinteracciones (2-3 días, alto impacto percibido)
4. Cards de vehículo con elevación + reveal (§2.1).
5. Botones con scale de presión + glow (§2.2); favorito/comparar/alerta con confirmación (§2.3).
6. Header con blur + contracción al scroll (§2.4, cierra B1).

### Fase 3 — Cine (3-4 días, el salto "wow")
7. Scroll-reveal escalonado en home y listados (§3.1).
8. Shared-element card → ficha (§3.2).
9. Hero con luz ambiental (§3.3).

### Fase 4 — Pulido
10. Float labels + skeletons con `.shimmer` en listados (B9); precio "a consultar" con jerarquía (B8); breadcrumb legible (B10).

---

## 6. Riesgos y guardarraíles

- **Rendimiento** (el estilo Liquid Glass/Cinema penaliza si se abusa): animar **solo `transform` y `opacity`** (regla `transform-performance`), nunca `width/height/top/left`. Blur solo en header/modales, no en scroll continuo.
- **Accesibilidad**: `prefers-reduced-motion` obligatorio en todo (cierra A11). Sin él, esta propuesta es un retroceso.
- **Coherencia**: un único lenguaje de motion (§1). Nada de duraciones sueltas por componente.
- **Regla de oro del lujo (skill):** "evitar animaciones rápidas/cheap". Preferir pocas transiciones lentas y suaves (400-450ms premium) a muchas rápidas. Menos, pero mejor.

---

## Resumen

El coste real es bajo porque **la librería (`framer-motion`) ya está instalada** y la identidad ya es correcta. El trabajo es: (1) darle un **lenguaje de movimiento único**, (2) sembrar **microinteracciones** en los elementos repetidos (cards, botones, header), y (3) rematar con **scroll-reveal y shared-element** que es lo que hace que un marketplace de coches de lujo se sienta como una revista digital y no como una hoja de cálculo. Todo ello resolviendo de paso los hallazgos de diseño B1, B7, B9 y de accesibilidad A1, A2, A3, A11 de la auditoría.

*Propuesta generada con la skill `ui-ux-pro-max` (design system + dominios ux/style/animation) sobre los tokens reales del proyecto.*
