export type VehicleType = 'car' | 'motorcycle'
export type VehicleStatus = 'draft' | 'pending_review' | 'active' | 'paused' | 'sold' | 'expired'
export type VehicleCondition = 'new' | 'seminuevo' | 'ocasion' | 'clasico' | 'restaurado' | 'preparado' | 'coleccion'
export type DealerStatus = 'pending' | 'active' | 'suspended' | 'trial'
export type SubscriptionPlan = 'essential' | 'professional' | 'elite'
export type FuelType = 'gasoline' | 'diesel' | 'electric' | 'hybrid' | 'plugin_hybrid' | 'hydrogen' | 'other'
export type TransmissionType = 'manual' | 'automatic' | 'semi_automatic' | 'dct' | 'cvt'
export type DriveType = 'rwd' | 'fwd' | 'awd' | '4wd'
export type LeadStatus = 'new' | 'contacted' | 'negotiating' | 'appointment' | 'reserved' | 'closed' | 'lost' | 'discarded'
export type UserRole = 'buyer' | 'dealer' | 'admin'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Brand {
  id: string
  name: string
  slug: string
  logo_url: string | null
  country: string | null
  is_active: boolean
  sort_order: number
}

export interface Model {
  id: string
  brand_id: string
  name: string
  slug: string
  vehicle_type: VehicleType
  is_active: boolean
}

export interface Dealer {
  id: string
  profile_id: string
  slug: string
  name: string
  description: string | null
  logo_url: string | null
  cover_url: string | null
  location_city: string | null
  location_region: string | null
  location_country: string
  address: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  website: string | null
  instagram: string | null
  facebook_url: string | null
  youtube_url: string | null
  tiktok_url: string | null
  linkedin_url: string | null
  years_in_business: number | null
  status: DealerStatus
  subscription_plan: SubscriptionPlan | null
  subscription_start_at: string | null
  subscription_end_at: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  vehicle_slots: number
  is_featured: boolean
  is_verified: boolean
  certifications: string[] | null
  postal_code: string | null
  attention_note: string | null
  admin_notes: string | null
  created_at: string
  updated_at: string
  // Joined
  vehicle_count?: number
  avg_rating?: number
}

export interface VehicleImage {
  url: string
  alt?: string
  order: number
}

export interface Vehicle {
  id: string
  dealer_id: string
  slug: string
  vehicle_type: VehicleType
  status: VehicleStatus
  brand_id: string | null
  model_id: string | null
  brand_name: string
  model_name: string
  version: string | null
  year: number
  vin: string | null
  displacement_cc: number | null
  power_hp: number | null
  power_kw: number | null
  torque_nm: number | null
  fuel_type: FuelType | null
  cylinders: number | null
  engine_config: string | null
  zero_to_hundred: number | null
  top_speed_kmh: number | null
  transmission: TransmissionType | null
  drive_type: DriveType | null
  weight_kg: number | null
  color_exterior: string | null
  color_interior: string | null
  upholstery: string | null
  body_type: string | null
  mileage_km: number
  registration_year: number | null
  registration_country: string
  itv_valid_until: string | null
  has_carfax: boolean
  has_service_history: boolean
  // New fields added in migration 004
  condition_type?: VehicleCondition | null
  iva_deducible?: boolean
  location_province?: string | null
  // Extended optional fields — DB columns may not exist yet; undefined when absent
  license_type?: string | null
  category?: string | null
  num_owners?: number | null
  has_warranty?: boolean
  warranty_months?: number | null
  doors?: number | null
  seats?: number | null
  dgt_label?: string | null
  has_abs?: boolean
  has_traction_control?: boolean
  has_riding_modes?: boolean
  has_electronic_suspension?: boolean
  has_panniers?: boolean
  has_ibi?: boolean
  has_test_drive?: boolean
  national_delivery?: boolean
  price: number | null
  price_on_request: boolean
  is_negotiable: boolean
  accepts_trade_in: boolean
  financing_available: boolean
  currency: string
  title: string | null
  description: string | null
  equipment: string[] | null
  images: VehicleImage[]
  video_url: string | null
  is_featured: boolean
  is_editors_pick: boolean
  is_exclusive: boolean
  badge: string | null
  views: number
  leads_count: number
  favorites_count: number
  published_at: string | null
  expires_at: string | null
  admin_notes: string | null
  rejection_reason: string | null
  created_at: string
  updated_at: string
  // Joined
  dealer?: Dealer
}

export interface Lead {
  id: string
  vehicle_id: string | null
  dealer_id: string
  buyer_profile_id: string | null
  buyer_name: string
  buyer_email: string
  buyer_phone: string | null
  buyer_whatsapp: string | null
  message: string
  status: LeadStatus
  dealer_notes: string | null
  created_at: string
  updated_at: string
  vehicle?: Pick<Vehicle, 'id' | 'brand_name' | 'model_name' | 'year' | 'images' | 'slug'>
}

export interface SubscriptionPlanConfig {
  id: string
  name: string
  description: string | null
  price_monthly: number
  vehicle_slots: number
  features: string[]
  stripe_price_id: string | null
  is_active: boolean
  sort_order: number
}

export interface VehicleFilters {
  type?: VehicleType
  brand?: string
  model?: string
  yearMin?: number
  yearMax?: number
  priceMin?: number
  priceMax?: number
  mileageMax?: number
  fuelType?: FuelType
  transmission?: TransmissionType
  country?: string
  dealer?: string
  featured?: boolean
  search?: string
  sortBy?: 'featured' | 'newest' | 'price_asc' | 'price_desc' | 'mileage_asc'
  page?: number
  limit?: number
}

export interface DashboardStats {
  totalVehicles: number
  activeVehicles: number
  pendingVehicles: number
  soldVehicles: number
  totalViews: number
  totalLeads: number
  newLeads: number
  viewsThisMonth: number
  leadsThisMonth: number
}
