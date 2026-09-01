'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, Trash2, Copy, Check, X, Loader2 } from 'lucide-react'
import { ROLE_LABELS, ASSIGNABLE_ROLES, type OrgRole } from '@/lib/permissions'

export interface TeamMember {
  id:        string
  userId:    string
  role:      OrgRole
  name:      string
  email:     string
  createdAt: string
}

interface Props {
  members:  TeamMember[]
  maxUsers: number
  canManage: boolean
}

export default function TeamManager({ members, maxUsers, canManage }: Props) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]   = useState({ full_name: '', email: '', role: 'sales' as OrgRole })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [credentials, setCredentials] = useState<{ email: string; password: string | null } | null>(null)
  const [copied, setCopied] = useState(false)

  const atLimit = members.length >= maxUsers

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/team/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error ?? 'No se pudo crear el usuario.'); return }
    setCredentials({ email: data.email, password: data.password ?? null })
    setForm({ full_name: '', email: '', role: 'sales' })
    setShowForm(false)
    router.refresh()
  }

  async function handleRole(memberId: string, role: OrgRole) {
    const res = await fetch(`/api/team/members/${memberId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })
    if (res.ok) router.refresh()
  }

  async function handleDelete(memberId: string, name: string) {
    if (!confirm(`¿Eliminar a ${name} del equipo? Perderá el acceso al panel.`)) return
    const res = await fetch(`/api/team/members/${memberId}`, { method: 'DELETE' })
    if (res.ok) router.refresh()
  }

  function copyCreds() {
    if (!credentials?.password) return
    navigator.clipboard.writeText(`Email: ${credentials.email}\nContraseña: ${credentials.password}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header + add */}
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-bsm-text-muted">
          {members.length} / {maxUsers} usuarios
        </p>
        {canManage && (
          atLimit ? (
            <span className="text-xs text-amber-400 border border-amber-400/20 px-3 py-1.5">Límite alcanzado</span>
          ) : (
            <button onClick={() => { setShowForm((s) => !s); setError('') }} className="btn-gold px-4 text-sm">
              <UserPlus className="w-4 h-4" /> Añadir usuario
            </button>
          )
        )}
      </div>

      {/* Credentials banner (shown once) */}
      {credentials && (
        <div className="border border-emerald-400/30 bg-emerald-400/5 p-5">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <p className="text-sm font-medium text-bsm-text-primary mb-0.5">
                {credentials.password ? 'Usuario creado' : 'Usuario añadido al equipo'}
              </p>
              <p className="text-xs text-bsm-text-muted">
                {credentials.password
                  ? 'Entrega estas credenciales al nuevo miembro. No se volverán a mostrar.'
                  : 'Ya tenía una cuenta en Black Label Market: entra con su email y su contraseña habitual.'}
              </p>
            </div>
            <button onClick={() => setCredentials(null)} className="text-bsm-text-muted hover:text-bsm-text-primary">
              <X className="w-4 h-4" />
            </button>
          </div>
          {credentials.password ? (
            <>
              <div className="bg-[#0A0A0A] border border-bsm-border p-3 font-mono text-xs text-bsm-text-secondary mb-3">
                <p>Email: {credentials.email}</p>
                <p>Contraseña: {credentials.password}</p>
              </div>
              <button onClick={copyCreds} className="inline-flex items-center gap-1.5 text-xs text-gold hover:underline">
                {copied ? <><Check className="w-3.5 h-3.5" /> Copiado</> : <><Copy className="w-3.5 h-3.5" /> Copiar credenciales</>}
              </button>
            </>
          ) : (
            <div className="bg-[#0A0A0A] border border-bsm-border p-3 font-mono text-xs text-bsm-text-secondary">
              <p>Email: {credentials.email}</p>
            </div>
          )}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="border border-bsm-border bg-surface p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-base" htmlFor="team-member-name">Nombre</label>
              <input
                id="team-member-name"
                value={form.full_name}
                onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                placeholder="Nombre y apellidos"
                className="input-base"
                autoComplete="name"
                aria-invalid={!!error}
                required
              />
            </div>
            <div>
              <label className="label-base" htmlFor="team-member-email">Email</label>
              <input
                id="team-member-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="usuario@email.com"
                className="input-base"
                autoComplete="email"
                aria-invalid={!!error}
                required
              />
            </div>
          </div>
          <div>
            <label className="label-base" htmlFor="team-member-role">Rol</label>
            <select
              id="team-member-role"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as OrgRole }))}
              className="select-base"
            >
              {ASSIGNABLE_ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          </div>

          {error && <p role="alert" className="text-sm text-red-400 bg-red-400/5 border border-red-400/20 px-4 py-3">{error}</p>}

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-gold px-5 text-sm">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creando...</> : 'Crear usuario'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline px-5 text-sm">Cancelar</button>
          </div>
          <p className="text-[11px] text-bsm-text-muted">
            Si el email no tiene cuenta todavía, se generará una contraseña temporal para entregarle. Si ya tiene una cuenta en Black Label Market, se vincula directamente con ella.
          </p>
        </form>
      )}

      {/* Members list */}
      <div className="border border-bsm-border divide-y divide-bsm-border">
        {members.map((m) => (
          <div key={m.id} className="px-5 py-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-bsm-text-primary font-medium truncate">{m.name || m.email}</p>
              <p className="text-xs text-bsm-text-muted truncate">{m.email}</p>
            </div>

            {m.role === 'owner' ? (
              <span className="text-xs text-gold border border-gold/30 px-2.5 py-1">{ROLE_LABELS.owner}</span>
            ) : canManage ? (
              <div className="flex items-center gap-2 flex-shrink-0">
                <select
                  value={m.role}
                  onChange={(e) => handleRole(m.id, e.target.value as OrgRole)}
                  className="select-base text-xs py-1.5 px-2 w-auto"
                >
                  {ASSIGNABLE_ROLES.map((r) => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleDelete(m.id, m.name || m.email)}
                  className="p-1.5 text-bsm-text-muted hover:text-red-400 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <span className="text-xs text-bsm-text-secondary border border-bsm-border px-2.5 py-1">{ROLE_LABELS[m.role]}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
