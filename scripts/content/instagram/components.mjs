// Componentes HTML reutilizables — base común de las 8 plantillas (IG-P1..P8), para
// no duplicar 8 HTML independientes ni sobre-abstraer. Cada función devuelve un
// fragmento de HTML listo para insertar dentro del documento de una plantilla.
import { COLORS, PHOTO_FILTER } from './tokens.mjs'

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c])
}

export function Frame({ children }) {
  return `<div style="position:absolute;inset:0;">${children}</div>`
}

export function Photo({ src, objectPosition = 'center' }) {
  return `<div class="ph"><img src="${esc(src)}" alt="" style="object-position:${esc(objectPosition)}"></div>`
}

export function Vignette() {
  return `<div class="vignette"></div>`
}

export function ScrimBottom({ height = '56%' }) {
  return `<div class="scrim-b" style="height:${esc(height)};"></div>`
}

export function ScrimTop({ height = '30%' }) {
  return `<div class="scrim-t" style="height:${esc(height)};"></div>`
}

export function BrandMark({ top = 64, left = 64 }) {
  return `<div class="mono" style="top:${top}px;left:${left}px;">B</div>`
}

export function EyebrowTag({ label, top = 74, right = 64 }) {
  return `<div class="eyebrow-tag" style="top:${top}px;right:${right}px;">${esc(label)}</div>`
}

export function Badge({ label }) {
  return `<div class="badge">${esc(label)}</div>`
}

// SpecGrid — usado por P4 (tabla de datos) y por la línea de specs de P1/P2/P7.
export function SpecLine(items) {
  const parts = items
    .filter((i) => i.value != null && i.value !== '')
    .map((i) => `<b>${esc(i.value)}</b>`)
  return `<div class="spec-line">${parts.join('<span class="dot">·</span>')}</div>`
}

export function SpecGrid(rows) {
  const items = rows
    .filter((r) => r.value != null && r.value !== '')
    .map((r) => `<div class="row"><span class="sg-k">${esc(r.label)}</span><span class="sg-v">${esc(r.value)}</span></div>`)
    .join('')
  return `<div class="specgrid">${items}</div>`
}

export function GoldRule() {
  return `<div class="gold-rule"></div>`
}

export function VehicleName({ text, size = 'xl' }) {
  const base = size === 'xl' ? 'name-xl' : 'name-lg'
  // Marca+modelo viene del catálogo real, no de copy escrito a mano — algunas
  // combinaciones (ediciones especiales, distancias entre ejes, acabados) superan
  // con creces las ~4 palabras cortas de los ejemplos de referencia. Sin esto, un
  // nombre largo crece en altura dentro de .stack-bottom y puede invadir la marca/
  // badge superior, que el QA automático (solo mide overflow del documento) no detecta.
  const long = String(text ?? '').length > 26
  return `<h3 class="${long ? `${base} long` : base}">${esc(text)}</h3>`
}

// SafeArea — zona reservada donde Instagram superpone su propia interfaz (perfil
// arriba, respuesta abajo en stories). Solo decorativo en la maqueta de revisión;
// en el render final de producción no se pinta, es una guía de composición.
export function SafeArea({ top, height, label }) {
  const pos = top != null ? `top:${top}px;` : `bottom:0;`
  return `<div class="safe-zone" style="${pos}height:${height}px;"><span class="lbl">${esc(label)}</span></div>`
}

export { esc, COLORS, PHOTO_FILTER }
