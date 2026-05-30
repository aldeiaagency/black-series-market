export const CAR_CATEGORIES_PUBLIC = [
  {
    value: 'deportivos',
    label: 'Deportivos',
    examples: 'BMW M3, Porsche 911 Carrera, Audi RS6, Alfa Romeo Giulia QV, Maserati Ghibli Trofeo',
  },
  {
    value: 'superdeportivos',
    label: 'Superdeportivos',
    examples: 'Ferrari 488, Lamborghini Huracán, McLaren 720S, Porsche 911 GT3 RS, Bugatti Chiron',
  },
  {
    value: 'suv_premium',
    label: 'SUV premium',
    examples: 'Porsche Cayenne Turbo, Range Rover Sport SVR, BMW X5 M, Mercedes GLE 63 AMG, Lamborghini Urus',
  },
  {
    value: 'lujo_alta_gama',
    label: 'Lujo y alta gama',
    examples: 'Rolls-Royce Ghost, Bentley Continental GT, Mercedes Clase S, BMW Serie 7, Maserati Quattroporte',
  },
  {
    value: 'clasicos',
    label: 'Clásicos y futuros clásicos',
    examples: 'Porsche 911 aire, BMW E30 M3, Ferrari 308 GTB, Jaguar E-Type, Alfa Romeo Spider, Audi Quattro',
  },
  {
    value: 'unidades_especiales',
    label: 'Unidades especiales',
    examples: 'Ediciones limitadas, 1 de X unidades, preparaciones homologadas, vehículos de colección',
  },
] as const

// Sellos internos — solo asignables desde admin, no visibles en el formulario de vendedor
export const CAR_CATEGORIES_ADMIN = [
  { value: 'black_label_selection', label: 'Black Label Selection' },
  { value: 'black_label_icon',      label: 'Black Label Icon' },
] as const

// Lista completa para el filtro público (compradores ven todo)
export const CAR_CATEGORIES_ALL = [
  ...CAR_CATEGORIES_PUBLIC,
  ...CAR_CATEGORIES_ADMIN,
] as const

export type CarCategoryValue = typeof CAR_CATEGORIES_PUBLIC[number]['value']
  | typeof CAR_CATEGORIES_ADMIN[number]['value']
