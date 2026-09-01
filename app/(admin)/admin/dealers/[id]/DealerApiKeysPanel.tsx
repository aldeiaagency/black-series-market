'use client'

import { useFormState } from 'react-dom'
import { KeyRound, XCircle } from 'lucide-react'
import {
  generateDealerImportKey,
  revokeDealerImportKey,
  type GenerateDealerImportKeyState,
} from './actions'

interface DealerApiKey {
  id: string
  label: string | null
  created_at: string
  last_used_at: string | null
  revoked_at: string | null
}

interface DealerApiKeysPanelProps {
  dealerId: string
  keys: DealerApiKey[]
}

const initialState: GenerateDealerImportKeyState = {}

function formatDate(value: string | null) {
  if (!value) return 'Nunca'
  return new Date(value).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function DealerApiKeysPanel({ dealerId, keys }: DealerApiKeysPanelProps) {
  const [state, formAction] = useFormState(generateDealerImportKey, initialState)

  return (
    <div className="bg-surface border border-bsm-border p-5">
      <div className="flex items-center gap-2 mb-3">
        <KeyRound className="w-4 h-4 text-gold/60" />
        <h3 className="text-xs font-medium uppercase tracking-wide text-bsm-text-muted">Claves de importacion</h3>
      </div>

      {state.key && (
        <div className="mb-4 border border-emerald-400/30 bg-emerald-400/5 p-3">
          <p className="text-xs font-medium text-emerald-400">Clave generada. Se muestra una sola vez.</p>
          <code className="mt-2 block break-all bg-obsidian px-2 py-1.5 text-[11px] text-bsm-text-primary">
            {state.key}
          </code>
        </div>
      )}

      {state.error && (
        <p className="mb-4 border border-red-400/20 bg-red-400/5 px-3 py-2 text-xs text-red-400">
          {state.error}
        </p>
      )}

      <form action={formAction} className="space-y-2">
        <input type="hidden" name="dealerId" value={dealerId} />
        <input
          type="text"
          name="label"
          placeholder="Etiqueta interna, ej. n8n stock inicial"
          className="w-full bg-surface-elevated border border-bsm-border text-xs text-bsm-text-secondary px-2.5 py-1.5 focus:outline-none focus:border-gold/50 transition-colors"
        />
        <button
          type="submit"
          className="w-full text-xs px-3 py-2 border border-bsm-border text-bsm-text-secondary hover:border-gold/40 hover:text-gold transition-colors"
        >
          Generar nueva clave
        </button>
      </form>

      <div className="mt-4 space-y-2 border-t border-bsm-border pt-4">
        {keys.length === 0 && (
          <p className="text-xs text-bsm-text-muted">Sin claves creadas para este showroom.</p>
        )}
        {keys.map((key) => (
          <div key={key.id} className="border border-bsm-border bg-surface-elevated p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-bsm-text-primary">{key.label || 'Sin etiqueta'}</p>
                <p className="mt-1 text-[10px] text-bsm-text-muted">
                  Creada {formatDate(key.created_at)} - Ultimo uso {formatDate(key.last_used_at)}
                </p>
              </div>
              {key.revoked_at ? (
                <span className="badge badge-muted text-[10px]">Revocada</span>
              ) : (
                <form action={revokeDealerImportKey}>
                  <input type="hidden" name="dealerId" value={dealerId} />
                  <input type="hidden" name="keyId" value={key.id} />
                  <button
                    type="submit"
                    className="text-red-400 hover:text-red-300"
                    aria-label="Revocar clave"
                    title="Revocar clave"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}