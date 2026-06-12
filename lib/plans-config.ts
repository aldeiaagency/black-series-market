// Fuente única de verdad para la presentación de planes en la web pública y el
// dashboard del vendedor. Es estática a propósito: una página de precios nunca
// debe renderizar vacía por depender del estado de los seeds en la BD.
//
// IMPORTANTE: En ninguna parte de la web se habla de facturación anual.
// Todos los precios son mensuales (€/mes), sin IVA.

export type CellValue = number | boolean | 'destacado'

export interface PlanDef {
  slug: 'essential' | 'professional' | 'elite'
  name: string
  /** Precio mensual normal (€/mes, sin IVA) */
  monthlyPrice: number
  /** Precio Founding: mitad del precio mensual, bloqueado de por vida */
  foundingPrice: number
  tagline: string
  popular?: boolean
  /** Elite: plazas limitadas y gobernadas por disponibilidad */
  limited?: boolean
  values: Record<string, CellValue>
}

export interface ComparisonRow {
  key: string
  label: string
  type: 'limit' | 'feature'
  suffix?: string
}

/** Tope de vendedores con condición Founding (programa cerrado). */
export const FOUNDING_MAX_SELLERS = 20

/** Tope de vendedores con plan Elite en la plataforma. */
export const ELITE_MAX_SELLERS = 50

/** Aclaración pública del plan Elite (sin exponer números internos de capacidad). */
export const ELITE_LIMIT_NOTE = `Plan limitado a ${ELITE_MAX_SELLERS} vendedores en la plataforma. Se habilitarán nuevas plazas según disponibilidad.`

export const COMPARISON_ROWS: ComparisonRow[] = [
  { key: 'max_active_vehicles',       label: 'Vehículos activos',           type: 'limit' },
  { key: 'max_users',                 label: 'Usuarios',                    type: 'limit' },
  { key: 'verified_profile',          label: 'Perfil verificado',           type: 'feature' },
  { key: 'manual_inventory',          label: 'Inventario manual',           type: 'feature' },
  { key: 'csv_recurring',             label: 'Importación CSV recurrente',   type: 'feature' },
  { key: 'stock_sync',                label: 'Sincronización del stock',     type: 'feature' },
  { key: 'opportunities_inbox',       label: 'Bandeja de oportunidades',     type: 'feature' },
  { key: 'pipeline',                  label: 'Pipeline kanban',             type: 'feature' },
  { key: 'analytics_basic',           label: 'Analítica básica',            type: 'feature' },
  { key: 'analytics_retention_days',  label: 'Historial analítico',         type: 'limit', suffix: ' días' },
  { key: 'analytics_advanced',        label: 'Analítica avanzada',          type: 'feature' },
  { key: 'vehicles_on_request',       label: 'Vehículos a la carta',        type: 'feature' },
  { key: 'showroom_featured',         label: 'Showroom Destacado',          type: 'feature' },
  { key: 'showroom_listing_priority', label: 'Prioridad en listados',       type: 'feature' },
]

export const PLANS: PlanDef[] = [
  {
    slug: 'essential',
    name: 'Essential',
    monthlyPrice: 179,
    foundingPrice: 89.5,
    tagline: 'Presencia premium para empezar.',
    values: {
      max_active_vehicles: 15,
      max_users: 1,
      verified_profile: true,
      manual_inventory: true,
      csv_recurring: false,
      stock_sync: false,
      opportunities_inbox: true,
      pipeline: false,
      analytics_basic: true,
      analytics_retention_days: 30,
      analytics_advanced: false,
      vehicles_on_request: false,
      showroom_featured: false,
      showroom_listing_priority: false,
    },
  },
  {
    slug: 'professional',
    name: 'Professional',
    monthlyPrice: 449,
    foundingPrice: 224.5,
    tagline: 'El estándar para concesionarios activos.',
    popular: true,
    values: {
      max_active_vehicles: 50,
      max_users: 3,
      verified_profile: true,
      manual_inventory: true,
      csv_recurring: true,
      stock_sync: false,
      opportunities_inbox: true,
      pipeline: true,
      analytics_basic: true,
      analytics_retention_days: 180,
      analytics_advanced: false,
      vehicles_on_request: true,
      showroom_featured: false,
      showroom_listing_priority: true,
    },
  },
  {
    slug: 'elite',
    name: 'Elite',
    monthlyPrice: 899,
    foundingPrice: 449.5,
    tagline: 'Máxima visibilidad y automatización.',
    limited: true,
    values: {
      max_active_vehicles: 100,
      max_users: 10,
      verified_profile: true,
      manual_inventory: true,
      csv_recurring: true,
      stock_sync: true,
      opportunities_inbox: true,
      pipeline: true,
      analytics_basic: true,
      analytics_retention_days: 365,
      analytics_advanced: true,
      vehicles_on_request: true,
      showroom_featured: 'destacado',
      showroom_listing_priority: true,
    },
  },
]

// --- Complementos (add-ons) ---
// Solo se muestran DENTRO del dashboard del vendedor, nunca en la web pública.

export interface AddonDef {
  slug: string
  name: string
  price: string
  unit: string
  desc: string
  /** Planes a los que aplica el complemento */
  appliesTo: PlanDef['slug'][]
  /** 'inventory' = se activa desde la ficha del vehículo · 'request' = se solicita al equipo */
  action: 'inventory' | 'request'
  /** Marcar si ya viene incluido en Elite */
  includedInElite?: boolean
}

export const ADDONS: AddonDef[] = [
  {
    slug: 'boost_7d',
    name: 'Boost 7 días',
    price: '49 €',
    unit: 'por activación',
    desc: 'Posiciona un vehículo en primer lugar durante 7 días.',
    appliesTo: ['essential', 'professional', 'elite'],
    action: 'inventory',
  },
  {
    slug: 'pack_5_boosts',
    name: 'Pack 5 Boosts',
    price: '199 €',
    unit: '· válidos 180 días',
    desc: 'Cinco activaciones de boost. Ahorras 46 € frente a comprarlos sueltos.',
    appliesTo: ['essential', 'professional', 'elite'],
    action: 'request',
  },
  {
    slug: 'block_10',
    name: '+10 vehículos activos',
    price: '59 €',
    unit: '/mes por bloque',
    desc: 'Amplía tu límite de inventario publicado en bloques de 10.',
    appliesTo: ['essential', 'professional'],
    action: 'request',
  },
  {
    slug: 'block_25',
    name: '+25 vehículos activos',
    price: '99 €',
    unit: '/mes por bloque',
    desc: 'Bloques de 25 vehículos adicionales para inventarios grandes.',
    appliesTo: ['professional', 'elite'],
    action: 'request',
  },
  {
    slug: 'stock_sync',
    name: 'Sincronización del stock',
    price: '149 €',
    unit: '/mes',
    desc: 'Conecta tu feed o DMS y mantén el inventario sincronizado automáticamente. Incluida en el plan Elite.',
    appliesTo: ['essential', 'professional'],
    action: 'request',
    includedInElite: true,
  },
]

/** Formatea un importe en euros con coma decimal (ej. 449,5 → "449,50 €"). */
export function formatEUR(amount: number): string {
  return `${amount.toLocaleString('es-ES', { minimumFractionDigits: amount % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })} €`
}

export function getPlan(slug: string | null | undefined): PlanDef | undefined {
  return PLANS.find((p) => p.slug === slug)
}
