// Fuente única de verdad para la presentación de planes en la web pública y el
// dashboard del vendedor. Es estática a propósito: una página de precios nunca
// debe renderizar vacía por depender del estado de los seeds en la BD.
//
// IMPORTANTE: En ninguna parte de la web se habla de facturación anual.
// Todos los precios son mensuales (€/mes), sin IVA. No existe programa Founding.

export type CellValue = number | boolean | 'destacado'

export interface PlanDef {
  slug: 'essential' | 'professional' | 'elite'
  name: string
  /** Precio mensual normal (€/mes, sin IVA) */
  monthlyPrice: number
  tagline: string
  popular?: boolean
  /** Elite: plazas limitadas y gobernadas por disponibilidad */
  limited?: boolean
  values: Record<string, CellValue>
}

/**
 * Aclaración pública del plan Elite. Nunca debe exponer el tope interno de
 * vendedores (cifra de gestión interna, no publicada): solo el copy genérico.
 */
export const ELITE_LIMIT_NOTE = 'Plazas limitadas según disponibilidad y zona.'

// --- Ficha completa de cada plan para la página pública de precios ---
// Cada fila es una funcionalidad o un límite, ya redactado en lenguaje natural.
// 'info' es el texto que se despliega bajo la fila (icono ℹ️) cuando aporta
// una aclaración necesaria (igual que en docs/planes-suscripcion-definitivos.md).
// No incluye add-ons: esos solo se muestran dentro del dashboard del vendedor.

export type FeatureRowKind = 'value' | 'included' | 'excluded' | 'destacado'

export interface PlanFeatureRow {
  label: string
  kind: FeatureRowKind
  /** Texto a la derecha cuando kind === 'value' (ej. "Hasta 50") */
  value?: string
  /** Texto explicativo desplegable (icono ℹ️) */
  info?: string
}

const ALTA_PREMIUM_LABEL = 'Alta Premium del showroom'
const ALTA_PREMIUM_INFO =
  'Alta de tu perfil e importación inicial de tu inventario, optimizada con IA, incluida una vez. ' +
  'También cubre la migración de catálogos grandes o desordenados: no se cobra aparte en ningún plan.'

const BOOST_INFO =
  'Posiciona uno de tus vehículos en primer lugar de los resultados durante 7 días, dándole visibilidad extra frente al resto del inventario.'

export const PLAN_FEATURES: Record<PlanDef['slug'], PlanFeatureRow[]> = {
  essential: [
    { label: 'Vehículos publicados', kind: 'value', value: 'Hasta 15' },
    { label: 'Usuarios', kind: 'value', value: '1' },
    { label: 'Sedes', kind: 'value', value: '1' },
    { label: 'Perfil verificado', kind: 'included' },
    { label: ALTA_PREMIUM_LABEL, kind: 'included', info: ALTA_PREMIUM_INFO },
    { label: 'Gestión de inventario', kind: 'value', value: 'Manual' },
    {
      label: 'Panel de oportunidades',
      kind: 'included',
      info: 'Bandeja con los contactos que generan tus vehículos: quién te ha contactado, sobre qué vehículo y cuándo, con estados para hacerles seguimiento. En Essential es una bandeja; en los planes superiores se convierte en un pipeline visual.',
    },
    {
      label: 'Analítica de tu showroom',
      kind: 'value',
      value: 'Básica · 30 días',
      info: 'Vistas, contactos y vehículos guardados de los últimos 30 días.',
    },
    { label: 'Boosts incluidos', kind: 'value', value: '0', info: BOOST_INFO },
  ],
  professional: [
    { label: 'Vehículos publicados', kind: 'value', value: 'Hasta 50' },
    { label: 'Usuarios', kind: 'value', value: '3' },
    { label: 'Sedes', kind: 'value', value: '1' },
    { label: 'Perfil verificado', kind: 'included' },
    { label: ALTA_PREMIUM_LABEL, kind: 'included', info: ALTA_PREMIUM_INFO },
    {
      label: 'Gestión de inventario',
      kind: 'value',
      value: 'Manual + carga por CSV',
      info: 'Además de la carga manual, sube o actualiza tu inventario completo con un archivo CSV cuando lo necesites, sin crear cada ficha a mano.',
    },
    {
      label: 'Pipeline de oportunidades',
      kind: 'included',
      info: 'Gestiona tus oportunidades en un tablero visual con estados (Nueva → Contactada → Cita → Ganada/Perdida).',
    },
    {
      label: 'Analítica de tu showroom',
      kind: 'value',
      value: 'Avanzada · 180 días',
      info: 'Sobre la analítica básica: rendimiento por vehículo, funnel de visita→contacto, evolución temporal e histórico de 180 días.',
    },
    {
      label: 'Vehículos a la carta',
      kind: 'included',
      info: 'Acceso al tablón general: cuando un comprador busca algo que no tienes publicado, tu showroom entra en el reparto de esa oportunidad.',
    },
    {
      label: 'Agente de cualificación en la ficha',
      kind: 'included',
      info: 'En lugar del formulario, un asistente conversa con el comprador en la ficha y cualifica su interés (qué busca, presupuesto y plazo). El contacto te llega ya valorado y entra directamente en tu pipeline.',
    },
    { label: 'Boosts incluidos', kind: 'value', value: '1/mes', info: BOOST_INFO },
  ],
  elite: [
    { label: 'Vehículos publicados', kind: 'value', value: 'Hasta 100', info: 'Ampliable en bloques de 25 vehículos adicionales desde tu panel.' },
    { label: 'Usuarios', kind: 'value', value: '10' },
    { label: 'Sedes', kind: 'value', value: '1' },
    { label: 'Perfil verificado', kind: 'included' },
    { label: ALTA_PREMIUM_LABEL, kind: 'included', info: ALTA_PREMIUM_INFO },
    {
      label: 'Gestión del stock automatizado',
      kind: 'included',
      info: 'Conecta tu feed o DMS: tu inventario se mantiene sincronizado automáticamente, sin subir nada a mano.',
    },
    {
      label: 'Pipeline de oportunidades',
      kind: 'included',
      info: 'Tablero visual para gestionar oportunidades con estados claros y seguimiento comercial del equipo.',
    },
    {
      label: 'Analítica de tu showroom',
      kind: 'value',
      value: '365 días',
      info: 'Toda la analítica de Professional + histórico de 365 días, comparativas ampliadas de rendimiento y una sugerencia de mejora basada en tus datos.',
    },
    {
      label: 'Vehículos a la carta',
      kind: 'included',
      info: 'Tablón general con ventana exclusiva de 24 h: ves antes que el resto del market las búsquedas que coinciden con tu stock.',
    },
    {
      label: 'Agente de cualificación en la ficha',
      kind: 'included',
      info: 'El asistente conversa con el comprador en la ficha y cualifica su interés antes de crear la oportunidad en tu pipeline.',
    },
    {
      label: 'Showroom destacado',
      kind: 'destacado',
      info: 'Tu showroom aparece con etiqueta "Destacado" y en posición preferente (bloque superior) en los listados, por delante de Essential y Professional. Rotación equitativa entre los Elite.',
    },
    {
      label: 'Diagnóstico Anti-Fuga',
      kind: 'included',
      info: 'Mini-auditoría que detecta 3 fugas de oportunidades de tu showroom y te da recomendaciones priorizadas. Incluido de serie, una vez al semestre.',
    },
    { label: 'Boosts incluidos', kind: 'value', value: '3/mes', info: BOOST_INFO },
  ],
}

export const PLANS: PlanDef[] = [
  {
    slug: 'essential',
    name: 'Essential',
    monthlyPrice: 197,
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
      analytics_advanced: true,
      vehicles_on_request: true,
      showroom_featured: false,
      showroom_listing_priority: false,
    },
  },
  {
    slug: 'elite',
    name: 'Elite',
    monthlyPrice: 899,
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
    name: '+10 vehículos publicados',
    price: '59 €',
    unit: '/mes por bloque',
    desc: 'Amplía tu límite de inventario publicado en bloques de 10.',
    appliesTo: ['essential', 'professional'],
    action: 'request',
  },
  {
    slug: 'block_25',
    name: '+25 vehículos publicados',
    price: '99 €',
    unit: '/mes por bloque',
    desc: 'Bloques de 25 vehículos adicionales para inventarios grandes.',
    appliesTo: ['elite'],
    action: 'request',
  },
  {
    slug: 'stock_sync',
    name: 'Stock automatizado',
    price: '99 €',
    unit: '/mes',
    desc: 'Conecta tu feed o DMS y mantén el inventario sincronizado automáticamente, sin subir nada a mano. Incluido en el plan Elite.',
    appliesTo: ['essential', 'professional'],
    action: 'request',
    includedInElite: true,
  },
  {
    slug: 'diagnostico_antifuga',
    name: 'Diagnóstico Anti-Fuga',
    price: '149 €',
    unit: 'puntual',
    desc: 'Mini-auditoría que detecta 3 fugas de oportunidades de tu showroom con recomendaciones priorizadas. En Elite va incluido de serie (1 al semestre).',
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
