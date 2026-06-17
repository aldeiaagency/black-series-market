import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getDealerAccess } from '@/lib/dealer-access'
import { getPermissions, ASSIGNABLE_ROLES, type OrgRole } from '@/lib/permissions'
import { getEntitlements } from '@/lib/entitlements'

// Genera una contraseña temporal que cumple la política Media (≥8, letra + número).
function generateTempPassword(): string {
  const raw = randomBytes(9).toString('base64').replace(/[^a-zA-Z0-9]/g, '')
  return `${raw.slice(0, 10)}7a` // garantiza al menos una letra y un dígito
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 })

  // ── Autorización: solo quien puede gestionar equipo ────────────────────────
  const access = await getDealerAccess(user.id)
  if (!access || !access.orgId) {
    return NextResponse.json({ error: 'No tienes una organización asociada.' }, { status: 403 })
  }
  if (!getPermissions(access.role).canManageTeam) {
    return NextResponse.json({ error: 'No tienes permisos para gestionar el equipo.' }, { status: 403 })
  }

  // ── Datos de entrada ───────────────────────────────────────────────────────
  let body: { email?: string; full_name?: string; role?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 }) }

  const email     = (body.email ?? '').trim().toLowerCase()
  const fullName  = (body.full_name ?? '').trim()
  const role      = body.role as OrgRole

  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Email no válido.' }, { status: 400 })
  if (!fullName)             return NextResponse.json({ error: 'El nombre es obligatorio.' }, { status: 400 })
  if (!ASSIGNABLE_ROLES.includes(role)) return NextResponse.json({ error: 'Rol no válido.' }, { status: 400 })

  const admin = createAdminClient()

  // ── Límite de usuarios del plan ────────────────────────────────────────────
  const ent = await getEntitlements(access.orgId)
  const maxUsers = ent?.limits.maxUsers ?? 1
  const { count: currentCount } = await admin
    .from('organization_members')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', access.orgId)

  if ((currentCount ?? 0) >= maxUsers) {
    return NextResponse.json(
      { error: `Has alcanzado el límite de usuarios de tu plan (${maxUsers}).` },
      { status: 409 },
    )
  }

  // ── Crear el usuario de auth (alta directa, sin email) ─────────────────────
  const password = generateTempPassword()
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // alta directa: queda confirmado sin enviar correo
    user_metadata: { full_name: fullName },
  })

  if (createErr || !created.user) {
    const dup = createErr?.message?.toLowerCase().includes('already')
    return NextResponse.json(
      { error: dup ? 'Ya existe un usuario con ese email.' : 'No se pudo crear el usuario.' },
      { status: dup ? 409 : 500 },
    )
  }

  // ── Vincular a la organización con su rol ──────────────────────────────────
  const { error: memberErr } = await admin
    .from('organization_members')
    .insert({ organization_id: access.orgId, user_id: created.user.id, role })

  if (memberErr) {
    // Rollback: si no se pudo vincular, eliminamos el usuario recién creado.
    await admin.auth.admin.deleteUser(created.user.id)
    return NextResponse.json({ error: 'No se pudo vincular el usuario al equipo.' }, { status: 500 })
  }

  // Devolvemos la contraseña temporal UNA vez para que el propietario la entregue.
  return NextResponse.json({ ok: true, email, password })
}
