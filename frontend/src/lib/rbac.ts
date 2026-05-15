/**
 * rbac.ts — Definición de permisos y rutas por rol para GymFit.
 */

export type AppRole = 'admin' | 'entrenador' | 'recepcionista' | 'socio';

/**
 * Mapeo de rutas permitidas por rol.
 * Si una ruta no está aquí, el rol no tiene acceso.
 */
export const ROLE_ROUTES: Record<string, string[]> = {
  admin: [
    '/dashboard',
    '/acceso',
    '/socios',
    '/prospectos',
    '/membresias',
    '/rutinas',
    '/personal',
    '/clases',
    '/inventario',
    '/reportes',
    '/configuracion',
    '/perfil',
  ],
  recepcionista: [
    '/dashboard',
    '/acceso',
    '/socios',
    '/prospectos',
    '/membresias',
    '/clases',
    '/perfil',
  ],
  entrenador: [
    '/dashboard',
    '/socios',
    '/rutinas',
    '/clases',
    '/perfil',
  ],
  socio: [
    '/dashboard',
    '/rutinas',
    '/clases',
    '/perfil',
  ],
};

/**
 * Mapeo de capacidades/permisos específicos por rol.
 * Esto permite habilitar/deshabilitar botones o funciones dentro de una página.
 */
export const ROLE_CAPABILITIES: Record<string, string[]> = {
  admin: [
    'manage_users', 
    'manage_trainers', 
    'assign_trainers', 
    'view_reports', 
    'manage_inventory',
    'edit_evaluations',
  ],
  recepcionista: [
    'manage_members', 
    'manage_prospects', 
    'view_attendance',
    'manage_subscriptions',
  ],
  entrenador: [
    'register_evaluation', 
    'edit_evaluations', 
    'manage_routines',
    'view_assigned_members',
  ],
  socio: [
    'view_personal_routines',
    'view_personal_progress',
  ],
};

/**
 * Verifica si un rol tiene permiso para acceder a una ruta específica.
 */
export function hasPermission(role: string, path: string): boolean {
  const normalizedRole = role.toLowerCase();
  const routes = ROLE_ROUTES[normalizedRole];
  
  if (!routes) return false;
  
  // El admin siempre tiene permiso para todo
  if (normalizedRole === 'admin') return true;

  // Verifica coincidencia exacta o prefijo (para subrutas como /socios/[id])
  return routes.some(r => path === r || path.startsWith(`${r}/`));
}

/**
 * Verifica si un rol tiene una capacidad específica.
 */
export function canPerform(role: string, action: string): boolean {
  const normalizedRole = role.toLowerCase();
  
  // El admin puede hacerlo todo
  if (normalizedRole === 'admin') return true;
  
  const capabilities = ROLE_CAPABILITIES[normalizedRole];
  return capabilities ? capabilities.includes(action) : false;
}
