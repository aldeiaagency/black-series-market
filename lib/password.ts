// Política de contraseñas — nivel "Media".
// Debe mantenerse alineada con la config de Supabase Auth:
//   password_min_length = 8
//   password_required_characters = letras (cualquier caja) + dígitos
// Ver docs/pendientes-configuracion-externa.md (sección Auth/contraseñas).

export const PASSWORD_MIN_LENGTH = 8

export interface PasswordCheck {
  ok: boolean
  /** 0–3: nº de requisitos cumplidos (longitud, letra, número) */
  score: number
  /** Etiqueta legible del nivel de fortaleza */
  label: 'débil' | 'aceptable' | 'fuerte'
  /** Requisitos individuales, para pintar la checklist */
  requirements: {
    length: boolean
    letter: boolean
    number: boolean
  }
  /** Mensaje de error si no cumple el mínimo (null si ok) */
  error: string | null
}

/**
 * Valida una contraseña contra la política Media y calcula su fortaleza.
 * El backend (Supabase) aplica la misma regla; esto es feedback temprano en UI.
 */
export function checkPassword(password: string): PasswordCheck {
  const requirements = {
    length: password.length >= PASSWORD_MIN_LENGTH,
    letter: /[a-zA-Z]/.test(password),
    number: /[0-9]/.test(password),
  }

  const met = Number(requirements.length) + Number(requirements.letter) + Number(requirements.number)
  const ok = requirements.length && requirements.letter && requirements.number

  // Fortaleza: además de cumplir el mínimo, premiamos longitud y variedad extra.
  let strength = met
  if (ok && password.length >= 12) strength++
  if (ok && /[^a-zA-Z0-9]/.test(password)) strength++

  let label: PasswordCheck['label'] = 'débil'
  if (ok) label = strength >= 5 ? 'fuerte' : 'aceptable'

  let error: string | null = null
  if (!ok) {
    if (!requirements.length) error = `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`
    else if (!requirements.letter) error = 'La contraseña debe incluir al menos una letra.'
    else if (!requirements.number) error = 'La contraseña debe incluir al menos un número.'
  }

  return { ok, score: met, label, requirements, error }
}
