import 'server-only'

import type { PlanDef } from '@/lib/plans-config'

export type PaidAddonSlug =
  | 'pack_5_boosts'
  | 'block_10'
  | 'block_25'
  | 'stock_sync'
  | 'diagnostico_antifuga'

export type AddonCheckoutMode = 'payment' | 'subscription'
export type AddonActivationMode = 'automatic' | 'manual'
export type ManualActivationType = 'stock_sync' | 'diagnostico_antifuga'

export interface PaidAddonConfig {
  uiSlug: PaidAddonSlug
  dbSlug: string
  name: string
  description: string
  amountCents: number
  currency: 'eur'
  checkoutMode: AddonCheckoutMode
  activationMode: AddonActivationMode
  manualActivationType?: ManualActivationType
  appliesTo: PlanDef['slug'][]
  slots?: number
  boostCredits?: number
  boostCreditExpiryDays?: number
}

export const PAID_ADDONS: Record<PaidAddonSlug, PaidAddonConfig> = {
  pack_5_boosts: {
    uiSlug: 'pack_5_boosts',
    dbSlug: 'pack_5_boosts',
    name: 'Pack 5 Boosts',
    description: 'Cinco activaciones de boost validas durante 180 dias.',
    amountCents: 19900,
    currency: 'eur',
    checkoutMode: 'payment',
    activationMode: 'automatic',
    appliesTo: ['essential', 'professional', 'elite'],
    boostCredits: 5,
    boostCreditExpiryDays: 180,
  },
  block_10: {
    uiSlug: 'block_10',
    dbSlug: 'block_10_vehicles',
    name: '+10 vehiculos publicados',
    description: 'Amplia el limite de inventario publicado en 10 vehiculos.',
    amountCents: 5900,
    currency: 'eur',
    checkoutMode: 'subscription',
    activationMode: 'automatic',
    appliesTo: ['essential', 'professional'],
    slots: 10,
  },
  block_25: {
    uiSlug: 'block_25',
    dbSlug: 'block_25_vehicles',
    name: '+25 vehiculos publicados',
    description: 'Amplia el limite de inventario publicado en 25 vehiculos.',
    amountCents: 9900,
    currency: 'eur',
    checkoutMode: 'subscription',
    activationMode: 'automatic',
    appliesTo: ['elite'],
    slots: 25,
  },
  stock_sync: {
    uiSlug: 'stock_sync',
    dbSlug: 'feed_sync',
    name: 'Stock automatizado',
    description: 'Conexion con feed o DMS para sincronizar el inventario.',
    amountCents: 9900,
    currency: 'eur',
    checkoutMode: 'subscription',
    activationMode: 'manual',
    manualActivationType: 'stock_sync',
    appliesTo: ['essential', 'professional'],
  },
  diagnostico_antifuga: {
    uiSlug: 'diagnostico_antifuga',
    dbSlug: 'antifuga_express',
    name: 'Diagnostico Anti-Fuga',
    description: 'Mini-auditoria de fugas de oportunidades del showroom.',
    amountCents: 14900,
    currency: 'eur',
    checkoutMode: 'payment',
    activationMode: 'manual',
    manualActivationType: 'diagnostico_antifuga',
    appliesTo: ['essential', 'professional'],
  },
}

export function getPaidAddon(slug: string | null | undefined): PaidAddonConfig | null {
  if (!slug) return null
  return (PAID_ADDONS as Record<string, PaidAddonConfig>)[slug] ?? null
}

export function getPaidAddonByDbSlug(slug: string | null | undefined): PaidAddonConfig | null {
  if (!slug) return null
  return Object.values(PAID_ADDONS).find((addon) => addon.dbSlug === slug) ?? null
}

export function isPaidAddonSlug(slug: string | null | undefined): slug is PaidAddonSlug {
  return Boolean(getPaidAddon(slug))
}
