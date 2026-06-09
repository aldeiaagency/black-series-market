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
    { url: `${BASE_URL}/vehiculos-a-la-carta`,                lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/como-funciona`,                        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/sobre-nosotros`,                       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/legal/aviso-legal`,                    lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.2 },
    { url: `${BASE_URL}/legal/privacidad`,                     lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.2 },
    { url: `${BASE_URL}/legal/cookies`,                        lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.2 },
    { url: `${BASE_URL}/legal/terminos`,                       lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.2 },
    { url: `${BASE_URL}/legal/criterios-publicacion`,          lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.2 },
    { url: `${BASE_URL}/legal/condiciones-profesionales`,      lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.2 },
    { url: `${BASE_URL}/para-profesionales`,                   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/glosario`,                             lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/coches/clasicos`,                      lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE_URL}/coches/deportivos`,                    lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE_URL}/coches/lujo`,                          lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE_URL}/motos/deportivas`,                     lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE_URL}/motos/clasicas`,                       lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE_URL}/guias/como-comprar-supercar-segunda-mano`,          lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/guias/como-vender-coche-premium-profesionales`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/coches/suv`,                                        lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE_URL}/motos/naked`,                                       lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE_URL}/motos/touring`,                                     lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE_URL}/motos/trail`,                                       lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE_URL}/coches/especiales`,                                 lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE_URL}/motos/custom`,                                      lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE_URL}/motos/scooter`,                                     lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE_URL}/guias/motos-premium-segunda-mano`,                  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/guias/coches-clasicos-youngtimers-como-invertir`,   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/guias`,                                             lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/motos/ediciones-especiales`,                        lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE_URL}/motos/entusiastas`,                                 lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
  ]

  const TOP_CAR_BRANDS = ['ferrari', 'porsche', 'lamborghini', 'bmw', 'mclaren', 'rolls-royce', 'bentley', 'mercedes-benz', 'audi', 'bugatti']
  const TOP_MOTO_BRANDS = ['ducati', 'bmw', 'mv-agusta', 'triumph', 'harley-davidson', 'ktm', 'aprilia']

  const brandTypeRoutes: MetadataRoute.Sitemap = [
    ...TOP_CAR_BRANDS.map((b) => ({
      url: `${BASE_URL}/marcas/${b}/coches`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
    ...TOP_MOTO_BRANDS.map((b) => ({
      url: `${BASE_URL}/marcas/${b}/motos`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
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

  return [...staticRoutes, ...vehicleRoutes, ...dealerRoutes, ...brandRoutes, ...brandTypeRoutes]
}
