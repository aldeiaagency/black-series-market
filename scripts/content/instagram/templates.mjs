// Las 8 plantillas — IG-P1..IG-P8. Cada función recibe datos reales (nunca hardcode)
// y devuelve un documento HTML completo, listo para que render.mjs le haga el
// screenshot. Layout aprobado en la maqueta de revisión (2026-08-31):
// https://claude.ai/code/artifact/118611b1-8aaf-4348-b068-02fe244eb6da
import { BASE_CSS } from './styles.mjs'
import {
  Photo, Vignette, ScrimBottom, ScrimTop, BrandMark, EyebrowTag, Badge,
  SpecLine, SpecGrid, GoldRule, VehicleName, SafeArea, esc,
} from './components.mjs'

function doc(width, height, body) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${BASE_CSS}</style></head>` +
    `<body style="width:${width}px;height:${height}px;">${body}</body></html>`
}

// Miles con punto, sin depender de Intl/toLocaleString: en builds "small-icu" de
// Node (frecuente por defecto), el locale es-ES no tiene datos completos y
// toLocaleString('es-ES') formatea de forma inconsistente según el rango del
// número (comprobado: 2400 -> "2400" sin punto, pero 10000 -> "10.000" sí) —
// hallazgo real durante la primera prueba de este renderer, no algo asumido.
function esNumber(n) {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function vehicleSpecLine(v) {
  return SpecLine([
    { value: v.power_hp ? `${v.power_hp} CV` : null },
    { value: v.mileage_km != null ? `${esNumber(v.mileage_km)} km` : null },
    { value: v.year },
    { value: v.price_on_request ? 'Consultar precio' : (v.price ? `${esNumber(v.price)} €` : null) },
  ])
}

function vehicleName(v) {
  return [v.brand_name, v.model_name].filter(Boolean).join(' ')
}

// IG-P1 — Unidad destacada
export function renderP1({ vehicle, imageUrl }) {
  const body = `
    ${Photo({ src: imageUrl })}
    ${Vignette()}
    ${ScrimBottom({ height: '56%' })}
    ${BrandMark({ top: 64, left: 64 })}
    ${EyebrowTag({ label: 'Selección' })}
    <div class="stack-bottom">
      ${GoldRule()}
      ${VehicleName({ text: vehicleName(vehicle), size: 'xl' })}
      ${vehicleSpecLine(vehicle)}
    </div>`
  return doc(1080, 1350, body)
}

// IG-P2 — Recién llegado
export function renderP2({ vehicle, imageUrl }) {
  const body = `
    ${Photo({ src: imageUrl })}
    ${Vignette()}
    ${ScrimBottom({ height: '56%' })}
    ${BrandMark({ top: 64, left: 64 })}
    ${Badge({ label: 'Recién llegado' })}
    <div class="stack-bottom">
      ${GoldRule()}
      ${VehicleName({ text: vehicleName(vehicle), size: 'lg' })}
      ${SpecLine([
        { value: vehicle.power_hp ? `${vehicle.power_hp} CV` : null },
        { value: vehicle.mileage_km != null ? `${esNumber(vehicle.mileage_km)} km` : null },
        { value: vehicle.location_province },
      ])}
    </div>`
  return doc(1080, 1350, body)
}

// IG-P3 — Portada de carrusel
export function renderP3({ vehicle, imageUrl, slideIndex = 1, slideTotal = 1 }) {
  // slideIndex/slideTotal vienen de un JSON externo (el manifiesto semanal) — un
  // typo humano (ej. "50" en vez de "5") no debe poder generar cientos de nodos ni
  // un contador sin sentido ("07 / 05"). Acotado a un carrusel real (máx. 20 slides).
  const total = Math.min(Math.max(Math.round(Number(slideTotal)) || 1, 1), 20)
  const index = Math.min(Math.max(Math.round(Number(slideIndex)) || 1, 1), total)
  const dots = Array.from({ length: total }, (_, i) =>
    `<span class="${i === index - 1 ? 'active' : ''}"></span>`).join('')
  const body = `
    ${Photo({ src: imageUrl })}
    ${Vignette()}
    ${ScrimTop({ height: '30%' })}
    ${ScrimBottom({ height: '56%' })}
    ${BrandMark({ top: 64, left: 64 })}
    <div class="dots">${dots}</div>
    <div class="counter"><b>${esc(String(index).padStart(2, '0'))}</b>&nbsp;/&nbsp;${esc(String(total).padStart(2, '0'))}</div>
    <div class="stack-bottom" style="bottom:96px;">
      ${GoldRule()}
      ${VehicleName({ text: vehicleName(vehicle), size: 'lg' })}
    </div>`
  return doc(1080, 1350, body)
}

// IG-P4 — Specs / tabla
export function renderP4({ vehicle, eyebrow, subtitle, specs, imageUrl }) {
  const photostrip = imageUrl ? `<div class="p4-photostrip"><div><img src="${esc(imageUrl)}" alt=""></div></div>` : ''
  const body = `
    ${BrandMark({ top: 56, left: 56 })}
    <div class="p4">
      <div class="p4-eyebrow">${esc(eyebrow || 'Ficha técnica')}</div>
      <h3 class="p4-title">${esc(vehicleName(vehicle))}</h3>
      ${subtitle ? `<p class="p4-sub">${esc(subtitle)}</p>` : ''}
      ${SpecGrid(specs || [])}
      ${photostrip}
    </div>`
  return doc(1080, 1350, body)
}

// IG-P5 — Split comparativa (nunca declara ganador)
export function renderP5({ headline, left, right, centerMark = '↔' }) {
  const half = (side, align) => `
    <div class="half"><img src="${esc(side.imageUrl)}" alt="">
      <div class="halfcap"><div class="yr">${esc(side.year)}</div><div class="nm">${esc(side.label)}</div></div>
    </div>`
  const body = `
    <div class="split-head"><span class="k">${esc(headline)}</span></div>
    <div class="split">
      ${half(left)}
      ${half(right)}
      <div class="divider"></div>
      <div class="vs">${esc(centerMark)}</div>
    </div>`
  return doc(1080, 1350, body)
}

// IG-P6 — Tarjeta tipográfica (sin foto, a propósito — ritmo 2+1)
export function renderP6({ quoteLead, quoteEmphasis, footLabel = 'Black Label Market' }) {
  const body = `
    <div class="p6">
      <div class="p6-mark">B</div>
      <p class="p6-quote">${esc(quoteLead)}<br><em>${esc(quoteEmphasis)}</em></p>
      <div class="p6-foot"><span class="p6-line"></span><span>${esc(footLabel)}</span></div>
    </div>`
  return doc(1080, 1350, body)
}

// IG-P7 — Story de unidad (9:16). Siempre derivada, nunca pieza madre — reutiliza
// la misma plantilla de imagen, solo cambia proporción y zonas seguras.
export function renderP7({ vehicle, imageUrl }) {
  const body = `
    ${Photo({ src: imageUrl })}
    ${Vignette()}
    ${ScrimTop({ height: '18%' })}
    ${ScrimBottom({ height: '28%' })}
    ${SafeArea({ top: 0, height: 250, label: 'Zona reservada — perfil / cabecera' })}
    ${SafeArea({ height: 310, label: 'Zona reservada — respuesta' })}
    ${BrandMark({ top: 280, left: 64 })}
    <div class="stack-bottom" style="bottom:340px;">
      ${GoldRule()}
      ${VehicleName({ text: vehicleName(vehicle), size: 'lg' })}
      ${SpecLine([
        { value: vehicle.power_hp ? `${vehicle.power_hp} CV` : null },
        { value: vehicle.year },
      ])}
    </div>`
  return doc(1080, 1920, body)
}

// IG-P8 — Cierre / CTA. Sin vehículo concreto — cierra un carrusel o una racha.
export function renderP8({ headline, subtext, ctaLabel = 'Ver catálogo →' }) {
  const body = `
    <div class="p8">
      <div class="p8-mono">B</div>
      <h3 class="p8-h">${esc(headline)}</h3>
      <p class="p8-p">${esc(subtext)}</p>
      <div class="p8-cta"><span>${esc(ctaLabel)}</span></div>
    </div>`
  return doc(1080, 1350, body)
}

export const TEMPLATES = {
  'IG-P1': { render: renderP1, dims: [1080, 1350] },
  'IG-P2': { render: renderP2, dims: [1080, 1350] },
  'IG-P3': { render: renderP3, dims: [1080, 1350] },
  'IG-P4': { render: renderP4, dims: [1080, 1350] },
  'IG-P5': { render: renderP5, dims: [1080, 1350] },
  'IG-P6': { render: renderP6, dims: [1080, 1350] },
  'IG-P7': { render: renderP7, dims: [1080, 1920] },
  'IG-P8': { render: renderP8, dims: [1080, 1350] },
}
