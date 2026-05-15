/**
 * api.ts — cliente centralizado para comunicarse con el backend NestJS.
 *
 * Puertos:
 *   Frontend Next.js dev → :3000
 *   Backend NestJS       → :3001  (PORT=3001 en backend/.env)
 *   Prefijo global       → /api   (app.setGlobalPrefix en main.ts)
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

// Tipos y Interfaces

export interface UsuarioInfo {
  id_usuario: number;
  nombre: string;
  correo: string;
  rol: string;
}

export interface PerfilCompleto {
  id_usuario: number;
  nombre: string;
  identificacion: string;
  correo: string;
  telefono: string | null;
  estado: boolean;
  rol: { id_rol: number; nombre: string };
}

export interface LoginResponse {
  access_token: string;
  usuario: UsuarioInfo;
}

export interface LoginPayload    { correo: string; password: string; }
export interface RegisterPayload {
  nombre: string; identificacion: string; correo: string;
  password: string; telefono?: string; id_rol: number;
}
export interface ActualizarPerfilPayload { nombre?: string; telefono?: string; }
export interface CambiarPasswordPayload  { password_actual: string; password_nueva: string; }
export interface Rol { id_rol: number; nombre: string; }
export interface UsuarioCompleto {
  id_usuario: number; nombre: string; identificacion: string;
  correo: string; telefono: string | null; estado: boolean; rol: Rol;
}
export interface CreateUsuarioPayload {
  nombre: string; identificacion: string; correo: string;
  password: string; telefono?: string; id_rol: number;
}
export interface UpdateUsuarioPayload {
  nombre?: string; identificacion?: string; correo?: string;
  password?: string; telefono?: string; id_rol?: number; estado?: boolean;
}

//  Helpers

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('gymfit_token');
}

function buildHeaders(includeAuth = true): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (includeAuth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Interceptor 401 global (HU-02/03 — Seguridad)
 *
 * Todas las llamadas autenticadas pasan por aquí.
 * Si el servidor devuelve 401 (token expirado o inválido):
 *   1. Limpia el localStorage
 *   2. Redirige al login automáticamente
 *   3. Lanza el error para que el componente también lo sepa
 *
 * Las rutas públicas (login, register, roles) usan buildHeaders(false)
 * y nunca pasan por este interceptor.
 */
async function handleResponse<T>(res: Response, esRutaPublica = false): Promise<T> {
  if (!res.ok) {
    // Interceptor 401: token expirado o inválido
    if (res.status === 401 && !esRutaPublica && typeof window !== 'undefined') {
      localStorage.removeItem('gymfit_token');
      localStorage.removeItem('gymfit_usuario');
      // Solo redirige si no estamos ya en /login
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?sesion=expirada';
      }
    }

    let message = `Error ${res.status}`;
    try {
      const body = await res.json();
      if (Array.isArray(body.message)) message = body.message.join('. ');
      else if (typeof body.message === 'string') message = body.message;
    } catch { /* sin cuerpo */ }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// Auth API (HU-01, HU-02)

export const authApi = {
  async register(payload: RegisterPayload): Promise<LoginResponse> {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST', headers: buildHeaders(false), body: JSON.stringify(payload),
    });
    // Ruta pública — no activa el interceptor 401
    const data = await handleResponse<LoginResponse>(res, true);
    localStorage.setItem('gymfit_token', data.access_token);
    localStorage.setItem('gymfit_usuario', JSON.stringify(data.usuario));
    return data;
  },

  async login(payload: LoginPayload): Promise<LoginResponse> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST', headers: buildHeaders(false), body: JSON.stringify(payload),
    });
    // Ruta pública — no activa el interceptor 401
    const data = await handleResponse<LoginResponse>(res, true);
    localStorage.setItem('gymfit_token', data.access_token);
    localStorage.setItem('gymfit_usuario', JSON.stringify(data.usuario));
    return data;
  },

  logout(): void {
    localStorage.removeItem('gymfit_token');
    localStorage.removeItem('gymfit_usuario');
  },

  getUsuarioLocal(): UsuarioInfo | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem('gymfit_usuario');
      return raw ? (JSON.parse(raw) as UsuarioInfo) : null;
    } catch { return null; }
  },

  isLoggedIn(): boolean { return !!getToken(); },
};

// Perfil API (HU-03) 

export const perfilApi = {
  /** GET /api/auth/perfil — datos frescos del usuario autenticado */
  async obtener(): Promise<PerfilCompleto> {
    const res = await fetch(`${BASE_URL}/auth/perfil`, { headers: buildHeaders() });
    return handleResponse<PerfilCompleto>(res);
  },

  /**
   * PUT /api/auth/perfil — actualiza nombre y/o teléfono.
   * Recibe el callback onNombreActualizado para sincronizar el AuthContext
   * sin recargar la página (HU-03 UX).
   */
  async actualizar(
    payload: ActualizarPerfilPayload,
    onNombreActualizado?: (nombre: string) => void,
  ): Promise<PerfilCompleto> {
    const res = await fetch(`${BASE_URL}/auth/perfil`, {
      method: 'PUT', headers: buildHeaders(), body: JSON.stringify(payload),
    });
    const data = await handleResponse<PerfilCompleto>(res);

    // Actualizar localStorage
    const local = localStorage.getItem('gymfit_usuario');
    if (local) {
      const parsed = JSON.parse(local);
      if (data.nombre) parsed.nombre = data.nombre;
      localStorage.setItem('gymfit_usuario', JSON.stringify(parsed));
    }

    // Notificar al AuthContext para actualizar el topbar sin recargar
    if (data.nombre && onNombreActualizado) {
      onNombreActualizado(data.nombre);
    }

    return data;
  },

  /** PUT /api/auth/perfil/password — cambia contraseña validando la actual */
  async cambiarPassword(payload: CambiarPasswordPayload): Promise<{ mensaje: string }> {
    const res = await fetch(`${BASE_URL}/auth/perfil/password`, {
      method: 'PUT', headers: buildHeaders(), body: JSON.stringify(payload),
    });
    return handleResponse<{ mensaje: string }>(res);
  },
};

//  Usuarios API (HU-01 CRUD admin)

export const usuariosApi = {
  async findAll(): Promise<UsuarioCompleto[]> {
    const res = await fetch(`${BASE_URL}/usuarios`, { headers: buildHeaders() });
    return handleResponse<UsuarioCompleto[]>(res);
  },
  async findOne(id: number): Promise<UsuarioCompleto> {
    const res = await fetch(`${BASE_URL}/usuarios/${id}`, { headers: buildHeaders() });
    return handleResponse<UsuarioCompleto>(res);
  },
  async create(payload: CreateUsuarioPayload): Promise<UsuarioCompleto> {
    const res = await fetch(`${BASE_URL}/usuarios`, {
      method: 'POST', headers: buildHeaders(), body: JSON.stringify(payload),
    });
    return handleResponse<UsuarioCompleto>(res);
  },
  async update(id: number, payload: UpdateUsuarioPayload): Promise<UsuarioCompleto> {
    const res = await fetch(`${BASE_URL}/usuarios/${id}`, {
      method: 'PUT', headers: buildHeaders(), body: JSON.stringify(payload),
    });
    return handleResponse<UsuarioCompleto>(res);
  },
  async remove(id: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/usuarios/${id}`, {
      method: 'DELETE', headers: buildHeaders(),
    });
    return handleResponse<void>(res);
  },
  /** Reactiva un usuario inactivo (estado → true) */
  async reactivar(id: number): Promise<UsuarioCompleto> {
    const res = await fetch(`${BASE_URL}/usuarios/${id}`, {
      method: 'PUT', headers: buildHeaders(),
      body: JSON.stringify({ estado: true }),
    });
    return handleResponse<UsuarioCompleto>(res);
  },
};

// Roles API 

export interface SocioCompleto {
  id_socio: number;
  direccion: string | null;
  datos_salud: string | null;
  activo: boolean;
  fecha_registro: string;
  usuario: UsuarioCompleto;
  asignaciones_entrenador: Asignacion[];
}

export const sociosApi = {
  async findAll(): Promise<SocioCompleto[]> {
    const res = await fetch(`${BASE_URL}/socios`, { headers: buildHeaders() });
    return handleResponse<SocioCompleto[]>(res);
  },
  async getMiPerfil(): Promise<SocioCompleto> {
    const res = await fetch(`${BASE_URL}/socios/perfil/me`, { headers: buildHeaders() });
    return handleResponse<SocioCompleto>(res);
  },
  async findOne(id: number): Promise<SocioCompleto> {
    const res = await fetch(`${BASE_URL}/socios/${id}`, { headers: buildHeaders() });
    return handleResponse<SocioCompleto>(res);
  },
  async create(payload: { id_usuario: number; direccion?: string; datos_salud?: string }): Promise<SocioCompleto> {
    const res = await fetch(`${BASE_URL}/socios`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<SocioCompleto>(res);
  },
};

export const rolesApi = {
  async findAll(): Promise<Rol[]> {
    const res = await fetch(`${BASE_URL}/roles`, { headers: buildHeaders(false) });
    // Ruta pública
    return handleResponse<Rol[]>(res, true);
  },
  async seed(): Promise<{ mensaje: string; roles: Rol[] }> {
    const res = await fetch(`${BASE_URL}/roles/seed`, {
      method: 'POST', headers: buildHeaders(false),
    });
    return handleResponse<{ mensaje: string; roles: Rol[] }>(res, true);
  },
};

//  Entrenadores API (HU-08)

export interface Entrenador {
  id_entrenador: number;
  especialidad: string | null;
  experiencia: number | null;
  usuario: UsuarioCompleto;
}

export interface Asignacion {
  id_asignacion: number;
  fecha_asignacion: string;
  socio: { id_socio: number; usuario: UsuarioCompleto };
  entrenador: Entrenador;
}

export const entrenadoresApi = {
  async findAll(): Promise<Entrenador[]> {
    const res = await fetch(`${BASE_URL}/entrenadores`, { headers: buildHeaders() });
    return handleResponse<Entrenador[]>(res);
  },
  async asignar(payload: { id_entrenador: number; id_socio: number; fecha_asignacion: string }): Promise<void> {
    const res = await fetch(`${BASE_URL}/entrenadores/asignaciones`, {
      method: 'POST', headers: buildHeaders(), body: JSON.stringify(payload),
    });
    return handleResponse<void>(res);
  },
  async asignarMasivo(payload: { id_entrenador: number; id_socios: number[]; fecha_asignacion: string }): Promise<void> {
    const res = await fetch(`${BASE_URL}/entrenadores/asignaciones/masiva`, {
      method: 'POST', headers: buildHeaders(), body: JSON.stringify(payload),
    });
    return handleResponse<void>(res);
  },
  async findAsignaciones(idEntrenador: number): Promise<Asignacion[]> {
    const res = await fetch(`${BASE_URL}/entrenadores/${idEntrenador}/asignaciones`, { headers: buildHeaders() });
    return handleResponse<Asignacion[]>(res);
  },
};

//  Evaluaciones API (HU-09)

export interface Evaluacion {
  id_evaluacion: number;
  peso: number;
  grasa: number | null;
  medidas: string | null;
  fecha: string;
  socio: { id_socio: number; usuario?: { nombre: string } };
}

export interface CreateEvaluacionPayload {
  id_socio: number;
  peso: number;
  grasa?: number | null;
  medidas?: string | null;
  fecha: string;
}

export const evaluacionesApi = {
  async create(payload: CreateEvaluacionPayload): Promise<Evaluacion> {
    const res = await fetch(`${BASE_URL}/evaluaciones`, {
      method: 'POST', headers: buildHeaders(), body: JSON.stringify(payload),
    });
    return handleResponse<Evaluacion>(res);
  },
  async findBySocio(idSocio: number): Promise<Evaluacion[]> {
    const res = await fetch(`${BASE_URL}/evaluaciones/socio/${idSocio}`, { headers: buildHeaders() });
    return handleResponse<Evaluacion[]>(res);
  },
};

//  Progreso API (HU-10)

export interface Progreso {
  id_progreso: number;
  peso: number | null;
  observaciones: string | null;
  fecha: string;
}

export interface CreateProgresoPayload {
  id_socio: number;
  peso?: number;
  observaciones?: string;
  fecha: string;
}

export interface ComparativaProgreso {
  socio_id: number;
  evaluacion_inicial: Evaluacion | null;
  historial_progreso: Progreso[];
}

export const progresoApi = {
  async create(payload: CreateProgresoPayload): Promise<Progreso> {
    const res = await fetch(`${BASE_URL}/progreso`, {
      method: 'POST', headers: buildHeaders(), body: JSON.stringify(payload),
    });
    return handleResponse<Progreso>(res);
  },
  async getComparativa(idSocio: number): Promise<ComparativaProgreso> {
    const res = await fetch(`${BASE_URL}/progreso/socio/${idSocio}/comparativa`, { headers: buildHeaders() });
    return handleResponse<ComparativaProgreso>(res);
  },
};// --- Rutinas API ---

export interface Rutina {
  id_rutina: number;
  nombre: string;
  descripcion: string | null;
  nivel: string;
  objetivo: string | null;
  activo: boolean;
}

export interface AsignacionRutina {
  id_asignacion_rutina: number;
  id_socio: number;
  id_rutina: number;
  fecha_asignacion: string;
  rutina: Rutina;
}

export const rutinasApi = {
  async findAll(): Promise<Rutina[]> {
    const res = await fetch(`${BASE_URL}/rutinas`, { headers: buildHeaders() });
    return handleResponse<Rutina[]>(res);
  },
  async findOne(id: number): Promise<Rutina> {
    const res = await fetch(`${BASE_URL}/rutinas/${id}`, { headers: buildHeaders() });
    return handleResponse<Rutina>(res);
  },
  async create(payload: Partial<Rutina>): Promise<Rutina> {
    const res = await fetch(`${BASE_URL}/rutinas`, {
      method: 'POST', headers: buildHeaders(), body: JSON.stringify(payload),
    });
    return handleResponse<Rutina>(res);
  },
  async asignar(payload: { id_socio: number; id_rutina: number; fecha_asignacion: string }): Promise<void> {
    const res = await fetch(`${BASE_URL}/rutinas/asignaciones`, {
      method: 'POST', headers: buildHeaders(), body: JSON.stringify(payload),
    });
    return handleResponse<void>(res);
  },
  async findAsignacionesBySocio(idSocio: number): Promise<AsignacionRutina[]> {
    const res = await fetch(`${BASE_URL}/rutinas/asignaciones/socio/${idSocio}`, { headers: buildHeaders() });
    return handleResponse<AsignacionRutina[]>(res);
  }
};
