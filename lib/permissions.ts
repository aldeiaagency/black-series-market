// Permisos por rol dentro del dashboard del showroom.
//
// Roles (organization_members.role). Para showroom de una sede usamos:
//   owner, admin, inventory_manager, sales, viewer.
//   group_admin / location_manager se reservan para el modelo Grupo (multi-sede).
//
// La capa de permisos vive en la app (no en RLS): getDealerAccess resuelve el rol y
// aquí decidimos qué ve y qué puede hacer cada uno.

export type OrgRole =
  | 'owner'
  | 'admin'
  | 'inventory_manager'
  | 'sales'
  | 'viewer'
  | 'group_admin'
  | 'location_manager'

export const ROLE_LABELS: Record<OrgRole, string> = {
  owner:             'Propietario',
  admin:             'Administrador',
  inventory_manager: 'Gestor de inventario',
  sales:             'Ventas',
  viewer:            'Solo lectura',
  group_admin:       'Admin Grupo',
  location_manager:  'Gestor de sede',
}

/** Roles que el propietario puede asignar al dar de alta o editar un miembro. */
export const ASSIGNABLE_ROLES: OrgRole[] = ['admin', 'inventory_manager', 'sales', 'viewer']

/** Secciones del dashboard (coinciden con las rutas del menú). */
export type DashboardSection =
  | 'panel'
  | 'inventario'
  | 'publicar'
  | 'importar'
  | 'oportunidades'
  | 'solicitudes'
  | 'citas'
  | 'analiticas'
  | 'perfil'
  | 'suscripcion'
  | 'equipo'

export interface Permissions {
  /** Secciones visibles en el menú lateral. */
  sections: DashboardSection[]
  /** Crear/editar/borrar vehículos, importar CSV, activar boosts. */
  canEditInventory: boolean
  /** Cambiar el estado de las oportunidades (pipeline/bandeja). */
  canManageOpportunities: boolean
  /** Editar el perfil público del showroom. */
  canEditProfile: boolean
  /** Ver y gestionar la suscripción y la facturación. */
  canManageSubscription: boolean
  /** Crear/editar/eliminar miembros del equipo. */
  canManageTeam: boolean
}

const FULL: DashboardSection[] = [
  'panel', 'inventario', 'publicar', 'importar',
  'oportunidades', 'solicitudes', 'citas', 'analiticas', 'perfil', 'suscripcion', 'equipo',
]

const PERMISSIONS: Record<OrgRole, Permissions> = {
  owner: {
    sections: FULL,
    canEditInventory: true,
    canManageOpportunities: true,
    canEditProfile: true,
    canManageSubscription: true,
    canManageTeam: true,
  },
  admin: {
    sections: FULL,
    canEditInventory: true,
    canManageOpportunities: true,
    canEditProfile: true,
    canManageSubscription: true,
    canManageTeam: true,
  },
  group_admin: {
    sections: FULL,
    canEditInventory: true,
    canManageOpportunities: true,
    canEditProfile: true,
    canManageSubscription: true,
    canManageTeam: true,
  },
  inventory_manager: {
    sections: ['panel', 'inventario', 'publicar', 'importar', 'analiticas'],
    canEditInventory: true,
    canManageOpportunities: false,
    canEditProfile: false,
    canManageSubscription: false,
    canManageTeam: false,
  },
  location_manager: {
    sections: ['panel', 'inventario', 'publicar', 'importar', 'oportunidades', 'solicitudes', 'citas', 'analiticas'],
    canEditInventory: true,
    canManageOpportunities: true,
    canEditProfile: false,
    canManageSubscription: false,
    canManageTeam: false,
  },
  sales: {
    sections: ['panel', 'oportunidades', 'solicitudes', 'analiticas'],
    canEditInventory: false,
    canManageOpportunities: true,
    canEditProfile: false,
    canManageSubscription: false,
    canManageTeam: false,
  },
  viewer: {
    sections: ['panel', 'inventario', 'oportunidades', 'analiticas'],
    canEditInventory: false,
    canManageOpportunities: false,
    canEditProfile: false,
    canManageSubscription: false,
    canManageTeam: false,
  },
}

export function getPermissions(role: OrgRole): Permissions {
  return PERMISSIONS[role] ?? PERMISSIONS.viewer
}

/** Atajo: ¿este rol puede ver esta sección? */
export function canAccessSection(role: OrgRole, section: DashboardSection): boolean {
  return getPermissions(role).sections.includes(section)
}
