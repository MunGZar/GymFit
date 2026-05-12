/**
 * api.ts — cliente centralizado para comunicarse con el backend NestJS.
 *
 * Puertos:
 *   Frontend Next.js dev → :3000
 *   Backend NestJS       → :3001  (PORT=3001 en backend/.env)
 *   Prefijo global       → /api   (app.setGlobalPrefix en main.ts)
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

// Tipos

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

export interface LoginPayload   { correo: string; password: string; }
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

// Helpers 

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

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
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

//Auth API (HU-01, HU-02) 

export const authApi = {
  async register(payload: RegisterPayload): Promise<LoginResponse> {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST', headers: buildHeaders(false), body: JSON.stringify(payload),
    });
    const data = await handleResponse<LoginResponse>(res);
    localStorage.setItem('gymfit_token', data.access_token);
    localStorage.setItem('gymfit_usuario', JSON.stringify(data.usuario));
    return data;
  },

  async login(payload: LoginPayload): Promise<LoginResponse> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST', headers: buildHeaders(false), body: JSON.stringify(payload),
    });
    const data = await handleResponse<LoginResponse>(res);
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

//  Perfil API (HU-03) 

export const perfilApi = {
  /**
   * GET /api/auth/perfil
   * Datos frescos del usuario autenticado desde el servidor.
   */
  async obtener(): Promise<PerfilCompleto> {
    const res = await fetch(`${BASE_URL}/auth/perfil`, { headers: buildHeaders() });
    return handleResponse<PerfilCompleto>(res);
  },

  /**
   * PUT /api/auth/perfil
   * Actualiza nombre y/o teléfono (campos no críticos).
   */
  async actualizar(payload: ActualizarPerfilPayload): Promise<PerfilCompleto> {
    const res = await fetch(`${BASE_URL}/auth/perfil`, {
      method: 'PUT', headers: buildHeaders(), body: JSON.stringify(payload),
    });
    const data = await handleResponse<PerfilCompleto>(res);
    // Actualizar nombre en localStorage si cambió
    const local = localStorage.getItem('gymfit_usuario');
    if (local && payload.nombre) {
      const parsed = JSON.parse(local);
      parsed.nombre = data.nombre;
      localStorage.setItem('gymfit_usuario', JSON.stringify(parsed));
    }
    return data;
  },

  /**
   * PUT /api/auth/perfil/password
   * Cambia la contraseña validando primero la actual con bcrypt en el servidor.
   */
  async cambiarPassword(payload: CambiarPasswordPayload): Promise<{ mensaje: string }> {
    const res = await fetch(`${BASE_URL}/auth/perfil/password`, {
      method: 'PUT', headers: buildHeaders(), body: JSON.stringify(payload),
    });
    return handleResponse<{ mensaje: string }>(res);
  },
};

// Usuarios API (HU-01 CRUD admin)

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
};

//  Roles API 

export const rolesApi = {
  async findAll(): Promise<Rol[]> {
    const res = await fetch(`${BASE_URL}/roles`, { headers: buildHeaders(false) });
    return handleResponse<Rol[]>(res);
  },
  async seed(): Promise<{ mensaje: string; roles: Rol[] }> {
    const res = await fetch(`${BASE_URL}/roles/seed`, {
      method: 'POST', headers: buildHeaders(false),
    });
    return handleResponse<{ mensaje: string; roles: Rol[] }>(res);
  },
};
