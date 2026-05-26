import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { FuelType, TransmissionType, DriveType, VehicleStatus, DealerStatus, LeadStatus, VehicleCondition } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | null, currency = 'EUR', onRequest = false): string {
  if (onRequest || price === null) return 'Precio bajo consulta'
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatMileage(km: number): string {
  return new Intl.NumberFormat('es-ES').format(km) + ' km'
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('es-ES').format(n)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function vehicleSlug(brand: string, model: string, year: number, id: string): string {
  return `${slugify(brand)}-${slugify(model)}-${year}-${id.slice(0, 8)}`
}

export const FUEL_LABELS: Record<FuelType, string> = {
  gasoline: 'Gasolina',
  diesel: 'Diésel',
  electric: 'Eléctrico',
  hybrid: 'Híbrido',
  plugin_hybrid: 'Híbrido Enchufable',
  hydrogen: 'Hidrógeno',
  other: 'Otro',
}

export const TRANSMISSION_LABELS: Record<TransmissionType, string> = {
  manual: 'Manual',
  automatic: 'Automático',
  semi_automatic: 'Semiautomático',
  dct: 'Doble Embrague',
  cvt: 'CVT',
}

export const DRIVE_LABELS: Record<DriveType, string> = {
  rwd: 'Tracción trasera',
  fwd: 'Tracción delantera',
  awd: 'Tracción total',
  '4wd': '4x4',
}

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  draft: 'Borrador',
  pending_review: 'En revisión',
  active: 'Activo',
  paused: 'Pausado',
  sold: 'Vendido',
  expired: 'Caducado',
}

export const DEALER_STATUS_LABELS: Record<DealerStatus, string> = {
  pending: 'Pendiente',
  active: 'Activo',
  suspended: 'Suspendido',
  trial: 'Trial',
}

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'Nuevo',
  contacted: 'Contactado',
  negotiating: 'En negociación',
  closed: 'Cerrado',
  discarded: 'Descartado',
}

export function getVehicleStatusColor(status: VehicleStatus): string {
  const map: Record<VehicleStatus, string> = {
    draft: 'text-bsm-text-muted bg-surface',
    pending_review: 'text-amber-400 bg-amber-400/10',
    active: 'text-emerald-400 bg-emerald-400/10',
    paused: 'text-bsm-text-secondary bg-surface',
    sold: 'text-gold bg-gold/10',
    expired: 'text-red-400 bg-red-400/10',
  }
  return map[status]
}

export function getLeadStatusColor(status: LeadStatus): string {
  const map: Record<LeadStatus, string> = {
    new: 'text-gold bg-gold/10',
    contacted: 'text-blue-400 bg-blue-400/10',
    negotiating: 'text-amber-400 bg-amber-400/10',
    closed: 'text-emerald-400 bg-emerald-400/10',
    discarded: 'text-bsm-text-muted bg-surface',
  }
  return map[status]
}

export function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'hace un momento'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `hace ${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `hace ${days}d`
  const months = Math.floor(days / 30)
  return `hace ${months} mes${months > 1 ? 'es' : ''}`
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export const BODY_TYPES_CAR = [
  'Coupé', 'Cabrio / Roadster', 'Berlina', 'Familiar', 'SUV',
  'Compacto', 'Compacto deportivo', 'Shooting Brake', 'Pick-up', 'Supercar', 'Hypercar',
]

export const BODY_TYPES_MOTO = [
  'Naked', 'Superbike', 'Sport Touring', 'Cruiser', 'Custom', 'Scrambler',
  'Adventure', 'Enduro', 'Chopper', 'Café Racer', 'Eléctrica',
]

export const COLORS = [
  'Negro', 'Blanco', 'Gris', 'Plata', 'Rojo', 'Azul', 'Verde', 'Amarillo',
  'Naranja', 'Marrón', 'Beige', 'Dorado', 'Morado', 'Color especial', 'Otro',
]

export const VEHICLE_CONDITION_LABELS: Record<VehicleCondition, string> = {
  new:        'Nuevo',
  seminuevo:  'Seminuevo',
  ocasion:    'Ocasión',
  clasico:    'Clásico',
  restaurado: 'Restaurado',
  preparado:  'Preparado',
  coleccion:  'Colección',
}

export const SPAIN_PROVINCES = [
  'Álava', 'Albacete', 'Alicante', 'Almería', 'Asturias', 'Ávila',
  'Badajoz', 'Barcelona', 'Burgos', 'Cáceres', 'Cádiz', 'Cantabria',
  'Castellón', 'Ciudad Real', 'Córdoba', 'A Coruña', 'Cuenca',
  'Girona', 'Granada', 'Guadalajara', 'Guipúzcoa', 'Huelva', 'Huesca',
  'Islas Baleares', 'Jaén', 'León', 'Lleida', 'La Rioja', 'Lugo',
  'Madrid', 'Málaga', 'Murcia', 'Navarra', 'Ourense', 'Palencia',
  'Las Palmas', 'Pontevedra', 'Salamanca', 'Santa Cruz de Tenerife',
  'Segovia', 'Sevilla', 'Soria', 'Tarragona', 'Teruel', 'Toledo',
  'Valencia', 'Valladolid', 'Vizcaya', 'Zamora', 'Zaragoza',
  'Ceuta', 'Melilla',
]

export const UPHOLSTERY = ['Piel', 'Alcántara', 'Cuero Nappa', 'Tela', 'Cuero sintético', 'Otro']

export const EQUIPMENT_CATEGORIES = {
  'Seguridad': ['ABS', 'Control de estabilidad', 'Asistente de arranque en pendiente', 'Airbags frontales', 'Airbags laterales', 'Cámara de visión trasera', 'Sensores de aparcamiento', 'Control de crucero adaptativo', 'Alerta de colisión'],
  'Confort': ['Climatizador', 'Asientos calefactables', 'Asientos ventilados', 'Asientos con masaje', 'Techo panorámico', 'Techo solar eléctrico', 'Arranque sin llave', 'Apertura sin llave', 'Volante calefactable'],
  'Tecnología': ['Pantalla táctil', 'Apple CarPlay', 'Android Auto', 'Head-up display', 'Sistema de sonido premium', 'Carga inalámbrica', 'Wi-Fi integrado', 'Sistema de navegación'],
  'Performance': ['Frenos cerámicos', 'Suspensión deportiva', 'Diferencial activo', 'Launch control', 'Modos de conducción', 'Escape sport', 'Paquete aerodinámico'],
  'Exterior': ['Llantas de aleación', 'Cristales tintados', 'Faros LED', 'Faros Matrix', 'Pintura metálica', 'Techo panorámico', 'Espejos calefactables'],
}
