import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://blacklabelmarket.es'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  const [
    { data: vehicles },
    { data: dealers },
    { data: brands },
  ] = await Promise.all([
    supabase
      .from('vehicles')
      .select('slug, vehicle_type, updated_at')
      .eq('status', 'active'),
    supabase
      .from('dealers')
      .select('slug, updated_at')
      .eq('status', 'active'),
    supabase
      .from('brands')
      .select('slug, updated_at')
      .eq('is_active', true),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL,              lastModified: new Date(), changeFrequency: 'daily',   priority: 1 },
    { url: `${BASE_URL}/coches`,  lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${BASE_URL}/motos`,   lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${BASE_URL}/marcas`,  lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE_URL}/dealers`, lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE_URL}/precios`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/contacto`,lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/legal/aviso-legal`,  lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE_URL}/legal/privacidad`,   lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE_URL}/legal/cookies`,      lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE_URL}/legal/terminos`,     lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
  ]

  const vehicleRoutes: MetadataRoute.Sitemap = (vehicles || []).map((v) => ({
    url: `${BASE_URL}/${v.vehicle_type === 'car' ? 'coches' : 'motos'}/${v.slug}`,
    lastModified: new Date(v.updated_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const dealerRoutes: MetadataRoute.Sitemap = (dealers || []).map((d) => ({
    url: `${BASE_URL}/dealers/${d.slug}`,
    lastModified: new Date(d.updated_at),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  const brandRoutes: MetadataRoute.Sitemap = (brands || []).map((b) => ({
    url: `${BASE_URL}/marcas/${b.slug}`,
    lastModified: new Date(b.updated_at || new Date()),
    changeFrequency: 'weekly',
    priority: 0.5,
  }))

  return [...staticRoutes, ...vehicleRoutes, ...dealerRoutes, ...brandRoutes]
}
