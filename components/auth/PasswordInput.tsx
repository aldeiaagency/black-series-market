'use client'

import { useState } from 'react'
import { Eye, EyeOff, Check } from 'lucide-react'
import { checkPassword } from '@/lib/password'

interface PasswordInputProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  /** input autocomplete hint: 'current-password' (login) | 'new-password' (registro/reset) */
  autoComplete?: 'current-password' | 'new-password'
  /** Muestra medidor de fortaleza + checklist (solo para contraseñas nuevas) */
  showStrength?: boolean
  required?: boolean
  minLength?: number
  id?: string
}

const BAR_COLOR = ['bg-red-400', 'bg-red-400', 'bg-gold', 'bg-gold', 'bg-emerald-400', 'bg-emerald-400']
const LABEL_COLOR: Record<string, string> = {
  'débil': 'text-red-400',
  'aceptable': 'text-gold',
  'fuerte': 'text-emerald-400',
}

export default function PasswordInput({
  value,
  onChange,
  label = 'Contraseña',
  placeholder = '••••••••',
  autoComplete = 'current-password',
  showStrength = false,
  required = false,
  minLength,
  id,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  const check = checkPassword(value)

  // Nº de barras llenas (0–5) según fortaleza, solo cuando hay algo escrito.
  const strengthBars = value.length === 0
    ? 0
    : check.ok
      ? (check.label === 'fuerte' ? 5 : 3)
      : check.score

  return (
    <div>
      {label && <label className="label-base" htmlFor={id}>{label}</label>}
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="input-base pr-11"
          autoComplete={autoComplete}
          minLength={minLength}
          required={required}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-bsm-text-muted hover:text-gold transition-colors focus:outline-none"
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          tabIndex={-1}
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {showStrength && value.length > 0 && (
        <div className="mt-2 space-y-2">
          {/* Barra de fortaleza */}
          <div className="flex items-center gap-2">
            <div className="flex-1 flex gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i < strengthBars ? BAR_COLOR[strengthBars] : 'bg-bsm-border'
                  }`}
                />
              ))}
            </div>
            <span className={`text-[10px] uppercase tracking-wider font-medium ${LABEL_COLOR[check.label]}`}>
              {check.label}
            </span>
          </div>

          {/* Checklist de requisitos */}
          <ul className="space-y-0.5">
            {[
              { ok: check.requirements.length, text: 'Al menos 8 caracteres' },
              { ok: check.requirements.letter, text: 'Una letra' },
              { ok: check.requirements.number, text: 'Un número' },
            ].map((req) => (
              <li key={req.text} className={`flex items-center gap-1.5 text-[11px] ${req.ok ? 'text-emerald-400' : 'text-bsm-text-muted'}`}>
                <Check className={`w-3 h-3 ${req.ok ? 'opacity-100' : 'opacity-30'}`} />
                {req.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
