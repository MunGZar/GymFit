"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi, UsuarioInfo, LoginPayload } from '@/lib/api';

interface AuthContextValue {
  usuario: UsuarioInfo | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  /** HU-03: actualiza el nombre en el topbar sin recargar la página */
  actualizarUsuario: (cambios: Partial<Pick<UsuarioInfo, 'nombre'>>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioInfo | null>(() => {
    if (typeof window === 'undefined') return null;
    return authApi.getUsuarioLocal();
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => { setLoading(false); }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const data = await authApi.login(payload);
    setUsuario(data.usuario);
    window.location.href = '/dashboard';
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setUsuario(null);
    window.location.href = '/login';
  }, []);

  /**
   * Actualiza campos del usuario en el contexto (estado React) sin recargar.
   * La página de perfil lo llama tras guardar cambios exitosamente.
   * El topbar refleja el nuevo nombre de inmediato.
   */
  const actualizarUsuario = useCallback((cambios: Partial<Pick<UsuarioInfo, 'nombre'>>) => {
    setUsuario((prev) => {
      if (!prev) return prev;
      return { ...prev, ...cambios };
    });
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, loading, login, logout, actualizarUsuario }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
