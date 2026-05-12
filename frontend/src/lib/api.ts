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
