'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  FUEL_LABELS, TRANSMISSION_LABELS, DRIVE_LABELS,
  BODY_TYPES_CAR, BODY_TYPES_MOTO, COLORS, UPHOLSTERY,
  EQUIPMENT_CATEGORIES, VEHICLE_CONDITION_LABELS,
  slugify, vehicleSlug,
} from '@/lib/utils'
import { CheckCircle, ChevronRight } from 'lucide-react'
import ImageUploader from '@/components/dashboard/ImageUploader'
import { CAR_CATEGORIES_PUBLIC } from '@/lib/vehicle-categories'
import { brandSlugsForType } from '@/lib/brand-types'

const STEPS = ['Tipo y marca', 'Especificaciones', 'Equipamiento', 'Imágenes', 'Precio y publicar']

export default function PublicarPage() {
  const [step, setStep] = useState(0)
  const [dealerId, setDealerId] = useState<string | null>(null)
  const [dealerLocation, setDealerLocation] = useState<string | null>(null)
  const [dealerPlan, setDealerPlan] = useState<string | null>(null)
  const [allBrands, setAllBrands] = useState<{ id: string; name: string; slug: string }[]>([])
  const [customBrandMode, setCustomBrandMode] = useState(false)
  const [allModels, setAllModels] = useState<string[]>([])
  const [customModelMode, setCustomModelMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')

  const [form, setForm] = useState<any>({
    vehicle_type: 'car',
    brand_name: '',
    model_name: '',
    version: '',
    year: '',
    mileage_km: 0,
    fuel_type: 'gasoline',
    transmission: 'automatic',
    drive_type: 'rwd',
    body_type: '',
    color_exterior: '',
    color_interior: '',
    upholstery: '',
    power_hp: '',
    torque_nm: '',
    displacement_cc: '',
    license_type: '',
    zero_to_hundred: '',
    top_speed_kmh: '',
    weight_kg: '',
    cylinders: '',
    engine_config: '',
    registration_year: '',
    itv_valid_until: '',
    has_service_history: false,
    has_carfax: false,
    condition_type: '',
    category: '',
    iva_deducible: false,
    description: '',
    equipment: [] as string[],
    equipment_extra: '',
    images: [] as { url: string; order: number }[],
    price: '',
    price_on_request: false,
    is_negotiable: false,
    accepts_trade_in: false,
    financing_available: false,
    has_test_drive: false,
    national_delivery: false,
    has_warranty: false,
    warranty_months: '',
    video_url: '',
    status: 'pending_review',
    // vehicle details
    power_kw: '',
    doors: '',
    seats: '',
    dgt_label: '',
    num_owners: '',
    // moto electronics
    has_abs: false,
    has_traction_control: false,
    has_riding_modes: false,
    has_electronic_suspension: false,
    has_panniers: false,
  })

  function update(key: string, value: any) {
    setForm((f: any) => ({ ...f, [key]: value }))
  }

  function toggleEquipment(item: string) {
    setForm((f: any) => ({
      ...f,
      equipment: f.equipment.includes(item)
        ? f.equipment.filter((e: string) => e !== item)
        : [...f.equipment, item],
    }))
  }

  function handleVehicleTypeChange(newType: string) {
    const slugs = brandSlugsForType(newType === 'motorcycle' ? 'motorcycle' : 'car')
    const currentSlug = allBrands.find((b) => b.name === form.brand_name)?.slug
    const compatible = currentSlug ? slugs.has(currentSlug) : !form.brand_name
    setForm((f: any) => ({
      ...f,
      vehicle_type: newType,
      brand_name: compatible ? f.brand_name : '',
      model_name: '',
    }))
    setCustomModelMode(false)
    if (!compatible) setCustomBrandMode(false)
  }

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: dealer } = await supabase.from('dealers').select('id, location_city, location_region, subscription_plan').eq('profile_id', user.id).single()
      if (!dealer) { router.push('/registro'); return }
      setDealerId(dealer.id)
      setDealerLocation(dealer.location_region || dealer.location_city || null)
      setDealerPlan(dealer.subscription_plan || null)

      if (editId) {
        const { data: vehicle } = await supabase.from('vehicles').select('*').eq('id', editId).eq('dealer_id', dealer.id).single()
        if (vehicle) setForm({ ...vehicle, price: vehicle.price || '', power_hp: vehicle.power_hp || '' })
      }
    }
    load()
  }, [router, editId])

  useEffect(() => {
    async function loadBrands() {
      const supabase = createClient()
      const { data } = await supabase
        .from('brands')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('name')
      setAllBrands(data ?? [])
    }
    loadBrands()
  }, [])

  // Catálogo de modelos de la marca seleccionada (tabla `models`, curada).
  useEffect(() => {
    async function loadModels() {
      const brand = allBrands.find((b) => b.name === form.brand_name)
      if (!brand) { setAllModels([]); return }
      const supabase = createClient()
      const vtype = form.vehicle_type === 'motorcycle' ? 'motorcycle' : 'car'
      const { data } = await supabase
        .from('models')
        .select('name')
        .eq('brand_id', brand.id)
        .eq('vehicle_type', vtype)
        .eq('is_active', true)
        .order('name')
      const names = (data ?? []).map((m: any) => m.name)
      setAllModels(names)
      // Edición: si el modelo guardado no está en el catálogo, permitir texto libre.
      if (form.model_name && !names.includes(form.model_name)) setCustomModelMode(true)
    }
    loadModels()
  }, [form.brand_name, form.vehicle_type, allBrands])

  async function handleSave(publish = false) {
    setError('')
    setLoading(true)
    const supabase = createClient()

    const slug = vehicleSlug(form.brand_name, form.model_name, form.year, editId || crypto.randomUUID())

    const payload = {
      ...form,
      dealer_id: dealerId,
      location_province: dealerLocation,
      slug: editId ? form.slug : slug,
      // integers — empty string → null
      price:             form.price_on_request ? null : parseFloat(form.price) || null,
      power_hp:          form.power_hp          ? parseInt(form.power_hp)          : null,
      power_kw:          form.power_kw          ? parseInt(form.power_kw)          : null,
      torque_nm:         form.torque_nm         ? parseInt(form.torque_nm)         : null,
      displacement_cc:   form.displacement_cc   ? parseInt(form.displacement_cc)   : null,
      cylinders:         form.cylinders         ? parseInt(form.cylinders)         : null,
      zero_to_hundred:   form.zero_to_hundred   ? parseFloat(form.zero_to_hundred) : null,
      top_speed_kmh:     form.top_speed_kmh     ? parseInt(form.top_speed_kmh)     : null,
      weight_kg:         form.weight_kg         ? parseInt(form.weight_kg)         : null,
      doors:             form.doors             ? parseInt(form.doors)             : null,
      seats:             form.seats             ? parseInt(form.seats)             : null,
      num_owners:        form.num_owners        ? parseInt(form.num_owners)        : null,
      warranty_months:   form.warranty_months   ? parseInt(form.warranty_months)   : null,
      registration_year: form.registration_year ? parseInt(form.registration_year) : null,
      year:              parseInt(form.year),
      mileage_km:        parseInt(form.mileage_km),
      // optional strings with constraints or enum-like — empty string → null
      license_type:    form.license_type    || null,
      dgt_label:       form.dgt_label       || null,
      condition_type:  form.condition_type  || null,
      body_type:       form.body_type       || null,
      category:        form.category        || null,
      // optional free-text — empty string → null
      version:         form.version         || null,
      engine_config:   form.engine_config   || null,
      upholstery:      form.upholstery      || null,
      color_exterior:  form.color_exterior  || null,
      color_interior:  form.color_interior  || null,
      equipment_extra: form.equipment_extra || null,
      video_url:       form.video_url       || null,
      itv_valid_until: form.itv_valid_until || null,
      status:          publish ? 'pending_review' : 'draft',
      published_at:    publish ? new Date().toISOString() : null,
    }

    let err
    let savedVehicleId: string | null = editId || null
    if (editId) {
      const { error: e } = await supabase.from('vehicles').update(payload).eq('id', editId).eq('dealer_id', dealerId)
      err = e
    } else {
      const { data: inserted, error: e } = await supabase.from('vehicles').insert(payload).select('id').single()
      err = e
      savedVehicleId = inserted?.id ?? null
    }

    setLoading(false)
    if (err) { setError(err.message); return }

    // Notify automations when the vehicle enters the review queue (non-blocking).
    if (publish && savedVehicleId) {
      fetch('/api/events/vehicle-submitted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicle_id: savedVehicleId }),
      }).catch(() => {})
    }

    setSaved(true)
    setTimeout(() => router.push('/dashboard/inventario'), 1500)
  }

  const bodyTypes = form.vehicle_type === 'car' ? BODY_TYPES_CAR : BODY_TYPES_MOTO
  const activeSlugs = brandSlugsForType(form.vehicle_type === 'motorcycle' ? 'motorcycle' : 'car')
  const brandOptions = allBrands.filter((b) => activeSlugs.has(b.slug))

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-light mb-1">
          {editId ? 'Editar vehículo' : 'Publicar vehículo'}
        </h1>
        <p className="text-sm text-bsm-text-muted">
          Completa todos los campos para maximizar la visibilidad del anuncio.
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-2 text-xs font-medium transition-colors
                ${i === step ? 'text-gold' : i < step ? 'text-bsm-text-secondary cursor-pointer hover:text-gold' : 'text-bsm-text-muted cursor-not-allowed'}`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs
                ${i === step ? 'bg-gold text-obsidian' : i < step ? 'bg-gold/20 text-gold' : 'bg-surface border border-bsm-border text-bsm-text-muted'}`}>
                {i < step ? <CheckCircle className="w-3 h-3" /> : i + 1}
              </span>
              {s}
            </button>
            {i < STEPS.length - 1 && <ChevronRight className="w-3 h-3 text-bsm-text-muted flex-shrink-0" />}
          </div>
        ))}
      </div>

      <div className="bg-surface border border-bsm-border p-6">
        {/* STEP 0: Tipo y marca */}
        {step === 0 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between text-xs text-bsm-text-muted border-b border-bsm-border pb-3 -mt-1 mb-1">
              <span>¿Tienes muchos vehículos? Usa la importación masiva.</span>
              <a href="/dashboard/importar" className="text-gold hover:text-gold-light transition-colors flex-shrink-0 ml-3">
                Importar CSV →
              </a>
            </div>
            <div>
              <label className="label-base">Tipo de vehículo</label>
              <div className="grid grid-cols-2 gap-3">
                {[{ value: 'car', label: 'Coche' }, { value: 'motorcycle', label: 'Moto' }].map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => handleVehicleTypeChange(t.value)}
                    className={`py-3 border text-sm font-medium transition-colors
                      ${form.vehicle_type === t.value
                        ? 'border-gold bg-gold/5 text-gold'
                        : 'border-bsm-border text-bsm-text-secondary hover:border-bsm-border-light'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-base">Marca *</label>
                <select
                  value={customBrandMode ? '__other__' : form.brand_name}
                  onChange={(e) => {
                    update('model_name', '')
                    if (e.target.value === '__other__') {
                      setCustomBrandMode(true)
                      setCustomModelMode(true)
                      update('brand_name', '')
                    } else {
                      setCustomBrandMode(false)
                      setCustomModelMode(false)
                      update('brand_name', e.target.value)
                    }
                  }}
                  className="select-base"
                  required={!customBrandMode}
                >
                  <option value="">Seleccionar marca…</option>
                  {brandOptions.map((b) => (
                    <option key={b.slug} value={b.name}>{b.name}</option>
                  ))}
                  <option value="__other__">Otra marca (escribir)</option>
                </select>
                {customBrandMode && (
                  <input
                    autoFocus
                    value={form.brand_name}
                    onChange={(e) => update('brand_name', e.target.value)}
                    placeholder="Escribe la marca..."
                    className="input-base mt-2"
                    required
                  />
                )}
              </div>
              <div>
                <label className="label-base">Modelo *</label>
                <select
                  value={customModelMode ? '__other__' : form.model_name}
                  onChange={(e) => {
                    if (e.target.value === '__other__') {
                      setCustomModelMode(true)
                      update('model_name', '')
                    } else {
                      setCustomModelMode(false)
                      update('model_name', e.target.value)
                    }
                  }}
                  className="select-base"
                  required={!customModelMode}
                  disabled={!form.brand_name}
                >
                  <option value="">{form.brand_name ? 'Seleccionar modelo…' : 'Elige primero la marca'}</option>
                  {allModels.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                  <option value="__other__">Otro modelo (escribir)</option>
                </select>
                {customModelMode && (
                  <input
                    autoFocus
                    value={form.model_name}
                    onChange={(e) => update('model_name', e.target.value)}
                    placeholder="Escribe el modelo..."
                    className="input-base mt-2"
                    required
                  />
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-base">Versión / Acabado</label>
                <input value={form.version} onChange={(e) => update('version', e.target.value)} placeholder="Competition, Pista, Spider..." className="input-base" />
              </div>
              <div>
                <label className="label-base">Año *</label>
                <input type="number" min="1960" max={new Date().getFullYear() + 1} value={form.year} onChange={(e) => update('year', e.target.value)} placeholder="Ej. 2022" className="input-base" required />
              </div>
            </div>
            <div>
              <label className="label-base">Kilometraje *</label>
              <input type="number" min="0" value={form.mileage_km} onChange={(e) => update('mileage_km', e.target.value)} placeholder="12000" className="input-base" required />
            </div>
            <div>
              <label className="label-base">Carrocería</label>
              <select value={form.body_type} onChange={(e) => update('body_type', e.target.value)} className="select-base">
                <option value="">Seleccionar...</option>
                {bodyTypes.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            {/* Categoría — solo coches */}
            {form.vehicle_type !== 'motorcycle' && (
              <div>
                <label className="label-base">Categoría del vehículo</label>
                <select
                  value={form.category}
                  onChange={(e) => update('category', e.target.value)}
                  className="select-base"
                >
                  <option value="">Seleccionar categoría...</option>
                  {CAR_CATEGORIES_PUBLIC.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                {form.category && (
                  <p className="mt-1.5 text-[11px] text-[#737373] leading-relaxed">
                    <span className="text-[#555] mr-1">Ej:</span>
                    {CAR_CATEGORIES_PUBLIC.find((c) => c.value === form.category)?.examples}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="label-base">Estado del vehículo</label>
              <select value={form.condition_type} onChange={(e) => update('condition_type', e.target.value)} className="select-base">
                <option value="">Seleccionar...</option>
                {Object.entries(VEHICLE_CONDITION_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            {form.vehicle_type === 'motorcycle' && (
              <div>
                <label className="label-base">Carnet requerido</label>
                <select value={form.license_type || ''} onChange={(e) => update('license_type', e.target.value || '')} className="select-base">
                  <option value="">No especificado</option>
                  <option value="AM">AM — Ciclomotor</option>
                  <option value="A1">A1 — Hasta 125 cc</option>
                  <option value="A2">A2 — Hasta 35 kW</option>
                  <option value="A">A — Sin restricciones</option>
                  <option value="B">B — Convalidado a moto</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* STEP 1: Especificaciones */}
        {step === 1 && (
          <div className="space-y-5">
            <h3 className="font-medium text-bsm-text-primary">Motor y rendimiento</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-base">Potencia (CV)</label>
                <input type="number" value={form.power_hp} onChange={(e) => update('power_hp', e.target.value)} placeholder="710" className="input-base" />
              </div>
              <div>
                <label className="label-base">Potencia (kW)</label>
                <input type="number" value={form.power_kw} onChange={(e) => update('power_kw', e.target.value)} placeholder="522" className="input-base" />
              </div>
              <div>
                <label className="label-base">Par motor (Nm)</label>
                <input type="number" value={form.torque_nm} onChange={(e) => update('torque_nm', e.target.value)} placeholder="770" className="input-base" />
              </div>
              <div>
                <label className="label-base">Cilindrada (cc)</label>
                <input type="number" value={form.displacement_cc} onChange={(e) => update('displacement_cc', e.target.value)} placeholder="3902" className="input-base" />
              </div>
              <div>
                <label className="label-base">Cilindros</label>
                <input type="number" min="1" max="16" value={form.cylinders} onChange={(e) => update('cylinders', e.target.value)} placeholder="8" className="input-base" />
              </div>
              <div>
                <label className="label-base">0-100 km/h (s)</label>
                <input type="number" step="0.1" value={form.zero_to_hundred} onChange={(e) => update('zero_to_hundred', e.target.value)} placeholder="3.1" className="input-base" />
              </div>
              <div>
                <label className="label-base">Velocidad máx. (km/h)</label>
                <input type="number" value={form.top_speed_kmh} onChange={(e) => update('top_speed_kmh', e.target.value)} placeholder="325" className="input-base" />
              </div>
              <div>
                <label className="label-base">Peso (kg)</label>
                <input type="number" value={form.weight_kg} onChange={(e) => update('weight_kg', e.target.value)} placeholder="1580" className="input-base" />
              </div>
              <div>
                <label className="label-base">Config. motor</label>
                <input value={form.engine_config} onChange={(e) => update('engine_config', e.target.value)} placeholder="V8 biturbo" className="input-base" />
              </div>
            </div>

            <div className="h-px bg-bsm-border my-4" />
            <h3 className="font-medium text-bsm-text-primary">Transmisión y colores</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-base">Combustible</label>
                <select value={form.fuel_type} onChange={(e) => update('fuel_type', e.target.value)} className="select-base">
                  {Object.entries(FUEL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="label-base">Transmisión</label>
                <select value={form.transmission} onChange={(e) => update('transmission', e.target.value)} className="select-base">
                  {Object.entries(TRANSMISSION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="label-base">Tracción</label>
                <select value={form.drive_type} onChange={(e) => update('drive_type', e.target.value)} className="select-base">
                  {Object.entries(DRIVE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="label-base">Tapicería</label>
                <select value={form.upholstery} onChange={(e) => update('upholstery', e.target.value)} className="select-base">
                  <option value="">Seleccionar...</option>
                  {UPHOLSTERY.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="label-base">Color exterior</label>
                <select value={form.color_exterior} onChange={(e) => update('color_exterior', e.target.value)} className="select-base">
                  <option value="">Seleccionar...</option>
                  {COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label-base">Color interior</label>
                <select value={form.color_interior} onChange={(e) => update('color_interior', e.target.value)} className="select-base">
                  <option value="">Seleccionar...</option>
                  {COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Carrocería y habitáculo — solo coches */}
            {form.vehicle_type !== 'motorcycle' && (
              <>
                <div className="h-px bg-bsm-border my-4" />
                <h3 className="font-medium text-bsm-text-primary">Carrocería y habitáculo</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-base">Puertas</label>
                    <input type="number" min="2" max="6" value={form.doors} onChange={(e) => update('doors', e.target.value)} placeholder="2" className="input-base" />
                  </div>
                  <div>
                    <label className="label-base">Plazas</label>
                    <input type="number" min="1" max="9" value={form.seats} onChange={(e) => update('seats', e.target.value)} placeholder="4" className="input-base" />
                  </div>
                  <div>
                    <label className="label-base">Etiqueta DGT</label>
                    <select value={form.dgt_label} onChange={(e) => update('dgt_label', e.target.value)} className="select-base">
                      <option value="">Sin etiqueta / No aplica</option>
                      <option value="0">0 (Cero emisiones)</option>
                      <option value="ECO">ECO</option>
                      <option value="C">C</option>
                      <option value="B">B</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Electrónica y sistemas — solo motos */}
            {form.vehicle_type === 'motorcycle' && (
              <>
                <div className="h-px bg-bsm-border my-4" />
                <h3 className="font-medium text-bsm-text-primary">Electrónica y sistemas</h3>
                <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                  {[
                    { key: 'has_abs',                  label: 'ABS' },
                    { key: 'has_traction_control',     label: 'Control de tracción' },
                    { key: 'has_riding_modes',         label: 'Modos de conducción' },
                    { key: 'has_electronic_suspension',label: 'Suspensión electrónica' },
                    { key: 'has_panniers',             label: 'Maletas incluidas' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form[key]} onChange={(e) => update(key, e.target.checked)} className="accent-gold w-4 h-4" />
                      <span className="text-sm text-bsm-text-secondary">{label}</span>
                    </label>
                  ))}
                </div>
              </>
            )}

            <div className="h-px bg-bsm-border my-4" />
            <h3 className="font-medium text-bsm-text-primary">Historial y documentación</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-base">Año de matriculación</label>
                <input type="number" value={form.registration_year} onChange={(e) => update('registration_year', e.target.value)} placeholder="2021" className="input-base" />
              </div>
              <div>
                <label className="label-base">ITV válida hasta</label>
                <input type="date" value={form.itv_valid_until} onChange={(e) => update('itv_valid_until', e.target.value)} className="input-base" />
              </div>
              <div>
                <label className="label-base">Nº de propietarios anteriores</label>
                <input type="number" min="0" max="20" value={form.num_owners} onChange={(e) => update('num_owners', e.target.value)} placeholder="1" className="input-base" />
              </div>
            </div>
            <div className="flex gap-6">
              {[
                { key: 'has_service_history', label: 'Historial de mantenimiento' },
                { key: 'has_carfax', label: 'Informe Carfax / InfoCoche' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form[key]}
                    onChange={(e) => update(key, e.target.checked)}
                    className="accent-gold w-4 h-4"
                  />
                  <span className="text-sm text-bsm-text-secondary">{label}</span>
                </label>
              ))}
            </div>

            <div>
              <label className="label-base">Descripción del vehículo</label>
              <textarea
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                rows={6}
                className="input-base resize-none"
                placeholder="Describe el estado del vehículo, su historia, extras destacados, por qué es especial..."
              />
            </div>
          </div>
        )}

        {/* STEP 2: Equipamiento */}
        {step === 2 && (
          <div className="space-y-6">
            <p className="text-sm text-bsm-text-muted">
              Selecciona todos los extras y opciones que incluye el vehículo.
            </p>
            {Object.entries(EQUIPMENT_CATEGORIES).map(([category, items]) => (
              <div key={category}>
                <h3 className="font-medium text-bsm-text-primary mb-3">{category}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {items.map((item) => (
                    <label key={item} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={form.equipment.includes(item)}
                        onChange={() => toggleEquipment(item)}
                        className="accent-gold w-4 h-4"
                      />
                      <span className="text-sm text-bsm-text-secondary group-hover:text-bsm-text-primary transition-colors">
                        {item}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <div>
              <label className="label-base">Equipamiento adicional (uno por línea)</label>
              <textarea
                rows={3}
                value={form.equipment_extra}
                onChange={(e) => update('equipment_extra', e.target.value)}
                className="input-base resize-none"
                placeholder="Otros extras no listados arriba..."
              />
            </div>
          </div>
        )}

        {/* STEP 3: Imágenes */}
        {step === 3 && (
          <div className="space-y-5">
            <p className="text-sm text-bsm-text-muted">
              Sube entre 10 y 60 fotografías. La primera imagen será la portada del anuncio.
              Recomendamos fondos neutros y iluminación natural o de estudio.
            </p>

            <ImageUploader
              images={form.images}
              onChange={(imgs) => update('images', imgs)}
            />

            <div>
              <label className="label-base">Vídeo (URL de YouTube o Vimeo)</label>
              <input
                type="url"
                value={form.video_url}
                onChange={(e) => update('video_url', e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="input-base"
              />
            </div>
          </div>
        )}

        {/* STEP 4: Precio */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <label className="flex items-center gap-2.5 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={form.price_on_request}
                  onChange={(e) => update('price_on_request', e.target.checked)}
                  className="accent-gold w-4 h-4"
                />
                <span className="text-sm text-bsm-text-secondary">Precio bajo consulta (no mostrar precio)</span>
              </label>

              {!form.price_on_request && (
                <div>
                  <label className="label-base">Precio (€)</label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={form.price}
                    onChange={(e) => update('price', e.target.value)}
                    placeholder="89900"
                    className="input-base text-lg"
                  />
                </div>
              )}
            </div>

            <div className="space-y-3">
              {[
                { key: 'is_negotiable',      label: 'Precio negociable' },
                { key: 'accepts_trade_in',   label: 'Acepta entrega de tu vehículo (parte de pago)' },
                { key: 'financing_available',label: 'Financiación disponible' },
                { key: 'iva_deducible',      label: 'IVA deducible (venta a empresa)' },
                { key: 'has_test_drive',     label: 'Prueba disponible' },
                { key: 'national_delivery',  label: 'Transporte nacional incluido' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form[key]}
                    onChange={(e) => update(key, e.target.checked)}
                    className="accent-gold w-4 h-4"
                  />
                  <span className="text-sm text-bsm-text-secondary">{label}</span>
                </label>
              ))}
            </div>

            {/* Garantía */}
            <div className="space-y-3 pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.has_warranty}
                  onChange={(e) => update('has_warranty', e.target.checked)}
                  className="accent-gold w-4 h-4"
                />
                <span className="text-sm text-bsm-text-secondary">Garantía disponible</span>
              </label>
              {form.has_warranty && (
                <div className="ml-6">
                  <label className="label-base">Meses de garantía</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={form.warranty_months}
                    onChange={(e) => update('warranty_months', e.target.value)}
                    placeholder="12"
                    className="input-base max-w-[120px]"
                  />
                </div>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-400/5 border border-red-400/20 px-4 py-3">
                {error}
              </p>
            )}

            {saved && (
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <CheckCircle className="w-4 h-4" />
                Vehículo guardado. Redirigiendo al inventario...
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={loading}
                className="btn-outline flex-1 justify-center"
              >
                Guardar borrador
              </button>
              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={loading}
                className="btn-gold flex-1 justify-center"
              >
                {loading ? 'Publicando...' : 'Enviar para revisión'}
              </button>
            </div>
            <p className="text-xs text-bsm-text-muted text-center">
              Los vehículos se revisan editorialmente antes de publicarse (habitualmente en menos de 24h).
            </p>
            {(dealerPlan === 'professional' || dealerPlan === 'elite') && form.images?.length >= 5 && form.description?.trim().length > 20 && (
              <div className="flex items-start gap-2 p-3 border border-emerald-400/20 bg-emerald-400/5 text-xs text-emerald-400">
                <span className="mt-0.5">✓</span>
                <span>Tu ficha cumple los requisitos de aprobación rápida (fotos + descripción completa). La activación puede ser inmediata.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      {step < 4 && (
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="btn-outline disabled:opacity-30"
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(4, s + 1))}
            className="btn-gold"
          >
            Siguiente
          </button>
        </div>
      )}
      {step > 0 && step < 4 && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => handleSave(false)}
            className="text-xs text-bsm-text-muted hover:text-gold transition-colors"
          >
            Guardar borrador y continuar después
          </button>
        </div>
      )}
    </div>
  )
}
