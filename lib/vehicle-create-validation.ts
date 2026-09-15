import { z } from 'zod'

// Tipos de las columnas editables de vehicles (001, 004, 011–014, 018 y 051).
// Los NOT NULL sin default son obligatorios; los demás conservan su default de BD.
// dealer_id lo fija la ruta; los campos de sistema no entran en el payload saneado.
const text = z.string().refine((value) => !value.includes('\0'), 'Texto no válido.')
const requiredText = text.refine((value) => value.trim().length > 0, 'Campo obligatorio.')
const integer = z.number().int().min(-2147483648).max(2147483647)
const optionalText = text.nullish()
const optionalInteger = integer.nullish()
const optionalBoolean = z.boolean().nullish()

export const vehicleCreateSchema = z.object({
  slug: requiredText,
  brand_name: requiredText,
  model_name: requiredText,
  year: integer,
  mileage_km: integer,
  vehicle_type: z.enum(['car', 'motorcycle']).default('car'),
  status: z.enum(['draft', 'pending_review', 'active']),
  price_on_request: z.boolean().optional(),
  national_delivery: z.boolean().optional(),
  version: optionalText,
  fuel_type: z.enum(['gasoline', 'diesel', 'electric', 'hybrid', 'plugin_hybrid', 'hydrogen', 'other']).nullish(),
  transmission: z.enum(['manual', 'automatic', 'semi_automatic', 'dct', 'cvt']).nullish(),
  drive_type: z.enum(['rwd', 'fwd', 'awd', '4wd']).nullish(),
  body_type: optionalText,
  color_exterior: optionalText,
  color_interior: optionalText,
  upholstery: optionalText,
  power_hp: optionalInteger,
  power_kw: optionalInteger,
  torque_nm: optionalInteger,
  displacement_cc: optionalInteger,
  cylinders: optionalInteger,
  engine_config: optionalText,
  license_type: optionalText,
  zero_to_hundred: z.number().finite().min(-999.99).max(999.99).nullish(),
  top_speed_kmh: optionalInteger,
  weight_kg: optionalInteger,
  doors: optionalInteger,
  seats: optionalInteger,
  registration_year: optionalInteger,
  registration_country: optionalText,
  itv_valid_until: z.string().date().nullish(),
  num_owners: optionalInteger,
  has_service_history: optionalBoolean,
  has_carfax: optionalBoolean,
  condition_type: optionalText,
  category: optionalText,
  dgt_label: optionalText,
  iva_deducible: optionalBoolean,
  description: optionalText,
  equipment: z.array(text).nullish(),
  equipment_extra: optionalText,
  images: z.array(z.object({ url: text, order: integer.optional() }).passthrough()).nullish(),
  price: z.number().finite().min(-9999999999.99).max(9999999999.99).nullish(),
  is_negotiable: optionalBoolean,
  accepts_trade_in: optionalBoolean,
  financing_available: optionalBoolean,
  has_test_drive: optionalBoolean,
  has_warranty: optionalBoolean,
  warranty_months: optionalInteger,
  video_url: optionalText,
  has_abs: optionalBoolean,
  has_traction_control: optionalBoolean,
  has_riding_modes: optionalBoolean,
  has_electronic_suspension: optionalBoolean,
  has_panniers: optionalBoolean,
  location_province: optionalText,
  published_at: z.string().datetime({ offset: true }).nullish(),
})
