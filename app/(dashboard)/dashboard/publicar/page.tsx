'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  FUEL_LABELS, TRANSMISSION_LABELS, DRIVE_LABELS,
  BODY_TYPES_CAR, BODY_TYPES_MOTO, COLORS, UPHOLSTERY,
  EQUIPMENT_CATEGORIES, slugify, vehicleSlug,
} from '@/lib/utils'
import { CheckCircle, ChevronRight } from 'lucide-react'
import ImageUploader from '@/components/dashboard/ImageUploader'

const STEPS = ['Tipo y marca', 'Especificaciones', 'Equipamiento', 'Imágenes', 'Precio y publicar']

export default function PublicarPage() {
  const [step, setStep] = useState(0)
  const [dealerId, setDealerId] = useState<string | null>(null)
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
    year: new Date().getFullYear(),
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
    zero_to_hundred: '',
    top_speed_kmh: '',
    weight_kg: '',
    cylinders: '',
    engine_config: '',
    registration_year: '',
    itv_valid_until: '',
    has_service_history: false,
    has_carfax: false,
    description: '',
    equipment: [] as string[],
    images: [] as { url: string; order: number }[],
    price: '',
    price_on_request: false,
    is_negotiable: false,
    accepts_trade_in: false,
    financing_available: false,
    video_url: '',
    status: 'pending_review',
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

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: dealer } = await supabase.from('dealers').select('id').eq('profile_id', user.id).single()
      if (!dealer) { router.push('/registro'); return }
      setDealerId(dealer.id)

      if (editId) {
        const { data: vehicle } = await supabase.from('vehicles').select('*').eq('id', editId).single()
        if (vehicle) setForm({ ...vehicle, price: vehicle.price || '', power_hp: vehicle.power_hp || '' })
      }
    }
    load()
  }, [router, editId])

  async function handleSave(publish = false) {
    setError('')
    setLoading(true)
    const supabase = createClient()

    const slug = vehicleSlug(form.brand_name, form.model_name, form.year, editId || crypto.randomUUID())

    const payload = {
      ...form,
      dealer_id: dealerId,
      slug: editId ? form.slug : slug,
      price: form.price_on_request ? null : parseFloat(form.price) || null,
      power_hp: form.power_hp ? parseInt(form.power_hp) : null,
      torque_nm: form.torque_nm ? parseInt(form.torque_nm) : null,
      displacement_cc: form.displacement_cc ? parseInt(form.displacement_cc) : null,
      zero_to_hundred: form.zero_to_hundred ? parseFloat(form.zero_to_hundred) : null,
      top_speed_kmh: form.top_speed_kmh ? parseInt(form.top_speed_kmh) : null,
      weight_kg: form.weight_kg ? parseInt(form.weight_kg) : null,
      cylinders: form.cylinders ? parseInt(form.cylinders) : null,
      year: parseInt(form.year),
      mileage_km: parseInt(form.mileage_km),
      status: publish ? 'pending_review' : 'draft',
      published_at: publish ? new Date().toISOString() : null,
    }

    let err
    if (editId) {
      const { error: e } = await supabase.from('vehicles').update(payload).eq('id', editId)
      err = e
    } else {
      const { error: e } = await supabase.from('vehicles').insert(payload)
      err = e
    }

    setLoading(false)
    if (err) { setError(err.message); return }

    setSaved(true)
    setTimeout(() => router.push('/dashboard/inventario'), 1500)
  }

  const bodyTypes = form.vehicle_type === 'car' ? BODY_TYPES_CAR : BODY_TYPES_MOTO

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
            <div>
              <label className="label-base">Tipo de vehículo</label>
              <div className="grid grid-cols-2 gap-3">
                {[{ value: 'car', label: 'Coche' }, { value: 'motorcycle', label: 'Moto' }].map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => update('vehicle_type', t.value)}
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
                <input value={form.brand_name} onChange={(e) => update('brand_name', e.target.value)} placeholder="Ferrari, BMW, Ducati..." className="input-base" required />
              </div>
              <div>
                <label className="label-base">Modelo *</label>
                <input value={form.model_name} onChange={(e) => update('model_name', e.target.value)} placeholder="F8 Tributo, M5, Panigale V4..." className="input-base" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-base">Versión / Acabado</label>
                <input value={form.version} onChange={(e) => update('version', e.target.value)} placeholder="Competition, Pista, Spider..." className="input-base" />
              </div>
              <div>
                <label className="label-base">Año *</label>
                <input type="number" min="1960" max={new Date().getFullYear() + 1} value={form.year} onChange={(e) => update('year', e.target.value)} className="input-base" required />
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
                { key: 'is_negotiable', label: 'Precio negociable' },
                { key: 'accepts_trade_in', label: 'Acepta parte de pago' },
                { key: 'financing_available', label: 'Financiación disponible' },
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
