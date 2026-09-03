'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, CalendarClock, Check, FileText, ImagePlus, Loader2, Trash2, UploadCloud } from 'lucide-react'
import type { SetupRoomData } from '@/lib/onboarding/setup-room'
import { DEFAULT_RULES, DEFAULT_SETTINGS, rangesToStr, parseRanges } from '@/lib/booking'
import type { BookingSettings, Weekday, TimeRange } from '@/lib/booking'
import { createClient } from '@/lib/supabase/client'
import { FUEL_LABELS, TRANSMISSION_LABELS } from '@/lib/utils'
import { brandSlugsForType } from '@/lib/brand-types'

const DAYS: { key: Weekday; label: string }[] = [
  { key: 'mon', label: 'Lunes' }, { key: 'tue', label: 'Martes' }, { key: 'wed', label: 'Miércoles' },
  { key: 'thu', label: 'Jueves' }, { key: 'fri', label: 'Viernes' }, { key: 'sat', label: 'Sábado' }, { key: 'sun', label: 'Domingo' },
]

const SPECIALTIES = [
  { value: 'sport', label: 'Deportivos' },
  { value: 'classic', label: 'Clásicos y youngtimers' },
  { value: 'premium', label: 'Premium moderno' },
  { value: 'motorcycle', label: 'Motos premium' },
  { value: 'import', label: 'Importación' },
  { value: 'suv', label: 'Luxury SUVs' },
  { value: 'supercar', label: 'Supercars' },
  { value: 'custom', label: 'Custom bikes' },
]

const SERVICES = [
  { value: 'financing', label: 'Financiación' },
  { value: 'trade_in', label: 'Aceptan vehículos' },
  { value: 'warranty', label: 'Garantía' },
  { value: 'transport_nat', label: 'Transporte nacional' },
  { value: 'transport_intl', label: 'Transporte internacional' },
  { value: 'own_workshop', label: 'Taller propio' },
  { value: 'detailing', label: 'Detailing' },
  { value: 'home_delivery', label: 'Entrega a domicilio' },
]

type FileRef = { url: string; path: string; type: string; name?: string; size?: number; content_type?: string }

interface Props {
  token: string
  setup: SetupRoomData
  feedSyncAvailable: boolean
}

function first<T>(...values: (T | null | undefined)[]): T | '' {
  return values.find((v) => v !== null && v !== undefined && v !== '') ?? ''
}

export default function SetupRoomClient({ token, setup, feedSyncAvailable }: Props) {
  const dealer = setup.dealer
  const app = setup.application
  const needsAssistant = dealer.subscription_plan === 'professional' || dealer.subscription_plan === 'elite'
  const showAppointments = dealer.subscription_plan === 'elite' || dealer.subscription_plan === 'grupo'

  const [profile, setProfile] = useState({
    name: first(dealer.name, app?.dealer_name),
    description: first(dealer.description, app?.profile_description),
    location_city: first(dealer.location_city, app?.location_city),
    location_region: first(dealer.location_region, app?.location_region),
    address: first(dealer.address, app?.address),
    phone: first(dealer.phone, app?.phone),
    whatsapp: first(dealer.whatsapp, app?.whatsapp),
    website: first(dealer.website, app?.website),
    instagram: first(dealer.instagram, app?.instagram_url),
    facebook_url: first(dealer.facebook_url, app?.facebook_url),
    youtube_url: first(dealer.youtube_url, app?.youtube_url),
    tiktok_url: first(dealer.tiktok_url, app?.tiktok_url),
    linkedin_url: first(dealer.linkedin_url, app?.linkedin_url),
    years_in_business: first(String(dealer.years_in_business ?? ''), String(app?.years_in_business ?? '')),
    certifications: (dealer.certifications?.length ? dealer.certifications : app?.specialties) ?? [],
    services: (dealer.services?.length ? dealer.services : app?.services) ?? [],
  })
  const [assistant, setAssistant] = useState({
    financing_available: profile.services.includes('financing'),
    financing_terms: '',
    services: profile.services,
    attention_hours: '',
    negotiation_style: '',
    whatsapp_number: first(setup.assistantConfig?.whatsapp_number, dealer.whatsapp, app?.whatsapp),
  })
  const [assets, setAssets] = useState({
    logo_url: dealer.logo_url ?? '',
    cover_url: dealer.cover_url ?? '',
    documents: [] as FileRef[],
  })
  const [stock, setStock] = useState({
    mode: 'feed_url',
    feed_url: '',
    notes: '',
    csv_files: [] as FileRef[],
    bulk_files: [] as FileRef[],
  })
  const [appointments, setAppointments] = useState({
    weekly: Object.fromEntries(DAYS.map((d) => [d.key, rangesToStr(DEFAULT_RULES.weekly[d.key])])) as Record<string, string>,
    slot_minutes: String(DEFAULT_RULES.slot_minutes),
    min_hours_notice: String(DEFAULT_RULES.min_hours_notice),
    max_days_ahead: String(DEFAULT_RULES.max_days_ahead),
    mode: DEFAULT_SETTINGS.mode as BookingSettings['mode'],
    location_text: '',
    instructions: '',
  })
  const [uploading, setUploading] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [retryableSubmit, setRetryableSubmit] = useState(false)

  // Alta vehículo a vehículo: publica de verdad al pulsar "Añadir vehículo" (no espera al envío
  // final de la sala) — así el gate automático de publicación del perfil puede dispararse en
  // cuanto haya una unidad con foto, dejando el perfil listo para revisión sin depender de que el
  // equipo procese fotos sueltas a mano.
  type AddedVehicle = { id: string; brand_name: string; model_name: string; year: number; price: number | null; images: { url: string; order: number }[]; status: string }
  const [vehicles, setVehicles] = useState<AddedVehicle[]>([])
  const [vehiclesLoaded, setVehiclesLoaded] = useState(false)
  const [allBrands, setAllBrands] = useState<{ id: string; name: string; slug: string }[]>([])
  const emptyVehicleForm = {
    vehicle_type: 'car' as 'car' | 'motorcycle',
    brand_name: '', model_name: '', year: '', mileage_km: '', price: '',
    fuel_type: '', transmission: '', description: '',
    images: [] as FileRef[],
  }
  const [vehicleForm, setVehicleForm] = useState(emptyVehicleForm)
  const [addingVehicle, setAddingVehicle] = useState(false)
  const [vehicleError, setVehicleError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('brands').select('id, name, slug').eq('is_active', true).order('name')
      .then(({ data }) => setAllBrands(data ?? []))
  }, [])

  useEffect(() => {
    if (vehiclesLoaded) return
    fetch(`/api/onboarding/${encodeURIComponent(token)}/vehicles`)
      .then((r) => r.json())
      .then((json) => { if (Array.isArray(json.data)) setVehicles(json.data) })
      .finally(() => setVehiclesLoaded(true))
  }, [token, vehiclesLoaded])

  async function uploadVehiclePhotos(files: FileList | null) {
    if (!files?.length) return
    setVehicleError(null)
    setUploading('vehicle_photo')
    try {
      const uploaded: FileRef[] = []
      for (const file of Array.from(files)) {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch(`/api/onboarding/${encodeURIComponent(token)}/upload?type=vehicle_photo`, { method: 'POST', body: fd })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(json.error || 'No se pudo subir la foto.')
        uploaded.push(json)
      }
      setVehicleForm((prev) => ({ ...prev, images: [...prev.images, ...uploaded] }))
    } catch (err) {
      setVehicleError(err instanceof Error ? err.message : 'No se pudo subir la foto.')
    } finally {
      setUploading(null)
    }
  }

  async function addVehicle() {
    setVehicleError(null)
    if (!vehicleForm.brand_name || !vehicleForm.model_name || !vehicleForm.year || !vehicleForm.mileage_km) {
      setVehicleError('Completa marca, modelo, año y kilometraje.')
      return
    }
    if (vehicleForm.images.length === 0) {
      setVehicleError('Añade al menos una foto del vehículo.')
      return
    }
    setAddingVehicle(true)
    try {
      const res = await fetch(`/api/onboarding/${encodeURIComponent(token)}/vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle_type: vehicleForm.vehicle_type,
          brand_name: vehicleForm.brand_name,
          model_name: vehicleForm.model_name,
          year: Number(vehicleForm.year),
          mileage_km: Number(vehicleForm.mileage_km),
          price: vehicleForm.price ? Number(vehicleForm.price) : null,
          price_on_request: !vehicleForm.price,
          fuel_type: vehicleForm.fuel_type || null,
          transmission: vehicleForm.transmission || null,
          description: vehicleForm.description || null,
          images: vehicleForm.images.map((f, i) => ({ url: f.url, order: i })),
          status: 'active',
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'No se pudo publicar el vehículo.')
      setVehicles((prev) => [...prev, {
        id: json.id, brand_name: vehicleForm.brand_name, model_name: vehicleForm.model_name,
        year: Number(vehicleForm.year), price: vehicleForm.price ? Number(vehicleForm.price) : null,
        images: vehicleForm.images.map((f, i) => ({ url: f.url, order: i })), status: 'active',
      }])
      setVehicleForm(emptyVehicleForm)
    } catch (err) {
      setVehicleError(err instanceof Error ? err.message : 'No se pudo publicar el vehículo.')
    } finally {
      setAddingVehicle(false)
    }
  }

  async function removeVehicle(id: string) {
    setVehicles((prev) => prev.filter((v) => v.id !== id))
    try {
      await fetch(`/api/onboarding/${encodeURIComponent(token)}/vehicles?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    } catch {}
  }

  const brandOptions = useMemo(() => {
    const activeSlugs = brandSlugsForType(vehicleForm.vehicle_type)
    return allBrands.filter((b) => activeSlugs.has(b.slug))
  }, [allBrands, vehicleForm.vehicle_type])

  const logoRef = useRef<HTMLInputElement>(null)
  const coverRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const documentRef = useRef<HTMLInputElement>(null)
  const csvRef = useRef<HTMLInputElement>(null)
  const stockBulkRef = useRef<HTMLInputElement>(null)
  const vehiclePhotoRef = useRef<HTMLInputElement>(null)

  const initial = useMemo(() => (profile.name || dealer.name || 'B')[0]?.toUpperCase(), [profile.name, dealer.name])

  function updateProfile(key: string, value: unknown) {
    setProfile((prev) => ({ ...prev, [key]: value }))
  }

  function updateAssistant(key: string, value: unknown) {
    setAssistant((prev) => ({ ...prev, [key]: value }))
  }

  function toggleProfileArray(key: 'certifications' | 'services', value: string) {
    setProfile((prev) => {
      const current = prev[key]
      const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
      if (key === 'services') setAssistant((a) => ({ ...a, services: next, financing_available: next.includes('financing') }))
      return { ...prev, [key]: next }
    })
  }

  function toggleAssistantService(value: string) {
    setAssistant((prev) => {
      const current = prev.services
      const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
      return { ...prev, services: next, financing_available: next.includes('financing') || prev.financing_available }
    })
  }

  async function uploadFiles(files: FileList | null, type: string) {
    if (!files?.length) return
    setUploadError(null)
    setUploading(type)
    const uploaded: FileRef[] = []
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch(`/api/onboarding/${encodeURIComponent(token)}/upload?type=${type}`, { method: 'POST', body: fd })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(json.error || 'No se pudo subir el archivo.')
        uploaded.push(json)
      }
      if (type === 'logo') setAssets((prev) => ({ ...prev, logo_url: uploaded[0]?.url ?? prev.logo_url }))
      if (type === 'cover') setAssets((prev) => ({ ...prev, cover_url: uploaded[0]?.url ?? prev.cover_url }))
      if (type === 'document') setAssets((prev) => ({ ...prev, documents: [...prev.documents, ...uploaded] }))
      if (type === 'stock_csv') setStock((prev) => ({ ...prev, csv_files: [...prev.csv_files, ...uploaded], mode: 'csv' }))
      if (type === 'stock_bulk') setStock((prev) => ({ ...prev, bulk_files: [...prev.bulk_files, ...uploaded], mode: 'loose_files' }))
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'No se pudo subir el archivo.')
    } finally {
      setUploading(null)
    }
  }

  async function submit() {
    setSubmitting(true)
    setSubmitError(null)
    setRetryableSubmit(false)
    try {
      const weeklyParsed: Partial<Record<Weekday, TimeRange[]>> = {}
      for (const d of DAYS) weeklyParsed[d.key] = parseRanges(appointments.weekly[d.key] || '')

      const res = await fetch(`/api/onboarding/${encodeURIComponent(token)}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            ...profile,
            years_in_business: profile.years_in_business ? Number(profile.years_in_business) : null,
          },
          assistant,
          assets,
          stock,
          appointments: showAppointments
            ? {
                weekly: weeklyParsed,
                slot_minutes: Number(appointments.slot_minutes),
                min_hours_notice: Number(appointments.min_hours_notice),
                max_days_ahead: Number(appointments.max_days_ahead),
                mode: appointments.mode,
                location_text: appointments.location_text,
                instructions: appointments.instructions,
              }
            : undefined,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        const retryable = Boolean(json.retryable)
        setRetryableSubmit(retryable)
        const message = json.error === 'webhook_failed'
          ? 'Hemos guardado tu configuración, pero no se pudo enviar el email de acceso. Reintenta el envío; el enlace sigue siendo válido.'
          : json.error === 'token_already_used'
            ? 'Este enlace ya se ha utilizado.'
            : json.error || 'No se pudo completar la configuración.'
        throw new Error(message)
      }
      setSubmitted(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'No se pudo completar la configuración.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-[70vh] bg-obsidian px-5 py-20">
        <div className="mx-auto max-w-2xl border border-gold/25 bg-surface p-8 text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center border border-emerald-400/30 bg-emerald-400/5">
            <Check className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="mb-3 text-xs uppercase tracking-[0.24em] text-gold">Configuración recibida</p>
          <h1 className="font-display text-3xl font-light text-bsm-text-primary">Tu showroom entra en revisión editorial</h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-bsm-text-secondary">
            Hemos recibido el perfil, el material y el contexto operativo. El equipo revisará la presencia pública antes de publicar y te enviará el acceso al panel con un enlace nuevo.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-obsidian px-5 py-12 md:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 border-b border-bsm-border pb-8">
          <p className="mb-3 text-xs uppercase tracking-[0.28em] text-gold">Showroom fundador</p>
          <h1 className="font-display text-4xl font-light text-bsm-text-primary md:text-5xl">Preparar {profile.name || dealer.name}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-bsm-text-secondary">
            Hemos dejado la información base cargada. Confirma lo que ya está correcto y añade el material que quieras que revise el equipo antes de abrir tu perfil al mercado.
          </p>
        </div>

        <div className="space-y-8">
          <section className="border border-bsm-border bg-surface p-6">
            <h2 className="mb-1 font-display text-2xl font-light">Perfil</h2>
            <p className="mb-6 text-sm text-bsm-text-muted">Datos visibles en tu página pública.</p>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nombre del showroom" value={profile.name} onChange={(v) => updateProfile('name', v)} required />
              <Field label="Años en el sector" value={profile.years_in_business} onChange={(v) => updateProfile('years_in_business', v)} type="number" />
              <Field label="Ciudad" value={profile.location_city} onChange={(v) => updateProfile('location_city', v)} />
              <Field label="Provincia / Región" value={profile.location_region} onChange={(v) => updateProfile('location_region', v)} />
              <div className="md:col-span-2"><Field label="Dirección" value={profile.address} onChange={(v) => updateProfile('address', v)} /></div>
              <div className="md:col-span-2"><TextArea label="Descripción" value={profile.description} onChange={(v) => updateProfile('description', v)} rows={5} /></div>
              <Field label="Teléfono público" value={profile.phone} onChange={(v) => updateProfile('phone', v)} />
              <Field label="WhatsApp" value={profile.whatsapp} onChange={(v) => updateProfile('whatsapp', v)} />
              <Field label="Web oficial" value={profile.website} onChange={(v) => updateProfile('website', v)} type="url" />
              <Field label="Instagram" value={profile.instagram} onChange={(v) => updateProfile('instagram', v)} type="url" />
              <Field label="Facebook" value={profile.facebook_url} onChange={(v) => updateProfile('facebook_url', v)} type="url" />
              <Field label="YouTube" value={profile.youtube_url} onChange={(v) => updateProfile('youtube_url', v)} type="url" />
              <Field label="TikTok" value={profile.tiktok_url} onChange={(v) => updateProfile('tiktok_url', v)} type="url" />
              <Field label="LinkedIn" value={profile.linkedin_url} onChange={(v) => updateProfile('linkedin_url', v)} type="url" />
            </div>

            <ChoiceGrid title="Especialidades" items={SPECIALTIES} selected={profile.certifications} onToggle={(v) => toggleProfileArray('certifications', v)} />
            <ChoiceGrid title="Servicios" items={SERVICES} selected={profile.services} onToggle={(v) => toggleProfileArray('services', v)} />
          </section>

          <section className="border border-bsm-border bg-surface p-6">
            <h2 className="mb-1 font-display text-2xl font-light">Logo y fotografías del local</h2>
            <p className="mb-6 text-sm text-bsm-text-muted">Material real del showroom. JPG, PNG o WebP.</p>
            <div className="grid gap-5 md:grid-cols-2">
              <UploadPanel title="Logo" icon={<ImagePlus className="h-4 w-4" />} onClick={() => logoRef.current?.click()} busy={uploading === 'logo'} action={assets.logo_url ? 'Cambiar logo' : 'Subir logo'}>
                <input ref={logoRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => uploadFiles(e.target.files, 'logo')} />
                <div className="mt-4 flex h-20 w-20 items-center justify-center border border-bsm-border bg-obsidian">
                  {assets.logo_url ? <img src={assets.logo_url} alt="Logo" className="h-full w-full object-contain p-2" /> : <span className="font-display text-3xl text-gold/50">{initial}</span>}
                </div>
              </UploadPanel>
              <UploadPanel title="Portada" icon={<ImagePlus className="h-4 w-4" />} onClick={() => coverRef.current?.click()} busy={uploading === 'cover'} action={assets.cover_url ? 'Cambiar portada' : 'Subir portada'}>
                <input ref={coverRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => uploadFiles(e.target.files, 'cover')} />
                {assets.cover_url && <img src={assets.cover_url} alt="Portada" className="mt-4 h-24 w-full object-cover" />}
              </UploadPanel>
            </div>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <UploadPanel title="Fotografías de instalaciones" icon={<UploadCloud className="h-4 w-4" />} onClick={() => galleryRef.current?.click()} busy={uploading === 'gallery'} action="Añadir fotografías">
                <input ref={galleryRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => uploadFiles(e.target.files, 'gallery')} />
              </UploadPanel>
              <UploadPanel title="Documento libre" icon={<FileText className="h-4 w-4" />} onClick={() => documentRef.current?.click()} busy={uploading === 'document'} action="Subir PDF o Word">
                <input ref={documentRef} type="file" accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" multiple className="sr-only" onChange={(e) => uploadFiles(e.target.files, 'document')} />
                <p className="mt-4 text-xs leading-5 text-bsm-text-muted">Cualquier material que ayude al equipo a preparar tu perfil: catálogo de precios, condiciones comerciales, ficha de servicios...</p>
                <FileList files={assets.documents} />
              </UploadPanel>
            </div>
            {uploadError && <p className="mt-4 flex items-center gap-2 text-sm text-red-400"><AlertTriangle className="h-4 w-4" />{uploadError}</p>}
          </section>

          {needsAssistant && (
            <section className="border border-bsm-border bg-surface p-6">
              <h2 className="mb-1 font-display text-2xl font-light">Asistente de cualificación</h2>
              <p className="mb-6 text-sm leading-6 text-bsm-text-muted">
                El asistente podrá proponer cita y, cuando tenga sentido, derivar directamente al WhatsApp del showroom con un enlace de conversación.
              </p>
              <div className="space-y-5">
                <label className="flex items-center gap-3 text-sm text-bsm-text-secondary">
                  <input type="checkbox" checked={assistant.financing_available} onChange={(e) => updateAssistant('financing_available', e.target.checked)} className="h-4 w-4 accent-gold" />
                  Ofrecéis financiación
                </label>
                <TextArea label="Condiciones generales de financiación" value={assistant.financing_terms} onChange={(v) => updateAssistant('financing_terms', v)} rows={2} />
                <ChoiceGrid title="Servicios que debe conocer el asistente" items={SERVICES} selected={assistant.services} onToggle={toggleAssistantService} />
                <Field label="Horario de atención" value={assistant.attention_hours} onChange={(v) => updateAssistant('attention_hours', v)} placeholder="Lunes a viernes 10:00-19:00. Sábados bajo cita previa." />
                <TextArea label="Cómo tratáis la negociación" value={assistant.negotiation_style} onChange={(v) => updateAssistant('negotiation_style', v)} rows={3} placeholder="Ej. Transparencia desde el primer contacto; valoramos operaciones serias y estudiamos entrega a cuenta caso por caso." />
                <Field label="WhatsApp de contacto" value={assistant.whatsapp_number} onChange={(v) => updateAssistant('whatsapp_number', v)} placeholder="+34600000000" />
              </div>
            </section>
          )}

          {showAppointments && (
            <section className="border border-bsm-border bg-surface p-6">
              <div className="mb-4 flex items-start gap-3">
                <CalendarClock className="mt-1 h-5 w-5 text-gold" />
                <div>
                  <h2 className="font-display text-2xl font-light">Horario de citas</h2>
                  <p className="mt-1 text-sm text-bsm-text-muted">
                    El agente de tus fichas propondrá estos huecos a los compradores para reservar una visita. Puedes
                    ajustarlo más adelante desde Dashboard → Citas.
                  </p>
                </div>
              </div>

              <p className="label-base mb-2">Disponibilidad semanal</p>
              <p className="mb-3 text-xs text-bsm-text-muted">Franjas por día, formato <code>10:00-14:00, 16:00-20:00</code>. Deja vacío un día sin visitas.</p>
              <div className="mb-6 space-y-2">
                {DAYS.map((d) => (
                  <div key={d.key} className="grid grid-cols-[110px_1fr] items-center gap-3">
                    <label className="text-sm text-bsm-text-secondary">{d.label}</label>
                    <input
                      value={appointments.weekly[d.key]}
                      onChange={(e) => setAppointments((prev) => ({ ...prev, weekly: { ...prev.weekly, [d.key]: e.target.value } }))}
                      placeholder="—"
                      className="input-base text-sm"
                    />
                  </div>
                ))}
              </div>

              <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <Field label="Duración (min)" value={appointments.slot_minutes} onChange={(v) => setAppointments((prev) => ({ ...prev, slot_minutes: v }))} type="number" />
                <Field label="Antelación mín. (h)" value={appointments.min_hours_notice} onChange={(v) => setAppointments((prev) => ({ ...prev, min_hours_notice: v }))} type="number" />
                <Field label="Ventana (días)" value={appointments.max_days_ahead} onChange={(v) => setAppointments((prev) => ({ ...prev, max_days_ahead: v }))} type="number" />
              </div>

              <p className="label-base mb-2">Modalidad</p>
              <div className="mb-4 flex gap-2">
                {([['in_person', 'Presencial'], ['video', 'Videollamada'], ['both', 'Ambas']] as const).map(([v, l]) => (
                  <label key={v} className="flex items-center justify-center px-4 py-2 border border-bsm-border text-sm text-bsm-text-muted cursor-pointer has-[:checked]:border-gold/40 has-[:checked]:text-gold has-[:checked]:bg-gold/5">
                    <input type="radio" name="appointment_mode" value={v} checked={appointments.mode === v} onChange={() => setAppointments((prev) => ({ ...prev, mode: v }))} className="sr-only" />
                    {l}
                  </label>
                ))}
              </div>
              <Field label="Dirección / lugar (si es presencial)" value={appointments.location_text} onChange={(v) => setAppointments((prev) => ({ ...prev, location_text: v }))} placeholder="C/ Ejemplo 1, Madrid" />
              <div className="mt-4">
                <TextArea label="Instrucciones para el comprador (opcional)" value={appointments.instructions} onChange={(v) => setAppointments((prev) => ({ ...prev, instructions: v }))} rows={2} placeholder="Pregunta por el vehículo en recepción al llegar." />
              </div>
            </section>
          )}

          <section className="border border-bsm-border bg-surface p-6">
            <h2 className="mb-1 font-display text-2xl font-light">Stock inicial</h2>
            <p className="mb-6 text-sm text-bsm-text-muted">Elige la vía más cómoda para preparar las primeras unidades.</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <ModeButton
                active={stock.mode === 'vehicle_by_vehicle'}
                title="Vehículo a vehículo"
                text="Publica tú mismo cada unidad, con su ficha y fotos propias — recomendado si no tienes feed ni CSV. Queda publicado al momento, sin esperar a que nadie lo procese."
                onClick={() => setStock((s) => ({ ...s, mode: 'vehicle_by_vehicle' }))}
              />
              <ModeButton
                active={stock.mode === 'feed_url'}
                title="Feed o portal"
                text={feedSyncAvailable
                  ? 'URL de tu feed o portal de stock. Lo sincronizamos automáticamente cada día.'
                  : 'URL de tu feed o portal de stock. El equipo lo importa por ti.'}
                onClick={() => setStock((s) => ({ ...s, mode: 'feed_url' }))}
              />
              <ModeButton active={stock.mode === 'csv'} title="CSV" text="Plantilla compatible con el alta masiva del dashboard. El equipo la sube por ti, con las descripciones optimizadas con IA — incluido una vez, en cualquier plan." onClick={() => setStock((s) => ({ ...s, mode: 'csv' }))} />
              <ModeButton active={stock.mode === 'loose_files'} title="Archivos sueltos" text="Fotos o carpetas de material sin organizar, para que el equipo las estructure y suba por ti, con las descripciones optimizadas con IA — incluido una vez, en cualquier plan." onClick={() => setStock((s) => ({ ...s, mode: 'loose_files' }))} />
            </div>
            <div className="mt-5 space-y-4">
              {stock.mode === 'vehicle_by_vehicle' && (
                <div className="space-y-5">
                  {vehicles.length > 0 && (
                    <ul className="space-y-2">
                      {vehicles.map((v) => (
                        <li key={v.id} className="flex items-center justify-between gap-3 border border-bsm-border bg-obsidian/50 px-3 py-2 text-sm">
                          <div className="flex items-center gap-3">
                            {v.images[0]?.url && <img src={v.images[0].url} alt="" className="h-10 w-14 object-cover" />}
                            <span className="text-bsm-text-primary">{v.brand_name} {v.model_name} · {v.year}</span>
                            <span className="text-xs text-bsm-text-muted">{v.price ? `${v.price.toLocaleString('es-ES')} €` : 'Precio a consultar'}</span>
                            <span className="text-xs text-emerald-400">Publicado</span>
                          </div>
                          <button type="button" onClick={() => removeVehicle(v.id)} className="text-bsm-text-muted hover:text-red-400">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="border border-bsm-border bg-obsidian/50 p-5">
                    <p className="mb-4 text-sm font-medium text-bsm-text-primary">Añadir vehículo</p>
                    <div className="mb-4 flex gap-2">
                      {([['car', 'Coche'], ['motorcycle', 'Moto']] as const).map(([v, l]) => (
                        <label key={v} className="flex items-center justify-center px-4 py-2 border border-bsm-border text-sm text-bsm-text-muted cursor-pointer has-[:checked]:border-gold/40 has-[:checked]:text-gold has-[:checked]:bg-gold/5">
                          <input type="radio" name="vehicle_type" value={v} checked={vehicleForm.vehicle_type === v} onChange={() => setVehicleForm((prev) => ({ ...prev, vehicle_type: v, brand_name: '' }))} className="sr-only" />
                          {l}
                        </label>
                      ))}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="label-base">Marca</span>
                        <select className="input-base" value={vehicleForm.brand_name} onChange={(e) => setVehicleForm((prev) => ({ ...prev, brand_name: e.target.value }))}>
                          <option value="">Selecciona marca</option>
                          {brandOptions.map((b) => <option key={b.slug} value={b.name}>{b.name}</option>)}
                        </select>
                      </label>
                      <Field label="Modelo" value={vehicleForm.model_name} onChange={(v) => setVehicleForm((prev) => ({ ...prev, model_name: v }))} placeholder="Ej. 911 Carrera S" />
                      <Field label="Año" value={vehicleForm.year} onChange={(v) => setVehicleForm((prev) => ({ ...prev, year: v }))} type="number" placeholder="2022" />
                      <Field label="Kilometraje" value={vehicleForm.mileage_km} onChange={(v) => setVehicleForm((prev) => ({ ...prev, mileage_km: v }))} type="number" placeholder="12000" />
                      <Field label="Precio (vacío = a consultar)" value={vehicleForm.price} onChange={(v) => setVehicleForm((prev) => ({ ...prev, price: v }))} type="number" placeholder="89000" />
                      <label className="block">
                        <span className="label-base">Combustible</span>
                        <select className="input-base" value={vehicleForm.fuel_type} onChange={(e) => setVehicleForm((prev) => ({ ...prev, fuel_type: e.target.value }))}>
                          <option value="">Selecciona</option>
                          {Object.entries(FUEL_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                        </select>
                      </label>
                      <label className="block">
                        <span className="label-base">Cambio</span>
                        <select className="input-base" value={vehicleForm.transmission} onChange={(e) => setVehicleForm((prev) => ({ ...prev, transmission: e.target.value }))}>
                          <option value="">Selecciona</option>
                          {Object.entries(TRANSMISSION_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                        </select>
                      </label>
                    </div>
                    <div className="mt-4">
                      <TextArea label="Descripción breve (opcional)" value={vehicleForm.description} onChange={(v) => setVehicleForm((prev) => ({ ...prev, description: v }))} rows={2} placeholder="Estado, historial, extras destacados..." />
                    </div>
                    <div className="mt-4">
                      <UploadPanel title="Fotos del vehículo" icon={<ImagePlus className="h-4 w-4" />} onClick={() => vehiclePhotoRef.current?.click()} busy={uploading === 'vehicle_photo'} action="Añadir fotos">
                        <input ref={vehiclePhotoRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => uploadVehiclePhotos(e.target.files)} />
                        <FileList files={vehicleForm.images} />
                      </UploadPanel>
                    </div>
                    {vehicleError && <p className="mt-3 text-xs text-red-400">{vehicleError}</p>}
                    <button type="button" onClick={addVehicle} disabled={addingVehicle} className="btn-gold mt-4 px-5 py-2.5 text-sm">
                      {addingVehicle ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      Añadir vehículo
                    </button>
                  </div>
                </div>
              )}
              {stock.mode === 'feed_url' && <Field label="URL de feed o portal" value={stock.feed_url} onChange={(v) => setStock((s) => ({ ...s, feed_url: v }))} type="url" placeholder="https://..." />}
              {stock.mode === 'csv' && (
                <UploadPanel title="CSV de stock" icon={<FileText className="h-4 w-4" />} onClick={() => csvRef.current?.click()} busy={uploading === 'stock_csv'} action="Subir CSV">
                  <input ref={csvRef} type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => uploadFiles(e.target.files, 'stock_csv')} />
                  <FileList files={stock.csv_files} />
                </UploadPanel>
              )}
              {stock.mode === 'loose_files' && (
                <UploadPanel title="Fotos y archivos de stock" icon={<UploadCloud className="h-4 w-4" />} onClick={() => stockBulkRef.current?.click()} busy={uploading === 'stock_bulk'} action="Añadir imágenes">
                  <input ref={stockBulkRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => uploadFiles(e.target.files, 'stock_bulk')} />
                  <FileList files={stock.bulk_files} />
                </UploadPanel>
              )}
              <TextArea label="Notas para el equipo" value={stock.notes} onChange={(v) => setStock((s) => ({ ...s, notes: v }))} rows={3} />
            </div>
          </section>

          <div className="flex flex-col gap-3 border-t border-bsm-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-bsm-text-muted">No recibirás acceso al panel hasta que esta configuración quede enviada. Después haremos la revisión editorial antes de publicar.</p>
            <button type="button" onClick={submit} disabled={submitting} className="btn-gold shrink-0 px-6 py-3">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {retryableSubmit && submitError ? 'Reintentar envío' : 'Enviar configuración'}
            </button>
          </div>
          {submitError && <p className="text-sm text-red-400">{submitError}</p>}
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', required = false, placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <label className="block">
      <span className="label-base">{label}</span>
      <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input-base" />
    </label>
  )
}

function TextArea({ label, value, onChange, rows = 3, placeholder }: { label: string; value: string; onChange: (value: string) => void; rows?: number; placeholder?: string }) {
  return (
    <label className="block">
      <span className="label-base">{label}</span>
      <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input-base resize-none" />
    </label>
  )
}

function ChoiceGrid({ title, items, selected, onToggle }: { title: string; items: { value: string; label: string }[]; selected: string[]; onToggle: (value: string) => void }) {
  return (
    <div className="mt-6">
      <p className="label-base">{title}</p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const active = selected.includes(item.value)
          return (
            <button key={item.value} type="button" onClick={() => onToggle(item.value)} className={`border px-3 py-2 text-left text-sm transition-colors ${active ? 'border-gold/50 bg-gold/5 text-gold' : 'border-bsm-border text-bsm-text-secondary hover:border-gold/30'}`}>
              {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function UploadPanel({ title, icon, action, busy, onClick, children }: { title: string; icon: React.ReactNode; action: string; busy: boolean; onClick: () => void; children?: React.ReactNode }) {
  return (
    <div className="border border-bsm-border bg-obsidian/50 p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm font-medium text-bsm-text-primary">{icon}{title}</div>
        <button type="button" onClick={onClick} disabled={busy} className="btn-outline px-3 py-2 text-xs">
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
          {busy ? 'Subiendo' : action}
        </button>
      </div>
      {children}
    </div>
  )
}

function FileList({ files }: { files: FileRef[] }) {
  if (!files.length) return null
  return (
    <ul className="mt-4 space-y-2">
      {files.map((file) => (
        <li key={file.path} className="flex items-center justify-between gap-3 border border-bsm-border bg-surface px-3 py-2 text-xs text-bsm-text-muted">
          <span className="truncate">{file.name || file.path}</span>
          <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
        </li>
      ))}
    </ul>
  )
}

function ModeButton({ active, title, text, onClick }: { active: boolean; title: string; text: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`border p-4 text-left transition-colors ${active ? 'border-gold/50 bg-gold/5' : 'border-bsm-border hover:border-gold/30'}`}>
      <span className={`block text-sm font-medium ${active ? 'text-gold' : 'text-bsm-text-primary'}`}>{title}</span>
      <span className="mt-2 block text-xs leading-5 text-bsm-text-muted">{text}</span>
    </button>
  )
}
