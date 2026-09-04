// Parser de CSV sin librería externa — texto puro, sin DOM ni APIs de servidor, para poder
// importarse tanto desde el dashboard (app/(dashboard)/dashboard/importar/ImportarClient.tsx,
// 'use client') como desde el disparador automático de CSV de la sala de configuración
// (app/api/onboarding/[token]/complete/route.ts, servidor). Antes vivía duplicado solo en el
// cliente; se extrae aquí (migración 110) para que ambos canales usen exactamente las mismas
// reglas de columnas y validación.

// Plantilla descargable (31 columnas) — compartida entre el importador CSV del dashboard y el
// modo CSV de la sala de configuración (2026-09-04: la sala no ofrecía ninguna plantilla de
// referencia, solo el botón de subida, así que el fundador no tenía forma de saber el formato
// esperado sin ir antes al dashboard).
const TEMPLATE_HEADERS = [
  'tipo', 'marca', 'modelo', 'version', 'año', 'km',
  'precio', 'precio_consultar', 'combustible', 'cambio', 'traccion',
  'potencia_cv', 'potencia_kw', 'par_nm', 'cilindrada', 'cilindros',
  'carroceria', 'condicion', 'color', 'color_interior', 'tapiceria',
  'puertas', 'plazas', 'etiqueta_dgt', 'año_matriculacion', 'num_propietarios',
  'iva_deducible', 'descripcion', 'vin', 'fotos', 'id_externo',
].join(',')

const TEMPLATE_EXAMPLE = [
  'coche', 'Ferrari', '488 GTB', 'Spider', '2019', '12000',
  '280000', '', 'gasolina', 'automatico', 'rwd',
  '670', '493', '760', '3902', '8',
  'Coupé', 'seminuevo', 'Rojo Corsa', 'Negro', 'Cuero Nappa',
  '2', '2', 'C', '2017', '1',
  'no', 'Ferrari 488 GTB en perfecto estado con libro de revisiones.', '',
  'https://ejemplo.com/foto1.jpg|https://ejemplo.com/foto2.jpg', '',
].join(',')

export const TEMPLATE_CSV = `${TEMPLATE_HEADERS}\n${TEMPLATE_EXAMPLE}\n`

export function parseCSVLine(line: string): string[] {
  const fields: string[] = []
  let cur = ''
  let inQ = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++ }
      else inQ = !inQ
    } else if ((ch === ',' || ch === ';') && !inQ) {
      fields.push(cur.trim())
      cur = ''
    } else {
      cur += ch
    }
  }
  fields.push(cur.trim())
  return fields
}

export function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const clean = text.replace(/^﻿/, '').trim()
  const lines = clean.split('\n').map(l => l.replace(/\r$/, '')).filter(Boolean)
  if (lines.length < 2) return { headers: [], rows: [] }
  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '_').trim())
  const rows = lines.slice(1).map(line => {
    const vals = parseCSVLine(line)
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? '']))
  })
  return { headers, rows }
}

// CSV header aliases → nombres de campo del pipeline de intake (lib/vehicle-intake/types.ts +
// ImportRow en app/api/vehicles/import/route.ts). image_urls/external_ref añadidos 2026-09-04:
// antes ninguna cabecera de CSV llegaba a poblarlos, así que ninguna fila importada por CSV
// llevaba nunca foto (siempre caía en el borrador "sin fotos") ni se deduplicaba entre corridas.
export const ALIAS: Record<string, string> = {
  tipo: 'vehicle_type', tipo_vehiculo: 'vehicle_type',
  marca: 'brand_name',
  modelo: 'model_name',
  version: 'version',
  ano: 'year', anio: 'year', year: 'year', año: 'year',
  km: 'mileage_km', kilometros: 'mileage_km', kilometraje: 'mileage_km',
  precio: 'price', price: 'price',
  precio_consultar: 'price_on_request',
  combustible: 'fuel_type',
  cambio: 'transmission', transmision: 'transmission',
  potencia_cv: 'power_hp', cv: 'power_hp', potencia: 'power_hp',
  potencia_kw: 'power_kw',
  par_nm: 'torque_nm', par_motor: 'torque_nm',
  cilindrada: 'displacement_cc', cilindrada_cc: 'displacement_cc',
  cilindros: 'cylinders',
  traccion: 'drive_type', drive_type: 'drive_type',
  color: 'color_exterior', color_exterior: 'color_exterior',
  color_interior: 'color_interior',
  tapiceria: 'upholstery', tapicería: 'upholstery',
  carroceria: 'body_type', carrocería: 'body_type', body_type: 'body_type',
  condicion: 'condition_type', estado_vehiculo: 'condition_type',
  año_matriculacion: 'registration_year', ano_matriculacion: 'registration_year',
  puertas: 'doors',
  plazas: 'seats',
  etiqueta_dgt: 'dgt_label',
  num_propietarios: 'num_owners', propietarios: 'num_owners',
  iva_deducible: 'iva_deducible',
  descripcion: 'description', description: 'description',
  vin: 'vin', bastidor: 'vin',
  negociable: 'is_negotiable',
  financiacion: 'financing_available', financiación: 'financing_available',
  garantia: 'has_warranty', garantía: 'has_warranty',
  meses_garantia: 'warranty_months',
  prueba: 'has_test_drive',
  foto: 'image_urls', fotos: 'image_urls', imagen: 'image_urls', imagenes: 'image_urls',
  imágenes: 'image_urls', foto_url: 'image_urls', fotos_url: 'image_urls', fotos_urls: 'image_urls',
  image_url: 'image_urls', image_urls: 'image_urls', photo_urls: 'image_urls', urls_fotos: 'image_urls',
  id_externo: 'external_ref', referencia: 'external_ref', ref: 'external_ref', external_ref: 'external_ref',
}

export function normaliseRow(raw: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(raw)) {
    const mapped = ALIAS[k] ?? k
    out[mapped] = v
  }
  return out
}

export function validateRow(r: Record<string, string>): string | null {
  if (!r.brand_name?.trim()) return 'Falta marca'
  if (!r.model_name?.trim()) return 'Falta modelo'
  const y = parseInt(r.year ?? '')
  if (!y || y < 1900 || y > new Date().getFullYear() + 2) return `Año inválido (${r.year})`
  const km = parseInt((r.mileage_km ?? '').replace(/\D/g, ''))
  if (isNaN(km) || km < 0) return `Km inválidos (${r.mileage_km})`
  return null
}

/** Una celda de CSV solo puede llevar texto plano — varias fotos en una misma celda se separan
 * con "|" (convención del proyecto, ver plantilla de importación) y, de forma tolerante, también
 * con "," ";" o salto de línea si el dealer no siguió la convención al pie de la letra. */
export function splitImageUrls(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map(String).map(s => s.trim()).filter(Boolean)
  }
  if (typeof raw !== 'string' || !raw.trim()) return []
  return raw.split(/[|,;\n]+/).map(s => s.trim()).filter(Boolean)
}
